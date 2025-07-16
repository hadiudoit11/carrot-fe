'use client';
import React from "react";
import OnboardingLayout from "@/app/onboarding/layout";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession} from "next-auth/react";

const HomePage: React.FC = () => {
  console.log('Onboarding component is loading!');
  
  const { data: session, status } = useSession();
  const router = useRouter();
  
  console.log('Session status:', status);
  console.log('Session data:', session);
  
  useEffect(() => {
    console.log('Onboarding useEffect triggered');
    console.log('Status:', status);
    console.log('Session:', session);
    
    if (status === 'loading') {
      console.log('Session still loading...');
      return; // Wait for session to load
    }
    
    if (status === 'unauthenticated') {
      console.log('User is unauthenticated, redirecting to /user/login');
      router.push('/user/login');
      return;
    }
    
    if (session?.error === 'RefreshAccessTokenError') {
      console.log('Session error detected, redirecting to /user/login');
      router.push('/user/login');
      return;
    }
    
    // Check if we have a valid session with organization
    if (session?.user?.organization && status === 'authenticated') {
      console.log('Found organization, redirecting to /home');
      console.log('Organization ID:', session.user.organization);
      console.log('Organization Name:', session.user.organization_name);
      router.push('/home');
      console.log('Redirect to /home initiated');
    } else if (status === 'authenticated') {
      console.log('Authenticated but no organization, staying on onboarding');
      console.log('Session user:', session?.user);
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading session...</div>; // Display a loading state while fetching session
  }
  
  if (status === 'unauthenticated') {
    return <div>Redirecting to login...</div>;
  }
  
  return <OnboardingLayout />;
};

export default HomePage;
