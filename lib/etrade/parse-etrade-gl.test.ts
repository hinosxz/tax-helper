/**
 * @jest-environment node
 */
import XLSX from "xlsx";
import { parseEtradeGL } from "./parse-etrade-gl";

function buildXlsx(headers: string[], dataRows: unknown[][]): File {
  const summaryRow = new Array(headers.length).fill("");
  const ws = XLSX.utils.aoa_to_sheet([headers, summaryRow, ...dataRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws);
  const buf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new File([buf], "test.xlsx");
}

const HEADERS_2025 = [
  "Record Type",
  "Symbol",
  "Plan Type",
  "Quantity",
  "Date Acquired",
  "Date Sold",
  "Grant Date",
  "Adjusted Cost Basis Per Share",
  "Acquisition Cost Per Share",
  "Purchase Date Fair Mkt. Value",
  "Proceeds Per Share",
  "Qualified Plan",
];

const HEADERS_PRE2025 = [
  "Record Type",
  "Symbol",
  "Plan Type",
  "Qty.",
  "Date Acquired",
  "Date Sold",
  "Grant Date",
  "Adjusted Cost Basis Per Share",
  "Acquisition Cost Per Share",
  "Purchase Date Fair Mkt. Value",
  "Proceeds Per Share",
  "Qualified Plan",
];

describe("parseEtradeGL", () => {
  it("parses the 2025 Quantity column format", async () => {
    const file = buildXlsx(HEADERS_2025, [
      [
        "Sell",
        "DDOG",
        "RS",
        10,
        "03/01/2023",
        "06/15/2023",
        "06/01/2021",
        80,
        0,
        "0.0",
        95,
        "",
      ],
    ]);
    const result = await parseEtradeGL(file);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      symbol: "DDOG",
      planType: "RS",
      quantity: 10,
      dateAcquired: "2023-03-01",
      dateSold: "2023-06-15",
      dateGranted: "2021-06-01",
      adjustedCost: 80,
      acquisitionCost: 0,
      proceeds: 95,
      isQualified: true,
    });
  });

  it("parses the pre-2025 Qty. column format", async () => {
    const file = buildXlsx(HEADERS_PRE2025, [
      [
        "Sell",
        "DDOG",
        "SO",
        100,
        "12/12/2019",
        "09/11/2024",
        "09/06/2018",
        35.73,
        1.55,
        0,
        107.997,
        "",
      ],
    ]);
    const result = await parseEtradeGL(file);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      symbol: "DDOG",
      planType: "SO",
      quantity: 100,
      isQualified: true,
    });
  });

  it("marks Qualified Plan value as not French-qualified", async () => {
    const file = buildXlsx(HEADERS_2025, [
      [
        "Sell",
        "DDOG",
        "SO",
        50,
        "05/12/2019",
        "05/09/2023",
        "03/28/2017",
        6.3667,
        0.8517,
        0,
        80.81,
        "Qualified",
      ],
    ]);
    const result = await parseEtradeGL(file);
    expect(result[0].isQualified).toBe(false);
  });

  it("rejects when a required field is missing", async () => {
    const file = buildXlsx(HEADERS_2025, [
      // empty Plan Type triggers ensureDefined error
      [
        "Sell",
        "DDOG",
        "",
        10,
        "03/01/2023",
        "06/15/2023",
        "06/01/2021",
        80,
        0,
        "0.0",
        95,
        "",
      ],
    ]);
    await expect(parseEtradeGL(file)).rejects.toMatch("is not supported");
  });
});
