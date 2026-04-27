import fs from "fs";
import path from "path";
import { parseEtradeGL } from "@/lib/etrade/parse-etrade-gl";
import { applyFrTaxes, type FrTaxes } from "@/lib/taxes/taxes-rules-fr";
import type { SymbolDailyResponse } from "@/lib/symbol-daily.types";

const FIXTURES_DIR = path.join(__dirname, "__fixtures__");

const cases = fs
  .readdirSync(FIXTURES_DIR)
  .filter((name) => fs.statSync(path.join(FIXTURES_DIR, name)).isDirectory());

describe.each(cases)("%s", (caseName) => {
  const caseDir = path.join(FIXTURES_DIR, caseName);

  it("computes french taxes", async () => {
    const ratesPath = path.join(caseDir, "rates.json");
    const symbolPricesPath = path.join(caseDir, "symbol-prices.json");

    if (!fs.existsSync(ratesPath) || !fs.existsSync(symbolPricesPath)) {
      throw new Error(
        `Missing fixture data for "${caseName}". Run: npm run setup-e2e-fixtures`,
      );
    }

    const rates: Record<string, number> = JSON.parse(
      fs.readFileSync(ratesPath, "utf-8"),
    );
    const symbolPrices: Record<string, SymbolDailyResponse> = JSON.parse(
      fs.readFileSync(symbolPricesPath, "utf-8"),
    );

    // Optional per-case config (e.g. fractions for people with split residency)
    const configPath = path.join(caseDir, "config.json");
    const config: { fractions?: number[] } = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath, "utf-8"))
      : {};

    // Read and parse XLSX file
    const xlsxBuffer = fs.readFileSync(path.join(caseDir, "etrade-gl.xlsx"));
    const file = new File([xlsxBuffer], "etrade-gl.xlsx");
    const gainsAndLosses = await parseEtradeGL(file);

    const taxes = applyFrTaxes({
      gainsAndLosses,
      benefits: [],
      rates,
      symbolPrices,
      fractions: config.fractions ?? [],
    });

    // Normalise through JSON roundtrip so that undefined properties and
    // numeric precision match exactly how expected.json is written on disk.
    const normalised = JSON.parse(JSON.stringify(taxes)) as FrTaxes;

    const expectedPath = path.join(caseDir, "expected.json");
    if (!fs.existsSync(expectedPath)) {
      fs.writeFileSync(expectedPath, JSON.stringify(normalised, null, 2));
      console.log(
        `\nGenerated expected.json for "${caseName}".`,
        "\nVerify the values against your tax forms, then commit the file.",
      );
      return;
    }

    const expected: FrTaxes = JSON.parse(
      fs.readFileSync(expectedPath, "utf-8"),
    );
    expect(normalised).toEqual(expected);
  });
});
