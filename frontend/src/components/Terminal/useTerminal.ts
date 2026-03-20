import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { WebSocketManager } from './wsManager';

export function useTerminal(
  containerRef: React.RefObject<HTMLDivElement | null>,
  sessionId: string,
  wsManager: WebSocketManager,
  onActivity?: () => void
): void {
  // Use refs (NOT state) for terminal instances.
  // State would cause re-renders which re-create the terminal and break the session.
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const onActivityRef = useRef(onActivity);
  onActivityRef.current = onActivity;

  useEffect(() => {
    // Guard: ensure container exists
    if (!containerRef.current) {
      return;
    }

    // Prevent double-initialization (React StrictMode runs effects twice in dev)
    if (terminalRef.current) {
      return;
    }

    // 1. Create the terminal instance
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Menlo, Monaco, monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        selectionBackground: '#264f78',
        black: '#1e1e1e',
        red: '#f44747',
        green: '#6a9955',
        yellow: '#d7ba7d',
        blue: '#569cd6',
        magenta: '#c586c0',
        cyan: '#9cdcfe',
        white: '#d4d4d4',
        brightBlack: '#808080',
        brightRed: '#f44747',
        brightGreen: '#b5cea8',
        brightYellow: '#dcdcaa',
        brightBlue: '#9cdcfe',
        brightMagenta: '#c586c0',
        brightCyan: '#9cdcfe',
        brightWhite: '#ffffff',
      },
      allowTransparency: false,
      scrollback: 1000,
    });

    // 2. Create addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    // 3. Load addons
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    // 4. Mount terminal to DOM
    terminal.open(containerRef.current);

    // 5. Fit to container size
    try {
      fitAddon.fit();
    } catch (err) {
      console.warn('[useTerminal] fitAddon.fit() failed on init:', err);
    }

    // Store refs
    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // 6. Create the backend PTY session with current dimensions
    wsManager.createSession(sessionId, terminal.cols, terminal.rows);

    // 7. Register output callback: PTY output -> terminal display
    wsManager.registerSession(sessionId, (data: string) => {
      terminal.write(data);
      // Notify activity callback when output is received
      if (onActivityRef.current) {
        onActivityRef.current();
      }
    });

    // INPUT FIX: terminal.onData is the ONLY correct way to capture xterm input.
    // Do NOT use DOM keydown/keypress events - xterm handles all key translation
    // internally (arrow keys, ctrl sequences, etc.) and emits the correct
    // terminal escape sequences via onData.
    terminal.onData((data: string) => {
      wsManager.sendInput(sessionId, data);
    });

    // 8. Set up ResizeObserver to handle container size changes
    const container = containerRef.current;
    const resizeObserver = new ResizeObserver(() => {
      // requestAnimationFrame batches rapid resize events and ensures DOM is ready
      requestAnimationFrame(() => {
        if (!fitAddonRef.current || !terminalRef.current) return;
        try {
          fitAddonRef.current.fit();
          // After fit(), terminal.cols and terminal.rows reflect the new size
          wsManager.resize(sessionId, terminalRef.current.cols, terminalRef.current.rows);
        } catch (err) {
          console.warn('[useTerminal] Resize error:', err);
        }
      });
    });

    resizeObserver.observe(container);
    resizeObserverRef.current = resizeObserver;

    console.log(`[useTerminal] Terminal initialized for session ${sessionId}`);

    // Cleanup function
    return () => {
      console.log(`[useTerminal] Cleaning up session ${sessionId}`);

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      wsManager.destroySession(sessionId);
      wsManager.unregisterSession(sessionId);

      if (terminalRef.current) {
        terminalRef.current.dispose();
        terminalRef.current = null;
      }

      fitAddonRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps: initialize ONCE per mount. sessionId is captured in closure.
}
