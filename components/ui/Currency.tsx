import { formatNumber } from "@/lib/format-number";

interface CurrencyProps {
  value: number | null;
  unit: "eur" | "usd";
  /** Number of decimal places to display, default 2 */
  precision?: number;
}

export const Currency = ({ value, unit, precision = 2 }: CurrencyProps) => {
  const formattedValue = formatNumber(value, precision);
  const unitSymbol = unit === "usd" ? "$" : "€";
  return (
    <span className="font-semibold">
      {formattedValue} {unitSymbol}
    </span>
  );
};
