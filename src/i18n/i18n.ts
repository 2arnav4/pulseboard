import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import type { Language } from "@/features/preferences/preferencesSlice";
import en from "./locales/en";
import es from "./locales/es";
import hi from "./locales/hi";

export const resources = {
  en: { translation: en },
  hi: { translation: hi },
  es: { translation: es },
} as const satisfies Record<Language, { translation: unknown }>;

/**
 * Resources are bundled (three small files) instead of lazy-loaded, so switching
 * language is instant and the server render always has English available.
 */
export function createI18n(language: Language = "en") {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: "en",
    interpolation: { escapeValue: false }, // React already escapes output.
    react: { useSuspense: false },
    initAsync: false,
  });
  return instance;
}
