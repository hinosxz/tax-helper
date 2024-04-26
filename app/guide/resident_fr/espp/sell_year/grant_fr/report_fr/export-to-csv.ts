import { SaleEventData } from "@/app/guide/shared/lib/data";

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
    csvData.push(
      [
        event.quantity.toString(),
        event.dateAcquired,
        event.rateAcquired.toString(),
        event.adjustedCost.toString(),
        (event.adjustedCost / event.rateAcquired).toString(),
        event.dateSold,
        event.rateSold.toString(),
        event.proceeds.toString(),
        (event.proceeds / event.rateSold).toString(),
        ((event.adjustedCost * event.quantity) / event.rateAcquired).toString(),
        ((event.proceeds * event.quantity) / event.rateSold).toString(),
        (
          event.proceeds / event.rateSold -
          (event.adjustedCost / event.rateAcquired) * event.quantity
        ).toString(),
      ].join(SEPARATOR)
    );
  }
  const blob = new Blob([csvData.join("\n")], { type: "text/csv" });
  downloadBlob(blob);
};
