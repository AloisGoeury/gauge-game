import { useEffect, useId, useRef, useState } from "react";

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}

export function SelectField<T extends string>({ label, value, options, onChange }: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div className="select-field" ref={rootRef}>
      <span className="field-label" id={labelId}>
        {label}
      </span>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={`${labelId} ${labelId}-value`}
        className="select-trigger"
        type="button"
        onClick={() => setOpen(!open)}
      >
        <span id={`${labelId}-value`}>{selected.label}</span>
        <span className="select-chevron" aria-hidden="true" />
      </button>
      {open ? (
        <div className="select-menu" role="listbox" aria-labelledby={labelId}>
          {options.map((option) => (
            <button
              aria-selected={option.value === value}
              className={option.value === value ? "select-option active" : "select-option"}
              key={option.value}
              role="option"
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
