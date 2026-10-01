"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AiChat({
  documentId,
  onDocumentUpdate,
}: {
  documentId: Id<"documents">;
  onDocumentUpdate: (html: string) => void;
}) {
  const messages = useQuery(api.chat.listByDocument, { documentId });
  const sendMessage = useAction(api.ai.sendMessage);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || pending) {
      return;
    }
    setDraft("");
    setError(null);
    setPending(true);
    try {
      const result = await sendMessage({ documentId, message });
      onDocumentUpdate(result.content);
    } catch (caught) {
      const raw =
        caught instanceof Error
          ? caught.message
          : "The writing partner could not reply.";
      const match = raw.match(/Uncaught Error: ([^\n]+)/);
      setError(match?.[1] ?? raw);
    } finally {
      setPending(false);
    }
  }

  return (
    <aside className="flex h-full w-full flex-col border-l border-line bg-stone/70">
      <div className="border-b border-line px-4 py-4">
        <h2 className="text-lg">Writing partner</h2>
        <p className="mt-1 font-sans text-xs leading-5 text-muted">
          Ask Folio to draft or revise the page using your knowledge notes.
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto px-4 py-4">
        {messages === undefined ? (
          <p className="font-sans text-sm text-muted">Loading conversation…</p>
        ) : messages.length === 0 ? (
          <p className="font-sans text-sm text-muted">
            Try “Draft an opening from the notes on the left.”
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={
                message.role === "user"
                  ? "ml-6 rounded-2xl bg-walnut px-3 py-2 text-sm text-paper shadow-soft"
                  : "mr-6 rounded-2xl border border-line bg-card px-3 py-2 text-sm shadow-soft"
              }
            >
              {message.content}
            </div>
          ))
        )}
        {pending ? (
          <p className="font-sans text-xs text-muted">The partner is writing…</p>
        ) : null}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSubmit} className="space-y-2 border-t border-line p-4">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          placeholder="Ask Folio to write or edit this document"
        />
        {error ? <p className="font-sans text-xs text-walnut">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Writing…" : "Send"}
        </Button>
      </form>
    </aside>
  );
}
