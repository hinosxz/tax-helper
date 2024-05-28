"use client";
import { useState } from "react";
import classNames from "classnames";
import { ReportResidencyFrTaxesFr } from "./_ReportResidencyFrTaxesFr";
import { Select } from "@/components/ui/Select";
import { match } from "ts-pattern";
import NotImplemented from "@/components/NotImplemented";

export type CountryCode = "us" | "fr";
export interface ReportProps {}

export const Report: React.FunctionComponent<ReportProps> = () => {
  const [taxesCountry, setTaxesCountry] = useState<CountryCode | null>("fr");
  const [residency, setResidencyCountry] = useState<CountryCode | null>("fr");

  return (
    <div>
      <div className={classNames("w-fit flex p-4 items-center gap-2")}>
        <div className="text-2xl font-bold">Tax Report</div>
        <Select
          className="text-lg"
          label="Residence country:"
          onChange={setResidencyCountry}
          options={[
            { label: "US", value: "us" },
            { label: "FR", value: "fr" },
          ]}
          value={residency ?? undefined}
        />
        <Select
          className="text-lg"
          label="Taxes country:"
          onChange={setTaxesCountry}
          options={[
            { label: "US", value: "us" },
            { label: "FR", value: "fr" },
          ]}
          value={taxesCountry ?? undefined}
        />
      </div>
      <div>
        {match({ residency, taxesCountry })
          .with({ residency: null, taxesCountry: null }, () => (
            <p>Please select a residency and taxes country</p>
          ))
          .with({ residency: "fr", taxesCountry: "fr" }, () => (
            <ReportResidencyFrTaxesFr />
          ))
          .otherwise(() => (
            <NotImplemented />
          ))}
      </div>
    </div>
  );
};
