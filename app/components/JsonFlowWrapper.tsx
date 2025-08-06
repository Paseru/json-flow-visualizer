'use client';

import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import JsonFlowVisualizer from './JsonFlowVisualizer';

interface JsonFlowWrapperProps {
  data: any;
  onDataChange: (newData: any) => void;
}

const JsonFlowWrapper: React.FC<JsonFlowWrapperProps> = ({ data, onDataChange }) => {
  return (
    <ReactFlowProvider>
      <JsonFlowVisualizer data={data} onDataChange={onDataChange} />
    </ReactFlowProvider>
  );
};

export default JsonFlowWrapper;