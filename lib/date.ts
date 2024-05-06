export const getDateString = (date: Date) =>
  date.toISOString().substring(0, 10);

export const parseEtradeDate = (rawDate: string) => {
  const [month, day, year] = rawDate.split("/").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const months = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];
/**
 * Format a date to a French date.
 */
export const formatDateFr = (/** format YYYY-MM-DD */ date: string) => {
  const [year, monthNumber, day] = date.split("-").map(Number);
  return `${day} ${months[monthNumber]} ${year}`;
};
