"use client";
import { useState } from "react";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import classNames from "classnames";
import { ReportResidencyFrTaxesFr } from "./residency_fr_taxes_fr/ReportResidencyFrTaxesFr";
import { Tooltip } from "@/components/ui/Tooltip";

export type CountryCode = "us" | "fr";
export interface ReportProps {}

export const Report: React.FunctionComponent<ReportProps> = () => {
  const [taxesCountry, setTaxesCountry] = useState<Partial<CountryCode>>("fr");
  const [residency, setResidencyCountry] = useState<Partial<CountryCode>>("fr");
  const [isUsCitizen, setIsUsCitizen] = useState<boolean>(false);
  const [precentTimeSpendInCountry, setPrecentTimeSpendInCountry] =
    useState<number>(100);

  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <header>
          <div
            className={classNames(
              "w-fit flex p-4 items-center gap-6",
              "hover:opacity-75 cursor-pointer",
            )}
          >
            <div className="text-2xl font-bold">Tax Report</div>
            <div className="text-lg flex gap-2 items-center">
              <label>
                <Tooltip content="The country where you are considered a tax resident.">
                  <span>Tax residence:</span>
                </Tooltip>
              </label>
              <select
                onChange={(event) =>
                  setResidencyCountry(event.target.value as CountryCode)
                }
                value={residency}
              >
                <option value="us">US</option>
                <option value="fr">FR</option>
              </select>
            </div>
            <div className="text-lg flex gap-2 items-center">
              <label>
                <Tooltip content="Which countries are looking to fill taxes for?.">
                  <span>I'm declaring taxes for:</span>
                </Tooltip>
              </label>
              <select
                onChange={(event) =>
                  setTaxesCountry(event.target.value as CountryCode)
                }
                value={taxesCountry}
              >
                <option value="us">US</option>
                <option value="fr">FR</option>
              </select>
            </div>
            <div className="text-lg flex gap-2 items-center">
              <label>
                <Tooltip content="If you moved this year, some capital gains are taxed in both countries. Your company should have provided a statement with the pecentages.">
                  <span>
                    Time spent in{" "}
                    <strong className="uppercase">{taxesCountry}</strong>:
                  </span>
                </Tooltip>
              </label>
              <div className="flex items-stretch">
                <input
                  type="number"
                  onChange={(event) =>
                    setPrecentTimeSpendInCountry(
                      Math.max(0, Math.min(100, Number(event.target.value))),
                    )
                  }
                  value={precentTimeSpendInCountry}
                  className="w-16 text-right"
                />
                <span className="text-lg font-bold bg-slate-300 px-1">%</span>
              </div>
            </div>
            <div className="text-lg flex gap-2 items-center">
              <label>
                <Tooltip content="Are you a US citizen?">
                  <span>I'm a US Citizen:</span>
                </Tooltip>
              </label>
              <input
                type="checkbox"
                onChange={(event) => setIsUsCitizen(event.target.checked)}
                checked={isUsCitizen}
              />
            </div>
          </div>
        </header>
        <main className="flex flex-col items-center justify-around p-24">
          {!residency || !taxesCountry ? (
            <p>Please select a residency and taxes country</p>
          ) : residency === "fr" && taxesCountry === "fr" ? (
            <ReportResidencyFrTaxesFr
              isUsCitizen={isUsCitizen}
              precentTimeSpendInCountry={precentTimeSpendInCountry}
            />
          ) : (
            <p>Not yet implemented</p>
          )}
        </main>
      </div>
    </QueryClientProvider>
  );
};
