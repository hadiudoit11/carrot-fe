"use client";

import { useState, useEffect, useRef, type RefObject } from 'react';
import { apiGet } from '@/providers/apiRequest';
import { X, Check, User as UserIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

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
  label?: string;
  error?: string;
}

// Helper for click outside detection
const useClickOutside = (ref: RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
};

const tagStyles = {
  base: "inline-flex items-center gap-1.5 px-2 py-0.5 text-sm rounded-md transition-colors duration-150",
  colors: "bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/30 dark:hover:border-blue-600/50",
};

export default function UserSelector({
  selectedUserIds,
  onUserAdd,
  onUserRemove,
  placeholder = "Search users...",
  className = "",
  label = "Assign Users",
  error
}: UserSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close dropdown
  useClickOutside(containerRef as RefObject<HTMLElement>, () => setIsOpen(false));

  // Fetch selected users on component mount or when selectedUserIds changes
  useEffect(() => {
    const fetchSelectedUsers = async () => {
      // If there are no selected users, just clear the state
      if (!selectedUserIds || selectedUserIds.length === 0) {
        setSelectedUsers([]);
        return;
      }

      // Set loading state for initial fetch
      setIsInitialLoading(true);

      try {
        // Fetch all organization users
        const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
        const allUsers = await apiGet(`${backendURL}/api/v1/auth/organization/users/`);
        
        // Store all users for later use
        if (Array.isArray(allUsers)) {
          setUsers(allUsers);
          
          // Filter to get only the selected users
          const selected = allUsers.filter(user => 
            selectedUserIds.includes(user.id)
          );
          
          console.log('Selected users:', selected);
          setSelectedUsers(selected);
        } else {
          console.error('Invalid user data format from API');
          setSelectedUsers([]);
        }
      } catch (err) {
        console.error('Error fetching selected users:', err);
        setSelectedUsers([]);
      } finally {
        setIsInitialLoading(false);
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
      // If we already have users loaded, just filter them client-side
      if (users.length > 0) {
        const lowercaseQuery = query.toLowerCase();
        const filtered = users.filter(user => 
          user.first_name?.toLowerCase().includes(lowercaseQuery) || 
          user.last_name?.toLowerCase().includes(lowercaseQuery) || 
          user.email?.toLowerCase().includes(lowercaseQuery)
        );
        
        // Filter out already selected users
        const notSelected = filtered.filter(user => !selectedUserIds.includes(user.id));
        setFilteredUsers(notSelected);
      } else {
        // Fetch all organization users and filter client-side if we don't have them yet
        const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
        const allUsers = await apiGet(`${backendURL}/api/v1/auth/organization/users/`);
        
        if (Array.isArray(allUsers)) {
          // Store all users for later use
          setUsers(allUsers);
          
          // Client-side filtering based on search query
          const lowercaseQuery = query.toLowerCase();
          const filtered = allUsers.filter(user => 
            user.first_name?.toLowerCase().includes(lowercaseQuery) || 
            user.last_name?.toLowerCase().includes(lowercaseQuery) || 
            user.email?.toLowerCase().includes(lowercaseQuery)
          );
          
          // Filter out already selected users
          const notSelected = filtered.filter(user => !selectedUserIds.includes(user.id));
          setFilteredUsers(notSelected);
        } else {
          setFilteredUsers([]);
        }
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
    setIsOpen(true);
    setSelectedIndex(0);
  };

  // Removes the last selected user when backspace is pressed in an empty input
  const removeLastUser = () => {
    if (selectedUsers.length > 0) {
      const lastUser = selectedUsers[selectedUsers.length - 1];
      onUserRemove(lastUser.id);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && searchQuery === "" && selectedUsers.length > 0) {
      removeLastUser();
    } else if (e.key === "Enter" && isOpen && filteredUsers.length > 0) {
      e.preventDefault();
      const selectedUser = filteredUsers[selectedIndex];
      if (selectedUser) {
        onUserAdd(selectedUser);
        setSearchQuery("");
        // Keep the dropdown open for more selections
        setSelectedIndex(0);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown" && isOpen) {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredUsers.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp" && isOpen) {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
    }
  };

  // Format user name for display
  const formatUserName = (user: User) => {
    return `${user.first_name} ${user.last_name}`;
  };

  return (
    <div className={cn("w-full space-y-2", className)} ref={containerRef}>
      {label && (
        <label
          className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          htmlFor="user-selector"
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          "min-h-[3rem] sm:min-h-[2.5rem] p-2 sm:p-1.5",
          "rounded-lg border",
          "border-zinc-300 dark:border-zinc-700",
          "bg-white dark:bg-zinc-900",
          "focus-within:ring-2 focus-within:ring-indigo-500/30 dark:focus-within:ring-indigo-400/30",
          "flex items-center flex-row flex-wrap gap-2 sm:gap-1.5 relative"
        )}
      >
        {/* Initial loading indicator */}
        {isInitialLoading && (
          <div className="flex items-center justify-center w-full py-1">
            <div className="h-4 w-4 border-t-2 border-blue-500 rounded-full animate-spin"></div>
            <span className="ml-2 text-sm text-zinc-500">Loading assigned users...</span>
          </div>
        )}

        {/* Selected User Tags */}
        {!isInitialLoading && selectedUsers.map((user) => (
          <span
            key={user.id}
            className={cn(
              tagStyles.base,
              "text-base sm:text-sm py-1 sm:py-0.5",
              tagStyles.colors
            )}
          >
            {formatUserName(user)}
            <button
              type="button"
              onClick={() => onUserRemove(user.id)}
              className={cn(
                "text-current/60 hover:text-current transition-colors",
                "p-1 sm:p-0"
              )}
            >
              <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>
          </span>
        ))}

        {/* Empty state for when no users are assigned */}
        {!isInitialLoading && selectedUsers.length === 0 && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400 px-2">
            No users assigned
          </span>
        )}

        {/* Input Field */}
        <input
          ref={inputRef}
          id="user-selector"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedUsers.length === 0 ? placeholder : "Add more users..."}
          className={cn(
            "flex-1 min-w-[140px] sm:min-w-[120px] bg-transparent",
            "h-8 sm:h-7",
            "text-base sm:text-sm",
            "text-zinc-900 dark:text-zinc-100",
            "placeholder:text-zinc-500 dark:placeholder:text-zinc-400",
            "focus:outline-hidden"
          )}
          disabled={isLoading || isInitialLoading}
        />

        {/* Search Loading Indicator */}
        {isLoading && (
          <div className="flex-shrink-0">
            <div className="h-4 w-4 border-t-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Dropdown for User Suggestions */}
        {isOpen && searchQuery.length >= 2 && (
          <div
            className={cn(
              "absolute left-0 right-0 top-full mt-1 z-50",
              "max-h-[60vh] sm:max-h-[300px] overflow-y-auto",
              "bg-white dark:bg-zinc-900",
              "border border-zinc-300 dark:border-zinc-700",
              "rounded-lg shadow-lg dark:shadow-zinc-950/50",
              "overflow-hidden"
            )}
          >
            <div className="px-2 py-1.5 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                {filteredUsers.length > 0 
                  ? "Select a user to assign" 
                  : "No matching users found"}
              </span>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {filteredUsers.map((user, index) => (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => {
                    onUserAdd(user);
                    setSearchQuery("");
                    // Focus back on input after selection
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 flex items-center justify-between",
                    selectedIndex === index
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {formatUserName(user)}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {user.email}
                    </span>
                  </div>
                  {selectedIndex === index && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}
              
              {filteredUsers.length === 0 && searchQuery.length >= 2 && !isLoading && (
                <div className="px-3 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  <UserIcon className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  No users found matching "{searchQuery}"
                </div>
              )}
              
              {isLoading && (
                <div className="px-3 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  <div className="h-6 w-6 border-t-2 border-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                  Searching for users...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}