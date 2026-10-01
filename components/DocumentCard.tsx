"use client";

import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { formatRelativeTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DocumentCard({ document }: { document: Doc<"documents"> }) {
  const remove = useMutation(api.documents.remove);

  return (
    <Card className="flex flex-col justify-between p-5 transition hover:-translate-y-0.5">
      <div>
        <Link
          href={`/documents/${document._id}`}
          className="block text-xl leading-snug hover:text-walnut"
        >
          {document.title}
        </Link>
        <p className="mt-2 font-sans text-sm text-muted">
          Saved {formatRelativeTime(document.updatedAt)}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Link
          href={`/documents/${document._id}`}
          className="font-sans text-sm text-walnut hover:underline"
        >
          Open
        </Link>
        <Button
          variant="ghost"
          className="px-2 py-1 text-xs"
          onClick={() => void remove({ documentId: document._id })}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}
