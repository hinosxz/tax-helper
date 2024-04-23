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

const styles = {
  label: "block mb-2 text-sm font-medium",
  input:
    "border border-gray-300 text-sm rounded-md " +
    "block p-1.5 read-only:bg-gray-100",
};

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
      <div>
        <label className={styles.label}>Quantity (515)</label>
        <input
          className={styles.input}
          type="number"
          value={quantity}
          onChange={(event) => setQuantity(event.target.valueAsNumber)}
          required
          min={1}
        />
      </div>
      <div className="border border-gray-300" />
      <div className="grid gap-4">
        <div className="flex gap-2">
          <div>
            <label className={styles.label}>Date Acquired</label>
            <input
              required
              type="date"
              className={styles.input}
              placeholder="Select date"
              value={dateAcquired}
              onChange={(event) => setDateAcquired(event.target.value)}
              max={maxDate}
            />
          </div>
          <div>
            <label className={styles.label}>$ / €</label>
            <input
              className={styles.input}
              type="number"
              value={dateAcquiredExr.rate}
              readOnly
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div>
            <label className={styles.label}>Adjusted Cost Basis / Share</label>
            <input
              className={styles.input}
              type="number"
              value={adjustedCost}
              onChange={(event) => setAdjustedCost(event.target.valueAsNumber)}
              required
              step={0.01}
            />
          </div>
          <div>
            <label className={styles.label}>
              Adjusted Cost Basis / Share (€) (520)
            </label>
            <input
              className={styles.input}
              type="number"
              value={(adjustedCost / dateAcquiredExr.rate).toFixed(2)}
              readOnly
              step={0.01}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div>
            <label className={styles.label}>Date Sold (512)</label>
            <input
              required
              type="date"
              className={styles.input}
              placeholder="Select date"
              value={dateSold}
              onChange={(event) => setDateSold(event.target.value)}
              max={maxDate}
            />
          </div>
          <div>
            <label className={styles.label}>$ / €</label>
            <input
              className={styles.input}
              type="number"
              value={dateSoldExr.rate}
              readOnly
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div>
            <label className={styles.label}>Proceeds / Share</label>
            <input
              className={styles.input}
              type="number"
              value={proceeds}
              onChange={(event) => setProceeds(event.target.valueAsNumber)}
              required
              step={0.01}
            />
          </div>
          <div>
            <label className={styles.label}>Proceeds / Share (€) (514)</label>
            <input
              className={styles.input}
              type="number"
              value={(proceeds / dateSoldExr.rate).toFixed(2)}
              readOnly
              step={0.01}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div>
            <label className={styles.label}>
              Adjusted Cost Basis (€) (521)
            </label>
            <input
              className={styles.input}
              type="number"
              value={((adjustedCost * quantity) / dateAcquiredExr.rate).toFixed(
                2
              )}
              readOnly
              step={0.01}
            />
          </div>
          <div>
            <label className={styles.label}>Proceeds (€) (516)</label>
            <input
              className={styles.input}
              type="number"
              value={((proceeds * quantity) / dateSoldExr.rate).toFixed(2)}
              readOnly
              step={0.01}
            />
          </div>
          <div>
            <label className={styles.label}>
              Adjusted Gain / Loss (€) (524)
            </label>
            <input
              className={styles.input}
              type="number"
              value={(
                (proceeds * quantity) / dateSoldExr.rate -
                (adjustedCost * quantity) / dateAcquiredExr.rate
              ).toFixed(2)}
              readOnly
              step={0.01}
            />
          </div>
        </div>
      </div>
    </form>
  );
};
