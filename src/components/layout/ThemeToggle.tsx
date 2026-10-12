"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toggleTheme } from "@/features/preferences/preferencesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function ThemeToggle() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((state) => state.preferences.theme === "dark");

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-label={t(isDark ? "header.switchToLight" : "header.switchToDark")}
      aria-pressed={isDark}
      data-testid="theme-toggle"
      className="inline-flex size-10 items-center justify-center overflow-hidden rounded-xl text-muted hover:bg-surface-2 hover:text-text"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Moon aria-hidden="true" className="size-5" /> : <Sun aria-hidden="true" className="size-5" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
