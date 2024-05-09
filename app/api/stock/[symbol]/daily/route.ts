import { ONE_DAY } from "@/lib/constants";
import { ApiDate, SymbolDailyResponse } from "@/lib/symbol-daily.types";

export interface SymbolDailyAlphavantageResponse {
  "Time Series (Daily)": {
    [date: ApiDate]: {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. volume": string;
    };
  };
}

const cachedData: {
  [symbol: string]: { values: SymbolDailyResponse; cachedTime: number } | null;
} = {};

const apiUrl = "https://www.alphavantage.co/query";
if (!process.env.ALPHA_VANTAGE_API_KEY) {
  throw new Error(`
    ALPHA_VANTAGE_API_KEY is not set.
    Please set it in your .env.local file.

    To create a new API key, visit: https://www.alphavantage.co/support/#api-key
    `);
}

export async function GET(
  _request: Request,
  { params }: { params: { symbol: string } },
) {
  const symbol = params.symbol;
  try {
    const cache = cachedData[symbol];
    if (!cache || Date.now() - cache.cachedTime > ONE_DAY) {
      const searchParams = new URLSearchParams({
        function: "TIME_SERIES_DAILY",
        symbol,
        outputsize: "full",
        apikey: process.env.ALPHA_VANTAGE_API_KEY || "",
      });
      cachedData[symbol] = await fetch(`${apiUrl}?${searchParams.toString()}`)
        .then((res) => res.json())
        .then((response: SymbolDailyAlphavantageResponse) => {
          const data: SymbolDailyResponse = {};
          for (const [date, values] of Object.entries(
            response["Time Series (Daily)"],
          )) {
            data[date] = {
              opening: parseFloat(values["1. open"]),
              closing: parseFloat(values["4. close"]),
            };
          }

          return { values: data, cachedTime: Date.now() };
        });
    }

    if (!cachedData[symbol]) {
      throw new Error(`Failed to fetch symbol ${symbol} prices`);
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
