import { useState } from "react";
import classNames from "classnames";

export interface Option<V extends string> {
  label: string;
  value: V;
}

interface ButtonGroupProps<V extends string> {
  onClick: (value: V) => void;
  options: ReadonlyArray<Option<V>>;
  value?: V;
  variant?: "default" | "segmented";
}

export const ButtonGroup = <V extends string>({
  onClick,
  options,
  value,
  variant = "default",
}: ButtonGroupProps<V>) => {
  const [activeOption, setActiveOption] = useState<V | undefined>(
    options.at(0)?.value,
  );
  const selectedOption = value ?? activeOption;

  if (options.length < 2) {
    throw Error(
      `<ButtonGroup /> component expects at least 2 options. ${options.length} passed.`,
    );
  }
  return (
    <div
      className={classNames(
        "inline-flex",
        variant === "default" && "rounded-md shadow-xs",
        variant === "segmented" &&
          "rounded-md shadow-sm border border-gray-300 overflow-hidden",
      )}
      role="group"
    >
      {options.map((option, idx) => (
        <button
          key={option.label}
          type="button"
          className={classNames(
            variant === "default" && [
              "shadow px-3 py-1.5 text-sm",
              "bg-green-200 text-base",
              "hover:opacity-75",
              {
                "rounded-s-lg": idx === 0,
                "rounded-e-lg": idx === options.length - 1,
                "font-semibold": option.value === selectedOption,
              },
            ],
            variant === "segmented" && [
              "px-4 py-1.5 text-sm transition-colors",
              idx > 0 && "border-l border-gray-300",
              option.value === selectedOption
                ? "bg-gray-100 text-gray-900 font-bold"
                : "bg-white text-gray-600 hover:bg-gray-50",
            ],
          )}
          onClick={() => {
            setActiveOption(option.value);
            onClick(option.value);
          }}
          disabled={variant === "default" && option.value === selectedOption}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
