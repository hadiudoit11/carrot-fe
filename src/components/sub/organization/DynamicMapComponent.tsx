'use client';

import React, { useEffect, useRef, useState } from 'react';

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

interface DynamicMapProps {
  sites: Site[];
  isLoading: boolean;
}

// Create a component that will only render on the client side
const DynamicMapComponent: React.FC<DynamicMapProps> = ({ sites, isLoading }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [hasError, setHasError] = useState(false);
  
  // Create a unique ID for the map container
  const mapContainerId = useRef(`map-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    // Store current refs to use in cleanup
    const currentMapRef = mapRef.current;
    let L: any = null;
    
    // Only run this effect on the client side
    if (typeof window === 'undefined' || isLoading || !currentMapRef) return;

    async function initializeMap() {
      try {
        // Import Leaflet only on client side
        await import('leaflet/dist/leaflet.css');
        L = (await import('leaflet')).default;
        
        // Clean up any existing map instance first
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }
        
        // Create a new map
        const map = L.map(currentMapRef, {
          attributionControl: false,
          zoomControl: true
        }).setView([39.8283, -98.5795], 4); // Center on US
        
        // Store the map instance for cleanup
        leafletMapRef.current = map;
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Configure default icon
        const DefaultIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        // Add markers for each site
        if (sites && sites.length > 0) {
          const bounds = L.latLngBounds([]);
          
          sites.forEach(site => {
            if (site.latitude && site.longitude) {
              // Create marker
              const marker = L.marker([site.latitude, site.longitude], { icon: DefaultIcon })
                .addTo(map)
                .bindPopup(`
                  <div>
                    <h3 style="font-weight: bold; margin-bottom: 5px;">${site.name}</h3>
                    <p>${site.address_1}</p>
                    <p>${site.city}, ${site.state} ${site.zip_code}</p>
                    ${site.contact_email ? `<p>Contact: ${site.contact_email}</p>` : ''}
                  </div>
                `);
                
              // Extend bounds to include this marker
              bounds.extend([site.latitude, site.longitude]);
            }
          });
          
          // Fit map to bounds if we have valid locations
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        }
        
        // Force a resize of the map after rendering
        setTimeout(() => {
          if (leafletMapRef.current) {
            leafletMapRef.current.invalidateSize();
          }
        }, 100);
        
      } catch (error) {
        console.error('Error initializing map:', error);
        setHasError(true);
      }
    }

    initializeMap();
    
    // Clean up function to properly remove the map when component unmounts
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [sites, isLoading]); // Only re-run if sites or loading state changes

  // Update map when sites change
  useEffect(() => {
    if (leafletMapRef.current && sites && sites.length > 0 && !isLoading) {
      const updateMapBounds = async () => {
        try {
          const L = (await import('leaflet')).default;
          const bounds = L.latLngBounds([]);
          
          // Extend bounds to include all site markers
          sites.forEach(site => {
            if (site.latitude && site.longitude) {
              bounds.extend([site.latitude, site.longitude]);
            }
          });
          
          if (bounds.isValid() && leafletMapRef.current) {
            leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] });
          }
        } catch (error) {
          console.error('Error updating map bounds:', error);
        }
      };
      
      updateMapBounds();
    }
  }, [sites, isLoading]);

  // Handle error state
  if (hasError) {
    return (
      <div className="h-full w-full bg-red-50 flex items-center justify-center">
        <div className="text-red-500 text-center p-4">
          <p className="font-bold mb-2">Error loading map</p>
          <p>Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="h-full w-full bg-secondary/20 animate-pulse flex items-center justify-center">
        <div className="text-text-secondary">Loading map data...</div>
      </div>
    );
  }

  // Render the map container
  return (
    <div
      id={mapContainerId.current}
      ref={mapRef}
      className="h-full w-full relative z-0"
    />
  );
};

export default DynamicMapComponent; 