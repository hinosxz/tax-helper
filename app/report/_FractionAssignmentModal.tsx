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
  data: GainAndLossEvent[];
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  confirm: (fractions: number[]) => void;
  state: "loading" | "error" | "ok";
}

const toKey = (e: GainAndLossEvent) => `${e.dateGranted},${e.dateAcquired}`;
const fromKey = (pair: string) => pair.split(",");

const sortByDates = (pairA: string, pairB: string) => {
  const [aGranted, aAcquired] = fromKey(pairA);
  const [bGranted, bAcquired] = fromKey(pairB);
  return aAcquired.localeCompare(bAcquired) || aGranted.localeCompare(bGranted);
};

const fractionsFromEvents = (
  events: GainAndLossEvent[],
  pctMap: Map<string, number>,
) =>
  events.map((e) => {
    const datePair = toKey(e);
    return (pctMap.get(datePair) ?? 100) / 100; // normalize before sending back
  });

export const FractionAssignmentModal = ({
  data,
  showModal,
  setShowModal,
  confirm,
  state,
}: FractionAssignmentModalProps) => {
  // % are the same for each date acquired / date granted pair.
  const [pctMap, setPctMap] = useState<Map<string, number>>(
    new Map<string, number>(),
  );

  // Reset % if data changes
  useEffect(() => {
    setPctMap(new Map<string, number>());
  }, [data]);

  const salesByDates = Map.groupBy(
    data
      .map((e, eventIdx) => ({ ...e, index: eventIdx }))
      .filter((e) => e.planType === "RS"), // origin of income only applies to RSUs
    toKey,
  );

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
              <div className="grid grid-cols-3 gap-4">
                {["Grant Date", "Acquisition Date", "% FR"].map((h) => (
                  <div key={h} className="font-semibold">
                    {h}
                  </div>
                ))}
                {Array.from(salesByDates.keys())
                  .sort(sortByDates)
                  .map((datePair) => {
                    const [granted, acquired] = fromKey(datePair);
                    return (
                      <Fragment key={datePair}>
                        <div>{granted}</div>
                        <div>{acquired}</div>
                        <NumberInput
                          value={pctMap.get(datePair) ?? 100}
                          min={0}
                          max={100}
                          maxDecimals={2}
                          onChange={(value) => {
                            setPctMap(new Map(pctMap.set(datePair, value)));
                          }}
                        />
                      </Fragment>
                    );
                  })}
              </div>
              <div className="flex justify-end">
                <Button
                  color="green"
                  onClick={() => {
                    confirm(fractionsFromEvents(data, pctMap));
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
