import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  // Test backend connectivity
  let backendStatus = 'unknown';
  try {
    const response = await fetch(`${backendUrl}/api/v1/health-check/`);
    backendStatus = response.ok ? 'connected' : 'error';
  } catch (error) {
    backendStatus = 'failed';
    console.error('Backend connection test failed:', error);
  }

  return NextResponse.json({
    environment: {
      node: process.env.NODE_ENV,
      vercel: process.env.VERCEL_ENV,
    },
    config: {
      backendUrl,
      timestamp: new Date().toISOString(),
    },
    status: {
      backend: backendStatus
    }
  });
} 