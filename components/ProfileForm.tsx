"use client";

import { FormEvent, useEffect, useState } from "react";
import { ConvexError } from "convex/values";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function errorMessage(caught: unknown) {
  if (caught instanceof ConvexError && typeof caught.data === "string") {
    return caught.data;
  }
  return "Could not save your profile.";
}

export function ProfileForm() {
  const user = useQuery(api.users.current);
  const updateProfile = useMutation(api.users.updateProfile);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user && !ready) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setReady(true);
    }
  }, [ready, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setPending(true);
    try {
      await updateProfile({ name, email });
      setSaved(true);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  if (user === undefined || !ready) {
    return <p className="text-muted">Opening your profile…</p>;
  }

  if (user === null) {
    return <p className="text-muted">Sign in to edit your profile.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="font-sans text-xs uppercase tracking-[0.16em] text-muted">
          Name
        </span>
        <Input
          name="name"
          value={name}
          onChange={(event) => {
            setSaved(false);
            setName(event.target.value);
          }}
          placeholder="Ada Lovelace"
          autoComplete="name"
          maxLength={80}
        />
      </label>
      <label className="block space-y-1.5">
        <span className="font-sans text-xs uppercase tracking-[0.16em] text-muted">
          Email
        </span>
        <Input
          name="email"
          type="email"
          value={email}
          onChange={(event) => {
            setSaved(false);
            setEmail(event.target.value);
          }}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <span className="block font-sans text-xs text-muted">
          This is the email you use to sign in.
        </span>
      </label>
      {error ? <p className="text-sm text-walnut">{error}</p> : null}
      {saved ? (
        <p className="font-sans text-sm text-muted">Profile saved.</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
