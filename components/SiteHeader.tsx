"use client";

import Link from "next/link";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { AccountMenu } from "@/components/AccountMenu";
import { AppMenu } from "@/components/AppMenu";

function GuestAuthLinks() {
  return (
    <>
      <Link
        href="/login"
        className="rounded-2xl border border-line bg-card px-3 py-1.5 text-ink shadow-soft hover:bg-stone"
      >
        Sign in
      </Link>
      <Link
        href="/login?flow=signUp"
        className="rounded-2xl bg-walnut px-3 py-1.5 text-paper shadow-soft hover:bg-walnut-dark"
      >
        Sign up
      </Link>
    </>
  );
}

export function SiteHeader({
  showAuthActions = true,
}: {
  showAuthActions?: boolean;
}) {
  return (
    <header className="relative z-20 flex items-center justify-between border-b border-line px-6 py-4">
      <div className="flex items-center gap-2">
        <Authenticated>
          <AppMenu />
        </Authenticated>
        <Link href="/" className="text-xl tracking-tight">
          Inkwell
        </Link>
      </div>
      {showAuthActions ? (
        <div className="flex shrink-0 items-center gap-3 font-sans text-sm text-muted">
          <Authenticated>
            <AccountMenu />
          </Authenticated>
          <AuthLoading>
            <GuestAuthLinks />
          </AuthLoading>
          <Unauthenticated>
            <GuestAuthLinks />
          </Unauthenticated>
        </div>
      ) : null}
    </header>
  );
}
