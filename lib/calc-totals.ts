import type { SaleEventData } from "@/lib/data";
import { getAdjustedGainLoss } from "./get-adjusted-gain-loss";

export interface Totals {
  gain: number;
  loss: number;
  income: number;
  incomeFr: number;
  proceeds: number;
}

export const calcTotals = (events: SaleEventData[]): Totals | null => {
  const totals = events.reduce<Totals | null>((acc, e) => {
    if (e.rateAcquired === null || e.rateSold === null) {
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

    totals.income += (e.adjustedCost * e.quantity) / e.rateAcquired;
    totals.incomeFr +=
      (e.adjustedCost * e.quantity * e.fractionFr) / e.rateAcquired;
    totals.proceeds += (e.proceeds * e.quantity) / e.rateSold;

    // Compute gain / loss
    const gainLoss = getAdjustedGainLoss(
      e.quantity,
      e.adjustedCost,
      e.proceeds,
      e.rateAcquired,
      e.rateSold,
    );
    if (gainLoss > 0) {
      totals.gain += gainLoss;
    } else if (gainLoss < 0) {
      totals.loss += gainLoss;
    }

    return totals;
  }, null);

  // Remove potential loss from French fraction of income to report,
  // c.f. https://bofip.impots.gouv.fr/bofip/5654-PGP.html/identifiant%3DBOI-RSA-ES-20-20-20-20170724#:~:text=de%20cession%20r%C3%A9alis%C3%A9e.-,190,-La%20moins%2Dvalue
  if (totals) {
    const gainLoss = totals.gain + totals.loss;
    if (gainLoss < 0) {
      const ratioFr = totals.incomeFr / totals.income;
      totals.incomeFr += ratioFr * gainLoss;
    }
  }

  return totals;
};
