import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { NumberInput } from "@/components/ui/Field";
import type { GainAndLossEvent } from "@/lib/etrade/etrade.types";
import { Modal } from "@/components/ui/Modal";
import { match } from "ts-pattern";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { MessageBox } from "@/components/ui/MessageBox";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface FractionAssignmentModalProps {
  data: GainAndLossEvent[];
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  confirm: (fractions: number[], isFrQualified: boolean[]) => void;
  state: "loading" | "error" | "ok";
  dict: Dictionary;
}

const toKey = (e: GainAndLossEvent) =>
  `${e.symbol},${e.planType},${e.dateGranted},${e.dateAcquired}`;
const fromKey = (pair: string) => pair.split(",");

const sortByDates = (pairA: string, pairB: string) => {
  const [aSymbol, aPlanType, aGranted, aAcquired] = fromKey(pairA);
  const [bSymbol, bPlanType, bGranted, bAcquired] = fromKey(pairB);
  return (
    aAcquired.localeCompare(bAcquired) ||
    aGranted.localeCompare(bGranted) ||
    aSymbol.localeCompare(bSymbol) ||
    aPlanType.localeCompare(bPlanType)
  );
};

const fractionsFromEvents = (
  events: GainAndLossEvent[],
  pctMap: Map<string, number>,
) =>
  events.map((e) => {
    const datePair = toKey(e);
    return (pctMap.get(datePair) ?? 100) / 100; // normalize before sending back
  });

const isFrQualifiedFromEvents = (
  events: GainAndLossEvent[],
  qualifiedMap: Map<string, boolean>,
) =>
  events.map((e) => {
    const datePair = toKey(e);
    return qualifiedMap.get(datePair) ?? e.qualifiedIn !== "us";
  });

export const FractionAssignmentModal = ({
  data,
  showModal,
  setShowModal,
  confirm,
  state,
  dict,
}: FractionAssignmentModalProps) => {
  const modalDict = dict.report.fractionAssignmentModal;
  // % are the same for each date acquired / date granted pair.
  const [pctMap, setPctMap] = useState<Map<string, number>>(
    new Map<string, number>(),
  );
  const [qualifiedMap, setQualifiedMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>(),
  );

  // Reset % if data changes
  useEffect(() => {
    setPctMap(new Map<string, number>());
    setQualifiedMap(new Map<string, boolean>());
  }, [data]);

  const salesByDates = Map.groupBy(data, toKey);

  return (
    <Modal show={showModal}>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex justify-between">
          <div className="text-lg font-bold">{modalDict.title}</div>
          <Button
            onClick={() => setShowModal(false)}
            isBorderless
            icon={XMarkIcon}
          />
        </div>
        <div>{modalDict.intro}</div>
        {match(state)
          .with("ok", () => (
            <>
              <div className="grid grid-cols-6 gap-4">
                {[
                  modalDict.headers.ticker,
                  modalDict.headers.planType,
                  modalDict.headers.grantDate,
                  modalDict.headers.acquisitionDate,
                  modalDict.headers.isPlanFrQualified,
                  modalDict.headers.pctFr,
                ].map((h) => (
                  <div key={h} className="font-semibold">
                    {h}
                  </div>
                ))}
                {Array.from(salesByDates.keys())
                  .sort(sortByDates)
                  .map((datePair) => {
                    const [symbol, planType, granted, acquired] =
                      fromKey(datePair);
                    const events = salesByDates.get(datePair) ?? [];
                    const defaultIsFrQualified =
                      events[0]?.qualifiedIn !== "us";
                    const isFrQualified =
                      qualifiedMap.get(datePair) ?? defaultIsFrQualified;
                    return (
                      <Fragment key={datePair}>
                        <div>{symbol}</div>
                        <div>{planType}</div>
                        <div>{granted}</div>
                        <div>{acquired}</div>
                        <div className="flex w-full items-center pl-8">
                          <input
                            type="checkbox"
                            className="m-0 block h-3 w-3"
                            checked={isFrQualified}
                            onChange={() =>
                              setQualifiedMap(
                                new Map(
                                  qualifiedMap.set(datePair, !isFrQualified),
                                ),
                              )
                            }
                          />
                        </div>
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
                    confirm(
                      fractionsFromEvents(data, pctMap),
                      isFrQualifiedFromEvents(data, qualifiedMap),
                    );
                    setShowModal(false);
                  }}
                  label={dict.common.confirm}
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
            <MessageBox level="error" title={modalDict.errors.cannotGenerate} />
          ))
          .exhaustive()}
      </div>
    </Modal>
  );
};
