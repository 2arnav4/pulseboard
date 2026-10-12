"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

interface SwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelledBy: string;
  describedBy?: string;
}

/** ARIA switch: a button with role="switch" and aria-checked, operable with Space/Enter. */
export function Switch({ id, checked, onChange, labelledBy, describedBy }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-transparent transition-colors",
        checked ? "bg-accent" : "bg-muted/40",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 35 }}
        className={clsx("size-6 rounded-full bg-white shadow", checked ? "ml-auto" : "ml-0")}
      />
    </button>
  );
}
