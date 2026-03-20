import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import { TextNodeData } from '../../types';

const TextNode = ({ data, selected }: NodeProps) => {
  const textData = data as TextNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(textData.content || textData.label || '');
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.stopPropagation();
      if (e.key === 'Escape') {
        setIsEditing(false);
      }
    },
    []
  );

  return (
    <div
      style={{
        padding: '0',
        minWidth: '120px',
        minHeight: '40px',
        backgroundColor: '#ffffff',
        border: selected ? '2px solid #569cd6' : '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: selected
          ? '0 0 0 1px #569cd6, 0 4px 12px rgba(0,0,0,0.15)'
          : '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        minWidth={80}
        minHeight={30}
        isVisible={selected}
        lineStyle={{ borderColor: '#569cd6' }}
        handleStyle={{ borderColor: '#569cd6', backgroundColor: '#fff' }}
      />

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            minHeight: '60px',
            border: 'none',
            outline: 'none',
            resize: 'none',
            padding: '10px 12px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            lineHeight: '1.5',
            backgroundColor: '#fff8e1',
            color: '#333',
          }}
        />
      ) : (
        <div
          style={{
            padding: '10px 12px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#333',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            cursor: 'text',
            minHeight: '40px',
          }}
        >
          {content || (
            <span style={{ color: '#aaa', fontStyle: 'italic' }}>
              Double-click to edit
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TextNode;
