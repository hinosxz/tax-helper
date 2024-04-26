export type PlanType = "ESPP" | "RS" | "SO";
export type PlanQualification = "Qualified" | "Non-Qualified";

/**
 * Original format for the XLSX file rows in the Etrade Gain/Loss report.
 */
export interface GainAndLossEventXlsxRow {
  "Plan Type": PlanType;
  "Qty.": number;
  "Date Acquired": string;
  "Date Sold": string;
  "Adjusted Cost Basis Per Share": number;
  "Proceeds Per Share": number;
  "Qualified Plan": PlanQualification;
}

/**
 * Data format for a single sale event after parsing the Etrade Gain/Loss report.
 */
export interface GainAndLossEvent {
  planType: PlanType;
  quantity: number;
  proceeds: number;
  adjustedCost: number;
  dateAcquired: string;
  dateSold: string;
  isPlanUsQualified: boolean;
  isPlanFrQualified: boolean;
}
