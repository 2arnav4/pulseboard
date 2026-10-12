"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { AuthCard } from "./AuthCard";
import { TextField } from "./TextField";

export function SignupForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? t("state.genericError"));
      }
      const result = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (!result || result.error) throw new Error(t("state.genericError"));
      // New users land on Settings to pick their interests first.
      router.replace("/settings");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("state.genericError"));
      setPending(false);
    }
  };

  return (
    <AuthCard
      title={t("auth.signupTitle")}
      subtitle={t("auth.signupSubtitle")}
      footer={
        <>
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="font-medium text-accent underline-offset-4 hover:underline">
            {t("auth.login")}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        <TextField id="name" label={t("auth.name")} autoComplete="name" required minLength={2} maxLength={50} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <TextField id="email" label={t("auth.email")} type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <TextField
          id="password"
          label={t("auth.password")}
          help={t("auth.passwordHelp")}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        <p role="alert" className="min-h-5 text-sm text-danger">
          {error}
        </p>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t("auth.signingUp") : t("auth.signup")}
        </Button>
      </form>
    </AuthCard>
  );
}
