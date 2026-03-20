import React, { useRef, memo, useCallback } from 'react';
import { useTerminal } from './useTerminal';
import { wsManager } from './wsManager';
import '@xterm/xterm/css/xterm.css';

interface Props {
  sessionId: string;
  onFocus?: () => void;
  onActivity?: () => void;
}

const TerminalComponent = memo(({ sessionId, onFocus, onActivity }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isFocusedRef = useRef(false);

  const handleActivity = useCallback(() => {
    if (!isFocusedRef.current && onActivity) {
      onActivity();
    }
  }, [onActivity]);

  // Initialize terminal - hook uses empty deps so it only runs once per mount
  useTerminal(containerRef, sessionId, wsManager, handleActivity);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#1e1e1e',
      }}
      onMouseDown={(e) => {
        // stopPropagation: prevent React Flow from starting a drag
        // preventDefault: prevent RF from marking this node as "selected"
        // which would steal focus and confuse xterm's mouse tracking
        e.stopPropagation();
        e.preventDefault();
        isFocusedRef.current = true;
        onFocus?.();
      }}
      onFocus={() => {
        isFocusedRef.current = true;
      }}
      onBlur={() => {
        isFocusedRef.current = false;
      }}
      onClick={(e) => {
        // Prevent React Flow from handling click events inside terminal
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        // CRITICAL: prevent canvas from handling keys typed in the terminal.
        // Without this, keys like Delete/Backspace would trigger canvas actions.
        e.stopPropagation();
      }}
      onWheel={(e) => {
        // Prevent canvas zoom/scroll when scrolling inside terminal
        e.stopPropagation();
      }}
    />
  );
});

TerminalComponent.displayName = 'TerminalComponent';

export default TerminalComponent;
