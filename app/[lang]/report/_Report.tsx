import { useEffect, useMemo, useState } from "react";
import { match } from "ts-pattern";
import { EtradeGainAndLossesFileInput } from "@/components/EtradeGainAndLossesFileInput";
import { useExchangeRates } from "@/hooks/use-fetch-exr";
import { Button } from "@/components/ui/Button";
import type { GainAndLossEvent } from "@/lib/etrade/etrade.types";
import {
  applyFrTaxes,
  enrichEtradeGlFrFr,
  getEmptyTaxes,
} from "@/lib/taxes/taxes-rules-fr";
import type { GainAndLossEventWithRates } from "@/lib/taxes/taxes-rules-fr";
import { Section } from "@/components/ui/Section";
import {
  isEspp,
  isFrNonQualifiedRsu,
  isFrNonQualifiedSo,
  isFrQualifiedRsu,
  isFrQualifiedSo,
} from "@/lib/taxes/filters";
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
import { ImportValidation } from "./_ImportValidation";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export interface ReportResidencyFrProps {
  taxResidency: CountryCode;
  dict: Dictionary;
}

export const Report: React.FunctionComponent<ReportResidencyFrProps> = ({
  taxResidency,
  dict,
}: ReportResidencyFrProps) => {
  const reportDict = dict.report;
  const [showFractionAssignmentModal, setShowFractionAssignmentModal] =
    useState(false);
  const [gainsAndLosses, setGainsAndLosses] = useState<GainAndLossEvent[]>([]);
  const [fractionsFrIncome, setFractionsFrIncome] = useState<number[]>([]);
  const [isFrQualified, setIsFrQualified] = useState<boolean[]>([]);
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
      sendErrorToast(reportDict.import.errors.exchangeRates);
    }
  }, [couldNotFetchRates, reportDict.import.errors.exchangeRates]);

  const {
    values: symbolPrices,
    isFetching: isFetchingPrices,
    isError: couldNotFetchPrices,
  } = useFetchSymbolDaily(gainsAndLosses.map((event) => event.symbol));
  useEffect(() => {
    if (couldNotFetchPrices) {
      sendErrorToast(reportDict.import.errors.stockPrices);
    }
  }, [couldNotFetchPrices, reportDict.import.errors.stockPrices]);

  const isFetching = isFetchingExr || isFetchingPrices;
  const hasError = couldNotFetchRates || couldNotFetchPrices;

  const enrichedEvents = useMemo<GainAndLossEventWithRates[]>(() => {
    if (gainsAndLosses.length === 0 || isFetching || hasError || !rates)
      return [];
    return enrichEtradeGlFrFr(gainsAndLosses, {
      fractions: fractionsFrIncome,
      isFrQualified,
      rates,
      symbolPrices,
    });
  }, [
    gainsAndLosses,
    rates,
    symbolPrices,
    isFetching,
    hasError,
    fractionsFrIncome,
    isFrQualified,
  ]);

  const counts = useMemo(
    () => ({
      frQualifiedSo: enrichedEvents.filter(isFrQualifiedSo).length,
      frQualifiedRsu: enrichedEvents.filter(isFrQualifiedRsu).length,
      espp: enrichedEvents.filter(isEspp).length,
      frNonQualifiedSo: enrichedEvents.filter(isFrNonQualifiedSo).length,
      frNonQualifiedRsu: enrichedEvents.filter(isFrNonQualifiedRsu).length,
    }),
    [enrichedEvents],
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
      isFrQualified,
      explanationsDict: reportDict.fr.explanations,
    });
  }, [
    gainsAndLosses,
    rates,
    symbolPrices,
    isFetching,
    hasError,
    fractionsFrIncome,
    isFrQualified,
    reportDict.fr.explanations,
  ]);

  return (
    <div>
      <div className="print:hidden">
        <MessageBox level="warning" title={reportDict.disclaimer.title}>
          <p>{reportDict.disclaimer.line1}</p>
          <p>{reportDict.disclaimer.line2}</p>
          <p>
            {reportDict.disclaimer.guideLinePrefix}
            <Link href="/2021_mc-kenzie-taxes-presentation.pdf" isExternal>
              {reportDict.disclaimer.guideLinkLabel}
            </Link>
            {reportDict.disclaimer.guideLineSuffix}
          </p>
        </MessageBox>
        <div className="my-2">{reportDict.etradeInstructions.expandedNote}</div>
        <div>{reportDict.etradeInstructions.benefitHistoryNote}</div>
      </div>
      {gainsAndLosses.length === 0 || fractionsFrIncome.length === 0 ? (
        <div className="flex items-baseline justify-center gap-3">
          <span>{reportDict.import.prompt}</span>
          <FractionAssignmentModal
            dict={dict}
            showModal={showFractionAssignmentModal}
            setShowModal={setShowFractionAssignmentModal}
            data={gainsAndLosses}
            confirm={(fractions, isFrQualifiedValues) => {
              setFractionsFrIncome(fractions);
              setIsFrQualified(isFrQualifiedValues);
            }}
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
            label={reportDict.import.label}
            errorMessages={{
              noFile: reportDict.import.errors.noFile,
              invalidFile: reportDict.import.errors.invalidFile,
            }}
            setData={(data) => {
              setGainsAndLosses(data);
              if (data.length > 0) {
                setShowFractionAssignmentModal(true);
              }
            }}
          />
        </div>
      ) : isFetching ? (
        <p>{dict.common.loading}</p>
      ) : (
        <div className="container flex flex-col gap-8">
          <div className="print:hidden">
            <div className="flex items-baseline justify-between gap-3">
              <span>{reportDict.gainsAndLosses}</span>
              <Button
                label={dict.common.clear}
                color="red"
                onClick={() => {
                  setGainsAndLosses([]);
                  setFractionsFrIncome([]);
                  setIsFrQualified([]);
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
              <label htmlFor="printMode">{reportDict.printMode}</label>
            </div>
          </div>

          <Section title={reportDict.sections.summary}>
            <div className="px-6">
              <dl className="grid grid-cols-2 ">
                <dt className="font-bold">
                  {reportDict.summary.frQualifiedSo}
                </dt>
                <dd>
                  {counts.frQualifiedSo} {reportDict.summary.events}
                </dd>
                <dt className="font-bold">
                  {reportDict.summary.frQualifiedRsu}
                </dt>
                <dd>
                  {counts.frQualifiedRsu} {reportDict.summary.events}
                </dd>
                <dt className="font-bold">{reportDict.summary.espp}</dt>
                <dd>
                  {counts.espp} {reportDict.summary.events}
                </dd>
                <dt className="font-bold">
                  {reportDict.summary.frNonQualifiedSo}
                </dt>
                <dd>
                  {counts.frNonQualifiedSo} {reportDict.summary.events}
                </dd>
                <dt className="font-bold">
                  {reportDict.summary.frNonQualifiedRsu}
                </dt>
                <dd>
                  {counts.frNonQualifiedRsu} {reportDict.summary.events}
                </dd>
              </dl>
            </div>
          </Section>
          <div className="print:hidden">
            <ImportValidation events={enrichedEvents} dict={dict} />
          </div>
          {match({ taxResidency })
            .with({ taxResidency: "fr" }, () => (
              <ReportFr
                hasSoldShares={gainsAndLosses.length > 0}
                isPrintMode={isPrintMode}
                taxes={taxes}
                dict={dict}
              />
            ))
            .with({ taxResidency: "us" }, () => (
              <ReportUs isPrintMode={isPrintMode} taxes={taxes} dict={dict} />
            ))
            .exhaustive()}
          <Section title={reportDict.sections.sourceOfInformation}>
            <div>{reportDict.sources.intro}</div>
            <ul className="list-disc pl-6 mt-2 flex flex-col gap-y-">
              <li>
                ETrade Gains and Losses{" "}
                <Link href="https://us.etrade.com/etx/pxy/my-account/export">
                  Expanded
                </Link>
              </li>
              <li>
                <div className="flex">
                  {reportDict.sources.ecbLabelPrefix}&nbsp;
                  <Link href="https://data.ecb.europa.eu/help/api/data">
                    {reportDict.sources.ecbLinkLabel}
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
                {reportDict.sources.yahooLabelPrefix}&nbsp;
                <Link href="https://finance.yahoo.com/">
                  {reportDict.sources.yahooLinkLabel}
                </Link>
              </li>
            </ul>
          </Section>
        </div>
      )}
    </div>
  );
};
