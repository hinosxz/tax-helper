import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import classNames from "classnames";
import Tippy from "@tippyjs/react";

interface CopyButtonProps {
  value: string | number | null;
}

export const CopyButton = ({ value }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value !== null) {
      navigator.clipboard.writeText(value.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  return (
    <Tippy content={copied ? "Copied!" : "Copy to clipboard"} placement="right">
      <button
        onClick={handleCopy}
        className={classNames(
          "flex items-center",
          "font-semibold text-sm",
          "hover:opacity-75 disabled:opacity-25",
          {
            "bg-green-100 border-green-300": copied,
            "text-green-600": copied,
            "text-blue-600": !copied,
          },
        )}
        disabled={value === null}
        aria-label="Copy value to clipboard"
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 transition-transform duration-200 transform scale-110" />
        ) : (
          <ClipboardIcon className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
        )}
      </button>
    </Tippy>
  );
};
