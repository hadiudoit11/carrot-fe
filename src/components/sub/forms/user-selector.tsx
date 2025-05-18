"use client";

import React, { useState, useEffect } from 'react';
import { apiGet } from '@/providers/apiRequest';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { XCircle, User, Loader2 } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar_url?: string;
}

interface UserSelectorProps {
  selectedUserIds: string[];
  onUserAdd: (user: UserData) => void;
  onUserRemove: (userId: string) => void;
  placeholder?: string;
}

export default function UserSelector({
  selectedUserIds,
  onUserAdd,
  onUserRemove,
  placeholder = "Search users..."
}: UserSelectorProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch selected users when selectedUserIds changes
  useEffect(() => {
    fetchSelectedUsers();
  }, [selectedUserIds]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await apiGet(`${backendURL}/api/v1/auth/organization/users/`);
      
      if (response && Array.isArray(response)) {
        setUsers(response);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedUsers = async () => {
    if (selectedUserIds.length === 0) {
      setSelectedUsers([]);
      return;
    }
    
    // If we already have the users data, use it
    const cachedUsers = users.filter(user => selectedUserIds.includes(user.id));
    if (cachedUsers.length === selectedUserIds.length) {
      setSelectedUsers(cachedUsers);
      return;
    }
    
    // Otherwise fetch the missing users
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const missingUserIds = selectedUserIds.filter(
        id => !users.some(user => user.id === id)
      );
      
      if (missingUserIds.length === 0) {
        setSelectedUsers(cachedUsers);
        return;
      }
      
      // Fetch each missing user
      const fetchedUsers = await Promise.all(
        missingUserIds.map(async (id) => {
          try {
            return await apiGet(`${backendURL}/api/v1/user/users/${id}/`);
          } catch (err) {
            console.error(`Error fetching user ${id}:`, err);
            return null;
          }
        })
      );
      
      const validFetchedUsers = fetchedUsers.filter(
        (user): user is UserData => user !== null
      );
      
      setSelectedUsers([...cachedUsers, ...validFetchedUsers]);
    } catch (err) {
      console.error("Error fetching selected users:", err);
    }
  };

  const getFilteredUsers = () => {
    if (!searchQuery) return users;
    
    return users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSelect = (user: UserData) => {
    onUserAdd(user);
    setSearchQuery('');
  };

  return (
    <div className="space-y-2">
      <Command className="rounded-lg border shadow-sm">
        <CommandInput 
          placeholder={placeholder} 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        
        {loading && (
          <div className="py-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        )}
        
        {error && (
          <div className="py-6 text-center text-sm text-destructive">
            {error}
          </div>
        )}
        
        {!loading && !error && (
          <CommandEmpty className="py-6 text-center text-sm">
            No users found.
          </CommandEmpty>
        )}
        
        <CommandGroup>
          {getFilteredUsers()
            .filter(user => !selectedUserIds.includes(user.id))
            .map(user => (
              <CommandItem
                key={user.id}
                onSelect={() => handleSelect(user)}
                className="flex items-center gap-2 py-2"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </CommandItem>
            ))}
        </CommandGroup>
      </Command>
      
      {/* Selected users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedUsers.map(user => (
            <Badge
              key={user.id}
              variant="secondary"
              className="pl-2 flex items-center gap-1"
            >
              <span>{user.name}</span>
              <button
                type="button"
                onClick={() => onUserRemove(user.id)}
                className="ml-1 rounded-full hover:bg-destructive/10 p-0.5"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}