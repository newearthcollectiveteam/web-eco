"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Search,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Upload,
  Mic,
  MessageSquare,
} from "lucide-react";
import { api } from "~/trpc/react";
import { PhoneImportModal } from "~/components/admin/crm/phone-import-modal";
import { VoiceNoteRecorder } from "~/components/admin/crm/voice-note-recorder";

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
  waitlist: "Waitlist",
  questionnaire: "Questionnaire",
  event_waiver: "Event Waiver",
  manual: "Manual",
  phone_import: "Phone Import",
  other: "Other",
};
const SOURCE_COLORS: Record<string, string> = {
  waitlist: "border-amber-500/40 text-amber-400",
  questionnaire: "border-emerald-500/40 text-emerald-400",
  event_waiver: "border-purple-500/40 text-purple-400",
  manual: "border-blue-500/40 text-blue-400",
  phone_import: "border-cyan-500/40 text-cyan-400",
  other: "border-neutral-500/40 text-neutral-400",
};

const PAGE_SIZE = 25;

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

// ─── Voice Note Modal ────────────────────────────────────────

function VoiceNoteModal({
  contactId,
  contactName,
  onClose,
}: {
  contactId: number;
  contactName: string;
  onClose: () => void;
}) {
  const contactQuery = api.crm.getContact.useQuery({ id: contactId });
  const utils = api.useUtils();

  const voiceNotes = contactQuery.data?.voiceNotes ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2
            className="text-lg font-bold text-white"
            style={{ fontFamily: "Airwaves, sans-serif" }}
          >
            Voice Notes — {contactName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          {contactQuery.isLoading ? (
            <p className="py-4 text-center text-sm text-gray-500">Loading...</p>
          ) : (
            <VoiceNoteRecorder
              contactId={contactId}
              notes={voiceNotes}
              onUpdate={() => void utils.crm.getContact.invalidate({ id: contactId })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Quick Note Modal ────────────────────────────────────────

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
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2
            className="text-lg font-bold text-white"
            style={{ fontFamily: "Airwaves, sans-serif" }}
          >
            Note — {contactName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Add a note..."
            autoFocus
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
          />
          <div className="mt-3 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white"
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
              className="rounded-lg bg-gradient-to-r from-[#facf39] to-[#f59e0b] px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {addNoteMutation.isPending ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Contacts Page ───────────────────────────────────────────

function ContactsContent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [addedByFilter, setAddedByFilter] = useState("");
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    contact?: ContactModalProps["contact"];
  } | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [voiceNoteContact, setVoiceNoteContact] = useState<{ id: number; name: string } | null>(null);
  const [quickNoteContact, setQuickNoteContact] = useState<{ id: number; name: string } | null>(null);

  const contactsQuery = api.crm.getContacts.useQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
    addedBy: addedByFilter || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const teamQuery = api.crm.getTeamMembersWhoAddedContacts.useQuery();

  const contacts = contactsQuery.data?.contacts ?? [];
  const total = contactsQuery.data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

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

      {voiceNoteContact && (
        <VoiceNoteModal
          contactId={voiceNoteContact.id}
          contactName={voiceNoteContact.name}
          onClose={() => setVoiceNoteContact(null)}
        />
      )}

      {quickNoteContact && (
        <QuickNoteModal
          contactId={quickNoteContact.id}
          contactName={quickNoteContact.name}
          onClose={() => setQuickNoteContact(null)}
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

      {/* Desktop Table */}
      <Card className="hidden border-white/10 bg-white/5 md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Sources</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Associations</th>
                  <th className="px-5 py-3">Tags</th>
                  <th className="px-5 py-3">Last Contact</th>
                  <th className="px-5 py-3 text-right">Actions</th>
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
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/crm/contacts/${c.id}`}
                        className="font-medium text-white hover:text-[#facf39]"
                      >
                        {c.name ?? "—"}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-sm text-gray-400">{c.email}</div>
                      {c.phone && (
                        <div className="text-xs text-gray-500">{c.phone}</div>
                      )}
                    </td>
                    <td className="px-5 py-3">
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
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] ?? ""}`}
                      >
                        {STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {c.associations?.length > 0
                        ? c.associations.length <= 2
                          ? c.associations.map((a: { id: string; name: string }) => a.name).join(", ")
                          : `${c.associations[0]?.name}, +${c.associations.length - 1} more`
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {formatDate(c.lastContactDate)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setQuickNoteContact({ id: c.id, name: c.name ?? "Contact" })}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-[#facf39]"
                          title="Quick note"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setVoiceNoteContact({ id: c.id, name: c.name ?? "Contact" })}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-red-400"
                          title="Voice memo"
                        >
                          <Mic className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setModal({
                              mode: "edit",
                              contact: {
                                id: c.id,
                                name: c.name,
                                email: c.email,
                                phone: c.phone,
                                status: c.status,
                                tags: c.tags,
                                notes: c.notes,
                                createdAt: c.createdAt,
                                lastContactDate: c.lastContactDate,
                              },
                            })
                          }
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                          title="Edit contact"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
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
              <p className="mt-1 truncate text-sm text-gray-400">{c.email}</p>
              {c.phone && (
                <p className="text-xs text-gray-500">{c.phone}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
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
                <span>
                  {c.associations?.length > 0
                    ? c.associations.map((a: { id: string; name: string }) => a.name).join(", ")
                    : ""}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickNoteContact({ id: c.id, name: c.name ?? "Contact" });
                    }}
                    className="rounded p-1.5 text-gray-500 hover:bg-white/10 hover:text-[#facf39]"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVoiceNoteContact({ id: c.id, name: c.name ?? "Contact" });
                    }}
                    className="rounded p-1.5 text-gray-500 hover:bg-white/10 hover:text-red-400"
                  >
                    <Mic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModal({
                        mode: "edit",
                        contact: {
                          id: c.id,
                          name: c.name,
                          email: c.email,
                          phone: c.phone,
                          status: c.status,
                          tags: c.tags,
                          notes: c.notes,
                          createdAt: c.createdAt,
                          lastContactDate: c.lastContactDate,
                        },
                      });
                    }}
                    className="rounded p-1.5 text-gray-500 hover:bg-white/10 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <span className="ml-1">{formatDate(c.lastContactDate)}</span>
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
