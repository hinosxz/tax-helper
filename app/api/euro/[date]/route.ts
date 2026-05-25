import { getOrFetchRate } from "@/lib/exchange-rate-cache";

export async function GET(
  _request: Request,
  { params }: { params: { date: string } },
) {
  try {
    const exchangeRate = await getOrFetchRate(params.date);
    return Response.json(exchangeRate, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error:
          (error as Error).message || `Failed to fetch euro for ${params.date}`,
      },
      { status: 500 },
    );
  }
}
