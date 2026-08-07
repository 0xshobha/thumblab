import type { ReactNode } from "react";

interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipSelectorProps<T extends string> {
  label: string;
  options: readonly ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  hint?: string;
}

export function ChipSelector<T extends string>({
  label,
  options,
  value,
  onChange,
  hint,
}: ChipSelectorProps<T>) {
  return (
    <div className="field-group">
      <div className="field-label">
        <span>{label}</span>
        {hint ? <span className="field-hint">{hint}</span> : null}
      </div>
      <div className="chip-list" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            className={"chip" + (value === option.value ? " is-selected" : "")}
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedSelectorProps<T extends string> {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedSelector<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedSelectorProps<T>) {
  return (
    <div className="field-group">
      <div className="field-label">
        <span>{label}</span>
      </div>
      <div className="segmented-control" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            className={"segmented-button" + (value === option.value ? " is-selected" : "")}
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            <span className="icon-segment">
              {option.icon}
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
