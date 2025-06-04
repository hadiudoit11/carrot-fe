"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPut } from "@/providers/apiRequest";
import { Loader2, Save, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}

interface RolePermission {
  id: string;
  permission: string;
}

interface PermissionGroup {
  [key: string]: Permission[];
}

interface RoleDetailProps {
  role: Role;
  permissionGroups: PermissionGroup;
  onRoleUpdated: () => void;
}

export function RoleDetail({ role, permissionGroups, onRoleUpdated }: RoleDetailProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Fetch role permissions
  useEffect(() => {
    const fetchRolePermissions = async () => {
      setIsLoading(true);
      try {
        const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
        const response = await apiGet(`${backendURL}/api/v1/access/role/permissions/${role.id}/`);
        
        if (response && Array.isArray(response.permissions)) {
          // Extract just the IDs from each permission object
          const permissionIds = response.permissions.map((permission: Permission) => permission.id);
          setRolePermissions(permissionIds);
        }
      } catch (error) {
        console.error('Error fetching role permissions:', error);
        toast({
          title: "Error",
          description: "Failed to load role permissions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRolePermissions();
  }, [role.id, toast]);

  // Toggle permission
  const togglePermission = (permissionId: string) => {
    setRolePermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Toggle all permissions in a group
  const toggleGroupPermissions = (groupName: string, permissions: Permission[]) => {
    const permissionIds = permissions.map(p => p.id);
    const allSelected = permissions.every(p => rolePermissions.includes(p.id));
    
    if (allSelected) {
      // Deselect all permissions in this group
      setRolePermissions(prev => prev.filter(id => !permissionIds.includes(id)));
    } else {
      // Select all permissions in this group
      setRolePermissions(prev => {
        const newPermissions = [...prev];
        permissionIds.forEach(id => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        return newPermissions;
      });
    }
  };

  // Check if all permissions in a group are selected
  const areAllPermissionsSelected = (permissions: Permission[]) => {
    return permissions.every(p => rolePermissions.includes(p.id));
  };

  // Check if some permissions in a group are selected
  const areSomePermissionsSelected = (permissions: Permission[]) => {
    return permissions.some(p => rolePermissions.includes(p.id)) && 
           !permissions.every(p => rolePermissions.includes(p.id));
  };

  // Save role permissions
  const saveRolePermissions = async () => {
    setIsSaving(true);
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      
      // Use the correct endpoint for updating role permissions
      await apiPut(`${backendURL}/api/v1/access/role/permissions/update/${role.id}/`, {
        name: role.name,
        description: role.description,
        permissions: rolePermissions
      });
      
      toast({
        title: "Permissions updated",
        description: "The role permissions have been updated successfully.",
      });
      
      onRoleUpdated();
    } catch (error) {
      console.error('Error saving role permissions:', error);
      toast({
        title: "Error",
        description: "Failed to save permission changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions</CardTitle>
        <CardDescription>Select the permissions for this role</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <Accordion
            type="multiple"
            value={expandedGroups}
            onValueChange={setExpandedGroups}
            className="w-full"
          >
            {Object.entries(permissionGroups).map(([groupName, permissions]) => (
              <AccordionItem key={groupName} value={groupName}>
                <div className="flex items-center justify-between">
                  <AccordionTrigger className="flex-1 hover:no-underline">
                    {groupName}
                  </AccordionTrigger>
                  <div 
                    className="pr-4"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the accordion
                      toggleGroupPermissions(groupName, permissions);
                    }}
                  >
                    <Switch
                      checked={areAllPermissionsSelected(permissions)}
                      onCheckedChange={() => {}}
                      className="data-[state=checked]:bg-primary"
                    />
                    {areSomePermissionsSelected(permissions) && !areAllPermissionsSelected(permissions) && (
                      <div className="h-2 w-2 rounded-full bg-primary ml-2"></div>
                    )}
                  </div>
                </div>
                <AccordionContent>
                  <div className="pl-6 space-y-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between py-2">
                        <div>
                          <div className="font-medium">
                            {permission.name.replace(`${groupName.toLowerCase()}_`, '')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {permission.description}
                          </div>
                        </div>
                        <Switch
                          checked={rolePermissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={saveRolePermissions} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Permissions
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 