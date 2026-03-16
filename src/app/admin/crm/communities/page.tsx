"use client";

import { useState, Suspense } from "react";
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
} from "lucide-react";
import { api } from "~/trpc/react";

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
  const [name, setName] = useState(tag?.name ?? "");
  const [type, setType] = useState<"community" | "location">(
    (tag?.type as "community" | "location") ?? "community"
  );
  const [description, setDescription] = useState(tag?.description ?? "");
  const [color, setColor] = useState(tag?.color ?? "#facf39");
  const [selectedParentId, setSelectedParentId] = useState<number | null>(
    tag?.parentId ?? parentId ?? null
  );
  const [error, setError] = useState("");

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
            {tag ? "Edit" : "Add"} {type === "location" ? "Location" : "Community"}
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
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "community" | "location")}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/50 focus:outline-none"
              >
                <option value="community">Community</option>
                <option value="location">Location</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border border-white/10 bg-transparent"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
                  placeholder="#facf39"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-400">Parent</label>
            <select
              value={selectedParentId ?? ""}
              onChange={(e) =>
                setSelectedParentId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/50 focus:outline-none"
            >
              <option value="">None (top level)</option>
              {parentOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {"  ".repeat(opt.depth)}{opt.name}
                </option>
              ))}
            </select>
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

  return (
    <div>
      <div
        className="group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/5"
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
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
          style={{ color: node.color ?? "#9ca3af" }}
        />

        {/* Name + badge */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-sm font-medium text-white">{node.name}</span>
          <Badge
            variant="outline"
            className="shrink-0 text-[10px]"
            style={{
              borderColor: node.color ? `${node.color}66` : undefined,
              color: node.color ?? undefined,
            }}
          >
            {node.type}
          </Badge>
          <span className="shrink-0 text-xs text-gray-500">
            {node.contactCount} {node.contactCount === 1 ? "contact" : "contacts"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
          {node.contactCount === 0 && (
            <button
              onClick={() => onDelete(node)}
              title="Delete"
              className="rounded p-1 text-gray-500 hover:bg-white/10 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
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

      {/* Tree View */}
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
