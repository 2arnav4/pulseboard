"use client";

import { MotionConfig } from "framer-motion";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { Provider as ReduxProvider } from "react-redux";
import { createI18n } from "@/i18n/i18n";
import { makeStore } from "@/store/store";

interface AppProvidersProps {
  session: Session | null;
  children: ReactNode;
}

/** Client-side context for the whole app: auth session, Redux store, translations, motion settings. */
export function AppProviders({ session, children }: AppProvidersProps) {
  // Lazy useState initializers: one store and one i18n instance per browser tab, never shared across requests.
  const [store] = useState(() => makeStore());
  const [i18n] = useState(() => createI18n("en"));

  return (
    <SessionProvider session={session}>
      <ReduxProvider store={store}>
        <I18nextProvider i18n={i18n}>
          {/* "user" respects the OS reduced-motion setting for every Framer Motion animation. */}
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </I18nextProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}
