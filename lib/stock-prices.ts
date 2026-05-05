import type { SymbolDailyResponse } from "./symbol-daily.types";
import { isNill } from "./is-nill";

const YAHOO_FINANCE_API_URL =
  "https://query1.finance.yahoo.com/v8/finance/chart";

const PRICE_HISTORY_START = Math.floor(new Date("2010-01-01").getTime() / 1000);

export const buildStockPricesUrl = (symbol: string): string => {
  const period2 = Math.floor(Date.now() / 1000);
  return `${YAHOO_FINANCE_API_URL}/${encodeURIComponent(symbol)}?interval=1d&period1=${PRICE_HISTORY_START}&period2=${period2}`;
};

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

  const result = response.chart.result?.[0];
  if (!result) {
    throw new Error(`No price data returned for symbol ${symbol}.`);
  }

  const { timestamp, indicators } = result;
  const quote = indicators.quote[0];
  if (!quote) {
    throw new Error(`No price indicator data returned for symbol ${symbol}.`);
  }
  const { open, close } = quote;

  const data: SymbolDailyResponse = {};
  for (let i = 0; i < timestamp.length; i++) {
    const o = open[i];
    const c = close[i];
    if (isNill(o) || isNill(c)) continue;
    const date = new Date(timestamp[i] * 1000).toISOString().slice(0, 10);
    data[date] = { opening: o, closing: c };
  }

  if (Object.keys(data).length === 0) {
    throw new Error(`No price data returned for symbol ${symbol}.`);
  }

  return data;
};
