"use client";
import { ONE_DAY } from "@/lib/constants";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import { SaleEvent } from "./SaleEvent";

const styles = {
  title: "font-semibold text-lg",
  addButton:
    "flex bg-green-200 px-3 py-1.5 rounded shadow " +
    "hover:opacity-75 text-base font-semibold",
  removeButton:
    "flex bg-red-400 text-white " +
    "px-3 py-1.5 rounded disabled:opacity-25 " +
    "hover:opacity-75 text-base font-semibold",
};

// On Saturday:
// date.getDay() = 6 => date.getDay() / 6 = 1 => numDaysSinceLastFriday = 1
// On Sunday:
// date.getDay() = 0 => date.getDay() / 6 = 0 => numDaysSinceLastFriday = 2
const getNumDaysSinceLastFriday = (date: Date) =>
  2 - Math.floor(date.getDay() / 6);

const isWeekendDay = (date: Date) => date.getDay() % 6 === 0;

const getDateString = (date: Date) => date.toISOString().substring(0, 10);

const getDefaultState = (defaultDate: string) => ({
  quantity: 1,
  proceeds: 0,
  dateSold: defaultDate,
  dateAcquired: defaultDate,
  adjustedCost: 0,
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

  const [events, setEvents] = useState([getDefaultState(lastWeekDay)]);

  return (
    <div className="grid gap-8 cols-1">
      {events.map((props, i) => (
        <div key={`sale-id-${i}`}>
          <div className="flex justify-between">
            <span className={styles.title}>Sale event #{i + 1}</span>

            <button
              className={styles.removeButton}
              onClick={() => setEvents(events.filter((_, idx) => idx !== i))}
              type="button"
              disabled={events.length <= 1}
            >
              <MinusIcon className="h-6 w-6 inline mr-1" />
              Remove
            </button>
          </div>
          <SaleEvent
            maxDate={lastWeekDay}
            {...props}
            setQuantity={(v) =>
              setEvents(
                events.map((e, idx) => (idx === i ? { ...e, quantity: v } : e))
              )
            }
            setAdjustedCost={(v) =>
              setEvents(
                events.map((e, idx) =>
                  idx === i ? { ...e, adjustedCost: v } : e
                )
              )
            }
            setProceeds={(v) =>
              setEvents(
                events.map((e, idx) => (idx === i ? { ...e, proceeds: v } : e))
              )
            }
            setDateAcquired={(v) =>
              setEvents(
                events.map((e, idx) =>
                  idx === i ? { ...e, dateAcquired: v } : e
                )
              )
            }
            setDateSold={(v) =>
              setEvents(
                events.map((e, idx) => (idx === i ? { ...e, dateSold: v } : e))
              )
            }
          />
        </div>
      ))}
      <div className="flex justify-end">
        <button
          className={styles.addButton}
          onClick={() => setEvents([...events, getDefaultState(lastWeekDay)])}
          type="button"
        >
          <PlusIcon className="h-6 w-6 inline mr-1" />
          New sale
        </button>
      </div>
    </div>
  );
};
