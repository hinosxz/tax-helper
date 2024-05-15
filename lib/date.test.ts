import { formatDateFr, getDateString, parseEtradeDate } from "./date";

describe("date", () => {
  describe("getDateString", () => {
    it("should return date in string format", () => {
      const date = new Date(Date.UTC(2021, 8 /* month starts at 0... */, 1));
      expect(getDateString(date)).toEqual("2021-09-01");
    });
  });

  describe("parseEtradeDate", () => {
    it("should return date in string format", () => {
      const rawDate = "09/01/2021";
      expect(parseEtradeDate(rawDate)).toEqual(
        new Date(Date.UTC(2021, 8 /* month starts at 0... */, 1)),
      );
    });

    it("should return a date that can be parsed back", () => {
      const rawDate = "09/01/2021";
      const parsed = parseEtradeDate(rawDate);

      expect(new Date(parsed).toISOString()).toEqual(
        "2021-09-01T00:00:00.000Z",
      );
    });
  });

  describe("formatDateFr", () => {
    it("should return a French date", () => {
      expect(formatDateFr("2021-09-01")).toEqual("1 sep 2021");
    });

    it("should throw if date format is not valid", () => {
      expect(() => formatDateFr("2021-09-01-01")).toThrow(
        "Invalid date format",
      );
    });

    it("should throw if month is invalid", () => {
      expect(() => formatDateFr("2021-13-01")).toThrow("Invalid month");
    });

    it("should throw if day is invalid", () => {
      expect(() => formatDateFr("2021-09-32")).toThrow("Invalid day");
    });
  });
});
