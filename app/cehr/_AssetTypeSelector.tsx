import classNames from "classnames";
import { Section } from "@/components/ui/Section";
import { ASSET_DEFINITIONS, type AssetType } from "@/lib/taxes/cehr-template";

interface Props {
  assetTypes: AssetType[];
  onToggle: (id: AssetType) => void;
}

export const AssetTypeSelector = ({ assetTypes, onToggle }: Props) => (
  <Section title="Type de revenus exceptionnels concernés">
    <p className="text-sm text-gray-600 mb-3">
      Cochez les natures de revenus exceptionnels à mentionner dans le courrier.
      Le texte d&apos;introduction et la liste des justificatifs
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
              onChange={() => onToggle(asset.id)}
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
        Cochez au moins un type de revenu exceptionnel pour générer le courrier.
      </div>
    )}
  </Section>
);
