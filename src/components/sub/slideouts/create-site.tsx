import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiPost, apiGet } from '@/providers/apiRequest';

export default function SiteCreate({ open, setOpen }) {
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
    user: [], // to hold the selected user IDs
  });

  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchAllUsers() {
      try {
        const response = await apiGet('http://localhost:8000/api/v1/auth/organization/users/');
        setAllUsers(response || []);
        setFilteredUsers(response || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    }

    fetchAllUsers();
  }, []);

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

  const handleAddUser = (user) => {
    if (!formData.user.includes(user.id)) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        user: [...prevFormData.user, user.id],
      }));
    }
  };

  const handleRemoveUser = (userId) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      user: prevFormData.user.filter((id) => id !== userId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiPost('http://localhost:8000/api/v1/auth/site/create/', formData);
      alert('Site created successfully!');
      setOpen(false); // Close the dialog on success
    } catch (error) {
      console.error('Error creating site:', error);
      alert('Failed to create site');
    }
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
                  <Dialog.Title className="text-lg font-medium text-gray-900">Add New Site</Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setOpen(false)}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  <form onSubmit={handleSubmit}>
                    {/* Form Fields */}
                    <div className="mb-4">
                      <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                        Site Name
                      </label>
                      <input
                        type="text"
                        id="siteName"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter site name"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        id="phoneNumber"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="address1" className="block text-sm font-medium text-gray-700">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        id="address1"
                        name="address_1"
                        value={formData.address_1}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter address line 1"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="address2" className="block text-sm font-medium text-gray-700">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        id="address2"
                        name="address_2"
                        value={formData.address_2}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter address line 2"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter state"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter zip code"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="legalEntityName" className="block text-sm font-medium text-gray-700">
                        Legal Entity Name
                      </label>
                      <input
                        type="text"
                        id="legalEntityName"
                        name="legal_entity_name"
                        value={formData.legal_entity_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter legal entity name"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        id="contactEmail"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter contact email"
                      />
                    </div>

                    {/* Current Users */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700">Current Users</h3>
                      <ul className="mt-2">
                        {formData.user.length > 0 ? (
                          formData.user.map((userId) => {
                            const user = allUsers.find((u) => u.id === userId);
                            return (
                              <li key={userId} className="flex justify-between items-center py-2">
                                <span>{user?.first_name} {user?.last_name} ({user?.email})</span>
                                <button
                                  type="button"
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => handleRemoveUser(userId)}
                                >
                                  Remove
                                </button>
                              </li>
                            );
                          })
                        ) : (
                          <p className="text-sm text-gray-500">No users assigned</p>
                        )}
                      </ul>
                    </div>

                    {/* Search Users */}
                    <div className="mb-4">
                      <label htmlFor="searchUsers" className="block text-sm font-medium text-gray-700">
                        Search Users
                      </label>
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

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Create Site
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
