'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/providers/apiRequest';
import SiteUpdate from '../slideouts/update-site';
import SiteCreate from '../slideouts/create-site';
import { Location, Person, SiteListProps } from '@/types';

function classNames(
  ...classes: (string | undefined | null | boolean)[]
): string {
  return classes.filter(Boolean).join(' ');
}

export default function SiteList({
  isCreateOpen = false,
  setIsCreateOpen = () => {},
  isUpdateOpen = false,
  setIsUpdateOpen = () => {},
  selectedSiteId = null,
  setSelectedSiteId = () => {},
}: SiteListProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [openLocationIndex, setOpenLocationIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchSites() {
      try {
        const backendURL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await apiGet(`${backendURL}/api/v1/auth/site/users/`);
        if (!response || !Array.isArray(response)) {
          console.error('Invalid response format or no data from server');
          return;
        }
        const transformedData: Location[] = response.map((site: any) => ({
          id: site.id,
          name: site.name,
          people: site.users.map((user: any) => ({
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            title: 'User',
            role: 'Member',
          })),
        }));

        setLocations(transformedData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    }

    fetchSites();
  }, []);

  const toggleLocation = (index: number) => {
    setOpenLocationIndex(openLocationIndex === index ? null : index);
  };

  const handleEditClick = (siteId) => {
    console.log('Edit clicked:', { siteId });
    setSelectedSiteId(siteId);
    setIsUpdateOpen(true);
    console.log('States updated:', { isUpdateOpen: true, selectedSiteId: siteId });
  };

  useEffect(() => {
    console.log("isCreateOpen state changed:", isCreateOpen);
  }, [isCreateOpen]);

  useEffect(() => {
    console.log("isUpdateOpen state changed:", isUpdateOpen);
  }, [isUpdateOpen]);

  return (
    <div className="relative bg-white p-8 rounded-lg">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Sites</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the users in your account organized by site, including their name, title, email, and role.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-orange-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-orange-500"
            onClick={() => {
              console.log("Add Site button clicked");
              console.log("Before state update:", isCreateOpen);
              setIsCreateOpen(true);
              console.log("After immediate check:", isCreateOpen); // Will likely still show false due to React's state batching
            }}
          >
            Add Site
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {locations.map((location, index) => (
              <div key={location.id} className="mb-4">
                <div
                  onClick={() => toggleLocation(index)}
                  className="cursor-pointer bg-gray-50 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3 rounded-md flex justify-between items-center"
                >
                  <div className="flex items-center space-x-2">
                    <span>{location.name}</span>
                    <span className="text-gray-600 text-sm">
                      {location.people.length} {location.people.length === 1 ? 'user' : 'users'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent accordion from toggling
                      handleEditClick(location.id); // Trigger edit with the site ID
                    }}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
                {openLocationIndex === index && (
                  <div className="mt-2">
                    <table className="min-w-full">
                      <thead className="bg-white">
                        <tr>
                          <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">Name</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Title</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                          <th className="relative py-3.5 pl-3 pr-4 sm:pr-3"><span className="sr-only">Edit</span></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {location.people.map((person, personIdx) => (
                          <tr key={person.email} className={classNames(personIdx === 0 ? 'border-gray-300' : 'border-gray-200', 'border-t')}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">{person.name}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.title}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.email}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.role}</td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                              <a href="#" className="text-orange-600 hover:text-indigo-900">Edit<span className="sr-only">, {person.name}</span></a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="z-50 relative">
        <SiteUpdate open={isUpdateOpen} setOpen={setIsUpdateOpen} siteId={selectedSiteId} />
        <SiteCreate open={isCreateOpen} setOpen={setIsCreateOpen} />
      </div>
    </div>
  );
}
