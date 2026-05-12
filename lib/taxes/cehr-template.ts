import { computeCehr, fmtEur, type QuotientResult } from "./cehr";

export type AssetType = "rsu" | "espp" | "so";

export interface AssetDefinition {
  id: AssetType;
  label: string;
  intro: string;
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

const joinFr = (items: string[]): string => {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} et ${items.at(-1)}`;
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
  const excess = rfrN - quotient.averagePrevious;
  const halfExcess = excess / 2;
  const midpoint = quotient.averagePrevious + halfExcess;
  const lissed = computeCehr(midpoint, situation);
  const threshold150 = 1.5 * quotient.averagePrevious;

  const introPhrases = joinFr(
    assetTypes.map((t) => ASSET_DEFINITIONS[t].intro),
  );
  const assetJustificatifs = Array.from(
    new Set(assetTypes.flatMap((t) => ASSET_DEFINITIONS[t].justificatifs)),
  );

  const isCouple = situation === "couple";
  const p = (coupleText: string, singleText: string): string =>
    isCouple ? coupleText : singleText;

  const signature = isCouple
    ? "[Nom(s)]\nNuméro fiscal déclarant 1 : [XX XX XXX XXX XXX]\nNuméro fiscal déclarant 2 : [XX XX XXX XXX XXX]"
    : "[Nom]\nNuméro fiscal : [XX XX XXX XXX XXX]";

  return `Objet : Réclamation contentieuse — application du mécanisme de quotient prévu à l'article 223 sexies II du CGI — CEHR sur les revenus ${yearN}

Madame, Monsieur,

${p("Nous vous adressons", "Je vous adresse")} une réclamation concernant la Contribution Exceptionnelle sur les Hauts Revenus (CEHR) établie au titre des revenus ${yearN}, sur l'avis d'impôt émis en ${yearNp1}.

${p("Sauf erreur de notre part", "Sauf erreur de ma part")}, le mécanisme de quotient prévu à l'article 223 sexies II du Code général des impôts n'a pas été appliqué, alors que les conditions chiffrées d'application ressortent des revenus fiscaux de référence des trois années concernées.

${p("Nous sollicitons", "Je sollicite")} donc le recalcul de la CEHR avec application de ce mécanisme, ainsi que le dégrèvement ou la restitution de la différence correspondante.

1. RFR concernés et conditions chiffrées du quotient CEHR

Les revenus fiscaux de référence figurant sur les avis d'imposition concernés sont les suivants :

- RFR ${yearNm2} : ${fmtEur(rfrNm2)}
- RFR ${yearNm1} : ${fmtEur(rfrNm1)}
- RFR ${yearN} : ${fmtEur(rfrN)}

La moyenne des RFR ${yearNm2} et ${yearNm1} est donc de ${fmtEur(quotient.averagePrevious)}. Le seuil de comparaison de 1,5 × cette moyenne est de ${fmtEur(threshold150)}.

Ces montants satisfont les conditions chiffrées suivantes prévues par l'article 223 sexies II du CGI :

- Le RFR ${yearN} dépasse le seuil d'entrée de la CEHR applicable au foyer fiscal : ${fmtEur(rfrN)} > ${fmtEur(quotient.entryThreshold)}.
- Le RFR ${yearN} est au moins égal à 1,5 fois cette moyenne : ${fmtEur(rfrN)} ≥ ${fmtEur(threshold150)}.
- Les RFR ${yearNm1} et ${yearNm2} restent chacun inférieurs ou égaux au seuil d'entrée de la CEHR applicable au foyer fiscal : ${fmtEur(rfrNm1)} ≤ ${fmtEur(quotient.entryThreshold)} et ${fmtEur(rfrNm2)} ≤ ${fmtEur(quotient.entryThreshold)}.
- Les avis d'impôt joints pour les revenus ${yearNm2}, ${yearNm1} et ${yearN} permettent de vérifier la continuité du dossier fiscal sur les trois années concernées.

La hausse du RFR ${yearN} provient notamment de cessions de ${introPhrases} intervenues en ${yearN}, comme indiqué dans les justificatifs joints.

2. Calcul de la CEHR sans quotient

- RFR ${yearN} : ${fmtEur(rfrN)}
- Base CEHR 3 % : ${fmtEur(c.base3)}
- Base CEHR 4 % : ${fmtEur(c.base4)}
- Montant CEHR à 3 % : ${fmtEur(c.amount3)}
- Montant CEHR à 4 % : ${fmtEur(c.amount4)}
- Montant total de CEHR : ${fmtEur(c.total)}

3. Calcul de la CEHR avec quotient

- Fraction du RFR ${yearN} au-dessus de cette moyenne : ${fmtEur(rfrN)} - ${fmtEur(quotient.averagePrevious)} = ${fmtEur(excess)}
- Base lissée retenue pour le quotient : moyenne + moitié de cette fraction, soit ${fmtEur(quotient.averagePrevious)} + (${fmtEur(excess)} / 2) = ${fmtEur(midpoint)}
- CEHR calculée sur cette base lissée : base à 3 % de ${fmtEur(lissed.base3)} et base à 4 % de ${fmtEur(lissed.base4)}.
- Montant total de CEHR après quotient : la CEHR calculée sur cette base lissée est doublée, puis le résultat est arrondi à l'euro, soit ${fmtEur(quotient.cehrWithQuotient)}.

La différence entre le calcul sans quotient et le calcul avec quotient est donc estimée à ${fmtEur(quotient.savings)}.

${p("Nous vous remercions", "Je vous remercie")} en conséquence de bien vouloir appliquer le mécanisme de quotient prévu à l'article 223 sexies II du CGI, recalculer la CEHR due au titre des revenus ${yearN}, et procéder au dégrèvement ou à la restitution du trop-versé.

Pièces jointes proposées :

${[...assetJustificatifs, `Avis d'imposition des revenus ${yearNm2}, ${yearNm1} et ${yearN}`].map((j, i) => `${i + 1}. ${j}`).join("\n")}

${p("Nous restons", "Je reste")} à votre disposition pour tout complément ou tout recalcul à partir des montants exacts retenus dans ${p("notre", "mon")} dossier fiscal.

${p("Nous vous prions", "Je vous prie")} d'agréer, Madame, Monsieur, l'expression de ${p("nos", "mes")} salutations distinguées.

Cordialement,
${signature}
`;
};
