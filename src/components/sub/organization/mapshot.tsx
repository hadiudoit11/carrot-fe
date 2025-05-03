'use client'

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { apiGet } from '@/providers/apiRequest';

// Define the type for site data
interface Site {
  name: string;
  address_1: string;
  city: string;
  state: string;
  zip_code: string;
  contact_email: string;
  latitude: number;
  longitude: number;
}

// Create a loading placeholder for the map
function MapLoadingPlaceholder() {
  return (
    <div className="h-[500px] w-full bg-secondary/20 animate-pulse flex items-center justify-center">
      <div className="text-text-secondary">Loading map...</div>
    </div>
  );
}

// Dynamically import the map component with SSR disabled
const DynamicMap = dynamic(
  () => import('./DynamicMapComponent'),
  {
    ssr: false,
    loading: MapLoadingPlaceholder
  }
);

export default function SiteMap() {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchSites() {
      try {
        setIsLoading(true);
        const backendURL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        console.log(`MapShot: Using backend URL: ${backendURL}`);
        
        const response = await apiGet(`${backendURL}/api/v1/auth/site/list/`);
        if (!response || !Array.isArray(response)) {
          console.error('Invalid response format or no data from server');
          setSites([]);
          return;
        }
        setSites(response);
      } catch (error) {
        console.error('Failed to fetch site data:', error);
        setSites([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSites();
  }, []);

  return (
    <div className="h-[500px] w-full z-0">
      <DynamicMap sites={sites} isLoading={isLoading} />
    </div>
  );
}