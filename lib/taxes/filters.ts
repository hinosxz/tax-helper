import type { GainAndLossEventWithRates } from "@/lib/taxes/taxes-rules-fr";

export const isFrQualifiedSo = (event: GainAndLossEventWithRates): boolean =>
  event.planType === "SO" && event.isFrQualified;

export const isFrNonQualifiedSo = (event: GainAndLossEventWithRates): boolean =>
  event.planType === "SO" && !event.isFrQualified;

export const isEspp = (event: GainAndLossEventWithRates): boolean =>
  event.planType === "ESPP";

export const isFrQualifiedRsu = (event: GainAndLossEventWithRates): boolean =>
  event.planType === "RS" && event.isFrQualified;

export const isFrNonQualifiedRsu = (
  event: GainAndLossEventWithRates,
): boolean => event.planType === "RS" && !event.isFrQualified;
