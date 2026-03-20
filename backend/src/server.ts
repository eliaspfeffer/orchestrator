import * as http from 'http';
import * as WebSocket from 'ws';
import { ptyManager } from './ptyManager';
import { ClientMessage, ServerMessage } from './types';

const PORT = 3001;

const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Orchestrator Backend running\n');
});

const wss = new WebSocket.Server({ server: httpServer });

console.log(`[server] WebSocket server starting on port ${PORT}`);

wss.on('connection', (ws: WebSocket.WebSocket, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[server] Client connected from ${clientIp}`);

  // INPUT ROUTING: Each message carries sessionId so input is routed to
  // the correct PTY. The output callback closure captures the ws reference
  // so output goes back to the correct client.
  const clientSessions = new Set<string>();

  const sendMessage = (msg: ServerMessage): void => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  };

  ws.on('message', (raw: WebSocket.RawData) => {
    let message: ClientMessage;

    try {
      message = JSON.parse(raw.toString()) as ClientMessage;
    } catch (err) {
      console.error('[server] Failed to parse message:', raw.toString());
      sendMessage({ type: 'error', error: 'Invalid JSON message' });
      return;
    }

    console.log(`[server] Received message type: ${message.type}, sessionId: ${message.sessionId}`);

    switch (message.type) {
      case 'create_session': {
        const sessionId = message.sessionId;
        if (!sessionId) {
          sendMessage({ type: 'error', error: 'create_session requires sessionId' });
          return;
        }

        const cols = message.cols || 80;
        const rows = message.rows || 24;

        try {
          ptyManager.createSession(sessionId, cols, rows, (data: string) => {
            // Output callback: send PTY output back to this WebSocket client
            sendMessage({ type: 'output', sessionId, data });
          });

          clientSessions.add(sessionId);
          sendMessage({ type: 'session_created', sessionId });
          console.log(`[server] Session created: ${sessionId}`);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error(`[server] Error creating session ${sessionId}:`, err);
          sendMessage({ type: 'error', sessionId, error: `Failed to create session: ${errorMsg}` });
        }
        break;
      }

      case 'input': {
        const sessionId = message.sessionId;
        const data = message.data;

        if (!sessionId || data === undefined) {
          sendMessage({ type: 'error', error: 'input requires sessionId and data' });
          return;
        }

        // Route the input to the correct PTY
        ptyManager.write(sessionId, data);
        break;
      }

      case 'resize': {
        const sessionId = message.sessionId;
        const cols = message.cols;
        const rows = message.rows;

        if (!sessionId || cols === undefined || rows === undefined) {
          sendMessage({ type: 'error', error: 'resize requires sessionId, cols, and rows' });
          return;
        }

        ptyManager.resize(sessionId, cols, rows);
        break;
      }

      case 'destroy_session': {
        const sessionId = message.sessionId;
        if (!sessionId) {
          sendMessage({ type: 'error', error: 'destroy_session requires sessionId' });
          return;
        }

        ptyManager.destroySession(sessionId);
        clientSessions.delete(sessionId);
        console.log(`[server] Session destroyed: ${sessionId}`);
        break;
      }

      default: {
        console.warn(`[server] Unknown message type: ${(message as ClientMessage).type}`);
        sendMessage({ type: 'error', error: `Unknown message type: ${message.type}` });
      }
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`[server] Client disconnected (code: ${code}, reason: ${reason.toString()})`);
    // Clean up all sessions belonging to this client
    for (const sessionId of clientSessions) {
      console.log(`[server] Cleaning up session ${sessionId} for disconnected client`);
      ptyManager.destroySession(sessionId);
    }
    clientSessions.clear();
  });

  ws.on('error', (err) => {
    console.error(`[server] WebSocket error:`, err);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[server] HTTP server listening on port ${PORT}`);
  console.log(`[server] WebSocket server ready at ws://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('[server] SIGTERM received, shutting down gracefully');
  wss.close(() => {
    httpServer.close(() => {
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('[server] SIGINT received, shutting down gracefully');
  wss.close(() => {
    httpServer.close(() => {
      process.exit(0);
    });
  });
});
