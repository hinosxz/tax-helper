import type { SaleEventData } from "@/lib/data";
import { getAdjustedGainLoss } from "./get-adjusted-gain-loss";

export interface Totals {
  gain: number;
  loss: number;
  income: number;
  incomeFr: number;
  proceeds: number;
}

export const calcTotals = (events: SaleEventData[]): Totals | null =>
  events.reduce<Totals | null>((acc, e) => {
    if (e.rateAcquired.rate === null || e.rateSold.rate === null) {
      return acc;
    }

    const totals: Totals =
      acc === null
        ? {
            gain: 0,
            loss: 0,
            income: 0,
            incomeFr: 0,
            proceeds: 0,
          }
        : { ...acc };

    totals.income += (e.adjustedCost * e.quantity) / e.rateAcquired.rate;
    totals.incomeFr +=
      (e.adjustedCost * e.quantity * e.fractionFr) / e.rateAcquired.rate;
    totals.proceeds += (e.proceeds * e.quantity) / e.rateSold.rate;

    // Compute gain / loss
    const gainLoss = getAdjustedGainLoss(
      e.quantity,
      e.adjustedCost,
      e.proceeds,
      e.rateAcquired.rate,
      e.rateSold.rate,
    );
    if (gainLoss > 0) {
      totals.gain += gainLoss;
    } else if (gainLoss < 0) {
      totals.loss += gainLoss;
    }

    return totals;
  }, null);
