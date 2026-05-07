"use client";

import { useEffect, useState } from "react";

/**
 * Mock mode (?mock=true) is only honored on localhost (and common dev IPs).
 * Returns false until after mount so server and initial client renders match (hydration-safe).
 */
export function useIsMockMode(): boolean {
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0";
    const mockEnabled =
      new URLSearchParams(window.location.search).get("mock") === "true";
    setIsMockMode(isLocalhost && mockEnabled);
  }, []);

  return isMockMode;
}
