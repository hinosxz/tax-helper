import { ONE_DAY } from "@/lib/constants";
import type { YahooFinanceResponse } from "@/lib/stock-prices";
import {
  parseStockPricesResponse,
  buildStockPricesUrl,
} from "@/lib/stock-prices";
import type { SymbolDailyResponse } from "@/lib/symbol-daily.types";

const cachedData: {
  [symbol: string]: { values: SymbolDailyResponse; cachedTime: number } | null;
} = {};

export async function GET(
  _request: Request,
  { params }: { params: { symbol: string } },
) {
  const symbol = params.symbol;
  if (!/^[A-Z0-9.^-]{1,10}$/i.test(symbol)) {
    return Response.json({ error: "Invalid symbol" }, { status: 400 });
  }
  try {
    const cache = cachedData[symbol];
    if (!cache || Date.now() - cache.cachedTime > ONE_DAY) {
      const values: SymbolDailyResponse = await fetch(
        buildStockPricesUrl(symbol),
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(
              `Failed to fetch ${symbol} prices: HTTP ${res.status}`,
            );
          }
          return res.json();
        })
        .then((response: YahooFinanceResponse) =>
          parseStockPricesResponse(symbol, response),
        );
      cachedData[symbol] = { values, cachedTime: Date.now() };
    }

    if (!cachedData[symbol]) {
      throw new Error(`Failed to fetch ${symbol} prices`);
    }
    return Response.json(cachedData[symbol]?.values, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error: (error as Error).message || `Failed to fetch ${symbol} prices`,
      },
      { status: 500 },
    );
  }
}
