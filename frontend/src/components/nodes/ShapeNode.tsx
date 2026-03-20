import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import { ShapeNodeData, ShapeType } from '../../types';

const ShapeNode = ({ data, selected }: NodeProps) => {
  const shapeData = data as ShapeNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(shapeData.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const shape: ShapeType = shapeData.shape || 'rectangle';
  const color = shapeData.color || '#3c3c3c';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Escape' || e.key === 'Enter') {
      setIsEditing(false);
    }
  }, []);

  const borderColor = selected ? '#569cd6' : `${color}cc`;

  const getShapeStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color,
      border: `2px solid ${borderColor}`,
      overflow: 'hidden',
      position: 'relative',
      cursor: 'default',
    };

    if (shape === 'oval') {
      return { ...base, borderRadius: '50%' };
    }
    if (shape === 'rectangle') {
      return { ...base, borderRadius: '6px' };
    }
    // diamond: outer container is normal, inner rotated
    return { ...base, backgroundColor: 'transparent', border: 'none' };
  };

  const renderDiamond = () => {
    const diamondStyle: React.CSSProperties = {
      position: 'absolute',
      width: '70%',
      height: '70%',
      backgroundColor: color,
      border: `2px solid ${borderColor}`,
      transform: 'rotate(45deg)',
      top: '50%',
      left: '50%',
      marginTop: '-35%',
      marginLeft: '-35%',
    };
    return <div style={diamondStyle} />;
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minWidth: '80px',
        minHeight: '60px',
        position: 'relative',
        boxShadow: selected ? `0 0 0 1px #569cd6, 0 4px 12px rgba(0,0,0,0.4)` : '0 2px 8px rgba(0,0,0,0.3)',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        minWidth={60}
        minHeight={40}
        isVisible={selected}
        lineStyle={{ borderColor: '#569cd6' }}
        handleStyle={{ borderColor: '#569cd6', backgroundColor: '#1e1e2e' }}
      />

      {/* Drag handle top bar */}
      <div
        className="drag-handle"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '10px',
          cursor: 'grab',
          zIndex: 10,
        }}
      />

      {/* Shape rendering */}
      <div style={getShapeStyle()}>
        {shape === 'diamond' && renderDiamond()}
        <div
          style={{
            position: 'relative',
            zIndex: 5,
            padding: '4px 8px',
            textAlign: 'center',
          }}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="nodrag"
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'system-ui, sans-serif',
                textAlign: 'center',
                width: '100%',
              }}
            />
          ) : (
            <span
              style={{
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'system-ui, sans-serif',
                userSelect: 'none',
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}
            >
              {label || (
                <span style={{ opacity: 0.5, fontWeight: 400 }}>Label</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShapeNode;
