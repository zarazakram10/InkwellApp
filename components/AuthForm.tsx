"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({
  initialFlow = "signIn",
}: {
  initialFlow?: "signIn" | "signUp";
}) {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">(initialFlow);
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
      <div>
        <h1 className="text-3xl">
          {flow === "signUp" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-muted">
          {flow === "signUp"
            ? "Sign up to keep your documents and notes."
            : "Sign in to open your documents and notes."}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-stone p-1">
        <button
          type="button"
          className={`rounded-xl px-3 py-2 text-sm ${
            flow === "signIn"
              ? "bg-card text-ink shadow-soft"
              : "text-muted hover:text-ink"
          }`}
          onClick={() => {
            setError(null);
            setFlow("signIn");
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`rounded-xl px-3 py-2 text-sm ${
            flow === "signUp"
              ? "bg-card text-ink shadow-soft"
              : "text-muted hover:text-ink"
          }`}
          onClick={() => {
            setError(null);
            setFlow("signUp");
          }}
        >
          Sign up
        </button>
      </div>
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
        {pending ? "Please wait…" : flow === "signIn" ? "Sign in" : "Sign up"}
      </Button>
    </form>
  );
}
