const ExtraZerosRegex = /(\.)(\d+[1-9])?(0*)$/;
const extraZeroReplacer = (_: string, p1: string, p2: string = "00") =>
  `${p1}${p2}`;
/**
 * Format a number with a fixes 2 decimal places.
 *
 * ```
 * formatNumber(1) // "1.00"
 * formatNumber(1.234) // "1.23"
 * formatNumber(null) // "–"
 * ```
 */
export const formatNumber = (value: number | null, precision = 2): string => {
  return (
    value?.toFixed(precision).replace(ExtraZerosRegex, extraZeroReplacer) ?? "–"
  );
};

/**
 * Floors a number with `digits` digits.
 *
 * ```
 * floorNumber(1.234) // 1.23
 * floorNumber(1.234, 3) // 1.234
 * floorNumber(1, 2) // 1
 * ```
 */
export const floorNumber = (value: number, digits: number = 2): number => {
  const factor = Math.pow(10, digits);
  return Math.floor(value * factor) / factor;
};

/**
 * Ceils a number with `digits` digits.
 *
 * ```
 * ceilNumber(1.234) // 1.24
 * ceilNumber(1.234, 3) // 1.234
 * ceilNumber(1, 2) // 1
 * ```
 */
export const ceilNumber = (value: number, digits: number = 2): number => {
  const factor = Math.pow(10, digits);
  return Math.ceil(value * factor) / factor;
};

/**
 * Rounds a number with `digits` digits.
 *
 * ```
 * roundNumber(1.234) // 1.23
 * roundNumber(1.235) // 1.24
 * roundNumber(1.234, 3) // 1.234
 * roundNumber(1, 2) // 1
 * ```
 */
export const roundNumber = (value: number, digits: number = 2): number => {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
};
