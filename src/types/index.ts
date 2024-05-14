// types/index.ts
export interface LoginFormData {
    email: string;
    password: string;
  }
  
  export interface LoginResponseData {
    access_token: string;
    refresh_token: string;
    email: string;
  }
  