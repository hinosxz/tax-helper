import { useState } from "react";
import classNames from "classnames";

export interface Option<V extends string> {
  label: string;
  value: V;
}

interface ButtonGroupProps<V extends string> {
  onClick: (value: V) => void;
  options: ReadonlyArray<Option<V>>;
}

export const ButtonGroup = <V extends string>({
  onClick,
  options,
}: ButtonGroupProps<V>) => {
  const [activeOption, setActiveOption] = useState<V | undefined>(
    options.at(0)?.value,
  );

  if (options.length < 2) {
    throw Error(
      `<ButtonGroup /> component expects at least 2 options. ${options.length} passed.`,
    );
  }
  return (
    <div className="inline-flex rounded-md shadow-xs" role="group">
      {options.map((option, idx) => (
        <button
          key={option.label}
          type="button"
          className={classNames(
            "shadow px-3 py-1.5 text-sm",
            "bg-green-200 text-base",
            "hover:opacity-75",
            {
              "rounded-s-lg": idx === 0,
              "rounded-e-lg": idx === options.length - 1,
              "font-semibold": option.value === activeOption,
            },
          )}
          onClick={() => {
            setActiveOption(option.value);
            onClick(option.value);
          }}
          disabled={option.value === activeOption}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
