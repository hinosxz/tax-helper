export const Header = () => (
  <header>
    <h1 className="text-3xl font-semibold">
      Puis-je réduire une partie de mes impôts ?
    </h1>
    <p className="text-sm text-gray-600 mt-3 max-w-3xl">
      Une année avec beaucoup de cessions d&apos;actions (RSU, ESPP,
      stock-options) peut déclencher la{" "}
      <strong>Contribution Exceptionnelle sur les Hauts Revenus (CEHR)</strong>,
      une surtaxe de 3 à 4 % qui s&apos;applique au-delà d&apos;un certain seuil
      de revenu fiscal de référence. Le code des impôts prévoit un mécanisme de
      lissage qui ramène la base de calcul à un niveau plus proche de la moyenne
      de vos années précédentes — ce qui peut sérieusement réduire la facture.
    </p>
    <p className="text-sm text-gray-600 mt-3 max-w-3xl">
      Ce lissage est censé être appliqué automatiquement, mais il arrive que le
      SIP l&apos;oublie. Et si votre situation familiale a changé sur la période
      (mariage, PACS, divorce, décès), c&apos;est à vous de faire la démarche
      pour fournir les bons revenus de référence.
    </p>
    <p className="text-sm text-gray-600 mt-3 max-w-3xl">
      Cet outil estime ce que votre CEHR <em>devrait</em> être avec lissage, et
      génère le courrier de réclamation à envoyer aux impôts si nécessaire.
    </p>
  </header>
);
