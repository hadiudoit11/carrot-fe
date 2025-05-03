// apiFetch.tsx

import { getSession, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';

interface CustomSession extends Session {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
}

interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires?: number;
}

async function refreshAccessToken(token: string): Promise<RefreshedTokens> {
  let retryCount = 0;
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second
  
  const attemptRefresh = async (): Promise<RefreshedTokens> => {
    try {
      console.log(`Client refresh attempt ${retryCount + 1}/${maxRetries + 1}`);
      
      // Create an AbortController to handle timeouts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh: token,
          }),
          signal: controller.signal,
        });
        
        // Clear the timeout since the request completed
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
          throw new Error(`Refresh failed with status ${response.status}: ${errorData.detail || JSON.stringify(errorData)}`);
        }
        
        const refreshedTokens = await response.json();
        
        if (!refreshedTokens.access) {
          throw new Error('Refresh response missing access token');
        }
        
        return {
          accessToken: refreshedTokens.access,
          refreshToken: refreshedTokens.refresh || token,
          accessTokenExpires: Date.now() + (refreshedTokens.expires_in || 4 * 60) * 1000,
        };
      } catch (fetchError) {
        // Make sure to clear the timeout if there's an error
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error: any) {
      // Check if this is a network error that we should retry
      const isNetworkError = 
        error.name === 'AbortError' || 
        error.code === 'UND_ERR_HEADERS_TIMEOUT' ||
        error.code === 'UND_ERR_CONNECT_TIMEOUT' ||
        error.message?.includes('fetch failed') ||
        error.message?.includes('network') ||
        error.message?.includes('timed out');
      
      if (isNetworkError && retryCount < maxRetries) {
        console.log(`Network error during client refresh, retrying (${retryCount + 1}/${maxRetries})...`);
        
        // Increment retry count and wait before retrying
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
        
        // Try again
        return attemptRefresh();
      }
      
      // Either not a network error or we've exhausted retries
      console.error('Error refreshing access token on client:', error);
      throw error;
    }
  };
  
  return attemptRefresh();
}

export async function fetchWithToken(url: string, options: RequestInit = {}): Promise<any> {
  let retryCount = 0;
  const maxRetries = 2;
  const retryDelay = 1000;
  
  const executeFetch = async (): Promise<any> => {
    try {
      let accessToken: string | undefined;
      let refreshToken: string | undefined;
      let accessTokenExpires: number = 0;

      const session = await getSession() as CustomSession | null;
      if (session) {
        if (session.error === 'RefreshAccessTokenError') {
          console.error('Session contains RefreshAccessTokenError');
          await signOut({ redirect: false });
          throw new Error('Your session has expired. Please sign in again.');
        }
        
        accessToken = session.accessToken;
        refreshToken = session.refreshToken;
        accessTokenExpires = session.accessTokenExpires ?? 0;
      }

      if (!accessToken) {
        console.log('No access token available, proceeding without authentication');
      } else if (accessTokenExpires && Date.now() > accessTokenExpires && refreshToken) {
        try {
          console.log('Token expired, refreshing...');
          const refreshedTokens = await refreshAccessToken(refreshToken);
          
          accessToken = refreshedTokens.accessToken;
          accessTokenExpires = refreshedTokens.accessTokenExpires ?? Date.now() + 4 * 60 * 1000;
          refreshToken = refreshedTokens.refreshToken;
          console.log('Token successfully refreshed');
        } catch (error) {
          console.error('Error refreshing token from client:', error);
          await signOut({ redirect: false });
          throw new Error('Your session has expired. Please sign in again.');
        }
      }

      const headers = new Headers(options.headers);
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }

      // Create an AbortController to handle timeouts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for API requests
      
      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });
        
        // Clear the timeout since the request completed
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || errorData.message || `API error: ${response.status} ${response.statusText}`);
        }

        return response.json();
      } catch (fetchError: any) {
        // Make sure to clear the timeout if there's an error
        clearTimeout(timeoutId);
        
        // If it's a 401 Unauthorized, we should sign out
        if (fetchError.status === 401) {
          await signOut({ redirect: false });
          throw new Error('Your session has expired. Please sign in again.');
        }
        
        throw fetchError;
      }
    } catch (error: any) {
      // Check if this is a network error that we should retry
      const isNetworkError = 
        error.name === 'AbortError' || 
        error.code === 'UND_ERR_HEADERS_TIMEOUT' ||
        error.code === 'UND_ERR_CONNECT_TIMEOUT' ||
        error.message?.includes('fetch failed') ||
        error.message?.includes('network') ||
        error.message?.includes('timed out');
      
      if (isNetworkError && retryCount < maxRetries) {
        console.log(`Network error during API request, retrying (${retryCount + 1}/${maxRetries})...`);
        
        // Increment retry count and wait before retrying
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
        
        // Try again
        return executeFetch();
      }
      
      // Either not a network error or we've exhausted retries
      console.error('API request failed:', error);
      throw error;
    }
  };
  
  return executeFetch();
}
