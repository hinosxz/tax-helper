import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";

interface FileInputProps {
  accept?: string;
  id: string;
  isDisabled?: boolean;
  label: string;
  onUpload: (file: File | undefined) => void;
}

export const FileInput = ({
  accept,
  id,
  isDisabled,
  onUpload,
  label,
}: FileInputProps) => (
  <div>
    <label
      className={classNames(
        "flex items-center px-3 py-1.5 rounded shadow",
        "font-semibold text-sm",
        "hover:opacity-75 disabled:opacity-25",
        "bg-green-200 text-base cursor-pointer"
      )}
      htmlFor={id}
    >
      <ArrowDownTrayIcon className="h-4 w-4 inline mr-1" /> {label}
    </label>
    <input
      accept={accept}
      className="hidden"
      id={id}
      type="file"
      disabled={isDisabled}
      onInput={(event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        onUpload(file);
      }}
    />
  </div>
);
