import type { GainAndLossEvent } from "@/lib/etrade/etrade.types";
import type { GainAndLossEventWithRates } from "./taxes-rules-fr";
import {
  enrichEtradeGlFrFr,
  getEmptyTaxes,
  getFrTaxesForEspp,
  getFrTaxesForFrQualifiedRsu,
  getFrTaxesForFrQualifiedSo,
  getFrTaxesForNonFrQualifiedRsu,
  getFrTaxesForNonFrQualifiedSo,
} from "./taxes-rules-fr";
import type { SymbolDailyResponse } from "@/lib/symbol-daily.types";

describe("enrichEtradeGlFrFr", () => {
  it("should work", () => {
    const gainsAndLosses: GainAndLossEvent[] = [
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 117,
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 78,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-09-09",
        qualifiedIn: "fr",
      },
    ];
    const rates = {
      "2022-03-03": 1.12,
      "2022-09-09": 1.13,
    };
    const symbolPrices: { [symbol: string]: SymbolDailyResponse } = {
      DDOG: {
        "2022-03-03": { opening: 100, closing: 110 },
        "2022-09-09": { opening: 110, closing: 120 },
      },
    };
    const fractions = [1];
    expect(
      enrichEtradeGlFrFr(gainsAndLosses, { rates, symbolPrices, fractions }),
    ).toEqual([
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 117,
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 78,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-09-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
        dateSymbolPriceAcquired: undefined,
        fractionFrIncome: 1,
      },
    ]);
  });
  it("should assign 100% if fractionFrIncome does not exist", () => {
    const gainsAndLosses: GainAndLossEvent[] = [
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 117,
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 78,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-09-09",
        qualifiedIn: "fr",
      },
    ];
    const rates = {
      "2022-03-03": 1.12,
      "2022-09-09": 1.13,
    };
    const symbolPrices: { [symbol: string]: SymbolDailyResponse } = {
      DDOG: {
        "2022-03-03": { opening: 100, closing: 110 },
        "2022-09-09": { opening: 110, closing: 120 },
      },
    };
    const fractions: number[] = [];
    expect(
      enrichEtradeGlFrFr(gainsAndLosses, { rates, symbolPrices, fractions }),
    ).toEqual([
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 117,
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 78,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-09-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
        dateSymbolPriceAcquired: undefined,
        fractionFrIncome: 1,
      },
    ]);
  });
  it("should use previous day for symbol price if it is not available", () => {
    const gainsAndLosses: GainAndLossEvent[] = [
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 117,
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 78,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-09-09",
        qualifiedIn: "fr",
      },
    ];
    const rates = {
      "2022-03-03": 1.12,
      "2022-09-09": 1.13,
    };
    const symbolPrices: { [symbol: string]: SymbolDailyResponse } = {
      DDOG: {
        // There is no price for 2022-03-03
        "2022-03-02": { opening: 100, closing: 110 },
        "2022-09-09": { opening: 110, closing: 120 },
      },
    };
    const fractions = [1];
    expect(
      enrichEtradeGlFrFr(gainsAndLosses, { rates, symbolPrices, fractions }),
    ).toEqual([
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 117,
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 78,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-09-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
        dateSymbolPriceAcquired: "2022-03-02",
        fractionFrIncome: 1,
      },
    ]);
  });

  it("should use purchaseDateFairMktValue for symbol price if it is not available", () => {
    const gainsAndLosses: GainAndLossEvent[] = [
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 117,
        adjustedCost: 333, // This should be the same value as purchaseDateFairMktValue but for the sake of test it is not
        purchaseDateFairMktValue: 80,
        acquisitionCost: 78,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-09-09",
        qualifiedIn: "fr",
      },
    ];
    const rates = {
      "2022-03-03": 1.12,
      "2022-09-09": 1.13,
    };
    const symbolPrices: { [symbol: string]: SymbolDailyResponse } = {
      DDOG: {
        // There is no price for 2022-03-03
        "2022-02-02": { opening: 100, closing: 110 },
        "2022-09-09": { opening: 110, closing: 120 },
      },
    };

    const fractions = [1];
    expect(
      enrichEtradeGlFrFr(gainsAndLosses, { rates, symbolPrices, fractions }),
    ).toEqual([
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 117,
        adjustedCost: 333,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 78,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-09-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 80,
        dateSymbolPriceAcquired: undefined, // cotation date is acquisition date
        fractionFrIncome: 1,
      },
    ]);
  });
  it("should  use adjusted cost for symbol price if symbol and purchaseDateFairMktValue are unavailable", () => {
    const gainsAndLosses: GainAndLossEvent[] = [
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 117,
        adjustedCost: 80,
        purchaseDateFairMktValue: 0,
        acquisitionCost: 78,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-09-09",
        qualifiedIn: "fr",
      },
    ];
    const rates = {
      "2022-03-03": 1.12,
      "2022-09-09": 1.13,
    };
    const symbolPrices: { [symbol: string]: SymbolDailyResponse } = {
      DDOG: {
        // There is no price for 2022-03-03
        "2022-02-02": { opening: 100, closing: 110 },
        "2022-09-09": { opening: 110, closing: 120 },
      },
    };

    const fractions = [1];
    expect(
      enrichEtradeGlFrFr(gainsAndLosses, { rates, symbolPrices, fractions }),
    ).toEqual([
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 117,
        adjustedCost: 80,
        purchaseDateFairMktValue: 0,
        acquisitionCost: 78,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-09-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 80,
        dateSymbolPriceAcquired: undefined, // cotation date is acquisition date
        fractionFrIncome: 1,
      },
    ]);
  });
});

