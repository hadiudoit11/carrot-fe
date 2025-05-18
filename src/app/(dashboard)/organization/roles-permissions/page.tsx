"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost, apiDelete } from "@/providers/apiRequest";
import { Loader2, Plus, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// UI Components
import { RolesList } from "@/components/organization/roles-list";
import { RoleDetail } from "@/components/organization/role-detail";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Types
interface Role {
  id: string;
  name: string;
  description: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  group: string;
  action?: string;
}

interface PermissionGroup {
  [key: string]: Permission[];
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function RolesPermissionsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup>({});
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleUsers, setRoleUsers] = useState<User[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [searchTerm, setSearchTerm] = useState("");

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';

  // Fetch roles and permissions on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch roles
        const rolesResponse = await apiGet(`${backendURL}/api/v1/access/roles/`);
        if (Array.isArray(rolesResponse)) {
          setRoles(rolesResponse);
        }
        
        // Fetch permission groups - using the structured endpoint from docs
        try {
          const permGroupResponse = await apiGet(`${backendURL}/api/v1/access/permissions/groups/`);
          if (permGroupResponse && typeof permGroupResponse === 'object') {
            setPermissionGroups(permGroupResponse);
          } else {
            throw new Error("Invalid response format");
          }
        } catch (error) {
          console.log("Falling back to manual permission grouping");
          // Fallback: if groups endpoint isn't available yet, fetch all permissions and group them
          const permissionsResponse = await apiGet(`${backendURL}/api/v1/access/permissions/`);
          if (Array.isArray(permissionsResponse)) {
            const groupedPermissions: PermissionGroup = {};
            
            permissionsResponse.forEach((permission: Permission) => {
              const group = permission.group || "General";
              if (!groupedPermissions[group]) {
                groupedPermissions[group] = [];
              }
              groupedPermissions[group].push(permission);
            });
            
            setPermissionGroups(groupedPermissions);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load roles and permissions. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast, backendURL]);

  // Fetch role users when a role is selected
  useEffect(() => {
    if (selectedRole && activeTab === "users") {
      fetchRoleUsers();
    }
  }, [selectedRole, activeTab]);

  // Fetch users assigned to the selected role
  const fetchRoleUsers = async () => {
    if (!selectedRole) return;
    
    try {
      const response = await apiGet(`${backendURL}/api/v1/access/roles/${selectedRole.id}/users/`);
      if (Array.isArray(response)) {
        setRoleUsers(response);
      }
    } catch (error) {
      console.error('Error fetching role users:', error);
      toast({
        title: "Error",
        description: "Failed to load users for this role.",
        variant: "destructive",
      });
    }
  };

  // Create a new role
  const createRole = async () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiPost(`${backendURL}/api/v1/access/roles/`, {
        name: newRoleName,
        description: newRoleDescription
      });

      if (response) {
        setRoles(prev => [...prev, response]);
        setNewRoleName("");
        setNewRoleDescription("");
        setIsCreateDialogOpen(false);
        
        toast({
          title: "Success",
          description: "Role created successfully.",
        });
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle role selection
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setActiveTab("details");
  };

  // Handle role updates
  const handleRoleUpdated = async () => {
    try {
      const rolesResponse = await apiGet(`${backendURL}/api/v1/access/roles/`);
      if (Array.isArray(rolesResponse)) {
        setRoles(rolesResponse);
        
        // If the selected role was updated, refresh its details too
        if (selectedRole) {
          const updatedRole = rolesResponse.find(r => r.id === selectedRole.id);
          if (updatedRole) {
            setSelectedRole(updatedRole);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing roles:', error);
    }
  };

  // Filter roles by search term
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Roles & Permissions</h2>
          <p className="text-muted-foreground">
            Manage roles and assign permissions to control access levels.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Add a new role to assign to your organization members.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g., Editor, Moderator, etc."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Describe what this role is for..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createRole} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Role"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search roles..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <RolesList
            roles={filteredRoles}
            onRoleSelect={handleRoleSelect}
            onRoleDeleted={handleRoleUpdated}
          />
        </div>
        <div className="md:col-span-2">
          {selectedRole ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Role Details</CardTitle>
                    <CardDescription>Basic information about this role</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Name</Label>
                      <div className="text-lg font-medium">{selectedRole.name}</div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <div className="text-gray-700 dark:text-gray-300">
                        {selectedRole.description || "No description provided"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="permissions">
                {Object.keys(permissionGroups).length > 0 ? (
                  <RoleDetail
                    role={selectedRole}
                    permissionGroups={permissionGroups}
                    onRoleUpdated={handleRoleUpdated}
                  />
                ) : (
                  <div className="p-4 text-center">
                    Loading permissions data...
                  </div>
                )}
              </TabsContent>
              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>Users with this Role</CardTitle>
                    <CardDescription>
                      Users who have been assigned the {selectedRole.name} role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {roleUsers.length > 0 ? (
                      <div className="divide-y">
                        {roleUsers.map(user => (
                          <div key={user.id} className="py-3 flex justify-between items-center">
                            <div>
                              <div className="font-medium">{user.first_name} {user.last_name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={async () => {
                                try {
                                  await apiPost(`${backendURL}/api/v1/access/remove-role/`, {
                                    user_id: user.id,
                                    role_id: selectedRole.id
                                  });
                                  fetchRoleUsers();
                                  toast({
                                    title: "Success",
                                    description: "Role removed from user successfully."
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to remove role from user.",
                                    variant: "destructive"
                                  });
                                }
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No users have been assigned this role yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg p-8">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No Role Selected</h3>
                <p className="text-muted-foreground">
                  Select a role from the list to view and edit its details.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 