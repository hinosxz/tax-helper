"use client";

import PageLink from "./PageLink";
import { usePathname } from "next/navigation";

export default function IncomeType() {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-4">
      <div className="text-xl">Which type of income do you want to report?</div>
      <div className="flex gap-4 justify-center">
        <PageLink href={`${pathname}/rsu`}>RSU</PageLink>
        <PageLink href={`${pathname}/iso`}>ISO</PageLink>
        <PageLink href={`${pathname}/espp`}>ESPP</PageLink>
      </div>
    </div>
  );
}
