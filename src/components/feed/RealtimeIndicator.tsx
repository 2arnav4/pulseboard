"use client";

import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import type { RealtimeStatus } from "@/hooks/useRealtimeFeed";

export function RealtimeIndicator({ status }: { status: RealtimeStatus }) {
  const { t } = useTranslation();
  const live = status === "live";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
      <span className="relative flex size-2.5" aria-hidden="true">
        {live && <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />}
        <span className={clsx("relative inline-flex size-2.5 rounded-full", live ? "bg-success" : "bg-muted")} />
      </span>
      {status === "off" ? t("feed.paused") : t("feed.live")}
    </span>
  );
}
