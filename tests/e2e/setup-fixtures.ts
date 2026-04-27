/**
 * Script to populate rates.json and symbol-prices.json for each E2E fixture
 * case, and to anonymize Grant Numbers and Order Numbers in the xlsx files.
 *
 * Run with:
 *   npm run setup-e2e-fixtures
 *
 * Safe to re-run: already-populated cases are skipped unless --force is passed.
 * Anonymisation is always idempotent: xlsx files that are already clean are
 * left untouched. Each file gets independent sequential fake IDs (GRANT-001,
 * ORD-001, …) — no mapping file is needed or committed.
 */

import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const FIXTURES_DIR = path.join(__dirname, "__fixtures__");
const ROOT_DIR = path.join(__dirname, "../..");
const FORCE = process.argv.includes("--force");

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

function loadEnv() {
  const envPath = path.join(ROOT_DIR, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([^#\s][^=]*)=(.*)/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
    }
  }
}

// ---------------------------------------------------------------------------
// Date helpers (inlined to keep the script self-contained)
// ---------------------------------------------------------------------------

function parseEtradeDate(raw: string): string {
  const [month, day, year] = raw.split("/").map(Number);
  return new Date(Date.UTC(year, month - 1, day))
    .toISOString()
    .substring(0, 10);
}

function dayBefore(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day - 1))
    .toISOString()
    .substring(0, 10);
}

function subtractDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day - days))
    .toISOString()
    .substring(0, 10);
}

// ---------------------------------------------------------------------------
// Anonymisation
// ---------------------------------------------------------------------------

function findColumn(headers: unknown[], name: string): number {
  return (headers as string[]).indexOf(name);
}

/**
 * Returns true when every non-empty, non-"--" value in the Grant Number and
 * Order Number columns already starts with the expected prefix.
 */
function isAlreadyAnonymized(buffer: Buffer): boolean {
  const workbook = XLSX.read(buffer);
  const ws = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
  if (rows.length < 2) return true;

  const headers = rows[0] as unknown[];
  const grantCol = findColumn(headers, "Grant Number");
  const orderCol = findColumn(headers, "Order Number");
  if (grantCol < 0 && orderCol < 0) return true;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    if (grantCol >= 0) {
      const v = String(row[grantCol] ?? "").trim();
      if (v && v !== "--" && !v.startsWith("GRANT-")) return false;
    }
    if (orderCol >= 0) {
      const v = String(row[orderCol] ?? "").trim();
      if (v && v !== "--" && !v.startsWith("ORD-")) return false;
    }
  }
  return true;
}

/**
 * Rewrites the xlsx, replacing each unique Grant Number and Order Number with a
 * sequential fake ID (GRANT-001, ORD-001, …). IDs are assigned in sorted order
 * of the original values so the result is deterministic.
 */
function anonymizeXlsx(buffer: Buffer): Buffer {
  const workbook = XLSX.read(buffer);
  const ws = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });

  const headers = rows[0] as unknown[];
  const grantCol = findColumn(headers, "Grant Number");
  const orderCol = findColumn(headers, "Order Number");

  const grantValues = new Set<string>();
  const orderValues = new Set<string>();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    if (grantCol >= 0) {
      const v = String(row[grantCol] ?? "").trim();
      if (v && v !== "--") grantValues.add(v);
    }
    if (orderCol >= 0) {
      const v = String(row[orderCol] ?? "").trim();
      if (v && v !== "--") orderValues.add(v);
    }
  }

  const pad = (n: number) => String(n).padStart(3, "0");
  const grantMap = Object.fromEntries(
    [...grantValues].sort().map((v, i) => [v, `GRANT-${pad(i + 1)}`]),
  );
  const orderMap = Object.fromEntries(
    [...orderValues].sort().map((v, i) => [v, `ORD-${pad(i + 1)}`]),
  );

  const updated = rows.map((row, i) => {
    if (i === 0) return row;
    const r = [...(row as unknown[])] as unknown[];
    if (grantCol >= 0 && r[grantCol] != null) {
      const v = String(r[grantCol]).trim();
      if (grantMap[v]) r[grantCol] = grantMap[v];
    }
    if (orderCol >= 0 && r[orderCol] != null) {
      const v = String(r[orderCol]).trim();
      if (orderMap[v]) r[orderCol] = orderMap[v];
    }
    return r;
  });

  const newWs = XLSX.utils.aoa_to_sheet(updated as unknown[][]);
  workbook.Sheets[workbook.SheetNames[0]] = newWs;
  return Buffer.from(
    XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
  );
}

// ---------------------------------------------------------------------------
// XLSX parsing (extract only what we need for fixture setup)
// ---------------------------------------------------------------------------

interface RawRow {
  Symbol?: string;
  "Date Acquired"?: string;
  "Date Sold"?: string;
}

