import { useEffect, useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { apiGet } from '@/providers/apiRequest';

function classNames(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}


export default function Snapshot() {
  const [stats, setStats] = useState([
    { name: 'Net Sales', stat: '$0', previousStat: '$0', change: '0%', changeType: 'increase' },
    { name: 'Number of Sites', stat: '0', previousStat: '0', change: '0%', changeType: 'increase' },
    { name: 'Number of Users', stat: '0', previousStat: '0', change: '0%', changeType: 'increase' }, // New stat
  ]);

  useEffect(() => {
    async function fetchSiteAndUserInfo() {
      try {
        // Fetch data for the number of sites
        const sitesResponse = await apiGet('http://localhost:8000/api/v1/auth/site/list/');
        if (!sitesResponse || !Array.isArray(sitesResponse)) {
          console.error('Invalid response format or no data from sites server');
          return;
        }
        const numberOfSites = sitesResponse.length;

        // Fetch data for the number of users
        const usersResponse = await apiGet('http://localhost:8000/api/v1/auth/organization/users/');
        if (!usersResponse || !Array.isArray(usersResponse)) {
          console.error('Invalid response format or no data from users server');
          return;
        }
        const numberOfUsers = usersResponse.length;

        // Update stats with dynamic data
        setStats((prevStats) => [
          { ...prevStats[0], stat: `$0` }, // Keep Net Sales unchanged
          { ...prevStats[1], stat: numberOfSites.toString() }, // Update the number of sites
          { ...prevStats[2], stat: numberOfUsers.toString() }, // Update the number of users
        ]);
      } catch (error) {
        console.error('Failed to fetch site or user info:', error);
      }
    }

    fetchSiteAndUserInfo();
  }, []);

  return (
    <div>
      <dl className="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow md:grid-cols-3 md:divide-x md:divide-y-0">
        {stats.map((item) => (
          <div key={item.name} className="px-4 py-5 sm:p-6">
            <dt className="text-base font-normal text-gray-900">{item.name}</dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-indigo-600">
                {item.stat}
                <span className="ml-2 text-sm font-medium text-gray-500">from {item.previousStat}</span>
              </div>

              <div
                className={classNames(
                  item.changeType === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                  'inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0'
                )}
              >
                {item.changeType === 'increase' ? (
                  <ArrowUpIcon
                    className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-green-500"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowDownIcon
                    className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-red-500"
                    aria-hidden="true"
                  />
                )}
                <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                {item.change}
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
