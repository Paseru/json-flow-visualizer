'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Handle,
  Position,
  NodeProps,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface JsonNodeData {
  label: string;
  value: any;
  type: string;
  isExpandable: boolean;
}

const getNodeColor = (type: string) => {
  switch (type) {
    case 'string': return '#10b981';
    case 'number': return '#3b82f6';
    case 'boolean': return '#eab308';
    case 'null': return '#6b7280';
    case 'array': return '#a855f7';
    case 'object': return '#6366f1';
    default: return '#6b7280';
  }
};

const CustomNode = ({ data }: NodeProps<JsonNodeData>) => {
  const color = getNodeColor(data.type);
  
  const formatValue = (value: any, type: string): string => {
    if (type === 'string') return `"${value}"`;
    if (type === 'boolean' || type === 'number') return String(value);
    if (type === 'null') return 'null';
    if (type === 'array') return `Array[${value.length}]`;
    if (type === 'object') return `Object{${Object.keys(value).length}}`;
    return String(value);
  };

  return (
    <div 
      className="px-4 py-3 shadow-lg rounded-lg border-2 bg-white min-w-[150px]"
      style={{ borderColor: color }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: color }}
        className="w-3 h-3"
      />
      
      <div className="flex flex-col gap-1">
        <div className="text-xs font-semibold" style={{ color }}>
          {data.type.toUpperCase()}
        </div>
        <div className="text-sm font-bold text-gray-800">
          {data.label}
        </div>
        {!data.isExpandable && (
          <div className="text-xs text-gray-600 font-mono">
            {formatValue(data.value, data.type)}
          </div>
        )}
        {data.isExpandable && (
          <div className="text-xs text-gray-500">
            {formatValue(data.value, data.type)}
          </div>
        )}
      </div>
      
      {data.isExpandable && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: color }}
          className="w-3 h-3"
        />
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

interface JsonFlowVisualizerProps {
  data: any;
}

const JsonFlowVisualizer: React.FC<JsonFlowVisualizerProps> = ({ data }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const reorganizeNodes = useCallback(() => {
    const horizontalSpacing = 250;
    const verticalSpacing = 150;
    
    const levelMap = new Map<number, Node[]>();
    const nodeDepth = new Map<string, number>();
    
    const calculateDepth = (nodeId: string, depth: number = 0): number => {
      if (nodeDepth.has(nodeId)) return nodeDepth.get(nodeId)!;
      nodeDepth.set(nodeId, depth);
      
      const childEdges = edges.filter(e => e.source === nodeId);
      childEdges.forEach(edge => {
        calculateDepth(edge.target, depth + 1);
      });
      
      return depth;
    };
    
    nodes.forEach(node => {
      const depth = calculateDepth(node.id);
      if (!levelMap.has(depth)) {
        levelMap.set(depth, []);
      }
      levelMap.get(depth)!.push(node);
    });
    
    const updatedNodes = nodes.map(node => {
      const depth = nodeDepth.get(node.id) || 0;
      const levelNodes = levelMap.get(depth) || [];
      const indexInLevel = levelNodes.findIndex(n => n.id === node.id);
      const totalInLevel = levelNodes.length;
      
      const xOffset = (indexInLevel - (totalInLevel - 1) / 2) * horizontalSpacing;
      
      return {
        ...node,
        position: {
          x: 400 + xOffset,
          y: 50 + depth * verticalSpacing,
        },
      };
    });
    
    setNodes(updatedNodes);
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [nodes, edges, setNodes, fitView]);

  const convertJsonToNodes = useCallback((json: any, parentId: string | null = null, key: string = 'root', x = 0, y = 0): { nodes: Node[]; edges: Edge[] } => {
    const resultNodes: Node[] = [];
    const resultEdges: Edge[] = [];
    let nodeId = parentId ? `${parentId}.${key}` : key;
    
    const getDataType = (value: any): string => {
      if (value === null) return 'null';
      if (Array.isArray(value)) return 'array';
      return typeof value;
    };
    
    const dataType = getDataType(json);
    const isExpandable = dataType === 'object' || dataType === 'array';
    
    const node: Node = {
      id: nodeId,
      type: 'custom',
      position: { x, y },
      data: {
        label: key,
        value: json,
        type: dataType,
        isExpandable,
      },
    };
    
    resultNodes.push(node);
    
    if (parentId) {
      resultEdges.push({
        id: `e${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      });
    }
    
    if (isExpandable && json !== null) {
      const entries = Array.isArray(json) 
        ? json.map((item, index) => [`[${index}]`, item])
        : Object.entries(json);
      
      const horizontalSpacing = 200;
      const verticalSpacing = 120;
      const totalWidth = (entries.length - 1) * horizontalSpacing;
      const startX = x - totalWidth / 2;
      
      entries.forEach(([childKey, childValue], index) => {
        const childX = startX + index * horizontalSpacing;
        const childY = y + verticalSpacing;
        const { nodes: childNodes, edges: childEdges } = convertJsonToNodes(
          childValue,
          nodeId,
          String(childKey),
          childX,
          childY
        );
        resultNodes.push(...childNodes);
        resultEdges.push(...childEdges);
      });
    }
    
    return { nodes: resultNodes, edges: resultEdges };
  }, []);

  useEffect(() => {
    if (data) {
      const { nodes: newNodes, edges: newEdges } = convertJsonToNodes(data, null, 'root', 400, 50);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [data, convertJsonToNodes, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full relative">
      <button
        onClick={reorganizeNodes}
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Reorganize Layout
      </button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap 
          nodeColor={(node) => getNodeColor(node.data.type)}
          pannable
          zoomable
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default JsonFlowVisualizer;