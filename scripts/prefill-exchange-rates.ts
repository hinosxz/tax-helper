/**
 * Prefill data/exchange-rates.json with USD/EUR rates from ECB for a date
 * range. Calls are made sequentially, one date at a time. Weekends are
 * skipped; dates ECB has no data for (bank holidays) are marked with `null`
 * so re-runs don't re-call ECB and lookups can fall back to the previous day.
 *
 * Usage:
 *   bun run prefill-exchange-rates <start-date> <end-date> [--force]
 *
 *   <start-date> and <end-date> are inclusive, YYYY-MM-DD.
 *   --force re-fetches dates already present in the cache.
 */

import {
  EcbNoDataError,
  fetchEcbRate,
  readCache,
  writeCache,
} from "../lib/exchange-rate-cache";
import { isWeekend } from "../lib/date";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const nextDay = (date: string): string => {
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString().substring(0, 10);
};

const JITTER_MIN_MS = 500;
const JITTER_MAX_MS = 1500;

const jitterSleep = (): Promise<void> => {
  const ms = JITTER_MIN_MS + Math.random() * (JITTER_MAX_MS - JITTER_MIN_MS);
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const usage = () => {
  console.error(
    "Usage: bun run prefill-exchange-rates <start-date> <end-date> [--force]",
  );
  process.exit(1);
};

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const positional = args.filter((a) => !a.startsWith("--"));
  if (positional.length !== 2) usage();

  const [start, end] = positional;
  if (!DATE_PATTERN.test(start) || !DATE_PATTERN.test(end)) {
    console.error("Dates must be in YYYY-MM-DD format");
    process.exit(1);
  }
  if (start > end) {
    console.error("start-date must be <= end-date");
    process.exit(1);
  }

  let cache = readCache();
  let fetched = 0;
  let cached = 0;
  let weekends = 0;
  let holidays = 0;

  for (let date = start; date <= end; date = nextDay(date)) {
    if (isWeekend(date)) {
      weekends++;
      continue;
    }
    if (!force && cache[date] !== undefined) {
      if (cache[date] === null) {
        console.log(`[skip] ${date}: known non-trading day`);
      } else {
        console.log(`[skip] ${date}: already cached (${cache[date]})`);
      }
      cached++;
      continue;
    }

    try {
      const rate = await fetchEcbRate(date);
      cache = { ...cache, [date]: rate };
      writeCache(cache);
      console.log(`[fetched] ${date} → ${rate}`);
      fetched++;
    } catch (error) {
      if (error instanceof EcbNoDataError) {
        cache = { ...cache, [date]: null };
        writeCache(cache);
        console.log(`[no-data] ${date}: marked as non-trading day`);
        holidays++;
      } else {
        throw error;
      }
    }
    await jitterSleep();
  }

  console.log(
    `\nDone. fetched=${fetched}, already-cached=${cached}, weekends=${weekends}, holidays=${holidays}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
