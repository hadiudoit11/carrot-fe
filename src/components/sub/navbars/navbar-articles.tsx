import { Menu } from '@headlessui/react';
import { useState } from 'react';

export default function NavbarArticles() {
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');

  return (
    <nav className="bg-white shadow px-4 py-2 flex items-center justify-between">
      {/* Left Section: Logo and Document Title */}
      <div className="flex items-center">
        {/* Logo
        <img
          className="h-8 w-auto"
          src="/path-to-your-logo.png" // Replace with your logo path
          alt="Your Company"
        /> */}
        {/* Document Title */}
        <input
          type="text"
          className="ml-4 text-lg font-semibold focus:outline-none"
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
        />
      </div>

      {/* Right Section: Share Button and User Profile */}
      <div className="flex items-center">
        {/* Share Button */}
        <button
          type="button"
          className="mr-4 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Share
        </button>

        {/* User Profile Menu */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <img
              className="h-8 w-8 rounded-full"
              src="https://via.placeholder.com/150" // Replace with user image
              alt="User"
            />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={`block px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''
                    }`}
                >
                  Your Profile
                </a>
              )}
            </Menu.Item>
            {/* Add more menu items as needed */}
          </Menu.Items>
        </Menu>
      </div>
    </nav>
  );
}
