"use client";

import PageLink from "./PageLink";
import { usePathname } from "next/navigation";

export default function GrantOrigin() {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-4">
      <div className="text-xl">What is the origin of your grant?</div>
      <div className="flex gap-4 justify-center">
        <PageLink href={`${pathname}/grant_fr`}>France</PageLink>
        <PageLink href={`${pathname}/grant_us`}>USA</PageLink>
      </div>
    </div>
  );
}
