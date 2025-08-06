'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface JsonNodeData {
  label: string;
  properties?: { key: string; value: any; type: string }[];
  type: string;
  rawValue?: any;
  isContainer?: boolean;
  containerType?: 'array' | 'object';
  nodeKey?: string;
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

const CustomNode = ({ data, id }: NodeProps<JsonNodeData>) => {
  const { setNodes } = useReactFlow();
  
  const formatValue = (value: any, type: string): string => {
    if (type === 'string') return `"${value}"`;
    if (type === 'boolean' || type === 'number') return String(value);
    if (type === 'null') return 'null';
    if (type === 'array') return `Array[${value.length}]`;
    if (type === 'object') return `Object`;
    return String(value);
  };

  const toggleContainerType = () => {
    if (data.isContainer) {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                containerType: node.data.containerType === 'array' ? 'object' : 'array',
                type: node.data.containerType === 'array' ? 'object' : 'array',
              },
            };
          }
          return node;
        })
      );
    }
  };

  return (
    <div 
      className="px-4 py-3 shadow-lg rounded-lg border-2 bg-white min-w-[200px] max-w-[350px]"
      style={{ borderColor: getNodeColor(data.type) }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: getNodeColor(data.type) }}
        className="w-3 h-3"
      />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          {data.label !== 'root' && data.label !== '' && (
            <div className="text-sm font-bold text-gray-800">
              {data.label}
            </div>
          )}
          {data.isContainer && (
            <button
              onClick={toggleContainerType}
              className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Toggle between Array and Object"
            >
              {data.containerType === 'array' ? '[]' : '{}'}
            </button>
          )}
        </div>
        
        {data.properties && data.properties.length > 0 ? (
          <div className="space-y-1 border-t pt-2">
            {data.properties.map((prop, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className="font-semibold text-gray-700">{prop.key}:</span>
                <span 
                  className="text-gray-900 break-all"
                  style={{ color: getNodeColor(prop.type) }}
                >
                  {formatValue(prop.value, prop.type)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          data.rawValue !== undefined && (
            <div className="text-sm text-gray-600">
              {formatValue(data.rawValue, data.type)}
            </div>
          )
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: getNodeColor(data.type) }}
        className="w-3 h-3"
      />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

interface JsonFlowVisualizerProps {
  data: any;
  onDataChange: (newData: any) => void;
}

const JsonFlowVisualizer: React.FC<JsonFlowVisualizerProps> = ({ data, onDataChange }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const reorganizeNodes = useCallback(() => {
    const horizontalSpacing = 300;
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

  // Rebuild JSON from nodes and edges
  const rebuildJsonFromGraph = useCallback(() => {
    if (nodes.length === 0) return null;

    const nodeMap = new Map<string, any>();
    const childrenMap = new Map<string, string[]>();
    
    // Build parent-child relationships
    edges.forEach(edge => {
      if (!childrenMap.has(edge.source)) {
        childrenMap.set(edge.source, []);
      }
      childrenMap.get(edge.source)!.push(edge.target);
    });

    // Find root nodes (nodes without parents)
    const rootNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );

    const buildNodeValue = (nodeId: string): any => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return null;

      const nodeData = node.data as JsonNodeData;
      const children = childrenMap.get(nodeId) || [];

      // If it's a simple value node
      if (!nodeData.isContainer && nodeData.properties?.length === 0) {
        return nodeData.rawValue;
      }

      // If it's a container node
      if (nodeData.isContainer || children.length > 0) {
        const isArray = nodeData.containerType === 'array' || nodeData.type === 'array';
        
        if (isArray) {
          const result: any[] = [];
          children.forEach(childId => {
            const childNode = nodes.find(n => n.id === childId);
            if (childNode) {
              result.push(buildNodeValue(childId));
            }
          });
          return result;
        } else {
          const result: any = {};
          
          // Add simple properties
          if (nodeData.properties) {
            nodeData.properties.forEach(prop => {
              result[prop.key] = prop.value;
            });
          }
          
          // Add complex children
          children.forEach(childId => {
            const childNode = nodes.find(n => n.id === childId);
            if (childNode) {
              const childData = childNode.data as JsonNodeData;
              const key = childData.nodeKey || childData.label || childId;
              result[key] = buildNodeValue(childId);
            }
          });
          
          return result;
        }
      }

      // Object with only simple properties
      if (nodeData.properties && nodeData.properties.length > 0) {
        const result: any = {};
        nodeData.properties.forEach(prop => {
          result[prop.key] = prop.value;
        });
        return result;
      }

      return nodeData.rawValue;
    };

    // If there's only one root node, return its value
    if (rootNodes.length === 1) {
      return buildNodeValue(rootNodes[0].id);
    }

    // If multiple root nodes, return as array
    if (rootNodes.length > 1) {
      return rootNodes.map(node => buildNodeValue(node.id));
    }

    return null;
  }, [nodes, edges]);

  // Update JSON when graph changes
  useEffect(() => {
    if (nodes.length > 0) {
      const newJson = rebuildJsonFromGraph();
      if (newJson !== null && JSON.stringify(newJson) !== JSON.stringify(data)) {
        onDataChange(newJson);
      }
    }
  }, [nodes, edges]);

  const convertJsonToNodes = useCallback((json: any): { nodes: Node[]; edges: Edge[] } => {
    const resultNodes: Node[] = [];
    const resultEdges: Edge[] = [];
    let nodeCounter = 0;
    
    const getDataType = (value: any): string => {
      if (value === null) return 'null';
      if (Array.isArray(value)) return 'array';
      return typeof value;
    };
    
    const processValue = (
      value: any, 
      parentId: string | null = null, 
      key: string = '', 
      x: number = 400, 
      y: number = 50
    ): string | null => {
      const type = getDataType(value);
      
      // If it's a root array, process its items directly without creating a node for the array
      if (type === 'array' && !parentId) {
        const horizontalSpacing = 300;
        const totalWidth = (value.length - 1) * horizontalSpacing;
        const startX = x - totalWidth / 2;
        
        value.forEach((item: any, index: number) => {
          const childX = startX + index * horizontalSpacing;
          processValue(item, null, `[${index}]`, childX, y);
        });
        return null;
      }
      
      // For objects, collect all simple properties
      if (type === 'object' && value !== null) {
        const nodeId = `node_${nodeCounter++}`;
        const simpleProps: { key: string; value: any; type: string }[] = [];
        const complexProps: { key: string; value: any }[] = [];
        
        Object.entries(value).forEach(([propKey, propValue]) => {
          const propType = getDataType(propValue);
          if (propType === 'object' || propType === 'array') {
            complexProps.push({ key: propKey, value: propValue });
          } else {
            simpleProps.push({ key: propKey, value: propValue, type: propType });
          }
        });
        
        const node: Node = {
          id: nodeId,
          type: 'custom',
          position: { x, y },
          data: {
            label: key,
            properties: simpleProps,
            type: 'object',
            rawValue: value,
            isContainer: complexProps.length > 0,
            containerType: 'object',
            nodeKey: key,
          } as JsonNodeData,
        };
        
        resultNodes.push(node);
        
        if (parentId) {
          resultEdges.push({
            id: `e${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#94a3b8',
            },
          });
        }
        
        // Process complex properties
        if (complexProps.length > 0) {
          const horizontalSpacing = 300;
          const verticalSpacing = 150;
          const totalWidth = (complexProps.length - 1) * horizontalSpacing;
          const startX = x - totalWidth / 2;
          
          complexProps.forEach((prop, index) => {
            const childX = startX + index * horizontalSpacing;
            const childY = y + verticalSpacing;
            processValue(prop.value, nodeId, prop.key, childX, childY);
          });
        }
        
        return nodeId;
      }
      
      // For arrays that are properties, create a parent node and process items
      if (type === 'array') {
        const nodeId = `node_${nodeCounter++}`;
        
        const node: Node = {
          id: nodeId,
          type: 'custom',
          position: { x, y },
          data: {
            label: key,
            properties: [],
            type: 'array',
            rawValue: value,
            isContainer: true,
            containerType: 'array',
            nodeKey: key,
          } as JsonNodeData,
        };
        
        resultNodes.push(node);
        
        if (parentId) {
          resultEdges.push({
            id: `e${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#94a3b8',
            },
          });
        }
        
        // Process array items
        if (value.length > 0) {
          const horizontalSpacing = 300;
          const verticalSpacing = 150;
          const totalWidth = (value.length - 1) * horizontalSpacing;
          const startX = x - totalWidth / 2;
          
          value.forEach((item: any, index: number) => {
            const childX = startX + index * horizontalSpacing;
            const childY = y + verticalSpacing;
            processValue(item, nodeId, `[${index}]`, childX, childY);
          });
        }
        
        return nodeId;
      }
      
      // For simple values, only create a node if they have a parent
      if (parentId) {
        const nodeId = `node_${nodeCounter++}`;
        
        const node: Node = {
          id: nodeId,
          type: 'custom',
          position: { x, y },
          data: {
            label: key,
            properties: [],
            type,
            rawValue: value,
            isContainer: false,
            nodeKey: key,
          } as JsonNodeData,
        };
        
        resultNodes.push(node);
        
        resultEdges.push({
          id: `e${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#94a3b8',
          },
        });
        
        return nodeId;
      }
      
      // Handle root simple values
      if (!parentId && (type === 'string' || type === 'number' || type === 'boolean' || type === 'null')) {
        const nodeId = `node_${nodeCounter++}`;
        
        const node: Node = {
          id: nodeId,
          type: 'custom',
          position: { x, y },
          data: {
            label: 'value',
            properties: [],
            type,
            rawValue: value,
            isContainer: false,
          } as JsonNodeData,
        };
        
        resultNodes.push(node);
        return nodeId;
      }
      
      return null;
    };
    
    processValue(json);
    
    return { nodes: resultNodes, edges: resultEdges };
  }, []);

  useEffect(() => {
    if (data !== null && data !== undefined) {
      const { nodes: newNodes, edges: newEdges } = convertJsonToNodes(data);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [data]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({
        ...params,
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8',
        },
      }, eds));
    },
    [setEdges]
  );

  const onEdgeDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      setEdges((eds) => eds.filter(e => !edgesToDelete.find(del => del.id === e.id)));
    },
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
        onEdgesDelete={onEdgeDelete}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const data = node.data as JsonNodeData;
            return getNodeColor(data.type);
          }}
          pannable
          zoomable
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default JsonFlowVisualizer;