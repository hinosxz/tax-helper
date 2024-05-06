import { getDateString, parseEtradeDate } from "./date";

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
});
