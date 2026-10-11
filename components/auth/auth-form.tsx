"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useGuestLogin } from "@/hooks/useGuestLogin";
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
    // A sign-up that needs email confirmation returns no session.
    if (!login && !data.session) {
      setSent(true);
      return;
    }
    router.refresh();
    router.push("/studio");
  };

  if (sent) {
    return (
      <Shell>
        <h1 className="text-[28px] font-medium leading-tight tracking-[-0.02em]">
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
      <h1 className="text-[28px] font-medium leading-tight tracking-[-0.02em]">
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
        {errors.form && (
          <p role="alert" className="text-[13px] text-poor">
            {errors.form}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? (
            <Spinner
              className="size-4 border-black border-r-transparent"
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
    <main className="flex min-h-dvh flex-col px-6">
      <header className="mx-auto flex h-16 w-full max-w-[1200px] items-center">
        <Link href="/" className="rounded-control">
          <Logo />
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center pb-24">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </main>
  );
}
