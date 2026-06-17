/**
 * @jest-environment node
 */

import fs from "fs";
import path from "path";
import type { FrTaxes } from "@/lib/taxes/taxes-rules-fr";
import type { SymbolDailyResponse } from "@/lib/symbol-daily.types";
import { fetchExchangeRate } from "@/lib/euro-exchange-rate";
import { fetchSymbolDaily } from "@/lib/stock-prices";

jest.mock("../../lib/euro-exchange-rate");
jest.mock("../../lib/stock-prices", () => ({
  ...jest.requireActual("../../lib/stock-prices"),
  fetchSymbolDaily: jest.fn(),
}));

const mockFetchExchangeRate = fetchExchangeRate as jest.MockedFunction<
  typeof fetchExchangeRate
>;
const mockFetchSymbolDaily = fetchSymbolDaily as jest.MockedFunction<
  typeof fetchSymbolDaily
>;

import { POST } from "@/app/api/calculate/route";

const FIXTURES_DIR = path.join(__dirname, "__fixtures__");
const cases = fs
  .readdirSync(FIXTURES_DIR)
  .filter((name) => fs.statSync(path.join(FIXTURES_DIR, name)).isDirectory());

describe.each(cases)("%s", (caseName) => {
  const caseDir = path.join(FIXTURES_DIR, caseName);

  beforeEach(() => {
    mockFetchExchangeRate.mockReset();
    mockFetchSymbolDaily.mockReset();
  });

  it("POST /api/calculate returns the same taxes as the direct computation", async () => {
    const rates: Record<string, number> = JSON.parse(
      fs.readFileSync(path.join(caseDir, "rates.json"), "utf-8"),
    );
    const symbolPrices: Record<string, SymbolDailyResponse> = JSON.parse(
      fs.readFileSync(path.join(caseDir, "symbol-prices.json"), "utf-8"),
    );
    const expected: FrTaxes = JSON.parse(
      fs.readFileSync(path.join(caseDir, "expected.json"), "utf-8"),
    );
    const configPath = path.join(caseDir, "config.json");
    const config: { fractions?: number[] } = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath, "utf-8"))
      : {};

    mockFetchExchangeRate.mockImplementation((date) =>
      Promise.resolve(rates[date]),
    );
    mockFetchSymbolDaily.mockImplementation((symbol) =>
      Promise.resolve(symbolPrices[symbol]),
    );

    const xlsxBuffer = fs.readFileSync(path.join(caseDir, "etrade-gl.xlsx"));
    const formData = new FormData();
    formData.append("file", new File([xlsxBuffer], "etrade-gl.xlsx"));
    if (config.fractions) {
      formData.append("fractions", JSON.stringify(config.fractions));
    }

    const response = await POST(
      new Request("http://localhost/api/calculate", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(200);
    const normalised = JSON.parse(JSON.stringify(await response.json()));
    expect(normalised).toEqual(expected);
  });
});
