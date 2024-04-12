import { Section } from "@/app/guide/shared/ui/Section";
import { Calculator } from "./Calculator";
import { Link } from "@/app/guide/shared/ui/Link";
import { Button } from "@/app/guide/shared/ui/Button";

const gainsLossesUrl =
  "https://us.etrade.com/etx/sp/stockplan#/myAccount/gainsLosses";

export default function Page() {
  return (
    <div className="grid cols-1 gap-8">
      <Section title="Guide">
        <div className="grid cols-1 gap-2">
          <p>
            In your tax report, if you haven't already, please select form{" "}
            <span className="text-bold">2074</span>. The following calculator
            will help you determine how you should fill it out for ESPP sales.
            For each sale, you will have to fill a new section of the form
            (fields 512, 514, 515, 520, 521 and 524). Once you've filled out the
            form for all sale events, field 3VG should be pre-filled with your
            total adjusted gain / loss (in euros).
          </p>
          <p>
            For ETrade users, the name of the inputs below should match the
            columns in your "Gains and Losses" spreadsheet. You can download
            that Spreadsheet in the{" "}
            <Link href={gainsLossesUrl} isExternal>
              Gains and Losses
            </Link>{" "}
            page after selecting your tax year and clicking "Download" and
            "Download Collapsed" or "Download Expanded".
          </p>
        </div>
      </Section>
      <Calculator />
    </div>
  );
}
