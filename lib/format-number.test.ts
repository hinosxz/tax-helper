import {
  floorNumber,
  ceilNumber,
  formatNumber,
  roundNumber,
} from "./format-number";

describe("formatNumber", () => {
  it("should add 2 decimal places", () => {
    expect(formatNumber(1)).toBe("1.00");
  });
  it("should format a number with 2 decimal places", () => {
    expect(formatNumber(1.234)).toBe("1.23");
  });
  it("should format null", () => {
    expect(formatNumber(null)).toBe("–");
  });
});

describe("floorNumber", () => {
  it("should floor a number with 2 decimal places", () => {
    expect(floorNumber(1.234)).toBe(1.23);
  });
  it("should work on number with 3 decimal places", () => {
    expect(floorNumber(1.2342, 3)).toBe(1.234);
  });
  it("should floor a number with 3 decimal places", () => {
    expect(floorNumber(1.2347, 3)).toBe(1.234);
  });
  it("should floor a number with no decimals", () => {
    expect(floorNumber(1, 2)).toBe(1);
  });
});

describe("ceilNumber", () => {
  it("should ceil a number with 2 decimal places", () => {
    expect(ceilNumber(1.234)).toBe(1.24);
  });
  it("should work on number with 3 decimal places", () => {
    expect(ceilNumber(1.2342, 3)).toBe(1.235);
  });
  it("should ceil a number with 3 decimal places", () => {
    expect(ceilNumber(1.2347, 3)).toBe(1.235);
  });
  it("should ceil a number with no decimals", () => {
    expect(ceilNumber(1, 2)).toBe(1);
  });
});

describe("roundNumber", () => {
  it("should round a number with 2 decimal places", () => {
    expect(roundNumber(1.234)).toBe(1.23);
  });
  it("should work on number with 3 decimal places", () => {
    expect(roundNumber(1.2342, 3)).toBe(1.234);
  });
  it("should round a number with 3 decimal places", () => {
    expect(roundNumber(1.2347, 3)).toBe(1.235);
  });
  it("should round a number with no decimals", () => {
    expect(roundNumber(1, 2)).toBe(1);
  });
});
