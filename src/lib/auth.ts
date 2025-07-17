import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT, User } from 'next-auth';

// Server-side backend URL function
const getServerBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
};

// Function to decode JWT token (without verification for now)
function decodeJWT(token: string) {
  try {
    console.log('=== JWT DECODE DEBUG ===');
    console.log('Token to decode:', token.substring(0, 50) + '...');
    
    const parts = token.split('.');
    console.log('Token parts count:', parts.length);
    
    if (parts.length !== 3) {
      console.error('Invalid JWT format - expected 3 parts');
      return null;
    }
    
    const base64Url = parts[1];
    console.log('Base64Url part:', base64Url.substring(0, 50) + '...');
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    console.log('Base64 part:', base64.substring(0, 50) + '...');
    
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    console.log('JSON payload:', jsonPayload);
    const decoded = JSON.parse(jsonPayload);
    console.log('Decoded JWT payload:', decoded);
    console.log('=== END JWT DECODE DEBUG ===');
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const backendURL = getServerBackendUrl();
    const response = await fetch(`${backendURL}/api/v1/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();
    console.log(`Refreshed Tokens: ${JSON.stringify(refreshedTokens)}`);

    // Check if the response contains an error
    if (refreshedTokens.error) {
      console.error('Backend returned error:', refreshedTokens.error);
      throw new Error(refreshedTokens.error);
    }

    // Check if response is not ok
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    // Check if we have the required fields
    if (!refreshedTokens.access) {
      throw new Error('No access token in response');
    }

    // Decode the new access token to extract organization data
    const decodedToken = decodeJWT(refreshedTokens.access);
    console.log('Decoded refreshed token:', decodedToken);

    // Log the organization data being preserved
    console.log('Token refresh - preserving organization data:', {
      organization: token.organization,
      organization_name: token.organization_name
    });

    return {
      ...token,
      accessToken: refreshedTokens.access,
      accessTokenExpires: Date.now() + (refreshedTokens.expires_in || 3600) * 1000,
      refreshToken: refreshedTokens.refresh ?? token.refreshToken,
      // Preserve organization data from original token (new token doesn't have it)
      organization: token.organization,
      organization_name: token.organization_name,
      organization_id: token.organization_id,
      email: token.email,
      full_name: token.full_name,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  // Log the NextAuth URL being used
  ...(() => {
    console.log('=== NextAuth Configuration ===');
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET');
    console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
    console.log('Expected domain: www.merlinsfork.com');
    console.log('URL mismatch:', process.env.NEXTAUTH_URL !== 'https://www.merlinsfork.com' ? 'YES - FIX NEEDED' : 'NO');
    console.log('=== End NextAuth Configuration ===');
    return {};
  })(),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const backendURL = getServerBackendUrl();
        console.log('=== AUTHORIZE CALLBACK DEBUG ===');
        console.log('Credentials received:', credentials);
        console.log('Making login request to:', `${backendURL}/api/v1/auth/login/`);
        
        const res = await fetch(`${backendURL}/api/v1/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        const user = await res.json();
        console.log('Login response status:', res.status);
        console.log('Login response ok:', res.ok);
        console.log('Login response:', user);
        console.log('AuthServiceResponse:', user);

        if (res.ok && user) {
          // The organization data is already in the login response, no need to decode JWT
          console.log('Using organization data from login response');
          
          // Map backend field names to frontend field names
          const result = {
            ...user,
            organization: user.organization_id || user.organization || null,  // Map organization_id to organization
            organization_name: user.organization_name || null,
          } as User;
          
          console.log('Final user object being returned:', result);
          console.log('=== END AUTHORIZE DEBUG ===');
          return result;
        } else {
          console.log('Login failed - response not ok or no user data');
          console.log('Response status:', res.status);
          console.log('Response body:', user);
          console.log('=== END AUTHORIZE DEBUG ===');
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, profile, trigger, isNewUser, session }) {
      if (user) {
        console.log('=== JWT CALLBACK - USER DATA ===');
        console.log('User organization:', user.organization);
        console.log('User organization_name:', user.organization_name);
        
        token.accessToken = user.access_token;
        token.refreshToken = user.refresh_token;
        token.accessTokenExpires = Date.now() + user.access_token_expires_in * 1000;
        token.email = user.email;
        
        // Decode the JWT token to get organization data and full_name
        const decodedToken = decodeJWT(user.access_token);
        console.log('Decoded JWT in JWT callback:', decodedToken);
        
        // Store organization data from login response (not from JWT token)
        token.organization = user.organization;
        token.organization_name = user.organization_name;
        token.organization_id = user.organization; // For compatibility
        
        // Extract full_name from JWT token
        token.full_name = decodedToken?.full_name || user.full_name;
        
        console.log('Token after user data:', {
          organization: token.organization,
          organization_name: token.organization_name,
          organization_id: token.organization_id,
          full_name: token.full_name
        });
        console.log('=== END JWT USER DEBUG ===');
      }

      // If we have a refresh error, return the token with error
      if (token.error === 'RefreshAccessTokenError') {
        console.log('Token has refresh error, returning without refresh');
        return token;
      }

      // Check if token exists and has expiration
      if (!token.accessTokenExpires) {
        console.log('No token expiration found, returning token as-is');
        return token;
      }

      // Calculate time until expiration (in milliseconds)
      const timeUntilExpiry = token.accessTokenExpires - Date.now();
      const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes

      console.log('=== TOKEN REFRESH CHECK ===');
      console.log('Current time:', new Date().toISOString());
      console.log('Token expires at:', new Date(token.accessTokenExpires).toISOString());
      console.log('Time until expiry (ms):', timeUntilExpiry);
      console.log('Time until expiry (minutes):', Math.round(timeUntilExpiry / 1000 / 60));

      // If token is not expired and won't expire in the next 5 minutes, return as-is
      if (timeUntilExpiry > fiveMinutesInMs) {
        console.log(`Token valid for ${Math.round(timeUntilExpiry / 1000 / 60)} more minutes, no refresh needed`);
        console.log('=== END TOKEN REFRESH CHECK ===');
        return token;
      }

      // Token is expired or will expire soon, refresh it
      console.log(`Token expires in ${Math.round(timeUntilExpiry / 1000)} seconds, refreshing...`);
      console.log('=== END TOKEN REFRESH CHECK ===');
      return refreshAccessToken(token);
    },
    async session({ session, token }: { session: any; token: JWT }): Promise<any> {
      console.log('=== SESSION CALLBACK DEBUG ===');
      console.log('Token organization:', token.organization);
      console.log('Token organization_name:', token.organization_name);
      console.log('Token email:', token.email);
      console.log('Token full_name:', token.full_name);
      
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.email = token.email!;
      session.user.name = token.full_name || token.email; // Use full_name or fallback to email
      session.user.full_name = token.full_name;
      session.user.organization = token.organization;
      session.user.organization_name = token.organization_name;
      session.user.organization_id = token.organization_id;
      
      console.log('Final session user data:', {
        email: session.user.email,
        name: session.user.name,
        full_name: session.user.full_name,
        organization: session.user.organization,
        organization_name: session.user.organization_name,
        organization_id: session.user.organization_id
      });
      
      if (token.error === 'RefreshAccessTokenError') {
        session.error = 'RefreshAccessTokenError';
      }
      console.log('=== END SESSION DEBUG ===');
      return session;
    },
  },
  pages: {
    signIn: '/user/login',
    error: '/auth/error',
  },
  debug: true,
}; 