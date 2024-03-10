"use client";

import PageLink from "./PageLink";
import { usePathname } from "next/navigation";

export default function YearType() {
  const pathname = usePathname();
  return (
    <>
      <div className="text-xl">Which year is this for you?</div>
      <div className="text-md italic">
        Note: it can be both, in that case please go through the guide twice.
      </div>
      <div className="flex gap-4 justify-center">
        <PageLink href={`${pathname}/vest_year`}>Year I vested stocks</PageLink>
        <PageLink href={`${pathname}/sell_year`}>Year I sold stocks</PageLink>
      </div>
    </>
  );
}
