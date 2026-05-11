"use client";

import { useState } from "react";
import { fmtEur, type FoyerSituation } from "@/lib/taxes/cehr";
import { type AssetType } from "@/lib/taxes/cehr-template";
import { Header } from "./_Header";
import { EligibilityInputs } from "./_EligibilityInputs";
import { CehrComparisonTable } from "./_CehrComparisonTable";
import { AssetTypeSelector } from "./_AssetTypeSelector";
import { EmailPreview } from "./_EmailPreview";
import { References } from "./_References";
import { useCehrCalculator } from "./_useCehrCalculator";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i).map(
  (y) => ({ label: String(y), value: y }),
);

export default function CehrPage() {
  const [yearN, setYearN] = useState<number>(CURRENT_YEAR - 1);
  const [situation, setSituation] = useState<FoyerSituation>("single");
  const [rfrN, setRfrN] = useState<number | null>(null);
  const [rfrNm1, setRfrNm1] = useState<number | null>(null);
  const [rfrNm2, setRfrNm2] = useState<number | null>(null);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>(["rsu"]);

  const toggleAsset = (id: AssetType) => {
    setAssetTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const view = useCehrCalculator({
    yearN,
    situation,
    rfrN,
    rfrNm1,
    rfrNm2,
    assetTypes,
  });

  return (
    <div className="flex flex-col gap-8 px-4">
      <Header />

      <EligibilityInputs
        yearN={yearN}
        yearOptions={YEAR_OPTIONS}
        situation={situation}
        rfrN={rfrN}
        rfrNm1={rfrNm1}
        rfrNm2={rfrNm2}
        view={view}
        onYearChange={setYearN}
        onSituationChange={setSituation}
        onRfrNChange={setRfrN}
        onRfrNm1Change={setRfrNm1}
        onRfrNm2Change={setRfrNm2}
      />

      {view.result && !view.result.eligible && (
        <div className="p-3 rounded-md bg-yellow-50 text-sm border border-yellow-200">
          Le système du quotient n&apos;est pas applicable (voir les indications
          sur les champs ci-dessus). La CEHR reste due au montant calculé sans
          lissage :{" "}
          <span className="font-semibold">
            {fmtEur(view.result.cehrWithoutQuotient.total)}
          </span>
          .
        </div>
      )}

      {view.result?.eligible && (
        <CehrComparisonTable
          result={view.result}
          rfrN={rfrN!}
          rfrNm1={rfrNm1!}
          rfrNm2={rfrNm2!}
          midpoint={view.midpoint}
          midpointBreakdown={view.midpointBreakdown}
        />
      )}

      {view.result?.eligible && (
        <AssetTypeSelector assetTypes={assetTypes} onToggle={toggleAsset} />
      )}

      {view.email && <EmailPreview email={view.email} />}

      <References />
    </div>
  );
}
