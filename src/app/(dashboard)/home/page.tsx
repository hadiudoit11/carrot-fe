"use client";

import { SectionCards } from '@/components/sub/analytics/section-cards';
import { ChartAreaInteractive } from '@/components/sub/analytics/chart-area-interactive';
import { DataTable } from '@/components/sub/analytics/data-table';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Sample data for the DataTable
const data = [
  {
    id: 1,
    header: "Homepage Redesign",
    type: "UI/UX",
    status: "In Progress",
    target: "Q3 2024",
    limit: "$10,000",
    reviewer: "Alice Smith",
  },
  {
    id: 2,
    header: "API Performance Audit",
    type: "Backend",
    status: "Done",
    target: "Q2 2024",
    limit: "$5,000",
    reviewer: "Bob Johnson",
  },
  {
    id: 3,
    header: "Mobile App Launch",
    type: "Mobile",
    status: "In Review",
    target: "Q4 2024",
    limit: "$20,000",
    reviewer: "Carol Lee",
  },
  {
    id: 4,
    header: "Security Penetration Test",
    type: "Security",
    status: "Planned",
    target: "Q1 2025",
    limit: "$8,000",
    reviewer: "David Kim",
  },
  {
    id: 5,
    header: "Content Marketing Sprint",
    type: "Marketing",
    status: "Done",
    target: "Q3 2024",
    limit: "$3,000",
    reviewer: "Eve Martinez",
  },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Home page useEffect triggered');
    console.log('Status:', status);
    console.log('Session:', session);
    
    if (status === 'loading') {
      console.log('Session still loading...');
      return; // Wait for session to load
    }
    
    setIsLoading(false);
    
    // Only check authentication after session has loaded
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
      console.log('Found organization, staying on home page');
      console.log('Organization ID:', session.user.organization);
      console.log('Organization Name:', session.user.organization_name);
      // Session is valid, we can stay on this page
    } else if (status === 'authenticated') {
      console.log('Authenticated but no organization, redirecting to /onboarding');
      router.push('/onboarding');
    }
  }, [session, status, router]);

  if (status === 'loading' || isLoading) {
    return <div className="text-text-primary">Loading...</div>;
  }

  return (
    <div className="flex flex-col md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  );
}