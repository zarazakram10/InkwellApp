"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DocumentCard } from "@/components/DocumentCard";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const documents = useQuery(api.documents.list);
  const create = useMutation(api.documents.create);

  async function handleCreate() {
    const documentId = await create();
    router.push(`/documents/${documentId}`);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.24em] text-muted">
              Your desk
            </p>
            <h1 className="mt-2 text-4xl">Documents</h1>
          </div>
          <Button onClick={() => void handleCreate()}>New document</Button>
        </div>
        {documents === undefined ? (
          <p className="mt-12 text-muted">Opening your papers…</p>
        ) : documents.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-line bg-card px-8 py-16 text-center shadow-soft">
            <h2 className="text-2xl">A blank desk</h2>
            <p className="mt-2 text-muted">
              Start a document, add a few notes, and write with your partner.
            </p>
            <Button className="mt-6" onClick={() => void handleCreate()}>
              Create your first document
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => (
              <DocumentCard key={document._id} document={document} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
