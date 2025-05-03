// Add more detailed logging
export const signIn = async (credentials) => {
  try {
    console.log('Starting sign in process');
    console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Detailed sign in error:', error);
    throw error;
  }
};

/**
 * Refreshes the access token using the refresh token
 * @returns A promise that resolves to a boolean indicating whether the refresh was successful
 */
export async function refreshToken(): Promise<boolean> {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      console.error('No refresh token found');
      return false;
    }

    // Retry logic configuration
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second initial delay

    // Retry with exponential backoff
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Attempting to refresh token (attempt ${attempt + 1}/${maxRetries})`);
        
        // Set a timeout for the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        // If the response is not ok, throw an error
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`HTTP error ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        if (data.access) {
          setAccessToken(data.access);
          console.log('Token refreshed successfully');
          return true;
        } else {
          console.error('Refresh response did not contain access token:', data);
          return false;
        }
      } catch (error: any) {
        const isLastAttempt = attempt === maxRetries - 1;
        
        // Log detailed error information
        if (error.name === 'AbortError') {
          console.error(`Token refresh timeout (attempt ${attempt + 1}/${maxRetries})`);
        } else {
          console.error(`Token refresh error (attempt ${attempt + 1}/${maxRetries}):`, error);
        }
        
        // If this is the last attempt, rethrow the error
        if (isLastAttempt) {
          throw error;
        }
        
        // Calculate delay with exponential backoff and jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`Retrying in ${Math.round(delay/1000)} seconds...`);
        
        // Wait before the next attempt
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // This line should never be reached due to the loop structure
    return false;
  } catch (error: any) {
    // Final error handling after all retries failed
    console.error('Token refresh failed after all retries:', error);
    
    // Log specific error types for debugging
    if (error.name === 'AbortError') {
      console.error('The request was aborted due to timeout');
    } else if (error.code === 'UND_ERR_HEADERS_TIMEOUT') {
      console.error('Headers timeout error - possible network issue or backend server not responding');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - backend server might be down');
    }
    
    // Clear tokens if refresh failed (unless it's just a network error)
    if (error.name !== 'AbortError' && !error.code?.includes('TIMEOUT') && !error.code?.includes('ECONNREFUSED')) {
      clearTokens();
    }
    
    return false;
  }
} 