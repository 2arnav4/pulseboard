"use client";

import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import type { RealtimeStatus } from "@/hooks/useRealtimeFeed";

export function RealtimeIndicator({ status }: { status: RealtimeStatus }) {
  const { t } = useTranslation();
  const live = status === "live";
  return (
    <span className="inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs text-muted ring-1 ring-inset ring-border">
      <span aria-hidden="true" className={clsx("size-1.5 rounded-full", live ? "animate-pulse bg-success" : "bg-muted")} />
      {status === "off" ? t("feed.paused") : t("feed.live")}
    </span>
  );
}
