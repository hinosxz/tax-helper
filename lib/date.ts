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
const pattern = /^\d{4}-\d{2}-\d{2}$/;
/**
 * Format a date of format `YYYY-MM-DD` to a French date string `DD month YYYY`.
 */
export const formatDateFr = (/** format YYYY-MM-DD */ date: string) => {
  if (!pattern.test(date)) {
    throw new Error("Invalid date format");
  }

  const [year, monthNumber, day] = date.split("-").map(Number);
  if (monthNumber < 1 || monthNumber > 12) {
    throw new Error("Invalid month");
  }
  if (day < 1 || day > 31) {
    throw new Error("Invalid day");
  }
  return `${day} ${months[monthNumber - 1]} ${year}`;
};
