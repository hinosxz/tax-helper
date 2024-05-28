import classNames from "classnames";
import type { ReactNode } from "react";

interface ButtonProps {
  icon?: ({ className }: { className: string }) => ReactNode;
  isBorderless?: boolean;
  isDisabled?: boolean;
  label?: string;
  onClick: () => void;
  color?: "green" | "red";
}

export const Button = ({
  icon: Icon,
  isBorderless,
  isDisabled,
  onClick,
  color,
  label,
}: ButtonProps) => (
  <button
    className={classNames(
      "flex items-center",
      "font-semibold text-sm",
      "hover:opacity-75 disabled:opacity-25",
      {
        "rounded shadow px-3 py-1.5": !isBorderless,
        "bg-green-200 text-base": color === "green",
        "bg-red-400 text-white": color === "red",
      },
    )}
    onClick={onClick}
    type="button"
    disabled={isDisabled}
  >
    {Icon && (
      <Icon className={classNames("h-4 w-4 inline", { "mr-1": !!label })} />
    )}
    {label && ` ${label}`}
  </button>
);
