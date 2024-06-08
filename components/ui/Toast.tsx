import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import classNames from "classnames";
import type { ReactNode } from "react";
import toast from "react-hot-toast";

interface ToastProps {
  icon?: ({ className }: { className: string }) => ReactNode;
  status?: "default" | "error";
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
}

export const Toast = ({
  icon: LeftIcon,
  status = "default",
  message,
  isVisible,
  onDismiss,
}: ToastProps) => (
  <div
    className={classNames(
      "flex items-center w-full max-w-xs p-4",
      "rounded-lg shadow",
      "bg-gray-700 text-white",
      { "animate-enter": isVisible, "animate-leave": !isVisible },
    )}
  >
    {LeftIcon && (
      <LeftIcon
        className={classNames("h-6 w-6", {
          "text-red-400": status === "error",
        })}
      />
    )}
    <div className="ms-3 text-sm">{message}</div>
    <button
      type="button"
      className={classNames(
        "inline-flex items-center justify-center h-8 w-8",
        "ms-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg",
        "hover:opacity-50",
      )}
      onClick={onDismiss}
    >
      <XMarkIcon className="h-6 w-6" />
    </button>
  </div>
);

export const sendInfoToast = (message: string) =>
  toast.custom((t) => (
    <Toast
      icon={InformationCircleIcon}
      status="default"
      message={message}
      isVisible={t.visible}
      onDismiss={() => toast.remove(t.id)}
    />
  ));

export const sendErrorToast = (message: string) =>
  toast.custom((t) => (
    <Toast
      icon={ExclamationTriangleIcon}
      status="error"
      message={message}
      isVisible={t.visible}
      onDismiss={() => toast.remove(t.id)}
    />
  ));
