export const getDateString = (date: Date) =>
  date.toISOString().substring(0, 10);

export const parseEtradeDate = (rawDate: string) => {
  const [month, day, year] = rawDate.split("/").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};
