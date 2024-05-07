import { useMemo, useState } from "react";
import Image from "next/image";
import { EtradeGainAndLossesFileInput } from "@/app/guide/shared/EtradeGainAndLossesFileInput";
import { useExchangeRates } from "@/hooks/use-fetch-exr";
import { Button } from "@/app/guide/shared/ui/Button";
import { GainAndLossEvent } from "@/lib/etrade/etrade.types";
import { applyFrTaxes, getEmptyTaxes } from "@/lib/taxes/taxes-rules-fr";
import { Section } from "@/app/guide/shared/ui/Section";
import {
  isEspp,
  isFrQualifiedRsu,
  isFrQualifiedSo,
  isUsQualifiedRsu,
  isUsQualifiedSo,
} from "@/lib/etrade/filters";
import { Tooltip } from "@/components/ui/Tooltip";
import { MessageBox } from "@/components/ui/MessageBox";
import { Drawer } from "@/components/ui/Drawer";
import { TaxableEventFr } from "@/components/TaxableEventFr";
import { TaxableEventFr as TaxableEventFrProps } from "@/lib/taxes/taxable-event-fr";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { useFetchSymbolDaily } from "@/hooks/use-fetch-symbol-daily";

export interface ReportResidencyFrTaxesFrProps {}

export const ReportResidencyFrTaxesFr: React.FunctionComponent<
  ReportResidencyFrTaxesFrProps
