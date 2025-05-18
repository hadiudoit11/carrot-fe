"use client";

import { useState } from "react";
import { apiDelete } from "@/providers/apiRequest";
import { Users, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Types
interface Role {
  id: string;
  name: string;
  description: string;
}

interface RolesListProps {
  roles: Role[];
  onRoleSelect: (role: Role) => void;
  onRoleDeleted?: () => void;
}

export function RolesList({ roles, onRoleSelect, onRoleDeleted }: RolesListProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle role deletion
  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    
    setIsDeleting(true);
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      await apiDelete(`${backendURL}/api/v1/access/roles/${roleToDelete.id}/`);
      
      toast({
        title: "Role deleted",
        description: `The role "${roleToDelete.name}" has been deleted successfully.`,
      });
      
      if (onRoleDeleted) {
        onRoleDeleted();
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "Error",
        description: "Failed to delete the role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  // Check if there are any roles
  if (roles.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-8">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No roles found</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Your organization doesn't have any custom roles yet. Create your first role to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => onRoleSelect(role)}>
                  <h3 className="text-lg font-medium">{role.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {role.description || "No description provided"}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onRoleSelect(role)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Role
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => openDeleteDialog(role)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Role
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Role Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.
              Users assigned to this role will lose these permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 