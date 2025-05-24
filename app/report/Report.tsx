"use client";
import { useState } from "react";
import classNames from "classnames";
import { ReportResidencyFr } from "./_ReportResidencyFr";
import { match } from "ts-pattern";
import NotImplemented from "@/components/NotImplemented";
import type { Option } from "@/components/ui/ButtonGroup";
import { ButtonGroup } from "@/components/ui/ButtonGroup";

export type CountryCode = "us" | "fr";

export interface ReportProps {}

export const Report: React.FunctionComponent<ReportProps> = () => {
  const [taxResidency, setTaxResidency] = useState<CountryCode>("fr");
  const options: Option<CountryCode>[] = [
    { value: "fr", label: "FR" },
    { value: "us", label: "US" },
  ];

  return (
    <div>
      <div className={classNames("w-fit flex p-4 items-center gap-2")}>
        <div className="text-2xl font-bold">Tax Report</div>
        <div className="inline-flex w-0.5 self-stretch bg-black"></div>
        <div>Residency:</div>
        <ButtonGroup onClick={setTaxResidency} options={options} />
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
