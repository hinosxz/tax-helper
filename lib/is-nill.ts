// Returns true if value is null or undefined
export const isNill = (value: unknown): value is null | undefined =>
  value == null;
