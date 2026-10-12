"use client";

import { Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import { Avatar, AVATAR_CLASSES } from "@/components/layout/Avatar";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { AVATAR_COLORS, type AvatarColor } from "@/types/user";

interface Profile {
  name: string;
  email: string;
  bio: string;
  avatarColor: AvatarColor;
  createdAt: string;
}

type LoadState = { status: "loading" } | { status: "error" } | { status: "ready"; profile: Profile };

const BIO_MAX = 160;

/** Lets the signed-in user edit their display name, bio and avatar color (PATCH /api/profile). */
export function ProfileForm() {
  const { t, i18n } = useTranslation();
  const { update } = useSession();
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [form, setForm] = useState({ name: "", bio: "", avatarColor: "indigo" as AvatarColor });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/profile", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        const { user } = (await response.json()) as { user: Profile };
        setForm({ name: user.name, bio: user.bio, avatarColor: user.avatarColor });
        setLoad({ status: "ready", profile: user });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error("[profile] load failed", error);
          setLoad({ status: "error" });
        }
      });
    return () => controller.abort();
  }, [attempt]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = (await response.json()) as { user?: Profile; error?: string };
      if (!response.ok || !body.user) throw new Error(body.error ?? t("state.genericError"));
      await update({ name: body.user.name, avatarColor: body.user.avatarColor });
      setMessage({ kind: "success", text: t("profile.saved") });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : t("state.genericError") });
    } finally {
      setSaving(false);
    }
  };

  if (load.status === "loading") return <Spinner label={t("state.loading")} />;
  if (load.status === "error") return <ErrorState onRetry={() => { setLoad({ status: "loading" }); setAttempt((value) => value + 1); }} />;

  const memberSince = new Intl.DateTimeFormat(i18n.language, { dateStyle: "long" }).format(new Date(load.profile.createdAt));

  return (
    <div>
      <PageHeader title={t("profile.title")} subtitle={t("profile.subtitle")} />
      <form onSubmit={onSubmit} noValidate className="grid max-w-2xl gap-6 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar name={form.name || load.profile.email} color={form.avatarColor} size="lg" />
          <div>
            <p className="font-semibold">{form.name}</p>
            <p className="text-sm text-muted">{t("profile.memberSince", { date: memberSince })}</p>
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="profile-name" className="text-sm font-medium">{t("profile.name")}</label>
          <input
            id="profile-name"
            required
            minLength={2}
            maxLength={50}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="h-11 rounded-xl border border-border bg-surface-2 px-3 text-sm focus:border-accent focus:outline-none"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="profile-email" className="text-sm font-medium">{t("profile.email")}</label>
          <input id="profile-email" value={load.profile.email} readOnly className="h-11 rounded-xl border border-border bg-surface-2 px-3 text-sm text-muted" />
        </div>

        <div className="grid gap-2">
          <label htmlFor="profile-bio" className="text-sm font-medium">{t("profile.bio")}</label>
          <textarea
            id="profile-bio"
            rows={3}
            maxLength={BIO_MAX}
            aria-describedby="profile-bio-help"
            value={form.bio}
            onChange={(event) => setForm({ ...form, bio: event.target.value })}
            className="rounded-xl border border-border bg-surface-2 p-3 text-sm focus:border-accent focus:outline-none"
          />
          <p id="profile-bio-help" className="text-xs text-muted">
            {t("profile.bioHelp")} ({form.bio.length}/{BIO_MAX})
          </p>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t("profile.avatarColor")}</legend>
          <div className="flex flex-wrap gap-3">
            {AVATAR_COLORS.map((color) => (
              <label key={color} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="avatarColor"
                  value={color}
                  checked={form.avatarColor === color}
                  onChange={() => setForm({ ...form, avatarColor: color })}
                  className="peer sr-only"
                />
                <span className="sr-only">{color}</span>
                <span
                  aria-hidden="true"
                  className={clsx(
                    "flex size-10 items-center justify-center rounded-full text-white ring-offset-2 ring-offset-surface peer-checked:ring-2 peer-checked:ring-text peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-ring",
                    AVATAR_CLASSES[color],
                  )}
                >
                  {form.avatarColor === color && <Check className="size-5" />}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={saving || form.name.trim().length < 2}>
            {saving ? t("profile.saving") : t("profile.save")}
          </Button>
          <p role="status" className={clsx("text-sm", message?.kind === "error" ? "text-danger" : "text-success")}>
            {message?.text}
          </p>
        </div>
      </form>
    </div>
  );
}
