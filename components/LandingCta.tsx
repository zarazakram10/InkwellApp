"use client";

import Link from "next/link";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

function GuestActions() {
  return (
    <>
      <Link
        href="/login?flow=signUp"
        className="rounded-2xl bg-walnut px-5 py-2.5 font-sans text-sm text-paper shadow-soft hover:bg-walnut-dark"
      >
        Sign up
      </Link>
      <Link
        href="/login"
        className="rounded-2xl border border-line bg-card px-5 py-2.5 font-sans text-sm text-ink shadow-soft hover:bg-stone"
      >
        Sign in
      </Link>
    </>
  );
}

export function LandingCta() {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <AuthLoading>
        <GuestActions />
      </AuthLoading>
      <Unauthenticated>
        <GuestActions />
      </Unauthenticated>
      <Authenticated>
        <Link
          href="/dashboard"
          className="rounded-2xl bg-walnut px-5 py-2.5 font-sans text-sm text-paper shadow-soft hover:bg-walnut-dark"
        >
          Open your desk
        </Link>
      </Authenticated>
    </div>
  );
}
