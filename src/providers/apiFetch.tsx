// apiFetch.tsx

import { refreshAccessToken } from "@/pages/api/auth/[...nextauth]";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";

// Type for Session with custom fields
interface CustomSession extends Session {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<any> {
  const session = (await getSession()) as CustomSession;

  if (!session) {
    console.error('No session found, please confirm session is being set correctly at login');
    return new Response(null, { status: 401, statusText: 'Unauthorized' });
  }

  let { accessToken, accessTokenExpires, refreshToken } = session;

  if (!accessToken) {
    console.error('No access token found in session');
    return new Response(null, { status: 401, statusText: 'Unauthorized' });
  }

  // Check if the access token is expired or close to expiring
  if (Date.now() >= accessTokenExpires - 60000) { // Refresh if token will expire in the next minute
    console.log("Access Token expired or close to expiring, refreshing now...");

    const refreshedTokens = await refreshAccessToken({ refreshToken });

    if (!refreshedTokens.accessToken) {
      console.error('Failed to refresh access token');
      return new Response(null, { status: 401, statusText: 'Unauthorized' });
    }

    // Update session with new tokens
    accessToken = refreshedTokens.accessToken;
    accessTokenExpires = refreshedTokens.accessTokenExpires;
    refreshToken = refreshedTokens.refreshToken;
    
    // Update session with new token details
    session.accessToken = accessToken;
    session.accessTokenExpires = accessTokenExpires;
    session.refreshToken = refreshToken;
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Check for successful response and log the data
  if (res.ok) {
    console.log('res_status:', res.status)
    const data = await res.json();
    console.log('Fetched data:', data);
    return data;
  } else {
    console.error('Error fetching data:', res.statusText);
    return null;
  }
}
