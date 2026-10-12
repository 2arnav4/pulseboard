"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { resetFeedOrder } from "@/features/feed/feedSlice";
import { clearHistory } from "@/features/history/historySlice";
import { resetPreferences, setRealtimeEnabled, setTheme, toggleCategory } from "@/features/preferences/preferencesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { CATEGORIES } from "@/types/content";
import { Switch } from "./Switch";

function Panel({ title, children, id }: { title: string; children: ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 id={id} className="mb-4 text-lg font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** The preferences panel: categories drive the feed; theme, language and live updates apply instantly. */
export function SettingsView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((state) => state.preferences);

  return (
    <div>
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />
      <div className="grid gap-6">
        <Panel id="settings-categories" title={t("settings.categories")}>
          <fieldset>
            <legend className="mb-4 text-sm text-muted">{t("settings.categoriesHelp")}</legend>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const selected = preferences.categories.includes(category);
                const isLast = selected && preferences.categories.length === 1;
                return (
                  <label
                    key={category}
                    className={clsx(
                      "relative inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                      selected ? "border-accent bg-accent-soft text-accent" : "border-border text-muted hover:text-text",
                      isLast && "cursor-not-allowed",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selected}
                      disabled={isLast}
                      onChange={() => dispatch(toggleCategory(category))}
                    />
                    {selected && <Check aria-hidden="true" className="size-4" />}
                    {t(`categories.${category}`)}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </Panel>

        <Panel id="settings-appearance" title={t("settings.appearance")}>
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <span id="dark-mode-label" className="text-sm font-medium">
                {t("settings.darkMode")}
              </span>
              <Switch
                id="dark-mode-switch"
                labelledBy="dark-mode-label"
                checked={preferences.theme === "dark"}
                onChange={(checked) => dispatch(setTheme(checked ? "dark" : "light"))}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="settings-language" className="text-sm font-medium">
                {t("settings.language")}
              </label>
              <LanguageSwitcher id="settings-language" withLabel={false} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <span id="realtime-label" className="text-sm font-medium">
                  {t("settings.realtime")}
                </span>
                <p id="realtime-help" className="text-sm text-muted">
                  {t("settings.realtimeHelp")}
                </p>
              </div>
              <Switch
                id="realtime-switch"
                labelledBy="realtime-label"
                describedBy="realtime-help"
                checked={preferences.realtimeEnabled}
                onChange={(checked) => dispatch(setRealtimeEnabled(checked))}
              />
            </div>
          </div>
        </Panel>

        <Panel id="settings-data" title={t("settings.data")}>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => dispatch(resetPreferences())}>
              {t("settings.resetPreferences")}
            </Button>
            <Button variant="secondary" onClick={() => dispatch(resetFeedOrder())}>
              {t("settings.resetOrder")}
            </Button>
            <Button variant="secondary" onClick={() => dispatch(clearHistory())}>
              {t("settings.clearHistory")}
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
