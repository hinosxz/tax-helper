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
interface Response {
  dataSets: DataSet[];
}

const baseFetchExchangeRate = async (date: string): Promise<number> => {
  const url = new URL(API_BASE_URL);
  url.searchParams.set("format", "jsondata");
  url.searchParams.set("detail", "dataonly");
  url.searchParams.set("startPeriod", date);
  url.searchParams.set("endPeriod", date);

  return fetch(url)
    .then((res) => res.json())
    .then(
      (data: Response) =>
        data.dataSets[0].series["0:0:0:0:0"].observations[0][0],
    );
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
    return Response.json(
      {
        error:
          (error as Error).message || `Failed to fetch euro for ${params.date}`,
      },
      { status: 500 },
    );
  }
}
