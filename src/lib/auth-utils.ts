import { getSession, signOut } from 'next-auth/react';

/**
 * Checks if the current session is valid and the access token is not expired
 * @returns {Promise<boolean>} True if session is valid, false otherwise
 */
export async function isSessionValid(): Promise<boolean> {
  try {
    const session = await getSession();
    
    if (!session) return false;
    
    // Check if we have an access token
    if (!session.accessToken) {
      console.error('No access token in session');
      return false;
    }
    
    // Check if there's an error in the session, usually from failed token refresh
    if (session.error === 'RefreshAccessTokenError') {
      console.error('Session has refresh token error');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
}

/**
 * Attempts to get a fresh session, forcing a token refresh if needed
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function refreshSession(): Promise<boolean> {
  try {
    // Get current session
    const session = await getSession();
    
    if (!session) {
      console.error('No session to refresh');
      return false;
    }
    
    // If session has refresh error, we need to sign out and re-authenticate
    if (session.error === 'RefreshAccessTokenError') {
      console.error('Session has refresh error, signing out');
      await signOut({ redirect: false });
      return false;
    }
    
    // Check for a valid access token
    if (!session.accessToken) {
      console.error('No access token in session');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return false;
  }
}

/**
 * Signs out the user and optionally redirects to login page
 * @param {boolean} redirectToLogin Whether to redirect to login page
 * @returns {Promise<void>}
 */
export async function handleSignOut(redirectToLogin = true): Promise<void> {
  try {
    await signOut({ 
      redirect: redirectToLogin,
      callbackUrl: redirectToLogin ? '/user/login' : undefined
    });
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

/**
 * Handle session errors by checking session state and redirecting if needed
 * @param router Next.js router
 * @returns {Promise<boolean>} True if session is valid, false if redirected
 */
export async function handleSessionError(router: any): Promise<boolean> {
  const session = await getSession();
  
  if (!session) {
    console.log('No session found, redirecting to login');
    router.push('/user/login');
    return false;
  }
  
  if (session.error === 'RefreshAccessTokenError') {
    console.log('Session has refresh error, signing out and redirecting');
    await signOut({ redirect: false });
    router.push('/user/login');
    return false;
  }
  
  return true;
} 