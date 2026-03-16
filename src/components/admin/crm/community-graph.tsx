"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type EdgeProps,
  type Connection,
  type OnConnect,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  MapPin,
  Users,
  Pencil,
  Plus,
  Trash2,
  Save,
  X,
  ArrowUpFromLine,
  Unlock,
  AlertTriangle,
  Undo2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import Link from "next/link";
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

type PendingChange =
  | { action: "reparent"; tagId: number; oldParentId: number | null; newParentId: number | null; tagName: string }
  | { action: "create"; name: string; type: string; parentId: number | null; tempId: string }
  | { action: "update"; tagId: number; field: string; oldValue: string; newValue: string; tagName: string }
  | { action: "delete"; tagId: number; tagName: string; contactCount: number }
  | { action: "insert_above"; tempId: string; name: string; type: string; childTagId: number; childTagName: string; parentId: number | null };

// Depth colors matching the tree view
const DEPTH_COLORS = [
  "#FACF39",
  "#38BDF8",
  "#A78BFA",
  "#34D399",
  "#FB923C",
];

function getDepthColor(depth: number): string {
  return DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)]!;
}

// ─── Custom Nodes ───────────────────────────────────────────

interface CommunityNodeData {
  label: string;
  type: string;
  contactCount: number;
  depth: number;
  tagId: number;
  tempId?: string;
  isEditing: boolean;
  isNew: boolean;
  isModified: boolean;
  isDeleted: boolean;
  parentId: number | null;
  onEdit: (tagId: number) => void;
  onAddChild: (parentId: number) => void;
  onDelete: (tagId: number) => void;
  onDeleteNew: (tempId: string) => void;
  onInsertAbove: (tagId: number) => void;
  [key: string]: unknown;
}

