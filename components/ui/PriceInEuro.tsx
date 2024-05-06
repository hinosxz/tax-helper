import { Currency } from "@/app/guide/shared/ui/Currency";
import { Tooltip } from "./Tooltip";

export interface PriceInEuroProps {
  /**
   * Optionally provide a value in EUR to use instead of the computed one.
   *
   * This is useful to avoid rounding differences when the value is computed
   * from USD.
   */
  eur?: number;
  /**
   * Amount in USD, will be automatically converted if no `eur` value is
   * provided
   */
  usd: number;
  /** Conversion rate from USD to EUR: 1 USD = rate EUR */
  rate: number;
  /** Date of the conversion rate */
  date: string;
}

export const PriceInEuro: React.FunctionComponent<PriceInEuroProps> = ({
  eur,
  usd,
  rate,
  date,
}) => {
  const priceInEuro = eur ?? usd / rate;

  return (
    <Tooltip
      content={
        <div>
          <Currency value={usd} unit="usd" /> at {rate} on {date}
        </div>
      }
    >
      <span>
        <Currency value={priceInEuro} unit="eur" />
        <span className="hidden print:inline">
          {" "}
          (<Currency value={usd} unit="usd" /> at {rate} $/€ on {date})
        </span>
      </span>
    </Tooltip>
  );
};
