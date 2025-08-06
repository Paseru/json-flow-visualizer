'use client';

import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import JsonFlowVisualizer from './JsonFlowVisualizer';

interface JsonFlowWrapperProps {
  data: any;
}

const JsonFlowWrapper: React.FC<JsonFlowWrapperProps> = ({ data }) => {
  return (
    <ReactFlowProvider>
      <JsonFlowVisualizer data={data} />
    </ReactFlowProvider>
  );
};

export default JsonFlowWrapper;