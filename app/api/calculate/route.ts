import { parseEtradeGL } from "@/lib/etrade/parse-etrade-gl";
import { fetchExchangeRate } from "@/lib/euro-exchange-rate";
import { fetchSymbolDaily } from "@/lib/stock-prices";
import { applyFrTaxes } from "@/lib/taxes/taxes-rules-fr";

function parseJsonArray<T>(raw: string, isValid: (v: unknown) => v is T): T[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.some((v) => !isValid(v))) {
    throw new Error();
  }
  return parsed;
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing or invalid file" }, { status: 400 });
  }

  let fractions: number[] = [];
  const fractionsRaw = formData.get("fractions");
  if (fractionsRaw) {
    try {
      fractions = parseJsonArray(
        fractionsRaw as string,
        (v): v is number => typeof v === "number",
      );
    } catch {
      return Response.json(
        { error: "Invalid fractions: must be a JSON array of numbers" },
        { status: 400 },
      );
    }
  }

  let isFrQualified: boolean[] = [];
  const isFrQualifiedRaw = formData.get("isFrQualified");
  if (isFrQualifiedRaw) {
    try {
      isFrQualified = parseJsonArray(
        isFrQualifiedRaw as string,
        (v): v is boolean => typeof v === "boolean",
      );
    } catch {
      return Response.json(
        { error: "Invalid isFrQualified: must be a JSON array of booleans" },
        { status: 400 },
      );
    }
  }

  let gainsAndLosses;
  try {
    gainsAndLosses = await parseEtradeGL(file);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 422 });
  }

  const uniqueDates = new Set<string>();
  const uniqueSymbols = new Set<string>();
  for (const event of gainsAndLosses) {
    uniqueDates.add(event.dateAcquired);
    uniqueDates.add(event.dateSold);
    uniqueSymbols.add(event.symbol);
  }

  let rates: { [date: string]: number };
  let symbolPrices: {
    [symbol: string]: Awaited<ReturnType<typeof fetchSymbolDaily>>;
  };
  try {
    const [rateEntries, symbolEntries] = await Promise.all([
      Promise.all(
        [...uniqueDates].map((date) =>
          fetchExchangeRate(date).then((rate) => [date, rate] as const),
        ),
      ),
      Promise.all(
        [...uniqueSymbols].map((symbol) =>
          fetchSymbolDaily(symbol).then((prices) => [symbol, prices] as const),
        ),
      ),
    ]);
    rates = Object.fromEntries(rateEntries);
    symbolPrices = Object.fromEntries(symbolEntries);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message || "Failed to fetch external data" },
      { status: 502 },
    );
  }

  const taxes = applyFrTaxes({
    gainsAndLosses,
    benefits: [],
    rates,
    symbolPrices,
    fractions,
    isFrQualified,
  });

  return Response.json(taxes, { status: 200 });
}
