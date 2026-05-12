import { useState, type ReactNode } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { Section } from "@/components/ui/Section";
import {
  fmtEur,
  type CehrBreakdown,
  type QuotientResult,
} from "@/lib/taxes/cehr";

interface Props {
  result: QuotientResult;
  rfrN: number;
  rfrNm1: number;
  rfrNm2: number;
  midpoint: number;
  midpointBreakdown: CehrBreakdown;
}

interface ComparisonRow {
  label: ReactNode;
  withoutQuotient: number;
  withQuotient: number;
  showQuotientMultiplier?: boolean;
}

const QuotientMultiplierBadge = () => (
  <span
    className="ml-1 text-xs font-semibold text-green-700"
    title="Montant doublé par le mécanisme du quotient"
    aria-label="montant doublé par le mécanisme du quotient"
  >
    quotient ×2
  </span>
);

export const CehrComparisonTable = ({
  result,
  rfrN,
  rfrNm1,
  rfrNm2,
  midpoint,
  midpointBreakdown,
}: Props) => {
  const [showSteps, setShowSteps] = useState(false);
  const excess = rfrN - result.averagePrevious;
  const halfExcess = excess / 2;
  const rows: ComparisonRow[] = [
    {
      label: "Base 3 %",
      withoutQuotient: result.cehrWithoutQuotient.base3,
      withQuotient: midpointBreakdown.base3,
    },
    {
      label: "Base 4 %",
      withoutQuotient: result.cehrWithoutQuotient.base4,
      withQuotient: midpointBreakdown.base4,
    },
    {
      label: "CEHR à 3 %",
      withoutQuotient: result.cehrWithoutQuotient.amount3,
      withQuotient: midpointBreakdown.amount3 * 2,
      showQuotientMultiplier: true,
    },
    {
      label: "CEHR à 4 %",
      withoutQuotient: result.cehrWithoutQuotient.amount4,
      withQuotient: midpointBreakdown.amount4 * 2,
      showQuotientMultiplier: true,
    },
  ];
  const steps: ReactNode[] = [
    <>
      Moyenne des deux années précédentes :{" "}
      <span className="font-mono">
        ({fmtEur(rfrNm2)} + {fmtEur(rfrNm1)}) / 2 ={" "}
        <strong>{fmtEur(result.averagePrevious)}</strong>
      </span>
    </>,
    <>
      Fraction excédentaire :{" "}
      <span className="font-mono">
        {fmtEur(rfrN)} − {fmtEur(result.averagePrevious)} ={" "}
        <strong>{fmtEur(excess)}</strong>
      </span>
    </>,
    <>
      Fraction divisée par deux :{" "}
      <span className="font-mono">
        {fmtEur(excess)} / 2 = <strong>{fmtEur(halfExcess)}</strong>
      </span>
    </>,
    <>
      Base lissée :{" "}
      <span className="font-mono">
        {fmtEur(result.averagePrevious)} + {fmtEur(halfExcess)} ={" "}
        <strong className="text-green-700">{fmtEur(midpoint)}</strong>
      </span>
    </>,
  ];

  return (
    <Section title="Comparaison du calcul CEHR">
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3 font-semibold">Élément</th>
              <th className="p-3 font-semibold text-right">Sans quotient</th>
              <th className="p-3 font-semibold text-right bg-green-50">
                Avec quotient
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="p-3 text-gray-600">
                <button
                  type="button"
                  onClick={() => setShowSteps((s) => !s)}
                  className="flex items-center gap-1 hover:text-gray-900 cursor-pointer"
                >
                  Base imposable
                  {showSteps ? (
                    <ChevronUpIcon className="h-3 w-3" />
                  ) : (
                    <ChevronDownIcon className="h-3 w-3" />
                  )}
                </button>
              </td>
              <td className="p-3 text-right">{fmtEur(rfrN)}</td>
              <td className="p-3 text-right bg-green-50">{fmtEur(midpoint)}</td>
            </tr>
            {showSteps && (
              <tr className="bg-gray-50">
                <td colSpan={3} className="p-4">
                  <div className="text-xs text-gray-600 mb-2">
                    Détail du calcul de la <strong>base lissée</strong> (colonne
                    « Avec quotient ») :
                  </div>
                  <ol className="list-decimal pl-6 space-y-1 text-xs text-gray-700">
                    {steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </td>
              </tr>
            )}
            {rows.map(
              (
                {
                  label,
                  withoutQuotient,
                  withQuotient,
                  showQuotientMultiplier,
                },
                index,
              ) => (
                <tr key={index}>
                  <td className="p-3 text-gray-600">{label}</td>
                  <td className="p-3 text-right">{fmtEur(withoutQuotient)}</td>
                  <td className="p-3 text-right bg-green-50">
                    <span className="inline-flex items-baseline justify-end">
                      {fmtEur(withQuotient)}
                      {showQuotientMultiplier && <QuotientMultiplierBadge />}
                    </span>
                  </td>
                </tr>
              ),
            )}
            <tr className="bg-gray-50">
              <td className="p-3 font-semibold">CEHR totale</td>
              <td className="p-3 text-right font-semibold">
                {fmtEur(result.cehrWithoutQuotient.total)}
              </td>
              <td className="p-3 text-right font-semibold bg-green-100">
                {fmtEur(result.cehrWithQuotient)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 p-4 rounded-md bg-green-100 border border-green-300 flex items-baseline justify-between flex-wrap gap-2">
        <span className="text-sm text-green-900">
          Gain total grâce au lissage
          <span className="text-xs text-green-700 ml-2">
            (CEHR sans quotient − CEHR avec quotient)
          </span>
        </span>
        <span className="text-xl font-bold text-green-700">
          {fmtEur(result.savings)}
        </span>
      </div>
    </Section>
  );
};
