'use client';

import React, { useState } from 'react';

interface TreeNodeProps {
  data: any;
  name: string;
  isRoot?: boolean;
  depth?: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ data, name, isRoot = false, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const getDataType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };
  
  const dataType = getDataType(data);
  const isExpandable = dataType === 'object' || dataType === 'array';
  const hasChildren = isExpandable && ((Array.isArray(data) && data.length > 0) || (typeof data === 'object' && data !== null && Object.keys(data).length > 0));
  
  const getNodeColor = () => {
    switch (dataType) {
      case 'string': return 'bg-green-100 border-green-400 text-green-800';
      case 'number': return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'boolean': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'null': return 'bg-gray-100 border-gray-400 text-gray-800';
      case 'array': return 'bg-purple-100 border-purple-400 text-purple-800';
      case 'object': return 'bg-indigo-100 border-indigo-400 text-indigo-800';
      default: return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };
  
  const formatValue = (value: any): string => {
    if (typeof value === 'string') return `"${value}"`;
    if (value === null) return 'null';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    return '';
  };
  
  const renderChildren = () => {
    if (!isExpanded || !hasChildren) return null;
    
    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <div key={index} className="relative">
          <div className="absolute left-6 top-0 w-px h-full bg-gray-300"></div>
          <div className="flex items-start ml-6 mt-2">
            <div className="absolute -left-[1px] top-3 w-4 h-px bg-gray-300"></div>
            <TreeNode data={item} name={`[${index}]`} depth={depth + 1} />
          </div>
        </div>
      ));
    }
    
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data).map(([key, value], index) => (
        <div key={key} className="relative">
          <div className="absolute left-6 top-0 w-px h-full bg-gray-300"></div>
          <div className="flex items-start ml-6 mt-2">
            <div className="absolute -left-[1px] top-3 w-4 h-px bg-gray-300"></div>
            <TreeNode data={value} name={key} depth={depth + 1} />
          </div>
        </div>
      ));
    }
    
    return null;
  };
  
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {isExpandable && hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? '−' : '+'}
          </button>
        )}
        {(!isExpandable || !hasChildren) && <div className="w-5" />}
        
        <div className={`px-3 py-1 rounded-lg border-2 ${getNodeColor()} font-medium text-sm transition-all hover:shadow-md`}>
          {!isRoot && (
            <span className="text-gray-600 mr-2">{name}:</span>
          )}
          {isExpandable ? (
            <span>
              {dataType === 'array' ? `Array[${data.length}]` : `Object{${Object.keys(data).length}}`}
            </span>
          ) : (
            <span>{formatValue(data)}</span>
          )}
        </div>
      </div>
      
      {renderChildren()}
    </div>
  );
};

export default TreeNode;