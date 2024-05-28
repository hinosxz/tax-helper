"use client";

import PageLink from "@/components/ui/PageLink";
import { usePathname } from "next/navigation";

export default function Page() {
  const pathname = usePathname();
  return (
    <div className="grid gap-8 text-center">
      <div>
        <div className="text-xl">What is your tax residence?</div>
        <div className="text-md italic">
          Note: this guide does not yet support dual residents.
        </div>
      </div>
      <div className="flex gap-4 justify-center">
        <PageLink href={`${pathname}/resident_fr`}>France</PageLink>
        <PageLink href={`${pathname}/resident_us`}>USA</PageLink>
      </div>
    </div>
  );
}