function extractDatesAndSymbols(buffer: Buffer): {
  dates: string[];
  symbols: string[];
} {
  const workbook = XLSX.read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json<RawRow>(worksheet, { header: 2 });

  const dates = new Set<string>();
  const symbols = new Set<string>();

  // First row is header/summary
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row["Symbol"]) symbols.add(row["Symbol"]);
    if (row["Date Acquired"]) dates.add(parseEtradeDate(row["Date Acquired"]));
    if (row["Date Sold"]) dates.add(parseEtradeDate(row["Date Sold"]));
  }

  return {
    dates: [...dates].sort(),
    symbols: [...symbols],
  };
}

// ---------------------------------------------------------------------------
// ECB exchange rates
// ---------------------------------------------------------------------------

interface EcbResponse {
  dataSets: Array<{
    series: {
      "0:0:0:0:0": { observations: Record<string, [number]> };
    };
  }>;
  structure: {
    dimensions: {
      observation: Array<{ values: Array<{ id: string }> }>;
    };
  };
}

async function fetchEcbRates(
  startDate: string,
  endDate: string,
): Promise<Record<string, number>> {
  const url = new URL(
    "https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A",
  );
  url.searchParams.set("format", "jsondata");
  url.searchParams.set("detail", "dataonly");
  url.searchParams.set("startPeriod", startDate);
  url.searchParams.set("endPeriod", endDate);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`ECB API ${res.status}: ${res.statusText}`);
  }

  const data = (await res.json()) as EcbResponse;
  const tradingDates = data.structure.dimensions.observation[0].values.map(
    (v) => v.id,
  );
  const observations = data.dataSets[0].series["0:0:0:0:0"].observations;

  const result: Record<string, number> = {};
  for (const [idx, values] of Object.entries(observations)) {
    result[tradingDates[Number(idx)]] = values[0];
  }
  return result;
}

