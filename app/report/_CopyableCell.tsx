import { CopyButton } from "@/components/ui/CopyButton";

export const CopyableCell: React.FunctionComponent<{
  value: string | number;
}> = ({ value }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block w-32 p-1 bg-white border border-black">
        {value}
      </span>
      <CopyButton value={value} />
    </div>
  );
};
