export type PlanType = "ESPP" | "RS" | "SO";
export type PlanQualification = "Qualified" | "Non-Qualified";

/**
 * Original format for the XLSX file rows in the Etrade Gain/Loss report.
 */
export interface GainAndLossEventXlsxRowPrior2025 {
  "Plan Type": PlanType;
  Symbol: string;
  "Qty.": number;
  "Date Acquired": string;
  "Date Sold": string;
  "Adjusted Cost Basis Per Share": number;
  "Acquisition Cost Per Share": number;
  "Purchase Date Fair Mkt. Value": string | number;
  "Proceeds Per Share": number;
  "Qualified Plan": PlanQualification;
  "Grant Date": string;
}
export interface GainAndLossEventXlsxRow2025 {
  "Plan Type": PlanType;
  Symbol: string;
  Quantity: number;
  "Date Acquired": string;
  "Date Sold": string;
  "Adjusted Cost Basis Per Share": number;
  "Acquisition Cost Per Share": number;
  "Purchase Date Fair Mkt. Value": string | number;
  "Proceeds Per Share": number;
  "Qualified Plan": PlanQualification;
  "Grant Date": string;
}

export type GainAndLossEventXlsxRow =
  | GainAndLossEventXlsxRowPrior2025
  | GainAndLossEventXlsxRow2025;

/**
 * Data format for a single sale event after parsing the Etrade Gain/Loss report.
 */
export interface GainAndLossEvent {
  planType: PlanType;
  symbol: string;
  quantity: number;
  dateGranted: string;
  dateAcquired: string;
  dateSold: string;
  /** Proceeds per share in USD: sell price. */
  proceeds: number;
  /**
   * Value when the share was acquired for US taxes.
   * Usually SYMBOL price at closing on time of acquisition.
   *
   * For French taxes, it should be the opening price of the day.
   * See https://bofip.impots.gouv.fr/bofip/5654-PGP.html/identifiant%3DBOI-RSA-ES-20-20-20-20170724#:~:text=120,au%20m%C3%AAme%20jour.
   */
  adjustedCost: number;
  /**
   * Acquisition cost per share in USD.
   * The price, in USD at which the share was acquired.
   *
   * This is 0 for RSUs, adjustedCost for ESPP and the grant price for SO.
   */
  acquisitionCost: number;
  /**
   * Fair market value of the share at the time of purchase.
   * This is used for ESPP or SO acquired before IPO.
   * ⚠️  This can be empty or 0, in this case, the `adjustedCost` is used.
   */
  purchaseDateFairMktValue: number;
  /**
  dateGranted: string;
  dateAcquired: string;
  dateSold: string;
  /** What kind of qualified plan is it? */
  qualifiedIn: "fr" | "us";
}

export interface BenefitHistoryEvent {
  planType: PlanType;
  dateVested: string;
  quantity: number;
  /** What kind of qualified plan is it? */
  qualified: "FR" | "US";
}
