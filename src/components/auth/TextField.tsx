import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  help?: string;
}

export function TextField({ id, label, help, ...inputProps }: TextFieldProps) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={help ? `${id}-help` : undefined}
        className="h-11 rounded-xl border border-border bg-bg px-3.5 text-sm text-text transition-colors focus:border-text focus:outline-none"
        {...inputProps}
      />
      {help && (
        <p id={`${id}-help`} className="text-xs text-muted">
          {help}
        </p>
      )}
    </div>
  );
}
