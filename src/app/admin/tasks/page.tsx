"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  List,
  Columns3,
  Bold,
  Italic,
  ListOrdered,
  ListIcon,
  Heading2,
  Minus,
  ArrowRight,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "~/trpc/react";

// ─── Icon Map ───────────────────────────────────────────────

const ICON_MAP: Record<string, typeof Circle> = {
  circle: Circle,
  clock: Clock,
  "check-circle-2": CheckCircle2,
};

function getStatusIcon(iconName: string) {
  return ICON_MAP[iconName] ?? Circle;
}

// ─── Priority Constants ─────────────────────────────────────

const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"] as const;
const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-800 text-gray-400",
  medium: "bg-blue-900/40 text-blue-400",
  high: "bg-amber-900/40 text-amber-400",
  urgent: "bg-red-900/40 text-red-400",
};

// ─── Types ──────────────────────────────────────────────────

type StatusConfig = {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date | null;
};

type TaskItem = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignedTo: string | null;
  assigneeName: string | null;
  assigneeEmail: string | null;
  startDate: Date | null;
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
};

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
      const newValue = value.slice(0, start) + before + text + after + value.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.focus();
        const cursorPos = start + before.length + text.length;
        ta.setSelectionRange(
          selected ? cursorPos + after.length : start + before.length,
          selected ? cursorPos + after.length : start + before.length + text.length
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
        const newValue = value.slice(0, lineStart) + line.slice(prefix.length) + value.slice(end);
        onChange(newValue);
      } else {
        const newValue = value.slice(0, lineStart) + prefix + line + value.slice(end);
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

// ─── Markdown-ish renderer ──────────────────────────────────

function RichNotes({ text }: { text: string }) {
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

// ─── Editable Status Name ───────────────────────────────────

function EditableStatusName({
  status,
  onRename,
}: {
  status: StatusConfig;
  onRename: (id: number, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(status.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const save = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== status.name) {
      onRename(status.id, trimmed);
    } else {
      setName(status.name);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") { setName(status.name); setEditing(false); }
        }}
        className="w-24 rounded border border-[#FACF39]/30 bg-transparent px-1 py-0.5 text-sm font-medium text-neutral-300 focus:border-[#FACF39] focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-sm font-medium text-neutral-300 hover:text-white"
      title="Click to rename"
    >
      {status.name}
    </button>
  );
}

// ─── Task Modal ─────────────────────────────────────────────

function TaskModal({
  task,
  defaultStatus,
  statuses,
  onClose,
  onSuccess,
}: {
  task?: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    assignedTo: string | null;
    startDate: Date | null;
    dueDate: Date | null;
  };
  defaultStatus?: string;
  statuses: StatusConfig[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState(task?.priority ?? "medium");
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo ?? "");
  const [startDate, setStartDate] = useState(
    task?.startDate ? new Date(task.startDate).toISOString().split("T")[0] : ""
  );
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [error, setError] = useState("");
  const descRef = useRef<HTMLTextAreaElement>(null);

  const teamQuery = api.tasks.getTeamMembers.useQuery();

  const createMutation = api.tasks.create.useMutation({
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err) => setError(err.message),
  });

  const updateMutation = api.tasks.update.useMutation({
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (task) {
      updateMutation.mutate({
        id: task.id,
        title,
        description: description || null,
        priority: priority as "low" | "medium" | "high" | "urgent",
        assignedTo: assignedTo || null,
        startDate: startDate || null,
        dueDate: dueDate || null,
      });
    } else {
      createMutation.mutate({
        title,
        description: description || undefined,
        status: defaultStatus ?? statuses[0]?.slug ?? "todo",
        priority: priority as "low" | "medium" | "high" | "urgent",
        assignedTo: assignedTo || undefined,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
      });
    }
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="task-modal-title" className="relative w-full max-w-lg rounded-xl border bg-[#0a0a0a] p-6" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 text-neutral-400 hover:text-white"><X className="h-5 w-5" /></button>
        <h2 id="task-modal-title" className="mb-1 text-lg font-semibold text-white">{task ? "Edit Task" : "New Task"}</h2>
        <p className="mb-5 text-sm text-neutral-400">{task ? "Update task details." : "Add a task and assign it to a team member."}</p>
        {error && <div className="mb-4 rounded-md border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-200">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="mb-1.5 block text-sm font-medium text-neutral-300">Title</label>
            <input id="task-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="block w-full rounded-md border bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }} placeholder="What needs to be done?" autoFocus />
          </div>
          <div>
            <label htmlFor="task-notes" className="mb-1.5 block text-sm font-medium text-neutral-300">Notes</label>
            <div className="overflow-hidden rounded-md border bg-white/5" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
              <FormattingToolbar textareaRef={descRef} value={description} onChange={setDescription} />
              <textarea id="task-notes" ref={descRef} value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="block w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none" placeholder="Detailed notes... Use the toolbar for formatting." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority" className="mb-1.5 block text-sm font-medium text-neutral-300">Priority</label>
              <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="block w-full rounded-md border bg-white/5 px-3 py-2.5 text-white focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
                {PRIORITY_OPTIONS.map((p) => (<option key={p} value={p}>{PRIORITY_LABELS[p]}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="task-assignee" className="mb-1.5 block text-sm font-medium text-neutral-300">Assign To</label>
              <select id="task-assignee" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="block w-full rounded-md border bg-white/5 px-3 py-2.5 text-white focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
                <option value="">Unassigned</option>
                {teamQuery.data?.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-start-date" className="mb-1.5 block text-sm font-medium text-neutral-300">Start Date <span className="text-neutral-500">(optional)</span></label>
              <input id="task-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block w-full rounded-md border bg-white/5 px-3 py-2.5 text-white focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none [color-scheme:dark]" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }} />
            </div>
            <div>
              <label htmlFor="task-due-date" className="mb-1.5 block text-sm font-medium text-neutral-300">Due Date <span className="text-neutral-500">(optional)</span></label>
              <input id="task-due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="block w-full rounded-md border bg-white/5 px-3 py-2.5 text-white focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none [color-scheme:dark]" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }} />
            </div>
          </div>
          <button type="submit" disabled={pending || !title.trim()} className="flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-black transition-all disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "linear-gradient(135deg, #FFF3C4 0%, #FACF39 100%)" }}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {task ? "Save Changes" : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Task Card (List View) ──────────────────────────────────

function TaskCard({
  task,
  statuses,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  task: TaskItem;
  statuses: StatusConfig[];
  onEdit: () => void;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statusConfig = statuses.find((s) => s.slug === task.status);
  const StatusIcon = getStatusIcon(statusConfig?.icon ?? "circle");
  const statusColor = statusConfig?.color ?? "text-gray-400 border-gray-500/30";
  const priorityColor = PRIORITY_COLORS[task.priority] ?? "";

  const isOverdue = task.dueDate && task.status !== statuses[statuses.length - 1]?.slug && new Date(task.dueDate) < new Date();
  const isLastStatus = task.status === statuses[statuses.length - 1]?.slug;

  const formatDate = (d: Date | string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // Cycle to next status
  const nextStatus = () => {
    const idx = statuses.findIndex((s) => s.slug === task.status);
    const next = statuses[(idx + 1) % statuses.length];
    if (next) onStatusChange(next.slug);
  };

  return (
    <div className={`rounded-xl border transition-colors ${isLastStatus ? "opacity-60" : ""}`} style={{ borderColor: "rgba(250, 207, 57, 0.1)" }}>
      <div className="flex items-start gap-3 px-4 py-3">
        <button onClick={nextStatus} className={`mt-0.5 shrink-0 rounded-full border p-0.5 transition-colors hover:bg-white/5 ${statusColor}`} aria-label={`Status: ${statusConfig?.name ?? task.status} (click to advance)`}>
          <StatusIcon className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <button onClick={() => setExpanded(!expanded)} className="min-w-0 text-left">
              <span className={`text-sm font-medium ${isLastStatus ? "text-neutral-500 line-through" : "text-white"}`}>{task.title}</span>
            </button>
            <div className="flex shrink-0 items-center gap-1">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColor}`}>{PRIORITY_LABELS[task.priority]}</span>
              {task.description && (
                <button onClick={() => setExpanded(!expanded)} className="rounded p-1 text-neutral-500 hover:bg-white/5 hover:text-white">
                  {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
            {task.assigneeName && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{task.assigneeName}</span>}
            {task.startDate && task.dueDate && (
              <span className={`inline-flex items-center gap-1 ${isOverdue ? "text-red-400" : ""}`}>
                {isOverdue && <AlertCircle className="h-3 w-3" />}<Calendar className="h-3 w-3" />{formatDate(task.startDate)}<ArrowRight className="h-2.5 w-2.5" />{formatDate(task.dueDate)}
              </span>
            )}
            {!task.startDate && task.dueDate && <span className={`inline-flex items-center gap-1 ${isOverdue ? "text-red-400" : ""}`}>{isOverdue && <AlertCircle className="h-3 w-3" />}<Calendar className="h-3 w-3" />Due {formatDate(task.dueDate)}</span>}
            {task.startDate && !task.dueDate && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />Starts {formatDate(task.startDate)}</span>}
            {task.completedAt && <span className="inline-flex items-center gap-1 text-green-500"><CheckCircle2 className="h-3 w-3" />{formatDate(task.completedAt)}</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button onClick={onEdit} aria-label="Edit task" className="rounded p-2 sm:p-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-neutral-500 hover:bg-white/5 hover:text-white"><Pencil className="h-3.5 w-3.5" /></button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button onClick={onDelete} className="rounded px-2 py-1 text-[10px] text-red-400 hover:bg-red-900/30">Delete</button>
              <button onClick={() => setConfirmDelete(false)} className="rounded px-2 py-1 text-[10px] text-neutral-400 hover:text-white">No</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} aria-label="Delete task" className="rounded p-2 sm:p-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-neutral-500 hover:bg-white/5 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
          )}
        </div>
      </div>
      {expanded && task.description && (
        <div className="border-t border-white/5 px-4 py-3 pl-11"><RichNotes text={task.description} /></div>
      )}
    </div>
  );
}

// ─── Kanban Card (Sortable) ─────────────────────────────────

function KanbanCard({
  task,
  statuses,
  onEdit,
}: {
  task: TaskItem;
  statuses: StatusConfig[];
  onEdit: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `task-${task.id}`, data: { type: "task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const priorityColor = PRIORITY_COLORS[task.priority] ?? "";
  const isLastStatus = task.status === statuses[statuses.length - 1]?.slug;
  const isOverdue = task.dueDate && !isLastStatus && new Date(task.dueDate) < new Date();
  const formatDate = (d: Date | string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border bg-[#0a0a0a] p-3 transition-shadow ${
        isDragging ? "shadow-lg shadow-[#FACF39]/10 border-[#FACF39]/40" : "border-white/10 hover:border-white/20"
      } ${isLastStatus ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} aria-label="Drag to reorder" className="mt-0.5 shrink-0 cursor-grab text-neutral-600 hover:text-neutral-400 active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={onEdit} className="min-w-0 flex-1 text-left">
          <p className={`text-sm font-medium leading-tight ${isLastStatus ? "text-neutral-500 line-through" : "text-white"} truncate`}>{task.title}</p>
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 pl-6">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColor}`}>{PRIORITY_LABELS[task.priority]}</span>
        {task.assigneeName && <span className="inline-flex items-center gap-1 text-[10px] text-neutral-500"><User className="h-2.5 w-2.5" />{task.assigneeName}</span>}
        {task.dueDate && (
          <span className={`inline-flex items-center gap-1 text-[10px] ${isOverdue ? "text-red-400" : "text-neutral-500"}`}>
            {isOverdue && <AlertCircle className="h-2.5 w-2.5" />}<Calendar className="h-2.5 w-2.5" />{formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Kanban Card Overlay ────────────────────────────────────

function KanbanCardOverlay({ task }: { task: TaskItem }) {
  const priorityColor = PRIORITY_COLORS[task.priority] ?? "";
  return (
    <div className="w-72 rounded-lg border border-[#FACF39]/40 bg-[#0a0a0a] p-3 shadow-lg shadow-[#FACF39]/10">
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-white">{task.title}</p>
      </div>
      <div className="mt-2 flex items-center gap-2 pl-6">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColor}`}>{PRIORITY_LABELS[task.priority]}</span>
      </div>
    </div>
  );
}

// ─── Kanban Column ──────────────────────────────────────────

function KanbanColumn({
  status,
  tasks,
  statuses,
  onAddTask,
  onEditTask,
  onRenameStatus,
}: {
  status: StatusConfig;
  tasks: TaskItem[];
  statuses: StatusConfig[];
  onAddTask: () => void;
  onEditTask: (task: TaskItem) => void;
  onRenameStatus: (id: number, name: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `column-${status.slug}` });
  const StatusIcon = getStatusIcon(status.icon ?? "circle");
  const color = status.color ?? "text-gray-400 border-gray-500/30";

  const taskIds = useMemo(() => tasks.map((t) => `task-${t.id}`), [tasks]);

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[280px] flex-1 flex-col rounded-xl border transition-colors ${
        isOver ? "border-[#FACF39]/40 bg-[#FACF39]/5" : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <StatusIcon className={`h-4 w-4 ${color.split(" ")[0]}`} />
        <EditableStatusName status={status} onRename={onRenameStatus} />
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-neutral-500">{tasks.length}</span>
        <div className="flex-1" />
        <button onClick={onAddTask} className="rounded p-1 text-neutral-500 hover:bg-white/5 hover:text-[#FACF39]" title={`Add task to ${status.name}`}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3" style={{ maxHeight: "calc(100vh - 320px)" }}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-xs text-neutral-600">No tasks</p>
          ) : (
            tasks.map((task) => (
              <KanbanCard key={task.id} task={task} statuses={statuses} onEdit={() => onEditTask(task)} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

// ─── Kanban Board ───────────────────────────────────────────

function KanbanBoard({
  tasks,
  statuses,
  onStatusChange,
  onAddTask,
  onEditTask,
  onRenameStatus,
}: {
  tasks: TaskItem[];
  statuses: StatusConfig[];
  onStatusChange: (taskId: number, newStatus: string) => void;
  onAddTask: (defaultStatus: string) => void;
  onEditTask: (task: TaskItem) => void;
  onRenameStatus: (id: number, name: string) => void;
}) {
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const columns = useMemo(() => {
    const map: Record<string, TaskItem[]> = {};
    for (const s of statuses) map[s.slug] = [];
    for (const t of tasks) {
      if (map[t.status]) map[t.status]!.push(t);
      else if (statuses[0]) (map[statuses[0].slug] ??= []).push(t);
    }
    return map;
  }, [tasks, statuses]);

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === "task") setActiveTask(data.task as TaskItem);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    if (activeData?.type !== "task") return;
    const task = activeData.task as TaskItem;

    const overId = String(over.id);
    let targetStatus: string | undefined;

    // Dropped on a column
    if (overId.startsWith("column-")) {
      targetStatus = overId.replace("column-", "");
    }
    // Dropped on a task — find which column that task is in
    else if (overId.startsWith("task-")) {
      const overTaskId = Number(overId.replace("task-", ""));
      const overTask = tasks.find((t) => t.id === overTaskId);
      if (overTask) targetStatus = overTask.status;
    }

    if (targetStatus && targetStatus !== task.status) {
      onStatusChange(task.id, targetStatus);
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4 md:flex-row">
        {statuses.map((status) => (
          <KanbanColumn
            key={status.id}
            status={status}
            tasks={columns[status.slug] ?? []}
            statuses={statuses}
            onAddTask={() => onAddTask(status.slug)}
            onEditTask={onEditTask}
            onRenameStatus={onRenameStatus}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <KanbanCardOverlay task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// ─── Status Reorder Bar ─────────────────────────────────────

function StatusReorderBar({
  statuses,
  onReorder,
  onRename,
}: {
  statuses: StatusConfig[];
  onReorder: (reordered: StatusConfig[]) => void;
  onRename: (id: number, name: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = statuses.findIndex((s) => `status-${s.id}` === active.id);
    const newIdx = statuses.findIndex((s) => `status-${s.id}` === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    onReorder(arrayMove(statuses, oldIdx, newIdx));
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={statuses.map((s) => `status-${s.id}`)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-wrap items-center gap-2">
          {statuses.map((s) => (
            <SortableStatusChip key={s.id} status={s} onRename={onRename} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableStatusChip({
  status,
  onRename,
}: {
  status: StatusConfig;
  onRename: (id: number, name: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `status-${status.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const StatusIcon = getStatusIcon(status.icon ?? "circle");
  const color = status.color ?? "text-gray-400 border-gray-500/30";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-neutral-600 hover:text-neutral-400 active:cursor-grabbing">
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <StatusIcon className={`h-3.5 w-3.5 ${color.split(" ")[0]}`} />
      <EditableStatusName status={status} onRename={onRename} />
    </div>
  );
}

// ─── Tasks Page ─────────────────────────────────────────────

export default function TasksPage() {
  const [activeView, setActiveViewState] = useState<"list" | "kanban">("list");

  // Persist active tab in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tasks-view");
    if (saved === "list" || saved === "kanban") setActiveViewState(saved);
  }, []);

  const setActiveView = useCallback((view: "list" | "kanban") => {
    setActiveViewState(view);
    localStorage.setItem("tasks-view", view);
  }, []);
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showModal, setShowModal] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<{
    id: number;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    assignedTo: string | null;
    startDate: Date | null;
    dueDate: Date | null;
  } | null>(null);
  const [showReorder, setShowReorder] = useState(false);

  const utils = api.useUtils();

  const statusesQuery = api.tasks.listStatuses.useQuery();
  const statuses = useMemo(() => statusesQuery.data ?? [], [statusesQuery.data]);

  const tasksQuery = api.tasks.list.useQuery({
    status: statusFilter || undefined,
    assignedTo: assignedFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const teamQuery = api.tasks.getTeamMembers.useQuery();

  const updateMutation = api.tasks.update.useMutation({
    onMutate: async (variables) => {
      if (!variables.status) return;
      await utils.tasks.list.cancel();
      const queryKey = {
        status: statusFilter || undefined,
        assignedTo: assignedFilter || undefined,
        priority: priorityFilter || undefined,
      };
      const previousData = utils.tasks.list.getData(queryKey);
      utils.tasks.list.setData(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((t) =>
            t.id === variables.id
              ? { ...t, status: variables.status!, completedAt: variables.status === statuses[statuses.length - 1]?.slug ? new Date() : null }
              : t
          ),
        };
      });
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        utils.tasks.list.setData({
          status: statusFilter || undefined,
          assignedTo: assignedFilter || undefined,
          priority: priorityFilter || undefined,
        }, context.previousData);
      }
    },
    onSettled: () => void utils.tasks.list.invalidate(),
  });

  const deleteMutation = api.tasks.delete.useMutation({
    onSuccess: () => void utils.tasks.list.invalidate(),
  });

  const renameStatusMutation = api.tasks.updateStatus.useMutation({
    onSuccess: () => void utils.tasks.listStatuses.invalidate(),
  });

  const reorderStatusesMutation = api.tasks.reorderStatuses.useMutation({
    onSuccess: () => void utils.tasks.listStatuses.invalidate(),
  });

  const tasks = useMemo(() => tasksQuery.data?.tasks ?? [], [tasksQuery.data]);
  const total = tasksQuery.data?.total ?? 0;

  const handleRenameStatus = (id: number, name: string) => {
    renameStatusMutation.mutate({ id, name });
  };

  const handleReorderStatuses = (reordered: StatusConfig[]) => {
    reorderStatusesMutation.mutate(
      reordered.map((s, i) => ({ id: s.id, sortOrder: i }))
    );
    // Optimistically update local cache
    utils.tasks.listStatuses.setData(undefined, reordered.map((s, i) => ({ ...s, sortOrder: i })));
  };

  // Group tasks by status for list view (in status order)
  const tasksByStatus = useMemo(() => {
    const map: Record<string, TaskItem[]> = {};
    for (const s of statuses) map[s.slug] = [];
    for (const t of tasks) {
      if (map[t.status]) map[t.status]!.push(t);
      else if (statuses[0]) (map[statuses[0].slug] ??= []).push(t);
    }
    return map;
  }, [tasks, statuses]);

  const renderGroup = (status: StatusConfig) => {
    if (statusFilter && statusFilter !== status.slug) return null;
    const items = tasksByStatus[status.slug] ?? [];
    const StatusIcon = getStatusIcon(status.icon ?? "circle");
    const color = status.color ?? "text-gray-400 border-gray-500/30";

    return (
      <div key={status.id}>
        <div className="mb-2 flex items-center gap-2">
          <StatusIcon className={`h-4 w-4 ${color.split(" ")[0]}`} />
          <EditableStatusName status={status} onRename={handleRenameStatus} />
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-neutral-500">{items.length}</span>
        </div>
        {items.length === 0 ? (
          <p className="py-4 text-center text-xs text-neutral-600">No tasks</p>
        ) : (
          <div className="space-y-2">
            {items.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                statuses={statuses}
                onEdit={() => setEditTask({
                  id: task.id, title: task.title, description: task.description,
                  status: task.status, priority: task.priority, assignedTo: task.assignedTo,
                  startDate: task.startDate, dueDate: task.dueDate,
                })}
                onStatusChange={(s) => updateMutation.mutate({ id: task.id, status: s })}
                onDelete={() => deleteMutation.mutate({ id: task.id })}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="mt-1 text-sm text-neutral-400">{total} task{total !== 1 ? "s" : ""} across your team</p>
        </div>
        <button
          onClick={() => setShowModal(statuses[0]?.slug ?? "todo")}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-black transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #FFF3C4 0%, #FACF39 100%)" }}
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* View Tabs + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
            <button onClick={() => setActiveView("list")} aria-pressed={activeView === "list"} className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeView === "list" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}>
              <List className="h-4 w-4" />List
            </button>
            <button onClick={() => setActiveView("kanban")} aria-pressed={activeView === "kanban"} className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeView === "kanban" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}>
              <Columns3 className="h-4 w-4" />Kanban
            </button>
          </div>
          <button
            onClick={() => setShowReorder(!showReorder)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${showReorder ? "border-[#FACF39]/30 bg-[#FACF39]/10 text-[#FACF39]" : "border-white/10 text-neutral-400 hover:text-white"}`}
            title="Reorder categories"
          >
            <GripVertical className="inline h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status" className="rounded-md border bg-white/5 px-3 py-2 text-sm text-white focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
            <option value="">All Statuses</option>
            {statuses.map((s) => (<option key={s.id} value={s.slug}>{s.name}</option>))}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} aria-label="Filter by priority" className="rounded-md border bg-white/5 px-3 py-2 text-sm text-white focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map((p) => (<option key={p} value={p}>{PRIORITY_LABELS[p]}</option>))}
          </select>
          {(teamQuery.data?.length ?? 0) > 0 && (
            <select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)} aria-label="Filter by team member" className="rounded-md border bg-white/5 px-3 py-2 text-sm text-white focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
              <option value="">All Members</option>
              {teamQuery.data?.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
            </select>
          )}
        </div>
      </div>

      {/* Status Reorder Bar */}
      {showReorder && statuses.length > 0 && (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <p className="mb-2 text-xs text-neutral-500">Drag to reorder categories. Click names to rename.</p>
          <StatusReorderBar statuses={statuses} onReorder={handleReorderStatuses} onRename={handleRenameStatus} />
        </div>
      )}

      {/* List View */}
      {activeView === "list" && (
        <>
          {tasksQuery.isLoading || statusesQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg bg-white/5 p-4">
                  <div className="h-4 w-4 animate-pulse rounded-full bg-white/10" />
                  <div className="h-4 w-60 animate-pulse rounded bg-white/10" />
                  <div className="ml-auto h-4 w-16 animate-pulse rounded bg-white/10" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {statuses.map((s) => renderGroup(s))}
            </div>
          )}
        </>
      )}

      {/* Kanban View */}
      {activeView === "kanban" && (
        <>
          {tasksQuery.isLoading || statusesQuery.isLoading ? (
            <div className="flex gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex-1 rounded-xl border border-white/10 p-4">
                  <div className="mb-3 h-5 w-24 animate-pulse rounded bg-white/10" />
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="mb-2 h-16 animate-pulse rounded-lg bg-white/5" />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <KanbanBoard
              tasks={tasks}
              statuses={statuses}
              onStatusChange={(taskId, newStatus) => updateMutation.mutate({ id: taskId, status: newStatus })}
              onAddTask={(defaultStatus) => setShowModal(defaultStatus)}
              onEditTask={(task) => setEditTask({
                id: task.id, title: task.title, description: task.description,
                status: task.status, priority: task.priority, assignedTo: task.assignedTo,
                startDate: task.startDate, dueDate: task.dueDate,
              })}
              onRenameStatus={handleRenameStatus}
            />
          )}
        </>
      )}

      {/* Modals */}
      {showModal && (
        <TaskModal
          defaultStatus={showModal}
          statuses={statuses}
          onClose={() => setShowModal(null)}
          onSuccess={() => void utils.tasks.list.invalidate()}
        />
      )}
      {editTask && (
        <TaskModal
          task={editTask}
          statuses={statuses}
          onClose={() => setEditTask(null)}
          onSuccess={() => void utils.tasks.list.invalidate()}
        />
      )}
    </div>
  );
}
