import { getDefaultData } from "@/lib/data";
import type { SaleEventData } from "@/lib/data";
import { calcTotalGainLoss } from "./calc-total-gain-loss";

describe("calcTotalGainLoss", () => {
  const date = "2024-01-01";
  const testCases: {
    description: string;
    events: SaleEventData[];
    expected: [number | null, number | null];
  }[] = [
    {
      description: "return [null, null] when default state",
      events: [getDefaultData(date)],
      expected: [null, null],
    },
    {
      description: "return [null, null] when rates loading",
      events: [
        {
          quantity: 10,
          proceeds: 100,
          dateSold: date,
          dateAcquired: date,
          adjustedCost: 10,
          rateAcquired: { isFetching: true, rate: null, errorMessage: null },
          rateSold: { isFetching: true, rate: null, errorMessage: null },
        },
      ],
      expected: [null, null],
    },
    {
      description: "return [gain, 0] when only gain",
      events: [
        {
          quantity: 10,
          proceeds: 100,
          dateSold: date,
          dateAcquired: date,
          adjustedCost: 0,
          rateAcquired: { isFetching: false, rate: 1, errorMessage: null },
          rateSold: { isFetching: false, rate: 1, errorMessage: null },
        },
      ],
      expected: [1000, 0],
    },
    {
      description: "return [0, loss] when only loss",
      events: [
        {
          quantity: 10,
          proceeds: 100,
          dateSold: date,
          dateAcquired: date,
          adjustedCost: 200,
          rateAcquired: { isFetching: false, rate: 1, errorMessage: null },
          rateSold: { isFetching: false, rate: 1, errorMessage: null },
        },
      ],
      expected: [0, -1000],
    },
    {
      description: "return [gain, loss] when both gain and loss",
      events: [
        {
          quantity: 10,
          proceeds: 100,
          dateSold: date,
          dateAcquired: date,
          adjustedCost: 200,
          rateAcquired: { isFetching: false, rate: 1, errorMessage: null },
          rateSold: { isFetching: false, rate: 1, errorMessage: null },
        },
        {
          quantity: 10,
          proceeds: 100,
          dateSold: date,
          dateAcquired: date,
          adjustedCost: 0,
          rateAcquired: { isFetching: false, rate: 1, errorMessage: null },
          rateSold: { isFetching: false, rate: 1, errorMessage: null },
        },
      ],
      expected: [1000, -1000],
    },
  ];
  it.each(testCases)("$description", ({ events, expected }) => {
    expect(calcTotalGainLoss(events)).toEqual(expected);
  });
});
