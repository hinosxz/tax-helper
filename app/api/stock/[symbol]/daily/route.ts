import { fetchSymbolDaily } from "@/lib/stock-prices";

export async function GET(
  _request: Request,
  { params }: { params: { symbol: string } },
) {
  const symbol = params.symbol;
  if (!/^[A-Z0-9.^-]{1,10}$/i.test(symbol)) {
    return Response.json({ error: "Invalid symbol" }, { status: 400 });
  }
  try {
    const values = await fetchSymbolDaily(symbol);
    return Response.json(values, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error: (error as Error).message || `Failed to fetch ${symbol} prices`,
      },
      { status: 500 },
    );
  }
}
