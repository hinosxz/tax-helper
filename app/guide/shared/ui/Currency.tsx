import { formatNumber } from "@/lib/format-number";

interface CurrencyProps {
  value: number | null;
  unit: "eur" | "usd";
}

export const Currency = ({ value, unit }: CurrencyProps) => {
  const formattedValue = formatNumber(value);
  const unitSymbol = unit === "usd" ? "$" : "€";
  return (
    <span className="font-semibold">
      {formattedValue} {unitSymbol}
    </span>
  );
};
