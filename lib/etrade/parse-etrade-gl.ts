import type {
  GainAndLossEvent,
  GainAndLossEventXlsxRow,
  PlanType,
} from "./etrade.types";
import { getDateString, parseEtradeDate } from "@/lib/date";
import XLSX from "xlsx";

const toDateString = (rawDate: string) =>
  getDateString(parseEtradeDate(rawDate));

const toNumber = (rawNumber: string | number): number => {
  const result = typeof rawNumber === "string" ? Number(rawNumber) : rawNumber;
  if (isNaN(result)) {
    throw new Error(`invalid number: ${rawNumber}`);
  }

  return result;
};

const ensureDefined = <T>(value: T | undefined, key: string): T => {
  if (value === undefined || value === null || value === "") {
    throw new Error(`undefined value for ${key}`);
  }
  return value;
};

const parseEtradeGLRow = (row: GainAndLossEventXlsxRow): GainAndLossEvent => {
  const planType = row["Plan Type"];
  const symbol = row["Symbol"];
  const quantity = toNumber("Qty." in row ? row["Qty."] : row["Quantity"]);
  const dateGranted = toDateString(row["Grant Date"]);
  const dateAcquired = toDateString(row["Date Acquired"]);
  const dateSold = toDateString(row["Date Sold"]);
  const proceeds = toNumber(row["Proceeds Per Share"]);
  // FIXME: Adjusted cost from ETrade's G&L is the close price on day acquired,
  // France expects the opening price on day acquired.
  // See https://bofip.impots.gouv.fr/bofip/5654-PGP.html/identifiant%3DBOI-RSA-ES-20-20-20-20170724#:~:text=a.%20Actions%20cot%C3%A9es-,120,-La%20valeur%20%C3%A0
  const adjustedCost = toNumber(row["Adjusted Cost Basis Per Share"]);
  const acquisitionCost = toNumber(row["Acquisition Cost Per Share"]);
  // It's unclear why this is a string and not a number.
  const purchaseDateFairMktValue = toNumber(
    row["Purchase Date Fair Mkt. Value"],
  );
  // For now consider that a non-US qualified plan is FR qualified.
  // FIXME: this is actually wrong, ETrade doesn't fill in the "Qualified Plan" column for qualified RSU plans.
  const qualifiedIn = row["Qualified Plan"] === "Qualified" ? "us" : "fr";

  // Make sure each row is valid
  return {
    planType: ensureDefined(planType, "planType"),
    symbol: ensureDefined(symbol, "symbol"),
    quantity: ensureDefined(quantity, "quantity"),
    dateGranted: ensureDefined(dateGranted, "dateGranted"),
    dateAcquired: ensureDefined(dateAcquired, "dateAcquired"),
    dateSold: ensureDefined(dateSold, "dateSold"),
    proceeds: ensureDefined(proceeds, "proceeds"),
    adjustedCost: ensureDefined(adjustedCost, "adjustedCost"),
    acquisitionCost: ensureDefined(acquisitionCost, "acquisitionCost"),
    purchaseDateFairMktValue: ensureDefined(
      purchaseDateFairMktValue,
      "purchaseDateFairMktValue",
    ),
    qualifiedIn: ensureDefined(qualifiedIn, "qualifiedIn"),
  };
};

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
      data.push(parseEtradeGLRow(row));
    } catch (e) {
      return Promise.reject(
        `format of file '${file.name}' is not supported: ${e}`,
      );
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
