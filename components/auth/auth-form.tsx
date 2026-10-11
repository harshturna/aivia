"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { ForestPlate } from "@/components/forest-plate";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useGuestLogin } from "@/hooks/useGuestLogin";
import {
  claimLocalSessions,
  listLocalSessions,
  setClaimPending,
} from "@/lib/guest-local";
import { createClient } from "@/lib/supabase/client";

/**
 * Sign in and sign up (design §10): the wordmark, one line, two fields, the button, a link
 * to the other page and a quiet way in as a guest. Errors sit under the field they belong to.
 */
export function AuthForm({ kind }: { kind: "login" | "signup" }) {
  const router = useRouter();
  const { guestHandler, isGuestLoading } = useGuestLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  // what this browser made as a guest, and whether it comes along (TICKET-043)
  const [kept, setKept] = useState(0);
  const [bring, setBring] = useState(true);
  useEffect(() => setKept(listLocalSessions().length), []);
  const login = kind === "login";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email))
      next.email = "Enter an email address, like you@example.com.";
    if (!password) next.password = "Enter a password.";
    else if (!login && password.length < 8)
      next.password = "Use at least 8 characters.";
    setErrors(next);
    if (next.email || next.password) {
      document
        .getElementById(next.email ? "auth-email" : "auth-password")
        ?.focus();
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { data, error } = login
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) {
      setErrors({
        form: login
          ? "That email and password do not match. Try again, or create an account."
          : error.message,
      });
      return;
    }
    // A sign-up that needs email confirmation returns no session; the work comes along
    // on the first signed-in load instead.
    if (!login && !data.session) {
      setClaimPending(kept > 0 && bring);
      setSent(true);
      return;
    }
    // a guest's work kept in this browser moves into the account (TICKET-041)
    // signed in here: this form's choice replaces any left from an earlier sign-up
    setClaimPending(false);
    const claimed = kept > 0 && bring ? await claimLocalSessions() : null;
    router.refresh();
    router.push(claimed ? `/studio/${claimed}` : "/studio");
  };

  if (sent) {
    return (
      <Shell>
        <h1 className="font-display text-[44px] font-medium leading-[1.02] tracking-[-0.01em]">
          Check your email
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-fg-2">
          We sent a link to {email}. Open it to finish creating your account.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block text-[13.5px] text-fg underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="font-display text-[44px] font-medium leading-[1.02] tracking-[-0.01em]">
        {login ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-[14px] text-fg-2">
        {login
          ? "Sign in to pick up where you left off."
          : "Keep everything you make, and make more of it."}
      </p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-4">
        <div className="grid gap-1.5">
          <label htmlFor="auth-email" className="text-[13px] text-fg-2">
            Email
          </label>
          <Input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com…"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "auth-email-error" : undefined}
          />
          {errors.email && (
            <p id="auth-email-error" className="text-[12.5px] text-poor">
              {errors.email}
            </p>
          )}
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="auth-password" className="text-[13px] text-fg-2">
            Password
          </label>
          <Input
            id="auth-password"
            name="password"
            type="password"
            autoComplete={login ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "auth-password-error" : undefined
            }
          />
          {errors.password && (
            <p id="auth-password-error" className="text-[12.5px] text-poor">
              {errors.password}
            </p>
          )}
        </div>
        {kept > 0 && (
          <label className="flex items-start gap-2.5 text-[13.5px] leading-5 text-fg-2">
            <input
              type="checkbox"
              checked={bring}
              onChange={(e) => setBring(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-primary"
            />
            <span>
              Bring the {kept === 1 ? "session" : `${kept} sessions`} you made
              as a guest in this browser
            </span>
          </label>
        )}
        {errors.form && (
          <p role="alert" className="text-[13px] text-poor">
            {errors.form}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? (
            <Spinner
              className="size-4 border-primary-foreground border-r-transparent"
              label="Signing in"
            />
          ) : login ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="mt-6 text-[13.5px] text-fg-2">
        {login ? "New to Aivia? " : "Already have an account? "}
        <Link
          href={login ? "/signup" : "/login"}
          className="text-fg underline underline-offset-4"
        >
          {login ? "Create an account" : "Sign in"}
        </Link>
      </p>
      <div className="mt-8 border-t border-border pt-6">
        <button
          type="button"
          onClick={() => guestHandler()}
          disabled={isGuestLoading}
          className="inline-flex items-center gap-2 text-[13.5px] text-fg-2 transition-colors hover:text-fg disabled:opacity-60"
        >
          {isGuestLoading && <Spinner className="size-3.5" />}
          Try it as a guest, no account needed
        </button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden px-6">
      {/* the forest from the landing, darkened on the side the form sits */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <ForestPlate />
        <div className="absolute inset-0 bg-linear-to-r from-bg/90 via-bg/70 via-45% to-bg/25 max-sm:bg-bg/70" />
      </div>
      <header className="mx-auto flex h-16 w-full max-w-[1200px] items-center">
        <Link href="/" className="rounded-control">
          <Logo />
        </Link>
      </header>
      <div className="flex flex-1 items-center pb-20">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="w-full max-w-[440px] rounded-window border border-border bg-bg/75 p-7 shadow-float sm:p-10">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
