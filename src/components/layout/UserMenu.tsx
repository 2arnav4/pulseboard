"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "./Avatar";

/** Account info + disclosure menu. Closes on Escape, outside click, or navigation. */
export function UserMenu() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!session?.user) return null;
  const { name, email, avatarColor } = session.user;
  const displayName = name ?? email ?? "";

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="user-menu"
        aria-label={t("header.account")}
        className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-surface-2 sm:pr-3"
      >
        <Avatar name={displayName} color={avatarColor} />
        <span className="hidden max-w-32 truncate text-sm font-medium sm:block">{displayName}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="user-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-border bg-surface p-2 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.18)]"
          >
            <div className="border-b border-border px-3 pb-3 pt-1">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              {email && <p className="truncate text-xs text-muted">{email}</p>}
            </div>
            <ul className="pt-2">
              <li>
                <Link href="/profile" onClick={() => setOpen(false)} className="flex min-h-10 items-center rounded-xl px-3 text-sm hover:bg-surface-2">
                  {t("nav.profile")}
                </Link>
              </li>
              <li>
                <Link href="/settings" onClick={() => setOpen(false)} className="flex min-h-10 items-center rounded-xl px-3 text-sm hover:bg-surface-2">
                  {t("nav.settings")}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => void signOut({ redirectTo: "/login" })}
                  className="flex min-h-10 w-full items-center rounded-xl px-3 text-sm text-danger hover:bg-surface-2"
                >
                  {t("header.signOut")}
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
