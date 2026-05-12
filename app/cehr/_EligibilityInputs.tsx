import classNames from "classnames";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Section } from "@/components/ui/Section";
import { fmtEur, type FoyerSituation } from "@/lib/taxes/cehr";
import { RfrField } from "./_RfrField";
import type { CehrCalculatorView } from "./_useCehrCalculator";

const SITUATION_OPTIONS: Array<{ label: string; value: FoyerSituation }> = [
  { label: "Couple (marié·e / pacsé·e)", value: "couple" },
  { label: "Célibataire / divorcé·e / veuf·ve", value: "single" },
];

interface Props {
  yearN: number;
  yearOptions: Array<{ label: string; value: number }>;
  situation: FoyerSituation;
  rfrN: number | null;
  rfrNm1: number | null;
  rfrNm2: number | null;
  view: CehrCalculatorView;
  onYearChange: (y: number) => void;
  onSituationChange: (s: FoyerSituation) => void;
  onRfrNChange: (v: number | null) => void;
  onRfrNm1Change: (v: number | null) => void;
  onRfrNm2Change: (v: number | null) => void;
}

export const EligibilityInputs = ({
  yearN,
  yearOptions,
  situation,
  rfrN,
  rfrNm1,
  rfrNm2,
  view,
  onYearChange,
  onSituationChange,
  onRfrNChange,
  onRfrNm1Change,
  onRfrNm2Change,
}: Props) => (
  <Section title="Vos informations">
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-sm font-medium mb-2">Situation familiale</div>
        <ButtonGroup
          value={situation}
          variant="segmented"
          options={SITUATION_OPTIONS}
          onClick={onSituationChange}
        />
      </div>

      <RfrField
        label={
          <span className="flex items-center gap-2 flex-wrap">
            <span>RFR de l&apos;année concernée</span>
            <span className="flex items-center gap-1">
              <span className="text-xs font-normal text-gray-500">année :</span>
              <select
                value={String(yearN)}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className={classNames(
                  "bg-transparent border rounded px-2 py-0.5",
                  "text-sm font-semibold border-gray-300",
                  "hover:border-gray-400 focus:outline-none",
                  "cursor-pointer",
                )}
              >
                {yearOptions.map((opt) => (
                  <option key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </span>
          </span>
        }
        explanation={
          <>
            Le revenu fiscal de référence de l&apos;année concernée (celle de
            l&apos;avis d&apos;imposition que vous contestez) doit être{" "}
            <strong>au moins 1,5 fois</strong> la moyenne des RFR des deux
            années précédentes. C&apos;est l&apos;écart de revenu qui ouvre
            droit au lissage.
          </>
        }
        value={rfrN}
        onChange={onRfrNChange}
        placeholder="ex. 800 000"
        status={view.n.status}
        checkDetail={view.n.detail}
      />

      <RfrField
        label={`RFR ${yearN - 1} (N-1)`}
        explanation={
          <>
            Le RFR de l&apos;année précédant l&apos;année concernée doit être{" "}
            <strong>inférieur ou égal</strong> au seuil d&apos;entrée de la CEHR
            (<strong>{fmtEur(view.entryThreshold)}</strong> pour la situation
            choisie). Si vous étiez déjà soumis à la CEHR cette année-là, le
            lissage n&apos;est pas applicable.
          </>
        }
        value={rfrNm1}
        onChange={onRfrNm1Change}
        placeholder="ex. 100 000"
        status={view.nm1.status}
        checkDetail={view.nm1.detail}
      />

      <RfrField
        label={`RFR ${yearN - 2} (N-2)`}
        explanation={
          <>
            Même condition deux ans en arrière : le RFR doit être{" "}
            <strong>inférieur ou égal</strong> à{" "}
            <strong>{fmtEur(view.entryThreshold)}</strong>. Les deux années
            antérieures doivent être hors-CEHR pour que le revenu de
            l&apos;année N soit considéré comme exceptionnel par l&apos;article
            223 sexies II du CGI.
          </>
        }
        value={rfrNm2}
        onChange={onRfrNm2Change}
        placeholder="ex. 200 000"
        status={view.nm2.status}
        checkDetail={view.nm2.detail}
      />
    </div>
  </Section>
);
