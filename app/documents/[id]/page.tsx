"use client";

import { use, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AiChat } from "@/components/AiChat";
import { EditorChrome } from "@/components/EditorChrome";
import { KnowledgeSidebar } from "@/components/KnowledgeSidebar";
import { RichTextEditor } from "@/components/RichTextEditor";

export default function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const documentId = id as Id<"documents">;
  const document = useQuery(api.documents.get, { documentId });
  const saveContent = useMutation(api.documents.saveContent);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [appliedContent, setAppliedContent] = useState<
    { html: string; revision: number } | undefined
  >(undefined);
  const [mobilePane, setMobilePane] = useState<"knowledge" | "page" | "chat">(
    "page",
  );

  useEffect(() => {
    if (pendingContent === null) {
      return;
    }
    setSaveState("saving");
    const timeout = window.setTimeout(() => {
      void saveContent({ documentId, content: pendingContent })
        .then(() => {
          setPendingContent(null);
          setSaveState("saved");
        })
        .catch(() => {
          setSaveState("idle");
        });
    }, 800);
    return () => window.clearTimeout(timeout);
  }, [documentId, pendingContent, saveContent]);

  if (document === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Opening the page…
      </div>
    );
  }

  if (document === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        This document could not be found.
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <EditorChrome document={document} saveState={saveState} />
      <div className="flex gap-2 border-b border-line px-4 py-2 lg:hidden">
        {(
          [
            ["knowledge", "Knowledge"],
            ["page", "Page"],
            ["chat", "Partner"],
          ] as const
        ).map(([pane, label]) => (
          <button
            key={pane}
            type="button"
            onClick={() => setMobilePane(pane)}
            className={`rounded-xl px-3 py-1 font-sans text-xs ${
              mobilePane === pane ? "bg-stone text-ink" : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[18rem_minmax(0,1fr)_20rem]">
        <div
          className={mobilePane === "knowledge" ? "min-h-0" : "hidden lg:block"}
        >
          <KnowledgeSidebar documentId={documentId} />
        </div>
        <div
          className={`min-h-0 overflow-auto px-4 py-4 md:px-8 ${
            mobilePane === "page" ? "" : "hidden lg:block"
          }`}
        >
          <RichTextEditor
            initialContent={document.content}
            appliedContent={appliedContent}
            onChange={(html) => {
              setPendingContent(html);
              setSaveState("saving");
            }}
          />
        </div>
        <div className={mobilePane === "chat" ? "min-h-0" : "hidden lg:block"}>
          <AiChat
            documentId={documentId}
            onDocumentUpdate={(html) => {
              setAppliedContent((current) => ({
                html,
                revision: (current?.revision ?? 0) + 1,
              }));
              setPendingContent(null);
              setSaveState("saved");
            }}
          />
        </div>
      </div>
    </div>
  );
}
