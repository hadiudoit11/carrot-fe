// api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export async function refreshAccessToken(token) {
  try {
    const response = await fetch('http://localhost:8000/api/v1/auth/token/refresh/', {
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

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return {
      ...token,
      accessToken: refreshedTokens.access,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh ?? token.refreshToken,
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
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const res = await fetch('http://localhost:8000/api/v1/auth/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        const user = await res.json();
        console.log('AuthServiceResponse:', user);

        if (res.ok && user) {
          // Return the user along with the organization information
          return {
            ...user,
            organization: user.organization, // Assuming the organization data is included in the response
          };
        } else {
          return null;
        }
      },
    }),
  ],
  secret: process.env.SECRET_KEY,
  jwt: {
    signingKey: { kty: 'oct', k: process.env.SECRET_KEY },
    encryption: false,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.access_token;
        token.refreshToken = user.refresh_token;
        token.accessTokenExpires = Date.now() + user.access_token_expires_in * 1000;
        token.email = user.email;
        token.organization = user.organization; // Add organization data to the token
      }

      // If the access token has not expired, return the token
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, refresh it
      console.log('Access token expired, refreshing...');
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      console.log('Session callback called');
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.email = token.email;
      session.user.organization = token.organization; // Add organization data to the session
      if (token.error === 'RefreshAccessTokenError'){
        session.error = 'RefreshAccessTokenError';
      }
      return session;
    },

      
  },
  pages: {
    signIn: '/user/login',
    error: '/auth/error',
  },
  session: {
    jwt: true,
  },
  debug: true,
};

export default NextAuth(authOptions);
