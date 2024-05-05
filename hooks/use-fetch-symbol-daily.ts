import { ONE_DAY } from "@/lib/constants";
import { SymbolDailyResponse } from "@/lib/symbol-daily.types";
import { useQueries } from "@tanstack/react-query";

const apiUrl = "/api/stock/{symbol}/daily";

const fetchSymbolDaily = async (
  symbol: string,
): Promise<SymbolDailyResponse> => {
  return fetch(`${apiUrl.replace("{symbol}", symbol)}`)
    .then((res) => res.json())
    .then((response: SymbolDailyResponse) => {
      return response;
    });
};

interface UseSymbolDailyResponse {
  isFetching: boolean;
  isError: boolean;
  values: {
    [symbol: string]: SymbolDailyResponse;
  };
}

/**
 * Get historical values for a symbol.
 */
export const useFetchSymbolDaily = (symbols: string[]) => {
  const results = useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: ["SYMBOL_PRICES", symbol],
      queryFn: () => fetchSymbolDaily(symbol),
      staleTime: ONE_DAY,
    })),
  });
  const data: UseSymbolDailyResponse = {
    isFetching: false,
    isError: false,
    values: {},
  };

  results.forEach(
    (
      query,
      index /* order returned from useQueries is the same as the input order */,
    ) => {
      const symbol = symbols[index];
      data.isFetching = data.isFetching || query.isFetching;
      data.isError = data.isError || query.isError;
      if (query.data) {
        data.values[symbol] = query.data;
      }
    },
  );

  return data;
};
