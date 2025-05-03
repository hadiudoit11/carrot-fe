import { refreshAccessToken } from "@/pages/api/auth/[...nextauth]";
import { getSession, signIn, useSession } from "next-auth/react";

export async function apiRequest(url: string, method: string, body?: any): Promise<any> {
  console.log(`apiRequest called with URL: ${url}, method: ${method}`);
  
  // Get the current session
  let session = await getSession();

  if (!session) {
    console.error('No session found, please confirm session is being passed correctly');
    return null;
  }

  let accessToken = session.accessToken;

  if (!accessToken) {
    console.error('No access token found, please make sure access token is being passed correctly');
    return null;
  }

  // First attempt with current token
  let response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: body ? JSON.stringify(body) : null,
  });
  
  console.log(`Initial request status: ${response.status}`);
  console.log(`Using token: ${accessToken.substring(0, 10)}...`);

  // If token is expired (401), try to refresh it
  if (response.status === 401) {
    console.log("Access Token expired, refreshing now...");

    try {
      // Refresh the token
      const refreshedTokens = await refreshAccessToken({ 
        refreshToken: session.refreshToken 
      });

      if (!refreshedTokens || !refreshedTokens.accessToken) {
        console.error('Failed to refresh access token');
        // Force re-login if refresh fails
        await signIn();
        return null;
      }

      console.log("Token refreshed successfully");
      console.log("New access token:", refreshedTokens.accessToken.substring(0, 10) + "...");
      
      // Update the session with the new tokens
      session.accessToken = refreshedTokens.accessToken;
      if (refreshedTokens.refreshToken) {
        session.refreshToken = refreshedTokens.refreshToken;
      }
      
      // Use the new token for the request
      accessToken = refreshedTokens.accessToken;
      
      // Make the request again with the new token
      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: body ? JSON.stringify(body) : null,
      });
      
      console.log(`Retry request status: ${response.status}`);
      console.log(`Using refreshed token: ${accessToken.substring(0, 10)}...`);
      
      // If still failing after refresh, something else is wrong
      if (response.status === 401) {
        console.error("Still getting 401 after token refresh. Forcing re-login.");
        await signIn();
        return null;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  }
  
  // Process the response
  if (response.ok) {
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Response was OK but couldn't parse JSON");
      return { success: true };
    }
  } else {
    console.error(`Request failed with status: ${response.status}`);
    try {
      const errorData = await response.json();
      console.error("Error details:", errorData);
    } catch (e) {
      // Ignore if we can't parse the error response
    }
    return null;
  }
}

export async function apiGet(url: string): Promise<any> {
  console.log(`apiGet called with URL: ${url}`);
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

export async function apiDelete(url: string): Promise<any> {
  return apiRequest(url, 'DELETE');
}