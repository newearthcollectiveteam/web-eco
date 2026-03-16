"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  History,
  Bold,
  Italic,
  Heading2,
  ListIcon,
  ListOrdered,
  CheckCircle2,
  Circle,
  Minus,
  Tag,
  ArrowUpDown,
} from "lucide-react";
import { api } from "~/trpc/react";

// ─── Rich Text Toolbar ──────────────────────────────────────

function FormattingToolbar({
  textareaRef,
  value,
  onChange,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (val: string) => void;
}) {
  const insertAtCursor = useCallback(
    (before: string, after = "", placeholder = "") => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = value.slice(start, end);
      const text = selected || placeholder;
      const newValue =
        value.slice(0, start) + before + text + after + value.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.focus();
        const cursorPos = start + before.length + text.length;
        ta.setSelectionRange(
          selected ? cursorPos + after.length : start + before.length,
          selected
            ? cursorPos + after.length
            : start + before.length + text.length
        );
      });
    },
    [textareaRef, value, onChange]
  );

  const insertLine = useCallback(
    (prefix: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = value.indexOf("\n", start);
      const end = lineEnd === -1 ? value.length : lineEnd;
      const line = value.slice(lineStart, end);

      if (line.startsWith(prefix)) {
        const newValue =
          value.slice(0, lineStart) + line.slice(prefix.length) + value.slice(end);
        onChange(newValue);
      } else {
        const newValue =
          value.slice(0, lineStart) + prefix + line + value.slice(end);
        onChange(newValue);
      }
      requestAnimationFrame(() => ta.focus());
    },
    [textareaRef, value, onChange]
  );

  return (
    <div className="flex items-center gap-0.5 border-b border-white/5 px-2 py-1">
      <button type="button" onClick={() => insertAtCursor("**", "**", "bold")} className="rounded p-1.5 text-neutral-500 hover:bg-white/5 hover:text-white" aria-label="Bold"><Bold className="h-3.5 w-3.5" /></button>
      <button type="button" onClick={() => insertAtCursor("*", "*", "italic")} className="rounded p-1.5 text-neutral-500 hover:bg-white/5 hover:text-white" aria-label="Italic"><Italic className="h-3.5 w-3.5" /></button>
      <div className="mx-1 h-4 w-px bg-white/10" />
      <button type="button" onClick={() => insertLine("## ")} className="rounded p-1.5 text-neutral-500 hover:bg-white/5 hover:text-white" aria-label="Heading"><Heading2 className="h-3.5 w-3.5" /></button>
      <button type="button" onClick={() => insertLine("- ")} className="rounded p-1.5 text-neutral-500 hover:bg-white/5 hover:text-white" aria-label="Bullet list"><ListIcon className="h-3.5 w-3.5" /></button>
      <button type="button" onClick={() => insertLine("1. ")} className="rounded p-1.5 text-neutral-500 hover:bg-white/5 hover:text-white" aria-label="Numbered list"><ListOrdered className="h-3.5 w-3.5" /></button>
      <button type="button" onClick={() => insertLine("- [ ] ")} className="rounded p-1.5 text-neutral-500 hover:bg-white/5 hover:text-white" aria-label="Checklist"><CheckCircle2 className="h-3.5 w-3.5" /></button>
      <div className="mx-1 h-4 w-px bg-white/10" />
      <button type="button" onClick={() => insertLine("---\n")} className="rounded p-1.5 text-neutral-500 hover:bg-white/5 hover:text-white" aria-label="Divider"><Minus className="h-3.5 w-3.5" /></button>
    </div>
  );
}

