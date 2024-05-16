import { SymbolDailyResponse } from "@/lib/symbol-daily.types";
import {
  BenefitHistoryEvent,
  GainAndLossEvent,
} from "@/lib/etrade/etrade.types";
import {
  isEspp,
  isFrQualifiedRsu,
  isFrQualifiedSo,
  isUsQualifiedRsu,
  isUsQualifiedSo,
} from "@/lib/etrade/filters";
import { floorNumber, ceilNumber, formatNumber } from "@/lib/format-number";
import { TaxableEventFr } from "./taxable-event-fr";

export interface GainAndLossEventWithRates extends GainAndLossEvent {
  rateAcquired: number;
  rateSold: number;
  symbolPriceAcquired: number;
}

export interface BenefitEventWithRates extends BenefitHistoryEvent {}

/** French taxes uses 6 digit precision for Form 2074 */
const floorNumber6Digits = (value: number): number => floorNumber(value, 6);
const floorNumber0Digits = (value: number): number => floorNumber(value, 0);
const ceilNumber2Digits = (value: number): number => ceilNumber(value, 2);
const ceilNumber0Digits = (value: number): number => ceilNumber(value, 0);

// Qualified:
// SO:
// - Acquisition gain => Income, 1TT: WARNING: use Min(exercise price, sell price)
// - capital gain =>
// ESPP:
// - Acquisition gain => 0
// - capital gain =>
// RS:
// - Acquisition gain < 300k€ => gains/2 1TZ
// - Acquisition gain >= 300k€ => 1TT
// - capital gain =>
//
// Non-Qualified:
// SO:
// - Acquisition gain => Income the year of vesting, split between US and
// France prorata of time spent in each country. 1AJ. This is treated through
// payslip, hence there is nothing needed here.
// - capital gain =>
// ESPP:
// - N/A?
// RS:
// - Acquisition gain => Income the year of vesting, split between US and
// France prorata of time spent in each country. 1AJ. This is treated through
// payslip, hence there is nothing needed here.
// - capital gain =>

export const enrichEtradeGlFrFr = (
  data: GainAndLossEvent[],
  {
    rates,
    symbolPrices,
  }: {
    rates: {
      [date: string]: number;
    };
    symbolPrices: { [symbol: string]: SymbolDailyResponse };
  },
): GainAndLossEventWithRates[] => {
  return data
    .sort((a, b) => {
      // sort by dateSold
      return new Date(a.dateSold).getTime() - new Date(b.dateSold).getTime();
    })
    .map((event) => {
      const rateAcquired = rates[event.dateAcquired];
      const rateSold = rates[event.dateSold];
      const symbolPriceAcquired =
        symbolPrices[event.symbol][event.dateAcquired].opening;

      return {
        ...event,
        rateAcquired: rateAcquired,
        rateSold: rateSold,
        symbolPriceAcquired,
      };
    });
};

const enrichEtradeBenefitsFrFr = (
  data: BenefitHistoryEvent[],
  {
    rates,
    symbolPrices,
  }: {
    rates: {
      [date: string]: number;
    };
    symbolPrices: { [symbol: string]: SymbolDailyResponse };
  },
): BenefitEventWithRates[] => {
  return data.map((event) => {
    const rateAcquired = rates[event.dateVested];
    const symbolPriceAcquired = symbolPrices[event.dateVested].opening;

    return {
      ...event,
      rateAcquired: rateAcquired,
      symbolPriceAcquired,
    };
  });
};

interface FrTaxesForm2074Page510 {
  /** Designation */
  "511": string;
  /** Date of sale */
  "512": string;
  /** Sale price per share, 6 digit precision */
  "514": number;
  /** Number of shares sold, 0 digit precision */
  "515": number;
  /**
   * Total sale price (Number of shares sold * Sale price per share).
   * 0 digit precision
   */
  "516": number;
  /** Cession fees, 0 digit precision */
  "517": number;
  /**
   * Net sale price (Total sale price - Cession fees)
   * 0 digit precision
   */
  "518": number;
  /** This is a label only */
  "519": undefined;
  /** Acquisition value, 2 digits precision */
  "520": number;
  /**
   * Total acquisition cost (Number of shares sold * Price on acquisition date)
   * 0 digit precision
   */
  "521": number;
  /** Brokerage fees, if any, 0 digit precision */
  "522": number;
  /**
   * Net acquisition cost (Total acquisition cost -  Brokerage fees)
   * 0 digit precision
   */
  "523": number;
  /**
   * Net capital gain (Net sale price - Net acquisition cost)
   * with `-` if negative
   * 0 digit precision
   */
  "524": number;
  /**
   * Is there a capital loss due to share invalidation?
   * This is beyond the scope of this tool given it requires a jugement that
   * invalidates the shares. If this happens concerned people will know.
   * Always false.
   */
  "525": boolean;
  /**
   * Net capital loss for share invalidated.
   * This is beyond the scope of this tool, always 0
   */
  "526": number;
}