describe("getFrTaxesForFrQualifiedSo", () => {
  it("same day sell", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 110, // Sold at 110$ when daily value is 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 20,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-03",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.12,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];

    const taxes = getFrTaxesForFrQualifiedSo(
      { gainsAndLosses },
      getEmptyTaxes(),
    );
    // No capital gain
    expect(taxes["3VG"]).toEqual(0);
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(0);

    // Acquisition gain
    // sellPrice = 110 / 1.12 = 98.2142857143
    // cost = 20 / 1.12 = 17.8571428571
    // gain per share = 98.2142857143 - 17.8571428571 = 80.3571428571
    expect(taxes["1TT"]).toEqual(803.57143);
  });

  it("sell with losses", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 90, // Sold at 90$ when acquired at 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 20,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];

    const taxes = getFrTaxesForFrQualifiedSo(
      { gainsAndLosses },
      getEmptyTaxes(),
    );
    // No capital gain
    expect(taxes["3VG"]).toEqual(0);
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(0);

    // Acquisition gain
    // acquisitionValue = 100 / 1.12 = 89.2857142857
    // cost = 20 / 1.12 = 17.8571428571
    // gain per share = 89.2857142857 - 17.8571428571 = 71.4285714286
    expect(taxes["1TT"]).toEqual(714.28572);
  });

  it("sell with gains", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 110, // Sold at 110$ when acquired at 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 20,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];

    const taxes = getFrTaxesForFrQualifiedSo(
      { gainsAndLosses },
      getEmptyTaxes(),
    );

    // cost = 20 / 1.12 = 17.8571428571
    // acquisitionValue = 100 / 1.12 = 89.2857142857
    // sellPrice = 110 / 1.13 = 97.3451327434
    // capital gain = 97.3451327434 - 89.2857142857 = 8.0594184577
    // acquisition gain = 89.2857142857 - 17.8571428571 = 71.4285714286

    // Acquisition gain
    expect(taxes["1TT"]).toEqual(714.28572);

    // Capital gain
    expect(taxes["3VG"].toFixed(6)).toEqual("80.000000");
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(1);
    const page510 = taxes["Form 2074"]["Page 510"][0];
    expect(page510["511"]).toEqual("DDOG (Stock Options)");
    expect(page510["512"]).toEqual("09/03/2022");
    expect(page510["514"].toFixed(6)).toEqual("97.345132");
    expect(page510["515"]).toEqual(10);
    expect(page510["516"].toFixed(6)).toEqual("973.000000");
    expect(page510["517"]).toEqual(0);
    expect(page510["518"].toFixed(6)).toEqual("973.000000");
    expect(page510["520"].toFixed(6)).toEqual("89.290000");
    expect(page510["521"].toFixed(6)).toEqual("893.000000");
    expect(page510["522"]).toEqual(0);
    expect(page510["523"].toFixed(6)).toEqual("893.000000");
    expect(page510["524"].toFixed(6)).toEqual("80.000000");
    expect(page510["525"]).toEqual(false);
    expect(page510["526"]).toEqual(0);
  });

  it("sell with gain and loss (net positive)", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        // Event A: gain
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 120, // Sold at 120$ when acquired at 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 20,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1,
        rateSold: 1,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
      {
        // Event B: loss
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 90, // Sold at 90$ when acquired at 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 20,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-04-09",
        qualifiedIn: "fr",
        rateAcquired: 1,
        rateSold: 1,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];

    const taxes = getFrTaxesForFrQualifiedSo(
      { gainsAndLosses },
      getEmptyTaxes(),
    );

    // Both operations appear in Form 2074
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(2);

    // Net capital gain is positive (200 - 100 = 100)
    expect(taxes["3VG"]).toEqual(100);

    // Loss event has a negative cell 524
    const gainPage = taxes["Form 2074"]["Page 510"][0];
    const lossPage = taxes["Form 2074"]["Page 510"][1];
    expect(gainPage["524"]).toEqual(200);
    expect(lossPage["524"]).toEqual(-100);

    // Acquisition gain: both events use symbolPriceAcquired=100
    // (100 - 20) * 10 * 2 events = 1600
    expect(taxes["1TT"]).toEqual(1600);
  });

  it("sell with gain and loss (net zero)", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        // Event A: gain of +100
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 110,
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 20,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1,
        rateSold: 1,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
      {
        // Event B: loss of -100, net = 0
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 90,
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 20,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-04-09",
        qualifiedIn: "fr",
        rateAcquired: 1,
        rateSold: 1,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];

    const taxes = getFrTaxesForFrQualifiedSo(
      { gainsAndLosses },
      getEmptyTaxes(),
    );

    // Net capital gain is zero → Form 2074 is not filled
    expect(taxes["3VG"]).toEqual(0);
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(0);

    // Acquisition gain is still reported
    expect(taxes["1TT"]).toEqual(1600);
  });
});

