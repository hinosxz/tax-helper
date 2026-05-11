"use client";

import { useMemo, useState } from "react";
import classNames from "classnames";
import toast from "react-hot-toast";
import {
  ClipboardIcon,
  CheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid";
import { NumberInput } from "@/components/ui/Field";
import { Section } from "@/components/ui/Section";
import {
  cehrEntryThreshold,
  computeCehr,
  computeQuotient,
  evaluateFieldStatus,
  type FoyerSituation,
} from "@/lib/taxes/cehr";
import {
  ASSET_DEFINITIONS,
  buildCehrEmail,
  type AssetType,
} from "@/lib/taxes/cehr-template";

const fmtEur = (n: number): string =>
  `${Math.round(n).toLocaleString("fr-FR")} €`;

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i).map(
  (y) => ({ label: String(y), value: y }),
);

const SITUATION_OPTIONS: Array<{ label: string; value: FoyerSituation }> = [
  { label: "Couple (marié·e / pacsé·e)", value: "couple" },
  { label: "Célibataire / divorcé·e / veuf·ve", value: "single" },
];

type CheckStatus = "neutral" | "passed" | "failed";

interface RfrFieldProps {
  label: React.ReactNode;
  explanation: React.ReactNode;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  status: CheckStatus;
  checkDetail?: string;
}

const RfrField = ({
  label,
  explanation,
  value,
  onChange,
  placeholder,
  status,
  checkDetail,
}: RfrFieldProps) => (
  <div
    className={classNames(
      "border rounded-md p-4 max-w-3xl",
      status === "passed" && "border-green-300 bg-green-50/40",
      status === "failed" && "border-red-300 bg-red-50/40",
      status === "neutral" && "border-gray-200 bg-white",
    )}
  >
    <div className="flex items-center gap-2 text-sm font-semibold mb-1">
      {label}
      {status === "passed" && (
        <CheckCircleIcon className="h-4 w-4 text-green-600" />
      )}
      {status === "failed" && <XCircleIcon className="h-4 w-4 text-red-600" />}
    </div>
    <div className="text-xs text-gray-600 mb-3">{explanation}</div>
    <NumberInput
      value={value}
      onChange={(v) => onChange(Number.isNaN(v) ? null : v)}
      min={0}
      maxDecimals={0}
      placeholder={placeholder}
      validationError={status === "failed" ? checkDetail : null}
    />
  </div>
);

