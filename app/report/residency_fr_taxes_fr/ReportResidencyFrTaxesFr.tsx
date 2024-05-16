import { useMemo, useState } from "react";
import Image from "next/image";
import { match } from "ts-pattern";
import { EtradeGainAndLossesFileInput } from "@/app/guide/shared/EtradeGainAndLossesFileInput";
import { useExchangeRates } from "@/hooks/use-fetch-exr";
import { Button } from "@/app/guide/shared/ui/Button";
import { GainAndLossEvent } from "@/lib/etrade/etrade.types";
import {
  FrTaxes,
  applyFrTaxes,
  getEmptyTaxes,
} from "@/lib/taxes/taxes-rules-fr";
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
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { useFetchSymbolDaily } from "@/hooks/use-fetch-symbol-daily";
import { Link } from "@/app/guide/shared/ui/Link";

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
      {gainsAndLosses.length === 0 ? (
        <div className="flex items-baseline justify-center gap-3">
          <span>Import the Gains and Losses CSV file: </span>
          <EtradeGainAndLossesFileInput setData={setGainsAndLosses} />
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
                onClick={() => setGainsAndLosses([])}
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
          <Section title="Select Income Source and Anexes">
            <div className="flex gap-2 justify-items-center items-start">
              <div>
                {match({
                  hasCapitalGains: taxes["3VG"] !== 0,
                  hasAcquisitionGains: taxes["1TT"] !== 0 || taxes["1TZ"] !== 0,
                })
                  .with(
                    { hasCapitalGains: true, hasAcquisitionGains: true },
                    () => (
                      <Image
                        alt="select 'Salaires, gains d'actionnariat salarié' and 'Plus-values et gains divers'"
                        src="/images/fr-taxes/select-income-capital-gains-and-acquisition-gains.png"
                        width={400}
                        height={500}
                      />
                    ),
                  )
                  .with(
                    { hasCapitalGains: true, hasAcquisitionGains: false },
                    () => (
                      <Image
                        alt="select 'Plus-values et gains divers'"
                        src="/images/fr-taxes/select-income-capital-gains-only.png"
                        width={400}
                        height={500}
                      />
                    ),
                  )
                  .with(
                    { hasCapitalGains: false, hasAcquisitionGains: true },
                    () => (
                      <Image
                        alt="select 'Salaires, gains d'actionnariat salarié'"
                        src="/images/fr-taxes/select-income-acquisition-gains-only.png"
                        width={400}
                        height={500}
                      />
                    ),
                  )
                  .with(
                    { hasCapitalGains: false, hasAcquisitionGains: false },
                    () => (
                      <Image
                        alt="No specific income selection"
                        src="/images/fr-taxes/select-income-no-shares.png"
                        width={400}
                        height={500}
                      />
                    ),
                  )
                  .exhaustive()}
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
          <Section title="Foreign accounts">
            <div className="flex justify-between">
              <div className="flex flex-col justify-between">
                <div>
                  <p>
                    Make sure you check <strong>8UU</strong>
                  </p>
                  <Image
                    src="/images/fr-taxes/foreign-account-8uu.png"
                    alt="Check 8UU"
                    width={400}
                    height={500}
                  />
                </div>
                <div className="flex gap-1 items-start justify-start">
                  <span>Find your Morgan Stanley's accounts details in </span>
                  <Link href="https://us.etrade.com/etx/pxy/my-profile/account-preferences">
                    <Image
                      src="/images/fr-taxes/etrade-account-details.png"
                      alt="profile > account preferences"
                      width={150}
                      height={150}
                    />
                  </Link>
                </div>
              </div>
              <div>
                <Image
                  alt="Compte a l'etranger"
                  src="/images/fr-taxes/foreign-account-form.png"
                  width={400}
                  height={500}
                />
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
            </div>
          </Section>
          <Section title="Form 2074">
            <div>
              <p>
                You must report{" "}
                <strong>{taxes["Form 2074"]["Page 510"].length}</strong> in this
                form.
              </p>
              <Image
                alt="Form 2074 - Page 1"
                src="/images/fr-taxes/form-2074-page-1.png"
                width={800}
                height={500}
                className="print:hidden"
              />
            </div>
            <div className="mt-6">
              <Page510 taxes={taxes} isPrintMode={isPrintMode} />
            </div>
          </Section>
          <Section title="Source of information">
            <div>Some external sources are used to compute data:</div>
            <ul className="list-disc pl-6 mt-2">
              <li>
                <Link href="https://us.etrade.com/etx/pxy/my-account/export">
                  Etrade Gains and Losses <strong>Expanded</strong>
                </Link>
              </li>
              <li>
                The exchange rates are fetched from the{" "}
                <Link href="https://data.ecb.europa.eu/help/api/data">
                  European Central Bank API
                </Link>
                <Tooltip
                  content={
                    "https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A"
                  }
                  maxWidth="none"
                >
                  <span className="text-blue-600 inline-block">
                    <InformationCircleIcon className="h-6 w-6 ml-2" />
                  </span>
                </Tooltip>
              </li>
              <li>
                Stock prices are fetched from{" "}
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
    <div className="bg-blue-200 mb-2 py-1 px-2 print:border print:mb-2">
      <div className="flex items-center gap-3 py-2">
        <h2 className="font-bold text-lg">{id}</h2>
        <span className="p-2 bg-white border border-gray-500 border-solid w-32 text-right font-bold">
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
                      <div
                        key={index}
                        className="print:border print:mb-2 print:text-xs"
                      >
                        <TaxableEventFr
                          event={taxableEvent}
                          showCapitalGains={gainType === "capital"}
                          showAcquisitionGains={gainType === "acquisition"}
                          forceOpen={forceOpen}
                        />
                      </div>
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

const PAGE_510_LABELS = {
  "511": "Désignation des titres et des intermédiaires financiers",
  "512": "Date de la cession ou du rachat jj/mm/aaaa",
  "513": "Nombre de titres cédés ou rachetés",
  "514": "Valeur unitaire de cession",
  "515": "Nombre de titres cédés",
  "516": "Montant global lignes (514 x 515)",
  "517": "Frais de cession cf. notice",
  "518": "Prix de cession net lignes (516 - 517)",
  "519": "Détermination du prix de revient des titres",
  "520": "Prix ou valeur d’acquisition unitaire cf. notice",
  "521": "Prix d'acquisition global cf. notice",
  "522": "Frais d'acquisition",
  "523": "Prix de revient lignes (521 + 522)",
  "524": "Résultat précédé du signe + ou - lignes (518 - 523)",
  "525":
    "Je demande expressément à bénéficier de l'imputation des moins-values préalablement à l'annulation des titres cf. notice",
  "526": "Montant des moins-values imputées pour les titres concernés",
};

const Page510: React.FunctionComponent<{
  taxes: FrTaxes;
  isPrintMode?: boolean;
}> = ({ taxes, isPrintMode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!taxes["Form 2074"]["Page 510"].length) {
    return <p>No taxable events to report.</p>;
  }
  const pagesToDisplay = isPrintMode
    ? taxes["Form 2074"]["Page 510"]
    : [taxes["Form 2074"]["Page 510"][currentIndex]];
  return (
    <div>
      {pagesToDisplay.map((currentPage, index) => (
        <div key={index} className="m-t-2 print:border print:mb-2">
          <h2 className="text-lg text-center">
            Page {(isPrintMode ? index : currentIndex) + 1}
          </h2>
          <table className="my-2 border-collapse text-sm">
            <tbody>
              {Object.keys(currentPage).map((key) => (
                <tr
                  key={key}
                  className="border-y-2 border-white bg-blue-200 *:p-2"
                >
                  <th>{key}</th>
                  <td>{PAGE_510_LABELS[key as keyof typeof currentPage]}</td>
                  <td>
                    {typeof currentPage[key as keyof typeof currentPage] ===
                    "boolean" ? (
                      <input
                        type="checkbox"
                        checked={
                          currentPage[
                            key as keyof typeof currentPage
                          ] as boolean
                        }
                        readOnly
                      />
                    ) : typeof currentPage[key as keyof typeof currentPage] !==
                      "undefined" ? (
                      <span className="inline-block w-32 p-1 bg-white border border-black">
                        {currentPage[key as keyof typeof currentPage]}
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {!isPrintMode && (
        <div className="flex justify-between print:hidden">
          <Button
            label="Previous"
            icon={ChevronDoubleLeftIcon}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            isDisabled={currentIndex === 0}
            color={"green"}
          />
          <Button
            label="Next"
            icon={ChevronDoubleRightIcon}
            onClick={() => setCurrentIndex(currentIndex + 1)}
            isDisabled={
              currentIndex === taxes["Form 2074"]["Page 510"].length - 1
            }
            color={"green"}
          />
        </div>
      )}
    </div>
  );
};
