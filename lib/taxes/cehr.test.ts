import {
  computeCehr,
  computeQuotient,
  evaluateFieldStatus,
  type FieldStatus,
  type FoyerSituation,
} from "./cehr";
import { buildCehrEmail } from "./cehr-template";

describe("computeCehr", () => {
  it.each([
    [400_000, "couple", 0],
    [1_285_760, "couple", 26_430],
    [600_000, "single", 11_500],
  ] satisfies Array<[number, FoyerSituation, number]>)(
    "computes CEHR for %s / %s",
    (rfr, situation, total) => {
      expect(computeCehr(rfr, situation).total).toBe(total);
    },
  );

  it("exposes the single 3% and 4% bases", () => {
    expect(computeCehr(600_000, "single")).toMatchObject({
      base3: 250_000,
      base4: 100_000,
    });
  });
});

describe("computeQuotient", () => {
  it("reproduces the 2021 Datadog case (couple)", () => {
    const r = computeQuotient({
      rfrN: 1_285_760,
      rfrNm1: 249_113,
      rfrNm2: 116_701,
      situation: "couple",
    });

    expect(r.eligible).toBe(true);
    expect(r.cehrWithoutQuotient.total).toBe(26_430);
    expect(r.cehrWithQuotient).toBe(14_060);
  });

  it.each([
    [550_000, 400_000, 400_000, "couple", 1],
    [1_500_000, 600_000, 100_000, "couple", 2],
    [100_000, 50_000, 50_000, "single", 0],
  ] satisfies Array<[number, number, number, FoyerSituation, number]>)(
    "rejects ineligible quotient case %#",
    (rfrN, rfrNm1, rfrNm2, situation, failedCheck) => {
      const r = computeQuotient({
        rfrN,
        rfrNm1,
        rfrNm2,
        situation,
      });

      expect(r.eligible).toBe(false);
      expect(r.checks[failedCheck].passed).toBe(false);
      expect(r.cehrWithQuotient).toBe(r.cehrWithoutQuotient.total);
    },
  );

  it.each([
    [1_500_000, 500_000, 100_000, "couple"],
    [600_000, 0, 0, "single"],
  ] satisfies Array<[number, number, number, FoyerSituation]>)(
    "accepts eligible quotient case %#",
    (rfrN, rfrNm1, rfrNm2, situation) => {
      expect(
        computeQuotient({
          rfrN,
          rfrNm1,
          rfrNm2,
          situation,
        }).eligible,
      ).toBe(true);
    },
  );

  it("uses raw intermediate CEHR totals before rounding the quotient result", () => {
    expect(
      computeQuotient({
        rfrN: 500_040,
        rfrNm1: 0,
        rfrNm2: 0,
        situation: "single",
      }).cehrWithQuotient,
    ).toBe(1);
  });
});

describe("evaluateFieldStatus", () => {
  it.each([
    ["Nm1", null, null, null, "single", "neutral"],
    ["Nm1", null, 100_000, null, "single", "passed"],
    ["Nm1", null, 300_000, null, "single", "failed"],
    ["Nm2", null, null, 400_000, "couple", "passed"],
    ["Nm2", null, null, 500_000, "couple", "passed"],
    ["Nm2", null, null, 600_000, "couple", "failed"],
    ["N", 800_000, 100_000, null, "single", "neutral"],
    ["N", 100_000, null, null, "single", "failed"],
    ["N", 100_000, 50_000, 50_000, "single", "failed"],
    ["N", 800_000, 100_000, 200_000, "single", "passed"],
    ["N", 200_000, 100_000, 200_000, "single", "failed"],
  ] satisfies Array<
    [
      "N" | "Nm1" | "Nm2",
      number | null,
      number | null,
      number | null,
      FoyerSituation,
      FieldStatus,
    ]
  >)(
    "returns %s status for case %#",
    (field, rfrN, rfrNm1, rfrNm2, situation, expected) => {
      expect(
        evaluateFieldStatus({ rfrN, rfrNm1, rfrNm2, situation, field }),
      ).toBe(expected);
    },
  );
});

describe("buildCehrEmail", () => {
  const quotient = computeQuotient({
    rfrN: 600_000,
    rfrNm1: 0,
    rfrNm2: 0,
    situation: "single",
  });

  it("includes the numeric conditions and quotient calculation details", () => {
    const email = buildCehrEmail({
      yearN: 2025,
      rfrN: 600_000,
      rfrNm1: 0,
      rfrNm2: 0,
      quotient,
      assetTypes: ["rsu"],
      situation: "single",
    });

    expect(email).toContain("Réclamation contentieuse");
    expect(email).toContain("conditions chiffrées");
    expect(email).not.toContain("conditions d'application sont remplies");
    expect(email).toContain("La moyenne des RFR 2023 et 2024 est donc de");
    expect(email).toContain(
      "Le RFR 2025 est au moins égal à 1,5 fois cette moyenne",
    );
    expect(email).toContain("3. Calcul de la CEHR avec quotient");
    expect(email).toContain("- Base lissée retenue pour le quotient :");
    expect(email).toContain("- Montant total de CEHR après quotient :");
    expect(email).not.toContain("(× 2 quotient)");
    expect(email).toContain(
      "Les avis d'impôt joints pour les revenus 2023, 2024 et 2025",
    );
  });

  it("uses plural wording for a couple", () => {
    const coupleQuotient = computeQuotient({
      rfrN: 1_500_000,
      rfrNm1: 500_000,
      rfrNm2: 100_000,
      situation: "couple",
    });
    const email = buildCehrEmail({
      yearN: 2025,
      rfrN: 1_500_000,
      rfrNm1: 500_000,
      rfrNm2: 100_000,
      quotient: coupleQuotient,
      assetTypes: ["rsu"],
      situation: "couple",
    });

    expect(email).toContain("Nous vous adressons");
    expect(email).toContain("Sauf erreur de notre part");
    expect(email).toContain("Nous sollicitons");
    expect(email).toContain("notre dossier fiscal");
    expect(email).toContain("nos salutations distinguées");
    expect(email).not.toContain("Je vous adresse");
  });
});
