/**
 * @jest-environment node
 */

// 2023-06-15 00:00:00 UTC
const TIMESTAMP_2023_06_15 = 1686787200;

const VALID_RESPONSE = {
  chart: {
    result: [
      {
        timestamp: [TIMESTAMP_2023_06_15],
        indicators: {
          quote: [{ open: [95.0], close: [95.5] }],
        },
      },
    ],
    error: null,
  },
};

const mockFetch = jest.fn();

beforeAll(() => {
  global.fetch = mockFetch;
});

beforeEach(() => {
  mockFetch.mockReset();
});

import { GET } from "./route";

const makeRequest = () => new Request("http://localhost");

const getRoute = (symbol: string) => GET(makeRequest(), { params: { symbol } });

describe("GET /api/stock/[symbol]/daily", () => {
  it("returns parsed daily prices on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(VALID_RESPONSE),
    });

    const res = await getRoute("AAPL");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body["2023-06-15"]).toEqual({ opening: 95, closing: 95.5 });
  });

  it("skips entries with null open or close", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          chart: {
            result: [
              {
                timestamp: [TIMESTAMP_2023_06_15, TIMESTAMP_2023_06_15 + 86400],
                indicators: {
                  quote: [{ open: [95.0, null], close: [95.5, 96.0] }],
                },
              },
            ],
            error: null,
          },
        }),
    });

    const res = await getRoute("AAPL2");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(Object.keys(body)).toHaveLength(1);
  });

  it("returns 500 when Yahoo Finance returns an error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          chart: {
            result: null,
            error: { code: "Not Found", description: "Invalid symbol." },
          },
        }),
    });

    const res = await getRoute("INVALID");
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch("Invalid symbol.");
  });

  it("returns 500 when chart.result is null and no error field is set", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ chart: { result: null, error: null } }),
    });

    const res = await getRoute("NULLRES");
    expect(res.status).toBe(500);
  });

  it("returns 500 when indicators.quote is empty", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          chart: {
            result: [
              {
                timestamp: [TIMESTAMP_2023_06_15],
                indicators: { quote: [] },
              },
            ],
            error: null,
          },
        }),
    });

    const res = await getRoute("EMPTYQ");
    expect(res.status).toBe(500);
  });

  it("returns 400 on invalid symbol", async () => {
    const res = await getRoute("../../etc/passwd");
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns 500 on HTTP error", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 429 });

    const res = await getRoute("RATE");
    expect(res.status).toBe(500);
  });

  it("returns 500 when result is empty", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          chart: {
            result: [
              {
                timestamp: [],
                indicators: { quote: [{ open: [], close: [] }] },
              },
            ],
            error: null,
          },
        }),
    });

    const res = await getRoute("EMPTY");
    expect(res.status).toBe(500);
  });

  it("returns 500 when fetch throws a network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const res = await getRoute("NETERR");
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch("Network error");
  });
});
