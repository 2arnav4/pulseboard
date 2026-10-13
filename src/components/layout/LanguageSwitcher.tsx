"use client";

import { useTranslation } from "react-i18next";
import { LANGUAGES, setLanguage, type Language } from "@/features/preferences/preferencesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

/** `withLabel={false}` when the caller renders its own visible <label htmlFor={id}>. */
export function LanguageSwitcher({ id = "language-switcher", withLabel = true }: { id?: string; withLabel?: boolean }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.preferences.language);

  return (
    <div className="relative flex items-center">
      {withLabel && (
        <label htmlFor={id} className="sr-only">
          {t("header.language")}
        </label>
      )}
      <select
        id={id}
        value={language}
        onChange={(event) => {
          if (isLanguage(event.target.value)) dispatch(setLanguage(event.target.value));
        }}
        className="min-h-9 appearance-none rounded-full bg-transparent pl-3 pr-8 text-sm text-muted ring-1 ring-inset ring-border transition-colors hover:text-text hover:ring-text"
      >
        {LANGUAGES.map((code) => (
          <option key={code} value={code} lang={code}>
            {t(`languages.${code}`)}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute right-3 size-3.5 text-muted">
        <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
