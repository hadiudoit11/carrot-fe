"use client";

import { SectionCards } from '@/components/sub/analytics/section-cards';
import { ChartAreaInteractive } from '@/components/sub/analytics/chart-area-interactive';
import { DataTable } from '@/components/sub/analytics/data-table';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Sample data for the DataTable
const data = [
  // Your data here
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    setIsLoading(false);
    
    if (!session || session?.error === 'RefreshAccessTokenError') {
      router.push('/user/login');
      return;
    }
    
    if (!session?.user.organization) {
      router.push('/onboarding');
      return;
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