function CommunityNodeView({ data }: { data: CommunityNodeData }) {
  const color = getDepthColor(data.depth);
  const Icon = data.type === "location" ? MapPin : Users;

  const borderStyle = data.isNew
    ? "border-dashed border-green-400"
    : data.isDeleted
      ? "border-dashed border-red-400 opacity-50"
      : data.isModified
        ? "border-dashed"
        : "";

  return (
    <div
      className={`group relative rounded-xl border-2 bg-neutral-900 px-4 py-3 shadow-lg transition-all hover:shadow-xl ${borderStyle}`}
      style={{
        borderColor: data.isNew ? undefined : data.isDeleted ? undefined : data.isModified ? "#FB923C" : color,
        minWidth: 160,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-white/30 !border-0 !w-3 !h-3 !-top-1.5"
        isConnectable={data.isEditing}
      />

      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" style={{ color }} />
        <span className="text-sm font-medium text-white">{data.label}</span>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-3">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {data.type}
        </span>
        {!data.isEditing && data.contactCount > 0 ? (
          <Link
            href={`/admin/crm/contacts?community=${data.tagId}`}
            className="text-xs hover:underline"
            style={{ color }}
            onClick={(e) => e.stopPropagation()}
          >
            {data.contactCount}
          </Link>
        ) : (
          <span className="text-[11px] text-gray-600">
            {data.contactCount || 0}
          </span>
        )}
      </div>

      {/* Edit mode action buttons — onMouseDown stop is critical to prevent React Flow drag */}
      {data.isEditing && !data.isDeleted && (
        <div
          className="absolute -right-1 -top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => data.onEdit(data.tagId)}
            className="rounded-full bg-neutral-800 p-1.5 text-gray-400 shadow-md hover:bg-neutral-700 hover:text-white"
            title="Edit"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={() => data.onInsertAbove(data.tagId)}
            className="rounded-full bg-neutral-800 p-1.5 text-gray-400 shadow-md hover:bg-neutral-700 hover:text-blue-400"
            title="Insert parent above"
          >
            <ArrowUpFromLine className="h-3 w-3" />
          </button>
          <button
            onClick={() => data.onAddChild(data.tagId)}
            className="rounded-full bg-neutral-800 p-1.5 text-gray-400 shadow-md hover:bg-neutral-700 hover:text-green-400"
            title="Add child below"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            onClick={() => {
              if (data.isNew && data.tempId) {
                data.onDeleteNew(data.tempId);
              } else {
                data.onDelete(data.tagId);
              }
            }}
            className="rounded-full bg-neutral-800 p-1.5 text-gray-400 shadow-md hover:bg-neutral-700 hover:text-red-400"
            title={data.contactCount > 0 ? `Delete (${data.contactCount} contacts will be untagged)` : "Delete"}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-white/30 !border-0 !w-3 !h-3 !-bottom-1.5"
        isConnectable={data.isEditing}
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  community: CommunityNodeView,
};

// ─── Custom Edge with Midpoint Plus Button ──────────────────

function EditableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const edgeData = data as { isEditing?: boolean; onInsertOnEdge?: (parentId: number, childId: number) => void; parentTagId?: number; childTagId?: number } | undefined;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      {edgeData?.isEditing && edgeData.onInsertOnEdge && (
        <EdgeLabelRenderer>
          <button
            className="nodrag nopan pointer-events-auto flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 text-gray-500 shadow-md transition-all hover:scale-125 hover:bg-neutral-700 hover:text-green-400"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
            onClick={() => {
              if (edgeData?.onInsertOnEdge && edgeData.parentTagId && edgeData.childTagId) {
                edgeData.onInsertOnEdge(edgeData.parentTagId, edgeData.childTagId);
              }
            }}
            title="Insert node here"
          >
            <Plus className="h-3 w-3" />
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const edgeTypes: EdgeTypes = {
  editable: EditableEdge,
};

// ─── Edit Modal ─────────────────────────────────────────────

function NodeEditModal({
  tagId: _tagId,
  initialName,
  initialType,
  initialDescription,
  onSave,
  onClose,
}: {
  tagId: number;
  initialName: string;
  initialType: string;
  initialDescription: string;
  onSave: (updates: { name?: string; type?: string; description?: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [type, setType] = useState(initialType);
  const [description, setDescription] = useState(initialDescription);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h3 className="text-sm font-medium text-white">Edit Node</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/50 focus:outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/50 focus:outline-none"
            >
              <option value="community">Community</option>
              <option value="location">Location</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
              placeholder="Optional..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const updates: { name?: string; type?: string; description?: string } = {};
                if (name !== initialName) updates.name = name;
                if (type !== initialType) updates.type = type;
                if (description !== initialDescription) updates.description = description;
                onSave(updates);
              }}
              className="rounded-lg bg-[#facf39]/20 px-4 py-1.5 text-sm text-[#facf39] hover:bg-[#facf39]/30"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add Child Modal ────────────────────────────────────────

function AddChildModal({
  parentName,
  onSave,
  onClose,
}: {
  parentName: string;
  onSave: (name: string, type: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("community");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h3 className="text-sm font-medium text-white">
            Add child to <span className="text-[#facf39]">{parentName}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/50 focus:outline-none"
              placeholder="e.g. Austin, Emergence..."
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/50 focus:outline-none"
            >
              <option value="community">Community</option>
              <option value="location">Location</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (name.trim()) onSave(name.trim(), type);
              }}
              disabled={!name.trim()}
              className="rounded-lg bg-green-600/20 px-4 py-1.5 text-sm text-green-400 hover:bg-green-600/30 disabled:opacity-30"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Layout Engine ──────────────────────────────────────────

const NODE_WIDTH = 180;
const NODE_HEIGHT = 70;
const H_GAP = 40;
const V_GAP = 100;

// ─── Virtual Node for preview tree ──────────────────────────

type VNode = {
  id: string;           // "tag-123" for real, "new-temp-1" for new
  tagId: number;        // 0 for new nodes
  tempId?: string;      // only for new nodes
  name: string;
  type: string;
  contactCount: number;
  parentVId: string | null;
  children: VNode[];
  isNew: boolean;
  isModified: boolean;
  isDeleted: boolean;
};

function buildVirtualTree(
  roots: TagNode[],
  modifications: {
    newNodes: Map<string, { name: string; type: string; parentId: number }>;
    updatedNodes: Map<number, { name?: string; type?: string }>;
    deletedNodes: Set<number>;
    reparented: Map<number, number | null>;
    insertAboveNodes: Map<string, { name: string; type: string; childTagId: number; parentId: number | null }>;
  }
): VNode[] {
  // Step 1: Flatten all real tags into a map of VNodes (no children yet)
  const vNodeMap = new Map<string, VNode>();

  const flattenReal = (nodes: TagNode[]) => {
    for (const n of nodes) {
      const updates = modifications.updatedNodes.get(n.id);
      const vid = `tag-${n.id}`;
      // Determine effective parentId considering reparents
      let effectiveParentId = n.parentId;
      if (modifications.reparented.has(n.id)) {
        effectiveParentId = modifications.reparented.get(n.id) ?? null;
      }

      vNodeMap.set(vid, {
        id: vid,
        tagId: n.id,
        name: updates?.name ?? n.name,
        type: updates?.type ?? n.type,
        contactCount: n.contactCount,
        parentVId: effectiveParentId !== null ? `tag-${effectiveParentId}` : null,
        children: [],
        isNew: false,
        isModified: updates !== undefined || modifications.reparented.has(n.id),
        isDeleted: modifications.deletedNodes.has(n.id),
      });
      flattenReal(n.children);
    }
  };
  flattenReal(roots);

  // Step 2: Process insert-above nodes — each creates a new VNode between parent and child
  for (const [tempId, insert] of modifications.insertAboveNodes) {
    const newVId = `new-${tempId}`;
    const childVId = `tag-${insert.childTagId}`;
    const parentVId = insert.parentId !== null ? `tag-${insert.parentId}` : null;

    // Create the new intermediate node
    vNodeMap.set(newVId, {
      id: newVId,
      tagId: 0,
      tempId,
      name: insert.name,
      type: insert.type,
      contactCount: 0,
      parentVId,
      children: [],
      isNew: true,
      isModified: false,
      isDeleted: false,
    });

    // Reparent the child under the new node
    const childNode = vNodeMap.get(childVId);
    if (childNode) {
      childNode.parentVId = newVId;
      if (!childNode.isModified) childNode.isModified = true;
    }
  }

  // Step 3: Add simple new child nodes
  for (const [tempId, newNode] of modifications.newNodes) {
    const newVId = `new-${tempId}`;
    if (vNodeMap.has(newVId)) continue; // skip if already added as insert-above
    const parentVId = newNode.parentId === 0 ? null : `tag-${newNode.parentId}`;
    vNodeMap.set(newVId, {
      id: newVId,
      tagId: 0,
      tempId,
      name: newNode.name,
      type: newNode.type,
      contactCount: 0,
      parentVId,
      children: [],
      isNew: true,
      isModified: false,
      isDeleted: false,
    });
  }

  // Step 4: Build tree from flat VNodes
  const vRoots: VNode[] = [];
  for (const vn of vNodeMap.values()) {
    if (vn.isDeleted) continue;
    if (vn.parentVId && vNodeMap.has(vn.parentVId)) {
      const parent = vNodeMap.get(vn.parentVId)!;
      if (!parent.isDeleted) {
        parent.children.push(vn);
        continue;
      }
    }
    vRoots.push(vn);
  }

  return vRoots;
}

// ─── Layout from Virtual Tree ───────────────────────────────

function layoutTree(
  roots: TagNode[],
  isEditing: boolean,
  handlers: {
    onEdit: (tagId: number) => void;
    onAddChild: (parentId: number) => void;
    onDelete: (tagId: number) => void;
    onDeleteNew: (tempId: string) => void;
    onInsertAbove: (tagId: number) => void;
    onInsertOnEdge: (parentId: number, childId: number) => void;
  },
  modifications: {
    newNodes: Map<string, { name: string; type: string; parentId: number }>;
    updatedNodes: Map<number, { name?: string; type?: string }>;
    deletedNodes: Set<number>;
    reparented: Map<number, number | null>;
    insertAboveNodes: Map<string, { name: string; type: string; childTagId: number; parentId: number | null }>;
  }
): { nodes: Node<CommunityNodeData>[]; edges: Edge[] } {
  const vRoots = buildVirtualTree(roots, modifications);
  const outNodes: Node<CommunityNodeData>[] = [];
  const outEdges: Edge[] = [];

  function subtreeWidth(vn: VNode): number {
    if (vn.children.length === 0) return NODE_WIDTH;
    const w = vn.children.reduce((sum, c) => sum + subtreeWidth(c) + H_GAP, -H_GAP);
    return Math.max(NODE_WIDTH, w);
  }

  function positionNode(vn: VNode, x: number, y: number, depth: number, parentFlowId: string | null) {
    outNodes.push({
      id: vn.id,
      type: "community",
      position: { x, y },
      draggable: isEditing,
      data: {
        label: vn.name,
        type: vn.type,
        contactCount: vn.contactCount,
        depth,
        tagId: vn.tagId,
        tempId: vn.tempId,
        parentId: null, // not needed for display
        isEditing,
        isNew: vn.isNew,
        isModified: vn.isModified,
        isDeleted: false,
        onEdit: handlers.onEdit,
        onAddChild: handlers.onAddChild,
        onDelete: handlers.onDelete,
        onDeleteNew: handlers.onDeleteNew,
        onInsertAbove: handlers.onInsertAbove,
      },
    });

    // Edge from parent
    if (parentFlowId) {
      const edgeColor = vn.isNew ? "#34D399" : vn.isModified ? "#FB923C" : getDepthColor(Math.max(0, depth - 1));
      const isDashed = vn.isNew || vn.isModified;

      outEdges.push({
        id: `edge-${parentFlowId}-${vn.id}`,
        source: parentFlowId,
        target: vn.id,
        style: {
          stroke: edgeColor,
          strokeWidth: 2,
          opacity: 0.6,
          strokeDasharray: isDashed ? "5 5" : undefined,
        },
        type: isEditing ? "editable" : "default",
        data: isEditing ? {
          isEditing: true,
          onInsertOnEdge: handlers.onInsertOnEdge,
          parentTagId: parentFlowId.startsWith("tag-") ? parseInt(parentFlowId.replace("tag-", ""), 10) : 0,
          childTagId: vn.tagId,
        } : undefined,
      });
    }

    if (vn.children.length === 0) return;

    const totalW = vn.children.reduce((sum, c) => sum + subtreeWidth(c) + H_GAP, -H_GAP);
    let childX = x + NODE_WIDTH / 2 - totalW / 2;
    const childY = y + V_GAP + NODE_HEIGHT;

    for (const child of vn.children) {
      const cw = subtreeWidth(child);
      const cx = childX + cw / 2 - NODE_WIDTH / 2;
      positionNode(child, cx, childY, depth + 1, vn.id);
      childX += cw + H_GAP;
    }
  }

  let rootX = 0;
  for (const vRoot of vRoots) {
    const w = subtreeWidth(vRoot);
    positionNode(vRoot, rootX + w / 2 - NODE_WIDTH / 2, 0, 0, null);
    rootX += w + H_GAP * 2;
  }

  return { nodes: outNodes, edges: outEdges };
}

// ─── Flatten helper ─────────────────────────────────────────

function flattenTags(roots: TagNode[]): Map<number, TagNode> {
  const map = new Map<number, TagNode>();
  const walk = (nodes: TagNode[]) => {
    for (const n of nodes) {
      map.set(n.id, n);
      walk(n.children);
    }
  };
  walk(roots);
  return map;
}

// ─── Graph Component ────────────────────────────────────────

interface CommunityGraphProps {
  tags: TagNode[];
  onRefresh: () => void;
}

export function CommunityGraph({ tags, onRefresh }: CommunityGraphProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editModal, setEditModal] = useState<number | null>(null);
  const [addChildModal, setAddChildModal] = useState<number | null>(null);
  const [insertAboveModal, setInsertAboveModal] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Pending changes (not yet committed to DB)
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [newNodes, setNewNodes] = useState<Map<string, { name: string; type: string; parentId: number }>>(new Map());
  const [updatedNodes, setUpdatedNodes] = useState<Map<number, { name?: string; type?: string; description?: string }>>(new Map());
  const [deletedNodes, setDeletedNodes] = useState<Set<number>>(new Set());
  const [reparented, setReparented] = useState<Map<number, number | null>>(new Map());
  // Insert-above: tempId → { name, type, childTagId (existing node that goes below), parentId (existing parent) }
  const [insertAboveNodes, setInsertAboveNodes] = useState<Map<string, { name: string; type: string; childTagId: number; parentId: number | null }>>(new Map());

  const tagMap = useMemo(() => flattenTags(tags), [tags]);
  const tempIdCounter = useRef(0);

  // Mutations
  const createMutation = api.crm.createCommunityTag.useMutation();
  const updateMutation = api.crm.updateCommunityTag.useMutation();
  const deleteMutation = api.crm.deleteCommunityTag.useMutation();

  // Handlers
  const handleEdit = useCallback((tagId: number) => {
    setEditModal(tagId);
  }, []);

  const handleAddChild = useCallback((parentId: number) => {
    setAddChildModal(parentId);
  }, []);

  const handleDelete = useCallback((tagId: number) => {
    const tag = tagMap.get(tagId);
    if (!tag) return;
    setDeletedNodes((prev) => new Set(prev).add(tagId));
    setPendingChanges((prev) => [...prev, { action: "delete", tagId, tagName: tag.name, contactCount: tag.contactCount }]);
  }, [tagMap]);

  const handleDeleteNew = useCallback((tempId: string) => {
    setNewNodes((prev) => {
      const next = new Map(prev);
      next.delete(tempId);
      return next;
    });
    setInsertAboveNodes((prev) => {
      const next = new Map(prev);
      next.delete(tempId);
      return next;
    });
    // Remove the matching pending change
    setPendingChanges((prev) => prev.filter((c) =>
      !((c.action === "create" && c.tempId === tempId) || (c.action === "insert_above" && c.tempId === tempId))
    ));
  }, []);

  const handleInsertAbove = useCallback((tagId: number) => {
    setInsertAboveModal(tagId);
  }, []);

  // Insert on edge: parentId is the source, childId is the target
  const [insertOnEdgeModal, setInsertOnEdgeModal] = useState<{ parentId: number; childId: number } | null>(null);
  const [addRootModal, setAddRootModal] = useState(false);

  const handleInsertOnEdge = useCallback((parentId: number, childId: number) => {
    setInsertOnEdgeModal({ parentId, childId });
  }, []);

  const handleInsertOnEdgeSave = useCallback((parentId: number, childId: number, name: string, type: string) => {
    // This is the same as insert-above on the child node
    const childTag = tagMap.get(childId);
    if (!childTag) return;

    const tempId = `temp-${++tempIdCounter.current}`;

    setInsertAboveNodes((prev) => {
      const next = new Map(prev);
      next.set(tempId, { name, type, childTagId: childId, parentId });
      return next;
    });

    setPendingChanges((prev) => [
      ...prev,
      { action: "insert_above", tempId, name, type, childTagId: childId, childTagName: childTag.name, parentId },
    ]);

    setInsertOnEdgeModal(null);
  }, [tagMap]);

  const handleEditSave = useCallback((tagId: number, updates: { name?: string; type?: string; description?: string }) => {
    if (Object.keys(updates).length === 0) {
      setEditModal(null);
      return;
    }
    const tag = tagMap.get(tagId);
    if (!tag) return;

    setUpdatedNodes((prev) => {
      const next = new Map(prev);
      next.set(tagId, { ...prev.get(tagId), ...updates });
      return next;
    });

    for (const [field, value] of Object.entries(updates)) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const oldValue = String((tag as unknown as Record<string, unknown>)[field] ?? "");
      setPendingChanges((prev) => [
        ...prev,
        { action: "update", tagId, field, oldValue, newValue: String(value), tagName: tag.name },
      ]);
    }

    setEditModal(null);
  }, [tagMap]);

  const handleAddChildSave = useCallback((parentId: number, name: string, type: string) => {
    const tempId = `temp-${++tempIdCounter.current}`;

    setNewNodes((prev) => {
      const next = new Map(prev);
      next.set(tempId, { name, type, parentId });
      return next;
    });

    setPendingChanges((prev) => [
      ...prev,
      { action: "create", name, type, parentId, tempId },
    ]);

    setAddChildModal(null);
  }, []);

  const handleInsertAboveSave = useCallback((childTagId: number, name: string, type: string) => {
    const tempId = `temp-${++tempIdCounter.current}`;
    const childTag = tagMap.get(childTagId);
    if (!childTag) return;

    // The new node takes the child's current parent, and the child becomes a child of the new node
    setInsertAboveNodes((prev) => {
      const next = new Map(prev);
      next.set(tempId, { name, type, childTagId, parentId: childTag.parentId });
      return next;
    });

    // Also reparent the child under the new node (tracked by tempId for now)
    // We'll resolve this in the save step

    setPendingChanges((prev) => [
      ...prev,
      { action: "insert_above", tempId, name, type, childTagId, childTagName: childTag.name, parentId: childTag.parentId },
    ]);

    setInsertAboveModal(null);
  }, [tagMap]);

  const handleAddRoot = useCallback((name: string, type: string) => {
    const tempId = `temp-${++tempIdCounter.current}`;

    setNewNodes((prev) => {
      const next = new Map(prev);
      // parentId 0 means root — we'll handle this in save as parentId: null
      next.set(tempId, { name, type, parentId: 0 });
      return next;
    });

    setPendingChanges((prev) => [
      ...prev,
      { action: "create", name, type, parentId: null, tempId },
    ]);

    setAddRootModal(false);
  }, []);

  // Handle edge connection (reparent via drag)
  const onConnect: OnConnect = useCallback((connection: Connection) => {
    if (!connection.target || !connection.source) return;

    const targetId = connection.target.startsWith("tag-")
      ? parseInt(connection.target.replace("tag-", ""), 10)
      : null;
    const sourceId = connection.source.startsWith("tag-")
      ? parseInt(connection.source.replace("tag-", ""), 10)
      : null;

    if (targetId === null || sourceId === null) return;

    const tag = tagMap.get(targetId);
    if (!tag) return;

    // Prevent self-parenting or parenting to own descendant
    const isDescendant = (parentId: number, childId: number): boolean => {
      const parent = tagMap.get(parentId);
      if (!parent) return false;
      for (const child of parent.children) {
        if (child.id === childId) return true;
        if (isDescendant(child.id, childId)) return true;
      }
      return false;
    };

    if (sourceId === targetId || isDescendant(targetId, sourceId)) return;

    setReparented((prev) => {
      const next = new Map(prev);
      next.set(targetId, sourceId);
      return next;
    });

    setPendingChanges((prev) => [
      ...prev,
      {
        action: "reparent",
        tagId: targetId,
        oldParentId: tag.parentId,
        newParentId: sourceId,
        tagName: tag.name,
      },
    ]);
  }, [tagMap]);

  // Discard all changes
  const handleDiscard = () => {
    setPendingChanges([]);
    setNewNodes(new Map());
    setUpdatedNodes(new Map());
    setDeletedNodes(new Set());
    setReparented(new Map());
    setInsertAboveNodes(new Map());
    setIsEditing(false);
    setSaveError("");
  };

  // Undo last change
  const handleUndo = () => {
    if (pendingChanges.length === 0) return;
    const last = pendingChanges[pendingChanges.length - 1]!;

    if (last.action === "delete") {
      setDeletedNodes((prev) => {
        const next = new Set(prev);
        next.delete(last.tagId);
        return next;
      });
    } else if (last.action === "create") {
      setNewNodes((prev) => {
        const next = new Map(prev);
        next.delete(last.tempId);
        return next;
      });
    } else if (last.action === "update") {
      setUpdatedNodes((prev) => {
        const next = new Map(prev);
        const current = next.get(last.tagId);
        if (current) {
          delete (current as Record<string, unknown>)[last.field];
          if (Object.keys(current).length === 0) next.delete(last.tagId);
        }
        return next;
      });
    } else if (last.action === "reparent") {
      setReparented((prev) => {
        const next = new Map(prev);
        next.delete(last.tagId);
        return next;
      });
    } else if (last.action === "insert_above") {
      setInsertAboveNodes((prev) => {
        const next = new Map(prev);
        next.delete(last.tempId);
        return next;
      });
    }

    setPendingChanges((prev) => prev.slice(0, -1));
  };

  // Save all changes to DB
  const handleSave = async () => {
    setSaving(true);
    setSaveError("");

    try {
      // 1. Deletes first (so we don't conflict)
      for (const tagId of deletedNodes) {
        await deleteMutation.mutateAsync({ id: tagId });
      }

      // 2. Creates
      for (const [, node] of newNodes) {
        await createMutation.mutateAsync({
          name: node.name,
          type: node.type,
          parentId: node.parentId === 0 ? null : node.parentId,
        });
      }

      // 3. Updates (including reparents)
      for (const [tagId, updates] of updatedNodes) {
        await updateMutation.mutateAsync({
          id: tagId,
          name: updates.name,
          type: updates.type,
          description: updates.description,
        });
      }

      // 4. Reparents
      for (const [tagId, newParentId] of reparented) {
        if (!updatedNodes.has(tagId)) {
          await updateMutation.mutateAsync({
            id: tagId,
            parentId: newParentId,
          });
        }
      }

      // 5. Insert-above: create new node, then reparent child under it
      for (const [, insert] of insertAboveNodes) {
        const newTag = await createMutation.mutateAsync({
          name: insert.name,
          type: insert.type,
          parentId: insert.parentId,
        });
        if (newTag) {
          await updateMutation.mutateAsync({
            id: insert.childTagId,
            parentId: newTag.id,
          });
        }
      }

      // Reset state and refresh
      handleDiscard();
      onRefresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Build layout
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () =>
      layoutTree(tags, isEditing, {
        onEdit: handleEdit,
        onAddChild: handleAddChild,
        onDelete: handleDelete,
        onDeleteNew: handleDeleteNew,
        onInsertAbove: handleInsertAbove,
        onInsertOnEdge: handleInsertOnEdge,
      }, { newNodes, updatedNodes, deletedNodes, reparented, insertAboveNodes }),
    [tags, isEditing, handleEdit, handleAddChild, handleDelete, handleDeleteNew, handleInsertAbove, handleInsertOnEdge, newNodes, updatedNodes, deletedNodes, reparented, insertAboveNodes]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  // Sync layout when pending changes update — useEffect, not useMemo
  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  const editingTag = editModal !== null ? tagMap.get(editModal) : null;
  const addChildParent = addChildModal !== null ? tagMap.get(addChildModal) : null;
  const insertAboveTag = insertAboveModal !== null ? tagMap.get(insertAboveModal) : null;

  return (
    <div className="relative">
      {/* Edit Modal */}
      {editingTag && (
        <NodeEditModal
          tagId={editingTag.id}
          initialName={updatedNodes.get(editingTag.id)?.name ?? editingTag.name}
          initialType={updatedNodes.get(editingTag.id)?.type ?? editingTag.type}
          initialDescription={editingTag.description ?? ""}
          onSave={(updates) => handleEditSave(editingTag.id, updates)}
          onClose={() => setEditModal(null)}
        />
      )}

      {/* Add Child Modal */}
      {addChildParent && (
        <AddChildModal
          parentName={addChildParent.name}
          onSave={(name, type) => handleAddChildSave(addChildParent.id, name, type)}
          onClose={() => setAddChildModal(null)}
        />
      )}

      {/* Insert Above Modal */}
      {insertAboveTag && (
        <AddChildModal
          parentName={`above ${insertAboveTag.name}`}
          onSave={(name, type) => handleInsertAboveSave(insertAboveTag.id, name, type)}
          onClose={() => setInsertAboveModal(null)}
        />
      )}

      {/* Add Root Modal */}
      {addRootModal && (
        <AddChildModal
          parentName="root level"
          onSave={(name, type) => handleAddRoot(name, type)}
          onClose={() => setAddRootModal(false)}
        />
      )}

      {/* Insert On Edge Modal */}
      {insertOnEdgeModal && (
        <AddChildModal
          parentName={`between ${tagMap.get(insertOnEdgeModal.parentId)?.name ?? "?"} and ${tagMap.get(insertOnEdgeModal.childId)?.name ?? "?"}`}
          onSave={(name, type) => handleInsertOnEdgeSave(insertOnEdgeModal.parentId, insertOnEdgeModal.childId, name, type)}
          onClose={() => setInsertOnEdgeModal(null)}
        />
      )}

      {/* Graph */}
      <div
        className={
          isFullscreen
            ? "fixed inset-0 z-50 bg-neutral-950"
            : "h-[600px] w-full rounded-xl border border-white/10 bg-neutral-950"
        }
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={isEditing ? onConnect : undefined}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={2}
          nodesDraggable={isEditing}
          nodesConnectable={isEditing}
          selectionOnDrag={isEditing}
          selectNodesOnDrag={isEditing}
          selectionMode={isEditing ? "partial" as never : undefined}
          multiSelectionKeyCode="Meta"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#ffffff08" gap={20} size={1} />
          <Controls
            className="!bg-neutral-900 !border-white/10 !rounded-lg !shadow-lg [&>button]:!bg-neutral-800 [&>button]:!border-white/10 [&>button]:!text-white [&>button:hover]:!bg-neutral-700"
          />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as CommunityNodeData;
              if (data.isNew) return "#34D399";
              if (data.isDeleted) return "#EF4444";
              if (data.isModified) return "#FB923C";
              return getDepthColor(data.depth);
            }}
            className="!bg-neutral-900 !border-white/10 !rounded-lg"
            maskColor="rgba(0,0,0,0.7)"
          />

          {/* Top-right panel: Edit toggle */}
          <Panel position="top-right" className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen((f) => !f)}
              className="rounded-lg border border-white/10 bg-neutral-900 p-2 text-gray-400 shadow-lg hover:bg-neutral-800 hover:text-white"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-gray-300 shadow-lg transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <Unlock className="h-4 w-4" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  disabled={pendingChanges.length === 0}
                  className="rounded-lg border border-white/10 bg-neutral-900 p-2 text-gray-400 shadow-lg hover:bg-neutral-800 hover:text-white disabled:opacity-30"
                  title="Undo"
                >
                  <Undo2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setAddRootModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-gray-400 shadow-lg hover:bg-neutral-800 hover:text-green-400"
                  title="Add new root node"
                >
                  <Plus className="h-4 w-4" />
                  New Root
                </button>
                <button
                  onClick={handleDiscard}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-gray-400 shadow-lg hover:bg-neutral-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={pendingChanges.length === 0 || saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-green-700 disabled:opacity-30"
                >
                  {saving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save ({pendingChanges.length})
                </button>
              </div>
            )}
          </Panel>

          {/* Editing hint */}
          {isEditing && (
            <Panel position="top-left">
              <div className="rounded-lg border border-[#facf39]/20 bg-neutral-900/90 px-3 py-2 text-xs text-gray-400 shadow-lg">
                <span className="text-[#facf39]">Edit mode</span> — hover for actions · drag edges to reparent · drag to box-select · Cmd+click multi-select
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Pending changes log */}
      {pendingChanges.length > 0 && (
        <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            {pendingChanges.length} pending {pendingChanges.length === 1 ? "change" : "changes"} — not yet saved
          </div>
          <div className="space-y-1">
            {pendingChanges.map((change, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {change.action === "reparent" && (
                  <>
                    <span className="rounded bg-blue-900/40 px-1.5 py-0.5 text-blue-400">MOVE</span>
                    <span className="text-gray-300">
                      {change.tagName} → {tagMap.get(change.newParentId ?? 0)?.name ?? "root"}
                    </span>
                  </>
                )}
                {change.action === "create" && (
                  <>
                    <span className="rounded bg-green-900/40 px-1.5 py-0.5 text-green-400">NEW</span>
                    <span className="text-gray-300">{change.name} ({change.type})</span>
                  </>
                )}
                {change.action === "update" && (
                  <>
                    <span className="rounded bg-amber-900/40 px-1.5 py-0.5 text-amber-400">EDIT</span>
                    <span className="text-gray-300">
                      {change.tagName}: {change.field} → {change.newValue}
                    </span>
                  </>
                )}
                {change.action === "delete" && (
                  <>
                    <span className="rounded bg-red-900/40 px-1.5 py-0.5 text-red-400">DEL</span>
                    <span className="text-gray-300 line-through">{change.tagName}</span>
                    {change.contactCount > 0 && (
                      <span className="rounded bg-amber-900/40 px-1.5 py-0.5 text-amber-400">
                        {change.contactCount} contacts will be untagged
                      </span>
                    )}
                  </>
                )}
                {change.action === "insert_above" && (
                  <>
                    <span className="rounded bg-cyan-900/40 px-1.5 py-0.5 text-cyan-400">INSERT</span>
                    <span className="text-gray-300">
                      {change.name} above {change.childTagName}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
          {saveError && (
            <p className="mt-2 text-xs text-red-400">{saveError}</p>
          )}
        </div>
      )}
    </div>
  );
}
