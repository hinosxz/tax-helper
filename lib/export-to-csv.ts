import { sendErrorToast } from "@/app/guide/shared/ui/Toast";
import type { SaleEventData } from "@/lib/data";

const SEPARATOR = ",";
const COLUMNS = [
  "Quantity",
  "Date Acquired",
  "Currency Rate",
  "Adjusted Cost Basis / Share",
  "Adjusted Cost Basis / Share (€)",
  "Date Sold",
  "Currency Rate",
  "Proceeds / Share",
  "Proceeds / Share (€)",
  "Adjusted Cost Basis (€)",
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
    if (!event.rateAcquired.rate || !event.rateSold.rate) {
      sendErrorToast("can't export to CSV if exchange rates are unavailable");
      return;
    }

    const rateAcquired = event.rateAcquired.rate;
    const rateSold = event.rateSold.rate;
    csvData.push(
      [
        event.quantity.toString(),
        event.dateAcquired,
        rateAcquired.toString(),
        event.adjustedCost.toString(),
        (event.adjustedCost / rateAcquired).toString(),
        event.dateSold,
        rateSold.toString(),
        event.proceeds.toString(),
        (event.proceeds / rateSold).toString(),
        ((event.adjustedCost * event.quantity) / rateAcquired).toString(),
        ((event.proceeds * event.quantity) / rateSold).toString(),
        (
          event.proceeds / rateSold -
          (event.adjustedCost / rateAcquired) * event.quantity
        ).toString(),
      ].join(SEPARATOR),
    );
  }
  const blob = new Blob([csvData.join("\n")], { type: "text/csv" });
  downloadBlob(blob);
};
