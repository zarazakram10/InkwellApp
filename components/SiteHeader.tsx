"use client";

import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export function SiteHeader({
  showAuthActions = true,
}: {
  showAuthActions?: boolean;
}) {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.current);

  return (
    <header className="flex items-center justify-between border-b border-line px-6 py-4">
      <Link href="/" className="text-xl tracking-tight">
        Folio
      </Link>
      {showAuthActions ? (
        <div className="flex items-center gap-3 font-sans text-sm text-muted">
          <Authenticated>
            {user?.email ? <span>{user.email}</span> : null}
            <Button variant="ghost" onClick={() => void signOut()}>
              Sign out
            </Button>
          </Authenticated>
          <Unauthenticated>
            <Link
              href="/login"
              className="rounded-2xl px-3 py-1.5 text-walnut hover:bg-stone"
            >
              Sign in
            </Link>
          </Unauthenticated>
        </div>
      ) : null}
    </header>
  );
}
