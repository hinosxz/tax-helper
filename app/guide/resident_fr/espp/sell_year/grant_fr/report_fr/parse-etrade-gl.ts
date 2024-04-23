import { SaleEventData } from "@/app/guide/shared/lib/data";
import { getDateString } from "@/app/guide/shared/lib/date";
import XLSX from "xlsx";

type PlanType = "ESPP" | "RS";

interface Row {
  "Plan Type": PlanType;
  "Qty.": number;
  "Date Acquired": string;
  "Date Sold": string;
  "Adjusted Cost Basis Per Share": number;
  "Proceeds Per Share": number;
}

const toDateString = (rawDate: string) =>
  getDateString(new Date(Date.parse(rawDate)));

export const parseEtradeGL = async (
  file: File,
  stockType: PlanType
): Promise<SaleEventData[]> => {
  const data: SaleEventData[] = [];
  const fileAsArrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(fileAsArrayBuffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 2 });
  // First row is summary
  for (let rowIdx = 1; rowIdx < rawData.length; rowIdx++) {
    const row = rawData[rowIdx] as Row;
    try {
      if (row["Plan Type"] === stockType) {
        data.push({
          quantity: row["Qty."],
          proceeds: row["Proceeds Per Share"],
          adjustedCost: row["Adjusted Cost Basis Per Share"],
          dateAcquired: toDateString(row["Date Acquired"]),
          dateSold: toDateString(row["Date Sold"]),
          rateAcquired: 1,
          rateSold: 1,
        });
      }
    } catch {
      return Promise.reject(`format of file '${file.name}' is not supported`);
    }
  }
  return Promise.resolve(data);
};
