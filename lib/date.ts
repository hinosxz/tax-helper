export const getDateString = (date: Date) =>
  date.toISOString().substring(0, 10);

export const parseEtradeDate = (rawDate: string) => {
  const [month, day, year] = rawDate.split("/").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

// On Saturday:
// date.getDay() = 6 => date.getDay() / 6 = 1 => numDaysSinceLastFriday = 1
// On Sunday:
// date.getDay() = 0 => date.getDay() / 6 = 0 => numDaysSinceLastFriday = 2
export const getNumDaysSinceLastFriday = (date: Date) =>
  2 - Math.floor(date.getDay() / 6);

export const isWeekendDay = (date: Date) => date.getDay() % 6 === 0;
