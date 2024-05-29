"use client";

import PageLink from "@/components/ui/PageLink";
import { usePathname } from "next/navigation";

export default function YearType() {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <div className="text-xl">Which year is this for you?</div>
        <div className="text-md italic">
          Note: it can be both, in that case please go through the guide twice.
        </div>
      </div>
      <div className="flex gap-4 justify-center">
        <PageLink href={`${pathname}/vest_year`}>Year I vested stocks</PageLink>
        <PageLink href={`${pathname}/sell_year`}>Year I sold stocks</PageLink>
      </div>
    </div>
  );
}
