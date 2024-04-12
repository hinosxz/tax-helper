import { useQuery, QueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

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

export const useFetchExr = (
  date: string
): {
  rate: number | null;
  isFetching: boolean;
  errorMessage: string | null;
} => {
  const searchParams = useMemo(() => {
    const p = new URLSearchParams({
      format: "jsondata",
      detail: "dataonly",
    });
    p.set("startPeriod", date);
    p.set("endPeriod", date);
    return p;
  }, [date]);

  const { data, isFetching, error } = useQuery({
    queryKey: ["USD_EUR_EXCHANGE_RATE", date],
    queryFn: (): Promise<Response> =>
      fetch(`${apiUrl}?${searchParams.toString()}`).then((res) => res.json()),
  });

  let rate: number | null = null;
  let errorMessage: string | null = null;

  if (error) {
    errorMessage = `failed fetching exchange rate for date ${date}`;
  }

  try {
    if (data) {
      rate = data.dataSets[0].series["0:0:0:0:0"].observations[0][0];
    }
  } catch {
    errorMessage = "failed extracting rate from api response";
  }

  return {
    rate,
    isFetching,
    errorMessage,
  };
};
