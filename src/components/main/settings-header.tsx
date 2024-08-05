import { useState

 } from "react";
import OrgSettings from "../sub/organization/org-settings";
import Permissions from "../sub/permissions";
import Roles from "../sub/roles";


const tabs = [
    { name: 'Organization', href: 'organization', current: false },
    { name: 'Roles & Permissions', href: 'permissions', current: false },
    { name: 'Integrations', href: 'integrations', current: true },

  ]

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }
  
  export default function SettingsHeader() {
    const [currentTab, setCurrentTab] = useState(tabs.find(tab => tab.current).href);
  
    const renderContent = () => {
      switch (currentTab) {
        case 'organization':
          return <div><OrgSettings /></div>;
        case 'permissions':
          return <div><Roles /></div>;
        case 'integrations':
          return <div>Integrations Content</div>;
        default:
          return null;
      }
    };
  
    return (
      <div>
        <div className="border-b pb-5 sm:pb-0">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Candidates</h3>
          <div className="mt-3 sm:mt-4">
            <div className="sm:hidden">
              <label htmlFor="current-tab" className="sr-only">
                Select a tab
              </label>
              <select
                id="current-tab"
                name="current-tab"
                defaultValue={tabs.find((tab) => tab.current).name}
                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                onChange={(e) => setCurrentTab(e.target.value)}
              >
                {tabs.map((tab) => (
                  <option key={tab.name} value={tab.href}>
                    {tab.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <a
                    key={tab.name}
                    href="#"
                    onClick={() => setCurrentTab(tab.href)}
                    aria-current={currentTab === tab.href ? 'page' : undefined}
                    className={classNames(
                      currentTab === tab.href
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                      'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium'
                    )}
                  >
                    {tab.name}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    );
  }