import { Section } from "@/components/ui/Section";
import type { FrTaxes } from "@/lib/taxes/taxes-rules-fr";
import type { TaxableEventFr } from "@/lib/taxes/taxable-event-fr";
import Image from "next/image";
import { Link } from "@/components/ui/Link";
import { TaxReportBox } from "./_TaxReportBox";
import { Currency } from "@/components/ui/Currency";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PriceInEuro } from "@/components/ui/PriceInEuro";
import { CopyButton } from "@/components/ui/CopyButton";
import { match } from "ts-pattern";

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/solid";
import { Fragment, useState } from "react";
import { CopyableCell } from "./_CopyableCell";

interface ReportResidencyFrContentProps {
  hasSoldShares: boolean;
  isPrintMode: boolean;
  taxes: FrTaxes;
}

export const ReportFr = ({
  hasSoldShares,
  isPrintMode,
  taxes,
}: ReportResidencyFrContentProps) => {
  const form2074Line1133 = taxes["Form 2074"]["page 11"]["1133"];

  return (
    <>
      <Section title="Select Income Source and Annexes">
        <div className="flex gap-2 justify-items-center items-start">
          <div>
            {match({
              hasCapitalGains: taxes["3VG"] !== 0,
              hasAcquisitionGains: taxes["1TT"] !== 0 || taxes["1TZ"] !== 0,
            })
              .with(
                {
                  hasCapitalGains: true,
                  hasAcquisitionGains: true,
                },
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
                {
                  hasCapitalGains: true,
                  hasAcquisitionGains: false,
                },
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
                {
                  hasCapitalGains: false,
                  hasAcquisitionGains: true,
                },
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
                {
                  hasCapitalGains: false,
                  hasAcquisitionGains: false,
                },
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
            {hasSoldShares ? (
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
            title="Total net taxable capital gains"
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
        <QualifiedAtLossSection taxes={taxes} isPrintMode={isPrintMode} />
        <div className="mt-6">
          <div className="text-lg font-bold my-auto mb-2">
            Automatic reporting from Form 2074
          </div>
          {form2074Line1133.losses > 0 ? (
            <>
              <p>
                You must report{" "}
                <strong>
                  <Currency unit="eur" value={form2074Line1133.gains} />
                </strong>{" "}
                (capital gains) and{" "}
                <strong>
                  <Currency unit="eur" value={form2074Line1133.losses} />
                </strong>{" "}
                (capital losses) on line <strong>1133</strong>.
              </p>
            </>
          ) : (
            <p>
              You must report{" "}
              <strong>
                <Currency unit="eur" value={form2074Line1133.gains} />
              </strong>{" "}
              on line <strong>1133</strong>.
            </p>
          )}
          <AutomaticReportingTable
            gains={form2074Line1133.gains}
            losses={form2074Line1133.losses}
          />
          <div className="mt-6 print:hidden">
            <p className="mb-3 text-slate-700">
              <strong>Hint:</strong> At the end of Form 2074, you should have{" "}
              <strong>3VG</strong> with{" "}
              <span className="font-semibold text-red-700">
                "report activé"
              </span>{" "}
              in the automatic reporting table:
            </p>
            <Image
              alt="Form 2074 — automatic reporting table: 3VG with report activé"
              src="/images/fr-taxes/form-2074-report-active.png"
              width={800}
              height={480}
            />
          </div>
        </div>
      </Section>
    </>
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
  "520": "Prix ou valeur d'acquisition unitaire cf. notice",
  "521": "Prix d'acquisition global cf. notice",
  "522": "Frais d'acquisition",
  "523": "Prix de revient lignes (521 + 522)",
  "524": "Résultat précédé du signe + ou - lignes (518 - 523)",
  "525":
    "Je demande expressément à bénéficier de l'imputation des moins-values préalablement à l'annulation des titres cf. notice",
  "526": "Montant des moins-values imputées pour les titres concernés",
};

const EMPTY_CELL = " ";

const PAGE_11_LABELS = {
  line1133Description:
    "Valeurs mobilières, droits sociaux, titres assimilés sans abattement et éligibles à l'abattement de droit commun",
  titresA: "Titres A",
  titresB: "Titres B",
  titresC: "Titres C",
  totaux: "Totaux",
};

const AutomaticReportingTable: React.FunctionComponent<{
  gains: number;
  losses: number;
}> = ({ gains, losses }) => {
  const roundedGains = Math.floor(gains);
  const roundedLosses = Math.floor(losses);
  const total = roundedGains - roundedLosses;
  const rows = [
    {
      label: PAGE_11_LABELS.titresA,
      gains: roundedGains,
      losses: roundedLosses > 0 ? roundedLosses : EMPTY_CELL,
      subtotal: total,
      adjustment: EMPTY_CELL,
      total,
      highlight: true,
    },
    {
      label: PAGE_11_LABELS.titresB,
      gains: EMPTY_CELL,
      losses: EMPTY_CELL,
      subtotal: EMPTY_CELL,
      adjustment: EMPTY_CELL,
      total: EMPTY_CELL,
      highlight: false,
    },
    {
      label: PAGE_11_LABELS.titresC,
      gains: EMPTY_CELL,
      losses: EMPTY_CELL,
      subtotal: EMPTY_CELL,
      adjustment: EMPTY_CELL,
      total: EMPTY_CELL,
      highlight: false,
    },
  ];

  return (
    <div className="automatic-reporting-print-root mt-4 overflow-x-auto p-3 sm:p-4 bg-blue-200 print:border print:overflow-x-visible print:overflow-y-visible">
      <div className="automatic-reporting-print-inner min-w-[760px] pr-3 sm:min-w-[900px] sm:pr-4">
        <div className="mb-3 text-base leading-relaxed sm:mb-4">
          <span className="font-bold text-black">1133</span>{" "}
          {PAGE_11_LABELS.line1133Description}
        </div>
        <div className="grid grid-cols-[130px_1fr_20px_1fr_20px_1fr_20px_1fr_20px_1fr] items-center gap-y-2 sm:grid-cols-[160px_1fr_28px_1fr_28px_1fr_28px_1fr_28px_1fr]">
          {rows.map((row) => (
            <Fragment key={row.label}>
              <div
                className={
                  row.highlight ? "text-base font-semibold" : "text-base"
                }
              >
                {row.label}
              </div>
              <Form2074Cell
                value={row.gains}
                copyValue={row.highlight ? roundedGains : undefined}
              />
              <div className="text-center text-base font-medium text-slate-700">
                -
              </div>
              <Form2074Cell
                value={row.losses}
                copyValue={
                  row.highlight && roundedLosses > 0 ? roundedLosses : undefined
                }
              />
              <div className="text-center text-base font-medium text-slate-700">
                =
              </div>
              <Form2074Cell value={row.subtotal} />
              <div className="text-center text-base font-medium text-slate-700">
                -
              </div>
              <Form2074Cell value={row.adjustment} />
              <div className="text-center text-base font-medium text-slate-700">
                =
              </div>
              <Form2074Cell value={row.total} />
            </Fragment>
          ))}
          <div className="pt-3 text-base font-semibold">
            {PAGE_11_LABELS.totaux}
          </div>
          <div className="col-span-8" />
          <div className="pt-3">
            <Form2074Cell value={total} emphasize />
          </div>
          <div className="col-span-9" />
          <div className="pt-2 text-center text-sm font-medium text-blue-800">
            Automatically reported to 3VG
          </div>
        </div>
      </div>
    </div>
  );
};

const Form2074Cell: React.FunctionComponent<{
  value: number | string;
  copyValue?: number;
  emphasize?: boolean;
}> = ({ value, copyValue, emphasize }) => {
  if (copyValue !== undefined) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex h-[30px] min-w-[7rem] items-center justify-end border border-black bg-white px-3 text-right text-base">
          {copyValue}
        </span>
        <CopyButton value={copyValue} />
      </div>
    );
  }

  return (
    <div
      className={`flex h-[30px] min-w-[7rem] items-center justify-end border border-black bg-white px-3 text-right text-base ${
        emphasize ? "font-semibold" : ""
      }`}
    >
      {value}
    </div>
  );
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
              {Object.keys(currentPage).map((key) => {
                const value = currentPage[key as keyof typeof currentPage];
                return (
                  <tr
                    key={key}
                    className="border-y-2 border-white bg-blue-200 *:p-2"
                  >
                    <th>{key}</th>
                    <td>{PAGE_510_LABELS[key as keyof typeof currentPage]}</td>
                    <td>
                      {typeof value === "boolean" ? (
                        <input type="checkbox" checked={value} readOnly />
                      ) : value !== undefined ? (
                        <CopyableCell value={value as string | number} />
                      ) : null}
                    </td>
                  </tr>
                );
              })}
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

const QualifiedAtLossSection: React.FunctionComponent<{
  taxes: FrTaxes;
  isPrintMode?: boolean;
}> = ({ taxes, isPrintMode }) => {
  const entries = taxes.explanations
    .filter((e) => e.box === "1TT" || e.box === "1TZ")
    .flatMap((e) => e.taxableEvents)
    .filter(
      (
        e,
      ): e is TaxableEventFr & { sell: NonNullable<TaxableEventFr["sell"]> } =>
        !!e.isQualifiedAtLoss && e.sell !== null,
    );

  if (!entries.length) return null;

  const planDescription = (planType: TaxableEventFr["planType"]) =>
    planType === "SO" ? "Stock Options" : planType === "RS" ? "RSU" : "ESPP";

  return (
    <Drawer
      title="Some events are not reported in Form 2074, expand to learn why"
      forceOpen={isPrintMode}
    >
      <div className="mt-4 text-sm text-gray-700">
        <p className="mb-3">
          The following events are not reported in Form 2074 because the sale
          price is below the vesting/exercise value. Per{" "}
          <Link href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000026947022/2024-03-22/">
            Art. 150-0 D §11 / Art. 80 quaterdecies V CGI
          </Link>
          , the loss is deducted from the acquisition gain (1TT/1TZ) instead.
        </p>
        <table className="border-collapse w-full">
          <thead>
            <tr className="bg-blue-300 *:p-2 text-left">
              <th>Symbol</th>
              <th>Date of sale</th>
              <th>Qty</th>
              <th>Sale price/share</th>
              <th>Vesting price/share</th>
              <th>Loss/share</th>
              <th>Loss deducted from acquisition gain</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const sellEur = entry.sell.eur;
              const vestingEur = entry.acquisition.symbolPriceEur;
              const lossPerShare = sellEur - vestingEur;
              const lossDeducted =
                (vestingEur - sellEur) *
                entry.quantity *
                entry.acquisitionGain.fractionFr;
              return (
                <tr
                  key={i}
                  className="border-y-2 border-white bg-blue-100 *:p-2"
                >
                  <td>
                    {entry.symbol} ({planDescription(entry.planType)})
                  </td>
                  <td>{entry.sell.date}</td>
                  <td>{entry.quantity}</td>
                  <td>
                    <PriceInEuro
                      eur={sellEur}
                      usd={entry.sell.usd}
                      rate={entry.sell.rate}
                      date={entry.sell.date}
                      precision={6}
                    />
                  </td>
                  <td>
                    <PriceInEuro
                      eur={vestingEur}
                      usd={entry.acquisition.symbolPrice}
                      rate={entry.acquisition.rate}
                      date={entry.acquisition.date}
                      precision={6}
                    />
                  </td>
                  <td className="text-red-700">
                    <Currency unit="eur" value={lossPerShare} precision={6} />
                  </td>
                  <td className="text-red-700 font-bold">
                    <Currency unit="eur" value={-lossDeducted} precision={2} />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-blue-200 *:p-2 font-bold">
              <td colSpan={6}>Total loss deducted from acquisition gain</td>
              <td className="text-red-700">
                <Currency
                  unit="eur"
                  value={
                    -entries.reduce((sum, entry) => {
                      const lossDeducted =
                        (entry.acquisition.symbolPriceEur - entry.sell.eur) *
                        entry.quantity *
                        entry.acquisitionGain.fractionFr;
                      return sum + lossDeducted;
                    }, 0)
                  }
                  precision={2}
                />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Drawer>
  );
};
