import React, { useState, useEffect, useRef } from 'react';
import { apiGet } from '@/providers/apiRequest';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface UserSelectorProps {
  selectedUserIds: string[];
  onUserAdd: (user: User) => void;
  onUserRemove: (userId: string) => void;
  placeholder?: string;
  className?: string;
}

export default function UserSelector({
  selectedUserIds,
  onUserAdd,
  onUserRemove,
  placeholder = "Search users...",
  className = ""
}: UserSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Fetch selected users on component mount
  useEffect(() => {
    const fetchSelectedUsers = async () => {
      if (selectedUserIds.length === 0) {
        setSelectedUsers([]);
        return;
      }

      try {
        // Fetch all organization users
        const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
        const allUsers = await apiGet(`${backendURL}/api/v1/auth/organization/users/`);
        
        // Filter to get only the selected users
        if (Array.isArray(allUsers)) {
          const selected = allUsers.filter(user => selectedUserIds.includes(user.id));
          setSelectedUsers(selected || []);
        }
      } catch (err) {
        console.error('Error fetching selected users:', err);
      }
    };

    fetchSelectedUsers();
  }, [selectedUserIds]);

  // Debounce search to prevent too many API calls
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setFilteredUsers([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    if (query.length < 2) return;

    setIsLoading(true);
    try {
      // Fetch all organization users and filter client-side
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      const allUsers = await apiGet(`${backendURL}/api/v1/auth/organization/users/`);
      
      if (Array.isArray(allUsers)) {
        // Client-side filtering based on search query
        const lowercaseQuery = query.toLowerCase();
        const filtered = allUsers.filter(user => 
          user.first_name?.toLowerCase().includes(lowercaseQuery) || 
          user.last_name?.toLowerCase().includes(lowercaseQuery) || 
          user.email?.toLowerCase().includes(lowercaseQuery)
        );
        
        setUsers(filtered || []);
        
        // Filter out already selected users
        const notSelected = filtered.filter(user => !selectedUserIds.includes(user.id));
        setFilteredUsers(notSelected);
      } else {
        setFilteredUsers([]);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  // Restore focus after adding a user
  const handleUserAdd = (user: User) => {
    onUserAdd(user);
    // Keep focus on the search input after adding a user
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className={`user-selector ${className}`}>
      <div className="mt-6">
        <label htmlFor="user-search" className="block text-sm font-medium leading-6 text-gray-900">
          Search Users
        </label>
        <div className="mt-2 relative">
          <input
            type="text"
            id="user-search"
            ref={searchInputRef}
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder={placeholder}
            disabled={isLoading}
          />
          {isLoading && (
            <div className="absolute right-3 top-2">
              <div className="h-5 w-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 max-h-40 overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          {isLoading ? (
            <li className="py-2 text-sm text-gray-500">Loading users...</li>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <li key={user.id} className="flex justify-between gap-x-6 py-2">
                <div className="flex gap-x-4">
                  <div className="min-w-0 flex-auto">
                    <p className="text-sm font-semibold leading-6 text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="mt-1 truncate text-xs leading-5 text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleUserAdd(user)}
                    className="rounded bg-green-50 px-2 py-1 text-xs font-semibold text-green-600 shadow-sm hover:bg-green-100"
                  >
                    Add
                  </button>
                </div>
              </li>
            ))
          ) : (
            searchQuery.length > 0 ? (
              <li className="py-2 text-sm text-gray-500">No users found</li>
            ) : (
              <li className="py-2 text-sm text-gray-500">Type to search for users</li>
            )
          )}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium leading-6 text-gray-900">Selected Users</h3>
        <ul className="mt-2 divide-y divide-gray-100">
          {selectedUsers.length > 0 ? (
            selectedUsers.map((user) => (
              <li key={user.id} className="flex justify-between gap-x-6 py-2">
                <div className="flex gap-x-4">
                  <div className="min-w-0 flex-auto">
                    <p className="text-sm font-semibold leading-6 text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="mt-1 truncate text-xs leading-5 text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => onUserRemove(user.id)}
                    className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="py-2 text-sm text-gray-500">No users selected</li>
          )}
        </ul>
      </div>
    </div>
  );
}