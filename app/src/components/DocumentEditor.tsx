"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { ShareDialog } from "@/components/ShareDialog";

type Role = "OWNER" | "EDITOR" | "VIEWER";
type SaveState = "idle" | "saving" | "saved" | "error";

export function DocumentEditor({
  documentId,
  ownerId,
  initialTitle,
  initialContent,
  role,
}: {
  documentId: string;
  ownerId: string;
  initialTitle: string;
  initialContent: string;
  role: Role;
}) {
  const readOnly = role === "VIEWER";
  const canShare = role === "OWNER";

  const [title, setTitle] = useState(initialTitle);
  const [titleSaveState, setTitleSaveState] = useState<SaveState>("idle");
  const [contentSaveState, setContentSaveState] = useState<SaveState>("idle");
  const [shareOpen, setShareOpen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savePatch = useCallback(
    async (patch: { title?: string; content?: string }, setState: (s: SaveState) => void) => {
      setState("saving");
      try {
        const res = await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error();
        setState("saved");
        setTimeout(() => setState("idle"), 1500);
      } catch {
        setState("error");
      }
    },
    [documentId]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: initialContent,
    editable: !readOnly,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-[60vh] focus:outline-none px-10 py-8",
      },
    },
    onUpdate: ({ editor }) => {
      if (readOnly) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        savePatch({ content: editor.getHTML() }, setContentSaveState);
      }, 1200);
    },
  });

  // Flush any pending autosave on unmount.
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function handleTitleBlur() {
    const trimmed = title.trim() || "Untitled document";
    if (trimmed !== initialTitle) {
      savePatch({ title: trimmed }, setTitleSaveState);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-10 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-black/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link href="/" className="shrink-0 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white" title="Back to documents">
              ←
            </Link>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              disabled={role === "VIEWER"}
              className="min-w-0 flex-1 truncate bg-transparent text-lg font-semibold tracking-tight outline-none disabled:opacity-80"
              aria-label="Document title"
            />
          </div>
          <div className="flex shrink-0 items-center gap-3 text-sm">
            <SaveIndicator state={readOnly ? "idle" : contentSaveState === "idle" ? titleSaveState : contentSaveState} readOnly={readOnly} />
            <RoleBadge role={role} />
            {canShare && (
              <button
                onClick={() => setShareOpen(true)}
                className="rounded-md bg-black px-3 py-1.5 text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                Share
              </button>
            )}
          </div>
        </div>
        {!readOnly && <Toolbar editor={editor} />}
      </div>

      <div className="mx-auto w-full max-w-4xl flex-1">
        <EditorContent editor={editor} />
      </div>

      {shareOpen && (
        <ShareDialog documentId={documentId} ownerId={ownerId} onClose={() => setShareOpen(false)} />
      )}
    </div>
  );
}

function SaveIndicator({ state, readOnly }: { state: SaveState; readOnly: boolean }) {
  if (readOnly) return <span className="text-black/40 dark:text-white/40">Read-only</span>;
  if (state === "saving") return <span className="text-black/40 dark:text-white/40">Saving…</span>;
  if (state === "saved") return <span className="text-green-600 dark:text-green-400">Saved</span>;
  if (state === "error") return <span className="text-red-600 dark:text-red-400">Save failed</span>;
  return <span className="text-black/30 dark:text-white/30">All changes saved</span>;
}

function RoleBadge({ role }: { role: Role }) {
  const label = role === "OWNER" ? "Owner" : role === "EDITOR" ? "Can edit" : "Can view";
  const classes =
    role === "OWNER"
      ? "bg-black/5 dark:bg-white/10"
      : role === "EDITOR"
      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
      : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>{label}</span>;
}

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded px-2.5 py-1.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 ${
        active ? "bg-black/10 dark:bg-white/15" : ""
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return <div className="h-11 border-b border-black/5 dark:border-white/5" />;

  return (
    <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-0.5 border-b border-black/5 px-4 py-1.5 dark:border-white/5">
      <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <span className="line-through">S</span>
      </ToolbarButton>

      <div className="mx-1.5 h-5 w-px bg-black/10 dark:bg-white/10" />

      <ToolbarButton
        label="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <ToolbarButton label="Paragraph" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}>
        ¶
      </ToolbarButton>

      <div className="mx-1.5 h-5 w-px bg-black/10 dark:bg-white/10" />

      <ToolbarButton
        label="Bulleted list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </ToolbarButton>
      <ToolbarButton
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        &ldquo;&rdquo;
      </ToolbarButton>
    </div>
  );
}
