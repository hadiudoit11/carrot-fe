import { JWT } from 'next-auth/jwt';

// Define retry options
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
export async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${apiUrl}/api/v1/auth/token/refresh/`;
    
    console.log(`Attempting to refresh token with refresh_token: ${token.refresh_token?.substring(0, 5)}...`);
    
    // Implement retry logic
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Token refresh attempt ${attempt}/${MAX_RETRIES}`);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh: token.refresh_token,
          }),
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const statusText = response.statusText || 'Unknown error';
          
          console.error(`Token refresh failed with status ${response.status}: ${statusText}`, errorData);
          
          // If we get a 401 or 403, the refresh token is likely invalid
          if (response.status === 401 || response.status === 403) {
            throw new Error(`Refresh token is invalid or expired: ${statusText}`);
          }
          
          // For server errors, we can retry
          if (response.status >= 500 && attempt < MAX_RETRIES) {
            console.log(`Server error (${response.status}), will retry after delay...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
            continue;
          }
          
          throw new Error(`Failed to refresh token: ${statusText}`);
        }
        
        const refreshedTokens = await response.json();
        
        if (!refreshedTokens.access) {
          throw new Error('Received invalid response from token endpoint');
        }
        
        console.log('Token refresh successful');
        
        const now = Math.floor(Date.now() / 1000);
        const accessTokenExpires = now + 24 * 60 * 60; // Assume 24 hour expiry if not specified
        
        return {
          ...token,
          access_token: refreshedTokens.access,
          accessTokenExpires,
          refresh_token: refreshedTokens.refresh ?? token.refresh_token,
        };
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.error(`Token refresh request timed out on attempt ${attempt}`);
          
          // For timeouts, we can retry
          if (attempt < MAX_RETRIES) {
            console.log(`Will retry after delay...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
            continue;
          }
        }
        
        // For network errors, we can retry
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.error(`Network error during token refresh on attempt ${attempt}: ${error.message}`);
          
          if (attempt < MAX_RETRIES) {
            console.log(`Will retry after delay...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
            continue;
          }
        }
        
        // If we've reached here on the last attempt, propagate the error
        if (attempt === MAX_RETRIES) {
          throw error;
        }
      }
    }
    
    // If we somehow exit the loop without returning or throwing, throw a generic error
    throw new Error('All token refresh attempts failed');
  } catch (error: any) {
    console.error('Error refreshing access token:', error);
    
    // Return the old token with an error flag
    return {
      ...token,
      error: `RefreshAccessTokenError: ${error.message}`,
    };
  }
} 