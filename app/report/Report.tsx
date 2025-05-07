"use client";
import { useState } from "react";
import classNames from "classnames";
import { ReportResidencyFr } from "./_ReportResidencyFr";
import { Select } from "@/components/ui/Select";
import { match } from "ts-pattern";
import NotImplemented from "@/components/NotImplemented";

export type CountryCode = "us" | "fr";
export interface ReportProps {}

export const Report: React.FunctionComponent<ReportProps> = () => {
  const [taxResidency, setTaxResidency] = useState<CountryCode>("fr");

  return (
    <div>
      <div className={classNames("w-fit flex p-4 items-center gap-2")}>
        <div className="text-2xl font-bold">Tax Report</div>
        <span>|</span>
        <Select
          className="text-lg"
          label="Residency:"
          onChange={setTaxResidency}
          options={[
            { label: "US", value: "us" },
            { label: "FR", value: "fr" },
          ]}
          value={taxResidency}
        />
      </div>
      <div>
        {match({ taxResidency })
          .with({ taxResidency: "fr" }, () => <ReportResidencyFr />)
          .otherwise(() => (
            <NotImplemented />
          ))}
      </div>
    </div>
  );
};
