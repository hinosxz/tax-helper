const API_BASE_URL =
  "https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A";

interface Series {
  "0:0:0:0:0": {
    observations: {
      "0": [number];
    };
  };
}
interface DataSet {
  action: string;
  validFrom: string;
  series: Series;
}
interface EcbResponse {
  dataSets: DataSet[];
}

const dayBefore = (date: string): string => {
  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setDate(d.getDate() - 1);
  return d.toISOString().substring(0, 10);
};

const baseFetchExchangeRate = async (
  date: string,
  retriesLeft = 5,
): Promise<number> => {
  const url = new URL(API_BASE_URL);
  url.searchParams.set("format", "jsondata");
  url.searchParams.set("detail", "dataonly");
  url.searchParams.set("startPeriod", date);
  url.searchParams.set("endPeriod", date);

  const res = await fetch(url, { cache: "no-cache" });
  const text = await res.text();
  let observations: EcbResponse["dataSets"][0]["series"]["0:0:0:0:0"]["observations"] | undefined;
  try {
    const data: EcbResponse = JSON.parse(text);
    observations = data.dataSets?.[0]?.series?.["0:0:0:0:0"]?.observations;
  } catch {
    // ECB returns empty body (not JSON) when no data exists for the date — treat as no data
  }

  if (!observations?.["0"]) {
    // ECB publishes no rate for this date (e.g. Good Friday or other ECB-specific closure).
    // Fall back to the previous calendar day.
    if (retriesLeft <= 0) {
      throw new Error(
        `No ECB exchange rate found for ${date} or any of the 5 preceding days`,
      );
    }
    return baseFetchExchangeRate(dayBefore(date), retriesLeft - 1);
  }

  return observations["0"][0];
};

/**
 * Use a Map of promises instead of map of numbers, so that if we receive 2 requests at the same time on the same date,
 * we can start only 1, and use the same promise for both.
 */
const CACHE_EXCHANGE_RATE_PROMISES = new Map<string, Promise<number>>();
const fetchExchangeRate = async (date: string): Promise<number> => {
  const cachedPromiseExchangeRate = CACHE_EXCHANGE_RATE_PROMISES.get(date);
  if (cachedPromiseExchangeRate != null) {
    return cachedPromiseExchangeRate;
  }

  const exchangeRatePromise = baseFetchExchangeRate(date);
  // Eagerly set in the cache
  CACHE_EXCHANGE_RATE_PROMISES.set(date, exchangeRatePromise);

  // Auto clean if the promise throws (only keep clean ones in the cache)
  exchangeRatePromise.catch(() => {
    CACHE_EXCHANGE_RATE_PROMISES.delete(date);
  });

  return exchangeRatePromise;
};

export async function GET(
  _request: Request,
  { params }: { params: { date: string } },
) {
  try {
    const exchangeRate = await fetchExchangeRate(params.date);
    return Response.json(exchangeRate, { status: 200 });
  } catch (error) {
    console.error(error);
    // Invalidate the cache, just in case
    if (CACHE_EXCHANGE_RATE_PROMISES.has(params.date)) {
      CACHE_EXCHANGE_RATE_PROMISES.delete(params.date);
    }
    return Response.json(
      {
        error:
          (error as Error).message || `Failed to fetch euro for ${params.date}`,
      },
      { status: 500 },
    );
  }
}
