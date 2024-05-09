/** String in the form "YYYY-MM-DD" */
export type ApiDate = string;
export interface SymbolDailyResponse {
  [date: ApiDate]: { opening: number; closing: number };
}
