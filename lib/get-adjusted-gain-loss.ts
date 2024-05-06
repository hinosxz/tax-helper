export function getAdjustedGainLoss(
  quantity: number,
  adjustedCost: number,
  proceeds: number,
  rateAcquired: null,
  rateSold: null,
): number | null;
export function getAdjustedGainLoss(
  quantity: number,
  adjustedCost: number,
  proceeds: number,
  rateAcquired: number,
  rateSold: number,
): number;
export function getAdjustedGainLoss(
  quantity: number,
  adjustedCost: number,
  proceeds: number,
  rateAcquired: number | null,
  rateSold: number | null,
): number | null;
export function getAdjustedGainLoss(
  quantity: number,
  adjustedCost: number,
  proceeds: number,
  rateAcquired: number | null,
  rateSold: number | null,
): number | null {
  if (rateAcquired && rateSold) {
    return (
      (proceeds * quantity) / rateSold -
      (adjustedCost * quantity) / rateAcquired
    );
  }
  return null;
}