// ─── Markdown Renderer ──────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  while (remaining.length > 0) {
    const boldMatch = /\*\*(.+?)\*\*/.exec(remaining);
    if (boldMatch?.index !== undefined) {
      if (boldMatch.index > 0) parts.push(<span key={key++}>{remaining.slice(0, boldMatch.index)}</span>);
      parts.push(<strong key={key++} className="font-semibold text-white">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }
    const italicMatch = /\*(.+?)\*/.exec(remaining);
    if (italicMatch?.index !== undefined) {
      if (italicMatch.index > 0) parts.push(<span key={key++}>{remaining.slice(0, italicMatch.index)}</span>);
      parts.push(<em key={key++} className="italic text-neutral-200">{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function RichContent({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-sm text-neutral-300">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) return <h3 key={i} className="mt-2 text-sm font-semibold text-white">{renderInline(line.slice(3))}</h3>;
        if (line.startsWith("- [x] ")) return <div key={i} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" /><span className="text-neutral-500 line-through">{renderInline(line.slice(6))}</span></div>;
        if (line.startsWith("- [ ] ")) return <div key={i} className="flex items-start gap-2"><Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-600" /><span>{renderInline(line.slice(6))}</span></div>;
        if (line.startsWith("- ")) return <div key={i} className="flex items-start gap-2 pl-1"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-600" /><span>{renderInline(line.slice(2))}</span></div>;
        const numMatch = /^(\d+)\.\s/.exec(line);
        if (numMatch) return <div key={i} className="flex items-start gap-2 pl-1"><span className="shrink-0 text-xs text-neutral-500">{numMatch[1]}.</span><span>{renderInline(line.slice(numMatch[0].length))}</span></div>;
        if (line.trim() === "---") return <hr key={i} className="my-2 border-white/10" />;
        if (!line.trim()) return <div key={i} className="h-2" />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

// ─── Types ──────────────────────────────────────────────────

type IdeaItem = {
  id: number;
  title: string;
  content: string | null;
  category: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date | null;
  creatorName: string | null;
  creatorEmail: string | null;
};

// ─── Category Badge ─────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium text-[#FACF39]"
      style={{
        borderColor: "rgba(250, 207, 57, 0.3)",
        backgroundColor: "rgba(250, 207, 57, 0.08)",
      }}
    >
      <Tag className="h-2.5 w-2.5" />
      {category}
    </span>
  );
}

// ─── Idea Modal (Create / Edit) ─────────────────────────────

function IdeaModal({
  idea,
  categories,
  onClose,
}: {
  idea?: IdeaItem;
  categories: string[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState(idea?.title ?? "");
  const [content, setContent] = useState(idea?.content ?? "");
  const [category, setCategory] = useState(idea?.category ?? "");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const utils = api.useUtils();

  const createIdea = api.ideas.create.useMutation({
    onSuccess: () => {
      void utils.ideas.list.invalidate();
      onClose();
    },
  });

  const updateIdea = api.ideas.update.useMutation({
    onSuccess: () => {
      void utils.ideas.list.invalidate();
      void utils.ideas.getHistory.invalidate();
      onClose();
    },
  });

  const isPending = createIdea.isPending || updateIdea.isPending;
  const error = createIdea.error ?? updateIdea.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = showNewCategory ? newCategory.trim() : category;
    if (idea) {
      updateIdea.mutate({
        id: idea.id,
        title,
        content: content || null,
        category: cat || null,
      });
    } else {
      createIdea.mutate({
        title,
        content: content || undefined,
        category: cat || undefined,
      });
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-2xl rounded-xl border bg-[#0a0a0a] p-6"
        style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 text-lg font-semibold text-white">
          {idea ? "Edit Idea" : "New Idea"}
        </h2>
        <p className="mb-6 text-sm text-neutral-400">
          {idea
            ? "Update this idea. Your changes will be tracked in the edit history."
            : "Capture a new idea for the team."}
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            {error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="block w-full rounded-md border bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
              style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
              placeholder="What's the idea?"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Content
            </label>
            <div
              className="overflow-hidden rounded-md border bg-white/5"
              style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
            >
              <FormattingToolbar
                textareaRef={textareaRef}
                value={content}
                onChange={setContent}
              />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="block w-full resize-none bg-transparent px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none"
                placeholder="Describe the idea, add context, links, etc."
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Category
            </label>
            {showNewCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="block flex-1 rounded-md border bg-white/5 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
                  style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
                  placeholder="New category name"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategory("");
                  }}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block flex-1 rounded-md border bg-white/5 px-3 py-2.5 text-sm text-white focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
                  style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-neutral-400 hover:border-white/20 hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-black transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #FFF3C4 0%, #FACF39 100%)",
            }}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {idea ? "Save Changes" : "Add Idea"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirmation ────────────────────────────────────

function DeleteIdeaModal({
  idea,
  onClose,
}: {
  idea: { id: number; title: string };
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const deleteIdea = api.ideas.delete.useMutation({
    onSuccess: () => {
      void utils.ideas.list.invalidate();
      onClose();
    },
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-sm rounded-xl border bg-[#0a0a0a] p-6"
        style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 text-lg font-semibold text-white">Delete Idea</h2>
        <p className="mb-6 text-sm text-neutral-400">
          Permanently delete{" "}
          <span className="text-white">&quot;{idea.title}&quot;</span>? This
          cannot be undone.
        </p>

        {deleteIdea.error && (
          <div className="mb-4 rounded-md border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            {deleteIdea.error.message}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:border-white/20"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteIdea.mutate({ id: idea.id })}
            disabled={deleteIdea.isPending}
            className="flex flex-1 items-center justify-center rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleteIdea.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit History Panel ─────────────────────────────────────

function EditHistoryPanel({
  ideaId,
  onClose,
}: {
  ideaId: number;
  onClose: () => void;
}) {
  const { data: edits, isLoading } = api.ideas.getHistory.useQuery({ ideaId });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl border bg-[#0a0a0a] p-6"
        style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 text-lg font-semibold text-white">Edit History</h2>
        <p className="mb-4 text-sm text-neutral-400">
          All changes made to this idea.
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-white/5 p-4">
                <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                <div className="mt-2 h-3 w-48 animate-pulse rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : !edits?.length ? (
          <div className="rounded-xl border border-white/5 py-8 text-center">
            <History className="mx-auto mb-2 h-8 w-8 text-neutral-600" />
            <p className="text-sm text-neutral-400">No edits yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {edits.map((edit) => (
              <div
                key={edit.id}
                className="rounded-lg border border-white/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {edit.editorName ?? edit.editorEmail ?? "Unknown"}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {new Date(edit.editedAt).toLocaleString()}
                  </span>
                </div>
                {edit.previousTitle && (
                  <div className="mt-2">
                    <span className="text-xs text-neutral-500">
                      Previous title:
                    </span>
                    <p className="text-sm text-neutral-400">
                      {edit.previousTitle}
                    </p>
                  </div>
                )}
                {edit.previousCategory !== undefined &&
                  edit.previousCategory !== null && (
                    <div className="mt-1">
                      <span className="text-xs text-neutral-500">
                        Previous category:
                      </span>
                      <p className="text-sm text-neutral-400">
                        {edit.previousCategory || "(none)"}
                      </p>
                    </div>
                  )}
                {edit.previousContent !== undefined &&
                  edit.previousContent !== null && (
                    <div className="mt-1">
                      <span className="text-xs text-neutral-500">
                        Previous content:
                      </span>
                      <div className="mt-1 max-h-32 overflow-y-auto rounded bg-white/5 p-2 text-xs text-neutral-400">
                        <pre className="whitespace-pre-wrap font-sans">
                          {edit.previousContent || "(empty)"}
                        </pre>
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Idea Card ──────────────────────────────────────────────

function IdeaCard({
  idea,
  categories,
  onEdit,
  onDelete,
  onHistory,
}: {
  idea: IdeaItem;
  categories: string[];
  onEdit: (idea: IdeaItem) => void;
  onDelete: (idea: { id: number; title: string }) => void;
  onHistory: (ideaId: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasContent = !!idea.content?.trim();

  return (
    <div
      className="group rounded-xl border transition-colors hover:border-[#FACF39]/20"
      style={{ borderColor: "rgba(250, 207, 57, 0.1)" }}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <button
              onClick={() => hasContent && setExpanded(!expanded)}
              className="flex items-start gap-2 text-left"
              disabled={!hasContent}
            >
              {hasContent && (
                expanded ? (
                  <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                ) : (
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                )
              )}
              <h3 className="font-medium text-white">{idea.title}</h3>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onHistory(idea.id)}
              className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="View edit history"
              title="Edit history"
            >
              <History className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(idea)}
              className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Edit idea"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete({ id: idea.id, title: idea.title })}
              className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
              aria-label="Delete idea"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content preview or full */}
        {hasContent && (
          <div className={`mt-2 ${hasContent && !expanded ? "pl-6" : "pl-6"}`}>
            {expanded ? (
              <RichContent text={idea.content!} />
            ) : (
              <p className="line-clamp-2 text-sm text-neutral-400">
                {idea.content!.replace(/[#*\-\[\]]/g, "").slice(0, 150)}
                {idea.content!.length > 150 ? "..." : ""}
              </p>
            )}
          </div>
        )}

        {/* Footer: category + meta */}
        <div className="mt-3 flex flex-wrap items-center gap-2 pl-6 text-xs text-neutral-500">
          {idea.category && <CategoryBadge category={idea.category} />}
          <span>
            by {idea.creatorName ?? idea.creatorEmail ?? "Unknown"}
          </span>
          <span>&middot;</span>
          <span>
            {new Date(idea.createdAt).toLocaleDateString()}
          </span>
          {idea.updatedAt &&
            new Date(idea.updatedAt).getTime() !==
              new Date(idea.createdAt).getTime() && (
              <>
                <span>&middot;</span>
                <span className="italic">
                  edited {new Date(idea.updatedAt).toLocaleDateString()}
                </span>
              </>
            )}
        </div>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────

function IdeaSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border p-4"
          style={{ borderColor: "rgba(250, 207, 57, 0.1)" }}
        >
          <div className="h-5 w-48 animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-3 w-64 animate-pulse rounded bg-white/10" />
          <div className="mt-3 flex gap-2">
            <div className="h-4 w-16 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function IdeasPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState<"newest" | "updated" | "alphabetical">(
    "newest"
  );
  const [showCreate, setShowCreate] = useState(false);
  const [editIdea, setEditIdea] = useState<IdeaItem | null>(null);
  const [deleteIdea, setDeleteIdea] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [historyIdeaId, setHistoryIdeaId] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = api.ideas.list.useQuery({
    search: debouncedSearch || undefined,
    category: categoryFilter || undefined,
    sort,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Ideas</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Collaborative idea board. Anyone can contribute and edit.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2 sm:max-w-2xl">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ideas..."
              className="block w-full rounded-md border bg-white/5 py-2 pr-4 pl-9 text-sm text-white placeholder-neutral-500 focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
              style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border bg-white/5 px-3 py-2 text-sm text-white focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
            style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
          >
            <option value="">All Categories</option>
            {data?.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as "newest" | "updated" | "alphabetical")
            }
            className="rounded-md border bg-white/5 px-3 py-2 text-sm text-white focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
            style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
          >
            <option value="newest">Newest First</option>
            <option value="updated">Recently Updated</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {data && (
            <span className="flex items-center gap-1.5 text-sm text-neutral-400">
              <Lightbulb className="h-4 w-4" />
              {data.total} idea{data.total !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-black transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #FFF3C4 0%, #FACF39 100%)",
            }}
          >
            <Plus className="h-4 w-4" />
            New Idea
          </button>
        </div>
      </div>

      {/* Ideas List */}
      {isLoading ? (
        <IdeaSkeleton />
      ) : !data?.ideas.length ? (
        <div
          className="rounded-xl border py-16 text-center"
          style={{ borderColor: "rgba(250, 207, 57, 0.1)" }}
        >
          <Lightbulb className="mx-auto mb-3 h-10 w-10 text-neutral-600" />
          <p className="text-sm text-neutral-400">
            {debouncedSearch || categoryFilter
              ? "No ideas match your filters."
              : "No ideas yet. Share the first one!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              categories={data.categories}
              onEdit={setEditIdea}
              onDelete={setDeleteIdea}
              onHistory={setHistoryIdeaId}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <IdeaModal
          categories={data?.categories ?? []}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editIdea && (
        <IdeaModal
          idea={editIdea}
          categories={data?.categories ?? []}
          onClose={() => setEditIdea(null)}
        />
      )}
      {deleteIdea && (
        <DeleteIdeaModal
          idea={deleteIdea}
          onClose={() => setDeleteIdea(null)}
        />
      )}
      {historyIdeaId !== null && (
        <EditHistoryPanel
          ideaId={historyIdeaId}
          onClose={() => setHistoryIdeaId(null)}
        />
      )}
    </div>
  );
}
