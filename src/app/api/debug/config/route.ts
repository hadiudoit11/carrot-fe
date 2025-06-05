import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
  const url = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
  
  // Test backend connectivity
  let backendStatus = 'unknown';
  try {
    const response = await fetch(`${url}/api/v1/health-check/`);
    backendStatus = response.ok ? 'connected' : 'error';
  } catch (error) {
    backendStatus = 'failed';
    console.error('Backend connection test failed:', error);
  }

  return NextResponse.json({
    environment: {
      node: process.env.NODE_ENV,
      vercel: process.env.VERCEL_ENV || 'local',
    },
    config: {
      backendUrl: url,
      timestamp: new Date().toISOString(),
    },
    status: {
      backend: backendStatus
    }
  });
} 