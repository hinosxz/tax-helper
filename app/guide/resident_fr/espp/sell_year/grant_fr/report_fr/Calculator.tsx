"use client";
import { ONE_DAY } from "@/lib/constants";
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
import { SaleEvent } from "./SaleEvent";
import { Button } from "@/app/guide/shared/ui/Button";
import { Section } from "@/app/guide/shared/ui/Section";
import { exportToCsv } from "./export-to-csv";
import { FileInput } from "@/app/guide/shared/ui/FileInput";
import { SaleEventData, getDefaultData } from "@/app/guide/shared/lib/data";
import { parseEtradeGL } from "./parse-etrade-gl";
import { getDateString } from "@/app/guide/shared/lib/date";
import { sendErrorToast } from "@/app/guide/shared/ui/Toast";

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
    (v: number) =>
      setEvents((events) =>
        events.map((e, idx) => (idx === index ? { ...e, rateAcquired: v } : e)),
      ),
    [index, setEvents],
  );
  const setRateSold = useCallback(
    (v: number) =>
      setEvents((events) =>
        events.map((e, idx) => (idx === index ? { ...e, rateSold: v } : e)),
      ),
    [index, setEvents],
  );

  return (
    <div>
      <Section
        className="grid grid-cols-1 gap-4"
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
              events.map((e, idx) =>
                idx === index ? { ...e, quantity: v } : e,
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
              events.map((e, idx) =>
                idx === index ? { ...e, proceeds: v } : e,
              ),
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
              events.map((e, idx) =>
                idx === index ? { ...e, dateSold: v } : e,
              ),
            )
          }
          setRateAcquired={setRateAcquired}
          setRateSold={setRateSold}
        />
      </Section>
    </div>
  );
};

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

  return (
    <Section
      className="grid grid-cols-1 gap-4"
      actions={
        <div className="flex gap-2">
          <FileInput
            accept=".xlsx"
            id="import_etrade_g&l"
            label="Import from ETrade G&L"
            onUpload={async (file) => {
              if (!file) {
                return console.error("couldn't import file");
              }
              try {
                const data = await parseEtradeGL(file, "ESPP");
                setEvents(data);
              } catch (e) {
                sendErrorToast(`Failed to import,
                please verify you imported the correct file.`);
              }
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
      </div>
    </Section>
  );
};
