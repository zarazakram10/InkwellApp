"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(event.currentTarget);
    try {
      await signIn("password", formData);
      router.replace("/dashboard");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {flow === "signUp" ? (
        <label className="block space-y-1.5">
          <span className="font-sans text-xs uppercase tracking-[0.16em] text-muted">
            Name
          </span>
          <Input name="name" placeholder="Ada Lovelace" autoComplete="name" />
        </label>
      ) : null}
      <label className="block space-y-1.5">
        <span className="font-sans text-xs uppercase tracking-[0.16em] text-muted">
          Email
        </span>
        <Input
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </label>
      <label className="block space-y-1.5">
        <span className="font-sans text-xs uppercase tracking-[0.16em] text-muted">
          Password
        </span>
        <Input
          name="password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete={flow === "signIn" ? "current-password" : "new-password"}
          required
          minLength={8}
        />
      </label>
      <input name="flow" type="hidden" value={flow} />
      {error ? <p className="text-sm text-walnut">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? "Please wait…"
          : flow === "signIn"
            ? "Sign in"
            : "Create account"}
      </Button>
      <button
        type="button"
        className="w-full text-center text-sm text-muted hover:text-ink"
        onClick={() => {
          setError(null);
          setFlow(flow === "signIn" ? "signUp" : "signIn");
        }}
      >
        {flow === "signIn"
          ? "Need an account? Create one"
          : "Already writing here? Sign in"}
      </button>
    </form>
  );
}
