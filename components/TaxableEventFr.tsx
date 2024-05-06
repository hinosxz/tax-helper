import { TaxableEventFr as TaxableEventFrProps } from "@/lib/taxes/taxable-event-fr";
import { match } from "ts-pattern";
import { Drawer } from "./ui/Drawer";
import { Currency } from "@/app/guide/shared/ui/Currency";
import { PriceInEuro } from "./ui/PriceInEuro";
import { formatDateFr } from "@/lib/date";

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
      <TaxableEventFrLine title="Acquisition cost">
        <PriceInEuro
          eur={event.acquisition.costEur}
          usd={event.acquisition.costUsd}
          rate={event.acquisition.rate}
          date={event.acquisition.date}
        />{" "}
        per share.
      </TaxableEventFrLine>
      <TaxableEventFrLine title="Acquisition value">
        <PriceInEuro
          eur={event.acquisition.valueEur}
          usd={event.acquisition.valueUsd}
          rate={event.acquisition.rate}
          date={event.acquisition.date}
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
          />{" "}
          per share on {formatDateFr(event.sell.date)}
        </TaxableEventFrLine>
      )}
      <TaxableEventFrLine title={`${event.symbol} price:`}>
        <PriceInEuro
          eur={event.acquisition.symbolPriceEur}
          usd={event.acquisition.symbolPrice}
          rate={event.acquisition.rate}
          date={event.acquisition.date}
        />{" "}
        at opening on acquisition day.
      </TaxableEventFrLine>
      {(showAcquisitionGains || showCapitalGains) && (
        <hr className="h-px my-1 mx-auto w-1/3 border-0 bg-gray-400" />
      )}
      {showAcquisitionGains && (
        <TaxableEventFrLine title="Acquisition gain">
          <Currency value={event.acquisitionGain.perShare} unit="eur" /> per
          share.
        </TaxableEventFrLine>
      )}
      {showCapitalGains && (
        <TaxableEventFrLine title="Capital gain">
          <Currency value={event.capitalGain.perShare} unit="eur" /> per share.
        </TaxableEventFrLine>
      )}
    </Drawer>
  );
};
interface TaxableEventFrLineProps {
  title: React.ReactNode;
  children: React.ReactNode;
}
const TaxableEventFrLine: React.FunctionComponent<TaxableEventFrLineProps> = ({
  title,
  children,
}) => (
  <div className="flex items-start justify-stretch">
    <h4 className="w-1/3">{title}</h4>
    <div className="grow">{children}</div>
  </div>
);
