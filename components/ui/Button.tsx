import classNames from "classnames";
import { ReactNode } from "react";

interface ButtonProps {
  icon?: ({ className }: { className: string }) => ReactNode;
  isDisabled?: boolean;
  label: string;
  onClick: () => void;
  color: "green" | "red";
}

export const Button = ({
  icon: Icon,
  isDisabled,
  onClick,
  color,
  label,
}: ButtonProps) => (
  <button
    className={classNames(
      "flex items-center px-3 py-1.5 rounded shadow",
      "font-semibold text-sm",
      "hover:opacity-75 disabled:opacity-25",
      {
        "bg-green-200 text-base": color === "green",
        "bg-red-400 text-white": color === "red",
      },
    )}
    onClick={onClick}
    type="button"
    disabled={isDisabled}
  >
    {Icon && <Icon className="h-4 w-4 inline mr-1" />} {label}
  </button>
);
