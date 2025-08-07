import { useEffect, useMemo, useState } from "react";
import { match } from "ts-pattern";
import { EtradeGainAndLossesFileInput } from "@/components/EtradeGainAndLossesFileInput";
import { useExchangeRates } from "@/hooks/use-fetch-exr";
import { Button } from "@/components/ui/Button";
import type { GainAndLossEvent } from "@/lib/etrade/etrade.types";
import { applyFrTaxes, getEmptyTaxes } from "@/lib/taxes/taxes-rules-fr";
import { Section } from "@/components/ui/Section";
import {
  isEspp,
  isFrQualifiedRsu,
  isFrQualifiedSo,
  isUsQualifiedRsu,
  isUsQualifiedSo,
} from "@/lib/etrade/filters";
import { Tooltip } from "@/components/ui/Tooltip";
import { MessageBox } from "@/components/ui/MessageBox";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { useFetchSymbolDaily } from "@/hooks/use-fetch-symbol-daily";
import { Link } from "@/components/ui/Link";
import { FractionAssignmentModal } from "./_FractionAssignmentModal";
import { sendErrorToast } from "@/components/ui/Toast";
import { ReportFr } from "./_ReportFr";
import type { CountryCode } from "./types";
import { ReportUs } from "./_ReportUs";

export interface ReportResidencyFrProps {
  taxResidency: CountryCode;
}

