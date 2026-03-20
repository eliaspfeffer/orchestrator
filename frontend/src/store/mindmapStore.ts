import { create } from 'zustand';
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { TerminalNodeData, TextNodeData } from '../types';

interface MindmapState {
  nodes: Node[];
  edges: Edge[];
  addTextNode: (position?: XYPosition) => void;
  addTerminalNode: (position?: XYPosition) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  updateNodeData: (nodeId: string, data: Partial<TextNodeData | TerminalNodeData>) => void;
}

const getDefaultPosition = (existingNodes: Node[]): XYPosition => {
  const offset = existingNodes.length * 30;
  return { x: 100 + offset, y: 100 + offset };
};

export const useMindmapStore = create<MindmapState>((set, get) => ({
  nodes: [
    {
      id: 'welcome',
      type: 'text',
      position: { x: 300, y: 50 },
      data: { label: 'Orchestrator', content: 'Welcome! Add text nodes or terminal nodes using the toolbar.' } as TextNodeData,
    },
  ],
  edges: [],

  addTextNode: (position?: XYPosition) => {
    const { nodes } = get();
    const id = uuidv4();
    const newNode: Node = {
      id,
      type: 'text',
      position: position || getDefaultPosition(nodes),
      data: { label: 'Text Node', content: 'Double-click to edit' } as TextNodeData,
    };
    set({ nodes: [...nodes, newNode] });
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
    set({ nodes: [...nodes, newNode] });
  },

  onNodesChange: (changes: NodeChange[]) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  updateNodeData: (nodeId: string, data: Partial<TextNodeData | TerminalNodeData>) => {
    set({
      nodes: get().nodes.map(node =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },
}));
