import { GainAndLossEvent } from "@/lib/etrade/etrade.types";

export interface SaleEventData {
  quantity: number;
  proceeds: number;
  adjustedCost: number;
  dateAcquired: string;
  dateSold: string;
  rateAcquired: number | null;
  rateSold: number | null;
  /** Fraction of the adjusted cost from French source */
  fractionFr: number;
}

export const getDefaultData = (
  defaultDate: string,
  qualifiedIn: "fr" | "us",
): SaleEventData => ({
  quantity: 1,
  proceeds: 0,
  dateSold: defaultDate,
  dateAcquired: defaultDate,
  adjustedCost: 0,
  rateAcquired: null,
  rateSold: null,
  fractionFr: qualifiedIn === "fr" ? 1 : 0,
});

export const saleEventFromGainAndLossEvent = (
  data: GainAndLossEvent,
): SaleEventData => ({
  quantity: data.quantity,
  proceeds: data.proceeds,
  dateSold: data.dateSold,
  dateAcquired: data.dateAcquired,
  adjustedCost: data.adjustedCost,
  rateAcquired: null,
  rateSold: null,
  fractionFr: data.qualifiedIn === "fr" ? 1 : 0,
});
