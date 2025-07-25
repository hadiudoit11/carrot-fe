/**
 * API Request Provider
 * Handles all API requests with proper environment configuration and authentication
 */

import { getSession } from 'next-auth/react';

const getBackendUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable directly
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  }
  
  // Client-side: use window.ENV if available, fallback to process.env
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  console.log('getBackendUrl - process.env.NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
  console.log('getBackendUrl - final URL:', url);
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

// Helper to get authentication headers
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const session = await getSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
    console.log('Adding Authorization header with token:', session.accessToken.substring(0, 10) + '...');
  } else {
    console.warn('No access token found in session');
  }
  
  return headers;
};

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  console.log('handleResponse called with status:', response.status);
  
  if (!response.ok) {
    console.log('Response not ok, trying to get error data...');
    // Try to get error message from response
    try {
      const errorData = await response.json();
      console.log('Error data:', errorData);
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    } catch (e) {
      console.log('Could not parse error data:', e);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
  
  // Check if response is empty
  const contentType = response.headers.get('content-type');
  console.log('Content-Type:', contentType);
  if (contentType && contentType.includes('application/json')) {
    const jsonData = await response.json();
    console.log('JSON response:', jsonData);
    return jsonData;
  }
  const textData = await response.text();
  console.log('Text response:', textData);
  return textData;
};

// Helper to build URL with query parameters
const buildUrl = (endpoint: string, params?: Record<string, string>) => {
  const baseUrl = getBackendUrl();
  console.log('buildUrl - baseUrl:', baseUrl);
  console.log('buildUrl - endpoint:', endpoint);
  
  const url = new URL(`${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
  console.log('buildUrl - final URL:', url.toString());
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
  }
  
  return url.toString();
};

// GET request
export const apiGet = async (endpoint: string, options: RequestOptions = {}) => {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params);
  const headers = await getAuthHeaders();
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...headers,
      ...options.headers,
    },
    ...fetchOptions,
  });
  
  return handleResponse(response);
};

// POST request
export const apiPost = async (endpoint: string, data?: any, options: RequestOptions = {}) => {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params);
  const headers = await getAuthHeaders();
  
  console.log('apiRequest called with URL:', url, 'method: POST');
  console.log('Request data:', data);
  
  console.log('Starting fetch request...');
  
  // Simple timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 5000); // 5 second timeout
  });
  
  const fetchPromise = fetch(url, {
    method: 'POST',
    headers: {
      ...headers,
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...fetchOptions,
  });
  
  try {
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    console.log('Fetch completed successfully');
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    return handleResponse(response);
  } catch (error) {
    console.log('Fetch failed with error:', error);
    throw error;
  }
};

// PUT request
export const apiPut = async (endpoint: string, data?: any, options: RequestOptions = {}) => {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params);
  const headers = await getAuthHeaders();
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      ...headers,
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...fetchOptions,
  });
  
  return handleResponse(response);
};

// DELETE request
export const apiDelete = async (endpoint: string, options: RequestOptions = {}) => {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params);
  const headers = await getAuthHeaders();
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...headers,
      ...options.headers,
    },
    ...fetchOptions,
  });
  
  return handleResponse(response);
};

// Export the getBackendUrl function for debugging
export { getBackendUrl }; 