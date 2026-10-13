import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";
import { createI18n } from "@/i18n/i18n";
import { hydrateFromStorage } from "@/store/actions";
import { makeStore, type AppStore } from "@/store/store";
import type { PersistedState } from "@/lib/persistence";

interface Options extends Omit<RenderOptions, "wrapper"> {
  store?: AppStore;
  /** Simulates the post-mount localStorage load; pass null to stay un-hydrated. */
  persisted?: PersistedState | null;
}

/** Render with the real Redux store and i18n, the same providers the app uses. */
export function renderWithProviders(ui: ReactElement, { store = makeStore(), persisted = {}, ...options }: Options = {}) {
  if (persisted) store.dispatch(hydrateFromStorage(persisted));
  const i18n = createI18n("en");
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}
