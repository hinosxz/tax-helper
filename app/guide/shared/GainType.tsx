"use client";

import PageLink from "./PageLink";
import { usePathname } from "next/navigation";

export default function GainType() {
  const pathname = usePathname();
  return (
    <>
      <div className="text-xl">Which type of gain do you want to report?</div>
      <div className="flex gap-4 justify-center">
        <PageLink href={`${pathname}/short_term`}>Short Term</PageLink>
        <PageLink href={`${pathname}/long_term`}>Long Term</PageLink>
      </div>
    </>
  );
}
