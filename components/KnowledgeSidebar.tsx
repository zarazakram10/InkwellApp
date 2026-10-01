"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function KnowledgeSidebar({
  documentId,
}: {
  documentId: Id<"documents">;
}) {
  const items = useQuery(api.knowledge.listByDocument, { documentId });
  const add = useMutation(api.knowledge.add);
  const update = useMutation(api.knowledge.update);
  const remove = useMutation(api.knowledge.remove);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<Id<"knowledgeItems"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await update({ knowledgeId: editingId, title, body });
        setEditingId(null);
      } else {
        await add({ documentId, title, body });
      }
      setTitle("");
      setBody("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not save knowledge.",
      );
    }
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-line bg-stone/70">
      <div className="border-b border-line px-4 py-4">
        <h2 className="text-lg">Knowledge</h2>
        <p className="mt-1 font-sans text-xs leading-5 text-muted">
          Plain-text notes the writing partner can use as context.
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto px-4 py-4">
        {items === undefined ? (
          <p className="font-sans text-sm text-muted">Loading notes…</p>
        ) : items.length === 0 ? (
          <p className="font-sans text-sm text-muted">
            Add a source, quote, or brief so the assistant can write from it.
          </p>
        ) : (
          items.map((item) => (
            <article
              key={item._id}
              className="rounded-2xl border border-line bg-card p-3 shadow-soft"
            >
              <h3 className="text-base">{item.title}</h3>
              <p className="mt-1 whitespace-pre-wrap font-sans text-sm leading-6 text-muted">
                {item.body}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="font-sans text-xs text-walnut hover:underline"
                  onClick={() => {
                    setEditingId(item._id);
                    setTitle(item.title);
                    setBody(item.body);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="font-sans text-xs text-muted hover:text-ink"
                  onClick={() => void remove({ knowledgeId: item._id })}
                >
                  Remove
                </button>
              </div>
            </article>
          ))
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-2 border-t border-line p-4">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Note title"
        />
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          placeholder="Paste or write the source text"
        />
        {error ? <p className="font-sans text-xs text-walnut">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            {editingId ? "Update note" : "Add knowledge"}
          </Button>
          {editingId ? (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                setTitle("");
                setBody("");
              }}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </aside>
  );
}
