// src/pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT, User } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';

// Define types for token and user with correct structure
interface ExtendedJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  organization?: string;
  organization_name?: string;
  error?: string;
}

// Define a custom user interface without extending User
interface CustomUser {
  id: string;
  email: string;
  access_token?: string;
  refresh_token?: string;
  access_token_expires_in?: number;
  organization?: string;
  organization_name?: string;
}

interface ExtendedSession extends Session {
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    organization?: string;
    organization_name?: string;
  };
}

export async function refreshAccessToken(token: ExtendedJWT): Promise<ExtendedJWT> {
  let retryCount = 0;
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second
  
  const attemptRefresh = async (): Promise<ExtendedJWT> => {
    try {
      console.log(`Refresh attempt ${retryCount + 1}/${maxRetries + 1}`);
      console.log('Starting token refresh process...');
      const backendURL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
      console.log(`Using backend URL for refresh: ${backendURL}`);
      
      if (!token.refreshToken) {
        console.error('No refresh token available');
        return {
          ...token,
          error: 'RefreshAccessTokenError',
        };
      }

      // Add more detailed logging and error handling
      console.log(`Attempting to refresh token at: ${backendURL}/api/v1/auth/token/refresh/`);
      
      // Create an AbortController to handle timeouts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(`${backendURL}/api/v1/auth/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh: token.refreshToken,
          }),
          signal: controller.signal,
        });
        
        // Clear the timeout since the request completed
        clearTimeout(timeoutId);

        // Log the status before parsing JSON
        console.log(`Refresh response status: ${response.status}`);
        
        // Clone the response so we can log the body for debugging
        const responseClone = response.clone();
        let responseText;
        try {
          responseText = await responseClone.text();
          console.log(`Refresh response body: ${responseText}`);
        } catch (error) {
          console.error('Error reading response body:', error);
        }

        // Parse the original response
        let refreshedTokens;
        try {
          refreshedTokens = await response.json();
          console.log('Refreshed tokens structure:', Object.keys(refreshedTokens));
        } catch (error) {
          console.error('Error parsing JSON from refresh response:', error);
          throw new Error(`Failed to parse refresh response: ${responseText}`);
        }

        if (!response.ok) {
          throw new Error(`Failed to refresh token: ${response.status} ${response.statusText}`);
        }

        // Ensure we have the required values
        if (!refreshedTokens.access) {
          console.error('Refresh response missing access token');
          throw new Error('Access token missing from refresh response');
        }

        console.log('Token refresh successful, updating token');
        
        return {
          ...token,
          accessToken: refreshedTokens.access,
          // Default to 1 hour if expires_in not provided
          accessTokenExpires: Date.now() + (refreshedTokens.expires_in || 3600) * 1000,
          refreshToken: refreshedTokens.refresh ?? token.refreshToken,
          error: undefined, // Clear any previous errors
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
        error.message?.includes('network');
      
      if (isNetworkError && retryCount < maxRetries) {
        console.log(`Network error during refresh, retrying (${retryCount + 1}/${maxRetries})...`);
        console.error(`Error details:`, error);
        
        // Increment retry count and wait before retrying
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
        
        // Try again
        return attemptRefresh();
      }
      
      // Either not a network error or we've exhausted retries
      console.error('Error refreshing access token:', error);
      return {
        ...token,
        error: 'RefreshAccessTokenError',
      };
    }
  };
  
  return attemptRefresh();
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const backendURL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        const res = await fetch(`${backendURL}/api/v1/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        const user = await res.json();
        console.log(user);
        console.log('AuthServiceResponse:', user);

        if (res.ok && user) {
          return user as User;
        } else {
          return null;
        }
      },
    }),
  ],
  secret: process.env.SECRET_KEY,
  callbacks: {
    // TypeScript will infer the return type
    async jwt({ token, user }) {
      // Cast user to CustomUser type if it exists
      const customUser = user as CustomUser | undefined;

      if (customUser) {
        return {
          ...token,
          accessToken: customUser.access_token,
          refreshToken: customUser.refresh_token,
          accessTokenExpires: customUser.access_token_expires_in ? 
            Date.now() + customUser.access_token_expires_in * 1000 : undefined,
          email: customUser.email,
          organization: customUser.organization,
          organization_name: customUser.organization_name,
        } as ExtendedJWT;
      }

      // On subsequent calls, check if token needs refresh
      const extendedToken = token as ExtendedJWT;
      if (extendedToken.accessTokenExpires && 
          Date.now() < extendedToken.accessTokenExpires - 60000) {
        return extendedToken;
      }

      // Access token has expired, refresh it
      console.log('Access token expired, refreshing...');
      return refreshAccessToken(extendedToken);
    },
    
    // TypeScript will infer the return type
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession;
      const extendedToken = token as ExtendedJWT;

      // Copy token properties to session
      extendedSession.accessToken = extendedToken.accessToken;
      extendedSession.refreshToken = extendedToken.refreshToken;
      
      // Ensure user properties are preserved
      extendedSession.user = {
        ...extendedSession.user,
        email: extendedToken.email || extendedSession.user.email,
        organization: extendedToken.organization,
        organization_name: extendedToken.organization_name,
      };
      
      // Pass error to session if token refresh failed
      if (extendedToken.error === 'RefreshAccessTokenError') {
        extendedSession.error = 'RefreshAccessTokenError';
      }
      
      return extendedSession;
    },
  },
  pages: {
    signIn: '/user/login',
    error: '/auth/error',
  },
  debug: true,
};

export default NextAuth(authOptions);