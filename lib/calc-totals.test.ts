import { getDefaultData } from "@/lib/data";
import type { SaleEventData } from "@/lib/data";
import { Totals, calcTotals } from "./calc-totals";

describe("calcTotals", () => {
  const date = "2024-01-01";
  const testCases: {
    description: string;
    events: SaleEventData[];
    expected: Totals | null;
  }[] = [
    {
      description: "return [null, null] when default state",
      events: [getDefaultData(date, true)],
      expected: null,
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
          fractionFr: 1,
        },
      ],
      expected: null,
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
          fractionFr: 1,
        },
      ],
      expected: { gain: 1000, loss: 0, income: 0, incomeFr: 0, proceeds: 1000 },
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
          fractionFr: 1,
        },
      ],
      expected: {
        gain: 0,
        loss: -1000,
        income: 2000,
        incomeFr: 2000,
        proceeds: 1000,
      },
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
          fractionFr: 1,
        },
        {
          quantity: 10,
          proceeds: 100,
          dateSold: date,
          dateAcquired: date,
          adjustedCost: 0,
          rateAcquired: { isFetching: false, rate: 1, errorMessage: null },
          rateSold: { isFetching: false, rate: 1, errorMessage: null },
          fractionFr: 1,
        },
      ],
      expected: {
        gain: 1000,
        loss: -1000,
        income: 2000,
        incomeFr: 2000,
        proceeds: 2000,
      },
    },
  ];
  it.each(testCases)("$description", ({ events, expected }) => {
    expect(calcTotals(events)).toEqual(expected);
  });
});
