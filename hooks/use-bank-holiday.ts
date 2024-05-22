import { useQuery } from "@tanstack/react-query";

// hook to fetch data for back hollidays from API https://calendrier.api.gouv.fr/jours-feries/metropole.json
const apiUrl = "https://calendrier.api.gouv.fr/jours-feries/metropole.json";

const fetchBankHolidays = async (): Promise<{ [date: string]: string }> => {
  return fetch(apiUrl)
    .then((res) => res.json())
    .then((response) => {
      return response;
    });
};

/**
 * Get bank holidays since 2003.
 */
export const useBankHolidays = () => {
  return useQuery({ queryKey: ["BANK_HOLIDAYS"], queryFn: fetchBankHolidays });
};
