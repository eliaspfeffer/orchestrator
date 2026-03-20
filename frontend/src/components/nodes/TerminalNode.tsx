import React, { useCallback, useState } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import TerminalComponent from '../Terminal/TerminalComponent';
import { TerminalNodeData } from '../../types';

const TerminalNode = ({ data, selected }: NodeProps) => {
  const terminalData = data as TerminalNodeData;
  const [hasActivity, setHasActivity] = useState(false);

  const handleFocus = useCallback(() => {
    // Clear activity badge when user clicks into the terminal
    setHasActivity(false);
  }, []);

  const handleActivity = useCallback(() => {
    setHasActivity(true);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1e1e1e',
        border: selected ? '2px solid #569cd6' : '2px solid #3c3c3c',
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: selected ? '0 0 0 1px #569cd6' : '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      {/* NodeResizer allows the user to resize the terminal node */}
      <NodeResizer
        minWidth={300}
        minHeight={200}
        isVisible={selected}
        lineStyle={{ borderColor: '#569cd6' }}
        handleStyle={{ borderColor: '#569cd6', backgroundColor: '#1e1e2e' }}
      />

      {/* Header / drag handle - dragging ONLY works on this bar */}
      <div
        className="drag-handle"
        style={{
          padding: '6px 10px',
          backgroundColor: '#2d2d2d',
          borderBottom: '1px solid #3c3c3c',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Traffic light dots for aesthetics */}
          <div style={{ display: 'flex', gap: '5px' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#febc2e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28c840' }} />
          </div>
          <span
            style={{
              color: '#999',
              fontSize: '12px',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {terminalData.label || 'Terminal'}
          </span>
          {/* Activity badge */}
          {hasActivity && (
            <div
              className="pulse"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#f44747',
                flexShrink: 0,
              }}
            />
          )}
        </div>
        <span
          style={{
            color: '#555',
            fontSize: '10px',
            fontFamily: 'monospace',
          }}
        >
          {terminalData.sessionId?.slice(0, 8)}
        </span>
      </div>

      {/* Terminal content area - nodrag: RF won't intercept mouse for drag/select
          nowheel: RF won't intercept scroll for canvas zoom */}
      <div
        style={{ flex: 1, overflow: 'hidden' }}
        className="nodrag nowheel"
      >
        <TerminalComponent
          sessionId={terminalData.sessionId}
          onFocus={handleFocus}
          onActivity={handleActivity}
        />
      </div>
    </div>
  );
};

export default TerminalNode;
