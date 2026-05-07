import { CopyButton } from "@/components/ui/CopyButton";
import { Fragment } from "react";

const EMPTY_CELL = " ";

const PAGE_11_LABELS = {
  line1133Description:
    "Valeurs mobilières, droits sociaux, titres assimilés sans abattement et éligibles à l'abattement de droit commun",
  titresA: "Titres A",
  titresB: "Titres B",
  titresC: "Titres C",
  totaux: "Totaux",
};

export const AutomaticReportingTable: React.FunctionComponent<{
  gains: number;
  losses: number;
}> = ({ gains, losses }) => {
  const roundedGains = Math.floor(gains);
  const roundedLosses = Math.floor(losses);
  const total = roundedGains - roundedLosses;
  const rows = [
    {
      label: PAGE_11_LABELS.titresA,
      gains: roundedGains,
      losses: roundedLosses > 0 ? roundedLosses : EMPTY_CELL,
      subtotal: total,
      adjustment: EMPTY_CELL,
      total,
      highlight: true,
    },
    {
      label: PAGE_11_LABELS.titresB,
      gains: EMPTY_CELL,
      losses: EMPTY_CELL,
      subtotal: EMPTY_CELL,
      adjustment: EMPTY_CELL,
      total: EMPTY_CELL,
      highlight: false,
    },
    {
      label: PAGE_11_LABELS.titresC,
      gains: EMPTY_CELL,
      losses: EMPTY_CELL,
      subtotal: EMPTY_CELL,
      adjustment: EMPTY_CELL,
      total: EMPTY_CELL,
      highlight: false,
    },
  ];

  return (
    <div className="automatic-reporting-print-root mt-4 overflow-x-auto p-3 sm:p-4 bg-blue-200 print:border print:overflow-x-visible print:overflow-y-visible">
      <div className="automatic-reporting-print-inner min-w-[760px] pr-3 sm:min-w-[900px] sm:pr-4">
        <div className="mb-3 text-base leading-relaxed sm:mb-4">
          <span className="font-bold text-black">1133</span>{" "}
          {PAGE_11_LABELS.line1133Description}
        </div>
        <div className="grid grid-cols-[130px_1fr_20px_1fr_20px_1fr_20px_1fr_20px_1fr] items-center gap-y-2 sm:grid-cols-[160px_1fr_28px_1fr_28px_1fr_28px_1fr_28px_1fr]">
          {rows.map((row) => (
            <Fragment key={row.label}>
              <div
                className={
                  row.highlight ? "text-base font-semibold" : "text-base"
                }
              >
                {row.label}
              </div>
              <Form2074Cell
                value={row.gains}
                copyValue={row.highlight ? roundedGains : undefined}
              />
              <div className="text-center text-base font-medium text-slate-700">
                -
              </div>
              <Form2074Cell
                value={row.losses}
                copyValue={
                  row.highlight && roundedLosses > 0 ? roundedLosses : undefined
                }
              />
              <div className="text-center text-base font-medium text-slate-700">
                =
              </div>
              <Form2074Cell value={row.subtotal} />
              <div className="text-center text-base font-medium text-slate-700">
                -
              </div>
              <Form2074Cell value={row.adjustment} />
              <div className="text-center text-base font-medium text-slate-700">
                =
              </div>
              <Form2074Cell value={row.total} />
            </Fragment>
          ))}
          <div className="pt-3 text-base font-semibold">
            {PAGE_11_LABELS.totaux}
          </div>
          <div className="col-span-8" />
          <div className="pt-3">
            <Form2074Cell value={total} emphasize />
          </div>
          <div className="col-span-9" />
          <div className="pt-2 text-center text-sm font-medium text-blue-800">
            Automatically reported to 3VG
          </div>
        </div>
      </div>
    </div>
  );
};

const Form2074Cell: React.FunctionComponent<{
  value: number | string;
  copyValue?: number;
  emphasize?: boolean;
}> = ({ value, copyValue, emphasize }) => {
  if (copyValue !== undefined) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex h-[30px] min-w-[7rem] items-center justify-end border border-black bg-white px-3 text-right text-base">
          {copyValue}
        </span>
        <CopyButton value={copyValue} />
      </div>
    );
  }

  return (
    <div
      className={`flex h-[30px] min-w-[7rem] items-center justify-end border border-black bg-white px-3 text-right text-base ${
        emphasize ? "font-semibold" : ""
      }`}
    >
      {value}
    </div>
  );
};
