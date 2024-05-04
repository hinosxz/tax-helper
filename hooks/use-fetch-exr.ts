import { ONE_DAY } from "@/lib/constants";
import { UseQueryResult, useQueries } from "@tanstack/react-query";

const apiUrl =
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

// @deprecated use useExchangeRates instead
export interface ExchangeRate {
  rate: number | null;
  isFetching: boolean;
  errorMessage: string | null;
}

const fetchExchangeRate = async (date: string): Promise<number> => {
  const searchParams = new URLSearchParams({
    format: "jsondata",
    detail: "dataonly",
  });
  searchParams.set("startPeriod", date);
  searchParams.set("endPeriod", date);

  return fetch(`${apiUrl}?${searchParams.toString()}`)
    .then((res) => res.json())
    .then(
      (data: Response) =>
        data.dataSets[0].series["0:0:0:0:0"].observations[0][0],
    );
};

interface UseExchangeRateResponse {
  isFetching: boolean;
  isError: boolean;
  responses: {
    [date: string]: UseQueryResult<number, unknown>;
  };
  values: {
    [date: string]: number;
  };
}
const DEFAULT_EXCHANGE_RATE = 1;
export const useExchangeRates = (dates: string[]): UseExchangeRateResponse => {
  const results = useQueries({
    queries: dates.map((date) => ({
      queryKey: ["USD_EUR_EXCHANGE_RATE", date],
      queryFn: async () => {
        const rate = await fetchExchangeRate(date);
        // To keep track of the date in combine, it is repeated in the result
        return { date, rate };
      },
      staleTime: ONE_DAY,
    })),
  });

  const data: UseExchangeRateResponse = {
    isError: false,
    isFetching: false,
    responses: {},
    values: {},
  };

  for (const { data: fetchResponse, ...result } of results) {
    const query = {
      ...result,
      // Overwrite the data with the rate only
      data: fetchResponse?.rate ?? DEFAULT_EXCHANGE_RATE,
    } as UseQueryResult<number, unknown>;

    data.isFetching = data.isFetching || result.isFetching;
    data.isError = data.isError || result.isError;
    if (fetchResponse) {
      data.responses[fetchResponse.date] = query;
      data.values[fetchResponse.date] = fetchResponse.rate;
    }
  }

  return data;
};
