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
import { match } from "ts-pattern";

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import { CopyableCell } from "./_CopyableCell";
import { AutomaticReportingTable } from "./_AutomaticReportingTable";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface ReportResidencyFrContentProps {
  hasSoldShares: boolean;
  isPrintMode: boolean;
  taxes: FrTaxes;
  dict: Dictionary;
}

export const ReportFr = ({
  hasSoldShares,
  isPrintMode,
  taxes,
  dict,
}: ReportResidencyFrContentProps) => {
  const reportDict = dict.report;
  const frDict = reportDict.fr;
  const form2074Line1133 = taxes["Form 2074"]["page 11"]["1133"];

  return (
    <>
      <Section title={reportDict.sections.selectIncomeSource}>
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
                    alt={frDict.alts.selectIncomeBoth}
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
                    alt={frDict.alts.selectIncomeCapitalOnly}
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
                    alt={frDict.alts.selectIncomeAcquisitionOnly}
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
                    alt={frDict.alts.selectIncomeNoShares}
                    src="/images/fr-taxes/select-income-no-shares.png"
                    width={400}
                    height={500}
                  />
                ),
              )
              .exhaustive()}
            <Image
              className="mt-1"
              alt={frDict.alts.foreignAccount}
              src="/images/fr-taxes/comptes-a-l-etranger.png"
              width={400}
              height={500}
            />
          </div>
          <div>
            {hasSoldShares ? (
              <Image
                alt={frDict.alts.annexesWithSales}
                src="/images/fr-taxes/select-anexes-with-share-sales.png"
                width={400}
                height={500}
              />
            ) : (
              <Image
                alt={frDict.alts.annexesWithoutSales}
                src="/images/fr-taxes/select-anexes-with-no-share-sales.png"
                width={400}
                height={500}
              />
            )}
          </div>
        </div>
      </Section>
      <Section title={reportDict.sections.foreignAccounts}>
        <div className="flex justify-between">
          <div className="flex flex-col justify-between">
            <div>
              <p>
                {frDict.foreignAccounts.check8uuPrefix}
                <strong>8UU</strong>
              </p>
              <Image
                src="/images/fr-taxes/foreign-account-8uu.png"
                alt={frDict.alts.check8uu}
                width={400}
                height={500}
              />
            </div>
            <div className="flex gap-1 items-start justify-start">
              <span>{frDict.foreignAccounts.morganStanleyPrefix}</span>
              <Link href="https://us.etrade.com/etx/pxy/my-profile/account-preferences">
                <Image
                  src="/images/fr-taxes/etrade-account-details.png"
                  alt={frDict.alts.etradeAccountDetails}
                  width={150}
                  height={150}
                />
              </Link>
            </div>
          </div>
          <div>
            <Image
              alt={frDict.alts.foreignAccountForm}
              src="/images/fr-taxes/foreign-account-form.png"
              width={400}
              height={500}
            />
          </div>
        </div>
      </Section>
      <Section title={reportDict.sections.frenchTaxes}>
        <div>
          <TaxReportBox
            id="1AJ"
            title={frDict.boxes["1AJ"]}
            amount={taxes["1AJ"]}
            explanations={taxes.explanations}
            gainType="acquisition"
            forceOpen={isPrintMode}
            dict={dict}
          />
          <TaxReportBox
            id="1TT"
            title={frDict.boxes["1TT"]}
            amount={taxes["1TT"]}
            explanations={taxes.explanations}
            gainType="acquisition"
            forceOpen={isPrintMode}
            dict={dict}
          />
          <TaxReportBox
            id="1TZ"
            title={frDict.boxes["1TZ"]}
            amount={taxes["1TZ"]}
            explanations={taxes.explanations}
            gainType="acquisition"
            forceOpen={isPrintMode}
            dict={dict}
          />
          <TaxReportBox
            id="1WZ"
            title={frDict.boxes["1WZ"]}
            amount={taxes["1WZ"]}
            explanations={taxes.explanations}
            gainType="acquisition"
            forceOpen={isPrintMode}
            dict={dict}
          />
          <TaxReportBox
            id="3VG"
            title={frDict.boxes["3VG"]}
            amount={taxes["3VG"]}
            explanations={taxes.explanations}
            gainType="capital"
            forceOpen={isPrintMode}
            dict={dict}
          />
          <TaxReportBox
            id="3VH"
            title={frDict.boxes["3VH"]}
            amount="???"
            explanations={taxes.explanations}
            gainType="capital"
            forceOpen={isPrintMode}
            dict={dict}
          />
        </div>
      </Section>
      <Section title={reportDict.sections.form2074}>
        <div>
          <p>
            {frDict.form2074.reportPagesPrefix}
            <strong>{taxes["Form 2074"]["Page 510"].length}</strong>
            {frDict.form2074.reportPagesSuffix}
          </p>
          <Image
            alt={frDict.alts.form2074Page1}
            src="/images/fr-taxes/form-2074-page-1.png"
            width={800}
            height={500}
            className="print:hidden"
          />
        </div>
        <div className="mt-6">
          <Page510 taxes={taxes} isPrintMode={isPrintMode} dict={dict} />
        </div>
        <QualifiedAtLossSection
          taxes={taxes}
          isPrintMode={isPrintMode}
          dict={dict}
        />
        <div className="mt-6">
          <div className="text-lg font-bold my-auto mb-2">
            {frDict.form2074.automaticReportingTitle}
          </div>
          {form2074Line1133.losses > 0 ? (
            <>
              <p>
                {frDict.form2074.reportGainsAndLossesPrefix}
                <strong>
                  <Currency unit="eur" value={form2074Line1133.gains} />
                </strong>
                {frDict.form2074.reportGainsAndLossesMiddle}
                <strong>
                  <Currency unit="eur" value={form2074Line1133.losses} />
                </strong>
                {frDict.form2074.reportGainsAndLossesLosses}
                <strong>1133</strong>
                {frDict.form2074.lineSuffix}
              </p>
            </>
          ) : (
            <p>
              {frDict.form2074.reportGainsAndLossesPrefix}
              <strong>
                <Currency unit="eur" value={form2074Line1133.gains} />
              </strong>
              {frDict.form2074.reportGainsOnly}
              <strong>1133</strong>
              {frDict.form2074.lineSuffix}
            </p>
          )}
          <AutomaticReportingTable
            gains={form2074Line1133.gains}
            losses={form2074Line1133.losses}
            dict={dict}
          />
          <div className="mt-6 print:hidden">
            <p className="mb-3 text-slate-700">
              <strong>{frDict.form2074.noteAtEndPrefix}</strong>
              <strong>3VG</strong>
              {frDict.form2074.noteAtEndMiddle}
              <span className="font-semibold text-red-700">
                {frDict.form2074.noteAtEndStatus}
              </span>
              {frDict.form2074.noteAtEndSuffix}
            </p>
            <Image
              alt={frDict.alts.form2074ReportActive}
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

