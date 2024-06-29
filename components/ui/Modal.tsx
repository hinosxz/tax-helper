"use client";
import classNames from "classnames";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  children: ReactNode;
  show: boolean;
}

const _Modal = ({ show, children }: ModalProps) => {
  return (
    <div
      tabIndex={-1}
      className={classNames(
        "fixed inset-x-24 inset-y-12 z-50",
        "overflow-y-auto overflow-x-hidden",
        {
          hidden: !show,
        },
      )}
    >
      <div className="relative p-4 bg-gray-100 rounded shadow w-full">
        {children}
      </div>
    </div>
  );
};

export const Modal = (props: ModalProps) => {
  // Portalize by default
  if (typeof window !== "undefined") {
    return createPortal(<_Modal {...props} />, document.body);
  }
  return <_Modal {...props} />;
};
