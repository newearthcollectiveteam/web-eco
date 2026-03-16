"use client";

import { useState, useMemo, Suspense, lazy } from "react";
import Link from "next/link";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  MapPin,
  Users,
  List,
  GitBranch,
} from "lucide-react";
import { api } from "~/trpc/react";

// Lazy-load the graph to avoid SSR issues with ReactFlow
const CommunityGraph = lazy(() =>
  import("~/components/admin/crm/community-graph").then((m) => ({ default: m.CommunityGraph }))
);

// ─── Depth Color Palette ────────────────────────────────────
// Distinct hues per level — easy to scan at a glance
const DEPTH_COLORS = [
  "#FACF39", // Level 0 — gold (NEC brand)
  "#38BDF8", // Level 1 — sky blue
  "#A78BFA", // Level 2 — lavender
  "#34D399", // Level 3 — mint
  "#FB923C", // Level 4+ — tangerine
];

function getDepthColor(depth: number): string {
  return DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)]!;
}

// ─── Types ──────────────────────────────────────────────────

type TagNode = {
  id: number;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  color: string | null;
  parentId: number | null;
  displayOrder: number;
  contactCount: number;
  children: TagNode[];
};

// ─── Create/Edit Modal ──────────────────────────────────────

interface TagModalProps {
  tag?: TagNode;
  parentId?: number | null;
  allTags: TagNode[];
  onClose: () => void;
  onSuccess: () => void;
}

