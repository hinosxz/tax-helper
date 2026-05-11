import { computeCehr, computeQuotient, evaluateFieldStatus } from "./cehr";

describe("computeCehr", () => {
  it("returns zero below the first bracket (couple)", () => {
    expect(computeCehr(400_000, "couple").total).toBe(0);
  });

  it("applies 3% then 4% for a couple above 1M", () => {
    // RFR 1,285,760 € → 500k @ 3% = 15,000 ; 285,760 @ 4% = 11,430.4
    const r = computeCehr(1_285_760, "couple");
    expect(r.amount3).toBeCloseTo(15_000, 2);
    expect(r.amount4).toBeCloseTo(11_430.4, 2);
    expect(r.total).toBeCloseTo(26_430.4, 2);
  });

  it("applies the single brackets", () => {
    const r = computeCehr(600_000, "single");
    expect(r.base3).toBe(250_000);
    expect(r.base4).toBe(100_000);
    expect(r.total).toBeCloseTo(0.03 * 250_000 + 0.04 * 100_000, 2);
  });
});

describe("computeQuotient", () => {
  it("reproduces the 2021 Datadog case (couple)", () => {
    // RFR N-2 = 116,701 ; RFR N-1 = 249,113 ; RFR N = 1,285,760
    const r = computeQuotient({
      rfrN: 1_285_760,
      rfrNm1: 249_113,
      rfrNm2: 116_701,
      situation: "couple",
    });
    expect(r.eligible).toBe(true);
    expect(r.cehrWithoutQuotient.total).toBeCloseTo(26_430.4, 0);
    // Administration's accepted result was 14,060 €
    expect(Math.round(r.cehrWithQuotient)).toBe(14_060);
  });

  it("marks the request ineligible when RFR does not exceed 1.5× average", () => {
    const r = computeQuotient({
      rfrN: 550_000,
      rfrNm1: 400_000,
      rfrNm2: 400_000,
      situation: "couple",
    });
    expect(r.eligible).toBe(false);
    // CEHR>0 check passes (RFR N > 500k entry threshold)
    expect(r.checks[0].passed).toBe(true);
    // 1.5× check fails (550k < 1.5×400k = 600k)
    expect(r.checks[1].passed).toBe(false);
  });

  it("rejects when a previous RFR exceeded the CEHR entry threshold", () => {
    const r = computeQuotient({
      rfrN: 1_500_000,
      rfrNm1: 600_000,
      rfrNm2: 100_000,
      situation: "couple",
    });
    expect(r.eligible).toBe(false);
    // N-1 check (index 2) fails: 600k > 500k seuil couple
    expect(r.checks[2].passed).toBe(false);
  });

  it("accepts a previous RFR exactly at the CEHR entry threshold", () => {
    // RFR N-1 = 500k for a couple → CEHR(500k) = 0, still under the bracket.
    const r = computeQuotient({
      rfrN: 1_500_000,
      rfrNm1: 500_000,
      rfrNm2: 100_000,
      situation: "couple",
    });
    expect(r.eligible).toBe(true);
  });

  it("stays eligible when both previous RFRs are zero", () => {
    const r = computeQuotient({
      rfrN: 600_000,
      rfrNm1: 0,
      rfrNm2: 0,
      situation: "single",
    });
    expect(r.eligible).toBe(true);
  });

  it("rejects when RFR N does not trigger any CEHR liability", () => {
    // Single: avg = 50k, RFR N = 100k (>= 1.5×avg), N-1 and N-2 < 250k seuil,
    // but RFR N is below CEHR entry → no CEHR is actually due.
    const r = computeQuotient({
      rfrN: 100_000,
      rfrNm1: 50_000,
      rfrNm2: 50_000,
      situation: "single",
    });
    expect(r.cehrWithoutQuotient.total).toBe(0);
    expect(r.eligible).toBe(false);
    expect(r.checks[0].passed).toBe(false);
  });
});

describe("evaluateFieldStatus", () => {
  const base = { rfrN: null, rfrNm1: null, rfrNm2: null } as const;

  it("returns neutral when the targeted field is empty", () => {
    expect(
      evaluateFieldStatus({
        ...base,
        situation: "single",
        field: "Nm1",
      }),
    ).toBe("neutral");
    expect(
      evaluateFieldStatus({
        ...base,
        situation: "single",
        field: "Nm2",
      }),
    ).toBe("neutral");
  });

  it("validates RFR N-1 independently of the others (single)", () => {
    expect(
      evaluateFieldStatus({
        rfrN: null,
        rfrNm1: 100_000,
        rfrNm2: null,
        situation: "single",
        field: "Nm1",
      }),
    ).toBe("passed");
    expect(
      evaluateFieldStatus({
        rfrN: null,
        rfrNm1: 300_000,
        rfrNm2: null,
        situation: "single",
        field: "Nm1",
      }),
    ).toBe("failed");
  });

  it("validates RFR N-2 independently of the others (couple)", () => {
    expect(
      evaluateFieldStatus({
        rfrN: null,
        rfrNm1: null,
        rfrNm2: 400_000,
        situation: "couple",
        field: "Nm2",
      }),
    ).toBe("passed");
    expect(
      evaluateFieldStatus({
        rfrN: null,
        rfrNm1: null,
        rfrNm2: 500_000,
        situation: "couple",
        field: "Nm2",
      }),
    ).toBe("passed"); // boundary: exactly at threshold → no CEHR due
    expect(
      evaluateFieldStatus({
        rfrN: null,
        rfrNm1: null,
        rfrNm2: 600_000,
        situation: "couple",
        field: "Nm2",
      }),
    ).toBe("failed");
  });

  it("keeps RFR N neutral until both previous RFRs are filled", () => {
    expect(
      evaluateFieldStatus({
        rfrN: 800_000,
        rfrNm1: 100_000,
        rfrNm2: null,
        situation: "single",
        field: "N",
      }),
    ).toBe("neutral");
  });

  it("fails RFR N immediately when it is below the CEHR threshold", () => {
    // single, RFR N = 100k < 250k entry → no CEHR is due, fail early
    expect(
      evaluateFieldStatus({
        rfrN: 100_000,
        rfrNm1: null,
        rfrNm2: null,
        situation: "single",
        field: "N",
      }),
    ).toBe("failed");
    expect(
      evaluateFieldStatus({
        rfrN: 100_000,
        rfrNm1: 50_000,
        rfrNm2: 50_000,
        situation: "single",
        field: "N",
      }),
    ).toBe("failed");
  });

  it("validates RFR N once both previous RFRs are known", () => {
    expect(
      evaluateFieldStatus({
        rfrN: 800_000,
        rfrNm1: 100_000,
        rfrNm2: 200_000,
        situation: "single",
        field: "N",
      }),
    ).toBe("passed");
    expect(
      evaluateFieldStatus({
        rfrN: 200_000,
        rfrNm1: 100_000,
        rfrNm2: 200_000,
        situation: "single",
        field: "N",
      }),
    ).toBe("failed");
  });
});
