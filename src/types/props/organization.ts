import type { User, Role } from '@/types';

export interface OrganizationProps {
  organization: {
    id: string;
    name: string;
    users?: User[];
    roles?: Role[];
  };
}

export interface UserListProps {
  users: User[];
  roles?: Role[];
  onUserEdit?: (userId: string) => void;
}

export interface RoleListProps {
  roles: Role[];
  onRoleEdit?: (roleId: string) => void;
  onRoleDelete?: (roleId: string) => void;
}
