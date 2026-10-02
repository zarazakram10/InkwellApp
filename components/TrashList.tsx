"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  daysUntilPermanentDeletion,
  TRASH_RETENTION_DAYS,
} from "@/convex/lib/trash";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function TrashList() {
  const documents = useQuery(api.documents.listTrashed);
  const restore = useMutation(api.documents.restore);
  const [pendingId, setPendingId] = useState<Id<"documents"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (documents === undefined) {
    return <p className="mt-12 text-muted">Opening the trash…</p>;
  }

  if (documents.length === 0) {
    return (
      <div className="mt-16 rounded-2xl border border-dashed border-line bg-card px-8 py-16 text-center shadow-soft">
        <h2 className="text-2xl">Trash is empty</h2>
        <p className="mt-2 text-muted">
          Deleted documents wait here for {TRASH_RETENTION_DAYS} days.
        </p>
      </div>
    );
  }

  async function handleRestore(documentId: Id<"documents">) {
    setPendingId(documentId);
    setError(null);
    try {
      await restore({ documentId });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not restore this document.",
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      {error ? (
        <p className="mt-6 font-sans text-sm text-walnut">{error}</p>
      ) : null}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((document) => {
          const days =
            document.trashedAt === undefined
              ? 0
              : daysUntilPermanentDeletion(document.trashedAt);
          return (
            <Card key={document._id} className="p-5">
              <h3 className="text-xl leading-snug">{document.title}</h3>
              <p className="mt-2 font-sans text-sm text-muted">
                {days === 0
                  ? "Will be permanently deleted soon."
                  : `Permanently deleted in ${days} day${days === 1 ? "" : "s"}.`}
              </p>
              <Button
                variant="secondary"
                className="mt-6"
                disabled={pendingId === document._id}
                onClick={() => void handleRestore(document._id)}
              >
                {pendingId === document._id ? "Restoring…" : "Restore"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
