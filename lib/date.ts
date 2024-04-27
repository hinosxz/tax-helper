export const getDateString = (date: Date) =>
  date.toISOString().substring(0, 10);
