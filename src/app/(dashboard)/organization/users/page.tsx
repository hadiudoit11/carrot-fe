"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/providers/apiRequest";
import { Loader2, PlusCircle, Search, UserPlus, UserX } from "lucide-react";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  roles: Role[];
}

interface Role {
  id: string;
  name: string;
  description: string;
}

export default function OrganizationUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users and roles data
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session?.error === 'RefreshAccessTokenError') {
      router.push('/user/login');
      return;
    }
    
    fetchData();
  }, [session, status, router]);

  // Fetch users and roles
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      
      // Fetch users
      const usersResponse = await apiGet(`${backendURL}/api/v1/auth/organization/users/`);
      if (Array.isArray(usersResponse)) {
        setUsers(usersResponse);
      }
      
      // Fetch roles
      const rolesResponse = await apiGet(`${backendURL}/api/v1/access/roles/`);
      if (Array.isArray(rolesResponse)) {
        setRoles(rolesResponse);
      }
    } catch (error) {
      console.error('Error fetching users and roles:', error);
      toast({
        title: "Error",
        description: "Failed to load users and roles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           user.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handle user invitation
  const handleInviteUser = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      await apiPost(`${backendURL}/api/v1/auth/invite/`, {
        email: inviteEmail,
      });
      
      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${inviteEmail}.`,
      });
      
      setInviteEmail("");
      setIsInviteDialogOpen(false);
      fetchData(); // Refresh user list
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle role assignment
  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast({
        title: "Missing Information",
        description: "Please select both a user and a role.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      await apiPost(`${backendURL}/api/v1/access/assign-role/`, {
        user_id: selectedUser.id,
        role_id: selectedRole,
      });
      
      toast({
        title: "Role Assigned",
        description: `The role has been assigned successfully.`,
      });
      
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole("");
      fetchData(); // Refresh user list
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle role removal
  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      await apiPost(`${backendURL}/api/v1/access/remove-role/`, {
        user_id: userId,
        role_id: roleId,
      });
      
      toast({
        title: "Role Removed",
        description: `The role has been removed successfully.`,
      });
      
      fetchData(); // Refresh user list
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: "Failed to remove role. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Open role assignment dialog
  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setIsRoleDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Organization Users</h1>
        <p className="text-muted-foreground">Manage users and their roles in your organization</p>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage your organization's users and their roles</CardDescription>
          </div>
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <div className="grid grid-cols-12 p-4 bg-muted/50 text-sm font-medium">
              <div className="col-span-5">User</div>
              <div className="col-span-4">Roles</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            
            {filteredUsers.length > 0 ? (
              <div className="divide-y">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="grid grid-cols-12 p-4 items-center">
                    <div className="col-span-5 flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.first_name} {user.last_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <div className="col-span-4">
                      <div className="flex flex-wrap gap-2">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge 
                              key={role.id} 
                              variant="outline" 
                              className="flex items-center gap-1 py-1"
                            >
                              {role.name}
                              <button 
                                className="ml-1 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveRole(user.id, role.id)}
                              >
                                <UserX className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No roles assigned</span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="col-span-1 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <span className="sr-only">Open menu</span>
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                            >
                              <path
                                d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                            Assign Role
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? "No users match your search" : "No users found"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation to a new user to join your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleInviteUser} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              {selectedUser && `Assign a role to ${selectedUser.first_name} ${selectedUser.last_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Roles</SelectLabel>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignRole} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 