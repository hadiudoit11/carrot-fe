'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [backendUrl, setBackendUrl] = useState<string>('');

  useEffect(() => {
    // Get backend URL on client side
    setBackendUrl(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80');
    
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch('/api/debug/config');
        const data = await response.json();
        setDebugInfo(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDebugInfo();
  }, []);

  const testBackendConnection = async () => {
    try {
      setTestResult('Testing...');
      const url = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
      const response = await fetch(`${url}/api/v1/health-check/`);
      
      if (response.ok) {
        setTestResult('✅ Successfully connected to backend');
      } else {
        setTestResult(`❌ Backend returned status: ${response.status}`);
      }
    } catch (err) {
      setTestResult(`❌ Connection failed: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Environment Debug</h1>
      
      {/* Environment Information */}
      <div className="bg-card rounded-lg p-6 mb-6 border">
        <h2 className="text-xl font-semibold mb-4">Environment Information</h2>
        <div className="grid gap-4">
          <div>
            <h3 className="font-medium mb-2">Backend URL</h3>
            <code className="bg-muted p-2 rounded block">
              {backendUrl}
            </code>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Environment Variables</h3>
            <div className="bg-muted p-4 rounded">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify({
                  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
                  NODE_ENV: process.env.NODE_ENV,
                  VERCEL_ENV: process.env.VERCEL_ENV,
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Test */}
      <div className="bg-card rounded-lg p-6 mb-6 border">
        <h2 className="text-xl font-semibold mb-4">Backend Connection Test</h2>
        <div className="space-y-4">
          <button
            onClick={testBackendConnection}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Test Connection
          </button>
          
          {testResult && (
            <div className={`p-4 rounded ${testResult.includes('✅') ? 'bg-success/10' : 'bg-destructive/10'}`}>
              {testResult}
            </div>
          )}
        </div>
      </div>

      {/* Debug Information */}
      {debugInfo && (
        <div className="bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <pre className="bg-muted p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
} 