export default function CehrPage() {
  const [yearN, setYearN] = useState<number>(CURRENT_YEAR - 1);
  const [situation, setSituation] = useState<FoyerSituation>("single");
  const [rfrN, setRfrN] = useState<number | null>(null);
  const [rfrNm1, setRfrNm1] = useState<number | null>(null);
  const [rfrNm2, setRfrNm2] = useState<number | null>(null);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>(["rsu"]);

  const toggleAsset = (id: AssetType) => {
    setAssetTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const allFilled = rfrN !== null && rfrNm1 !== null && rfrNm2 !== null;
  const entryThreshold = cehrEntryThreshold(situation);

  const statusNm1 = evaluateFieldStatus({
    rfrN,
    rfrNm1,
    rfrNm2,
    situation,
    field: "Nm1",
  });
  const detailNm1 =
    statusNm1 === "failed" && rfrNm1 !== null
      ? `RFR N-1 = ${fmtEur(rfrNm1)} ≥ ${fmtEur(entryThreshold)}`
      : undefined;

  const statusNm2 = evaluateFieldStatus({
    rfrN,
    rfrNm1,
    rfrNm2,
    situation,
    field: "Nm2",
  });
  const detailNm2 =
    statusNm2 === "failed" && rfrNm2 !== null
      ? `RFR N-2 = ${fmtEur(rfrNm2)} ≥ ${fmtEur(entryThreshold)}`
      : undefined;

  const statusN = evaluateFieldStatus({
    rfrN,
    rfrNm1,
    rfrNm2,
    situation,
    field: "N",
  });
  const detailN = (() => {
    if (statusN !== "failed" || rfrN === null) return undefined;
    if (rfrN <= entryThreshold) {
      return `RFR N = ${fmtEur(rfrN)} ≤ ${fmtEur(
        entryThreshold,
      )} (seuil CEHR) — aucune CEHR n'est due, le lissage est sans objet.`;
    }
    if (rfrNm1 !== null && rfrNm2 !== null) {
      return `RFR N = ${fmtEur(rfrN)} < 1,5 × moyenne (${fmtEur(
        1.5 * ((rfrNm1 + rfrNm2) / 2),
      )})`;
    }
    return undefined;
  })();

  const result = useMemo(() => {
    if (!allFilled) return null;
    return computeQuotient({
      rfrN: rfrN!,
      rfrNm1: rfrNm1!,
      rfrNm2: rfrNm2!,
      situation,
    });
  }, [allFilled, rfrN, rfrNm1, rfrNm2, situation]);

  const midpoint = result
    ? result.averagePrevious + (rfrN! - result.averagePrevious) / 2
    : 0;
  const midpointBreakdown = result
    ? computeCehr(midpoint, situation)
    : { rfr: 0, base3: 0, base4: 0, amount3: 0, amount4: 0, total: 0 };

  const email = useMemo(() => {
    if (!result || !allFilled || !result.eligible || assetTypes.length === 0) {
      return "";
    }
    return buildCehrEmail({
      yearN,
      rfrN: rfrN!,
      rfrNm1: rfrNm1!,
      rfrNm2: rfrNm2!,
      quotient: result,
      assetTypes,
      situation,
    });
  }, [result, allFilled, yearN, rfrN, rfrNm1, rfrNm2, assetTypes, situation]);

  const [showSteps, setShowSteps] = useState(false);
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Email copié dans le presse-papier");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-8 px-4">
      <header>
        <h1 className="text-3xl font-semibold">
          Puis-je réduire une partie de mes impôts ?
        </h1>
        <p className="text-sm text-gray-600 mt-3 max-w-3xl">
          Une année avec beaucoup de cessions d&apos;actions (RSU, ESPP,
          stock-options) peut déclencher la{" "}
          <strong>
            Contribution Exceptionnelle sur les Hauts Revenus (CEHR)
          </strong>
          , une surtaxe de 3 à 4 % qui s&apos;applique au-delà d&apos;un certain
          seuil de revenu fiscal de référence. Le code des impôts prévoit un
          mécanisme de lissage qui ramène la base de calcul à un niveau plus
          proche de la moyenne de vos années précédentes — ce qui peut
          sérieusement réduire la facture.
        </p>
        <p className="text-sm text-gray-600 mt-3 max-w-3xl">
          Ce lissage est censé être appliqué automatiquement, mais il arrive que
          le SIP l&apos;oublie. Et si votre situation familiale a changé sur la
          période (mariage, PACS, divorce, décès), c&apos;est à vous de faire la
          démarche pour fournir les bons revenus de référence.
        </p>
        <p className="text-sm text-gray-600 mt-3 max-w-3xl">
          Cet outil estime ce que votre CEHR <em>devrait</em> être avec lissage,
          et génère le courrier de réclamation à envoyer aux impôts si
          nécessaire.
        </p>
      </header>

      <Section title="Vos informations">
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-sm font-medium mb-2">Situation familiale</div>
            <div className="inline-flex rounded-md shadow-sm border border-gray-300 overflow-hidden">
              {SITUATION_OPTIONS.map((opt, idx) => {
                const active = situation === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSituation(opt.value)}
                    className={classNames(
                      "px-4 py-1.5 text-sm transition-colors",
                      idx > 0 && "border-l border-gray-300",
                      active
                        ? "bg-gray-100 text-gray-900 font-bold"
                        : "bg-white text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <RfrField
            label={
              <span className="flex items-center gap-2 flex-wrap">
                <span>RFR de l&apos;année concernée</span>
                <span className="flex items-center gap-1">
                  <span className="text-xs font-normal text-gray-500">
                    année :
                  </span>
                  <select
                    value={String(yearN)}
                    onChange={(e) => setYearN(Number(e.target.value))}
                    className={classNames(
                      "bg-transparent border rounded px-2 py-0.5",
                      "text-sm font-semibold border-gray-300",
                      "hover:border-gray-400 focus:outline-none",
                      "cursor-pointer",
                    )}
                  >
                    {YEAR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </span>
              </span>
            }
            explanation={
              <>
                Le revenu fiscal de référence de l&apos;année concernée (celle
                de l&apos;avis d&apos;imposition que vous contestez) doit être{" "}
                <strong>au moins 1,5 fois</strong> la moyenne des RFR des deux
                années précédentes. C&apos;est l&apos;écart de revenu qui ouvre
                droit au lissage.
              </>
            }
            value={rfrN}
            onChange={setRfrN}
            placeholder="ex. 800 000"
            status={statusN}
            checkDetail={detailN}
          />

          <RfrField
            label={`RFR ${yearN - 1} (N-1)`}
            explanation={
              <>
                Le RFR de l&apos;année précédant l&apos;année concernée doit
                être <strong>inférieur ou égal</strong> au seuil d&apos;entrée
                de la CEHR (
                <strong>{fmtEur(cehrEntryThreshold(situation))}</strong> pour la
                situation choisie). Si vous étiez déjà soumis à la CEHR cette
                année-là, le lissage n&apos;est pas applicable.
              </>
            }
            value={rfrNm1}
            onChange={setRfrNm1}
            placeholder="ex. 100 000"
            status={statusNm1}
            checkDetail={detailNm1}
          />

          <RfrField
            label={`RFR ${yearN - 2} (N-2)`}
            explanation={
              <>
                Même condition deux ans en arrière : le RFR doit être{" "}
                <strong>inférieur ou égal</strong> à{" "}
                <strong>{fmtEur(cehrEntryThreshold(situation))}</strong>. Les
                deux années antérieures doivent être hors-CEHR pour que le
                revenu de l&apos;année N soit considéré comme exceptionnel par
                l&apos;article 223 sexies V du CGI.
              </>
            }
            value={rfrNm2}
            onChange={setRfrNm2}
            placeholder="ex. 200 000"
            status={statusNm2}
            checkDetail={detailNm2}
          />
        </div>
      </Section>

      {result && !result.eligible && (
        <div className="p-3 rounded-md bg-yellow-50 text-sm border border-yellow-200">
          Le système du quotient n&apos;est pas applicable (voir les indications
          sur les champs ci-dessus). La CEHR reste due au montant calculé sans
          lissage :{" "}
          <span className="font-semibold">
            {fmtEur(result.cehrWithoutQuotient.total)}
          </span>
          .
        </div>
      )}

      {result?.eligible && (
        <Section title="Comparaison du calcul CEHR">
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3 font-semibold">Élément</th>
                  <th className="p-3 font-semibold text-right">
                    Sans quotient
                  </th>
                  <th className="p-3 font-semibold text-right bg-green-50">
                    Avec quotient
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-3 text-gray-600">
                    <button
                      type="button"
                      onClick={() => setShowSteps((s) => !s)}
                      className={classNames(
                        "flex items-center gap-1",
                        "hover:text-gray-900 cursor-pointer",
                      )}
                    >
                      Base imposable
                      {showSteps ? (
                        <ChevronUpIcon className="h-3 w-3" />
                      ) : (
                        <ChevronDownIcon className="h-3 w-3" />
                      )}
                    </button>
                  </td>
                  <td className="p-3 text-right">{fmtEur(rfrN!)}</td>
                  <td className="p-3 text-right bg-green-50">
                    {fmtEur(midpoint)}
                  </td>
                </tr>
                {showSteps && (
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="p-4">
                      <div className="text-xs text-gray-600 mb-2">
                        Détail du calcul de la <strong>base lissée</strong>{" "}
                        (colonne « Avec quotient ») :
                      </div>
                      <ol
                        className={classNames(
                          "list-decimal pl-6 space-y-1",
                          "text-xs text-gray-700",
                        )}
                      >
                        <li>
                          Moyenne des deux années précédentes :{" "}
                          <span className="font-mono">
                            ({fmtEur(rfrNm2!)} + {fmtEur(rfrNm1!)}) / 2 ={" "}
                            <strong>{fmtEur(result.averagePrevious)}</strong>
                          </span>
                        </li>
                        <li>
                          Fraction excédentaire :{" "}
                          <span className="font-mono">
                            {fmtEur(rfrN!)} − {fmtEur(result.averagePrevious)} ={" "}
                            <strong>
                              {fmtEur(rfrN! - result.averagePrevious)}
                            </strong>
                          </span>
                        </li>
                        <li>
                          Fraction divisée par deux :{" "}
                          <span className="font-mono">
                            {fmtEur(rfrN! - result.averagePrevious)} / 2 ={" "}
                            <strong>
                              {fmtEur((rfrN! - result.averagePrevious) / 2)}
                            </strong>
                          </span>
                        </li>
                        <li>
                          Base lissée :{" "}
                          <span className="font-mono">
                            {fmtEur(result.averagePrevious)} +{" "}
                            {fmtEur((rfrN! - result.averagePrevious) / 2)} ={" "}
                            <strong className="text-green-700">
                              {fmtEur(midpoint)}
                            </strong>
                          </span>
                        </li>
                      </ol>
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="p-3 text-gray-600">Base 3 %</td>
                  <td className="p-3 text-right">
                    {fmtEur(result.cehrWithoutQuotient.base3)}
                  </td>
                  <td className="p-3 text-right bg-green-50">
                    {fmtEur(midpointBreakdown.base3)}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-600">Base 4 %</td>
                  <td className="p-3 text-right">
                    {fmtEur(result.cehrWithoutQuotient.base4)}
                  </td>
                  <td className="p-3 text-right bg-green-50">
                    {fmtEur(midpointBreakdown.base4)}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-600">
                    CEHR à 3 %
                    <span className="text-xs text-gray-400 ml-1">
                      (× 2 quotient)
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {fmtEur(result.cehrWithoutQuotient.amount3)}
                  </td>
                  <td className="p-3 text-right bg-green-50">
                    {fmtEur(midpointBreakdown.amount3 * 2)}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-600">
                    CEHR à 4 %
                    <span className="text-xs text-gray-400 ml-1">
                      (× 2 quotient)
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {fmtEur(result.cehrWithoutQuotient.amount4)}
                  </td>
                  <td className="p-3 text-right bg-green-50">
                    {fmtEur(midpointBreakdown.amount4 * 2)}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 font-semibold">CEHR totale</td>
                  <td className="p-3 text-right font-semibold">
                    {fmtEur(result.cehrWithoutQuotient.total)}
                  </td>
                  <td className="p-3 text-right font-semibold bg-green-100">
                    {fmtEur(result.cehrWithQuotient)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            className={classNames(
              "mt-4 p-4 rounded-md",
              "bg-green-100 border border-green-300",
              "flex items-baseline justify-between flex-wrap gap-2",
            )}
          >
            <span className="text-sm text-green-900">
              Gain total grâce au lissage
              <span className="text-xs text-green-700 ml-2">
                (CEHR sans quotient − CEHR avec quotient)
              </span>
            </span>
            <span className="text-xl font-bold text-green-700">
              {fmtEur(result.savings)}
            </span>
          </div>
        </Section>
      )}

      {result?.eligible && (
        <Section title="Type de revenus exceptionnels concernés">
          <p className="text-sm text-gray-600 mb-3">
            Cochez les natures de revenus exceptionnels à mentionner dans le
            courrier. Le texte d&apos;introduction et la liste des justificatifs
            s&apos;adapteront automatiquement.
          </p>
          <div className="flex flex-col gap-2 max-w-3xl">
            {Object.values(ASSET_DEFINITIONS).map((asset) => {
              const checked = assetTypes.includes(asset.id);
              return (
                <label
                  key={asset.id}
                  className={classNames(
                    "flex items-start gap-3 p-3 rounded-md border cursor-pointer",
                    checked
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAsset(asset.id)}
                    className="mt-0.5"
                  />
                  <div className="text-sm">
                    <div className="font-medium">{asset.label}</div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Justificatifs : {asset.justificatifs.join(" · ")}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          {assetTypes.length === 0 && (
            <div className="mt-3 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-900">
              Cochez au moins un type de revenu exceptionnel pour générer le
              courrier.
            </div>
          )}
        </Section>
      )}

      {email && (
        <Section
          title="Email à envoyer au SIP"
          actions={
            <button
              type="button"
              onClick={onCopy}
              className={classNames(
                "flex items-center gap-2 px-3 py-1.5 rounded shadow text-sm font-semibold hover:opacity-75",
                copied ? "bg-green-200" : "bg-blue-100",
              )}
            >
              {copied ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <ClipboardIcon className="h-4 w-4" />
              )}
              {copied ? "Copié" : "Copier l'email"}
            </button>
          }
        >
          <textarea
            readOnly
            value={email}
            className={classNames(
              "w-full h-[28rem] font-mono text-xs",
              "border rounded-md p-3 bg-white",
            )}
          />
          <p className="text-xs text-gray-500 mt-2">
            À déposer via la messagerie sécurisée impots.gouv.fr, rubrique «
            J&apos;ai une question sur le calcul de mon impôt », après réception
            de l&apos;avis d&apos;imposition. Joindre les justificatifs listés
            en bas du courrier.
          </p>
        </Section>
      )}

      <Section title="Références">
        <ul className="text-sm space-y-2 text-gray-700">
          <li>
            <a
              href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036427364"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Article 223 sexies du Code Général des Impôts (Légifrance)
            </a>{" "}
            — base légale de la CEHR (I) et du mécanisme de lissage (II.1). Le
            II.2 précise le cas spécifique d&apos;une modification de la
            situation familiale, pour lequel le dépôt d&apos;une réclamation est
            explicitement requis.
          </li>
          <li>
            <a
              href="https://bofip.impots.gouv.fr/bofip/7804-PGP.html/identifiant=BOI-IR-CHR-20170711"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              BOI-IR-CHR — Contribution exceptionnelle sur les hauts revenus
              (BOFiP)
            </a>{" "}
            — doctrine administrative officielle de la DGFiP : champ
            d&apos;application, calcul, mécanisme de lissage et procédure de
            réclamation.
          </li>
          <li>
            <a
              href="https://prosper-conseil.fr/optimisation-fiscale/cehr-calcul-bareme-et-lissage/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Prosper Conseil — CEHR : calcul, barème et lissage
            </a>{" "}
            — synthèse pédagogique avec exemples chiffrés.
          </li>
        </ul>
      </Section>
    </div>
  );
}
