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
import { getDateString } from "@/lib/date";
import { ExchangeRate } from "@/hooks/use-fetch-exr";
import { calcTotalGainLoss } from "@/lib/calc-total-gain-loss";
import { Currency } from "@/app/guide/shared/ui/Currency";
import { EtradeGainAndLossesFileInput } from "@/app/guide/shared/EtradeGainAndLossesFileInput";

// On Saturday:
// date.getDay() = 6 => date.getDay() / 6 = 1 => numDaysSinceLastFriday = 1
// On Sunday:
// date.getDay() = 0 => date.getDay() / 6 = 0 => numDaysSinceLastFriday = 2
const getNumDaysSinceLastFriday = (date: Date) =>
  2 - Math.floor(date.getDay() / 6);

const isWeekendDay = (date: Date) => date.getDay() % 6 === 0;

interface EventBodyProps {
  events: SaleEventData[];
  setEvents: Dispatch<SetStateAction<SaleEventData[]>>;
  lastWeekDay: string;
  index: number;
  data: SaleEventData;
}

const EventBody = ({
  data,
  events,
  setEvents,
  lastWeekDay,
  index,
}: EventBodyProps) => {
  const setRateAcquired = useCallback(
    (v: ExchangeRate) =>
      setEvents((events) =>
        events.map((e, idx) => (idx === index ? { ...e, rateAcquired: v } : e)),
      ),
    [index, setEvents],
  );
  const setRateSold = useCallback(
    (v: ExchangeRate) =>
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
        {...data}
        setQuantity={(v) =>
          setEvents(
            events.map((e, idx) => (idx === index ? { ...e, quantity: v } : e)),
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

const isFrQualifiedEspp = createEtradeGLFilter({
  planType: "ESPP",
  isPlanFrQualified: true,
});

export const Calculator = () => {
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

  const [events, setEvents] = useState([getDefaultData(lastWeekDay)]);

  const capitalGainLoss = useMemo(() => calcTotalGainLoss(events), [events]);
  const [capitalGain, capitalLoss] = capitalGainLoss;

  return (
    <Section
      actions={
        <div className="flex gap-2">
          <EtradeGainAndLossesFileInput
            id="import_etrade_g&l"
            setData={(lines) => {
              setEvents(
                lines
                  .filter(isFrQualifiedEspp)
                  .map(saleEventFromGainAndLossEvent),
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
          />
        ))}
        <div className="flex justify-end">
          <Button
            color="green"
            label="New sale"
            icon={PlusIcon}
            onClick={() => setEvents([...events, getDefaultData(lastWeekDay)])}
          />
        </div>
        <Section title="Summary">
          <div className="grid gap-2">
            <div>
              <span>Capital Gain (1133-A): </span>
              <Currency value={capitalGain} unit="eur" />
            </div>
            <div>
              <span>Capital Loss (1133-B): </span>
              <Currency value={capitalLoss} unit="eur" />
            </div>
            <div>
              <span>Capital Gain / Loss: </span>
              <Currency
                value={capitalGain && capitalLoss && capitalGain + capitalLoss}
                unit="eur"
              />
            </div>
          </div>
        </Section>
      </div>
    </Section>
  );
};
