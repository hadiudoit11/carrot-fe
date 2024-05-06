
'use server'

interface LoginFormData {
    email: string;
    password: string;
}

export async function login(prevState:any, formData:LoginFormData) {
    if (!formData || !formData.email || !formData.password) {
        console.error('Invalid formData:', formData);
        return { message: 'All fields are required' };
      }
    
    // 1. Validate form fields
    const { email, password } = formData; // Assuming name is also part of the form data
    if (!email || !password ) {
      return { message: 'All fields are required' };
    }
    // 2. Prepare data for sending to the server
    const dataToSend = JSON.stringify({
      email: email,
      password: password,
  
    });
  
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: dataToSend
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail);
        
      }
        if (result.access_token) {
          // 4. Create user session
          // localStorage.setItem('authToken', result.full_name);
    
          // 5. Redirect user
          return {
            message: 'User logged in successfully.',
            redirect: '/dashboard/home'
          };
        } else {
          return { message: 'Login failed:' + result.messsage };
        }
    } catch (error:any) {
      return { message: error.message };
    }
  }
  
