import {
  GainAndLossEvent,
  GainAndLossEventXlsxRow,
  PlanType,
} from "./etrade.types";
import { getDateString, parseEtradeDate } from "@/lib/date";
import XLSX from "xlsx";

const toDateString = (rawDate: string) =>
  getDateString(parseEtradeDate(rawDate));

export const parseEtradeGL = async (
  file: File,
): Promise<GainAndLossEvent[]> => {
  const data: GainAndLossEvent[] = [];
  const fileAsArrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(fileAsArrayBuffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 2 });
  // First row is summary
  for (let rowIdx = 1; rowIdx < rawData.length; rowIdx++) {
    const row = rawData[rowIdx] as GainAndLossEventXlsxRow;
    try {
      data.push({
        planType: row["Plan Type"],
        quantity: row["Qty."],
        proceeds: row["Proceeds Per Share"],
        adjustedCost: row["Adjusted Cost Basis Per Share"],
        dateAcquired: toDateString(row["Date Acquired"]),
        dateSold: toDateString(row["Date Sold"]),
        // For now consider that a non-US qualified plan is FR qualified.
        isPlanFrQualified: row["Qualified Plan"] !== "Qualified",
      });
    } catch {
      return Promise.reject(`format of file '${file.name}' is not supported`);
    }
  }
  return Promise.resolve(data);
};

/**
 * Create a filter function from provided filters.
 *
 * To get every FR qualified stock options events from the Etrade Gain/Loss
 * report:
 *
 * ```ts
 * const isFrQualifiedStock = createEtradeGLFilter({
 *   planType: "SO",
 *   isPlanFrQualified: true
 * });
 *
 * const frQualifiedStockEvents = gainAndLossEvents.filter(isFrQualifiedStock);
 * ```
 */
export const createEtradeGLFilter = (filter: {
  planType?: PlanType;
  isPlanFrQualified?: boolean;
}) => {
  const filterKeys = Object.keys(filter) as (keyof typeof filter)[];
  return function filterEtradeGLFilter(event: GainAndLossEvent): boolean {
    return filterKeys.every((key) => {
      if (filter[key] === undefined) {
        return true;
      }
      return event[key] === filter[key];
    });
  };
};
