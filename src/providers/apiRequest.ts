/**
 * API Request Provider
 * Handles all API requests with proper environment configuration
 */

const getBackendUrl = () => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) {
    console.error('Backend URL not configured!');
    return 'http://localhost:80'; // Fallback for development
  }
  return url.endsWith('/') ? url.slice(0, -1) : url; // Remove trailing slash if present
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Try to get error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    } catch (e) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
  
  // Check if response is empty
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

// Helper to build URL with query parameters
const buildUrl = (endpoint: string, params?: Record<string, string>) => {
  const baseUrl = getBackendUrl();
  const url = new URL(`${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
  
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
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
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
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...fetchOptions,
  });
  
  return handleResponse(response);
};

// PUT request
export const apiPut = async (endpoint: string, data?: any, options: RequestOptions = {}) => {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params);
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
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
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...fetchOptions,
  });
  
  return handleResponse(response);
};

// Export the getBackendUrl function for debugging
export { getBackendUrl }; 