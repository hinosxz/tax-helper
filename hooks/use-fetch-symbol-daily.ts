import { ONE_DAY } from "@/lib/constants";
import { SymbolDailyResponse } from "@/lib/symbol-daily.types";
import { useQuery } from "@tanstack/react-query";

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

/**
 * Get historical values for a symbol.
 */
export const useFetchSymbolDaily = (symbol: string) => {
  return useQuery({
    queryKey: ["SYMBOL_PRICES", symbol],
    queryFn: () => fetchSymbolDaily(symbol),
    staleTime: ONE_DAY,
  });
};
