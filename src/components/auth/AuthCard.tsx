import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="relative">
          {/* Offset sheet behind the card gives depth without a drop-shadow stack. */}
          <div aria-hidden="true" className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-[1.75rem] bg-surface-2" />
          <div className="relative rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
            <h1 className="font-display font-semibold tracking-tight text-4xl leading-[1.05]">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-muted">{footer}</p>
      </div>
    </main>
  );
}
