"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Search,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  MessageSquare,
  Mic,
  Square,
  Loader2,
} from "lucide-react";
import { api } from "~/trpc/react";
import { PhoneImportModal } from "~/components/admin/crm/phone-import-modal";
import { createClient } from "~/lib/supabase/client";

const STATUS_OPTIONS = ["lead", "qualified", "customer", "inactive"] as const;
const STATUS_LABELS: Record<string, string> = {
  lead: "Lead",
  qualified: "Qualified",
  customer: "Member",
  inactive: "Inactive",
};
const STATUS_COLORS: Record<string, string> = {
  lead: "bg-yellow-900/50 text-yellow-400",
  qualified: "bg-blue-900/50 text-blue-400",
  customer: "bg-green-900/50 text-green-400",
  inactive: "bg-neutral-800 text-neutral-400",
};
const SOURCE_LABELS: Record<string, string> = {
  questionnaire: "Questionnaire",
  event_waiver: "Event Waiver",
  manual: "Manual",
  "emergence-followup": "Emergence Followup",
  "community-landing": "Community Landing",
  other: "Other",
};
const SOURCE_COLORS: Record<string, string> = {
  questionnaire: "border-emerald-500/40 text-emerald-400",
  event_waiver: "border-purple-500/40 text-purple-400",
  manual: "border-blue-500/40 text-blue-400",
  "emergence-followup": "border-amber-500/40 text-amber-400",
  "community-landing": "border-cyan-500/40 text-cyan-400",
  other: "border-neutral-500/40 text-neutral-400",
};

const ACTIVITY_LABELS: Record<string, string> = {
  note_added: "Note added",
  status_changed: "Status changed",
  contact_created: "Created",
  voice_note_added: "Voice memo",
  form_submission: "Form submitted",
};

const PAGE_SIZE = 25;

function isPlaceholderEmail(email: string) {
  return email.endsWith("@placeholder.local");
}

// ─── Quick Note Modal ──────────────────────────────────────────

