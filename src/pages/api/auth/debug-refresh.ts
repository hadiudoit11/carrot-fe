import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Debug endpoint to specifically test connectivity to the token refresh endpoint
 * This helps isolate whether the issue is with the refresh endpoint specifically
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only accept POST requests for security
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', message: 'Only POST requests are accepted' });
  }
  
  try {
    const backendURL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    
    if (!backendURL) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Backend URL is not configured in environment variables'
      });
    }
    
    // Get refresh token from request body
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Refresh token is required in the request body'
      });
    }
    
    console.log(`Testing connectivity to token refresh endpoint: ${backendURL}/api/v1/auth/token/refresh/`);
    
    // Create an AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const startTime = Date.now();
      
      // Add timeouts and retry logic for the fetch
      const response = await fetch(`${backendURL}/api/v1/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
        signal: controller.signal,
      });
      
      const endTime = Date.now();
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);
      
      // Clone the response for processing
      const responseClone = response.clone();
      
      // Get response text
      let responseText = '';
      try {
        responseText = await responseClone.text();
      } catch (e) {
        responseText = 'Could not read response body';
      }
      
      // Try to parse as JSON if possible
      let responseData = null;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        // Not JSON, leave as null
      }
      
      return res.status(200).json({
        connectionSuccessful: true,
        requestSuccessful: response.ok,
        backendURL,
        refreshEndpoint: `${backendURL}/api/v1/auth/token/refresh/`,
        status: response.status,
        statusText: response.statusText,
        responseTime: `${endTime - startTime}ms`,
        headers: Object.fromEntries(response.headers.entries()),
        responseBody: responseText.slice(0, 1000), // Limit response size
        parsedResponse: responseData,
        hasAccessToken: responseData && responseData.access ? true : false,
        message: response.ok ? 'Refresh request successful' : 'Refresh request failed but connection was established',
      });
      
    } catch (error: any) {
      // Clear the timeout if there's an error
      clearTimeout(timeoutId);
      
      return res.status(500).json({
        connectionSuccessful: false,
        backendURL,
        refreshEndpoint: `${backendURL}/api/v1/auth/token/refresh/`,
        error: error.name || 'Unknown error',
        message: error.message || 'Unknown error occurred',
        code: error.code || 'NO_CODE',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        note: 'This indicates a network connectivity issue to the refresh endpoint'
      });
    }
    
  } catch (error: any) {
    console.error('Error in debug-refresh API route:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
} 