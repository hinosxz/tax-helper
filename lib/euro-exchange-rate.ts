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

const baseFetchExchangeRate = async (date: string): Promise<number> => {
  const url = new URL(API_BASE_URL);
  url.searchParams.set("format", "jsondata");
  url.searchParams.set("detail", "dataonly");
  url.searchParams.set("startPeriod", date);
  url.searchParams.set("endPeriod", date);

  // Fetch the exchange rate, with no cache to avoid having staled data
  const res = await fetch(url, { cache: "no-cache" });

  try {
    const data = (await res.json()) as EcbResponse;

    return data.dataSets[0].series["0:0:0:0:0"].observations[0][0];
  } catch (error) {
    // Transform the error into a more user-friendly one
    throw new Error(
      `${(error as Error).message} for ${date}
Response status: ${res.status} ${res.statusText}
Response body:
${await res.text()}`,
    );
  }
};

/**
 * Use a Map of promises instead of map of numbers, so that if we receive 2 requests at the same time on the same date,
 * we can start only 1, and use the same promise for both.
 */
const CACHE_EXCHANGE_RATE_PROMISES = new Map<string, Promise<number>>();

export const fetchExchangeRate = async (date: string): Promise<number> => {
  const cachedPromise = CACHE_EXCHANGE_RATE_PROMISES.get(date);
  if (cachedPromise != null) {
    return cachedPromise;
  }

  const promise = baseFetchExchangeRate(date);
  // Eagerly set in the cache
  CACHE_EXCHANGE_RATE_PROMISES.set(date, promise);

  // Auto clean if the promise throws (only keep clean ones in the cache)
  promise.catch(() => {
    CACHE_EXCHANGE_RATE_PROMISES.delete(date);
  });

  return promise;
};
