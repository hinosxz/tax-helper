import type { BenefitHistoryEvent } from "./etrade.types";

export const parseEtradeBenefits = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  file: File,
): Promise<BenefitHistoryEvent[]> => {
  // Parsing of benefits is a level higher than parsing of gains and losses.
  // let's keep it for later.
  throw new Error("Not implemented");
};
