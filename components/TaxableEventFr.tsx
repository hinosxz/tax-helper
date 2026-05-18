import type { TaxableEventFr as TaxableEventFrProps } from "@/lib/taxes/taxable-event-fr";
import { Drawer } from "./ui/Drawer";
import { Currency } from "@/components/ui/Currency";
import { PriceInEuro } from "./ui/PriceInEuro";
import { formatDateFr } from "@/lib/date";
import { Tooltip } from "./ui/Tooltip";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { formatNumber } from "@/lib/format-number";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { match } from "ts-pattern";

export const TaxableEventFr: React.FunctionComponent<{
  event: TaxableEventFrProps;
  showAcquisitionGains?: boolean;
  showCapitalGains?: boolean;
  forceOpen?: boolean;
  dict: Dictionary;
}> = ({
  event,
  showCapitalGains = false,
  showAcquisitionGains = false,
  forceOpen,
  dict,
}) => {
  const teDict = dict.report.taxableEvent;
  const planTypes = dict.report.planTypes;

  const asset = match(event.planType)
    .with("ESPP", () => planTypes.ESPP)
    .with("RS", () => planTypes.RS)
    .with("SO", () => planTypes.SO)
    .exhaustive();

  const trigger = match(event.type)
    .with("vesting", () => teDict.triggers.vesting)
    .with("sell", () => teDict.triggers.sell)
    .with("exercise", () => teDict.triggers.exercise)
    .exhaustive();

  return (
    <Drawer
      forceOpen={forceOpen}
      title={
        <div className="flex items-baseline justify-start gap-2">
          <h2 className="font-bold text-lg">
            {teDict.headlinePrefix} {formatDateFr(event.date)} {trigger}{" "}
            {event.quantity} {asset}
          </h2>

          <dl className="flex items-baseline justify-start gap-2">
            {showCapitalGains && (
              <>
                <dt className="font-bold">{teDict.capitalGain}</dt>
                <dd>
                  <Currency value={event.capitalGain.total} unit="eur" />
                </dd>
              </>
            )}
            {showAcquisitionGains && (
              <>
                <dt className="font-bold">{teDict.acquisitionGain}</dt>
                <dd>
                  <Currency value={event.acquisitionGain.total} unit="eur" />
                </dd>
              </>
            )}
          </dl>
        </div>
      }
    >
      <TaxableEventFrLine title={teDict.lines.dates}>
        <div className="flex gap-4">
          <p>
            <strong>{teDict.lines.granted}</strong>{" "}
            {formatDateFr(event.dateGranted)}.
          </p>
          <p>
            <strong>{teDict.lines.acquired}</strong>{" "}
            {formatDateFr(event.acquisition.date)}.
          </p>
          {event.sell && (
            <p>
              <strong>{teDict.lines.sold}</strong>{" "}
              {formatDateFr(event.sell.date)}.
            </p>
          )}
        </div>
      </TaxableEventFrLine>
      <TaxableEventFrLine title={teDict.lines.acquisitionCost}>
        <PriceInEuro
          eur={event.acquisition.costEur}
          usd={event.acquisition.costUsd}
          rate={event.acquisition.rate}
          date={event.acquisition.date}
          precision={7}
        />{" "}
        {teDict.lines.perShare}
      </TaxableEventFrLine>
      <TaxableEventFrLine title={teDict.lines.acquisitionValue}>
        <PriceInEuro
          eur={event.acquisition.valueEur}
          usd={event.acquisition.valueUsd}
          rate={event.acquisition.rate}
          date={event.acquisition.date}
          precision={7}
        />{" "}
        {teDict.lines.perShareWithDesc} ({event.acquisition.description})
      </TaxableEventFrLine>
      {event.acquisitionGain.fractionFr < 1 ? (
        <TaxableEventFrLine title={teDict.lines.fractionFrenchOrigin}>
          <span className="font-semibold">
            {formatNumber(event.acquisitionGain.fractionFr * 100)}%
          </span>
        </TaxableEventFrLine>
      ) : null}
      {event.sell && (
        <TaxableEventFrLine title={teDict.lines.sellPrice}>
          <PriceInEuro
            eur={event.sell.eur}
            usd={event.sell.usd}
            rate={event.sell.rate}
            date={event.sell.date}
            precision={7}
          />{" "}
          {teDict.lines.perShare}
        </TaxableEventFrLine>
      )}
      <TaxableEventFrLine
        title={`${event.symbol} ${teDict.lines.symbolPriceSuffix}`}
      >
        <p>
          <PriceInEuro
            eur={event.acquisition.symbolPriceEur}
            usd={event.acquisition.symbolPrice}
            rate={event.acquisition.rate}
            date={
              event.acquisition.dateSymbolPriceAcquired ||
              event.acquisition.date
            }
            precision={7}
          />{" "}
          {teDict.lines.atOpeningOnAcquisitionDay}
        </p>
        {event.acquisition.dateSymbolPriceAcquired && (
          <p>
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
            {event.symbol} {teDict.lines.priceNotAvailablePrefix}{" "}
            {formatDateFr(event.acquisition.date)}
            {teDict.lines.priceNotAvailableMiddle}{" "}
            {formatDateFr(event.acquisition.dateSymbolPriceAcquired)}
            {teDict.lines.priceNotAvailableSuffix}
          </p>
        )}
      </TaxableEventFrLine>
      {(showAcquisitionGains || showCapitalGains) && (
        <hr className="h-px my-1 mx-auto w-1/3 border-0 bg-gray-400" />
      )}
      {showAcquisitionGains && (
        <TaxableEventFrLine
          title={teDict.acquisitionGain}
          tooltip={`acq. value - acq. cost: ${event.acquisition.valueEur} - ${event.acquisition.costEur}`}
        >
          <Currency
            value={event.acquisitionGain.perShare}
            unit="eur"
            precision={7}
          />{" "}
          {teDict.lines.perShare}
        </TaxableEventFrLine>
      )}
      {showCapitalGains && (
        <TaxableEventFrLine
          title={teDict.capitalGain}
          tooltip={`sell price - acq. cession: ${event.sell?.eur} - ${event.acquisition.valueEur}`}
        >
          <Currency
            value={event.capitalGain.perShare}
            unit="eur"
            precision={7}
          />{" "}
          {teDict.lines.perShare}
        </TaxableEventFrLine>
      )}
    </Drawer>
  );
};
interface TaxableEventFrLineProps {
  title: React.ReactNode;
  children: React.ReactNode;
  tooltip?: React.ReactNode;
}
const TaxableEventFrLine: React.FunctionComponent<TaxableEventFrLineProps> = ({
  title,
  tooltip,
  children,
}) => (
  <div className="flex items-start justify-stretch">
    <h4 className="w-1/3">
      {tooltip ? (
        <Tooltip content={tooltip}>
          <span>{title}</span>
        </Tooltip>
      ) : (
        title
      )}
    </h4>
    <div className="grow">{children}</div>
  </div>
);
