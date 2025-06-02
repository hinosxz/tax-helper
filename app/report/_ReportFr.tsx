import { Section } from "@/components/ui/Section";
import type { FrTaxes } from "@/lib/taxes/taxes-rules-fr";
import Image from "next/image";
import { Link } from "@/components/ui/Link";
import { TaxReportBox } from "./_TaxReportBox";
import { Currency } from "@/components/ui/Currency";
import { Button } from "@/components/ui/Button";
import { match } from "ts-pattern";

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
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
        {isPrintMode ? null : (
          <div className="print:hidden mt-6">
            <div className="text-lg font-bold my-auto mb-2">
              One Last Step For Form 2074
            </div>
            <p>
              You must report{" "}
              <strong>
                <Currency unit="eur" value={taxes["3VG"]} />
              </strong>{" "}
              on line <strong>1133</strong>.
            </p>
            <Image
              src="/images/fr-taxes/form-2074-box-1133.png"
              alt="Form 2074 - Box 1133"
              width={800}
              height={500}
              className="print:hidden"
            />
          </div>
        )}
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
