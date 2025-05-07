import type {
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
        symbol: row["Symbol"],
        quantity: row["Qty."],
        proceeds: row["Proceeds Per Share"],
        dateGranted: toDateString(row["Grant Date"]),
        // FIXME: Adjusted cost from ETrade's G&L is the close price on day acquired,
        // France expects the opening price on day acquired.
        // See https://bofip.impots.gouv.fr/bofip/5654-PGP.html/identifiant%3DBOI-RSA-ES-20-20-20-20170724#:~:text=a.%20Actions%20cot%C3%A9es-,120,-La%20valeur%20%C3%A0
        adjustedCost: row["Adjusted Cost Basis Per Share"],
        acquisitionCost: row["Acquisition Cost Per Share"],
        // It's unclear why this is a string and not a number.
        purchaseDateFairMktValue: Number(row["Purchase Date Fair Mkt. Value"]),
        dateAcquired: toDateString(row["Date Acquired"]),
        dateSold: toDateString(row["Date Sold"]),
        // For now consider that a non-US qualified plan is FR qualified.
        qualifiedIn: row["Qualified Plan"] === "Qualified" ? "us" : "fr",
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
 *   qualifiedIn: "fr",
 * });
 *
 * const frQualifiedStockEvents = gainAndLossEvents.filter(isFrQualifiedStock);
 * ```
 */
export const createEtradeGLFilter = (filter: {
  planType?: PlanType;
  qualifiedIn?: "fr" | "us";
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
