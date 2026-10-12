import type { TranslationResources } from "./locales/en";

/** Same keys as English, any string values: a missing or extra key in hi/es fails type checking. */
type DeepStrings<T> = { [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]> };

export type Translation = DeepStrings<TranslationResources>;
