import { sendErrorToast } from "@/app/guide/shared/ui/Toast";
import type { SaleEventData } from "@/lib/data";

const SEPARATOR = ",";
const COLUMNS = [
  "Quantity",
  "% Cost From French Origin",
  "Date Acquired",
  "Currency Rate",
  "Adjusted Cost Basis / Share",
  "Adjusted Cost Basis / Share (€)",
  "Adjusted Cost Basis From French Origin / Share (€)",
  "Date Sold",
  "Currency Rate",
  "Proceeds / Share",
  "Proceeds / Share (€)",
  "Adjusted Cost Basis (€)",
  "Adjusted Cost Basis From French Origin (€)",
  "Proceeds (€)",
  "Adjusted Gain / Loss (€)",
].join(SEPARATOR);

const downloadBlob = (blob: Blob, fileName?: string) => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || `tax_export_${new Date().toISOString()}.csv`;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportToCsv = (data: SaleEventData[]): void => {
  const csvData: string[] = [COLUMNS];
  for (const event of data) {
    if (!event.rateAcquired || !event.rateSold) {
      sendErrorToast("can't export to CSV if exchange rates are unavailable");
      return;
    }

    csvData.push(
      [
        event.quantity,
        event.fractionFr,
        event.dateAcquired,
        event.rateAcquired,
        event.adjustedCost,
        event.adjustedCost / event.rateAcquired,
        (event.adjustedCost * event.fractionFr) / event.rateAcquired,
        event.dateSold,
        event.rateSold,
        event.proceeds,
        event.proceeds / event.rateSold,
        (event.adjustedCost * event.quantity) / event.rateAcquired,
        (event.adjustedCost * event.quantity * event.fractionFr) /
          event.rateAcquired,
        (event.proceeds * event.quantity) / event.rateSold,
        event.proceeds / event.rateSold -
          (event.adjustedCost / event.rateAcquired) * event.quantity,
      ].join(SEPARATOR),
    );
  }
  const blob = new Blob([csvData.join("\n")], { type: "text/csv" });
  downloadBlob(blob);
};
