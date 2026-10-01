"use client";

import Link from "next/link";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

export function LandingCta() {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <AuthLoading>
        <span className="font-sans text-sm text-muted">Preparing Folio…</span>
      </AuthLoading>
      <Unauthenticated>
        <Link
          href="/login"
          className="rounded-2xl bg-walnut px-5 py-2.5 text-paper shadow-soft hover:bg-walnut-dark"
        >
          Begin writing
        </Link>
      </Unauthenticated>
      <Authenticated>
        <Link
          href="/dashboard"
          className="rounded-2xl bg-walnut px-5 py-2.5 text-paper shadow-soft hover:bg-walnut-dark"
        >
          Open your desk
        </Link>
      </Authenticated>
    </div>
  );
}