const Page510: React.FunctionComponent<{
  taxes: FrTaxes;
  isPrintMode?: boolean;
  dict: Dictionary;
}> = ({ taxes, isPrintMode, dict }) => {
  const frDict = dict.report.fr;
  const labels = dict.report.page510Labels;
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!taxes["Form 2074"]["Page 510"].length) {
    return <p>{frDict.form2074.noEvents}</p>;
  }
  const pagesToDisplay = isPrintMode
    ? taxes["Form 2074"]["Page 510"]
    : [taxes["Form 2074"]["Page 510"][currentIndex]];
  return (
    <div>
      {pagesToDisplay.map((currentPage, index) => (
        <div key={index} className="m-t-2 print:border print:mb-2">
          <h2 className="text-lg text-center">
            {frDict.form2074.page} {(isPrintMode ? index : currentIndex) + 1}
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
                    <td>{labels[key as keyof typeof labels]}</td>
                    <td>
                      {typeof value === "boolean" ? (
                        <input type="checkbox" checked={value} readOnly />
                      ) : value !== undefined ? (
                        <CopyableCell
                          value={value as string | number}
                          dict={dict}
                        />
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
            label={dict.common.previous}
            icon={ChevronDoubleLeftIcon}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            isDisabled={currentIndex === 0}
            color={"green"}
          />
          <Button
            label={dict.common.next}
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
  dict: Dictionary;
}> = ({ taxes, isPrintMode, dict }) => {
  const lossDict = dict.report.fr.qualifiedAtLoss;
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
    lossDict.planTypes[planType];

  return (
    <Drawer title={lossDict.drawerTitle} forceOpen={isPrintMode}>
      <div className="mt-4 text-sm text-gray-700">
        <p className="mb-3">
          {lossDict.explanationPrefix}
          <Link href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000026947022/2024-03-22/">
            {lossDict.legifranceLinkLabel}
          </Link>
          {lossDict.explanationSuffix}
        </p>
        <table className="border-collapse w-full">
          <thead>
            <tr className="bg-blue-300 *:p-2 text-left">
              <th>{lossDict.headers.symbol}</th>
              <th>{lossDict.headers.dateOfSale}</th>
              <th>{lossDict.headers.qty}</th>
              <th>{lossDict.headers.salePricePerShare}</th>
              <th>{lossDict.headers.vestingPricePerShare}</th>
              <th>{lossDict.headers.lossPerShare}</th>
              <th>{lossDict.headers.lossDeducted}</th>
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
              <td colSpan={6}>{lossDict.totalRow}</td>
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
