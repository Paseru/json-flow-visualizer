'use client';

import React from 'react';
import TreeNode from './TreeNode';

interface JsonTreeProps {
  data: any;
}

const JsonTree: React.FC<JsonTreeProps> = ({ data }) => {
  return (
    <div className="w-full">
      <TreeNode data={data} name="root" isRoot />
    </div>
  );
};

export default JsonTree;