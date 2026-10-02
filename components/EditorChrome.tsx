"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { AppMenu } from "@/components/AppMenu";
import { DeleteDocumentDialog } from "@/components/DeleteDocumentDialog";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";

export function EditorChrome({
  document,
  saveState,
}: {
  document: Doc<"documents">;
  saveState: "saved" | "saving" | "idle";
}) {
  const router = useRouter();
  const rename = useMutation(api.documents.rename);
  const trash = useMutation(api.documents.trash);
  const [title, setTitle] = useState(document.title);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  async function handleDelete() {
    const nextTitle = title.trim() || "Untitled";
    setDeleting(true);
    setDeleteError(null);
    try {
      if (nextTitle !== document.title) {
        await rename({ documentId: document._id, title: nextTitle });
      }
      await trash({ documentId: document._id });
      router.push("/dashboard");
    } catch (caught) {
      setDeleting(false);
      setDeleteError(
        caught instanceof Error
          ? caught.message
          : "Could not move this document to trash.",
      );
    }
  }

  const status =
    saveState === "saving"
      ? "Saving…"
      : `Saved ${formatTime(document.updatedAt)}`;

  return (
    <header className="grid grid-cols-[1fr_minmax(0,2fr)_1fr] items-center gap-3 border-b border-line bg-paper px-4 py-3">
      <div className="flex min-w-0 items-center gap-1">
        <AppMenu />
        <Link
          href="/dashboard"
          className="hidden truncate font-sans text-sm text-muted hover:text-ink sm:inline"
        >
          Back to desk
        </Link>
      </div>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="w-full bg-transparent text-center text-xl outline-none"
        aria-label="Document title"
      />
      <div className="flex items-center justify-end gap-2">
        <p className="font-sans text-xs text-muted">{status}</p>
        <Button
          variant="ghost"
          className="px-2 py-1 text-xs"
          disabled={deleting}
          onClick={() => {
            setDeleteError(null);
            setConfirming(true);
          }}
        >
          Delete
        </Button>
      </div>
      {confirming ? (
        <DeleteDocumentDialog
          documentTitle={title.trim() || "Untitled"}
          pending={deleting}
          error={deleteError}
          onCancel={() => {
            if (!deleting) {
              setConfirming(false);
            }
          }}
          onConfirm={() => void handleDelete()}
        />
      ) : null}
    </header>
  );
}
