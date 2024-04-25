import classNames from "classnames";
import { ReactNode } from "react";

const inputClassName = classNames(
  "border border-gray-300 text-sm rounded-md",
  "block p-1.5 read-only:bg-gray-100"
);

interface LabelProps {
  children: ReactNode;
}

const Label = ({ children }: LabelProps) => (
  <label className="block mb-2 text-sm font-medium">{children}</label>
);

interface InputProps<T extends string | number> {
  isRequired?: boolean;
  isReadOnly?: boolean;
  value: T;
  onChange?: (value: T) => void;
  min?: T;
  max?: T;
  placeholder?: string;
}

interface NumberInputProps extends InputProps<number> {
  type: "number";
  maxDecimals?: 0 | 1 | 2;
}

interface DateInputProps extends InputProps<string> {
  type: "date";
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
}: NumberInputProps) => (
  <input
    required={isRequired}
    readOnly={isReadOnly}
    type={type}
    className={inputClassName}
    placeholder={placeholder}
    value={value.toFixed(maxDecimals)}
    onChange={(event) => onChange?.(event.target.valueAsNumber)}
    min={min}
    max={max}
  />
);

const DateInput = ({
  isReadOnly,
  isRequired,
  value,
  onChange,
  min,
  max,
  placeholder,
  type,
}: DateInputProps) => (
  <input
    required={isRequired}
    readOnly={isReadOnly}
    type={type}
    className={inputClassName}
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
