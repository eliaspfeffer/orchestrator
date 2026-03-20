# Orchestrator - Terminal Mindmap

A production-ready mindmap/canvas application with embedded interactive terminals. Build visual workflows by connecting terminal sessions, text notes, and other nodes on an infinite canvas.

## Features

- Infinite canvas with pan/zoom (React Flow)
- Embedded fully-interactive terminal nodes (xterm.js + node-pty)
- Keyboard input works correctly in terminals
- Resize terminal nodes by dragging corners
- Connect nodes with edges
- Text nodes with double-click editing
- Single shared WebSocket connection with auto-reconnect
- Dark theme throughout

## Architecture

```
orchestrator/
  backend/    Node.js + TypeScript WebSocket server + PTY manager
  frontend/   React + TypeScript + Vite canvas application
```

### Key Design Decisions

**Why terminal input works:**
- `terminal.onData()` is the ONLY way to capture xterm.js input. DOM keydown events are bypassed because xterm handles all key translation internally (arrow keys, ctrl sequences, escape codes, etc.)
- `stopPropagation` on `mouseDown` inside the terminal prevents React Flow from starting a node drag when the user clicks in the terminal
- `nodeDragHandle=".drag-handle"` on ReactFlow restricts node dragging to the header bar only

**WebSocket architecture:**
- Single module-level WebSocket singleton shared across ALL terminal components
- Each terminal session has a unique UUID
- All messages carry `sessionId` for routing
- Output callbacks are stored in a Map: `sessionId -> callback`
- Exponential backoff reconnect logic

**Terminal lifecycle:**
- Terminal is initialized in a `useEffect(() => {}, [])` (empty deps) - runs ONCE
- Terminal instance is stored in `useRef` not `useState` - prevents re-creation on re-render
- `React.memo` on TerminalComponent prevents unnecessary re-renders

## Setup

### Prerequisites

- Node.js 18+
- npm 9+
- On macOS: Xcode Command Line Tools (for node-pty native compilation)

```bash
xcode-select --install
```

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:3001` with WebSocket at `ws://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Usage

1. Click **+ Terminal** in the top-left toolbar to add a terminal node
2. Click **+ Text Node** to add a text note
3. Drag nodes by their **header bar** (the dark bar at the top)
4. Click inside a terminal to focus it and start typing
5. Resize nodes by dragging the blue handles (select node first)
6. Scroll inside a terminal to see scrollback history
7. Connect nodes by dragging from a node handle (small circle on hover)
8. Use the minimap (bottom-right) to navigate large canvases

## Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Troubleshooting

**Terminal shows output but input doesn't work:**
This should never happen with this implementation. If it does, check:
- Browser console for WebSocket errors
- Backend logs for PTY errors
- Ensure `terminal.onData()` is being called (not DOM events)

**node-pty fails to install:**
On macOS, install Xcode CLI tools: `xcode-select --install`
On Linux, install: `apt-get install make g++ python3`

**Port already in use:**
Backend: change `PORT` in `backend/src/server.ts`
Frontend: change `port` in `frontend/vite.config.ts`
