import { LoginFormData, LoginResponseData } from '@/types';
import { setCookie } from 'nookies';

export async function login(formData: LoginFormData): Promise<{ message: string; redirect?: string; }> {
  if (!formData || !formData.email || !formData.password) {
    console.error('Invalid formData:', formData);
    return { message: 'All fields are required' };
  }

  const { email, password } = formData;
  const dataToSend = JSON.stringify({ email, password });

  try {
    const response = await fetch('http://localhost:8000/api/v1/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: dataToSend,
    });

    const result: LoginResponseData = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || 'Login failed');
    }

    if (result.access_token && result.refresh_token && result.email) {
      if (typeof window !== 'undefined') {
        // Set tokens in cookies
        setCookie(null, 'access_token', result.access_token, {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/',
        });
        setCookie(null, 'refresh_token', result.refresh_token, {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/',
        });
        setCookie(null, 'email', result.email, {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/',
        });
      }

      // Return tokens and redirect path
      return {
        message: 'User logged in successfully.',
        redirect: '/home',
      };
    } else {
      return { message: 'Login failed: ' + (result.message || 'Unknown error') };
    }
  } catch (error: any) {
    return { message: 'Login error: ' + error.message };
  }
}
