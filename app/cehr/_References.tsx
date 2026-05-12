import { Section } from "@/components/ui/Section";
import { Link } from "@/components/ui/Link";

const REFERENCES = [
  {
    href: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036427364",
    label: "Article 223 sexies du Code Général des Impôts (Légifrance)",
    description:
      "base légale de la CEHR (I) et du mécanisme de lissage (II.1). Le II.2 précise le cas spécifique d'une modification de la situation familiale, pour lequel le dépôt d'une réclamation est explicitement requis.",
  },
  {
    href: "https://bofip.impots.gouv.fr/bofip/7804-PGP.html/identifiant=BOI-IR-CHR-20170711",
    label:
      "BOI-IR-CHR — Contribution exceptionnelle sur les hauts revenus (BOFiP)",
    description:
      "doctrine administrative officielle de la DGFiP : champ d'application, calcul, mécanisme de lissage et procédure de réclamation.",
  },
  {
    href: "https://prosper-conseil.fr/optimisation-fiscale/cehr-calcul-bareme-et-lissage/",
    label: "Prosper Conseil — CEHR : calcul, barème et lissage",
    description: "synthèse pédagogique avec exemples chiffrés.",
  },
];

export const References = () => (
  <Section title="Références">
    <ul className="text-sm space-y-2 text-gray-700">
      {REFERENCES.map(({ href, label, description }) => (
        <li key={href}>
          <Link href={href} isExternal variant="blue">
            {label}
          </Link>{" "}
          — {description}
        </li>
      ))}
    </ul>
  </Section>
);
