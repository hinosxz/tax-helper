import { Drawer } from "@/components/ui/Drawer";
import { formatNumber } from "@/lib/format-number";
import type { GainAndLossEventWithRates } from "@/lib/taxes/taxes-rules-fr";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export const ImportValidation: React.FunctionComponent<{
  events: GainAndLossEventWithRates[];
  dict: Dictionary;
}> = ({ events, dict }) => {
  const ivDict = dict.report.importValidation;
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
    <Drawer title={<span className="font-bold">{ivDict.title}</span>}>
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                {ivDict.headers.index}
              </th>
              <th className="border border-gray-300 px-2 py-1 whitespace-nowrap">
                {ivDict.headers.acquisitionDate}
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                {ivDict.headers.dollarsPerStockAcq}
              </th>
              <th className="border border-gray-300 px-2 py-1 whitespace-nowrap">
                {ivDict.headers.saleDate}
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                {ivDict.headers.dollarsPerStockSold}
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                {ivDict.headers.qty}
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                {ivDict.headers.dollarsPerEuroAcq}
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                {ivDict.headers.dollarsPerEuroSold}
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                {ivDict.headers.eurosPerStockAcq}
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                {ivDict.headers.eurosPerStockSold}
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                {ivDict.headers.totalAcqEur}
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right whitespace-nowrap">
                {ivDict.headers.totalSoldEur}
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
                {dict.common.total}
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
        {events.length}{" "}
        {events.length !== 1 ? ivDict.footerPlural : ivDict.footerSingle}
      </p>
    </Drawer>
  );
};
