import { Section } from "@/components/ui/Section";

export const References = () => (
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
        — base légale de la CEHR (I) et du mécanisme de lissage (II.1). Le II.2
        précise le cas spécifique d&apos;une modification de la situation
        familiale, pour lequel le dépôt d&apos;une réclamation est explicitement
        requis.
      </li>
      <li>
        <a
          href="https://bofip.impots.gouv.fr/bofip/7804-PGP.html/identifiant=BOI-IR-CHR-20170711"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          BOI-IR-CHR — Contribution exceptionnelle sur les hauts revenus (BOFiP)
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
);
