import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  NodeTypes,
  ConnectionMode,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useMindmapStore } from '../store/mindmapStore';
import TerminalNode from './nodes/TerminalNode';
import TextNode from './nodes/TextNode';

// DRAG FIX: nodeDragHandle=".drag-handle" restricts dragging to the header bar.
// This means clicking/typing in the terminal area NEVER triggers node dragging.
// Users can only drag nodes by grabbing the header.
const nodeTypes: NodeTypes = {
  terminal: TerminalNode,
  text: TextNode,
};

const MindmapCanvas: React.FC = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, addTextNode, addTerminalNode } =
    useMindmapStore();

  const handleAddTextNode = useCallback(() => {
    addTextNode();
  }, [addTextNode]);

  const handleAddTerminalNode = useCallback(() => {
    addTerminalNode();
  }, [addTerminalNode]);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0d1117' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        // DRAG FIX: Only allow dragging nodes via elements with .drag-handle class.
        // This is THE KEY to allowing terminal input without triggering node drag.
        nodeDragHandle=".drag-handle"
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          style: { stroke: '#555', strokeWidth: 2 },
          animated: false,
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
            return '#6a9955';
          }}
          maskColor="rgba(0,0,0,0.5)"
        />

        <Panel position="top-left">
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '8px',
              backgroundColor: '#1e1e1e',
              border: '1px solid #3c3c3c',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <span
              style={{
                color: '#d4d4d4',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'system-ui, sans-serif',
                padding: '4px 8px',
                alignSelf: 'center',
              }}
            >
              Orchestrator
            </span>
            <div
              style={{
                width: '1px',
                backgroundColor: '#3c3c3c',
                margin: '4px 0',
              }}
            />
            <button
              onClick={handleAddTextNode}
              style={{
                padding: '6px 14px',
                backgroundColor: '#3c3c3c',
                color: '#d4d4d4',
                border: '1px solid #555',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'system-ui, sans-serif',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#4c4c4c';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#3c3c3c';
              }}
            >
              + Text Node
            </button>
            <button
              onClick={handleAddTerminalNode}
              style={{
                padding: '6px 14px',
                backgroundColor: '#0e4c6e',
                color: '#9cdcfe',
                border: '1px solid #1a7fb5',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'system-ui, sans-serif',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#1a6a96';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#0e4c6e';
              }}
            >
              + Terminal
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default MindmapCanvas;
