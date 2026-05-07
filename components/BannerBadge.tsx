"use client";

import { useEffect, useState } from "react";
import { useIsMockMode } from "@/hooks/use-is-mock-mode";

const placeholderClass =
  "inline-block h-[26px] min-w-[148px] rounded bg-blue-800/25";

/**
 * Banner slot filled on the client-side.
 */
export function BannerBadge() {
  const [isMounted, setIsMounted] = useState(false);
  const isMockMode = useIsMockMode();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <span className={placeholderClass} aria-hidden />;
  }

  if (!isMockMode) return null;

  return (
    <span className="rounded bg-blue-700 px-2 py-0.5 text-xs font-bold text-white">
      MOCK DATA MODE
    </span>
  );
}
