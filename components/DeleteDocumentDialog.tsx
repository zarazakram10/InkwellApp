"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { TRASH_RETENTION_DAYS } from "@/convex/lib/trash";

export function DeleteDocumentDialog({
  documentTitle,
  pending,
  error,
  onCancel,
  onConfirm,
}: {
  documentTitle: string;
  pending: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        onCancel();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, pending]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={() => {
        if (!pending) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-document-title"
        aria-describedby="delete-document-warning"
        className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-soft"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="delete-document-title" className="text-2xl leading-snug">
          Delete “{documentTitle}”?
        </h2>
        <p
          id="delete-document-warning"
          className="mt-3 font-sans text-sm leading-6 text-muted"
        >
          This document will be added to trash and will be permanently deleted
          in {TRASH_RETENTION_DAYS} days.
        </p>
        {error ? (
          <p className="mt-3 font-sans text-sm text-walnut">{error}</p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={pending}
            autoFocus
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={pending}>
            {pending ? "Moving to trash…" : "Move to trash"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
