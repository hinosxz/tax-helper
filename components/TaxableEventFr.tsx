import { TaxableEventFr as TaxableEventFrProps } from "@/lib/taxes/taxable-event-fr";
import { match } from "ts-pattern";
import { Drawer } from "./ui/Drawer";
import { Currency } from "@/components/ui/Currency";
import { PriceInEuro } from "./ui/PriceInEuro";
import { formatDateFr } from "@/lib/date";
import { Tooltip } from "./ui/Tooltip";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

export const TaxableEventFr: React.FunctionComponent<{
  event: TaxableEventFrProps;
  showAcquisitionGains?: boolean;
  showCapitalGains?: boolean;
  forceOpen?: boolean;
}> = ({
  event,
  showCapitalGains = false,
  showAcquisitionGains = false,
  forceOpen,
}) => {
  const asset = match(event.planType)
    .with("ESPP", () => "ESPP")
    .with("RS", () => "RSU")
    .with("SO", () => "Stock options")
    .exhaustive();

  const trigger = match(event.type)
    .with("vesting", () => "vested")
    .with("sell", () => "sold")
    .with("exercise", () => "exercised")
    .exhaustive();

  return (
    <Drawer
      forceOpen={forceOpen}
      title={
        <div className="flex items-baseline justify-start gap-2">
          <h2 className="font-bold text-lg">
            On {formatDateFr(event.date)} {trigger} {event.quantity} {asset}
          </h2>

          <dl className="flex items-baseline justify-start gap-2">
            {showCapitalGains && (
              <>
                <dt className="font-bold">Capital gain</dt>
                <dd>
                  <Currency value={event.capitalGain.total} unit="eur" />
                </dd>
              </>
            )}
            {showAcquisitionGains && (
              <>
                <dt className="font-bold">Acquisition gain</dt>
                <dd>
                  <Currency value={event.acquisitionGain.total} unit="eur" />
                </dd>
              </>
            )}
          </dl>
        </div>
      }
    >
      <TaxableEventFrLine title="Dates">
        <div className="flex gap-4">
          <p>
            <strong>Acquired:</strong> {formatDateFr(event.acquisition.date)}.
          </p>
          {event.sell && (
            <p>
              <strong>Sold:</strong> {formatDateFr(event.sell.date)}.
            </p>
          )}
        </div>
      </TaxableEventFrLine>
      <TaxableEventFrLine title="Acquisition cost">
        <PriceInEuro
          eur={event.acquisition.costEur}
          usd={event.acquisition.costUsd}
          rate={event.acquisition.rate}
          date={event.acquisition.date}
          precision={7}
        />{" "}
        per share.
      </TaxableEventFrLine>
      <TaxableEventFrLine title="Acquisition value">
        <PriceInEuro
          eur={event.acquisition.valueEur}
          usd={event.acquisition.valueUsd}
          rate={event.acquisition.rate}
          date={event.acquisition.date}
          precision={7}
        />{" "}
        per share ({event.acquisition.description})
      </TaxableEventFrLine>
      {event.sell && (
        <TaxableEventFrLine title="Sell price">
          <PriceInEuro
            eur={event.sell.eur}
            usd={event.sell.usd}
            rate={event.sell.rate}
            date={event.sell.date}
            precision={7}
          />{" "}
          per share.
        </TaxableEventFrLine>
      )}
      <TaxableEventFrLine title={`${event.symbol} price:`}>
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
          at opening on acquisition day.
        </p>
        {event.acquisition.dateSymbolPriceAcquired && (
          <p>
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
            {event.symbol} price was not available on{" "}
            {formatDateFr(event.acquisition.date)}, last known price (on{" "}
            {formatDateFr(event.acquisition.dateSymbolPriceAcquired)}) was used
            instead.
          </p>
        )}
      </TaxableEventFrLine>
      {(showAcquisitionGains || showCapitalGains) && (
        <hr className="h-px my-1 mx-auto w-1/3 border-0 bg-gray-400" />
      )}
      {showAcquisitionGains && (
        <TaxableEventFrLine
          title="Acquisition gain"
          tooltip={`acq. value - acq. cost: ${event.acquisition.valueEur} - ${event.acquisition.costEur}`}
        >
          <Currency
            value={event.acquisitionGain.perShare}
            unit="eur"
            precision={7}
          />{" "}
          per share.
        </TaxableEventFrLine>
      )}
      {showCapitalGains && (
        <TaxableEventFrLine
          title="Capital gain"
          tooltip={`sell price - acq. cession: ${event.sell?.eur} - ${event.acquisition.valueEur}`}
        >
          <Currency
            value={event.capitalGain.perShare}
            unit="eur"
            precision={7}
          />{" "}
          per share.
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
