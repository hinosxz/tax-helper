import classNames from "classnames";
import { ReactNode } from "react";

const getInputClassName = (validationError?: string | null) =>
  classNames("border text-sm rounded-md block p-1.5", {
    "bg-red-50 border border-red-500 text-red-900": !!validationError,
    "border-gray-300 read-only:bg-gray-100 disabled:bg-gray-100":
      !validationError,
  });

interface LabelProps {
  children: ReactNode;
}

const Label = ({ children }: LabelProps) => (
  <label className="block mb-2 text-sm font-medium">{children}</label>
);

interface PlaceholderInputProps {
  validationError?: string | null;
  isLoading?: boolean;
}

/**
 * TODO
 * 1. Add loading indicator when loading
 * 2. Properly display error message
 */
const PlaceholderInput = ({ validationError }: PlaceholderInputProps) => (
  <input
    className={getInputClassName(validationError)}
    disabled
    readOnly
    placeholder={validationError ? "–" : undefined}
  />
);

interface InputProps<T extends string | number> {
  isRequired?: boolean;
  isReadOnly?: boolean;
  value: T;
  onChange?: (value: T) => void;
  min?: T;
  max?: T;
  placeholder?: string;
  validationError?: string;
}

interface NumberInputProps extends InputProps<number> {
  type: "number";
  maxDecimals?: 0 | 1 | 2;
}

const NumberInput = ({
  isReadOnly,
  isRequired,
  value,
  onChange,
  min,
  max,
  placeholder,
  type,
  maxDecimals = 2,
  validationError,
}: NumberInputProps) => (
  <input
    required={isRequired}
    readOnly={isReadOnly}
    type={type}
    className={getInputClassName(validationError)}
    placeholder={placeholder}
    value={value.toFixed(maxDecimals)}
    onChange={(event) => onChange?.(event.target.valueAsNumber)}
    min={min}
    max={max}
    step={1 / 10 ** maxDecimals}
  />
);

interface DateInputProps extends InputProps<string> {
  type: "date";
}

const DateInput = ({
  isReadOnly,
  isRequired,
  value,
  onChange,
  min,
  max,
  placeholder,
  type,
  validationError,
}: DateInputProps) => (
  <input
    required={isRequired}
    readOnly={isReadOnly}
    type={type}
    className={getInputClassName(validationError)}
    placeholder={placeholder}
    value={value}
    onChange={(event) => onChange?.(event.target.value)}
    min={min}
    max={max}
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

type PlaceholderFieldProps = PlaceholderInputProps & { label: string };

export const PlaceholderField = ({
  label,
  ...inputProps
}: PlaceholderFieldProps) => (
  <div>
    <Label>{label}</Label>
    <PlaceholderInput {...inputProps} />
  </div>
);
