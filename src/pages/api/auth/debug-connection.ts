import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type ConnectionTestResult = {
  success: boolean;
  message: string;
  duration?: number;
  serverInfo?: any;
  error?: string;
  errorDetails?: any;
};

/**
 * Debug endpoint to test network connectivity to the backend server
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConnectionTestResult>
) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      message: 'This endpoint is only available in development mode'
    });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const pingUrl = `${apiUrl}/api/v1/ping/`;

  const startTime = Date.now();
  let responseTime: number;

  try {
    console.log(`Testing connection to backend at: ${pingUrl}`);
    
    // Attempt to connect to the backend with timeout
    const response = await axios.get(pingUrl, {
      timeout: 5000, // 5 second timeout
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    responseTime = Date.now() - startTime;
    
    return res.status(200).json({
      success: true,
      message: `Successfully connected to backend in ${responseTime}ms`,
      duration: responseTime,
      serverInfo: {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      }
    });
  } catch (error: any) {
    responseTime = Date.now() - startTime;
    
    console.error('Backend connection test failed:', error);
    
    // Format error response based on the type of error
    const errorDetails: any = {
      duration: responseTime
    };
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorDetails.status = error.response.status;
      errorDetails.statusText = error.response.statusText;
      errorDetails.headers = error.response.headers;
      errorDetails.data = error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      errorDetails.request = {
        method: error.request.method,
        path: error.request.path,
        host: error.request.host,
        protocol: error.request.protocol,
      };
      
      if (error.code === 'ECONNREFUSED') {
        errorDetails.connectionRefused = true;
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
        errorDetails.timeout = true;
      }
    }
    
    // Include error code and message
    errorDetails.code = error.code;
    errorDetails.name = error.name;
    
    return res.status(200).json({
      success: false,
      message: `Failed to connect to backend: ${error.message}`,
      duration: responseTime,
      error: error.message,
      errorDetails
    });
  }
} 