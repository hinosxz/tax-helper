"use client";
import {
  ArrowUpTrayIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

import { SaleEvent } from "./_SaleEvent";
import { ONE_DAY } from "@/lib/constants";
import { Button } from "@/app/guide/shared/ui/Button";
import { Section } from "@/app/guide/shared/ui/Section";
import { exportToCsv } from "@/lib/export-to-csv";
import {
  SaleEventData,
  getDefaultData,
  saleEventFromGainAndLossEvent,
} from "@/lib/data";
import { createEtradeGLFilter } from "@/lib/etrade/parse-etrade-gl";
import {
  getDateString,
  isWeekendDay,
  getNumDaysSinceLastFriday,
} from "@/lib/date";
import { calcTotals as calcTotals } from "@/lib/calc-totals";
import { Currency } from "@/app/guide/shared/ui/Currency";
import { EtradeGainAndLossesFileInput } from "@/app/guide/shared/EtradeGainAndLossesFileInput";
import { PlanType } from "@/lib/etrade/etrade.types";

/**
 * Compute value of the abatement for income taxes based on the income value.
 * Abatement is 50% of the income up to 300k euros,
 * c.f. https://bofip.impots.gouv.fr/bofip/5654-PGP.html/identifiant%3DBOI-RSA-ES-20-20-20-20170724#:~:text=30%C2%A0d%C3%A9cembre%C2%A02016-,49,-Conform%C3%A9ment%20aux%20dispositions
 */
const getAbatement = (income: number) =>
  (income - getAboveAbatementThreshold(income)) / 2;

/** Get income value above 300k euros. */
const getAboveAbatementThreshold = (value: number) =>
  Math.max(value, 300e3) - 300e3;

interface EventBodyProps {
  events: SaleEventData[];
  setEvents: Dispatch<SetStateAction<SaleEventData[]>>;
  lastWeekDay: string;
  index: number;
  data: SaleEventData;
  hasIncome: boolean;
}

const EventBody = ({
  data,
  events,
  setEvents,
  lastWeekDay,
  index,
  hasIncome,
}: EventBodyProps) => {
  const setRateAcquired = useCallback(
    (v: number | null) =>
      setEvents((events) =>
        events.map((e, idx) => (idx === index ? { ...e, rateAcquired: v } : e)),
      ),
    [index, setEvents],
  );
  const setRateSold = useCallback(
    (v: number | null) =>
      setEvents((events) =>
        events.map((e, idx) => (idx === index ? { ...e, rateSold: v } : e)),
      ),
    [index, setEvents],
  );

  return (
    <Section
      title={`Sale event #${index + 1}`}
      actions={
        <Button
          color="red"
          label="Remove"
          icon={MinusIcon}
          onClick={() => setEvents(events.filter((_, idx) => idx !== index))}
          isDisabled={events.length <= 1}
        />
      }
    >
      <SaleEvent
        maxDate={lastWeekDay}
        hasIncome={hasIncome}
        {...data}
        setQuantity={(v) =>
          setEvents(
            events.map((e, idx) => (idx === index ? { ...e, quantity: v } : e)),
          )
        }
        setFractionFr={(v) =>
          setEvents(
            events.map((e, idx) =>
              idx === index ? { ...e, fractionFr: v } : e,
            ),
          )
        }
        setAdjustedCost={(v) =>
          setEvents(
            events.map((e, idx) =>
              idx === index ? { ...e, adjustedCost: v } : e,
            ),
          )
        }
        setProceeds={(v) =>
          setEvents(
            events.map((e, idx) => (idx === index ? { ...e, proceeds: v } : e)),
          )
        }
        setDateAcquired={(v) =>
          setEvents(
            events.map((e, idx) =>
              idx === index ? { ...e, dateAcquired: v } : e,
            ),
          )
        }
        setDateSold={(v) =>
          setEvents(
            events.map((e, idx) => (idx === index ? { ...e, dateSold: v } : e)),
          )
        }
        setRateAcquired={setRateAcquired}
        setRateSold={setRateSold}
      />
    </Section>
  );
};

interface CalculatorProps {
  qualifiedIn: "fr"; // this calculator only supports French plans as of now
  planType?: Extract<PlanType, "ESPP" | "RS">; // TODO support SO
}

export const Calculator = ({ qualifiedIn, planType }: CalculatorProps) => {
  // Exchange rates are only available on weekdays
  const lastWeekDay = useMemo(() => {
    const yesterday = new Date(Date.now() - ONE_DAY);
    if (isWeekendDay(yesterday)) {
      const numDaysSinceLastFriday = getNumDaysSinceLastFriday(yesterday);
      const lastFridayTs =
        yesterday.valueOf() - numDaysSinceLastFriday * ONE_DAY;
      return getDateString(new Date(lastFridayTs));
    }
    return getDateString(new Date(yesterday));
  }, []);

  const eTradeGLFilter = createEtradeGLFilter({
    planType,
    qualifiedIn,
  });

  const [events, setEvents] = useState([
    getDefaultData(lastWeekDay, qualifiedIn),
  ]);

  const totals = useMemo(() => calcTotals(events), [events]);

  return (
    <Section
      actions={
        <div className="flex gap-2">
          <EtradeGainAndLossesFileInput
            id="import_etrade_g&l"
            setData={(lines) => {
              setEvents(
                lines.filter(eTradeGLFilter).map(saleEventFromGainAndLossEvent),
              );
            }}
          />
          <Button
            icon={ArrowUpTrayIcon}
            color="green"
            label="Export to CSV"
            onClick={() => exportToCsv(events)}
          />
        </div>
      }
      title="Calculator"
    >
      <div className="grid gap-8 cols-1">
        {events.map((data, i) => (
          <EventBody
            key={`sale-id-${i}`}
            data={data}
            index={i}
            events={events}
            setEvents={setEvents}
            lastWeekDay={lastWeekDay}
            hasIncome={planType === "RS"}
          />
        ))}
        <div className="flex justify-end">
          <Button
            color="green"
            label="New sale"
            icon={PlusIcon}
            onClick={() =>
              setEvents([...events, getDefaultData(lastWeekDay, qualifiedIn)])
            }
          />
        </div>
        <Section title="Summary">
          <div className="grid grid-cols-1 gap-2">
            {planType === "RS" ? (
              <>
                <div>
                  <span>Income: </span>
                  <Currency value={totals?.income ?? null} unit="eur" />
                </div>
                <div>
                  <span>Income From French Origin: </span>
                  <Currency value={totals?.incomeFr ?? null} unit="eur" />
                </div>
                <div className="border border-gray-300" />
              </>
            ) : null}
            <div>
              <span>Capital Gain (1133-A): </span>
              <Currency value={totals?.gain ?? null} unit="eur" />
            </div>
            <div>
              <span>Capital Loss (1133-B): </span>
              <Currency value={totals?.loss ?? null} unit="eur" />
            </div>
            <div>
              <span>Capital Gain / Loss: </span>
              <Currency
                value={totals && totals.gain + totals.loss}
                unit="eur"
              />
            </div>
            {planType === "RS" ? (
              <>
                <div className="border border-gray-300" />
                <div>
                  <span>Taxable Income above 300k€ (1TT): </span>
                  <Currency
                    value={
                      totals
                        ? getAboveAbatementThreshold(totals.incomeFr)
                        : null
                    }
                    unit="eur"
                  />
                </div>
                <div>
                  <span>Taxable Income (1TZ): </span>
                  <Currency
                    value={
                      totals
                        ? totals.incomeFr - getAbatement(totals.incomeFr)
                        : null
                    }
                    unit="eur"
                  />
                </div>
                <div>
                  <span>Abatement (1WZ): </span>
                  <Currency
                    value={totals ? getAbatement(totals.incomeFr) : null}
                    unit="eur"
                  />
                </div>
              </>
            ) : null}
          </div>
        </Section>
      </div>
    </Section>
  );
};