describe("getFrTaxesForFrQualifiedRsu()", () => {
  it("same day sell", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "RS",
        quantity: 10,
        proceeds: 110, // Sold at 110$ when daily value is 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 0,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-03",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.12,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];

    const taxes = getFrTaxesForFrQualifiedRsu(
      { gainsAndLosses },
      getEmptyTaxes(),
    );
    // No capital gain
    expect(taxes["3VG"]).toEqual(0);
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(0);

    // Acquisition gain
    // sellPrice = 110 / 1.12 = 98.2142857143
    // discount = 98.2142857143 / 2 = 49.1071428571
    expect(taxes["1TZ"]).toEqual(491.071425);
    expect(taxes["1TT"]).toEqual(0);
    expect(taxes["1WZ"]).toEqual(491.071425);
  });

  it("sell with losses", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "RS",
        quantity: 10,
        proceeds: 90, // Sold at 90$ when acquired at 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 0,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];

    const taxes = getFrTaxesForFrQualifiedRsu(
      { gainsAndLosses },
      getEmptyTaxes(),
    );
    // No capital gain
    expect(taxes["3VG"]).toEqual(0);
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(0);
    // Acquisition gain
    // acquisitionValue = 100 / 1.12 = 89.2857142857
    // discount = 89.2857142857 / 2 = 44.6428571429
    expect(taxes["1TZ"]).toEqual(446.42857);
    expect(taxes["1TT"]).toEqual(0);
    expect(taxes["1WZ"]).toEqual(446.42857);
  });

  it("sell with gains", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "RS",
        quantity: 10,
        proceeds: 110, // Sold at 110$ when acquired at 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 0,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];

    const taxes = getFrTaxesForFrQualifiedRsu(
      { gainsAndLosses },
      getEmptyTaxes(),
    );

    // acquisitionValue = 100 / 1.12 = 89.2857142857
    // sellPrice = 110 / 1.13 = 97.3451327434
    // capital gain = 97.3451327434 - 89.2857142857 = 8.0594184577
    // acquisition gain = 89.2857142857 - 0 = 89.2857142857
    // discount = 89.2857142857 / 2 = 44.6428571429
    // Acquisition gain
    expect(taxes["1TZ"]).toEqual(446.42857);
    expect(taxes["1TT"]).toEqual(0);
    expect(taxes["1WZ"]).toEqual(446.42857);

    // Capital gain
    expect(taxes["3VG"].toFixed(6)).toEqual("80.000000");
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(1);
    const page510 = taxes["Form 2074"]["Page 510"][0];
    expect(page510["511"]).toEqual("DDOG (RSU)");
    expect(page510["512"]).toEqual("09/03/2022");
    expect(page510["514"].toFixed(6)).toEqual("97.345132");
    expect(page510["515"]).toEqual(10);
    expect(page510["516"].toFixed(6)).toEqual("973.000000");
    expect(page510["517"]).toEqual(0);
    expect(page510["518"].toFixed(6)).toEqual("973.000000");
    expect(page510["520"].toFixed(6)).toEqual("89.290000");
    expect(page510["521"].toFixed(6)).toEqual("893.000000");
    expect(page510["522"]).toEqual(0);
    expect(page510["523"].toFixed(6)).toEqual("893.000000");
    expect(page510["524"].toFixed(6)).toEqual("80.000000");
    expect(page510["525"]).toEqual(false);
    expect(page510["526"]).toEqual(0);
  });

  it("fraction FR income < 100%", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "RS",
        quantity: 10,
        proceeds: 110, // Sold at 110$ when acquired at 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 0,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
        fractionFrIncome: 0.9,
      },
    ];

    const taxes = getFrTaxesForFrQualifiedRsu(
      { gainsAndLosses },
      getEmptyTaxes(),
    );

    // acquisitionValue = 100 / 1.12 = 89.2857142857
    // sellPrice = 110 / 1.13 = 97.3451327434
    // capital gain = 97.3451327434 - 89.2857142857 = 8.0594184577
    // acquisition gain = (89.2857142857 - 0) * 90% = 80.3571428571
    // discount = 80.3571428571 / 2 = 40.1785714286
    // Acquisition gain
    expect(taxes["1TZ"]).toEqual(401.785713);
    expect(taxes["1TT"]).toEqual(0);
    expect(taxes["1WZ"]).toEqual(401.785713);
  });

  it("sell with gain and loss (net positive)", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        // Event A: gain
        symbol: "DDOG",
        planType: "RS",
        quantity: 10,
        proceeds: 120, // Sold at 120$ when acquired at 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 0,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1,
        rateSold: 1,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
      {
        // Event B: loss
        symbol: "DDOG",
        planType: "RS",
        quantity: 10,
        proceeds: 90, // Sold at 90$ when acquired at 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 0,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-04-09",
        qualifiedIn: "fr",
        rateAcquired: 1,
        rateSold: 1,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];

    const taxes = getFrTaxesForFrQualifiedRsu(
      { gainsAndLosses },
      getEmptyTaxes(),
    );

    // Both operations appear in Form 2074
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(2);

    // Net capital gain is positive (200 - 100 = 100)
    expect(taxes["3VG"]).toEqual(100);

    // Loss event has a negative cell 524
    const gainPage = taxes["Form 2074"]["Page 510"][0];
    const lossPage = taxes["Form 2074"]["Page 510"][1];
    expect(gainPage["524"]).toEqual(200);
    expect(lossPage["524"]).toEqual(-100);

    // Acquisition gain: both events use symbolPriceAcquired=100, acquisitionCost=0
    // discount = (100 * 10 + 100 * 10) / 2 = 1000
    expect(taxes["1TZ"]).toEqual(1000);
    expect(taxes["1WZ"]).toEqual(1000);
  });

  it("sell with gain and loss (net zero)", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        // Event A: gain of +100
        symbol: "DDOG",
        planType: "RS",
        quantity: 10,
        proceeds: 110,
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 0,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1,
        rateSold: 1,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
      {
        // Event B: loss of -100, net = 0
        symbol: "DDOG",
        planType: "RS",
        quantity: 10,
        proceeds: 90,
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 0,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-04-09",
        qualifiedIn: "fr",
        rateAcquired: 1,
        rateSold: 1,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];

    const taxes = getFrTaxesForFrQualifiedRsu(
      { gainsAndLosses },
      getEmptyTaxes(),
    );

    // Net capital gain is zero → Form 2074 is not filled
    expect(taxes["3VG"]).toEqual(0);
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(0);

    // Acquisition gain is still reported
    expect(taxes["1TZ"]).toEqual(1000);
    expect(taxes["1WZ"]).toEqual(1000);
  });
});

