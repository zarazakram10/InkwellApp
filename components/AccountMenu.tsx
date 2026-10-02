"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

function accountLabel(user: { name?: string; email?: string } | null | undefined) {
  const name = user?.name?.trim();
  if (name) {
    return name;
  }
  if (user?.email) {
    return user.email;
  }
  return "Account";
}

export function AccountMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.current);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleSignOut() {
    setPending(true);
    try {
      await signOut();
      router.push("/");
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  if (user === undefined) {
    return (
      <span
        className="inline-block h-10 w-28 animate-pulse rounded-2xl bg-stone"
        aria-hidden
      />
    );
  }

  const label = accountLabel(user);
  const initial = label.charAt(0).toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-2xl border border-line bg-card py-1 pl-1 pr-3 text-ink shadow-soft hover:bg-stone"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex size-8 items-center justify-center rounded-xl bg-walnut font-sans text-sm text-paper">
          {initial}
        </span>
        <span className="hidden max-w-40 truncate font-sans text-sm sm:inline">
          {label}
        </span>
        <svg
          viewBox="0 0 20 20"
          className={cn(
            "size-4 text-muted transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-2xl border border-line bg-card py-1 font-sans text-sm shadow-soft"
        >
          <Link
            href="/profile"
            role="menuitem"
            className="block px-4 py-2.5 text-ink hover:bg-stone"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-4 py-2.5 text-left text-ink hover:bg-stone disabled:opacity-60"
            disabled={pending}
            onClick={() => void handleSignOut()}
          >
            {pending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
