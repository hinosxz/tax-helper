import { SaleEventData } from "@/lib/data";
import { getAdjustedGainLoss } from "./get-adjusted-gain-loss";

export const calcTotalGainLoss = (events: SaleEventData[]) =>
  events.reduce<[number | null, number | null]>(
    ([gain, loss], e) => {
      const gainLoss = getAdjustedGainLoss(
        e.quantity,
        e.adjustedCost,
        e.proceeds,
        e.rateAcquired,
        e.rateSold,
      );
      if (gainLoss !== null) {
        if (gainLoss > 0) {
          return [(gain ?? 0) + gainLoss, loss ?? 0];
        } else if (gainLoss < 0) {
          return [gain ?? 0, (loss ?? 0) + gainLoss];
        }
        return [gain ?? 0, loss ?? 0];
      }
      return [gain, loss];
    },
    [null, null],
  );
