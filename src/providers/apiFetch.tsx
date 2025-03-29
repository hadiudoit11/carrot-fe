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
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: token,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      accessToken: refreshedTokens.access,
      refreshToken: refreshedTokens.refresh,
      accessTokenExpires: Date.now() + 4 * 60 * 1000, // 4 minutes
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

export async function fetchWithToken(url: string, options: RequestInit = {}) {
  let accessToken: string | undefined;
  let refreshToken: string | undefined;
  let accessTokenExpires: number = 0;

  const session = await getSession() as CustomSession | null;
  if (session) {
    accessToken = session.accessToken;
    refreshToken = session.refreshToken;
    accessTokenExpires = session.accessTokenExpires ?? 0;
  }

  if (accessTokenExpires && Date.now() > accessTokenExpires && refreshToken) {
    try {
      const refreshedTokens = await refreshAccessToken(refreshToken);
      
      accessToken = refreshedTokens.accessToken;
      accessTokenExpires = refreshedTokens.accessTokenExpires ?? Date.now() + 4 * 60 * 1000;
      refreshToken = refreshedTokens.refreshToken;

    } catch (error) {
      console.error('Error refreshing token:', error);
      await signOut();
      throw new Error('Your session has expired. Please sign in again.');
    }
  }

  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred while fetching the data.');
  }

  return response.json();
}
