import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import { NoteNodeData } from '../../types';

const NoteNode = ({ data, selected }: NodeProps) => {
  const noteData = data as NoteNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(noteData.content || noteData.label || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, []);

  const bgColor = noteData.color || '#2d2a1e';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: bgColor,
        border: selected ? '2px solid #ffd700' : '2px solid #a08c00',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: selected
          ? '0 0 0 1px #ffd700, 0 4px 16px rgba(0,0,0,0.5)'
          : '0 4px 12px rgba(0,0,0,0.4), 2px 2px 0 #1a1700',
        minWidth: '140px',
        minHeight: '80px',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        minWidth={120}
        minHeight={60}
        isVisible={selected}
        lineStyle={{ borderColor: '#ffd700' }}
        handleStyle={{ borderColor: '#ffd700', backgroundColor: '#2d2a1e' }}
      />

      {/* Drag handle top bar */}
      <div
        className="drag-handle"
        style={{
          height: '10px',
          backgroundColor: '#ffd700',
          cursor: 'grab',
          flexShrink: 0,
          opacity: 0.8,
        }}
      />

      {/* Note content */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '2px' }}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="nodrag"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              resize: 'none',
              padding: '8px 10px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '13px',
              lineHeight: '1.5',
              backgroundColor: 'transparent',
              color: '#e8d66a',
              boxSizing: 'border-box',
            }}
          />
        ) : (
          <div
            style={{
              padding: '8px 10px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '13px',
              lineHeight: '1.5',
              color: '#e8d66a',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              cursor: 'text',
              height: '100%',
            }}
          >
            {content || (
              <span style={{ color: '#a08c00', fontStyle: 'italic' }}>
                Double-click to edit
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteNode;
