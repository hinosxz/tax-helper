"use client";
import { useState } from "react";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import classNames from "classnames";
import { ReportResidencyFrTaxesFr } from "./residency_fr_taxes_fr/ReportResidencyFrTaxesFr";

export type CountryCode = "us" | "fr";
export interface ReportProps {}

export const Report: React.FunctionComponent<ReportProps> = () => {
  const [taxesCountry, setTaxesCountry] = useState<Partial<CountryCode>>("fr");
  const [residency, setResidencyCountry] = useState<Partial<CountryCode>>("fr");

  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <header>
          <div
            className={classNames(
              "w-fit flex p-4 items-center gap-2",
              "hover:opacity-75 cursor-pointer",
            )}
          >
            <div className="text-2xl font-bold">Tax Report</div>
            <div className="text-lg">
              <label>Residence country:</label>
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
            <div className="text-lg">
              <label>Taxes country:</label>
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
          </div>
        </header>
        <main className="flex flex-col items-center justify-around p-24">
          {!residency || !taxesCountry ? (
            <p>Please select a residency and taxes country</p>
          ) : residency === "fr" && taxesCountry === "fr" ? (
            <ReportResidencyFrTaxesFr />
          ) : (
            <p>Not yet implemented</p>
          )}
        </main>
      </div>
    </QueryClientProvider>
  );
};