function QuickNoteModal({
  contactId,
  contactName,
  onClose,
  onSuccess,
}: {
  contactId: number;
  contactName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [note, setNote] = useState("");
  const addNoteMutation = api.crm.addNote.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h3 className="text-sm font-medium text-white">
            Note for {contactName}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Add a note..."
            autoFocus
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (note.trim()) {
                  addNoteMutation.mutate({ contactId, note: note.trim() });
                }
              }}
              disabled={!note.trim() || addNoteMutation.isPending}
              className="rounded-lg bg-[#facf39]/20 px-4 py-1.5 text-sm text-[#facf39] hover:bg-[#facf39]/30 disabled:opacity-30"
            >
              {addNoteMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Voice Memo Modal ─────────────────────────────────────

function QuickVoiceMemoModal({
  contactId,
  contactName,
  onClose,
  onSuccess,
}: {
  contactId: number;
  contactName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [state, setState] = useState<"idle" | "recording" | "uploading">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const saveMutation = api.crm.saveVoiceNote.useMutation({
    onSuccess: () => {
      setState("idle");
      onSuccess();
      onClose();
    },
    onError: () => setState("idle"),
  });

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        void uploadRecording(blob, mimeType, elapsedRef.current);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      elapsedRef.current = 0;
      setElapsed(0);
      setState("recording");

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const secs = Math.round((Date.now() - startTime) / 1000);
        elapsedRef.current = secs;
        setElapsed(secs);
      }, 500);
    } catch {
      setError("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setState("uploading");
  };

  const uploadRecording = async (blob: Blob, mimeType: string, durationSecs: number) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ext = mimeType.includes("mp4") ? "mp4" : "webm";
    const path = `${user.id}/${contactId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("voice-notes")
      .upload(path, blob, { contentType: mimeType });

    if (uploadError) {
      setState("idle");
      setError("Upload failed");
      return;
    }

    const { data: urlData } = supabase.storage.from("voice-notes").getPublicUrl(path);

    saveMutation.mutate({
      contactId,
      storagePath: path,
      publicUrl: urlData.publicUrl,
      durationSeconds: durationSecs,
      fileSizeBytes: blob.size,
      mimeType,
    });
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h3 className="text-sm font-medium text-white">
            Voice memo for {contactName}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-4 p-6">
          {state === "idle" && (
            <button
              onClick={startRecording}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500/50 bg-red-900/20 text-red-400 transition-colors hover:bg-red-900/40"
            >
              <Mic className="h-7 w-7" />
            </button>
          )}
          {state === "recording" && (
            <>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                <span className="text-2xl font-medium tabular-nums text-red-400">
                  {formatDuration(elapsed)}
                </span>
              </div>
              <button
                onClick={stopRecording}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white transition-opacity hover:opacity-90"
              >
                <Square className="h-5 w-5 fill-current" />
              </button>
            </>
          )}
          {state === "uploading" && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              Uploading...
            </div>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Contact Modal ───────────────────────────────────────────

interface ContactModalProps {
  mode: "create" | "edit";
  contact?: {
    id: number;
    name: string | null;
    email: string;
    phone: string | null;
    status: string;
    tags: string[] | null;
    notes: string | null;
    createdAt: Date;
    lastContactDate: Date;
  };
  onClose: () => void;
  onSuccess: () => void;
}

function ContactModal({ mode, contact, onClose, onSuccess }: ContactModalProps) {
  const [name, setName] = useState(contact?.name ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [status, setStatus] = useState(contact?.status ?? "lead");
  const [source, setSource] = useState("manual");
  const [tags, setTags] = useState<string[]>(contact?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState(contact?.notes ?? "");
  const [error, setError] = useState("");

  const createMutation = api.crm.createContact.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = api.crm.updateContact.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "create") {
      createMutation.mutate({
        name,
        email,
        phone: phone || undefined,
        status,
        source,
        tags,
        notes: notes || undefined,
      });
    } else if (contact) {
      updateMutation.mutate({
        id: contact.id,
        name,
        email,
        phone: phone || null,
        status,
        tags,
        notes: notes || null,
      });
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2
            className="text-lg font-bold text-white"
            style={{ fontFamily: "Airwaves, sans-serif" }}
          >
            {mode === "create" ? "Add Contact" : "Edit Contact"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <p className="rounded-lg bg-red-900/30 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-400">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/50 focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {mode === "create" && (
            <div>
              <label className="mb-1 block text-xs text-gray-400">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/50 focus:outline-none"
              >
                {Object.entries(SOURCE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="mb-1 block text-xs text-gray-400">Tags</label>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-[#facf39]/10 px-2.5 py-0.5 text-xs text-[#facf39]"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
                placeholder="Type and press Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400 hover:text-white"
              >
                Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-xs text-gray-400">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
              placeholder="Internal notes..."
            />
          </div>

          {/* Read-only dates (edit mode) */}
          {mode === "edit" && contact && (
            <div className="flex gap-4 text-xs text-gray-500">
              <span>Created: {formatDate(contact.createdAt)}</span>
              <span>Last Contact: {formatDate(contact.lastContactDate)}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-gradient-to-r from-[#facf39] to-[#f59e0b] px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending
                ? "Saving..."
                : mode === "create"
                  ? "Create Contact"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Bulk Actions Bar ────────────────────────────────────────────

function BulkActionsBar({
  selectedCount,
  selectedIds,
  onClear,
  onSuccess,
}: {
  selectedCount: number;
  selectedIds: number[];
  onClear: () => void;
  onSuccess: () => void;
}) {
  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const [showCommunitySelect, setShowCommunitySelect] = useState(false);
  const communityTagsQuery = api.crm.getCommunityTagsFlat.useQuery();

  const bulkStatusMutation = api.crm.bulkUpdateStatus.useMutation({
    onSuccess: () => {
      onSuccess();
      onClear();
      setShowStatusSelect(false);
    },
  });

  const bulkAssignMutation = api.crm.bulkAssignCommunity.useMutation({
    onSuccess: () => {
      onSuccess();
      onClear();
      setShowCommunitySelect(false);
    },
  });

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#facf39]/30 bg-[#facf39]/5 px-4 py-2.5">
      <span className="text-sm font-medium text-[#facf39]">
        {selectedCount} selected
      </span>
      <div className="h-4 w-px bg-white/10" />

      {showStatusSelect ? (
        <div className="flex items-center gap-1.5">
          <select
            onChange={(e) => {
              if (e.target.value) {
                bulkStatusMutation.mutate({ contactIds: selectedIds, status: e.target.value });
              }
            }}
            className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:border-[#facf39]/50 focus:outline-none"
            autoFocus
          >
            <option value="">Set status...</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <button onClick={() => setShowStatusSelect(false)} className="text-xs text-gray-400 hover:text-white">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowStatusSelect(true)}
          className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
        >
          Change Status
        </button>
      )}

      {showCommunitySelect ? (
        <div className="flex items-center gap-1.5">
          <select
            onChange={(e) => {
              if (e.target.value) {
                bulkAssignMutation.mutate({ contactIds: selectedIds, communityTagId: Number(e.target.value) });
              }
            }}
            className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:border-[#facf39]/50 focus:outline-none"
            autoFocus
          >
            <option value="">Assign community...</option>
            {(communityTagsQuery.data ?? []).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button onClick={() => setShowCommunitySelect(false)} className="text-xs text-gray-400 hover:text-white">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowCommunitySelect(true)}
          className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
        >
          Assign Community
        </button>
      )}

      <button
        onClick={onClear}
        className="ml-auto text-xs text-gray-400 hover:text-white"
      >
        Clear
      </button>
    </div>
  );
}

// ─── Contacts Page ───────────────────────────────────────────

function ContactsContent() {
  // Read community filter from URL if present (drill-down from communities page)
  const initialCommunity = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("community")
    : null;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [communityFilter, setCommunityFilter] = useState<number | undefined>(
    initialCommunity ? Number(initialCommunity) : undefined
  );
  const [addedByFilter, setAddedByFilter] = useState("");
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    contact?: ContactModalProps["contact"];
  } | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [quickNote, setQuickNote] = useState<{ id: number; name: string } | null>(null);
  const [quickVoice, setQuickVoice] = useState<{ id: number; name: string } | null>(null);

  const contactsQuery = api.crm.getContacts.useQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
    communityTagId: communityFilter,
    addedBy: addedByFilter || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const teamQuery = api.crm.getTeamMembers.useQuery();
  const communityTagsQuery = api.crm.getCommunityTagsFlat.useQuery();

  const contacts = contactsQuery.data?.contacts ?? [];
  const total = contactsQuery.data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map((c) => c.id)));
    }
  };

  return (
    <div className="space-y-6">
      {modal && (
        <ContactModal
          mode={modal.mode}
          contact={modal.contact}
          onClose={() => setModal(null)}
          onSuccess={() => void contactsQuery.refetch()}
        />
      )}

      {showImport && (
        <PhoneImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => void contactsQuery.refetch()}
        />
      )}

      {quickNote && (
        <QuickNoteModal
          contactId={quickNote.id}
          contactName={quickNote.name}
          onClose={() => setQuickNote(null)}
          onSuccess={() => void contactsQuery.refetch()}
        />
      )}

      {quickVoice && (
        <QuickVoiceMemoModal
          contactId={quickVoice.id}
          contactName={quickVoice.name}
          onClose={() => setQuickVoice(null)}
          onSuccess={() => void contactsQuery.refetch()}
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            Contacts
          </h1>
          <p className="text-sm text-gray-400">{total} contacts</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:flex-initial"
          >
            <Upload className="h-4 w-4" />
            Import
          </button>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#facf39] to-[#f59e0b] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 sm:flex-initial"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/50 focus:outline-none"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(0);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/50 focus:outline-none"
          >
            <option value="">All Sources</option>
            {Object.entries(SOURCE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={communityFilter ?? ""}
            onChange={(e) => {
              setCommunityFilter(e.target.value ? Number(e.target.value) : undefined);
              setPage(0);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/50 focus:outline-none"
          >
            <option value="">All Communities</option>
            {(communityTagsQuery.data ?? [])
              .filter((t) => t.type === "community")
              .map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            <option disabled>──────────</option>
            {(communityTagsQuery.data ?? [])
              .filter((t) => t.type === "location")
              .map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
          </select>
          {(teamQuery.data?.length ?? 0) > 0 && (
            <select
              value={addedByFilter}
              onChange={(e) => {
                setAddedByFilter(e.target.value);
                setPage(0);
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/50 focus:outline-none"
            >
              <option value="">Team Member</option>
              {teamQuery.data?.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.size}
          selectedIds={[...selectedIds]}
          onClear={() => setSelectedIds(new Set())}
          onSuccess={() => void contactsQuery.refetch()}
        />
      )}

      {/* Desktop Table */}
      <Card className="hidden border-white/10 bg-white/5 md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={contacts.length > 0 && selectedIds.size === contacts.length}
                      onChange={toggleSelectAll}
                      className="rounded border-white/20 bg-white/5"
                    />
                  </th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Communities</th>
                  <th className="px-4 py-3">Sources</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Activity</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contacts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-500">
                      {contactsQuery.isLoading ? "Loading..." : "No contacts found"}
                    </td>
                  </tr>
                )}
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5">
                    <td className="w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="rounded border-white/20 bg-white/5"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/crm/contacts/${c.id}`}
                        className="font-medium text-white hover:text-[#facf39]"
                      >
                        {c.name ?? "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {!isPlaceholderEmail(c.email) && (
                        <div className="text-sm text-gray-400">{c.email}</div>
                      )}
                      {c.phone && (
                        <div className="text-xs text-gray-500">{c.phone}</div>
                      )}
                      {isPlaceholderEmail(c.email) && !c.phone && (
                        <span className="text-xs text-gray-600">Phone import</span>
                      )}
                    </td>
                    {/* Communities BEFORE sources */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.communityTags?.map((ct) => (
                          <Badge
                            key={ct.id}
                            variant="outline"
                            className="text-[10px]"
                            style={{
                              borderColor: ct.color ? `${ct.color}66` : undefined,
                              color: ct.color ?? undefined,
                            }}
                          >
                            {ct.parentName ? `${ct.parentName} > ` : ""}{ct.name}
                          </Badge>
                        ))}
                        {(!c.communityTags || c.communityTags.length === 0) && (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.submissionSources.map((src) => (
                          <Badge
                            key={src}
                            variant="outline"
                            className={`text-[10px] ${SOURCE_COLORS[src] ?? "border-neutral-500/40 text-neutral-400"}`}
                          >
                            {SOURCE_LABELS[src] ?? src}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] ?? ""}`}
                      >
                        {STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.lastActivity ? (
                        <div>
                          <span className="text-xs text-gray-400">
                            {ACTIVITY_LABELS[c.lastActivity.type] ?? c.lastActivity.type.replace(/_/g, " ")}
                          </span>
                          <div className="text-[11px] text-gray-600">
                            {formatDate(c.lastActivity.date)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600">{formatDate(c.lastContactDate)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setQuickNote({ id: c.id, name: c.name ?? "Contact" })}
                          title="Quick note"
                          className="rounded p-1.5 text-gray-500 hover:bg-white/10 hover:text-[#facf39]"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setQuickVoice({ id: c.id, name: c.name ?? "Contact" })}
                          title="Quick voice memo"
                          className="rounded p-1.5 text-gray-500 hover:bg-white/10 hover:text-red-400"
                        >
                          <Mic className="h-3.5 w-3.5" />
                        </button>
                        <Link
                          href={`/admin/crm/contacts/${c.id}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:bg-white/10 hover:text-[#facf39]"
                        >
                          View
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
              <p className="text-xs text-gray-500">
                Showing {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-xs text-gray-400">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Card List */}
      <div className="space-y-3 md:hidden">
        {contactsQuery.isLoading && (
          <p className="py-12 text-center text-sm text-gray-500">Loading...</p>
        )}
        {!contactsQuery.isLoading && contacts.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-500">No contacts found</p>
        )}
        {contacts.map((c) => (
          <Card key={c.id} className="border-white/10 bg-white/5">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <Link
                  href={`/admin/crm/contacts/${c.id}`}
                  className="font-medium text-white hover:text-[#facf39]"
                >
                  {c.name ?? "—"}
                </Link>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] ?? ""}`}
                >
                  {STATUS_LABELS[c.status] ?? c.status}
                </span>
              </div>
              {!isPlaceholderEmail(c.email) && (
                <p className="mt-1 truncate text-sm text-gray-400">{c.email}</p>
              )}
              {c.phone && (
                <p className="text-xs text-gray-500">{c.phone}</p>
              )}
              {/* Community tags first, then sources */}
              <div className="mt-2 flex flex-wrap gap-1">
                {c.communityTags?.map((ct) => (
                  <Badge
                    key={ct.id}
                    variant="outline"
                    className="text-[10px]"
                    style={{
                      borderColor: ct.color ? `${ct.color}66` : undefined,
                      color: ct.color ?? undefined,
                    }}
                  >
                    {ct.parentName ? `${ct.parentName} > ` : ""}{ct.name}
                  </Badge>
                ))}
                {c.submissionSources.map((src) => (
                  <Badge
                    key={src}
                    variant="outline"
                    className={`text-[10px] ${SOURCE_COLORS[src] ?? "border-neutral-500/40 text-neutral-400"}`}
                  >
                    {SOURCE_LABELS[src] ?? src}
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  {c.lastActivity ? (
                    <span>{ACTIVITY_LABELS[c.lastActivity.type] ?? c.lastActivity.type} · {formatDate(c.lastActivity.date)}</span>
                  ) : (
                    <span>{formatDate(c.lastContactDate)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQuickNote({ id: c.id, name: c.name ?? "Contact" })}
                    className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-gray-400 hover:text-[#facf39]"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setQuickVoice({ id: c.id, name: c.name ?? "Contact" })}
                    className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-gray-400 hover:text-red-400"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/admin/crm/contacts/${c.id}`}
                    className="inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2.5 py-2 text-xs text-gray-400 hover:bg-white/10 hover:text-[#facf39]"
                  >
                    View
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-2">
            <p className="text-xs text-gray-500">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-gray-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-2 text-sm text-gray-400">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-gray-400 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContactsPage() {
  return (
    <Suspense fallback={null}>
      <ContactsContent />
    </Suspense>
  );
}
