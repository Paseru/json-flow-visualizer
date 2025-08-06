'use client';

import { useState } from 'react';
import JsonFlowWrapper from './components/JsonFlowWrapper';

export default function Home() {
  const [jsonInput, setJsonInput] = useState('');
  const [jsonData, setJsonData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    setError('');
    
    if (!value.trim()) {
      setJsonData(null);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      setJsonData(parsed);
    } catch (err) {
      setError('Invalid JSON format');
      setJsonData(null);
    }
  };

  const sampleJson = JSON.stringify({
    "user": {
      "name": "John Doe",
      "age": 30,
      "active": true,
      "email": "john@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "country": "USA"
      },
      "hobbies": ["reading", "coding", "gaming"]
    }
  }, null, 2);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-white">JSON Flow Visualizer</h1>
        <p className="text-gray-400 text-sm mt-1">Paste JSON and see it as an interactive node graph</p>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              JSON Input
            </label>
            <button
              onClick={() => handleJsonChange(sampleJson)}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
            >
              Load Sample JSON
            </button>
          </div>
          
          <div className="flex-1 p-4">
            <textarea
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="w-full h-full p-4 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder='{"key": "value"}'
              spellCheck="false"
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>
        </div>
        
        <div className="flex-1 bg-gray-900">
          {jsonData ? (
            <JsonFlowWrapper data={jsonData} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🔗</div>
                <p className="text-gray-400 text-lg">
                  Paste JSON data to visualize it
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Nodes are draggable and the view is zoomable
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
