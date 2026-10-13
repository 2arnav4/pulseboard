import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

/** Pill buttons: solid ink for the main action, a hairline ring for everything else. */
export const BUTTON_VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-ink-contrast hover:bg-accent hover:text-accent-contrast",
  secondary: "text-text ring-1 ring-inset ring-border hover:ring-text",
  ghost: "text-muted hover:text-text",
  danger: "text-danger ring-1 ring-inset ring-danger/40 hover:ring-danger",
};

export const BUTTON_BASE =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={clsx(BUTTON_BASE, BUTTON_VARIANTS[variant], className)} {...props} />;
}
