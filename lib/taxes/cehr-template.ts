import type { QuotientResult } from "./cehr";

export type AssetType = "rsu" | "espp" | "so";

export interface AssetDefinition {
  id: AssetType;
  label: string;
  // Short phrase used inside the intro sentence after "cessions de"
  intro: string;
  // Asset-specific supporting documents
  justificatifs: string[];
}

export const ASSET_DEFINITIONS: Record<AssetType, AssetDefinition> = {
  rsu: {
    id: "rsu",
    label: "Actions gratuites (RSU)",
    intro: "actions gratuites (RSU)",
    justificatifs: [
      "Courrier d'attribution des RSU (Grant agreement)",
      "Confirmations de cession (broker)",
      "Récapitulatif annuel des opérations RSU",
      "Attestation employeur ventilant gain d'acquisition et plus-value",
    ],
  },
  espp: {
    id: "espp",
    label: "ESPP (Employee Stock Purchase Plan)",
    intro: "actions acquises via le plan d'achat salarié (ESPP)",
    justificatifs: [
      "Bulletins d'attribution / d'achat ESPP",
      "Confirmations de cession ESPP (broker)",
      "Récapitulatif annuel ESPP",
    ],
  },
  so: {
    id: "so",
    label: "Stock-options",
    intro: "stock-options",
    justificatifs: [
      "Courrier d'attribution des stock-options",
      "Plan de stock-options (et éventuels fractionnements)",
      "Confirmations de cession des stock-options",
      "Détail des opérations : attribution, levée, cession",
    ],
  },
};

interface TemplateInputs {
  yearN: number;
  rfrN: number;
  rfrNm1: number;
  rfrNm2: number;
  quotient: QuotientResult;
  assetTypes: AssetType[];
  situation: "single" | "couple";
}

const fmtEur = (n: number): string =>
  `${Math.round(n).toLocaleString("fr-FR")} €`;

const joinFr = (items: string[]): string => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
};

export const buildCehrEmail = ({
  yearN,
  rfrN,
  rfrNm1,
  rfrNm2,
  quotient,
  assetTypes,
  situation,
}: TemplateInputs): string => {
  if (assetTypes.length === 0) {
    throw new Error(
      "buildCehrEmail requires at least one asset type to be selected.",
    );
  }
  const yearNp1 = yearN + 1;
  const yearNm1 = yearN - 1;
  const yearNm2 = yearN - 2;
  const c = quotient.cehrWithoutQuotient;

  const introPhrases = joinFr(
    assetTypes.map((t) => ASSET_DEFINITIONS[t].intro),
  );
  const assetJustificatifs = Array.from(
    new Set(assetTypes.flatMap((t) => ASSET_DEFINITIONS[t].justificatifs)),
  );

  const isCouple = situation === "couple";
  const p = (we: string, i: string): string => (isCouple ? we : i);

  const signatureLines = isCouple
    ? [
        "[Nom(s)]",
        "Numéro fiscal déclarant 1 : [XX XX XXX XXX XXX]",
        "Numéro fiscal déclarant 2 : [XX XX XXX XXX XXX]",
      ]
    : ["[Nom]", "Numéro fiscal : [XX XX XXX XXX XXX]"];

  return `Objet : Demande de lissage de la Contribution Exceptionnelle sur les Hauts Revenus — application du système du quotient — Revenus ${yearN}

Madame, Monsieur,

${p("Nous revenons", "Je reviens")} vers vous suite à la réception de ${p("notre", "mon")} avis d'imposition des revenus ${yearN} établi en ${yearNp1}.

Compte tenu de ${p("notre", "mon")} revenu fiscal de référence (RFR) ${yearN}, ${p("nous avons", "j'ai")} été soumis${isCouple ? "" : "·e"} à la Contribution Exceptionnelle sur les Hauts Revenus. Cependant, ${p("nos", "mes")} revenus ${yearN} sont composés en partie de revenus considérés comme exceptionnels. En effet, ${p("notre", "mon")} RFR ${yearN} est plus élevé que les années précédentes du fait des cessions de ${introPhrases} intervenues en ${yearN}.

Veuillez noter qu'en ${yearN}, ${p("nos", "mes")} revenus étaient constitués en majorité de revenus issus des cessions de valeurs mobilières (${introPhrases}) qui ont fortement impacté ${p("notre revenu global", "mon revenu global")} et également ${p("notre", "mon")} revenu fiscal de référence.

Sur ${p("notre", "mon")} avis d'impôt ${yearNp1} sur les revenus ${yearN}, la CEHR a été appliquée sans application du système du quotient et a été calculée comme suit :

Calcul de la CEHR (sans mécanisme du quotient)
- RFR ${yearN} : ${fmtEur(rfrN)}
- Base CEHR 3 % : ${fmtEur(c.base3)}
- Base CEHR 4 % : ${fmtEur(c.base4)}
- Montant CEHR à 3 % : ${fmtEur(c.amount3)}
- Montant CEHR à 4 % : ${fmtEur(c.amount4)}
- Montant CEHR Total : ${fmtEur(c.total)}

${p("Nous remplissons", "Je remplis")} les conditions légales pour bénéficier du quotient. ${p("Nos", "Mes")} trois derniers revenus fiscaux de référence sont les suivants :

- RFR ${yearNm2} : ${fmtEur(rfrNm2)}
- RFR ${yearNm1} : ${fmtEur(rfrNm1)}
- RFR ${yearN} : ${fmtEur(rfrN)}

Selon ${p("nos", "mes")} estimations, avec application du mécanisme du quotient, le montant de la contribution devrait s'élever à ${fmtEur(quotient.cehrWithQuotient)}.

Ainsi, ${p("nous vous demandons", "je vous demande")}, par la présente, de bien vouloir revoir le calcul de ${p("notre", "mon")} impôt sur les revenus ${yearN} avec notamment le recalcul du montant de la Contribution Exceptionnelle sur les Hauts Revenus avec application du système du quotient.

Vous trouverez ci-joint l'ensemble des justificatifs relatifs aux cessions ${yearN} :

${[...assetJustificatifs, `Avis d'imposition des revenus ${yearNm2}, ${yearNm1} et ${yearN}`].map((j, i) => `${i + 1}. ${j}`).join("\n")}

En vous remerciant pour votre réponse, ${p("nous vous prions", "je vous prie")} d'agréer, Madame, Monsieur, ${p("nos", "mes")} sincères salutations.

Cordialement,
${signatureLines.join("\n")}
`;
};
