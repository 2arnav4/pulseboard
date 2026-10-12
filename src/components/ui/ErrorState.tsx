"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";

interface ErrorStateProps {
  onRetry?: () => void;
  title?: string;
  body?: string;
}

export function ErrorState({ onRetry, title, body }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-danger/40 bg-surface px-6 py-12 text-center">
      <AlertTriangle aria-hidden="true" className="mb-3 size-10 text-danger" />
      <h2 className="text-lg font-semibold">{title ?? t("state.errorTitle")}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted">{body ?? t("state.errorBody")}</p>
      {onRetry && (
        <Button className="mt-5" onClick={onRetry}>
          <RefreshCw aria-hidden="true" className="size-4" />
          {t("state.retry")}
        </Button>
      )}
    </div>
  );
}
