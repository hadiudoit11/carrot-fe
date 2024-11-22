import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiGet, apiPatch } from '@/providers/apiRequest';

export default function SiteUpdate({ open, setOpen, siteId }) {
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    zip_code: '',
    legal_entity_name: '',
    contact_email: '',
    user: [], // this will hold user objects
  });
  
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchSiteData() {
      if (!siteId) return;

      try {
        const siteResponse = await apiGet(`http://localhost:8000/api/v1/auth/site/detail/${siteId}/`);
        
        setFormData({
          name: siteResponse.name || '',
          phone_number: siteResponse.phone_number || '',
          address_1: siteResponse.address_1 || '',
          address_2: siteResponse.address_2 || '',
          city: siteResponse.city || '',
          state: siteResponse.state || '',
          zip_code: siteResponse.zip_code || '',
          legal_entity_name: siteResponse.legal_entity_name || '',
          contact_email: siteResponse.contact_email || '',
          user: siteResponse.users || [], // populated with user objects
        });

        const allUsersResponse = await apiGet('http://localhost:8000/api/v1/auth/organization/users/');
        setAllUsers(allUsersResponse || []);
        setFilteredUsers(allUsersResponse || []);
      } catch (error) {
        console.error('Failed to fetch site data:', error);
      }
    }

    fetchSiteData();
  }, [siteId]);

  useEffect(() => {
    setFilteredUsers(
      allUsers.filter((user) =>
        `${user.first_name} ${user.last_name} ${user.email}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, allUsers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const dataToPatch = {
        ...formData,
        user: formData.user.map((user) => user.id), // convert user objects to IDs
      };
  
      await apiPatch(`http://localhost:8000/api/v1/auth/site/update/${siteId}/`, dataToPatch);
      alert("Site updated successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Failed to update site:", error);
      alert("Failed to update site");
    }
  };

  const handleAddUser = (user) => {
    if (!formData.user.some((existingUser) => existingUser.id === user.id)) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        user: [...prevFormData.user, user],
      }));
    }
  };

  const handleRemoveUser = (userId) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      user: prevFormData.user.filter((user) => user.id !== userId),
    }));
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-hidden" onClose={setOpen}>
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

          <div className="fixed inset-y-0 right-0 flex max-w-full">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="w-screen max-w-md h-full bg-white flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <Dialog.Title className="text-lg font-medium text-gray-900">Update Site</Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setOpen(false)}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    <form onSubmit={handleFormSubmit}>
                        {/* Form Fields */}
                        <div className="mb-4">
                          <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">Site Name</label>
                          <input
                              type="text"
                              id="siteName"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        {/* Additional fields for other data */}
                        <div className="mb-4">
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                          <input
                              type="text"
                              id="phoneNumber"
                              name="phone_number"
                              value={formData.phone_number}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>

                        {/* Current Users List */}
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-gray-700">Current Users</h3>
                          <ul className="mt-2">
                            {formData.user.length > 0 ? (
                              formData.user.map((user) => (
                                <li key={user.id} className="flex justify-between items-center py-2">
                                  <span>{user.first_name} {user.last_name} ({user.email})</span>
                                  <button
                                      type="button"
                                      className="text-red-600 hover:text-red-900"
                                      onClick={() => handleRemoveUser(user.id)}
                                  >
                                      Remove
                                  </button>
                                </li>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">No users assigned</p>
                            )}
                          </ul>
                        </div>

                        {/* Search and Add Users */}
                        <div className="mb-4">
                          <label htmlFor="searchUsers" className="block text-sm font-medium text-gray-700">Search Users</label>
                          <input
                            type="text"
                            id="searchUsers"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Search for users to add"
                          />
                          <div className="mt-2">
                            {filteredUsers.map((user) => (
                              <div key={user.id} className="flex justify-between items-center py-2">
                                <span>{user.first_name} {user.last_name} ({user.email})</span>
                                <button
                                  type="button"
                                  className="text-indigo-600 hover:text-indigo-900"
                                  onClick={() => handleAddUser(user)}
                                >
                                  Add
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Save Changes Button */}
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          >
                            Save Changes
                          </button>
                        </div>
                    </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
    