describe("getFrTaxesForEspp", () => {
  it("capital loss", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "ESPP",
        quantity: 10,
        proceeds: 90, // Sold at 90$ when acquired at 100$
        adjustedCost: 100,
        purchaseDateFairMktValue: 100,
        acquisitionCost: 80,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];

    const taxes = getFrTaxesForEspp({ gainsAndLosses }, getEmptyTaxes());
    // Net capital loss → Form 2074 is not filled
    // acquisitionValue = 100 / 1.12 = 89.2857142857
    // sellPrice = 90 / 1.13 = 79.6460176991
    // capital loss = 79.6460176991 - 89.2857142857 = -9.6396965866
    expect(taxes["3VG"]).toEqual(0);
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(0);
    // Acquisition gain
    expect(taxes["1AJ"]).toEqual(0);
    expect(taxes["1TZ"]).toEqual(0);
    expect(taxes["1TT"]).toEqual(0);
    expect(taxes["1WZ"]).toEqual(0);
  });
  it("capital gain", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "ESPP",
        quantity: 10,
        proceeds: 110, // Sold at 110$ when acquired at 100$
        adjustedCost: 100,
        purchaseDateFairMktValue: 100,
        acquisitionCost: 80,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];

    const taxes = getFrTaxesForEspp({ gainsAndLosses }, getEmptyTaxes());
    // Capital gain
    // acquisitionValue = 100 / 1.12 = 89.2857142857
    // sellPrice = 110 / 1.13 = 97.3451327434
    // capital gain = 97.3451327434 - 89.2857142857 = 8.0594184577
    expect(taxes["3VG"].toFixed(6)).toEqual("80.000000");
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(1);
    const page510 = taxes["Form 2074"]["Page 510"][0];
    expect(page510["511"]).toEqual("DDOG (ESPP)");
    expect(page510["512"]).toEqual("09/03/2022");
    expect(page510["514"].toFixed(6)).toEqual("97.345132");
    expect(page510["515"]).toEqual(10);
    expect(page510["516"].toFixed(6)).toEqual("973.000000");
    expect(page510["517"]).toEqual(0);
    expect(page510["518"].toFixed(6)).toEqual("973.000000");
    expect(page510["520"].toFixed(6)).toEqual("89.290000");
    expect(page510["521"].toFixed(6)).toEqual("893.000000");
    expect(page510["522"]).toEqual(0);
    expect(page510["523"].toFixed(6)).toEqual("893.000000");
    expect(page510["524"].toFixed(6)).toEqual("80.000000");
    expect(page510["525"]).toEqual(false);
    expect(page510["526"]).toEqual(0);
    // Acquisition gain
    expect(taxes["1AJ"]).toEqual(0);
    expect(taxes["1TZ"]).toEqual(0);
    expect(taxes["1TT"]).toEqual(0);
    expect(taxes["1WZ"]).toEqual(0);
  });
  it("Simulate first round of ESPP", () => {
    // On first round of ESPP the taxes were not collected by E-Trade
    // E-Trade will report the adjustedCost equal to the acquisition cost
    // which is the same behavior as if the taxes were NOT collected.
    // To prevent this, use the purchaseDateFairMktValue instead of the adjustedCost
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "ESPP",
        quantity: 10,
        proceeds: 90, // Sold at 90$ when acquired at 100$
        adjustedCost: 100,
        purchaseDateFairMktValue: 100,
        acquisitionCost: 80,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];

    const taxes = getFrTaxesForEspp({ gainsAndLosses }, getEmptyTaxes());
    // Net capital loss → Form 2074 is not filled
    // acquisitionValue = 100 / 1.12 = 89.2857142857
    // sellPrice = 90 / 1.13 = 79.6460176991
    // capital loss = 79.6460176991 - 89.2857142857 = -9.6396965866
    expect(taxes["3VG"]).toEqual(0);
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(0);
    // Acquisition gain
    expect(taxes["1AJ"]).toEqual(0);
    expect(taxes["1TZ"]).toEqual(0);
    expect(taxes["1TT"]).toEqual(0);
    expect(taxes["1WZ"]).toEqual(0);
  });
});

