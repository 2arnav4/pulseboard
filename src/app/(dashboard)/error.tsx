"use client";

import { ErrorState } from "@/components/ui/ErrorState";

/** Catches render errors in any dashboard section without taking down the sidebar/header. */
export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState onRetry={reset} />;
}
