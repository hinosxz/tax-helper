import { useMemo } from "react";
import {
  cehrEntryThreshold,
  computeCehr,
  computeQuotient,
  evaluateFieldStatus,
  fmtEur,
  type CehrBreakdown,
  type FoyerSituation,
  type QuotientResult,
} from "@/lib/taxes/cehr";
import { buildCehrEmail, type AssetType } from "@/lib/taxes/cehr-template";
import type { CheckStatus } from "./_RfrField";

interface Inputs {
  yearN: number;
  situation: FoyerSituation;
  rfrN: number | null;
  rfrNm1: number | null;
  rfrNm2: number | null;
  assetTypes: AssetType[];
}

interface FieldUi {
  status: CheckStatus;
  detail?: string;
}

export interface CehrCalculatorView {
  allFilled: boolean;
  entryThreshold: number;
  nm1: FieldUi;
  nm2: FieldUi;
  n: FieldUi;
  result: QuotientResult | null;
  midpoint: number;
  midpointBreakdown: CehrBreakdown;
  email: string;
}

const EMPTY_BREAKDOWN: CehrBreakdown = {
  rfr: 0,
  base3: 0,
  base4: 0,
  amount3: 0,
  amount4: 0,
  rawTotal: 0,
  total: 0,
};

const failedPreviousDetail = (
  label: "N-1" | "N-2",
  value: number | null,
  threshold: number,
  status: CheckStatus,
) =>
  status === "failed" && value !== null
    ? `RFR ${label} = ${fmtEur(value)} > ${fmtEur(threshold)}`
    : undefined;

export const useCehrCalculator = ({
  yearN,
  situation,
  rfrN,
  rfrNm1,
  rfrNm2,
  assetTypes,
}: Inputs): CehrCalculatorView => {
  const allFilled = rfrN !== null && rfrNm1 !== null && rfrNm2 !== null;
  const entryThreshold = cehrEntryThreshold(situation);
  const statusFor = (field: "N" | "Nm1" | "Nm2") =>
    evaluateFieldStatus({ rfrN, rfrNm1, rfrNm2, situation, field });

  const statusNm1 = statusFor("Nm1");
  const statusNm2 = statusFor("Nm2");
  const statusN = statusFor("N");
  const detailNm1 = failedPreviousDetail(
    "N-1",
    rfrNm1,
    entryThreshold,
    statusNm1,
  );
  const detailNm2 = failedPreviousDetail(
    "N-2",
    rfrNm2,
    entryThreshold,
    statusNm2,
  );
  const detailN = (() => {
    if (statusN !== "failed" || rfrN === null) return undefined;
    if (rfrN <= entryThreshold) {
      return `RFR N = ${fmtEur(rfrN)} ≤ ${fmtEur(
        entryThreshold,
      )} (seuil CEHR) — aucune CEHR n'est due, le lissage est sans objet.`;
    }
    if (rfrNm1 !== null && rfrNm2 !== null) {
      return `RFR N = ${fmtEur(rfrN)} < 1,5 × moyenne (${fmtEur(
        1.5 * ((rfrNm1 + rfrNm2) / 2),
      )})`;
    }
    return undefined;
  })();

  const result = useMemo(() => {
    if (!allFilled) return null;
    return computeQuotient({
      rfrN: rfrN!,
      rfrNm1: rfrNm1!,
      rfrNm2: rfrNm2!,
      situation,
    });
  }, [allFilled, rfrN, rfrNm1, rfrNm2, situation]);

  const midpoint = result
    ? result.averagePrevious + (rfrN! - result.averagePrevious) / 2
    : 0;
  const midpointBreakdown = result
    ? computeCehr(midpoint, situation)
    : EMPTY_BREAKDOWN;

  const email = useMemo(() => {
    if (!result || !allFilled || !result.eligible || assetTypes.length === 0) {
      return "";
    }
    return buildCehrEmail({
      yearN,
      rfrN: rfrN!,
      rfrNm1: rfrNm1!,
      rfrNm2: rfrNm2!,
      quotient: result,
      assetTypes,
      situation,
    });
  }, [result, allFilled, yearN, rfrN, rfrNm1, rfrNm2, assetTypes, situation]);

  return {
    allFilled,
    entryThreshold,
    nm1: { status: statusNm1, detail: detailNm1 },
    nm2: { status: statusNm2, detail: detailNm2 },
    n: { status: statusN, detail: detailN },
    result,
    midpoint,
    midpointBreakdown,
    email,
  };
};
