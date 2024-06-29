import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { NumberInput } from "@/components/ui/Field";
import type { GainAndLossEvent } from "@/lib/etrade/etrade.types";
import { Modal } from "@/components/ui/Modal";
import { match } from "ts-pattern";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { MessageBox } from "@/components/ui/MessageBox";

interface FractionAssignmentModalProps {
  data: GainAndLossEvent[] | undefined;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  confirm: (fractions: number[]) => void;
  state: "loading" | "error" | "ok";
}

export const FractionAssignmentModal = ({
  data,
  showModal,
  setShowModal,
  confirm,
  state,
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
        <div className="flex justify-between">
          <div className="text-lg font-bold">
            Confirm the origin of your income
          </div>
          <Button
            onClick={() => setShowModal(false)}
            isBorderless
            icon={XMarkIcon}
          />
        </div>
        <div>
          For each sale, please confirm the % of French income. If you have
          never moved abroad, it should be 100%.
        </div>
        <MessageBox level="info" title="Note: this only applies to RSUs.">
          If you would like support for other types of equity (e.g. stock
          options), please reach out with examples.
        </MessageBox>
        {match(state)
          .with("ok", () => (
            <>
              <div className="grid grid-cols-4 gap-4">
                {["Quantity", "Grant Date", "Acquisition Date", "% FR"].map(
                  (h) => (
                    <div key={h} className="font-semibold">
                      {h}
                    </div>
                  ),
                )}
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
                            prevFractions.map((f, i) =>
                              i === e.index ? value : f,
                            ),
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
            </>
          ))
          .with("loading", () => (
            <div className="flex">
              <LoadingIndicator />
            </div>
          ))
          .with("error", () => (
            <MessageBox
              level="error"
              title="cannot generate report, please retry later"
            />
          ))
          .exhaustive()}
      </div>
    </Modal>
  );
};
