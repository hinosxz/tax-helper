import { Section } from "@/components/ui/Section";
import type { FrTaxes } from "@/lib/taxes/taxes-rules-fr";
import Image from "next/image";
import { TaxReportBox } from "./_TaxReportBox";
import { match } from "ts-pattern";

interface ReportUsProps {
  isPrintMode: boolean;
  taxes: FrTaxes;
}

export const ReportUs = ({ isPrintMode, taxes }: ReportUsProps) => {
  return (
    <>
      <Section title="Select Income Source and Annexes">
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
                    alt="select 'Salaires, gains d'actionnariat salarié'"
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
                    alt="No specific income selection"
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
        </div>
      </Section>
    </>
  );
};
