import classNames from "classnames";
import type { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  show: boolean;
}

export const Modal = ({ show, children }: ModalProps) => {
  return (
    <div
      tabIndex={-1}
      className={classNames("fixed z-50", "overflow-y-auto overflow-x-hidden", {
        hidden: !show,
      })}
    >
      <div className="relative p-4 bg-gray-100 rounded shadow w-full">
        {children}
      </div>
    </div>
  );
};
