"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { AuthCard } from "./AuthCard";
import { TextField } from "./TextField";

const DEMO = { email: "demo@pulseboard.app", password: "pulseboard-demo" };

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const login = async (credentials: { email: string; password: string }) => {
    setPending(true);
    setError(null);
    try {
      const result = await signIn("credentials", { ...credentials, redirect: false });
      if (!result || result.error) {
        setError(t("auth.invalid"));
        setPending(false);
        return;
      }
      // refresh() re-renders the server layouts so they (and SessionProvider) pick up the new session cookie.
      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setError(t("state.genericError"));
      setPending(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void login({ email, password });
  };

  return (
    <AuthCard
      title={t("auth.loginTitle")}
      subtitle={t("auth.loginSubtitle")}
      footer={
        <>
          {t("auth.noAccount")}{" "}
          <Link href="/signup" className="font-medium text-text underline decoration-border underline-offset-4 hover:decoration-text">
            {t("auth.signup")}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        <TextField id="email" label={t("auth.email")} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        <TextField
          id="password"
          label={t("auth.password")}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <p role="alert" className="min-h-5 text-sm text-danger">
          {error}
        </p>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t("auth.loggingIn") : t("auth.login")}
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted">
        <span className="h-px flex-1 bg-border" />
        {t("auth.or")}
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button variant="secondary" className="w-full" disabled={pending} onClick={() => void login(DEMO)}>
        {t("auth.demo")}
      </Button>
    </AuthCard>
  );
}
