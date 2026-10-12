"use client";

import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LANGUAGES, setLanguage, type Language } from "@/features/preferences/preferencesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

export function LanguageSwitcher({ id = "language-switcher" }: { id?: string }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.preferences.language);

  return (
    <div className="relative flex items-center">
      <label htmlFor={id} className="sr-only">
        {t("header.language")}
      </label>
      <Languages aria-hidden="true" className="pointer-events-none absolute left-2.5 size-4 text-muted" />
      <select
        id={id}
        value={language}
        onChange={(event) => {
          if (isLanguage(event.target.value)) dispatch(setLanguage(event.target.value));
        }}
        className="h-10 appearance-none rounded-xl border border-border bg-surface pl-8 pr-3 text-sm text-text hover:bg-surface-2"
      >
        {LANGUAGES.map((code) => (
          <option key={code} value={code} lang={code}>
            {t(`languages.${code}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
