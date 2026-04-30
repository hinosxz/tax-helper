import { Drawer } from "@/components/ui/Drawer";
import { formatNumber } from "@/lib/format-number";
import type { GainAndLossEventWithRates } from "@/lib/taxes/taxes-rules-fr";

export const ImportValidation: React.FunctionComponent<{
  events: GainAndLossEventWithRates[];
}> = ({ events }) => {
  if (events.length === 0) return null;

  const totalAcqEur = events.reduce(
    (sum, e) => sum + (e.symbolPriceAcquired / e.rateAcquired) * e.quantity,
    0,
  );
  const totalSoldEur = events.reduce(
    (sum, e) => sum + (e.proceeds / e.rateSold) * e.quantity,
    0,
  );

  return (
    <Drawer title={<span className="font-bold">Import Validation</span>}>
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                #
              </th>
              <th className="border border-gray-300 px-2 py-1 whitespace-nowrap">
                Acquisition date
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                $/stock acq.
              </th>
              <th className="border border-gray-300 px-2 py-1 whitespace-nowrap">
                Sale date
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                $/stock sold
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                Qty
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                $/€ acq.
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                $/€ sold
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                €/stock acq.
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                €/stock sold
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                Total acq. €
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                Total sold €
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, i) => {
              const eurPerStockAcq =
                event.symbolPriceAcquired / event.rateAcquired;
              const eurPerStockSold = event.proceeds / event.rateSold;
              return (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {i + 1}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {event.dateAcquired}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {formatNumber(event.symbolPriceAcquired)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {event.dateSold}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {formatNumber(event.proceeds)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {formatNumber(event.quantity, 0)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {formatNumber(event.rateAcquired, 4)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {formatNumber(event.rateSold, 4)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {formatNumber(eurPerStockAcq)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {formatNumber(eurPerStockSold)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {formatNumber(eurPerStockAcq * event.quantity)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {formatNumber(eurPerStockSold * event.quantity)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td
                colSpan={10}
                className="border border-gray-300 px-2 py-1 text-right"
              >
                Total
              </td>
              <td className="border border-gray-300 px-2 py-1 text-right">
                {formatNumber(totalAcqEur)}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-right">
                {formatNumber(totalSoldEur)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-sm text-gray-500 mt-2 px-2">
        {events.length} operation{events.length !== 1 ? "s" : ""} found in your
        import file (sorted by sale date).
      </p>
    </Drawer>
  );
};
