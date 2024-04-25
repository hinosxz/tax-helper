import { NumberField, DateField } from "@/app/guide/shared/ui/Field";
import { LoadingIndicator } from "@/app/guide/shared/ui/LoadingIndicator";
import { useFetchExr } from "@/hooks/use-fetch-exr";
import { useEffect } from "react";

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

  setRateAcquired: (value: number) => void;
  setRateSold: (value: number) => void;
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
  // TODO handle errors with `sendErrorToast`
  const dateAcquiredExr = useFetchExr(dateAcquired);
  const dateSoldExr = useFetchExr(dateSold);

  // Store copies in state for parent to access
  useEffect(() => {
    if (dateAcquiredExr.rate) {
      setRateAcquired(dateAcquiredExr.rate);
    }
  }, [dateAcquiredExr.rate, setRateAcquired]);
  useEffect(() => {
    if (dateSoldExr.rate) {
      setRateSold(dateSoldExr.rate);
    }
  }, [dateSoldExr.rate, setRateSold]);

  if (!dateAcquiredExr?.rate || !dateSoldExr?.rate) {
    return (
      <div className="flex justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <form className="flex gap-4 text-left">
      <NumberField
        value={quantity}
        label="Quantity (515)"
        isRequired
        min={1}
        onChange={(value) => setQuantity(value)}
        type="number"
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
            type="date"
          />
          <NumberField
            value={dateAcquiredExr.rate}
            label="$ / €"
            type="number"
            isReadOnly
          />
        </div>
        <div className="flex gap-2">
          <NumberField
            value={adjustedCost}
            label="Adjusted Cost Basis / Share"
            isRequired
            onChange={(value) => setAdjustedCost(value)}
            type="number"
          />
          <NumberField
            value={adjustedCost / dateAcquiredExr.rate}
            label="Adjusted Cost Basis / Share (€) (520)"
            isReadOnly
            type="number"
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
            type="date"
          />
          <NumberField
            value={dateSoldExr.rate}
            label="$ / €"
            type="number"
            isReadOnly
          />
        </div>
        <div className="flex gap-2">
          <NumberField
            value={proceeds}
            label="Proceeds / Share"
            isRequired
            onChange={(value) => setProceeds(value)}
            type="number"
          />
          <NumberField
            value={proceeds / dateSoldExr.rate}
            label="Proceeds / Share (€) (514)"
            isReadOnly
            type="number"
          />
        </div>
        <div className="flex gap-2">
          <NumberField
            value={(adjustedCost * quantity) / dateAcquiredExr.rate}
            label="Adjusted Cost Basis (€) (521)"
            isReadOnly
            type="number"
          />
          <NumberField
            value={(proceeds * quantity) / dateSoldExr.rate}
            label="Proceeds (€) (516)"
            isReadOnly
            type="number"
          />
          <NumberField
            value={
              (proceeds * quantity) / dateSoldExr.rate -
              (adjustedCost * quantity) / dateAcquiredExr.rate
            }
            label="Adjusted Gain / Loss (€) (524)"
            isReadOnly
            type="number"
          />
        </div>
      </div>
    </form>
  );
};
