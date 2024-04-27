import { ExchangeRate } from "@/hooks/use-fetch-exr";

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
