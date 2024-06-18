// apiFetch.tsx

import { refreshAccessToken } from "@/pages/api/auth/[...nextauth]";
import { getSession } from "next-auth/react";

export async function apiFetch(url: string, options: RequestInit = {}): Promise<any> {
  const session = await getSession();

  if (!session) {
    console.error('No session found, please confirm session is being set correctly at login');
    return new Response(null, { status: 401, statusText: 'Unauthorized' });
  }

  let accessToken = session.accessToken;

  if (!accessToken) {
    console.error('No access token found in session');
    return new Response(null, { status: 401, statusText: 'Unauthorized' });
  }

  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401) {
    console.log("Access Token expired, refreshing now...");

    const refreshedTokens = await refreshAccessToken({ refreshToken: session.refreshToken });

    if (!refreshedTokens.accessToken) {
      console.error('Failed to refresh access token');
      return new Response(null, { status: 401, statusText: 'Unauthorized' });
    }

    // Update session with new tokens
    accessToken = refreshedTokens.accessToken;

    res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

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
