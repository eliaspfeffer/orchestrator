import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  NodeTypes,
  ConnectionMode,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useMindmapStore } from '../store/mindmapStore';
import TerminalNode from './nodes/TerminalNode';
import TextNode from './nodes/TextNode';
import NoteNode from './nodes/NoteNode';
import ShapeNode from './nodes/ShapeNode';
import type { Edge } from '@xyflow/react';

// DRAG FIX: nodeDragHandle=".drag-handle" restricts dragging to the header bar.
// This means clicking/typing in the terminal area NEVER triggers node dragging.
// Users can only drag nodes by grabbing the header.
const nodeTypes: NodeTypes = {
  terminal: TerminalNode,
  text: TextNode,
  note: NoteNode,
  shape: ShapeNode,
};

const btnBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: 'system-ui, sans-serif',
  border: '1px solid',
  transition: 'background-color 0.15s',
  width: '100%',
  textAlign: 'left',
};

const MindmapCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addTextNode,
    addTerminalNode,
    addNoteNode,
    addShapeNode,
    deleteSelectedNodes,
    updateEdgeLabel,
  } = useMindmapStore();

  const hasSelected = nodes.some(n => n.selected);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedNodes();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedNodes]);

  const handleEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const current = typeof edge.label === 'string' ? edge.label : '';
      const label = prompt('Edge label:', current);
      if (label !== null) {
        updateEdgeLabel(edge.id, label);
      }
    },
    [updateEdgeLabel]
  );

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0d1117' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeDoubleClick={handleEdgeDoubleClick}
        nodeTypes={nodeTypes}
        // DRAG FIX: Only allow dragging nodes via elements with .drag-handle class.
        // This is THE KEY to allowing terminal input without triggering node drag.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({ nodeDragHandle: '.drag-handle' } as any)}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#555', strokeWidth: 2 },
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#555' },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#333"
          gap={20}
          size={1}
        />
        <Controls
          style={{
            backgroundColor: '#1e1e1e',
            borderColor: '#3c3c3c',
          }}
        />
        <MiniMap
          style={{
            backgroundColor: '#1a1a2e',
            border: '1px solid #3c3c3c',
          }}
          nodeColor={(node) => {
            if (node.type === 'terminal') return '#569cd6';
            if (node.type === 'note') return '#ffd700';
            if (node.type === 'shape') return (node.data as { color?: string }).color || '#3c3c3c';
            return '#6a9955';
          }}
          maskColor="rgba(0,0,0,0.5)"
        />

        <Panel position="top-left">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: '10px',
              backgroundColor: '#1e1e1e',
              border: '1px solid #3c3c3c',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              width: '160px',
            }}
          >
            <span
              style={{
                color: '#d4d4d4',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'system-ui, sans-serif',
                padding: '2px 4px 6px',
                letterSpacing: '-0.01em',
              }}
            >
              Orchestrator
            </span>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: '#3c3c3c', margin: '2px 0' }} />

            {/* + Text */}
            <button
              onClick={() => addTextNode()}
              style={{
                ...btnBase,
                backgroundColor: '#2d2d2d',
                color: '#d4d4d4',
                borderColor: '#4c4c4c',
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.backgroundColor = '#3c3c3c'; }}
              onMouseLeave={(e) => { (e.currentTarget).style.backgroundColor = '#2d2d2d'; }}
            >
              <span style={{ fontSize: '14px' }}>📄</span> Text
            </button>

            {/* + Note */}
            <button
              onClick={() => addNoteNode()}
              style={{
                ...btnBase,
                backgroundColor: '#2a2810',
                color: '#e8d66a',
                borderColor: '#6a5c00',
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.backgroundColor = '#3a380f'; }}
              onMouseLeave={(e) => { (e.currentTarget).style.backgroundColor = '#2a2810'; }}
            >
              <span style={{ fontSize: '14px' }}>📝</span> Note
            </button>

            {/* + Terminal */}
            <button
              onClick={() => addTerminalNode()}
              style={{
                ...btnBase,
                backgroundColor: '#0e4c6e',
                color: '#9cdcfe',
                borderColor: '#1a7fb5',
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.backgroundColor = '#1a6a96'; }}
              onMouseLeave={(e) => { (e.currentTarget).style.backgroundColor = '#0e4c6e'; }}
            >
              <span style={{ fontSize: '14px' }}>💻</span> Terminal
            </button>

            {/* + Oval */}
            <button
              onClick={() => addShapeNode('oval', '#1a4d2e')}
              style={{
                ...btnBase,
                backgroundColor: '#1a3a1a',
                color: '#6abf6a',
                borderColor: '#2d7a2d',
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.backgroundColor = '#22462a'; }}
              onMouseLeave={(e) => { (e.currentTarget).style.backgroundColor = '#1a3a1a'; }}
            >
              <span style={{ fontSize: '14px', display: 'inline-block', transform: 'scaleX(1.3)' }}>⬭</span> Oval
            </button>

            {/* + Diamond */}
            <button
              onClick={() => addShapeNode('diamond', '#4d2e00')}
              style={{
                ...btnBase,
                backgroundColor: '#3a2010',
                color: '#e0903a',
                borderColor: '#8a4a00',
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.backgroundColor = '#4a2c18'; }}
              onMouseLeave={(e) => { (e.currentTarget).style.backgroundColor = '#3a2010'; }}
            >
              <span style={{ fontSize: '14px', display: 'inline-block', transform: 'rotate(45deg)' }}>◼</span> Diamond
            </button>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: '#3c3c3c', margin: '2px 0' }} />

            {/* Delete */}
            <button
              onClick={() => deleteSelectedNodes()}
              disabled={!hasSelected}
              style={{
                ...btnBase,
                backgroundColor: hasSelected ? '#4a1a1a' : '#2a2a2a',
                color: hasSelected ? '#f44747' : '#555',
                borderColor: hasSelected ? '#7a2a2a' : '#3c3c3c',
                cursor: hasSelected ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={(e) => {
                if (hasSelected) (e.currentTarget).style.backgroundColor = '#5c2020';
              }}
              onMouseLeave={(e) => {
                if (hasSelected) (e.currentTarget).style.backgroundColor = '#4a1a1a';
              }}
            >
              <span style={{ fontSize: '14px' }}>🗑</span> Delete
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default MindmapCanvas;
