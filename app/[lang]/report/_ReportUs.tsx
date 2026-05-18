import { Section } from "@/components/ui/Section";
import type { FrTaxes } from "@/lib/taxes/taxes-rules-fr";
import Image from "next/image";
import { TaxReportBox } from "./_TaxReportBox";
import { match } from "ts-pattern";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface ReportUsProps {
  isPrintMode: boolean;
  taxes: FrTaxes;
  dict: Dictionary;
}

export const ReportUs = ({ isPrintMode, taxes, dict }: ReportUsProps) => {
  const reportDict = dict.report;
  return (
    <>
      <Section title={reportDict.sections.selectIncomeSource}>
        <div className="flex gap-2 justify-items-center items-start">
          <div>
            {match({
              hasAcquisitionGains: taxes["1TT"] !== 0 || taxes["1TZ"] !== 0,
            })
              .with(
                {
                  hasAcquisitionGains: true,
                },
                () => (
                  <Image
                    alt={reportDict.fr.alts.selectIncomeAcquisitionOnly}
                    src="/images/fr-taxes/select-income-acquisition-gains-only.png"
                    width={400}
                    height={500}
                  />
                ),
              )
              .with(
                {
                  hasAcquisitionGains: false,
                },
                () => (
                  <Image
                    alt={reportDict.fr.alts.selectIncomeNoShares}
                    src="/images/fr-taxes/select-income-no-shares.png"
                    width={400}
                    height={500}
                  />
                ),
              )
              .exhaustive()}
          </div>
        </div>
      </Section>
      <Section title={reportDict.sections.frenchTaxes}>
        <div>
          <TaxReportBox
            id="1AJ"
            title={reportDict.fr.boxes["1AJ"]}
            amount={taxes["1AJ"]}
            explanations={taxes.explanations}
            gainType="acquisition"
            forceOpen={isPrintMode}
            dict={dict}
          />
          <TaxReportBox
            id="1TT"
            title={reportDict.fr.boxes["1TT"]}
            amount={taxes["1TT"]}
            explanations={taxes.explanations}
            gainType="acquisition"
            forceOpen={isPrintMode}
            dict={dict}
          />
          <TaxReportBox
            id="1TZ"
            title={reportDict.fr.boxes["1TZ"]}
            amount={taxes["1TZ"]}
            explanations={taxes.explanations}
            gainType="acquisition"
            forceOpen={isPrintMode}
            dict={dict}
          />
          <TaxReportBox
            id="1WZ"
            title={reportDict.fr.boxes["1WZ"]}
            amount={taxes["1WZ"]}
            explanations={taxes.explanations}
            gainType="acquisition"
            forceOpen={isPrintMode}
            dict={dict}
          />
        </div>
      </Section>
    </>
  );
};