function TagModal({ tag, parentId, allTags, onClose, onSuccess }: TagModalProps) {
  // Collect all existing types from the tree
  const existingTypes = useMemo(() => {
    const types = new Set<string>();
    const walk = (nodes: TagNode[]) => {
      for (const n of nodes) {
        types.add(n.type);
        walk(n.children);
      }
    };
    walk(allTags);
    // Ensure defaults are always present
    types.add("community");
    types.add("location");
    return [...types].sort();
  }, [allTags]);

  // Compute depth of this tag for default color
  const computeDepth = (pId: number | null | undefined): number => {
    if (!pId) return 0;
    const findDepth = (nodes: TagNode[], targetId: number, d: number): number | null => {
      for (const n of nodes) {
        if (n.id === targetId) return d;
        const found = findDepth(n.children, targetId, d + 1);
        if (found !== null) return found;
      }
      return null;
    };
    return (findDepth(allTags, pId, 0) ?? 0) + 1;
  };

  const initialParent = tag?.parentId ?? parentId ?? null;
  const initialDepth = tag ? computeDepth(tag.parentId) : computeDepth(initialParent);

  const [name, setName] = useState(tag?.name ?? "");
  const [type, setType] = useState(tag?.type ?? "community");
  const [creatingType, setCreatingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [description, setDescription] = useState(tag?.description ?? "");
  const [color, setColor] = useState(tag?.color ?? getDepthColor(initialDepth));
  const [selectedParentId, setSelectedParentId] = useState<number | null>(initialParent);
  const [error, setError] = useState("");
  const [creatingParent, setCreatingParent] = useState(false);
  const [newParentName, setNewParentName] = useState("");

  const createMutation = api.crm.createCommunityTag.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = api.crm.updateCommunityTag.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  const createParentMutation = api.crm.createCommunityTag.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (tag) {
      updateMutation.mutate({
        id: tag.id,
        name: name.trim(),
        type,
        description: description.trim() || null,
        color: color || null,
        parentId: selectedParentId,
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        color: color || undefined,
        parentId: selectedParentId,
      });
    }
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  // Flatten tags for parent select (exclude self and descendants)
  const flattenForSelect = (nodes: TagNode[], exclude?: number): { id: number; name: string; depth: number }[] => {
    const result: { id: number; name: string; depth: number }[] = [];
    const walk = (items: TagNode[], depth: number) => {
      for (const item of items) {
        if (item.id === exclude) continue;
        result.push({ id: item.id, name: item.name, depth });
        walk(item.children, depth + 1);
      }
    };
    walk(nodes, 0);
    return result;
  };

  const parentOptions = flattenForSelect(allTags, tag?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2
            className="text-lg font-bold text-white"
            style={{ fontFamily: "Airwaves, sans-serif" }}
          >
            {tag ? "Edit" : "Add"} {type.charAt(0).toUpperCase() + type.slice(1)}
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
              placeholder="e.g. Emergence, Austin"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Type</label>
              {creatingType ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="New type name..."
                    autoFocus
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const t = newTypeName.trim().toLowerCase();
                        if (t) {
                          setType(t);
                          setCreatingType(false);
                          setNewTypeName("");
                        }
                      }
                      if (e.key === "Escape") {
                        setCreatingType(false);
                        setNewTypeName("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const t = newTypeName.trim().toLowerCase();
                      if (t) {
                        setType(t);
                        setCreatingType(false);
                        setNewTypeName("");
                      }
                    }}
                    disabled={!newTypeName.trim()}
                    className="rounded-lg bg-[#facf39]/20 px-2.5 py-2 text-sm text-[#facf39] hover:bg-[#facf39]/30 disabled:opacity-30"
                  >
                    Set
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatingType(false);
                      setNewTypeName("");
                    }}
                    className="rounded-lg border border-white/10 px-2.5 py-2 text-sm text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/50 focus:outline-none"
                  >
                    {existingTypes.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setCreatingType(true)}
                    title="Create new type"
                    className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-gray-400 hover:text-[#facf39]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Color</label>
              <div className="flex items-center gap-3">
                <label
                  className="relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 transition-colors hover:border-white/30"
                  style={{ backgroundColor: color, borderColor: `${color}88` }}
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </label>
                <div className="flex flex-1 flex-col gap-1.5">
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
                    placeholder="#facf39"
                  />
                  {/* Golden gradation presets */}
                  <div className="flex gap-1">
                    {DEPTH_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="h-5 w-5 rounded-full border transition-transform hover:scale-125"
                        style={{
                          backgroundColor: c,
                          borderColor: color === c ? "#fff" : `${c}88`,
                          borderWidth: color === c ? "2px" : "1px",
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-400">Parent</label>
            {creatingParent ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  placeholder="New parent name..."
                  autoFocus
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setCreatingParent(false);
                      setNewParentName("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newParentName.trim()) return;
                    try {
                      const result = await createParentMutation.mutateAsync({
                        name: newParentName.trim(),
                        type: "community",
                      });
                      if (result) {
                        setSelectedParentId(result.id);
                        onSuccess(); // Refresh the tags tree
                      }
                      setCreatingParent(false);
                      setNewParentName("");
                    } catch {
                      setError("Failed to create parent");
                    }
                  }}
                  disabled={!newParentName.trim() || createParentMutation.isPending}
                  className="rounded-lg bg-[#facf39]/20 px-3 py-2 text-sm text-[#facf39] hover:bg-[#facf39]/30 disabled:opacity-30"
                >
                  {createParentMutation.isPending ? "..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreatingParent(false);
                    setNewParentName("");
                  }}
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  value={selectedParentId ?? ""}
                  onChange={(e) => {
                    const newParent = e.target.value ? Number(e.target.value) : null;
                    setSelectedParentId(newParent);
                    // Auto-update color to match new depth level
                    if (!tag) {
                      setColor(getDepthColor(computeDepth(newParent)));
                    }
                  }}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/50 focus:outline-none"
                >
                  <option value="">None (top level)</option>
                  {parentOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {"  ".repeat(opt.depth)}{opt.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setCreatingParent(true)}
                  title="Create new parent"
                  className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400 hover:text-[#facf39]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
              placeholder="Optional description..."
            />
          </div>

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
              {pending ? "Saving..." : tag ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tree Node ──────────────────────────────────────────────

interface TreeNodeProps {
  node: TagNode;
  depth: number;
  allTags: TagNode[];
  onEdit: (tag: TagNode) => void;
  onAddChild: (parentId: number) => void;
  onDelete: (tag: TagNode) => void;
}

function TreeNode({ node, depth, allTags, onEdit, onAddChild, onDelete }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const Icon = node.type === "location" ? MapPin : Users;
  // Always use depth-based golden gradation on the tree view
  const nodeColor = getDepthColor(depth);

  return (
    <div>
      <div
        className="group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/5"
        style={{ paddingLeft: `${Math.min(depth * 24, 72) + 12}px` }}
      >
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`shrink-0 rounded p-0.5 text-gray-500 hover:text-white ${!hasChildren ? "invisible" : ""}`}
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Icon */}
        <Icon
          className="h-4 w-4 shrink-0"
          style={{ color: nodeColor }}
        />

        {/* Name + badge */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-sm font-medium text-white">{node.name}</span>
          <Badge
            variant="outline"
            className="shrink-0 text-[10px]"
            style={{
              borderColor: `${nodeColor}66`,
              color: nodeColor,
            }}
          >
            {node.type}
          </Badge>
          {node.contactCount > 0 ? (
            <Link
              href={`/admin/crm/contacts?community=${node.id}`}
              className="shrink-0 text-xs text-gray-500 hover:text-[#facf39] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {node.contactCount} {node.contactCount === 1 ? "contact" : "contacts"}
            </Link>
          ) : (
            <span className="shrink-0 text-xs text-gray-500">0 contacts</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <button
            onClick={() => onAddChild(node.id)}
            title="Add child"
            className="rounded p-1 text-gray-500 hover:bg-white/10 hover:text-[#facf39]"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onEdit(node)}
            title="Edit"
            className="rounded p-1 text-gray-500 hover:bg-white/10 hover:text-white"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(node)}
            title={node.contactCount > 0 ? `Delete (${node.contactCount} contacts will be untagged)` : "Delete"}
            className="rounded p-1 text-gray-500 hover:bg-white/10 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              allTags={allTags}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Communities Content ─────────────────────────────────────

function CommunitiesContent() {
  const [activeView, setActiveView] = useState<"tree" | "graph">("tree");
  const [modal, setModal] = useState<{
    tag?: TagNode;
    parentId?: number | null;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<TagNode | null>(null);

  const tagsQuery = api.crm.getCommunityTags.useQuery();
  const deleteMutation = api.crm.deleteCommunityTag.useMutation({
    onSuccess: () => {
      setDeleteConfirm(null);
      void tagsQuery.refetch();
    },
  });

  const tags = tagsQuery.data ?? [];

  // Compute totals
  const countAll = (nodes: TagNode[]): number =>
    nodes.reduce((sum, n) => sum + n.contactCount + countAll(n.children), 0);
  const totalTaggings = countAll(tags);
  const flatCount = (nodes: TagNode[]): number =>
    nodes.reduce((sum, n) => sum + 1 + flatCount(n.children), 0);
  const totalTags = flatCount(tags);

  return (
    <div className="space-y-6">
      {modal && (
        <TagModal
          tag={modal.tag}
          parentId={modal.parentId}
          allTags={tags}
          onClose={() => setModal(null)}
          onSuccess={() => void tagsQuery.refetch()}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl">
            <h3 className="text-sm font-medium text-white">Delete &quot;{deleteConfirm.name}&quot;?</h3>
            <p className="mt-2 text-xs text-gray-400">
              This will remove the tag. Any child tags will become top-level.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate({ id: deleteConfirm.id })}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            Communities
          </h1>
          <p className="text-sm text-gray-400">
            {totalTags} tags &middot; {totalTaggings} taggings
          </p>
        </div>
        <button
          onClick={() => setModal({ parentId: null })}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#facf39] to-[#f59e0b] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Tag
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
        <button
          onClick={() => setActiveView("tree")}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeView === "tree"
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <List className="h-4 w-4" />
          Tree
        </button>
        <button
          onClick={() => setActiveView("graph")}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeView === "graph"
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <GitBranch className="h-4 w-4" />
          Graph
        </button>
      </div>

      {/* Tree View */}
      {activeView === "tree" && (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-2">
            {tagsQuery.isLoading && (
              <p className="py-12 text-center text-sm text-gray-500">Loading...</p>
            )}
            {!tagsQuery.isLoading && tags.length === 0 && (
              <p className="py-12 text-center text-sm text-gray-500">
                No community tags yet. Create one to get started.
              </p>
            )}
            {tags.map((tag) => (
              <TreeNode
                key={tag.id}
                node={tag}
                depth={0}
                allTags={tags}
                onEdit={(t) => setModal({ tag: t })}
                onAddChild={(parentId) => setModal({ parentId })}
                onDelete={(t) => setDeleteConfirm(t)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Graph View */}
      {activeView === "graph" && (
        <Suspense
          fallback={
            <div className="flex h-[600px] items-center justify-center rounded-xl border border-white/10 bg-neutral-950">
              <span className="text-sm text-gray-500">Loading graph...</span>
            </div>
          }
        >
          {tags.length > 0 ? (
            <CommunityGraph tags={tags} onRefresh={() => void tagsQuery.refetch()} />
          ) : (
            <div className="flex h-[600px] items-center justify-center rounded-xl border border-white/10 bg-neutral-950">
              <span className="text-sm text-gray-500">No community tags yet</span>
            </div>
          )}
        </Suspense>
      )}
    </div>
  );
}

export default function CommunitiesPage() {
  return (
    <Suspense fallback={null}>
      <CommunitiesContent />
    </Suspense>
  );
}
