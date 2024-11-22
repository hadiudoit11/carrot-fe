'use client';

import { useEffect, useState, Fragment } from 'react';
import AddUser from './slideouts/add-user';
import { apiGet } from '@/providers/apiRequest';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function CreateUser() {
  const [isSlideOverOpen, setSlideOverOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [openSites, setOpenSites] = useState({});

  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await apiGet('http://localhost:8000/api/v1/auth/site/users/');
        if (!response) {
          console.error('No response from server');
          return;
        }

        // Assuming the response is an array of site objects
        const transformedData = response.map((site) => ({
          siteName: site.name,
          users: site.user.map((user) => ({
            id: user, // Use the user ID
            name: `${user.first_name} ${user.last_name}`, // Adjust based on your data
            title: 'Site Admin', // Placeholder title
            email: user.email, // Use the actual email
            role: site.is_verified ? 'Verified' : 'Unverified',
          })),
        }));

        console.log('Transformed Data:', transformedData);
        setSites(transformedData);
      } catch (error) {
        console.error('Failed to fetch sites:', error);
      }
    }

    fetchSites();
  }, []);

  const toggleSite = (siteName) => {
    setOpenSites((prev) => ({
      ...prev,
      [siteName]: !prev[siteName],
    }));
  };

  return (
    <div className="bg-white p-8 rounded-lg">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the users in your account organized by site.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-orange-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => setSlideOverOpen(true)}
          >
            Add user
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {sites.map((site) => (
              <div key={site.siteName} className="mb-4">
                <div
                  onClick={() => toggleSite(site.siteName)}
                  className="cursor-pointer bg-gray-50 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3 rounded-md"
                >
                  {site.siteName}
                </div>
                {openSites[site.siteName] && (
                  <div className="mt-2">
                    <table className="min-w-full">
                      <thead className="bg-white">
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Title
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Role
                          </th>
                          <th
                            scope="col"
                            className="relative py-3.5 pl-3 pr-4 sm:pr-3"
                          >
                            <span className="sr-only">Edit</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {site.users.map((user, userIdx) => (
                          <tr
                            key={user.id}
                            className={classNames(
                              userIdx === 0 ? 'border-gray-300' : 'border-gray-200',
                              'border-t'
                            )}
                          >
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                              {user.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {user.title || 'N/A'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {user.email || 'N/A'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {user.role || 'N/A'}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                              <a href="#" className="text-orange-600 hover:text-indigo-900">
                                Edit<span className="sr-only">, {user.name}</span>
                              </a>
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
      <div className="z-50">
      <AddUser open={isSlideOverOpen} setOpen={setSlideOverOpen} />
      </div>
    </div>
  );
}
