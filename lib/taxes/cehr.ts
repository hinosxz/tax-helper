/**
 * Contribution Exceptionnelle sur les Hauts Revenus (CEHR)
 * Article 223 sexies du Code Général des Impôts.
 *
 * Lissage via le système du quotient applicable aux revenus exceptionnels
 * lorsque le RFR de l'année dépasse de plus de 1,5 fois la moyenne des deux
 * années précédentes (article 223 sexies V CGI).
 */

export type FoyerSituation = "single" | "couple";

interface CehrBrackets {
  rate3From: number;
  rate3To: number;
  rate4From: number;
}

const BRACKETS: Record<FoyerSituation, CehrBrackets> = {
  single: { rate3From: 250_000, rate3To: 500_000, rate4From: 500_000 },
  couple: { rate3From: 500_000, rate3To: 1_000_000, rate4From: 1_000_000 },
};

export const cehrEntryThreshold = (situation: FoyerSituation): number =>
  BRACKETS[situation].rate3From;

/** Formats a number as a French-locale euro amount rounded to the nearest unit. */
export const fmtEur = (n: number): string =>
  `${Math.round(n).toLocaleString("fr-FR")} €`;

export type FieldStatus = "neutral" | "passed" | "failed";

/**
 * Evaluates the eligibility status of a single RFR input,
 * independently of the other inputs when possible.
 * - RFR N-1 / N-2: only requires their own value (passed if < seuil CEHR).
 * - RFR N: requires the two previous values to compute the 1.5 × average rule.
 */
export const evaluateFieldStatus = (params: {
  rfrN: number | null;
  rfrNm1: number | null;
  rfrNm2: number | null;
  situation: FoyerSituation;
  field: "N" | "Nm1" | "Nm2";
}): FieldStatus => {
  const { rfrN, rfrNm1, rfrNm2, situation, field } = params;
  const entry = cehrEntryThreshold(situation);

  if (field === "Nm1") {
    if (rfrNm1 === null) return "neutral";
    return rfrNm1 <= entry ? "passed" : "failed";
  }
  if (field === "Nm2") {
    if (rfrNm2 === null) return "neutral";
    return rfrNm2 <= entry ? "passed" : "failed";
  }
  // field === "N"
  if (rfrN === null) return "neutral";
  // Standalone check: RFR N must exceed the CEHR entry threshold,
  // otherwise no CEHR is due and the quotient is moot.
  if (rfrN <= entry) return "failed";
  if (rfrNm1 === null || rfrNm2 === null) return "neutral";
  const avg = (rfrNm1 + rfrNm2) / 2;
  return rfrN >= 1.5 * avg ? "passed" : "failed";
};

export interface CehrBreakdown {
  rfr: number;
  base3: number;
  base4: number;
  amount3: number;
  amount4: number;
  total: number;
}

export const computeCehr = (
  rfr: number,
  situation: FoyerSituation,
): CehrBreakdown => {
  const b = BRACKETS[situation];
  const base3 = Math.max(0, Math.min(rfr, b.rate3To) - b.rate3From);
  const base4 = Math.max(0, rfr - b.rate4From);
  const amount3 = base3 * 0.03;
  const amount4 = base4 * 0.04;
  // Per BOFiP: la contribution est arrondie à l'euro le plus proche.
  const total = Math.round(amount3 + amount4);
  return {
    rfr,
    base3,
    base4,
    amount3,
    amount4,
    total,
  };
};

export interface QuotientInputs {
  rfrN: number;
  rfrNm1: number;
  rfrNm2: number;
  situation: FoyerSituation;
}

export interface EligibilityCheck {
  label: string;
  detail: string;
  passed: boolean;
}

export interface QuotientResult {
  eligible: boolean;
  checks: EligibilityCheck[];
  averagePrevious: number;
  threshold: number;
  entryThreshold: number;
  cehrWithoutQuotient: CehrBreakdown;
  cehrWithQuotient: number;
  cehrOnAverage: number;
  cehrOnMidpoint: number;
  savings: number;
}

export const computeQuotient = ({
  rfrN,
  rfrNm1,
  rfrNm2,
  situation,
}: QuotientInputs): QuotientResult => {
  const averagePrevious = (rfrNm1 + rfrNm2) / 2;
  const threshold = 1.5 * averagePrevious;
  const entryThreshold = cehrEntryThreshold(situation);
  const cehrWithoutQuotient = computeCehr(rfrN, situation);

  const checks: EligibilityCheck[] = [
    {
      label: `RFR N supérieur au seuil d'application de la CEHR (${fmtEur(
        entryThreshold,
      )})`,
      detail: `RFR N = ${fmtEur(rfrN)}`,
      passed: cehrWithoutQuotient.total > 0,
    },
    {
      label: "RFR N ≥ 1,5 × moyenne des RFR N-1 et N-2",
      detail: `RFR N = ${fmtEur(rfrN)} vs 1,5 × moyenne = ${fmtEur(threshold)}`,
      passed: rfrN >= threshold,
    },
    {
      label: `RFR N-1 sous le seuil d'application de la CEHR (≤ ${fmtEur(
        entryThreshold,
      )})`,
      detail: `RFR N-1 = ${fmtEur(rfrNm1)}`,
      passed: rfrNm1 <= entryThreshold,
    },
    {
      label: `RFR N-2 sous le seuil d'application de la CEHR (≤ ${fmtEur(
        entryThreshold,
      )})`,
      detail: `RFR N-2 = ${fmtEur(rfrNm2)}`,
      passed: rfrNm2 <= entryThreshold,
    },
  ];

  const eligible = checks.every((c) => c.passed);

  if (!eligible) {
    return {
      eligible: false,
      checks,
      averagePrevious,
      threshold,
      entryThreshold,
      cehrWithoutQuotient,
      cehrWithQuotient: cehrWithoutQuotient.total,
      cehrOnAverage: 0,
      cehrOnMidpoint: 0,
      savings: 0,
    };
  }

  const delta = rfrN - averagePrevious;
  const midpoint = averagePrevious + delta / 2;
  const cehrOnAverage = computeCehr(averagePrevious, situation).total;
  const cehrOnMidpoint = computeCehr(midpoint, situation).total;
  // Per BOFiP: la contribution finale est arrondie à l'euro le plus proche.
  const cehrWithQuotient = Math.round(
    cehrOnAverage + 2 * (cehrOnMidpoint - cehrOnAverage),
  );

  return {
    eligible: true,
    checks,
    averagePrevious,
    threshold,
    entryThreshold,
    cehrWithoutQuotient,
    cehrWithQuotient,
    cehrOnAverage,
    cehrOnMidpoint,
    savings: Math.round(cehrWithoutQuotient.total - cehrWithQuotient),
  };
};
