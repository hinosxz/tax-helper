interface CurrencyProps {
  value: number | null;
  unit: "eur" | "usd";
}

export const Currency = ({ value, unit }: CurrencyProps) => {
  const formattedValue = value?.toFixed(2) ?? "–";
  const unitSymbol = unit === "usd" ? "$" : "€";
  return (
    <span className="font-semibold">
      {formattedValue} {unitSymbol}
    </span>
  );
};
