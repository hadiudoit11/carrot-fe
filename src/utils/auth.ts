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