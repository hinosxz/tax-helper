import { Drawer } from "@/components/ui/Drawer";
import { TaxableEventFr } from "@/components/TaxableEventFr";
import type { TaxableEventFr as TaxableEventFrProps } from "@/lib/taxes/taxable-event-fr";
import { Tooltip } from "@/components/ui/Tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

export const TaxReportBox: React.FunctionComponent<{
  /** Unique id for the box (1TT, 3VG...) */
  id: string;
  /** Human readable title of the box */
  title: React.ReactNode;
  /** Value to fill the box with */
  amount: number | string;
  /** Detailed explanation how the amount was computed */
  explanations: {
    box: string;
    description: string;
    taxableEvents: TaxableEventFrProps[];
  }[];
  gainType: "acquisition" | "capital";
  forceOpen?: boolean;
}> = ({ id, title, amount, explanations, gainType, forceOpen }) => {
  const relatedExplanations = explanations.filter(({ box }) => box === id);
  return (
    <div className="bg-blue-200 mb-2 py-1 px-2 print:border print:mb-2">
      <div className="flex items-center gap-3 py-2">
        <h2 className="font-bold text-lg">{id}</h2>
        <span className="p-2 bg-white border border-gray-500 border-solid w-32 text-right font-bold">
          {typeof amount === "number"
            ? `${Math.floor(amount) /* Tax form only accepts integers */} €`
            : amount}
        </span>
        <Tooltip content={title}>
          <span className="text-blue-600 inline-block">
            <InformationCircleIcon className="h-6 w-6" />
          </span>
        </Tooltip>
      </div>
      {relatedExplanations.length > 0 && (
        <Drawer title="Details" forceOpen={forceOpen}>
          <div className="bg-slate-200 m-1 p-1">
            {relatedExplanations.map((explanation) => (
              <div key={explanation.description}>
                {explanation.taxableEvents.length > 0 ? (
                  <Drawer
                    title={<span>{explanation.description}</span>}
                    forceOpen={forceOpen}
                  >
                    {explanation.taxableEvents.map((taxableEvent, index) => (
                      <div
                        key={index}
                        className="print:border print:mb-2 print:text-xs"
                      >
                        <TaxableEventFr
                          event={taxableEvent}
                          showCapitalGains={gainType === "capital"}
                          showAcquisitionGains={gainType === "acquisition"}
                          forceOpen={forceOpen}
                        />
                      </div>
                    ))}
                  </Drawer>
                ) : (
                  <span>{explanation.description}</span>
                )}
              </div>
            ))}
          </div>
        </Drawer>
      )}
    </div>
  );
};
