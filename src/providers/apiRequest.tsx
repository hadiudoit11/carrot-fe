import { getSession } from 'next-auth/react';
import { refreshAccessToken } from '@/app/api/auth/[...nextauth]/route';

export async function apiGet(url: string) {
  const session = await getSession();
  let accessToken = session?.accessToken;
  let accessTokenExpires = session?.accessTokenExpires;
  let refreshToken = session?.refreshToken;

  if (accessTokenExpires && Date.now() > accessTokenExpires && refreshToken) {
    try {
      const refreshedTokens = await refreshAccessToken({ refreshToken });
      accessToken = refreshedTokens.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response.json();
}

export async function apiPost(url: string, data: any) {
  const session = await getSession();
  let accessToken = session?.accessToken;
  let accessTokenExpires = session?.accessTokenExpires;
  let refreshToken = session?.refreshToken;

  if (accessTokenExpires && Date.now() > accessTokenExpires && refreshToken) {
    try {
      const refreshedTokens = await refreshAccessToken({ refreshToken });
      accessToken = refreshedTokens.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response.json();
}

export async function apiPatch(url: string, data: any) {
  const session = await getSession();
  let accessToken = session?.accessToken;
  let accessTokenExpires = session?.accessTokenExpires;
  let refreshToken = session?.refreshToken;

  if (accessTokenExpires && Date.now() > accessTokenExpires && refreshToken) {
    try {
      const refreshedTokens = await refreshAccessToken({ refreshToken });
      accessToken = refreshedTokens.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response.json();
}
