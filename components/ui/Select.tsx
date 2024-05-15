import classNames from "classnames";
export type SelectValues = string | number;
export interface SelectProps<T extends SelectValues> {
  /** Add an extra className to Select wrapper */
  className?: string;
  /** Label for the Select */
  label: React.ReactNode;
  /** Options for the Select */
  options: Array<{ label: string; value: T }>;
  /** The value of the Select */
  value: T | undefined;
  /** Callback when the Select value changes */
  onChange: (value: T) => void;
  /** Whether the Select is disabled */
  isDisabled?: boolean;
}

export function Select<T extends SelectValues>(props: SelectProps<T>) {
  return (
    <div
      className={classNames(
        "flex items-center justify-start gap-2",
        props.className,
      )}
    >
      <label>{props.label}</label>
      <select
        disabled={props.isDisabled}
        onChange={(event) => props.onChange(event.target.value as T)}
        value={props.value}
      >
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
