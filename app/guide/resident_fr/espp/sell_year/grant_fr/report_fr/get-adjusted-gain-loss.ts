import { ExchangeRate } from "@/hooks/use-fetch-exr";

export const getAdjustedGainLoss = (
  quantity: number,
  adjustedCost: number,
  proceeds: number,
  dateAcquiredExr: ExchangeRate,
  dateSoldExr: ExchangeRate,
) =>
  dateAcquiredExr.rate && dateSoldExr.rate
    ? (proceeds * quantity) / dateSoldExr.rate -
      (adjustedCost * quantity) / dateAcquiredExr.rate
    : null;
