import { refreshAccessToken } from "@/pages/api/auth/[...nextauth]";
import { getSession } from "next-auth/react";

export async function apiRequest(url: string, method: string, body?: any): Promise<any> {
  const session = await getSession();

  if (!session) {
    console.error('No session found, please confirm session is being passed correctly');
    return new Response(null, { status: 401, statusText: 'Unauthorized' });
  }

  let accessToken = session.accessToken;

  if (!accessToken) {
    console.error('No access token found, please make sure access token is being passed correctly');
    return new Response(null, { status: 401, statusText: 'Unauthorized' });
  }

  let response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (response.status === 401) {
    console.log("Access Token expired, refreshing now...");

    const refreshedTokens = await refreshAccessToken({ refreshToken: session.refreshToken });

    if (!refreshedTokens.accessToken) {
      console.error('Failed to refresh access token');
      return new Response(null, { status: 401, statusText: 'Unauthorized' });
    }

    accessToken = refreshedTokens.accessToken;
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: body ? JSON.stringify(body) : null,
    });
  }

  if (response.ok) {
    console.log('res_status:', response.status);
    const data = await response.json();
    console.log('Fetched data:', data);
    return data;
  } else {
    console.error('Error fetching data:', response.statusText);
    return null;
  }
}

export async function apiGet(url: string): Promise<any> {
  return apiRequest(url, 'GET');
}

export async function apiPost(url: string, body: any): Promise<any> {
  return apiRequest(url, 'POST', body);
}

export async function apiPatch(url: string, body: any): Promise<any> {
  return apiRequest(url, 'PATCH', body);
}

export async function apiPut(url: string, body: any): Promise<any> {
  return apiRequest(url, 'PUT', body);
}
