import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { refreshAccessToken } from '../../../lib/refreshAccessToken';

type DebugTokenResponse = {
  token?: any;
  error?: string;
  message?: string;
  newToken?: any;
};

/**
 * Debug endpoint to check token status and manually trigger refresh if needed
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DebugTokenResponse>
) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'This endpoint is only available in development mode'
    });
  }

  try {
    // Get the current token
    const token = await getToken({ req });
    
    // Check if we should attempt a token refresh for debugging
    const shouldRefresh = req.query['debug-refresh'] === 'true';
    
    if (!token) {
      return res.status(200).json({
        error: 'No token found',
        message: 'No authentication token was found in the request'
      });
    }

    // Base response with the current token
    const response: DebugTokenResponse = {
      token: {
        ...token,
        // Redact sensitive information
        accessToken: token.accessToken ? `${token.accessToken.substring(0, 10)}...` : undefined,
        refreshToken: token.refreshToken ? `${token.refreshToken.substring(0, 10)}...` : undefined,
      },
      message: 'Current token retrieved successfully'
    };

    // Attempt token refresh if requested
    if (shouldRefresh && token.refreshToken) {
      try {
        console.log('Attempting to refresh token for debugging...');
        const startTime = Date.now();
        
        const refreshedToken = await refreshAccessToken(token);
        const refreshTime = Date.now() - startTime;
        
        response.newToken = {
          ...refreshedToken,
          // Redact sensitive information
          accessToken: refreshedToken.accessToken 
            ? `${refreshedToken.accessToken.substring(0, 10)}...` 
            : undefined,
          refreshToken: refreshedToken.refreshToken 
            ? `${refreshedToken.refreshToken.substring(0, 10)}...` 
            : undefined,
          refreshTime: `${refreshTime}ms`,
        };
        
        if (refreshedToken.error) {
          response.newToken.error = refreshedToken.error;
        } else {
          response.message += '. Token refresh successful';
        }
      } catch (refreshError: any) {
        response.newToken = { 
          error: refreshError.message,
          stack: process.env.NODE_ENV === 'development' ? refreshError.stack : undefined,
        };
      }
    }

    return res.status(200).json(response);
  } catch (error: any) {
    console.error('Error in debug-token:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      // Include stack trace only in development
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
} 