import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export async function refreshAccessToken(token: any) {
  try {
    const backendUrl = process.env.BACKEND_URL;
    const response = await fetch(`${backendUrl}/api/v1/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return {
      ...token,
      accessToken: refreshedTokens.access,
      accessTokenExpires: Date.now() + 3600 * 1000, // 1 hour
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

if (!process.env.BACKEND_URL) {
  throw new Error('BACKEND_URL environment variable is not defined');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const backendUrl = process.env.BACKEND_URL;
          console.log('Making request to:', `${backendUrl}/api/v1/auth/login/`);
          
          // Clean up credentials object
          const loginData = {
            email: credentials?.email,
            password: credentials?.password
          };
          
          console.log('Sending login data:', loginData);

          const res = await fetch(`${backendUrl}/api/v1/auth/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(loginData)
          });

          // Log the response details
          console.log('Response status:', res.status);
          console.log('Response headers:', Object.fromEntries(res.headers.entries()));
          
          // Get the raw response text first
          const responseText = await res.text();
          console.log('Raw response:', responseText);

          let user;
          try {
            user = JSON.parse(responseText);
          } catch (e) {
            console.error('Failed to parse response as JSON:', e);
            return null;
          }

          if (res.ok && user) {
            return {
              id: user.id || user.email,
              email: user.email,
              access_token: user.access,
              refresh_token: user.refresh,
              access_token_expires_in: 3600, // Adjust based on your backend
            };
          }

          console.error('Authentication failed:', user);
          return null;
        } catch (e) {
          console.error('Authorization error:', e);
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.access_token;
        token.refreshToken = user.refresh_token;
        token.accessTokenExpires = Date.now() + (user.access_token_expires_in * 1000);
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    }
  },
  pages: {
    signIn: '/user/login',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 