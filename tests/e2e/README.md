# E2E Tests

End-to-end tests that verify the full French tax computation pipeline against real
E-Trade xlsx export files.

Each test case:

1. Parses an actual E-Trade Gain & Loss xlsx file
2. Loads EUR/USD exchange rates and stock prices from pre-fetched fixture files
3. Runs `applyFrTaxes()` and compares the output against a committed golden file

## Running the tests

```bash
npm run test:e2e
```

## Fixture structure

```
tests/e2e/__fixtures__/
  <case-name>/
    etrade-gl.xlsx        E-Trade "Gain & Loss" export file
    rates.json            EUR/USD rate for each event date (from ECB)
    symbol-prices.json    Daily opening/closing prices per symbol (from Yahoo Finance)
    expected.json         Golden file — committed expected output of applyFrTaxes()
    config.json           (optional) per-case overrides, e.g. fractions
```

Case names follow the convention `{year}_{counts}_{qualification}_{hash}`, which
encodes the tax year, plan type counts, and a short identifier — but the name is
arbitrary; only the folder contents matter.

### `config.json` (optional)

Used for cases where the employee worked in multiple countries during a vesting
period, so only a fraction of the acquisition gain is reportable in France.

```json
{
  "fractions": [1, 0.8, 1]
}
```

Each value in `fractions` corresponds to the event at that index (sorted by sell
date, as returned by `applyFrTaxes`). Omit the file or the key to default to `1`
for all events.

## Adding a new case

**1. Create the fixture directory and copy the xlsx file in:**

```bash
name="2025_1SO_0ESPP_2RSU_QFR_xxxx"
mkdir -p tests/e2e/__fixtures__/"$name"
cp ~/Downloads/your-etrade-export.xlsx tests/e2e/__fixtures__/"$name"/etrade-gl.xlsx
```

**2. Fetch EUR/USD rates and stock prices:**

```bash
npm run setup-e2e-fixtures
```

The script skips cases that already have `rates.json` and `symbol-prices.json`.
Pass `--force` to re-fetch everything.

**3. Generate the golden file:**

```bash
npm run test:e2e
```

On first run a case produces `expected.json` automatically and the test passes.

**4. Verify the output against your actual tax forms.**

Open `tests/e2e/__fixtures__/<case-name>/expected.json` and confirm the key
values match what you reported (or intend to report):

| Field                  | Tax form box                                               |
| ---------------------- | ---------------------------------------------------------- |
| `1TT`                  | Acquisition gains from qualified SO / RSU above 300 k€     |
| `1TZ`                  | RSU acquisition gains below 300 k€ (after 50 % rebate)     |
| `1WZ`                  | Tax rebate for `1TZ`                                       |
| `1AJ`                  | Non-qualified gains (reported by employer, always 0 here)  |
| `3VG`                  | Capital gains / losses                                     |
| `Form 2074 > Page 510` | Line-by-line detail for each sale (used to fill form 2074) |

**5. Commit everything:**

```bash
git add tests/e2e/__fixtures__/"$name"
git commit -m "Add E2E fixture: $name"
```

## Refreshing fixture data

Exchange rates and stock prices are pinned at fetch time so tests are
deterministic and offline-capable. If you need to update them (e.g. to pick up a
corrected rate), run:

```bash
npm run setup-e2e-fixtures -- --force
```

Then re-run `npm run test:e2e`. If the output changes, review the diff in
`expected.json` before committing.

## How the setup script works

`tests/e2e/setup-fixtures.ts` is a standalone Node.js/TypeScript script that:

1. Reads every `etrade-gl.xlsx` in `__fixtures__/` and extracts event dates and
   ticker symbols.
2. Fetches EUR/USD rates for the full date range in a **single request** to the
   [ECB SDMX API](https://data-api.ecb.europa.eu). Dates that fall on weekends or
   market holidays are resolved to the nearest preceding trading day, matching the
   behaviour of the app's `useExchangeRates` hook.
3. Fetches daily OHLC data per symbol from **Yahoo Finance** (no API key required)
   for the relevant date window, with a 14-day buffer before the earliest date to
   cover the backward-search in `getAdjustedSymbolDate`.
4. Writes `rates.json` and `symbol-prices.json` into each fixture directory.
