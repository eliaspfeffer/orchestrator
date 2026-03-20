export type NodeType = 'text' | 'terminal' | 'note' | 'shape';

export type ShapeType = 'rectangle' | 'oval' | 'diamond';

export interface BaseNodeData {
  label: string;
  [key: string]: unknown;
}

export interface TerminalNodeData extends BaseNodeData {
  sessionId: string;
}

export interface TextNodeData extends BaseNodeData {
  content?: string;
}

export interface NoteNodeData extends BaseNodeData {
  content?: string;
  color?: string;
}

export interface ShapeNodeData extends BaseNodeData {
  shape: ShapeType;
  color?: string;
}