> = () => {
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [gainsAndLosses, setGainsAndLosses] = useState<GainAndLossEvent[]>([]);
  const { values: rates, isFetching: isFetchingExr } = useExchangeRates(
    gainsAndLosses.flatMap((event) => [event.dateSold, event.dateAcquired]),
  );
  const { values: symbolPrices, isFetching: isFetchingSymbols } =
    useFetchSymbolDaily(gainsAndLosses.map((event) => event.symbol));

  const isFetching = isFetchingExr || isFetchingSymbols;

  const taxes = useMemo(() => {
    if (gainsAndLosses.length === 0 || isFetching || !rates) {
      return getEmptyTaxes();
    }
    return applyFrTaxes({
      gainsAndLosses,
      benefits: [],
      rates,
      symbolPrices,
    });
  }, [gainsAndLosses, rates, symbolPrices, isFetching]);

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

  return (
    <div className="container">
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
            <a
              href="/2021_mc-kenzie-taxes-presentation.pdf"
              target="_blank"
              className="underline"
            >
              guide
            </a>{" "}
            sent by equity team in 2021 was used to create this calculator
          </p>
        </MessageBox>
        <div className="my-2">
          Based on the <b>expanded</b> exports both for Gain And Losses (My
          Account &gt; Gains and losses) and Benefit History (My Account &gt;
          Benefit History) from Etrade.
        </div>
      </div>
      {gainsAndLosses.length === 0 ? (
        <div className="flex items-baseline justify-center gap-3">
          <span>Import the Gains and Losses CSV file: </span>
          <EtradeGainAndLossesFileInput setData={setGainsAndLosses} />
        </div>
      ) : isFetching ? (
        <p>Loading...</p>
      ) : (
        <div className="container">
          <div className="flex items-baseline justify-between gap-3 print:hidden">
            <span>Gains and Losses</span>
            <Button
              label="Clear"
              color="red"
              onClick={() => setGainsAndLosses([])}
            />
          </div>
          <div className="flex gap-2 items-baseline justify-items-start print:hidden">
            <input
              type="checkbox"
              id="printMode"
              checked={isPrintMode}
              onChange={() => setIsPrintMode(!isPrintMode)}
            />
            <label htmlFor="printMode">Print mode</label>
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
          <Section title="Select Income Source and Anexes">
            <div className="flex gap-2 justify-items-center items-start">
              <div>
                {taxes["3VG"] !== 0 &&
                (taxes["1TT"] !== 0 || taxes["1TZ"] !== 0) ? (
                  <Image
                    alt="select 'Salaires, gains d'actionnariat salarié' and 'Plus-values et gains divers'"
                    src="/images/fr-taxes/select-income-capital-gains-and-acquisition-gains.png"
                    width={400}
                    height={500}
                  />
                ) : taxes["3VG"] !== 0 ? (
                  <Image
                    alt="select 'Plus-values et gains divers'"
                    src="/images/fr-taxes/select-income-capital-gains-only.png"
                    width={400}
                    height={500}
                  />
                ) : taxes["1TT"] !== 0 || taxes["1TZ"] !== 0 ? (
                  <Image
                    alt="select 'Salaires, gains d'actionnariat salarié'"
                    src="/images/fr-taxes/select-income-acquisition-gains-only.png"
                    width={400}
                    height={500}
                  />
                ) : (
                  <Image
                    alt="No specific income selection"
                    src="/images/fr-taxes/select-income-no-shares.png"
                    width={400}
                    height={500}
                  />
                )}
                <Image
                  className="mt-1"
                  alt="Compte a l'etranger"
                  src="/images/fr-taxes/comptes-a-l-etranger.png"
                  width={400}
                  height={500}
                />
              </div>
              <div>
                {gainsAndLosses.length > 0 ? (
                  <Image
                    alt="Select Anexes N° 2074 and N° 3916 - 3916 bis"
                    src="/images/fr-taxes/select-anexes-with-share-sales.png"
                    width={400}
                    height={500}
                  />
                ) : (
                  <Image
                    alt="Select Anexes N° 3916 - 3916 bis"
                    src="/images/fr-taxes/select-anexes-with-no-share-sales.png"
                    width={400}
                    height={500}
                  />
                )}
              </div>
            </div>
          </Section>
          <Section title="French Taxes">
            <div>
              <TaxReportBox
                id="1AJ"
                title="Total income. Depending on your situation, you might use 1BJ instead. WARNING: unqualified options acquisition gain is not yet computed."
                amount={taxes["1AJ"]}
                explanations={taxes.explanations}
                gainType="acquisition"
                forceOpen={isPrintMode}
              />
              <TaxReportBox
                id="1TT"
                title="Qualified RSUs acquisition gain above 300K€ and qualified Stock options acquisition gain."
                amount={taxes["1TT"]}
                explanations={taxes.explanations}
                gainType="acquisition"
                forceOpen={isPrintMode}
              />
              <TaxReportBox
                id="1TZ"
                title="Qualified RSUs acquisition gain below 300K€ with 50% discount."
                amount={taxes["1TZ"]}
                explanations={taxes.explanations}
                gainType="acquisition"
                forceOpen={isPrintMode}
              />
              <TaxReportBox
                id="1WZ"
                title="Qualified RSUs acquisition gain below 300K€ benefits from a 50% reduction declared here."
                amount={taxes["1WZ"]}
                explanations={taxes.explanations}
                gainType="acquisition"
                forceOpen={isPrintMode}
              />
              <TaxReportBox
                id="3VG"
                title="Social contributions on acquisition gain"
                amount={taxes["3VG"]}
                explanations={taxes.explanations}
                gainType="capital"
                forceOpen={isPrintMode}
              />
              <TaxReportBox
                id="3VH"
                title="If you have capital losses from previous years, you can deduct them here."
                amount="???"
                explanations={taxes.explanations}
                gainType="capital"
                forceOpen={isPrintMode}
              />
              <p>Form 2074 details will be displayed soon.</p>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
};

const TaxReportBox: React.FunctionComponent<{
  /** Unique id for the box (1TT, 3VG...) */
  id: string;
  /** Human readable title of the box */
  title: React.ReactNode;
  /** Value to fill the box with */
  amount: number | string;
  /** Detailed explanation how the amount was computed */
  explanations: {
    box: string;
    description: string;
    taxableEvents: TaxableEventFrProps[];
  }[];
  gainType: "acquisition" | "capital";
  forceOpen?: boolean;
}> = ({ id, title, amount, explanations, gainType, forceOpen }) => {
  const relatedExplanations = explanations.filter(({ box }) => box === id);
  return (
    <div className="bg-sky-200 mb-2 py-1 px-2">
      <div className="flex items-center gap-3 py-2">
        <h2 className="font-bold text-lg">{id}</h2>
        <span className="p-2 bg-gray-200 border border-gray-500 border-solid w-32 text-right font-bold">
          {typeof amount === "number"
            ? `${Math.floor(amount) /* Tax form only accepts integers */} €`
            : amount}
        </span>
        <Tooltip content={title}>
          <span className="text-blue-600 inline-block">
            <InformationCircleIcon className="h-6 w-6" />
          </span>
        </Tooltip>
      </div>
      {relatedExplanations.length > 0 && (
        <Drawer title="Details" forceOpen={forceOpen}>
          <div className="bg-slate-200 m-1 p-1">
            {relatedExplanations.map((explanation) => (
              <div key={explanation.description}>
                {explanation.taxableEvents.length > 0 ? (
                  <Drawer
                    title={<span>{explanation.description}</span>}
                    forceOpen={forceOpen}
                  >
                    {explanation.taxableEvents.map((taxableEvent, index) => (
                      <TaxableEventFr
                        key={index}
                        event={taxableEvent}
                        showCapitalGains={gainType === "capital"}
                        showAcquisitionGains={gainType === "acquisition"}
                        forceOpen={forceOpen}
                      />
                    ))}
                  </Drawer>
                ) : (
                  <span>{explanation.description}</span>
                )}
              </div>
            ))}
          </div>
        </Drawer>
      )}
    </div>
  );
};
