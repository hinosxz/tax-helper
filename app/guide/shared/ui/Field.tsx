import classNames from "classnames";
import { InputHTMLAttributes, ReactNode } from "react";
import { LoadingIndicator } from "./LoadingIndicator";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
interface LabelProps {
  children: ReactNode;
}

const Label = ({ children }: LabelProps) => (
  <label className="block mb-2 text-sm font-medium">{children}</label>
);

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "value"> {
  isLoading?: boolean;
  validationError?: string | null;
  value: string | number | null | undefined;
}

const Input = ({
  isLoading,
  validationError,
  value,
  ...htmlInputProps
}: InputProps) => {
  return (
    <Tippy
      content={
        validationError ? (
          <div className="flex text-xs items-center gap-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />
            {validationError}
          </div>
        ) : null
      }
      disabled={!validationError}
    >
      <div className="relative">
        {isLoading ? (
          <div
            className={classNames(
              "absolute inset-y-0 end-0 flex items-center ps-3",
              "pointer-events-none"
            )}
          >
            <LoadingIndicator />
          </div>
        ) : null}
        <input
          className={classNames("border text-sm rounded-md block p-1.5", {
            "bg-red-50 border border-red-500 text-red-900": !!validationError,
            "border-gray-300 read-only:bg-gray-100 disabled:bg-gray-100":
              !validationError,
            "pe-10": isLoading,
          })}
          {...htmlInputProps}
          disabled={isLoading}
          value={validationError || !value ? "–" : value}
          placeholder={validationError ? "–" : htmlInputProps.placeholder}
        />
      </div>
    </Tippy>
  );
};

interface BaseInputProps<T extends string | number> {
  isLoading?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  value: T | null;
  onChange?: (value: T) => void;
  min?: T;
  max?: T;
  placeholder?: string;
  validationError?: string | null;
}

interface NumberInputProps extends BaseInputProps<number> {
  maxDecimals?: 0 | 1 | 2;
}

const NumberInput = ({
  isLoading,
  isReadOnly,
  isRequired,
  value,
  onChange,
  min,
  max,
  placeholder,
  maxDecimals = 2,
  validationError,
}: NumberInputProps) => (
  <Input
    required={isRequired}
    readOnly={isReadOnly}
    type="number"
    placeholder={placeholder}
    value={isReadOnly ? value?.toFixed(2) : value}
    onChange={(event) => onChange?.(event.target.valueAsNumber)}
    min={min}
    max={max}
    step={1 / 10 ** maxDecimals}
    validationError={validationError}
    isLoading={isLoading}
  />
);

interface DateInputProps extends BaseInputProps<string> {}

const DateInput = ({
  isLoading,
  isReadOnly,
  isRequired,
  value,
  onChange,
  min,
  max,
  placeholder,
  validationError,
}: DateInputProps) => (
  <Input
    required={isRequired}
    readOnly={isReadOnly}
    type="date"
    placeholder={placeholder}
    value={value}
    onChange={(event) => onChange?.(event.target.value)}
    min={min}
    max={max}
    validationError={validationError}
    isLoading={isLoading}
  />
);

type NumberFieldProps = NumberInputProps & { label: string };

export const NumberField = ({ label, ...inputProps }: NumberFieldProps) => (
  <div>
    <Label>{label}</Label>
    <NumberInput {...inputProps} />
  </div>
);

type DateFieldProps = DateInputProps & { label: string };

export const DateField = ({ label, ...inputProps }: DateFieldProps) => (
  <div>
    <Label>{label}</Label>
    <DateInput {...inputProps} />
  </div>
);
