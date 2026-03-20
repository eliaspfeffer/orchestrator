export type MessageType =
  | 'create_session'
  | 'session_created'
  | 'input'
  | 'output'
  | 'resize'
  | 'destroy_session'
  | 'error';

export interface ClientMessage {
  type: MessageType;
  sessionId?: string;
  data?: string;
  cols?: number;
  rows?: number;
}

export interface ServerMessage {
  type: MessageType;
  sessionId?: string;
  data?: string;
  error?: string;
}
