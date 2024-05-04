import { NumberField, DateField } from "@/app/guide/shared/ui/Field";
import { ExchangeRate, useExchangeRates } from "@/hooks/use-fetch-exr";
import { useEffect, useMemo } from "react";
import { getAdjustedGainLoss } from "@/lib/get-adjusted-gain-loss";

interface SaleEventProps {
  maxDate: string;

  quantity: number;
  setQuantity: (value: number) => void;

  adjustedCost: number;
  setAdjustedCost: (value: number) => void;

  proceeds: number;
  setProceeds: (value: number) => void;

  dateAcquired: string;
  setDateAcquired: (value: string) => void;

  dateSold: string;
  setDateSold: (value: string) => void;

  setRateAcquired: (value: ExchangeRate) => void;
  setRateSold: (value: ExchangeRate) => void;
}

export const SaleEvent = ({
  maxDate,
  quantity,
  setQuantity,
  adjustedCost,
  setAdjustedCost,
  proceeds,
  setProceeds,
  dateAcquired,
  setDateAcquired,
  dateSold,
  setDateSold,
  setRateAcquired,
  setRateSold,
}: SaleEventProps) => {
  const { responses } = useExchangeRates([dateAcquired, dateSold]);

  // Shape response in the ExchangeRate format
  const { dateAcquiredExr, dateSoldExr } = useMemo(() => {
    const dateAcquiredExr = {
      rate: responses[dateAcquired]?.data ?? null,
      isFetching: responses[dateAcquired]?.isFetching ?? true,
      errorMessage: responses[dateAcquired]?.isError
        ? "failed extracting rate from api response"
        : null,
    };
    const dateSoldExr = {
      rate: responses[dateSold]?.data ?? null,
      isFetching: responses[dateSold]?.isFetching ?? true,
      errorMessage: responses[dateSold]?.isError
        ? "failed extracting rate from api response"
        : null,
    };

    return { dateAcquiredExr, dateSoldExr };
  }, [dateAcquired, dateSold, responses]);

  // Store copies in state for parent to access
  useEffect(() => {
    if (dateAcquiredExr.rate) {
      setRateAcquired(dateAcquiredExr);
    }
  }, [dateAcquiredExr, setRateAcquired]);
  useEffect(() => {
    if (dateSoldExr.rate) {
      setRateSold(dateSoldExr);
    }
  }, [dateSoldExr, setRateSold]);

  return (
    <form className="flex gap-4 text-left">
      <NumberField
        value={quantity}
        label="Quantity (515)"
        isRequired
        min={1}
        onChange={(value) => setQuantity(value)}
        maxDecimals={0}
      />
      <div className="border border-gray-300" />
      <div className="grid gap-4">
        <div className="flex gap-2">
          <DateField
            value={dateAcquired}
            label="Date Acquired"
            isRequired
            max={maxDate}
            onChange={(value) => setDateAcquired(value)}
            placeholder="Select date"
          />
          <NumberField
            value={dateAcquiredExr.rate}
            label="$ / €"
            isReadOnly
            validationError={
              dateAcquiredExr.errorMessage &&
              "failed fetching currency rate for date acquired"
            }
            isLoading={dateAcquiredExr.isFetching}
          />
        </div>
        <div className="flex gap-2">
          <NumberField
            value={adjustedCost}
            label="Adjusted Cost Basis / Share"
            isRequired
            onChange={(value) => setAdjustedCost(value)}
          />
          <NumberField
            value={dateAcquiredExr.rate && adjustedCost / dateAcquiredExr.rate}
            label="Adjusted Cost Basis / Share (€) (520)"
            isReadOnly
            validationError={
              dateAcquiredExr.errorMessage &&
              "failed fetching currency rate for date acquired"
            }
            isLoading={dateAcquiredExr.isFetching}
          />
        </div>
        <div className="flex gap-2">
          <DateField
            value={dateSold}
            label="Date Sold (512)"
            isRequired
            max={maxDate}
            onChange={(value) => setDateSold(value)}
            placeholder="Select date"
          />
          <NumberField
            value={dateSoldExr.rate}
            label="$ / €"
            isReadOnly
            validationError={
              dateSoldExr.errorMessage &&
              "failed fetching currency rate for date sold"
            }
            isLoading={dateSoldExr.isFetching}
          />
        </div>
        <div className="flex gap-2">
          <NumberField
            value={proceeds}
            label="Proceeds / Share"
            isRequired
            onChange={(value) => setProceeds(value)}
          />
          <NumberField
            value={dateSoldExr.rate && proceeds / dateSoldExr.rate}
            label="Proceeds / Share (€) (514)"
            isReadOnly
            validationError={
              dateSoldExr.errorMessage &&
              "failed fetching currency rate for date sold"
            }
            isLoading={dateSoldExr.isFetching}
          />
        </div>
        <div className="flex gap-2">
          <NumberField
            value={
              dateAcquiredExr.rate &&
              (adjustedCost * quantity) / dateAcquiredExr.rate
            }
            label="Adjusted Cost Basis (€) (521)"
            isReadOnly
            validationError={
              dateAcquiredExr.errorMessage &&
              "failed fetching currency rate for date acquired"
            }
            isLoading={dateAcquiredExr.isFetching}
          />
          <NumberField
            value={dateSoldExr.rate && (proceeds * quantity) / dateSoldExr.rate}
            label="Proceeds (€) (516)"
            isReadOnly
            validationError={
              dateSoldExr.errorMessage &&
              "failed fetching currency rate for date sold"
            }
            isLoading={dateSoldExr.isFetching}
          />
          <NumberField
            value={getAdjustedGainLoss(
              quantity,
              adjustedCost,
              proceeds,
              dateAcquiredExr,
              dateSoldExr,
            )}
            label="Adjusted Gain / Loss (€) (524)"
            isReadOnly
            validationError={
              dateAcquiredExr.rate
                ? dateSoldExr.errorMessage &&
                  "failed fetching currency rate for date sold"
                : dateAcquiredExr.errorMessage &&
                  "failed fetching currency rate for date acquired"
            }
            isLoading={dateAcquiredExr.isFetching || dateSoldExr.isFetching}
          />
        </div>
      </div>
    </form>
  );
};
