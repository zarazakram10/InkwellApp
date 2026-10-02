"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { TrashList } from "@/components/TrashList";
import { TRASH_RETENTION_DAYS } from "@/convex/lib/trash";

export default function TrashPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="font-sans text-xs uppercase tracking-[0.24em] text-muted">
          Your desk
        </p>
        <h1 className="mt-2 text-4xl">Trash</h1>
        <p className="mt-3 max-w-xl font-sans text-sm leading-6 text-muted">
          Documents here are permanently deleted {TRASH_RETENTION_DAYS} days
          after they are moved to trash.
        </p>
        <TrashList />
      </main>
    </div>
  );
}
