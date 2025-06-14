"use client";
import { useState } from "react";
import classNames from "classnames";
import { Report } from "./_Report";
import type { Option } from "@/components/ui/ButtonGroup";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import type { CountryCode } from "./types";

export default function Page() {
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
      <Report taxResidency={taxResidency} />
    </div>
  );
}
