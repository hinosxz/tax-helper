import classNames from "classnames";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { NumberInput } from "@/components/ui/Field";

export type CheckStatus = "neutral" | "passed" | "failed";

interface RfrFieldProps {
  label: React.ReactNode;
  explanation: React.ReactNode;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  status: CheckStatus;
  checkDetail?: string;
}

export const RfrField = ({
  label,
  explanation,
  value,
  onChange,
  placeholder,
  status,
  checkDetail,
}: RfrFieldProps) => (
  <div
    className={classNames(
      "border rounded-md p-4 max-w-3xl",
      status === "passed" && "border-green-300 bg-green-50/40",
      status === "failed" && "border-red-300 bg-red-50/40",
      status === "neutral" && "border-gray-200 bg-white",
    )}
  >
    <div className="flex items-center gap-2 text-sm font-semibold mb-1">
      {label}
      {status === "passed" && (
        <CheckCircleIcon className="h-4 w-4 text-green-600" />
      )}
      {status === "failed" && <XCircleIcon className="h-4 w-4 text-red-600" />}
    </div>
    <div className="text-xs text-gray-600 mb-3">{explanation}</div>
    <NumberInput
      value={value}
      onChange={(v) => onChange(Number.isNaN(v) ? null : v)}
      min={0}
      maxDecimals={0}
      placeholder={placeholder}
      validationError={status === "failed" ? checkDetail : null}
    />
  </div>
);
