"use client";

import PageLink from "./shared/PageLink";
import { usePathname } from "next/navigation";

export default function Page() {
  const pathname = usePathname();
  return (
    <>
      <div>
        <div className="text-xl">What is your tax residence?</div>
        <div className="text-md italic">
          Note: this guide does not support dual residents yet.
        </div>
      </div>
      <div className="flex gap-4 justify-center">
        <PageLink href={`${pathname}/resident_fr`}>France</PageLink>
        <PageLink href={`${pathname}/resident_us`}>USA</PageLink>
      </div>
    </>
  );
}
