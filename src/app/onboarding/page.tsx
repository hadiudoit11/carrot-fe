'use client';
import React from "react";
import OnboardingLayout from "@/app/onboarding/layout";
import { useEffect} from "react";
import { useRouter } from "next/navigation";
import { useSession} from "next-auth/react";

const HomePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (session?.error === 'RefreshAccessTokenError') router.push('/user/login'); // Redirect if not authenticated
    console.log(session?.error)
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>; // Display a loading state while fetching session
  }
  return <OnboardingLayout />;
};

export default HomePage;
