"use client";

import PageLink from "./PageLink";
import { usePathname } from "next/navigation";

export default function ReportCountry() {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-4">
      <div className="text-xl">Which country are you filing taxes for?</div>
      <div className="flex gap-4 justify-center">
        <PageLink href={`${pathname}/report_fr`}>France</PageLink>
        <PageLink href={`${pathname}/report_us`}>USA</PageLink>
      </div>
    </div>
  );
}
