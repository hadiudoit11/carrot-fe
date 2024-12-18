// src/types/next-auth.d.ts

import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
  }
}

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      email: string;
      organization?: string;
      organization_name?: string;
    };
  }

  interface User {
    access_token: string;
    refresh_token: string;
    access_token_expires_in: number;
    email: string;
    organization?: string;
    organization_name?: string;
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    email?: string;
    organization?: string;
    organization_name?: string;
  }
}