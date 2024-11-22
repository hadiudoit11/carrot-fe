import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { apiGet } from '@/providers/apiRequest';
import L from 'leaflet';

// Configure the default icon for Leaflet markers
const DefaultIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.freepik.com/256/15692/15692786.png?semt=ais_hybrid', // Ensure this URL is valid
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: '/leaflet/marker-shadow.png', // Make sure this shadow icon exists in your public folder
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function SiteMap() {
  const [sites, setSites] = useState([]);

  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await apiGet('http://localhost:8000/api/v1/auth/site/list/');
        if (!response || !Array.isArray(response)) {
          console.error('Invalid response format or no data from server');
          return;
        }
        setSites(response);
      } catch (error) {
        console.error('Failed to fetch site data:', error);
      }
    }

    fetchSites();
  }, []);

  return (
    <div className="h-[500px] w-full z-0">
      <MapContainer center={[40.7240704, -73.8394112]} zoom={5} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {sites.map((site, index) => (
          site.latitude && site.longitude && (
            <Marker key={index} position={[site.latitude, site.longitude]}>
              <Popup>
                <div>
                  <h2 className="font-semibold">{site.name}</h2>
                  <p>{site.address_1}, {site.city}, {site.state} {site.zip_code}</p>
                  <p>{site.contact_email}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