describe("getFrTaxesForNonFrQualifiedSo", () => {
  it("same day sell", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 110, // Sold at 110$ when daily value is 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 0,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-03",
        qualifiedIn: "us",
        rateAcquired: 1.12,
        rateSold: 1.12,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];
    const taxes = getFrTaxesForNonFrQualifiedSo(
      { gainsAndLosses, benefits: [] },
      getEmptyTaxes(),
    );
    // No capital gain
    expect(taxes["3VG"]).toEqual(0);
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(0);
  });
  it("capital loss", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 90, // Sold at 90$ when acquired at 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 0,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "us",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];
    const taxes = getFrTaxesForNonFrQualifiedSo(
      { gainsAndLosses, benefits: [] },
      getEmptyTaxes(),
    );
    // Net capital loss → Form 2074 is not filled
    // acquisitionValue = 100 / 1.12 = 89.2857142857
    // sellPrice = 90 / 1.13 = 79.6460176991
    // capital loss = 79.6460176991 - 89.2857142857 = -9.6396965866
    expect(taxes["3VG"]).toEqual(0);
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(0);
  });
  it("capital gain", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 110, // Sold at 110$ when acquired at 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 0,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "us",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];
    const taxes = getFrTaxesForNonFrQualifiedSo(
      { gainsAndLosses, benefits: [] },
      getEmptyTaxes(),
    );
    // Capital gain
    // acquisitionValue = 100 / 1.12 = 89.2857142857
    // sellPrice = 110 / 1.13 = 97.3451327434
    // capital gain = 97.3451327434 - 89.2857142857 = 8.0594184577
    expect(taxes["3VG"].toFixed(6)).toEqual("80.000000");
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(1);
    const page510 = taxes["Form 2074"]["Page 510"][0];
    expect(page510["511"]).toEqual("DDOG (Stock Options)");
    expect(page510["512"]).toEqual("09/03/2022");
    expect(page510["514"].toFixed(6)).toEqual("97.345132");
    expect(page510["515"]).toEqual(10);
    expect(page510["516"].toFixed(6)).toEqual("973.000000");
    expect(page510["517"]).toEqual(0);
    expect(page510["518"].toFixed(6)).toEqual("973.000000");
    expect(page510["520"].toFixed(6)).toEqual("89.290000");
    expect(page510["521"].toFixed(6)).toEqual("893.000000");
    expect(page510["522"]).toEqual(0);
    expect(page510["523"].toFixed(6)).toEqual("893.000000");
    expect(page510["524"].toFixed(6)).toEqual("80.000000");
    expect(page510["525"]).toEqual(false);
    expect(page510["526"]).toEqual(0);
  });
});

