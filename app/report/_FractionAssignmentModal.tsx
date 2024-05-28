import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { NumberInput } from "@/components/ui/Field";
import type { GainAndLossEvent } from "@/lib/etrade/etrade.types";
import { Modal } from "@/components/ui/Modal";

interface FractionAssignmentModalProps {
  data: GainAndLossEvent[] | undefined;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  confirm: (fractions: number[]) => void;
}

export const FractionAssignmentModal = ({
  data,
  showModal,
  setShowModal,
  confirm,
}: FractionAssignmentModalProps) => {
  // Initialize to 100%
  const [fractions, setFractions] = useState<number[]>(
    Array<number>(data?.length ?? 0).fill(100),
  );

  // Reset fractions if data changes
  useEffect(() => {
    setFractions(Array<number>(data?.length ?? 0).fill(100));
  }, [data, setFractions]);

  return (
    <Modal show={showModal}>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex justify-end">
          <Button
            onClick={() => setShowModal(false)}
            isBorderless
            icon={XMarkIcon}
          />
        </div>
        <div className="grid grid-cols-4">
          {["Quantity", "Grant Date", "Acquisition Date", "% FR"].map((h) => (
            <div key={h} className="font-semibold">
              {h}
            </div>
          ))}
          {data
            ?.map((e, eventIdx) => ({ ...e, index: eventIdx }))
            .filter((e) => e.planType === "RS") // origin of income only applies to RSUs
            .map((e) => (
              <Fragment key={`event-${e.index}`}>
                <div>
                  {e.quantity}×{e.symbol}
                </div>
                <div>{e.dateGranted}</div>
                <div>{e.dateAcquired}</div>
                <NumberInput
                  value={fractions[e.index] ?? 100}
                  min={0}
                  max={100}
                  maxDecimals={2}
                  onChange={(value) => {
                    setFractions((prevFractions) =>
                      prevFractions.map((f, i) => (i === e.index ? value : f)),
                    );
                  }}
                />
              </Fragment>
            ))}
        </div>
        <div className="flex justify-end">
          <Button
            color="green"
            onClick={() => {
              confirm(fractions.map((f) => f / 100)); // normalize before sending back
              setShowModal(false);
            }}
            label="Confirm"
            icon={CheckIcon}
          />
        </div>
      </div>
    </Modal>
  );
};
