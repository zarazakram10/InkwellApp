"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl px-2.5 py-1 font-sans text-xs tracking-wide",
        active ? "bg-stone text-ink" : "text-muted hover:bg-stone hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  initialContent,
  appliedContent,
  onChange,
}: {
  initialContent: string;
  appliedContent?: { html: string; revision: number };
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
      }),
      Placeholder.configure({
        placeholder: "Begin the page…",
      }),
    ],
    content: initialContent || "<p></p>",
    editorProps: {
      attributes: {
        class: "tiptap min-h-[28rem] text-lg leading-8",
      },
    },
    onUpdate: ({ editor: nextEditor }) => {
      onChange(nextEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || !appliedContent) {
      return;
    }
    const current = editor.getHTML();
    if (current !== appliedContent.html) {
      editor.commands.setContent(appliedContent.html, { emitUpdate: false });
    }
  }, [appliedContent, editor]);

  if (!editor) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-muted shadow-soft">
        Opening the page…
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap gap-1 rounded-2xl border border-line bg-card px-2 py-2 shadow-soft">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          Underline
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          Title
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          Heading
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          List
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbers
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
          Undo
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
          Redo
        </ToolbarButton>
      </div>
      <div className="min-h-0 flex-1 overflow-auto rounded-2xl border border-line bg-card px-8 py-10 shadow-soft md:px-12">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
