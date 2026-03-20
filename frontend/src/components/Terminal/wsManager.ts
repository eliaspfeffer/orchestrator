// Module-level singleton WebSocket manager.
// All terminal components share ONE WebSocket connection to minimize overhead
// and simplify session routing.

type OutputCallback = (data: string) => void;

interface QueuedMessage {
  data: string;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private sessionCallbacks: Map<string, OutputCallback> = new Map();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private isConnecting = false;
  private messageQueue: QueuedMessage[] = [];
  private url: string;

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private getUrlWithToken(): string {
    const token = localStorage.getItem('auth_token') || '';
    return `${this.url}?token=${encodeURIComponent(token)}`;
  }

  private connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    const fullUrl = this.getUrlWithToken();
    console.log(`[wsManager] Connecting to ${this.url}`);

    try {
      this.ws = new WebSocket(fullUrl);
    } catch (err) {
      console.error('[wsManager] Failed to create WebSocket:', err);
      this.isConnecting = false;
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log('[wsManager] Connected');
      this.isConnecting = false;
      this.reconnectDelay = 1000; // reset backoff on successful connect

      // Flush any queued messages
      const queued = [...this.messageQueue];
      this.messageQueue = [];
      for (const msg of queued) {
        this.sendRaw(msg.data);
      }
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string);
        if (message.type === 'output' && message.sessionId && message.data !== undefined) {
          const callback = this.sessionCallbacks.get(message.sessionId);
          if (callback) {
            callback(message.data as string);
          }
        } else if (message.type === 'error') {
          console.error('[wsManager] Server error:', message.error);
        } else if (message.type === 'session_created') {
          console.log(`[wsManager] Session confirmed: ${message.sessionId}`);
        }
      } catch (err) {
        console.error('[wsManager] Failed to parse message:', err);
      }
    };

    this.ws.onclose = (event) => {
      console.log(`[wsManager] Connection closed (code: ${event.code}, reason: ${event.reason})`);
      this.isConnecting = false;
      this.ws = null;
      // Don't reconnect on 401 (unauthorized)
      if (event.code !== 1008 && event.code !== 4001) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (event) => {
      console.error('[wsManager] WebSocket error:', event);
      // onclose will fire after onerror, which handles reconnect
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    console.log(`[wsManager] Reconnecting in ${this.reconnectDelay}ms`);
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
  }

  private sendRaw(data: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      // Queue the message to send after reconnect
      this.messageQueue.push({ data });
    }
  }

  private send(msg: object): void {
    this.sendRaw(JSON.stringify(msg));
  }

  registerSession(sessionId: string, onOutput: OutputCallback): void {
    this.sessionCallbacks.set(sessionId, onOutput);
  }

  unregisterSession(sessionId: string): void {
    this.sessionCallbacks.delete(sessionId);
  }

  createSession(sessionId: string, cols: number, rows: number): void {
    this.send({ type: 'create_session', sessionId, cols, rows });
  }

  destroySession(sessionId: string): void {
    this.send({ type: 'destroy_session', sessionId });
  }

  sendInput(sessionId: string, data: string): void {
    // INPUT ROUTING: data is sent directly to the server which routes it
    // to the correct PTY by sessionId.
    this.send({ type: 'input', sessionId, data });
  }

  resize(sessionId: string, cols: number, rows: number): void {
    this.send({ type: 'resize', sessionId, cols, rows });
  }

  isReady(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

const WS_BASE_URL = (import.meta.env.VITE_WS_URL || 'ws://localhost:3001') as string;

// Export a module-level singleton so all terminal components share one connection
export const wsManager = new WebSocketManager(WS_BASE_URL);