export const Report: React.FunctionComponent<ReportResidencyFrProps> = ({
  taxResidency,
}: ReportResidencyFrProps) => {
  const [showFractionAssignmentModal, setShowFractionAssignmentModal] =
    useState(false);
  const [gainsAndLosses, setGainsAndLosses] = useState<GainAndLossEvent[]>([]);
  const [fractionsFrIncome, setFractionsFrIncome] = useState<number[]>([]);
  const [isPrintMode, setIsPrintMode] = useState(false);

  const {
    values: rates,
    isFetching: isFetchingExr,
    isError: couldNotFetchRates,
  } = useExchangeRates(
    gainsAndLosses.flatMap((event) => [event.dateSold, event.dateAcquired]),
  );
  useEffect(() => {
    if (couldNotFetchRates) {
      sendErrorToast("could not fetch exchange rates, please retry later");
    }
  }, [couldNotFetchRates]);

  const {
    values: symbolPrices,
    isFetching: isFetchingPrices,
    isError: couldNotFetchPrices,
  } = useFetchSymbolDaily(gainsAndLosses.map((event) => event.symbol));
  useEffect(() => {
    if (couldNotFetchPrices) {
      sendErrorToast("could not fetch stock prices, please retry later");
    }
  }, [couldNotFetchPrices]);

  const isFetching = isFetchingExr || isFetchingPrices;
  const hasError = couldNotFetchRates || couldNotFetchPrices;

  const counts = useMemo(
    () => ({
      frQualifiedSo: gainsAndLosses.filter(isFrQualifiedSo).length,
      frQualifiedRsu: gainsAndLosses.filter(isFrQualifiedRsu).length,
      espp: gainsAndLosses.filter(isEspp).length,
      usQualifiedSo: gainsAndLosses.filter(isUsQualifiedSo).length,
      usQualifiedRsu: gainsAndLosses.filter(isUsQualifiedRsu).length,
    }),
    [gainsAndLosses],
  );

  const taxes = useMemo(() => {
    if (gainsAndLosses.length === 0 || isFetching || hasError || !rates) {
      return getEmptyTaxes();
    }
    return applyFrTaxes({
      gainsAndLosses,
      benefits: [],
      rates,
      symbolPrices,
      fractions: fractionsFrIncome,
    });
  }, [
    gainsAndLosses,
    rates,
    symbolPrices,
    isFetching,
    hasError,
    fractionsFrIncome,
  ]);

  return (
    <div>
      <div className="print:hidden">
        <MessageBox level="warning" title="Disclaimer">
          <p>
            These calculations are for informational purposes only and should
            not be considered financial advice.
          </p>
          <p>
            Despite all the efforts that were put in creating this tool, it is
            your responsibility to verify the results.
          </p>
          <p>
            This{" "}
            <Link href="/2021_mc-kenzie-taxes-presentation.pdf" isExternal>
              guide
            </Link>{" "}
            sent by equity team in 2021 was used to create this calculator
          </p>
        </MessageBox>
        <div className="my-2">
          Based on the <b>expanded</b> exports both for Gain And Losses (My
          Account &gt; Gains and losses) and Benefit History (My Account &gt;
          Benefit History) from Etrade.
        </div>
      </div>
      {gainsAndLosses.length === 0 ||
      (gainsAndLosses.filter((e) => e.planType === "RS").length > 0 &&
        fractionsFrIncome.length === 0) ? (
        <div className="flex items-baseline justify-center gap-3">
          <span>Import the Gains and Losses CSV file: </span>
          <FractionAssignmentModal
            showModal={showFractionAssignmentModal}
            setShowModal={setShowFractionAssignmentModal}
            data={gainsAndLosses}
            confirm={setFractionsFrIncome}
            state={match<
              { isFetching: boolean; hasError: boolean },
              "loading" | "error" | "ok"
            >({
              isFetching,
              hasError,
            })
              .with({ isFetching: true }, () => "loading")
              .with({ hasError: true }, () => "error")
              .otherwise(() => "ok")}
          />
          <EtradeGainAndLossesFileInput
            setData={(data) => {
              setGainsAndLosses(data);
              if (data.filter((e) => e.planType === "RS").length > 0) {
                // Show fraction assignment modal if you sold RSUs
                setShowFractionAssignmentModal(true);
              }
            }}
          />
        </div>
      ) : isFetching ? (
        <p>Loading...</p>
      ) : (
        <div className="container flex flex-col gap-8">
          <div className="print:hidden">
            <div className="flex items-baseline justify-between gap-3">
              <span>Gains and Losses</span>
              <Button
                label="Clear"
                color="red"
                onClick={() => {
                  setGainsAndLosses([]);
                  setFractionsFrIncome([]);
                }}
              />
            </div>
            <div className="flex gap-2 items-baseline justify-items-start">
              <input
                type="checkbox"
                id="printMode"
                checked={isPrintMode}
                onChange={() => setIsPrintMode(!isPrintMode)}
              />
              <label htmlFor="printMode">Print mode</label>
            </div>
          </div>

          <Section title="Summary">
            <div className="px-6">
              <dl className="grid grid-cols-2 ">
                <dt className="font-bold">FR qualified SO</dt>
                <dd>{counts.frQualifiedSo} events</dd>
                <dt className="font-bold">FR qualified RSU</dt>
                <dd>{counts.frQualifiedRsu} events</dd>
                <dt className="font-bold">ESPP</dt>
                <dd>{counts.espp} events</dd>
                <dt className="font-bold">US qualified SO</dt>
                <dd>{counts.usQualifiedSo} events</dd>
                <dt className="font-bold">US qualified RSU</dt>
                <dd>{counts.usQualifiedRsu} events</dd>
              </dl>
            </div>
          </Section>
          {match({ taxResidency })
            .with({ taxResidency: "fr" }, () => (
              <ReportFr
                hasSoldShares={gainsAndLosses.length > 0}
                isPrintMode={isPrintMode}
                taxes={taxes}
              />
            ))
            .with({ taxResidency: "us" }, () => (
              <ReportUs isPrintMode={isPrintMode} taxes={taxes} />
            ))
            .exhaustive()}
          <Section title="Source of information">
            <div>Some external sources are used to compute data:</div>
            <ul className="list-disc pl-6 mt-2 flex flex-col gap-y-">
              <li>
                Etrade Gains and Losses{" "}
                <Link href="https://us.etrade.com/etx/pxy/my-account/export">
                  Expanded
                </Link>
              </li>
              <li>
                <div className="flex">
                  The exchange rates are fetched from the&nbsp;
                  <Link href="https://data.ecb.europa.eu/help/api/data">
                    European Central Bank API
                  </Link>
                  <Tooltip
                    content={
                      "https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A"
                    }
                    maxWidth="none"
                  >
                    <InformationCircleIcon className="h-6 w-6 ml-2 text-blue-600" />
                  </Tooltip>
                </div>
              </li>
              <li>
                Stock prices are fetched from&nbsp;
                <Link href="https://www.alphavantage.co/documentation/#daily">
                  Alphavantage TIME_SERIES_DAILY
                </Link>
              </li>
            </ul>
          </Section>
        </div>
      )}
    </div>
  );
};