/** Walk backwards up to 10 days to find a trading day rate. */
function resolveRate(
  date: string,
  allRates: Record<string, number>,
): number | undefined {
  let current = date;
  for (let i = 0; i < 10; i++) {
    if (allRates[current] !== undefined) return allRates[current];
    current = dayBefore(current);
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Yahoo Finance symbol prices
// ---------------------------------------------------------------------------

interface SymbolDailyResponse {
  [date: string]: { opening: number; closing: number };
}

interface YahooFinanceResponse {
  chart: {
    result?: Array<{
      timestamp: number[];
      indicators: {
        quote: Array<{ open: (number | null)[]; close: (number | null)[] }>;
      };
    }>;
    error?: { message: string };
  };
}

async function fetchSymbolPrices(
  symbol: string,
  startDate: string,
  endDate: string,
): Promise<SymbolDailyResponse> {
  const period1 = Math.floor(new Date(startDate).getTime() / 1000);
  // Add one day to endDate to ensure the last date is included
  const [y, m, d] = endDate.split("-").map(Number);
  const period2 = Math.floor(
    new Date(Date.UTC(y, m - 1, d + 1)).getTime() / 1000,
  );

  const url = new URL(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
  );
  url.searchParams.set("interval", "1d");
  url.searchParams.set("period1", String(period1));
  url.searchParams.set("period2", String(period2));

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) {
    throw new Error(`Yahoo Finance ${res.status}: ${res.statusText}`);
  }

  const data = (await res.json()) as YahooFinanceResponse;
  if (data.chart.error)
    throw new Error(`Yahoo Finance: ${data.chart.error.message}`);
  if (!data.chart.result?.[0])
    throw new Error(`Yahoo Finance: no data for ${symbol}`);

  const { timestamp, indicators } = data.chart.result[0];
  const { open, close } = indicators.quote[0];

  const result: SymbolDailyResponse = {};
  for (let i = 0; i < timestamp.length; i++) {
    if (open[i] == null || close[i] == null) continue;
    const date = new Date(timestamp[i] * 1000).toISOString().substring(0, 10);
    result[date] = { opening: open[i]!, closing: close[i]! };
  }
  return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  loadEnv();

  const cases = fs
    .readdirSync(FIXTURES_DIR)
    .filter((name) => fs.statSync(path.join(FIXTURES_DIR, name)).isDirectory());

  console.log(`Found ${cases.length} case(s)\n`);

  // --- Phase 1: Anonymise Grant Numbers and Order Numbers in xlsx files ---
  console.log("Anonymising xlsx files...");

  for (const name of cases) {
    const xlsxPath = path.join(FIXTURES_DIR, name, "etrade-gl.xlsx");
    if (!fs.existsSync(xlsxPath)) continue;
    const buffer = fs.readFileSync(xlsxPath);
    if (isAlreadyAnonymized(buffer)) {
      console.log(`  [skip] ${name}: already anonymized`);
      continue;
    }
    process.stdout.write(`  [anonymize] ${name} ... `);
    fs.writeFileSync(xlsxPath, anonymizeXlsx(buffer));
    console.log("done");
  }
  console.log();

  // --- Phase 2: Fetch EUR/USD rates and stock prices ---
  type CaseMeta = {
    name: string;
    dir: string;
    dates: string[];
    symbols: string[];
  };

  const pending: CaseMeta[] = [];

  for (const name of cases) {
    const dir = path.join(FIXTURES_DIR, name);
    const xlsxPath = path.join(dir, "etrade-gl.xlsx");
    const ratesPath = path.join(dir, "rates.json");
    const symbolPricesPath = path.join(dir, "symbol-prices.json");

    if (!fs.existsSync(xlsxPath)) {
      console.warn(`  [skip] ${name}: no etrade-gl.xlsx`);
      continue;
    }

    if (!FORCE && fs.existsSync(ratesPath) && fs.existsSync(symbolPricesPath)) {
      console.log(
        `  [skip] ${name}: fixtures already exist (--force to overwrite)`,
      );
      continue;
    }

    process.stdout.write(`  [parse] ${name} ... `);
    const buffer = fs.readFileSync(xlsxPath);
    const { dates, symbols } = extractDatesAndSymbols(buffer);
    console.log(`${dates.length} dates, symbols: ${symbols.join(", ")}`);

    pending.push({ name, dir, dates, symbols });
  }

  if (!pending.length) {
    console.log("\nNothing to do.");
    return;
  }

  // Fetch ECB rates for the full date range across all pending cases in one request
  const allDates = pending.flatMap((c) => c.dates).sort();
  const globalMin = allDates[0];
  const globalMax = allDates[allDates.length - 1];

  // Extend start by 7 days so weekend/holiday boundary dates can be resolved backwards
  const ecbStart = subtractDays(globalMin, 7);
  process.stdout.write(`\nFetching ECB rates ${ecbStart} → ${globalMax} ... `);
  const allRates = await fetchEcbRates(ecbStart, globalMax);
  console.log(`${Object.keys(allRates).length} trading days`);

  // Fetch symbol prices — deduplicated across all pending cases, full range at once
  const allSymbols = [...new Set(pending.flatMap((c) => c.symbols))];
  const symbolPricesMap: Record<string, SymbolDailyResponse> = {};

  for (const symbol of allSymbols) {
    process.stdout.write(`Fetching Yahoo Finance: ${symbol} ... `);
    symbolPricesMap[symbol] = await fetchSymbolPrices(
      symbol,
      globalMin,
      globalMax,
    );
    console.log(`${Object.keys(symbolPricesMap[symbol]).length} days`);
  }

  // Write fixtures per case
  console.log();
  for (const { name, dir, dates, symbols } of pending) {
    // rates.json: map each event date to the nearest trading day rate
    const rates: Record<string, number> = {};
    for (const date of dates) {
      const rate = resolveRate(date, allRates);
      if (rate === undefined) {
        console.warn(`  WARNING [${name}]: no rate found for ${date}`);
      } else {
        rates[date] = rate;
      }
    }

    // symbol-prices.json: for each transaction date include that trading day if
    // available, otherwise include the nearest previous and next trading days.
    // (getAdjustedSymbolDate walks back up to 10 days on non-trading days.)
    const symbolPrices: Record<string, SymbolDailyResponse> = {};
    for (const symbol of symbols) {
      const tradingDays = Object.keys(symbolPricesMap[symbol]).sort();
      const keep = new Set<string>();

      for (const date of dates) {
        if (symbolPricesMap[symbol][date]) {
          keep.add(date);
        } else {
          const prev = tradingDays.filter((d) => d < date).at(-1);
          if (prev) keep.add(prev);
          const next = tradingDays.find((d) => d > date);
          if (next) keep.add(next);
        }
      }

      symbolPrices[symbol] = Object.fromEntries(
        Object.entries(symbolPricesMap[symbol]).filter(([d]) => keep.has(d)),
      );
    }

    fs.writeFileSync(
      path.join(dir, "rates.json"),
      JSON.stringify(rates, null, 2),
    );
    fs.writeFileSync(
      path.join(dir, "symbol-prices.json"),
      JSON.stringify(symbolPrices, null, 2),
    );

    console.log(
      `  [done] ${name}: ${Object.keys(rates).length} rates, ` +
        symbols
          .map((s) => `${s}:${Object.keys(symbolPrices[s]).length}d`)
          .join(", "),
    );
  }

  console.log(
    "\nFixtures written. Run `npm run test:e2e` to generate expected.json files,",
    "\nthen verify them against your tax forms before committing.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
