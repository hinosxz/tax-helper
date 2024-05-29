import { ONE_DAY } from "@/lib/constants";
import { UseQueryResult, useQueries } from "@tanstack/react-query";
import { useBankHolidays } from "./use-bank-holiday";
import { dayBefore, isWeekend } from "@/lib/date";

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
export const useExchangeRates = (dates: string[]): UseExchangeRateResponse => {
  const bankHolidays = useBankHolidays();

  const results = useQueries({
    queries: dates.map((date) => {
      // Adjust date when this is a weekend or a French bank holiday
      let adjustedDate = date;
      while (bankHolidays.data?.[adjustedDate] || isWeekend(adjustedDate)) {
        adjustedDate = dayBefore(adjustedDate);
      }
      return {
        queryKey: ["USD_EUR_EXCHANGE_RATE", date],
        queryFn: async () => {
          const rate = await fetchExchangeRate(adjustedDate);
          return rate;
        },
        staleTime: ONE_DAY,
        enabled: !bankHolidays.isFetching,
      };
    }),
  });

  if (bankHolidays.isFetching) {
    return {
      isFetching: true,
      isError: false,
      responses: {},
      values: {},
    };
  }

  const data: UseExchangeRateResponse = {
    isError: false,
    isFetching: false,
    responses: {},
    values: {},
  };

  results.forEach((result, index) => {
    const { data: rate } = result;
    const date = dates[index];
    data.isFetching = data.isFetching || result.isFetching;
    data.isError = data.isError || result.isError;
    data.responses[date] = results[index];
    if (rate) {
      data.values[date] = rate;
    }
  });

  return data;
};
