// Declare modules for custom components
declare module '@/components/forms/create-project-form' {
  export interface CreateProjectFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (projectId: string) => void;
  }
  
  const CreateProjectForm: React.FC<CreateProjectFormProps>;
  export default CreateProjectForm;
}

declare module '@/components/projects/create-project-form' {
  import { default as ProjectForm } from '@/components/forms/create-project-form';
  export default ProjectForm;
}

declare module '@/components/forms/status-table' {
  export interface StatusType {
    name: string;
    type: string;
    color: string;
  }
  
  export interface StatusTableProps {
    defaultStatuses: StatusType[];
    onChange: (statuses: StatusType[]) => void;
  }
  
  const StatusTable: React.FC<StatusTableProps>;
  export default StatusTable;
}

declare module '@/components/projects/StatusTable' {
  import { default as StatusTableComponent, StatusType } from '@/components/forms/status-table';
  export { StatusType };
  export default StatusTableComponent;
}

declare module '@/components/sub/forms/user-selector' {
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
  
  const UserSelector: React.FC<UserSelectorProps>;
  export default UserSelector;
}

declare module '@/components/ui/command' {
  import { ComponentProps } from 'react';
  
  type CommandProps = ComponentProps<'div'>;
  type CommandInputProps = ComponentProps<'input'> & {
    value?: string;
    onValueChange?: (value: string) => void;
  };
  
  export const Command: React.FC<CommandProps>;
  export const CommandInput: React.FC<CommandInputProps>;
  export const CommandList: React.FC<ComponentProps<'div'>>;
  export const CommandEmpty: React.FC<ComponentProps<'div'>>;
  export const CommandGroup: React.FC<ComponentProps<'div'>>;
  export const CommandItem: React.FC<ComponentProps<'div'> & {
    onSelect?: () => void;
  }>;
  export const CommandSeparator: React.FC<ComponentProps<'hr'>>;
}

declare module '@/components/ui/dialog' {
  import { ComponentProps } from 'react';
  
  type DialogProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  };
  
  export const Dialog: React.FC<DialogProps>;
  export const DialogTrigger: React.FC<ComponentProps<'button'>>;
  export const DialogContent: React.FC<ComponentProps<'div'>>;
  export const DialogHeader: React.FC<ComponentProps<'div'>>;
  export const DialogFooter: React.FC<ComponentProps<'div'>>;
  export const DialogTitle: React.FC<ComponentProps<'h2'>>;
  export const DialogDescription: React.FC<ComponentProps<'p'>>;
}

declare module '@/components/ui/calendar' {
  type CalendarProps = {
    mode?: 'single' | 'range' | 'multiple';
    selected?: Date | Date[] | { from: Date; to: Date };
    onSelect?: (date: Date | Date[] | { from: Date; to: Date } | undefined) => void;
    initialFocus?: boolean;
  };
  
  export const Calendar: React.FC<CalendarProps>;
}

declare module '@/components/ui/popover' {
  import { ComponentProps } from 'react';
  
  type PopoverProps = ComponentProps<'div'>;
  type PopoverTriggerProps = ComponentProps<'button'> & {
    asChild?: boolean;
  };
  
  export const Popover: React.FC<PopoverProps>;
  export const PopoverTrigger: React.FC<PopoverTriggerProps>;
  export const PopoverContent: React.FC<ComponentProps<'div'> & {
    align?: 'start' | 'center' | 'end';
  }>;
}

declare module '@/components/ui/toast-provider' {
  interface ToastProps {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
    duration?: number;
  }
  
  export function useToast(): {
    toast: (props: ToastProps) => void;
  };
}

// Existing type declarations
export interface Location {
  id: string;
  name: string;
  people: Person[];
}

export interface Person {
  name: string;
  email: string;
  title: string;
  role: string;
}

export interface SiteListProps {
  isCreateOpen?: boolean;
  setIsCreateOpen?: (open: boolean) => void;
  isUpdateOpen?: boolean;
  setIsUpdateOpen?: (open: boolean) => void;
  selectedSiteId?: string | null;
  setSelectedSiteId?: (id: string) => void;
} 