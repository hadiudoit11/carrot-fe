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
        const backendURL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        const sitesResponse = await apiGet(`${backendURL}/api/v1/auth/site/list/`);
        if (!sitesResponse || !Array.isArray(sitesResponse)) {
          console.error('Invalid response format or no data from sites server');
          return;
        }
        const numberOfSites = sitesResponse.length;

        // Fetch data for the number of users
        const usersResponse = await apiGet(`${backendURL}/api/v1/auth/organization/users/`);
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
    <div className="w-full h-full font-secondary">
      <dl className="grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-tertiary border-2 border-accent shadow-accent-offset md:grid-cols-3 md:divide-x md:divide-y-0">
        {stats.map((item) => (
          <div key={item.name} className="px-4 py-5 sm:p-6">
            <dt className="text-base font-normal text-text-light font-primary">{item.name}</dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-accent font-primary">
                {item.stat}
                <span className="ml-2 text-sm font-medium text-text-secondary font-secondary">from {item.previousStat}</span>
              </div>

              <div
                className={classNames(
                  item.changeType === 'increase' ? 'bg-status-success bg-opacity-10 text-status-success' : 'bg-status-error bg-opacity-10 text-status-error',
                  'inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0 font-secondary'
                )}
              >
                {item.changeType === 'increase' ? (
                  <ArrowUpIcon
                    className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-status-success"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowDownIcon
                    className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-status-error"
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
