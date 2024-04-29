import { ExchangeRate } from "@/hooks/use-fetch-exr";
import { GainAndLossEvent } from "@/lib/etrade/etrade.types";

export interface SaleEventData {
  quantity: number;
  proceeds: number;
  adjustedCost: number;
  dateAcquired: string;
  dateSold: string;
  rateAcquired: ExchangeRate;
  rateSold: ExchangeRate;
}

export const getDefaultData = (defaultDate: string): SaleEventData => ({
  quantity: 1,
  proceeds: 0,
  dateSold: defaultDate,
  dateAcquired: defaultDate,
  adjustedCost: 0,
  rateAcquired: { isFetching: true, rate: null, errorMessage: null },
  rateSold: { isFetching: true, rate: null, errorMessage: null },
});

export const saleEventFromGainAndLossEvent = (
  data: GainAndLossEvent,
): SaleEventData => ({
  quantity: data.quantity,
  proceeds: data.proceeds,
  dateSold: data.dateSold,
  dateAcquired: data.dateAcquired,
  adjustedCost: data.adjustedCost,
  rateAcquired: { isFetching: true, rate: null, errorMessage: null },
  rateSold: { isFetching: true, rate: null, errorMessage: null },
});
