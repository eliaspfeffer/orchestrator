export type NodeType = 'text' | 'terminal';

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