describe("getFrTaxesForNonFrQualifiedRsu", () => {
  it("same day sell", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "RS",
        quantity: 10,
        proceeds: 110, // Sold at 110$ when daily value is 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 0,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-03",
        qualifiedIn: "us",
        rateAcquired: 1.12,
        rateSold: 1.12,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];
    const taxes = getFrTaxesForNonFrQualifiedRsu(
      { gainsAndLosses, benefits: [] },
      getEmptyTaxes(),
    );
    // No capital gain
    expect(taxes["3VG"]).toEqual(0);
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(0);
  });
  it("capital loss", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "RS",
        quantity: 10,
        proceeds: 90, // Sold at 90$ when acquired at 100$
        adjustedCost: 0,
        purchaseDateFairMktValue: 100.6,
        acquisitionCost: 0,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "us",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];
    const taxes = getFrTaxesForNonFrQualifiedRsu(
      { gainsAndLosses, benefits: [] },
      getEmptyTaxes(),
    );
    // Net capital loss → Form 2074 is not filled
    // acquisitionValue = 100 / 1.12 = 89.2857142857
    // sellPrice = 90 / 1.13 = 79.6460176991
    // capital loss = 79.6460176991 - 89.2857142857 = -9.6396965866
    expect(taxes["3VG"]).toEqual(0);
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(0);
  });
  it("capital gain", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "RS",
        quantity: 10,
        proceeds: 110, // Sold at 110$ when acquired at 100$
        adjustedCost: 80,
        purchaseDateFairMktValue: 80,
        acquisitionCost: 0,
        dateGranted: "2021-03-03",
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "us",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
        fractionFrIncome: 1,
      },
    ];
    const taxes = getFrTaxesForNonFrQualifiedRsu(
      { gainsAndLosses, benefits: [] },
      getEmptyTaxes(),
    );
    // Capital gain
    // acquisitionValue = 100 / 1.12 = 89.2857142857
    // sellPrice = 110 / 1.13 = 97.3451327434
    // capital gain = 97.3451327434 - 89.2857142857 = 8.0594184577
    expect(taxes["3VG"].toFixed(6)).toEqual("80.000000");
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(1);
    const page510 = taxes["Form 2074"]["Page 510"][0];
    expect(page510["511"]).toEqual("DDOG (RSU)");
    expect(page510["512"]).toEqual("09/03/2022");
    expect(page510["514"].toFixed(6)).toEqual("97.345132");
    expect(page510["515"]).toEqual(10);
    expect(page510["516"].toFixed(6)).toEqual("973.000000");
    expect(page510["517"]).toEqual(0);
    expect(page510["518"].toFixed(6)).toEqual("973.000000");
    expect(page510["520"].toFixed(6)).toEqual("89.290000");
    expect(page510["521"].toFixed(6)).toEqual("893.000000");
    expect(page510["522"]).toEqual(0);
    expect(page510["523"].toFixed(6)).toEqual("893.000000");
    expect(page510["524"].toFixed(6)).toEqual("80.000000");
    expect(page510["525"]).toEqual(false);
    expect(page510["526"]).toEqual(0);
  });
});
