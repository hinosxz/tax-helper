import fs from "fs";
import path from "path";

import { dayBefore } from "./date";

const API_BASE_URL =
  "https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A";

const CACHE_FILE_PATH = path.join(process.cwd(), "data", "exchange-rates.json");

interface EcbResponse {
  dataSets?: Array<{
    series: {
      "0:0:0:0:0"?: {
        observations: Record<string, [number]>;
      };
    };
  }>;
}

export class EcbNoDataError extends Error {
  constructor(date: string) {
    super(`ECB returned no observation for ${date}`);
    this.name = "EcbNoDataError";
  }
}

export const fetchEcbRate = async (date: string): Promise<number> => {
  const url = new URL(API_BASE_URL);
  url.searchParams.set("format", "jsondata");
  url.searchParams.set("detail", "dataonly");
  url.searchParams.set("startPeriod", date);
  url.searchParams.set("endPeriod", date);

  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) {
    throw new Error(`ECB API ${res.status} ${res.statusText} for ${date}`);
  }

  const body = await res.text();
  if (!body.trim()) {
    throw new EcbNoDataError(date);
  }
  const data = JSON.parse(body) as EcbResponse;
  const observation =
    data.dataSets?.[0]?.series["0:0:0:0:0"]?.observations["0"];
  if (!observation) {
    throw new EcbNoDataError(date);
  }
  return observation[0];
};

/**
 * Cache values:
 *   number → known rate for that date
 *   null   → we asked ECB and got no data (weekend/holiday) — look up the day before
 *   absent → never asked
 */
export type ExchangeRateCache = Record<string, number | null>;

let memoizedCache: ExchangeRateCache | null = null;

export const readCache = (): ExchangeRateCache => {
  if (memoizedCache !== null) return memoizedCache;
  try {
    const raw = fs.readFileSync(CACHE_FILE_PATH, "utf8").trim();
    memoizedCache = raw ? (JSON.parse(raw) as ExchangeRateCache) : {};
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      memoizedCache = {};
    } else {
      throw error;
    }
  }
  return memoizedCache;
};

export const writeCache = (cache: ExchangeRateCache): void => {
  const sorted: ExchangeRateCache = {};
  for (const key of Object.keys(cache).sort()) {
    sorted[key] = cache[key];
  }
  fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(sorted, null, 2) + "\n");
  memoizedCache = sorted;
};

const MAX_FALLBACK_DAYS = 10;

export const getOrFetchRate = async (
  date: string,
  depth = 0,
): Promise<number> => {
  if (depth > MAX_FALLBACK_DAYS) {
    throw new Error(
      `No exchange rate found within ${MAX_FALLBACK_DAYS} days of original lookup`,
    );
  }

  const cached = readCache()[date];

  if (typeof cached === "number") {
    console.log(`[exr] date=${date} source=cache value=${cached}`);
    return cached;
  }

  if (cached === null) {
    console.log(`[exr] date=${date} source=cache (no-data, falling back)`);
    return getOrFetchRate(dayBefore(date), depth + 1);
  }

  try {
    const rate = await fetchEcbRate(date);
    writeCache({ ...readCache(), [date]: rate });
    console.log(`[exr] date=${date} source=ecb value=${rate}`);
    return rate;
  } catch (error) {
    if (error instanceof EcbNoDataError) {
      writeCache({ ...readCache(), [date]: null });
      console.log(`[exr] date=${date} source=ecb (no-data, falling back)`);
      return getOrFetchRate(dayBefore(date), depth + 1);
    }
    throw error;
  }
};
