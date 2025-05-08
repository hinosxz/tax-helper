import { ONE_DAY } from "@/lib/constants";
import type { ApiDate, SymbolDailyResponse } from "@/lib/symbol-daily.types";

export interface SymbolDailyAlphavantageResponse {
  "Time Series (Daily)":
    | {
        [date: ApiDate]: {
          "1. open": string;
          "2. high": string;
          "3. low": string;
          "4. close": string;
          "5. volume": string;
        };
      }
    | undefined;
}

const cachedData: {
  [symbol: string]: { values: SymbolDailyResponse; cachedTime: number } | null;
} = {};

const apiUrl = "https://www.alphavantage.co/query";
let apiKey = "";

const loadApiKey = () => {
  if (!process.env.ALPHA_VANTAGE_API_KEY) {
    throw new Error(`
      [env:${process.env.NODE_ENV}] 
      ALPHA_VANTAGE_API_KEY is not set.
      Please set it in your .env.local file.
  
      To create a new API key, visit: https://www.alphavantage.co/support/#api-key
      `);
  }
  apiKey = process.env.ALPHA_VANTAGE_API_KEY;
};

export async function GET(
  _request: Request,
  { params }: { params: { symbol: string } },
) {
  if (!apiKey) {
    loadApiKey();
  }

  const symbol = params.symbol;
  try {
    const cache = cachedData[symbol];
    if (!cache || Date.now() - cache.cachedTime > ONE_DAY) {
      const searchParams = new URLSearchParams({
        function: "TIME_SERIES_DAILY",
        symbol,
        outputsize: "full",
        apikey: apiKey,
      });
      cachedData[symbol] = await fetch(`${apiUrl}?${searchParams.toString()}`)
        .then((res) => res.json())
        .then((response: SymbolDailyAlphavantageResponse) => {
          if ("Error Message" in response) {
            throw new Error(
              `Failed to fetch symbol ${symbol} prices with: "${response["Error Message"]}"`,
            );
          }
          const data: SymbolDailyResponse = {};
          const dailyTs = response["Time Series (Daily)"]
            ? Object.entries(response["Time Series (Daily)"])
            : [];
          for (const [date, values] of dailyTs) {
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
