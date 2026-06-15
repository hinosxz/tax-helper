import type { SymbolDailyResponse } from "./symbol-daily.types";
import { isNil } from "./is-nil";
import { ONE_SECOND, ONE_DAY } from "./constants";

const YAHOO_FINANCE_API_URL =
  "https://query1.finance.yahoo.com/v8/finance/chart";

export const PRICE_HISTORY_START = Math.floor(
  new Date("2010-01-01").getTime() / ONE_SECOND,
);

export const buildStockPricesUrl = (
  symbol: string,
  period1 = PRICE_HISTORY_START,
  period2 = Math.floor(Date.now() / ONE_SECOND),
): string =>
  `${YAHOO_FINANCE_API_URL}/${encodeURIComponent(symbol)}?interval=1d&period1=${period1}&period2=${period2}`;

export interface YahooFinanceResponse {
  chart: {
    result: Array<{
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: (number | null)[];
          close: (number | null)[];
        }>;
      };
    }> | null;
    error: { code: string; description: string } | null;
  };
}

export const parseStockPricesResponse = (
  symbol: string,
  response: YahooFinanceResponse,
): SymbolDailyResponse => {
  if (response.chart.error) {
    throw new Error(
      `Failed to fetch symbol ${symbol} prices: ${response.chart.error.description}`,
    );
  }

  const result = response.chart.result?.at(0);
  if (!result) {
    throw new Error(`No price data returned for symbol ${symbol}.`);
  }

  const { timestamp, indicators } = result;
  const quote = indicators.quote.at(0);
  if (!quote) {
    throw new Error(`No price indicator data returned for symbol ${symbol}.`);
  }
  const { open, close } = quote;

  const data: SymbolDailyResponse = {};
  for (let i = 0; i < timestamp.length; i++) {
    const o = open[i];
    const c = close[i];
    if (isNil(o) || isNil(c)) continue;
    const date = new Date(timestamp[i] * ONE_SECOND).toISOString().slice(0, 10);
    data[date] = { opening: o, closing: c };
  }

  if (Object.keys(data).length === 0) {
    throw new Error(`No price data returned for symbol ${symbol}.`);
  }

  return data;
};

/**
 * Cache promises (not resolved values) so concurrent calls for the same symbol share one in-flight request.
 * cachedTime tracks when the promise was created so we can expire after ONE_DAY.
 */
const CACHED_SYMBOL_PROMISES = new Map<
  string,
  { promise: Promise<SymbolDailyResponse>; cachedTime: number }
>();

export const fetchSymbolDaily = (
  symbol: string,
): Promise<SymbolDailyResponse> => {
  const cached = CACHED_SYMBOL_PROMISES.get(symbol);
  if (cached && Date.now() - cached.cachedTime <= ONE_DAY) {
    return cached.promise;
  }

  const promise = fetch(buildStockPricesUrl(symbol))
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch ${symbol} prices: HTTP ${res.status}`);
      }
      return res.json();
    })
    .then((response: YahooFinanceResponse) =>
      parseStockPricesResponse(symbol, response),
    );

  CACHED_SYMBOL_PROMISES.set(symbol, { promise, cachedTime: Date.now() });

  promise.catch(() => {
    CACHED_SYMBOL_PROMISES.delete(symbol);
  });

  return promise;
};
