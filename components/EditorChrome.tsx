"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { formatTime } from "@/lib/utils";

export function EditorChrome({
  document,
  saveState,
}: {
  document: Doc<"documents">;
  saveState: "saved" | "saving" | "idle";
}) {
  const rename = useMutation(api.documents.rename);
  const [title, setTitle] = useState(document.title);

  useEffect(() => {
    setTitle(document.title);
  }, [document.title]);

  useEffect(() => {
    if (title === document.title) {
      return;
    }
    const timeout = window.setTimeout(() => {
      void rename({ documentId: document._id, title });
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [document._id, document.title, rename, title]);

  const status =
    saveState === "saving"
      ? "Saving…"
      : `Saved ${formatTime(document.updatedAt)}`;

  return (
    <header className="grid grid-cols-[1fr_minmax(0,2fr)_1fr] items-center gap-3 border-b border-line bg-paper px-4 py-3">
      <Link
        href="/dashboard"
        className="font-sans text-sm text-muted hover:text-ink"
      >
        Back to desk
      </Link>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="w-full bg-transparent text-center text-xl outline-none"
        aria-label="Document title"
      />
      <p className="text-right font-sans text-xs text-muted">{status}</p>
    </header>
  );
}
