"use client";

import { useState, useEffect, useRef, type RefObject } from "react";
import { cn } from "@/lib/utils";
import { X, Check, UserIcon, Search, Loader2 } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { apiGet } from "@/providers/apiRequest";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
}

interface UserSelectorProps {
    onChange?: (users: User[]) => void;
    defaultUsers?: User[];
    maxUsers?: number;
    label?: string;
    placeholder?: string;
    error?: string;
    siteId?: string;
    siteGroupId?: string;
    disabled?: boolean;
    className?: string;
    singleSelect?: boolean;
}

const userStyles = {
    base: "inline-flex items-center gap-1.5 px-2 py-0.5 text-sm rounded-md transition-colors duration-150",
    selected: "bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/30 dark:hover:border-blue-600/50",
    suggestion: "bg-zinc-50 text-zinc-700 border border-zinc-300 hover:border-zinc-400 dark:bg-zinc-800/50 dark:text-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600",
    highlighted: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/30",
};

export default function UserSelector({
    onChange,
    defaultUsers = [],
    maxUsers = 10,
    label = "Users",
    placeholder = "Search users...",
    error,
    siteId,
    siteGroupId,
    disabled = false,
    className,
    singleSelect = false,
}: UserSelectorProps) {
    const [selectedUsers, setSelectedUsers] = useState<User[]>(defaultUsers);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Fetch users from the API
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
                let endpoint = `${backendURL}/api/v1/auth/organization/users/`;
                
                // Add query parameters if provided
                const params = new URLSearchParams();
                if (siteId) params.append('site_id', siteId);
                if (siteGroupId) params.append('site_group_id', siteGroupId);
                
                if (params.toString()) {
                    endpoint += `?${params.toString()}`;
                }
                
                const response = await apiGet(endpoint);
                
                if (Array.isArray(response)) {
                    setAllUsers(response);
                }
            } catch (err) {
                console.error('Error fetching users:', err);
            } finally {
                setIsLoading(false);
                setIsInitialLoad(false);
            }
        };

        fetchUsers();
    }, [siteId, siteGroupId]);

    // Filter users based on input
    useEffect(() => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (input.length < 1) {
            // When input is empty, show all users not already selected
            setFilteredUsers(
                allUsers.filter(
                    user => !selectedUsers.some(selected => selected.id === user.id)
                ).slice(0, 5)
            );
            return;
        }

        searchTimeout.current = setTimeout(() => {
            const lowercaseInput = input.toLowerCase();
            const filtered = allUsers.filter(
                user => 
                    (user.first_name.toLowerCase().includes(lowercaseInput) ||
                    user.last_name.toLowerCase().includes(lowercaseInput) ||
                    user.email.toLowerCase().includes(lowercaseInput)) &&
                    !selectedUsers.some(selected => selected.id === user.id)
            ).slice(0, 5);
            
            setFilteredUsers(filtered);
        }, 300);

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [input, allUsers, selectedUsers]);

    // Handle adding a user
    const addUser = (user: User) => {
        if (singleSelect) {
            // If single select, replace the current selection
            setSelectedUsers([user]);
        } else {
            // Otherwise add to the current selection
            if (selectedUsers.length < maxUsers) {
                setSelectedUsers(prev => [...prev, user]);
            }
        }
        
        // Notify parent component
        onChange?.(singleSelect ? [user] : [...selectedUsers, user]);
    };

    // Handle removing a user
    const removeUser = (userId: string) => {
        setSelectedUsers(prev => prev.filter(user => user.id !== userId));
        
        // Notify parent component
        const updatedUsers = selectedUsers.filter(user => user.id !== userId);
        onChange?.(updatedUsers);
    };

    // Handle keyboard navigation
    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => 
                prev < filteredUsers.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter" && isOpen && filteredUsers.length > 0) {
            e.preventDefault();
            const selectedUser = filteredUsers[selectedIndex];
            if (selectedUser) {
                addUser(selectedUser);
                setInput("");
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        } else if (e.key === "Backspace" && input === "" && selectedUsers.length > 0 && !singleSelect) {
            // Remove the last user when backspace is pressed on empty input
            const lastUser = selectedUsers[selectedUsers.length - 1];
            removeUser(lastUser.id);
        }
    }

    // Handle click outside to close dropdown
    useClickOutside(containerRef as RefObject<HTMLElement>, () =>
        setIsOpen(false)
    );

    // Generate initials for avatar fallback
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    // Format user display name
    const getUserDisplayName = (user: User) => {
        return `${user.first_name} ${user.last_name}`;
    };

    return (
        <div
            className={cn("w-full space-y-2", className)}
            ref={containerRef}
        >
            {label && (
                <label
                    className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                    htmlFor={label}
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
                    "flex items-center flex-row flex-wrap gap-2 sm:gap-1.5 relative",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                {selectedUsers.map((user) => (
                    <span
                        key={user.id}
                        className={cn(
                            userStyles.base,
                            userStyles.selected,
                            "text-base sm:text-sm py-1 sm:py-0.5"
                        )}
                    >
                        <Avatar className="h-5 w-5 mr-1">
                            <AvatarImage src={user.avatar} alt={getUserDisplayName(user)} />
                            <AvatarFallback className="text-xs">
                                {getInitials(user.first_name, user.last_name)}
                            </AvatarFallback>
                        </Avatar>
                        {getUserDisplayName(user)}
                        {!disabled && (
                            <button
                                type="button"
                                onClick={() => removeUser(user.id)}
                                className={cn(
                                    "text-current/60 hover:text-current transition-colors",
                                    "p-1 sm:p-0"
                                )}
                            >
                                <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                            </button>
                        )}
                    </span>
                ))}

                {(!singleSelect || selectedUsers.length === 0) && !disabled && (
                    <div className="flex-1 flex items-center min-w-[140px] sm:min-w-[120px]">
                        <Search className="w-4 h-4 text-zinc-400 mr-2" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                setIsOpen(true);
                                setSelectedIndex(0);
                            }}
                            onFocus={() => setIsOpen(true)}
                            onKeyDown={handleKeyDown}
                            placeholder={selectedUsers.length === 0 ? placeholder : ""}
                            disabled={disabled || (singleSelect && selectedUsers.length > 0)}
                            className={cn(
                                "flex-1 bg-transparent",
                                "h-8 sm:h-7",
                                "text-base sm:text-sm",
                                "text-zinc-900 dark:text-zinc-100",
                                "placeholder:text-zinc-500 dark:placeholder:text-zinc-400",
                                "focus:outline-none"
                            )}
                        />
                    </div>
                )}

                {isOpen && !disabled && (
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
                                {isLoading ? "Loading users..." : "Select a user"}
                            </span>
                        </div>
                        
                        {isLoading ? (
                            <div className="p-4 flex justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                            </div>
                        ) : filteredUsers.length > 0 ? (
                            <div className="p-1">
                                {filteredUsers.map((user, index) => (
                                    <div 
                                        key={user.id}
                                        onClick={() => {
                                            addUser(user);
                                            setInput("");
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 p-2 rounded-md cursor-pointer",
                                            selectedIndex === index 
                                                ? userStyles.highlighted
                                                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        )}
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar} alt={getUserDisplayName(user)} />
                                            <AvatarFallback>
                                                {getInitials(user.first_name, user.last_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {getUserDisplayName(user)}
                                            </p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        {selectedIndex === index && (
                                            <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : isInitialLoad ? (
                            <div className="p-4 text-center text-sm text-zinc-500">
                                Loading users...
                            </div>
                        ) : input.length > 0 ? (
                            <div className="p-4 text-center text-sm text-zinc-500">
                                No users found matching "{input}"
                            </div>
                        ) : (
                            <div className="p-4 text-center text-sm text-zinc-500">
                                No users available
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}
