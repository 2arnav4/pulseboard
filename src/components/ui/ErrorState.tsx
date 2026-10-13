"use client";

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
    <div role="alert" className="flex flex-col items-center rounded-3xl border border-danger/30 px-6 py-14 text-center">
      <h2 className="font-display font-semibold tracking-tight text-3xl">{title ?? t("state.errorTitle")}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{body ?? t("state.errorBody")}</p>
      {onRetry && (
        <Button className="mt-6" onClick={onRetry}>
          {t("state.retry")}
        </Button>
      )}
    </div>
  );
}
