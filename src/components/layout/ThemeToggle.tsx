"use client";

import { useTranslation } from "react-i18next";
import { toggleTheme } from "@/features/preferences/preferencesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

/** Text toggle: names the mode you will switch to ("Dark" / "Light"). */
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
      className="inline-flex min-h-9 items-center rounded-full px-3 text-sm text-muted ring-1 ring-inset ring-border transition-colors hover:text-text hover:ring-text"
    >
      {t(isDark ? "header.light" : "header.dark")}
    </button>
  );
}
