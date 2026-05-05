import type { GainAndLossEventWithRates } from "@/lib/taxes/taxes-rules-fr";

export const isFrQualifiedSo = (event: GainAndLossEventWithRates): boolean =>
  event.planType === "SO" && event.qualifiedIn === "fr";

export const isUsQualifiedSo = (event: GainAndLossEventWithRates): boolean =>
  event.planType === "SO" && event.qualifiedIn === "us";

export const isEspp = (event: GainAndLossEventWithRates): boolean =>
  event.planType === "ESPP";

export const isFrQualifiedRsu = (event: GainAndLossEventWithRates): boolean =>
  event.planType === "RS" && event.qualifiedIn === "fr";

export const isUsQualifiedRsu = (event: GainAndLossEventWithRates): boolean =>
  event.planType === "RS" && event.qualifiedIn === "us";
