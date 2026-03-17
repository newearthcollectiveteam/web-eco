"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Mail,
  Phone,
  Loader2,
  Users,
} from "lucide-react";
import { api } from "~/trpc/react";

const ROLE_OPTIONS = [
  "founder",
  "admin",
  "community_lead",
  "developer",
  "designer",
  "content_creator",
] as const;

const ROLE_LABELS: Record<string, string> = {
  founder: "Founder",
  admin: "Admin",
  community_lead: "Community Lead",
  developer: "Developer",
  designer: "Designer",
  content_creator: "Content Creator",
};

const PAGE_SIZE = 25;

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-[#FACF39]"
      style={{
        borderColor: "rgba(250, 207, 57, 0.3)",
        backgroundColor: "rgba(250, 207, 57, 0.08)",
      }}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function RoleCheckboxGroup({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (roles: string[]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ROLE_OPTIONS.map((role) => {
        const checked = selected.includes(role);
        return (
          <label
            key={role}
            className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
              checked
                ? "border-[#FACF39]/50 bg-[#FACF39]/10 text-white"
                : "border-white/10 bg-white/5 text-neutral-400 hover:border-white/20"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() =>
                onChange(
                  checked
                    ? selected.filter((r) => r !== role)
                    : [...selected, role]
                )
              }
              className="sr-only"
            />
            <div
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                checked
                  ? "border-[#FACF39] bg-[#FACF39]"
                  : "border-neutral-600 bg-transparent"
              }`}
            >
              {checked && (
                <svg
                  className="h-3 w-3 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            {ROLE_LABELS[role]}
          </label>
        );
      })}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg bg-white/5 p-4"
        >
          <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
          <div className="ml-auto h-4 w-16 animate-pulse rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function CreateMemberModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roles, setRoles] = useState<string[]>([]);

  const utils = api.useUtils();
  const createMember = api.team.create.useMutation({
    onSuccess: () => {
      void utils.team.list.invalidate();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMember.mutate({
      name,
      email,
      phone: phone || undefined,
      teamRoles: roles as (typeof ROLE_OPTIONS)[number][],
    });
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
        className="relative w-full max-w-lg rounded-xl border bg-[#0a0a0a] p-6"
        style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 text-lg font-semibold text-white">
          Add Team Member
        </h2>
        <p className="mb-6 text-sm text-neutral-400">
          They&apos;ll receive an invite to claim their account.
        </p>

        {createMember.error && (
          <div className="mb-4 rounded-md border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            {createMember.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block w-full rounded-md border bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
              style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full rounded-md border bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
              style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
              placeholder="jane@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Phone <span className="text-neutral-500">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="block w-full rounded-md border bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
              style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
              placeholder="+1 555 123 4567"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Roles
            </label>
            <RoleCheckboxGroup selected={roles} onChange={setRoles} />
          </div>

          <button
            type="submit"
            disabled={createMember.isPending}
            className="flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-black transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #FFF3C4 0%, #FACF39 100%)",
            }}
          >
            {createMember.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Member
          </button>
        </form>
      </div>
    </div>
  );
}

function EditMemberModal({
  member,
  onClose,
}: {
  member: {
    id: string;
    fullName: string | null;
    email: string;
    phone: string | null;
    teamRoles: string[] | null;
  };
  onClose: () => void;
}) {
  const [name, setName] = useState(member.fullName ?? "");
  const [email, setEmail] = useState(member.email);
  const [phone, setPhone] = useState(member.phone ?? "");
  const [roles, setRoles] = useState<string[]>(member.teamRoles ?? []);

  const utils = api.useUtils();
  const updateMember = api.team.update.useMutation({
    onSuccess: () => {
      void utils.team.list.invalidate();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMember.mutate({
      id: member.id,
      name,
      email,
      phone: phone || undefined,
      teamRoles: roles as (typeof ROLE_OPTIONS)[number][],
    });
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
        className="relative w-full max-w-lg rounded-xl border bg-[#0a0a0a] p-6"
        style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 text-lg font-semibold text-white">Edit Member</h2>
        <p className="mb-6 text-sm text-neutral-400">
          Update team member details and status.
        </p>

        {updateMember.error && (
          <div className="mb-4 rounded-md border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            {updateMember.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block w-full rounded-md border bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
              style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full rounded-md border bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
              style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Phone <span className="text-neutral-500">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="block w-full rounded-md border bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
              style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Roles
            </label>
            <RoleCheckboxGroup selected={roles} onChange={setRoles} />
          </div>

          <button
            type="submit"
            disabled={updateMember.isPending}
            className="flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-black transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #FFF3C4 0%, #FACF39 100%)",
            }}
          >
            {updateMember.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

function DeleteMemberModal({
  member,
  onClose,
}: {
  member: { id: string; fullName: string | null; email: string };
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const deleteMember = api.team.delete.useMutation({
    onSuccess: () => {
      void utils.team.list.invalidate();
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
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 text-lg font-semibold text-white">Delete Member</h2>
        <p className="mb-6 text-sm text-neutral-400">
          Permanently remove{" "}
          <span className="text-white">{member.fullName ?? member.email}</span>{" "}
          and their auth account? This cannot be undone.
        </p>

        {deleteMember.error && (
          <div className="mb-4 rounded-md border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            {deleteMember.error.message}
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
            onClick={() => deleteMember.mutate({ id: member.id })}
            disabled={deleteMember.isPending}
            className="flex flex-1 items-center justify-center rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleteMember.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [editMember, setEditMember] = useState<{
    id: string;
    fullName: string | null;
    email: string;
    phone: string | null;
    teamRoles: string[] | null;
  } | null>(null);
  const [deleteMember, setDeleteMember] = useState<{
    id: string;
    fullName: string | null;
    email: string;
  } | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = api.team.list.useQuery({
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Manage team members, roles, and account access.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="block w-full rounded-md border bg-white/5 py-2 pr-4 pl-9 text-sm text-white placeholder-neutral-500 focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
              style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
            className="rounded-md border bg-white/5 px-3 py-2 text-sm text-white focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
            style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
          >
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {data && (
            <span className="flex items-center gap-1.5 text-sm text-neutral-400">
              <Users className="h-4 w-4" />
              {data.total} member{data.total !== 1 ? "s" : ""}
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
            Add Member
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : !data?.members.length ? (
        <div
          className="rounded-xl border py-16 text-center"
          style={{ borderColor: "rgba(250, 207, 57, 0.1)" }}
        >
          <Users className="mx-auto mb-3 h-10 w-10 text-neutral-600" />
          <p className="text-sm text-neutral-400">
            {debouncedSearch
              ? "No members match your search."
              : "No team members yet. Add your first member."}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card List */}
          <div className="space-y-3 md:hidden">
            {data.members.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border p-4"
                style={{ borderColor: "rgba(250, 207, 57, 0.1)" }}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-white">
                    {m.fullName ?? "—"}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setEditMember({
                          id: m.id,
                          fullName: m.fullName,
                          email: m.email,
                          phone: m.phone,
                          teamRoles: m.teamRoles,
                        })
                      }
                      className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteMember({
                          id: m.id,
                          fullName: m.fullName,
                          email: m.email,
                        })
                      }
                      className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-300">
                  <Mail className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="truncate">{m.email}</span>
                </div>
                {m.phone && (
                  <div className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-300">
                    <Phone className="h-3.5 w-3.5 text-neutral-500" />
                    {m.phone}
                  </div>
                )}
                {m.teamRoles?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.teamRoles.map((r) => (
                      <RoleBadge key={r} role={r} />
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div
            className="hidden overflow-x-auto rounded-xl border md:block"
            style={{ borderColor: "rgba(250, 207, 57, 0.1)" }}
          >
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs tracking-wider text-neutral-500 uppercase">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Roles</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.members.map((m) => (
                  <tr
                    key={m.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {m.fullName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-300">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-neutral-500" />
                        {m.email}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-300">
                      {m.phone ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-neutral-500" />
                          {m.phone}
                        </span>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {m.teamRoles?.length ? (
                          m.teamRoles.map((r) => <RoleBadge key={r} role={r} />)
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            setEditMember({
                              id: m.id,
                              fullName: m.fullName,
                              email: m.email,
                              phone: m.phone,
                              teamRoles: m.teamRoles,
                            })
                          }
                          className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteMember({
                              id: m.id,
                              fullName: m.fullName,
                              email: m.email,
                            })
                          }
                          className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-neutral-300 transition-colors hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data?.hasMore}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-neutral-300 transition-colors hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreate && <CreateMemberModal onClose={() => setShowCreate(false)} />}
      {editMember && (
        <EditMemberModal
          member={editMember}
          onClose={() => setEditMember(null)}
        />
      )}
      {deleteMember && (
        <DeleteMemberModal
          member={deleteMember}
          onClose={() => setDeleteMember(null)}
        />
      )}
    </div>
  );
}