interface FrTaxesExplain {
  /** Related form box */
  box: keyof FrTaxes;
  /** 1 line explanation for the event */
  description: string;
  /** Detailed explanation for the event */
  taxableEvents: TaxableEventFr[];
}

export interface FrTaxes {
  /** Explain the computations */
  explanations: FrTaxesExplain[];
  /** RSU acquisition gains above 300K€ */
  "1TT": number;
  /** RSU acquisition gains below 300K€ */
  "1TZ": number;
  /** Tax acquisition rebate for RSU, 50% of 1TZ */
  "1WZ": number;
  /** 1AJ OR 1BJ for gains as salaries */
  "1AJ": number;
  /** Capital gains */
  "3VG": number;
  /** Capital losses Year N-1, we do not know about it, but remind it exists */
  "3VH": number;
  /** form No. 2074 */
  "Form 2074": {
    /** This is the page to declare a sell */
    "Page 510": FrTaxesForm2074Page510[];
    /** Summary of the sales */
    "Page 900": {
      /**
       * capital gains and losses.
       * Computed from the list of all Page 510
       */
      "903": { gains: number; losses: number };
    };
    "page 11": {
      "1133": { gains: number; losses: number };
    };
  };
}

const formatDateForFrTaxes = (date: string) => {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

export const getEmptyTaxes = (): FrTaxes => ({
  explanations: [],
  "1TT": 0,
  "1TZ": 0,
  "1WZ": 0,
  "1AJ": 0,
  "3VG": 0,
  "3VH": 0,
  "Form 2074": {
    "Page 510": [],
    "Page 900": {
      "903": { gains: 0, losses: 0 },
    },
    "page 11": {
      "1133": { gains: 0, losses: 0 },
    },
  },
});

const getFrTaxesCapitalGain = (
  {
    description,
    taxableEvents,
  }: {
    description: string;
    taxableEvents: TaxableEventFr[];
  },
  taxes: FrTaxes,
) => {
  if (!taxableEvents.length) {
    return taxes;
  }
  if (taxableEvents.every((event) => event.capitalGain.total === 0)) {
    return taxes;
  }

  let capitalGainEur = 0;
  const newPages: FrTaxes["Form 2074"]["Page 510"] = [];

  taxableEvents.forEach((taxableEvent) => {
    if (!taxableEvent.sell) {
      // There is no capital gain if there is no sell
      return;
    }

    if (taxableEvent.capitalGain.total === 0) {
      // There is no capital gain if the total is 0
      return;
    }

    const planType = taxableEvent.planType;
    const planDescription =
      planType === "SO" ? "Stock Options" : planType === "RS" ? "RSU" : "ESPP";

    const quantity = floorNumber0Digits(taxableEvent.quantity);
    const cell514 = floorNumber6Digits(taxableEvent.sell.eur);
    const cell516 = floorNumber0Digits(cell514 * quantity);
    // There is no small gains, ceiling acquisition value reduces taxable
    // amount.
    const cell520 = ceilNumber2Digits(taxableEvent.acquisition.valueEur);
    const cell521 = ceilNumber0Digits(cell520 * quantity);

    // Add a new page for Form 2074
    const newPage: FrTaxesForm2074Page510 = {
      "511": `${taxableEvent.symbol} (${planDescription})`,
      "512": formatDateForFrTaxes(taxableEvent.sell.date),
      "514": cell514,
      "515": quantity,
      "516": cell516,
      "517": 0,
      "518": cell516,
      "519": undefined,
      "520": cell520,
      "521": cell521,
      "522": 0,
      "523": cell521,
      "524": cell516 - cell521,
      "525": false,
      "526": 0,
    };

    // mutate taxableEvent to adjust capital gain as computed with Form 2074
    taxableEvent.capitalGain.total = newPage["524"];
    taxableEvent.capitalGain.perShare = cell514 - cell520;

    capitalGainEur += newPage["524"];
    newPages.push(newPage);
  });

  // Add the capital gain to the total
  taxes["3VG"] += capitalGainEur;

  // Add an explanation for the computation
  taxes.explanations = [
    ...taxes.explanations,
    {
      box: "3VG",
      description: `${description} (${formatNumber(capitalGainEur)}€ as computed by form 2074)`,
      taxableEvents,
    },
  ];
  taxes["Form 2074"]["Page 510"] = [
    ...taxes["Form 2074"]["Page 510"],
    ...newPages,
  ];

  return taxes;
};

/**
 * Create a FrTaxable event from an E-Trade export item.
 *
 * The reason why acquisitionValue, associated rate and acquisitionCost are
 * provided is that the valid value for tax administration depends on the plan
 * type.
 * Every other values are the same for every plans.
 */
const getFrTaxableEventFromGainsAndLossEvent = (
  event: GainAndLossEventWithRates,
  {
    acquisitionValueUsd,
    acquisitionValueRate,
    acquisitionCostUsd,
    explainAcquisitionValue,
  }: {
    acquisitionValueUsd: number;
    acquisitionValueRate: number;
    acquisitionCostUsd: number;
    /**
     * Explain how the acquisition value was computed.
     *
     * For instance:
     * - "Use symbol price at opening price on day of exercise."
     * - "Use symbol price at opening price on day of vesting."
     * - "Use sell price as acquistion value given the plan is qualified and the sale is at loss."
     */
    explainAcquisitionValue: string;
  },
): TaxableEventFr => {
  const sellPriceEur = floorNumber6Digits(event.proceeds / event.rateSold);
  const acquisitionValueEur = floorNumber6Digits(
    acquisitionValueUsd / acquisitionValueRate,
  );
  const acquisitionCostEur = floorNumber6Digits(
    acquisitionCostUsd / event.rateAcquired,
  );
  const symbolPriceEur = floorNumber6Digits(
    event.symbolPriceAcquired / event.rateAcquired,
  );

  return {
    symbol: event.symbol,
    planType: event.planType,
    qualifiedIn: "fr",
    // ETrade Gans And Losses only lists sell events
    type: "sell",
    date: event.dateSold,
    quantity: event.quantity,
    sell: {
      usd: event.proceeds,
      rate: event.rateSold,
      eur: sellPriceEur,
      date: event.dateSold,
    },
    acquisition: {
      valueUsd: acquisitionValueUsd,
      valueEur: acquisitionValueEur,
      costUsd: acquisitionCostUsd,
      costEur: acquisitionCostEur,
      symbolPrice: event.symbolPriceAcquired,
      symbolPriceEur,
      rate: event.rateAcquired,
      date: event.dateAcquired,
      description: explainAcquisitionValue,
    },
    capitalGain: {
      perShare: sellPriceEur - acquisitionValueEur,
      total: (sellPriceEur - acquisitionValueEur) * event.quantity,
    },
    acquisitionGain: {
      perShare: acquisitionValueEur - acquisitionCostEur,
      total: (acquisitionValueEur - acquisitionCostEur) * event.quantity,
    },
  };
};

export const getFrTaxesForFrQualifiedSo = (
  {
    gainsAndLosses,
  }: {
    gainsAndLosses: GainAndLossEventWithRates[];
  },
  taxes: FrTaxes,
): FrTaxes => {
  const qualifiedSo = gainsAndLosses.filter(isFrQualifiedSo);
  // Explanations for the computations
  const explanations: FrTaxesExplain[] = [];
  // buffers for acquisition gains and capital gains
  let acquisitionGainEur = 0;
  const taxableEvents: TaxableEventFr[] = [];

  // Process each event
  qualifiedSo.forEach((event) => {
    // Convert prices to EUR
    const sellPriceEur = floorNumber6Digits(event.proceeds / event.rateSold);
    const priceOnDayOfAcquisitionEur = floorNumber6Digits(
      event.symbolPriceAcquired / event.rateAcquired,
    );

    const isSellToCover = event.dateAcquired === event.dateSold;
    const isSellAtLoss = sellPriceEur < priceOnDayOfAcquisitionEur;

    const taxableEvent = getFrTaxableEventFromGainsAndLossEvent(
      event,
      isSellToCover
        ? {
            // Sell to cover for qualified stock options:
            // Acquisition value is the sell price.
            acquisitionValueUsd: event.proceeds,
            acquisitionValueRate: event.rateSold,
            acquisitionCostUsd: event.acquisitionCost,
            explainAcquisitionValue:
              "Use sell price as acquistion value given this is a sell to cover.",
          }
        : isSellAtLoss
          ? {
              // Sale is at loss, use sell price as acquisition price given the
              // plan is qualified
              acquisitionValueUsd: event.proceeds,
              acquisitionValueRate: event.rateSold,
              acquisitionCostUsd: event.acquisitionCost,
              explainAcquisitionValue:
                "Acquistion value is the sell price given the plan is qualified and the sale is at loss.",
            }
          : {
              // Just use symbol price at opening the day of exercise.
              acquisitionValueUsd: event.symbolPriceAcquired,
              acquisitionValueRate: event.rateAcquired,
              acquisitionCostUsd: event.acquisitionCost,
              explainAcquisitionValue: `Use ${event.symbol} price at opening on day of exercise.`,
            },
    );
    taxableEvents.push(taxableEvent);

    // Add acquisition gains information
    acquisitionGainEur += taxableEvent.acquisitionGain.total;
  });

  const floorAcquisitionGainEur = floorNumber6Digits(acquisitionGainEur);
  taxes["1TT"] += floorAcquisitionGainEur;
  explanations.push({
    box: "1TT",
    description: `Acquisition gains from Qualified SO sales. (${formatNumber(floorAcquisitionGainEur)}€)`,
    taxableEvents,
  });
  taxes["explanations"] = [...taxes["explanations"], ...explanations];
  // Add capital gains information to Form 2074
  taxes = getFrTaxesCapitalGain(
    {
      description: "Capital gains from FR qualified SO sales.",
      taxableEvents,
    },
    taxes,
  );

  return taxes;
};

export const getFrTaxesForFrQualifiedRsu = (
  {
    gainsAndLosses,
  }: {
    gainsAndLosses: GainAndLossEventWithRates[];
  },
  taxes: FrTaxes,
): FrTaxes => {
  const qualifiedRsu = gainsAndLosses.filter(isFrQualifiedRsu);
  // Explanations for the computations
  const explanations: FrTaxesExplain[] = [];
  // buffers for acquisition gains and capital gains
  let acquisitionGainEur = 0;
  const taxableEvents: TaxableEventFr[] = [];

  // Process each event
  qualifiedRsu.forEach((event) => {
    // Convert prices to EUR
    const sellPriceEur = floorNumber6Digits(event.proceeds / event.rateSold);
    const priceOnDayOfAcquisitionEur = floorNumber6Digits(
      event.symbolPriceAcquired / event.rateAcquired,
    );
    const isSellToCover = event.dateAcquired === event.dateSold;
    const isSellAtLoss = sellPriceEur < priceOnDayOfAcquisitionEur;

    const taxableEvent = getFrTaxableEventFromGainsAndLossEvent(
      event,
      isSellToCover
        ? {
            // Sell on the same day. This is treated as a sell to cover.
            // Acquisition value is the sell price.
            // This event is very unlikely, and the tax rule might be wrong
            acquisitionValueUsd: event.proceeds,
            acquisitionValueRate: event.rateSold,
            acquisitionCostUsd: event.acquisitionCost,
            explainAcquisitionValue: [
              "Use sell price as acquistion value given this is a sell to cover.",
              "WARNING: implemented tax rule might be wrong for this case.",
              "Maybe the acquisition price should be the vesting price instead of the sell price.",
              "If you encouter this message, please contact French taxes support.",
            ].join("\n"),
          }
        : isSellAtLoss
          ? {
              // Sale is at loss, use sell price as acquisition price given this
              // is a qualified plan
              acquisitionValueUsd: event.proceeds,
              acquisitionValueRate: event.rateSold,
              acquisitionCostUsd: event.acquisitionCost,
              explainAcquisitionValue:
                "Acquistion value is the sell price given the plan is qualified and the sale is at loss.",
            }
          : {
              // Just use symbol price at opening the day of exercise.
              acquisitionValueUsd: event.symbolPriceAcquired,
              acquisitionValueRate: event.rateAcquired,
              acquisitionCostUsd: event.acquisitionCost,
              explainAcquisitionValue: `Use ${event.symbol} price at opening on day of exercise.`,
            },
    );

    taxableEvents.push(taxableEvent);
    // Add acquisition gains information
    acquisitionGainEur += taxableEvent.acquisitionGain.total;
  });

  const floorAcquisitionGainEur = floorNumber6Digits(acquisitionGainEur);
  if (acquisitionGainEur > 0) {
    const discountableAcquisitionGainEur = Math.min(
      floorAcquisitionGainEur,
      300_000,
    );
    taxes["1TZ"] += floorNumber6Digits(discountableAcquisitionGainEur / 2);
    explanations.push({
      box: "1TZ",
      description: `RSU acquisition gains below 300k€ with 50% discount. (${formatNumber(discountableAcquisitionGainEur)} * 50%)`,
      taxableEvents,
    });
    taxes["1WZ"] += floorNumber6Digits(discountableAcquisitionGainEur / 2);
    explanations.push({
      box: "1WZ",
      description: `Tax acquisition discount for RSU acquisition gains below 300k€ (${formatNumber(discountableAcquisitionGainEur)} * 50%, see 1TZ for calculation details)`,
      taxableEvents: [],
    });
  }
  if (floorAcquisitionGainEur > 300_000) {
    taxes["1TT"] += Math.max(floorAcquisitionGainEur - 300_000, 0);
    explanations.push({
      box: "1TT",
      description: `RSU acquisition gains above 300k€ (${formatNumber(floorAcquisitionGainEur)} - 300 000€, see 1TZ for calculation details)`,
      taxableEvents: [],
    });
  }
  taxes["explanations"] = [...taxes["explanations"], ...explanations];
  // Add capital gains information to Form 2074
  taxes = getFrTaxesCapitalGain(
    {
      description: "Capital gains from FR qualified RSU sales.",
      taxableEvents,
    },
    taxes,
  );

  return taxes;
};

export const getFrTaxesForEspp = (
  {
    gainsAndLosses,
  }: {
    gainsAndLosses: GainAndLossEventWithRates[];
  },
  taxes: FrTaxes,
): FrTaxes => {
  const eventsEspp = gainsAndLosses.filter(isEspp);
  const taxableEvents: TaxableEventFr[] = [];

  // Process each event
  eventsEspp.forEach((event) => {
    const taxableEvent: TaxableEventFr = getFrTaxableEventFromGainsAndLossEvent(
      event,
      {
        // ESPP is the only type of plan where the acquisition cost for US
        // taxes is the same as the acquisition cost for French taxes.
        acquisitionValueUsd: event.adjustedCost,
        acquisitionValueRate: event.rateAcquired,
        acquisitionCostUsd: event.acquisitionCost,
        explainAcquisitionValue:
          "Use ESPP value as defined by e-trade for acquisition value.",
      },
    );

    taxableEvents.push(taxableEvent);
  });

  taxes["explanations"] = [
    ...taxes["explanations"],
    {
      box: "1AJ",
      description:
        "Acquisition gains from ESPP sales are due the year of acquisition. Already reported by your employer and not yet available in this tool.",
      taxableEvents: [],
    },
  ];

  // Add capital gains
  taxes = getFrTaxesCapitalGain(
    { description: "Capital gains from ESPP sales", taxableEvents },
    taxes,
  );

  return taxes;
};

export const getFrTaxesForNonFrQualifiedSo = (
  {
    gainsAndLosses,
  }: {
    gainsAndLosses: GainAndLossEventWithRates[];
    benefits: BenefitEventWithRates[];
  },
  taxes: FrTaxes,
): FrTaxes => {
  // Compute capital gains from gainsAndLosses
  const nonQualifiedSo = gainsAndLosses.filter((event) =>
    isUsQualifiedSo(event),
  );
  const taxableEvents: TaxableEventFr[] = [];

  nonQualifiedSo.forEach((event) => {
    const isSellToCover = event.dateAcquired === event.dateSold;

    const taxableEvent = getFrTaxableEventFromGainsAndLossEvent(
      event,
      isSellToCover
        ? {
            // Sell to cover for stock options:
            // Acquisition value is the sell price
            acquisitionValueUsd: event.proceeds,
            acquisitionValueRate: event.rateSold,
            acquisitionCostUsd: event.acquisitionCost,
            explainAcquisitionValue:
              "Acquistion value is the sell price given this is a sell to cover.",
          }
        : {
            // Use symbol price
            acquisitionValueUsd: event.symbolPriceAcquired,
            acquisitionValueRate: event.rateAcquired,
            acquisitionCostUsd: event.acquisitionCost,
            explainAcquisitionValue: `Use ${event.symbol} price at opening on day of exercise.`,
          },
    );

    taxableEvents.push(taxableEvent);
  });

  if (!taxableEvents.length) {
    return taxes;
  }

  taxes["explanations"] = [
    ...taxes["explanations"],
    {
      box: "1AJ",
      description:
        "Acquisition gains from non qualified SO are due at vest time. This is already reported by your employer and not yet calculated by this tool.",
      taxableEvents,
    },
  ];

  // Add capital gains information to Form 2074
  taxes = getFrTaxesCapitalGain(
    {
      description: "Capital gains from non FR qualified SO sales.",
      taxableEvents,
    },
    taxes,
  );
  return taxes;
};

export const getFrTaxesForNonFrQualifiedRsu = (
  {
    gainsAndLosses,
  }: {
    gainsAndLosses: GainAndLossEventWithRates[];
    benefits: BenefitEventWithRates[];
  },
  taxes: FrTaxes,
): FrTaxes => {
  const nonQualifiedRsu = gainsAndLosses.filter((event) =>
    isUsQualifiedRsu(event),
  );
  const taxableEvents: TaxableEventFr[] = [];

  // Compute capital gains from gainsAndLosses
  nonQualifiedRsu.forEach((event) => {
    const isSellToCover = event.dateAcquired === event.dateSold;

    const taxableEvent = getFrTaxableEventFromGainsAndLossEvent(
      event,
      isSellToCover
        ? {
            // Sell to cover for RSU:
            // Acquisition value is the sell price
            acquisitionValueUsd: event.proceeds,
            acquisitionValueRate: event.rateSold,
            acquisitionCostUsd: event.acquisitionCost,
            explainAcquisitionValue: [
              "Use sell price as acquistion value given this is a sell to cover.",
              "WARNING: implemented tax rule might be wrong for this case.",
              "Maybe the acquisition price should be the vesting price instead of the sell price.",
              "If you encouter this message, please contact French taxes support.",
            ].join("\n"),
          }
        : {
            // Use symbol price
            acquisitionValueUsd: event.symbolPriceAcquired,
            acquisitionValueRate: event.rateAcquired,
            acquisitionCostUsd: event.acquisitionCost,
            explainAcquisitionValue: `Use ${event.symbol} price at opening on day of exercise.`,
          },
    );

    taxableEvents.push(taxableEvent);
  });

  if (!taxableEvents.length) {
    return taxes;
  }

  taxes["explanations"] = [
    ...taxes["explanations"],
    {
      box: "1AJ",
      description:
        "Acquisition gains from non qualified RSUs are due at vest time. This is already reported by your employer and not yet calculated by this tool.",
      taxableEvents,
    },
  ];

  // Add capital gains information to Form 2074
  taxes = getFrTaxesCapitalGain(
    {
      description: "Capital gains from non FR qualified RSU sales.",
      taxableEvents,
    },
    taxes,
  );

  return taxes;
};

export const applyFrTaxes = ({
  gainsAndLosses,
  benefits,
  rates,
  symbolPrices,
}: {
  gainsAndLosses: GainAndLossEvent[];
  benefits: BenefitHistoryEvent[];
  rates: {
    [date: string]: number;
  };
  symbolPrices: {
    [symbol: string]: SymbolDailyResponse;
  };
}): FrTaxes => {
  return [
    getFrTaxesForFrQualifiedSo,
    getFrTaxesForFrQualifiedRsu,
    getFrTaxesForEspp,
    getFrTaxesForNonFrQualifiedSo,
    getFrTaxesForNonFrQualifiedRsu,
  ].reduce(
    (taxes, fn) =>
      fn(
        {
          gainsAndLosses: enrichEtradeGlFrFr(gainsAndLosses, {
            rates,
            symbolPrices,
          }),
          benefits: enrichEtradeBenefitsFrFr(benefits, {
            rates,
            symbolPrices,
          }),
        },
        taxes,
      ),
    getEmptyTaxes(),
  );
};
