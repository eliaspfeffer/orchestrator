import { create } from 'zustand';
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
  addEdge,
  Connection,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { TerminalNodeData, TextNodeData, NoteNodeData, ShapeNodeData, ShapeType } from '../types';

const STORAGE_KEY = 'mindmap_state';

// Debounce helper
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSave(nodes: Node[], edges: Edge[]) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
    } catch (err) {
      console.warn('[mindmapStore] Failed to save state:', err);
    }
  }, 500);
}

function loadState(): { nodes: Node[]; edges: Edge[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { nodes: Node[]; edges: Edge[] };
  } catch {
    return null;
  }
}

const defaultNodes: Node[] = [
  {
    id: 'welcome',
    type: 'text',
    position: { x: 300, y: 50 },
    data: { label: 'Orchestrator', content: 'Welcome! Add text nodes or terminal nodes using the toolbar.' } as TextNodeData,
  },
];

const savedState = loadState();

interface MindmapState {
  nodes: Node[];
  edges: Edge[];
  addTextNode: (position?: XYPosition) => void;
  addTerminalNode: (position?: XYPosition) => void;
  addNoteNode: (position?: XYPosition) => void;
  addShapeNode: (shape: ShapeType, color: string, position?: XYPosition) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  updateNodeData: (nodeId: string, data: Partial<TextNodeData | TerminalNodeData | NoteNodeData | ShapeNodeData>) => void;
  deleteSelectedNodes: () => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  clearState: () => void;
}

const getDefaultPosition = (existingNodes: Node[]): XYPosition => {
  const offset = existingNodes.length * 30;
  return { x: 100 + offset, y: 100 + offset };
};

export const useMindmapStore = create<MindmapState>((set, get) => ({
  nodes: savedState?.nodes || defaultNodes,
  edges: savedState?.edges || [],

  addTextNode: (position?: XYPosition) => {
    const { nodes } = get();
    const id = uuidv4();
    const newNode: Node = {
      id,
      type: 'text',
      position: position || getDefaultPosition(nodes),
      data: { label: 'Text Node', content: 'Double-click to edit' } as TextNodeData,
    };
    const updated = [...nodes, newNode];
    set({ nodes: updated });
    debouncedSave(updated, get().edges);
  },

  addTerminalNode: (position?: XYPosition) => {
    const { nodes } = get();
    const id = uuidv4();
    const sessionId = uuidv4();
    const newNode: Node = {
      id,
      type: 'terminal',
      position: position || getDefaultPosition(nodes),
      data: { label: `Terminal ${nodes.filter(n => n.type === 'terminal').length + 1}`, sessionId } as TerminalNodeData,
      style: { width: 600, height: 400 },
    };
    const updated = [...nodes, newNode];
    set({ nodes: updated });
    debouncedSave(updated, get().edges);
  },

  addNoteNode: (position?: XYPosition) => {
    const { nodes } = get();
    const id = uuidv4();
    const newNode: Node = {
      id,
      type: 'note',
      position: position || getDefaultPosition(nodes),
      data: { label: 'Note', content: '' } as NoteNodeData,
      style: { width: 200, height: 150 },
    };
    const updated = [...nodes, newNode];
    set({ nodes: updated });
    debouncedSave(updated, get().edges);
  },

  addShapeNode: (shape: ShapeType, color: string, position?: XYPosition) => {
    const { nodes } = get();
    const id = uuidv4();
    const shapeLabels: Record<ShapeType, string> = {
      rectangle: 'Rectangle',
      oval: 'Oval',
      diamond: 'Diamond',
    };
    const newNode: Node = {
      id,
      type: 'shape',
      position: position || getDefaultPosition(nodes),
      data: { label: shapeLabels[shape], shape, color } as ShapeNodeData,
      style: { width: 150, height: 100 },
    };
    const updated = [...nodes, newNode];
    set({ nodes: updated });
    debouncedSave(updated, get().edges);
  },

  onNodesChange: (changes: NodeChange[]) => {
    const updated = applyNodeChanges(changes, get().nodes);
    set({ nodes: updated });
    debouncedSave(updated, get().edges);
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    const updated = applyEdgeChanges(changes, get().edges);
    set({ edges: updated });
    debouncedSave(get().nodes, updated);
  },

  onConnect: (connection: Connection) => {
    const updated = addEdge(
      {
        ...connection,
        type: 'smoothstep',
        markerEnd: { type: 'arrowclosed' as const },
        style: { stroke: '#555', strokeWidth: 2 },
      },
      get().edges
    );
    set({ edges: updated });
    debouncedSave(get().nodes, updated);
  },

  updateNodeData: (nodeId: string, data: Partial<TextNodeData | TerminalNodeData | NoteNodeData | ShapeNodeData>) => {
    const updated = get().nodes.map(node =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
    );
    set({ nodes: updated });
    debouncedSave(updated, get().edges);
  },

  deleteSelectedNodes: () => {
    const { nodes, edges } = get();
    const selectedIds = new Set(nodes.filter(n => n.selected).map(n => n.id));
    if (selectedIds.size === 0) return;
    const updatedNodes = nodes.filter(n => !selectedIds.has(n.id));
    const updatedEdges = edges.filter(e => !selectedIds.has(e.source) && !selectedIds.has(e.target));
    set({ nodes: updatedNodes, edges: updatedEdges });
    debouncedSave(updatedNodes, updatedEdges);
  },

  updateEdgeLabel: (edgeId: string, label: string) => {
    const updated = get().edges.map(e =>
      e.id === edgeId ? { ...e, label } : e
    );
    set({ edges: updated });
    debouncedSave(get().nodes, updated);
  },

  clearState: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ nodes: defaultNodes, edges: [] });
  },
}));
