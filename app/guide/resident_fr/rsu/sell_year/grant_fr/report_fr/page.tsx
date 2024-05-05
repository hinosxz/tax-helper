import { Calculator } from "@/app/guide/shared/Calculator";
import { Link } from "@/app/guide/shared/ui/Link";
import { Section } from "@/app/guide/shared/ui/Section";
import { eTradeGainsLossesUrl } from "@/lib/constants";

export default function Page() {
  return (
    <div className="grid cols-1 gap-8">
      <Section title="Guide">
        <div className="grid cols-1 gap-2">
          <p>
            In your tax report, if you haven't already, please select form
            <span className="italic"> 2074</span>. The following calculator will
            help you determine how you should fill it out for RSU sales. For
            each sale, you will have to fill a new section of the form (fields
            512, 514, 515, 520, 521 and 524). Once you've filled out the form
            for all sale events, field 3VG should be pre-filled with your total
            adjusted gain / loss (in euros). That represents the
            <span className="italic"> Capital Gain</span> part of your tax
            report.
          </p>
          <p>
            To report the <span className="italic">Income</span> part, you will
            use field 1TZ ("gain imposable après abattement") and 1WZ
            ("abattement de 50%") of the main form.
          </p>
          <p>
            For ETrade users, the name of the inputs below should match the
            columns in your "Gains and Losses" spreadsheet. You can download
            that Spreadsheet in the{" "}
            <Link href={eTradeGainsLossesUrl} isExternal>
              Gains and Losses
            </Link>{" "}
            page after selecting your tax year and clicking "Download" and
            "Download Expanded".
          </p>
        </div>
      </Section>
      <Calculator qualifiedIn="fr" planType="RS" />
    </div>
  );
}
