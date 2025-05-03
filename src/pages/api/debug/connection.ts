import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Debug endpoint to test connectivity to the backend server
 * This endpoint is only available in development mode
 * 
 * Example usage: /api/debug/connection?url=/api/v1/health/
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not found' });
  }

  // Get the backend URL from environment variables or use default
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // Get the path to test from query parameters or use default
  const testPath = req.query.url ? String(req.query.url) : '/api/v1/health/';
  const fullUrl = testPath.startsWith('http') ? testPath : `${backendUrl}${testPath}`;
  
  console.log(`[Debug] Testing connection to: ${fullUrl}`);

  try {
    // Set a timeout for the fetch request (5 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const startTime = Date.now();
    
    // Attempt to connect to the backend
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`[Debug] Connection successful. Response time: ${responseTime}ms`);
    
    // Return the response data
    const data = await response.text();
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      parsedData = { rawText: data };
    }
    
    return res.status(200).json({
      success: true,
      url: fullUrl,
      status: response.status,
      statusText: response.statusText,
      responseTime: `${responseTime}ms`,
      headers: Object.fromEntries(response.headers),
      data: parsedData,
    });
  } catch (error: any) {
    console.error(`[Debug] Connection error:`, error);
    
    // Detailed error information based on error type
    let errorDetails = {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
    
    let errorType = 'unknown';
    let statusCode = 500;
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      errorType = 'timeout';
      statusCode = 504; // Gateway Timeout
      errorDetails = {
        ...errorDetails,
        message: `Connection timed out after 5000ms`,
      };
    } else if (error.code === 'ECONNREFUSED') {
      errorType = 'connection_refused';
      statusCode = 503; // Service Unavailable
      errorDetails = {
        ...errorDetails,
        message: `Connection refused to ${fullUrl}. Is the backend server running?`,
      };
    } else if (error.code === 'ENOTFOUND') {
      errorType = 'host_not_found';
      statusCode = 502; // Bad Gateway
      errorDetails = {
        ...errorDetails,
        message: `Host not found. Check the backend URL: ${backendUrl}`,
      };
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      errorType = 'fetch_error';
      statusCode = 500;
      errorDetails = {
        ...errorDetails,
        message: `Fetch error. This could be a CORS issue or a network configuration problem.`,
      };
    } else if (error.name === 'HTTPError') {
      errorType = 'http_error';
      statusCode = error.status || 500;
    }
    
    return res.status(statusCode).json({
      success: false,
      url: fullUrl,
      error: errorType,
      details: errorDetails,
      // Include helpful debug information
      environment: {
        nodeEnv: process.env.NODE_ENV,
        backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      },
      timestamp: new Date().toISOString(),
    });
  }
} 