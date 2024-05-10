import { GainAndLossEvent } from "@/lib/etrade/etrade.types";
import {
  GainAndLossEventWithRates,
  enrichEtradeGlFrFr,
  getEmptyTaxes,
  getFrTaxesForEspp,
  getFrTaxesForFrQualifiedRsu,
  getFrTaxesForFrQualifiedSo,
  getFrTaxesForNonFrQualifiedRsu,
  getFrTaxesForNonFrQualifiedSo,
} from "./taxes-rules-fr";
import { SymbolDailyResponse } from "@/lib/symbol-daily.types";

describe("enrichEtradeGlFrFr", () => {
  it("should work", () => {
    const gainsAndLosses: GainAndLossEvent[] = [
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 117,
        adjustedCost: 80,
        acquisitionCost: 78,
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
    expect(enrichEtradeGlFrFr(gainsAndLosses, { rates, symbolPrices })).toEqual(
      [
        {
          symbol: "DDOG",
          planType: "SO",
          quantity: 10,
          proceeds: 117,
          adjustedCost: 80,
          acquisitionCost: 78,
          dateAcquired: "2022-03-03",
          dateSold: "2022-09-09",
          qualifiedIn: "fr",
          rateAcquired: 1.12,
          rateSold: 1.13,
          symbolPriceAcquired: 100,
        },
      ],
    );
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
        acquisitionCost: 20,
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-03",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.12,
        symbolPriceAcquired: 100,
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
        acquisitionCost: 20,
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
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
    // sellPrice = 90 / 1.13 = 79.6460176991
    // cost = 20 / 1.12 = 17.8571428571
    // gain per share = 79.6460176991 - 17.8571428571 = 61.7888748419
    expect(taxes["1TT"]).toEqual(617.88875);
  });

  it("sell with gains", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 110, // Sold at 110$ when acquired at 100$
        adjustedCost: 80,
        acquisitionCost: 20,
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
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
        acquisitionCost: 0,
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-03",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.12,
        symbolPriceAcquired: 100,
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
        acquisitionCost: 0,
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
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
    // sellPrice = 90 / 1.13 = 79.6460176991
    // discount = 79.6460176991 / 2 = 39.8230088495
    expect(taxes["1TZ"]).toEqual(398.230085);
    expect(taxes["1TT"]).toEqual(0);
    expect(taxes["1WZ"]).toEqual(398.230085);
  });

  it("sell with gains", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "RS",
        quantity: 10,
        proceeds: 110, // Sold at 110$ when acquired at 100$
        adjustedCost: 80,
        acquisitionCost: 0,
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
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
        acquisitionCost: 80,
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
      },
    ];

    const taxes = getFrTaxesForEspp({ gainsAndLosses }, getEmptyTaxes());
    // Capital loss
    // acquisitionValue = 100 / 1.12 = 89.2857142857
    // sellPrice = 90 / 1.13 = 79.6460176991
    // capital loss = 79.6460176991 - 89.2857142857 = -9.6396965866
    expect(taxes["3VG"].toFixed(6)).toEqual("-97.000000");
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(1);
    const page510 = taxes["Form 2074"]["Page 510"][0];
    expect(page510["511"]).toEqual("DDOG (ESPP)");
    expect(page510["512"]).toEqual("09/03/2022");
    expect(page510["514"].toFixed(6)).toEqual("79.646017");
    expect(page510["515"]).toEqual(10);
    expect(page510["516"].toFixed(6)).toEqual("796.000000");
    expect(page510["517"]).toEqual(0);
    expect(page510["518"].toFixed(6)).toEqual("796.000000");
    expect(page510["520"].toFixed(6)).toEqual("89.290000");
    expect(page510["521"].toFixed(6)).toEqual("893.000000");
    expect(page510["522"]).toEqual(0);
    expect(page510["523"].toFixed(6)).toEqual("893.000000");
    expect(page510["524"].toFixed(6)).toEqual("-97.000000");
    expect(page510["525"]).toEqual(false);
    expect(page510["526"]).toEqual(0);
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
        acquisitionCost: 80,
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "fr",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
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
        acquisitionCost: 0,
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-03",
        qualifiedIn: "us",
        rateAcquired: 1.12,
        rateSold: 1.12,
        symbolPriceAcquired: 100,
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
        acquisitionCost: 0,
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "us",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
      },
    ];
    const taxes = getFrTaxesForNonFrQualifiedSo(
      { gainsAndLosses, benefits: [] },
      getEmptyTaxes(),
    );
    // Capital loss
    // acquisitionValue = 100 / 1.12 = 89.2857142857
    // sellPrice = 90 / 1.13 = 79.6460176991
    // capital loss = 79.6460176991 - 89.2857142857 = -9.6396965866
    expect(taxes["3VG"].toFixed(6)).toEqual("-97.000000");
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(1);
    const page510 = taxes["Form 2074"]["Page 510"][0];
    expect(page510["511"]).toEqual("DDOG (Stock Options)");
    expect(page510["512"]).toEqual("09/03/2022");
    expect(page510["514"].toFixed(6)).toEqual("79.646017");
    expect(page510["515"]).toEqual(10);
    expect(page510["516"].toFixed(6)).toEqual("796.000000");
    expect(page510["517"]).toEqual(0);
    expect(page510["518"].toFixed(6)).toEqual("796.000000");
    expect(page510["520"].toFixed(6)).toEqual("89.290000");
    expect(page510["521"].toFixed(6)).toEqual("893.000000");
    expect(page510["522"]).toEqual(0);
    expect(page510["523"].toFixed(6)).toEqual("893.000000");
    expect(page510["524"].toFixed(6)).toEqual("-97.000000");
    expect(page510["525"]).toEqual(false);
    expect(page510["526"]).toEqual(0);
  });
  it("capital gain", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "SO",
        quantity: 10,
        proceeds: 110, // Sold at 110$ when acquired at 100$
        adjustedCost: 80,
        acquisitionCost: 0,
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "us",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
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
        acquisitionCost: 0,
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-03",
        qualifiedIn: "us",
        rateAcquired: 1.12,
        rateSold: 1.12,
        symbolPriceAcquired: 100,
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
        acquisitionCost: 0,
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "us",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
      },
    ];
    const taxes = getFrTaxesForNonFrQualifiedRsu(
      { gainsAndLosses, benefits: [] },
      getEmptyTaxes(),
    );
    // Capital loss
    // acquisitionValue = 100 / 1.12 = 89.2857142857
    // sellPrice = 90 / 1.13 = 79.6460176991
    // capital loss = 79.6460176991 - 89.2857142857 = -9.6396965866
    expect(taxes["3VG"].toFixed(6)).toEqual("-97.000000");
    expect(taxes["Form 2074"]["Page 510"]).toHaveLength(1);
    const page510 = taxes["Form 2074"]["Page 510"][0];
    expect(page510["511"]).toEqual("DDOG (RSU)");
    expect(page510["512"]).toEqual("09/03/2022");
    expect(page510["514"].toFixed(6)).toEqual("79.646017");
    expect(page510["515"]).toEqual(10);
    expect(page510["516"].toFixed(6)).toEqual("796.000000");
    expect(page510["517"]).toEqual(0);
    expect(page510["518"].toFixed(6)).toEqual("796.000000");
    expect(page510["520"].toFixed(6)).toEqual("89.290000");
    expect(page510["521"].toFixed(6)).toEqual("893.000000");
    expect(page510["522"]).toEqual(0);
    expect(page510["523"].toFixed(6)).toEqual("893.000000");
    expect(page510["524"].toFixed(6)).toEqual("-97.000000");
    expect(page510["525"]).toEqual(false);
    expect(page510["526"]).toEqual(0);
  });
  it("capital gain", () => {
    const gainsAndLosses: GainAndLossEventWithRates[] = [
      {
        symbol: "DDOG",
        planType: "RS",
        quantity: 10,
        proceeds: 110, // Sold at 110$ when acquired at 100$
        adjustedCost: 80,
        acquisitionCost: 0,
        dateAcquired: "2022-03-03",
        dateSold: "2022-03-09",
        qualifiedIn: "us",
        rateAcquired: 1.12,
        rateSold: 1.13,
        symbolPriceAcquired: 100,
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
