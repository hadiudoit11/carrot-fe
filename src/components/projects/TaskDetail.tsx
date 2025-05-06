import React, { useState, useEffect } from 'react';
import { apiGet, apiPut, apiDelete } from '@/providers/apiRequest';
import { format, formatDistance } from 'date-fns';

// UI Components
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CalendarIcon, UserIcon, ClockIcon, Trash2Icon } from 'lucide-react';
import UserSelector from '@/components/sub/forms/user-selector';

// Define type for task details from the API
interface TaskDetail {
  id: string;
  name: string;
  description: string | { details: string };
  status: string;
  status_name?: string;
  is_active: boolean;
  started_at: string | null;
  created_at: string;
  updated_at: string;
  due_at: string | null;
  assigned_to: string | null;
  assigned_to_name?: string;
  owner_name?: string;
  project: string;
}

// Define type for status options
interface Status {
  id: string;
  name: string;
  type: string;
  color: string;
}

// Add User interface for the UserSelector
interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

// Add a properly typed project object
interface ProjectObject {
  id: string | number;
  [key: string]: any; // Allow for other properties
}

// Helper function to safely extract text from potentially complex content objects
const getContentText = (content: any): string => {
  if (content === null || content === undefined) {
    return '';
  }
  
  if (typeof content === 'string') {
    return content;
  }
  
  if (typeof content === 'object') {
    // Check if it has a details property
    if (content.details && typeof content.details === 'string') {
      return content.details;
    }
    
    // Try to convert to JSON string if it's another kind of object
    try {
      return JSON.stringify(content);
    } catch (e) {
      return '';
    }
  }
  
  return String(content);
};

interface TaskDetailProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: (taskDetail: TaskDetail) => void;
}

const TaskDetail = ({ 
  taskId, 
  open, 
  onOpenChange, 
  onTaskUpdated,
  onTaskDeleted 
}: TaskDetailProps) => {
  // State management
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Add state to track the assigned user(s) for the UserSelector
  const [assignedUserId, setAssignedUserId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: '',
    due_at: ''
  });
  
  // Add state for delete confirmation
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch task details when the sheet is opened and taskId changes
  useEffect(() => {
    if (open && taskId) {
      fetchTaskDetails();
    }
  }, [open, taskId]);
  
  // Track assigned user changes
  useEffect(() => {
    if (taskDetail) {
      setAssignedUserId(taskDetail.assigned_to);
    }
  }, [taskDetail]);
  
  const fetchTaskDetails = async () => {
    if (!taskId) {
      console.error('No task ID provided');
      setError('Cannot load task details: Missing task ID');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      console.log(`Fetching task details for ID: ${taskId}`);
      
      // Fetch task details
      const data = await apiGet(`${backendURL}/api/v1/project/task/${taskId}/`);
      console.log('Task details response:', data);
      setTaskDetail(data);
      
      // Set the assigned user ID
      setAssignedUserId(data.assigned_to);
      
      // Also fetch available statuses
      const statusesData = await apiGet(`${backendURL}/api/v1/project/status/`);
      if (Array.isArray(statusesData)) {
        setStatuses(statusesData);
      }
      
      // Update form data with current values
      setFormData({
        name: data.name || '',
        description: typeof data.description === 'string' 
          ? data.description 
          : data.description?.details || '',
        status: data.status || '',
        due_at: data.due_at ? format(new Date(data.due_at), 'yyyy-MM-dd') : ''
      });
      
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError('Failed to load task details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle status change from dropdown
  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value
    }));
  };
  
  // Add a debug function to log API requests and responses
  const logApiDebugInfo = (action: string, data: any) => {
    console.log(`-------- ${action} --------`);
    console.log('Request data:', JSON.stringify(data, null, 2));
    console.log(`Project ID: ${data.project}`);
    if (data.due_at) {
      console.log(`Due date: ${data.due_at}`);
    }
    console.log('--------------------------');
  };

  // Modify the getAccessToken function to get the token from nextauth session storage
  const getAccessToken = () => {
    // Try to get the token from sessionStorage first (where NextAuth stores it)
    const session = JSON.parse(sessionStorage.getItem('nextauth.session') || '{}');
    if (session?.accessToken) {
      return session.accessToken;
    }
    
    // Fallbacks for other storage mechanisms
    return sessionStorage.getItem('accessToken') || 
           localStorage.getItem('accessToken') ||
           localStorage.getItem('token') ||
           sessionStorage.getItem('token');
  };

  // Extract project ID reliably
  const getProjectId = (task: TaskDetail | null): string => {
    if (!task) return '';
    
    // Log the actual value for debugging
    console.log('TASK DETAIL PROJECT VALUE:', task.project);
    console.log('TASK DETAIL PROJECT TYPE:', typeof task.project);
    
    // Handle different formats of project field
    if (typeof task.project === 'string' && task.project.trim() !== '') {
      return task.project.trim();
    } else if (typeof task.project === 'number') {
      return String(task.project);
    } else if (typeof task.project === 'object' && task.project !== null) {
      try {
        const projectObj = task.project as ProjectObject;
        if (projectObj.id) {
          return String(projectObj.id);
        }
        // Stringify the object for debugging
        console.log('PROJECT OBJECT CONTENT:', JSON.stringify(projectObj));
      } catch (e) {
        console.error('Error parsing project object:', e);
      }
    }
    
    // If we can't determine the project ID, throw an error
    console.error('Failed to extract project ID from:', task);
    throw new Error('Project ID is required but could not be determined');
  };

  // Replace the handleUserAdd function with this improved version
  const handleUserAdd = async (user: User) => {
    if (!taskDetail || !taskId) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      
      // Use our new helper function to get the project ID
      const projectId = getProjectId(taskDetail);
      console.log('Using project ID for user assignment:', projectId);
      
      // Format date properly
      let formattedDate: string | undefined = undefined;
      if (formData.due_at && formData.due_at.trim() !== '') {
        try {
          // Format date in ISO format with Z for UTC
          const date = new Date(formData.due_at);
          formattedDate = date.toISOString();
        } catch (e) {
          console.error('Error formatting date:', e);
        }
      }
      
      // Create a data object with ALL required fields
      const updateData = {
        name: formData.name || taskDetail.name,
        description: formData.description || getContentText(taskDetail.description),
        status: formData.status || taskDetail.status,
        assigned_to: user.id,
        project: projectId,
        due_at: formattedDate
      };
      
      if (!updateData.due_at) {
        delete updateData.due_at; // Remove the field if not provided
      }
      
      // Log the complete request for debugging
      console.log('UPDATE REQUEST BODY:', JSON.stringify(updateData, null, 2));
      
      // Immediately update UI for better UX
      setAssignedUserId(user.id);
      
      // Get the access token
      const accessToken = getAccessToken();
      console.log('Using access token (first few chars):', accessToken?.substring(0, 10));
      
      // Make the API call using fetch directly
      const response = await fetch(`${backendURL}/api/v1/project/task/${taskId}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      });
      
      // Handle non-OK responses
      if (!response.ok) {
        // Get the error response data
        const errorText = await response.text();
        console.error(`Error response (${response.status}):`, errorText);
        
        let errorMessage = 'Failed to assign user.';
        try {
          const errorData = JSON.parse(errorText);
          
          // Check for specific error messages
          if (errorData.project) {
            errorMessage += ` Project error: ${errorData.project}`;
          }
          if (errorData.detail) {
            errorMessage += ` ${errorData.detail}`;
          }
          
          console.error('Parsed error data:', errorData);
        } catch (e) {
          errorMessage += ` Server responded with: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Success! Parse response and refresh data
      const responseData = await response.json();
      console.log('API success response:', responseData);
      
      // Refresh task details to reflect the change
      await fetchTaskDetails();
      
      toast({
        title: "User assigned",
        description: `Task assigned to ${user.first_name} ${user.last_name}`,
      });
      
      // Call onTaskUpdated if provided
      if (onTaskUpdated) {
        onTaskUpdated();
      }
      
    } catch (err) {
      console.error('Error assigning user:', err);
      
      // Reset UI state on error
      setAssignedUserId(taskDetail.assigned_to);
      
      // Show error toast
      toast({
        title: "Assignment failed",
        description: err.message || "Could not assign user to the task.",
        variant: "destructive",
      });
      
      setError(err.message || "Failed to assign user");
    } finally {
      setIsSaving(false);
    }
  };

  // Replace handleUserRemove with this improved version
  const handleUserRemove = async (userId: string) => {
    if (!taskDetail || !taskId) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      
      // Use our new helper function to get the project ID
      const projectId = getProjectId(taskDetail);
      console.log('Using project ID for user removal:', projectId);
      
      // Format date properly
      let formattedDate: string | undefined = undefined;
      if (formData.due_at && formData.due_at.trim() !== '') {
        try {
          // Format date in ISO format with Z for UTC
          const date = new Date(formData.due_at);
          formattedDate = date.toISOString();
        } catch (e) {
          console.error('Error formatting date:', e);
        }
      }
      
      // Create a data object with ALL required fields
      const updateData = {
        name: formData.name || taskDetail.name,
        description: formData.description || getContentText(taskDetail.description),
        status: formData.status || taskDetail.status,
        assigned_to: null,
        project: projectId,
        due_at: formattedDate
      };
      
      if (!updateData.due_at) {
        delete updateData.due_at; // Remove the field if not provided
      }
      
      // Log the complete request for debugging
      console.log('UPDATE REQUEST BODY:', JSON.stringify(updateData, null, 2));
      
      // Immediately update UI for better UX
      setAssignedUserId(null);
      
      // Get the access token
      const accessToken = getAccessToken();
      console.log('Using access token (first few chars):', accessToken?.substring(0, 10));
      
      // Make the API call using fetch directly
      const response = await fetch(`${backendURL}/api/v1/project/task/${taskId}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      });
      
      // Handle non-OK responses
      if (!response.ok) {
        // Get the error response data
        const errorText = await response.text();
        console.error(`Error response (${response.status}):`, errorText);
        
        let errorMessage = 'Failed to remove assignment.';
        try {
          const errorData = JSON.parse(errorText);
          
          // Check for specific error messages
          if (errorData.project) {
            errorMessage += ` Project error: ${errorData.project}`;
          }
          if (errorData.detail) {
            errorMessage += ` ${errorData.detail}`;
          }
          
          console.error('Parsed error data:', errorData);
        } catch (e) {
          errorMessage += ` Server responded with: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Success! Parse response and refresh data
      const responseData = await response.json();
      console.log('API success response:', responseData);
      
      // Refresh task details to reflect the change
      await fetchTaskDetails();
      
      toast({
        title: "Assignment removed",
        description: "User has been unassigned from this task",
      });
      
      // Call onTaskUpdated if provided
      if (onTaskUpdated) {
        onTaskUpdated();
      }
      
    } catch (err) {
      console.error('Error removing assignment:', err);
      
      // Reset UI state on error
      setAssignedUserId(taskDetail.assigned_to);
      
      // Show error toast
      toast({
        title: "Operation failed",
        description: err.message || "Could not remove user assignment.",
        variant: "destructive",
      });
      
      setError(err.message || "Failed to remove assignment");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Replace handleSaveTask with this improved version
  const handleSaveTask = async () => {
    if (!taskDetail || !taskId) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      
      // Use our new helper function to get the project ID
      const projectId = getProjectId(taskDetail);
      console.log('Using project ID for task update:', projectId);
      
      // Format date properly
      let formattedDate: string | undefined = undefined;
      if (formData.due_at && formData.due_at.trim() !== '') {
        try {
          // Format date in ISO format with Z for UTC
          const date = new Date(formData.due_at);
          formattedDate = date.toISOString();
        } catch (e) {
          console.error('Error formatting date:', e);
        }
      }
      
      // Create a data object with ALL required fields
      const updateData = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        assigned_to: taskDetail.assigned_to,
        project: projectId,
        due_at: formattedDate
      };
      
      if (!updateData.due_at) {
        delete updateData.due_at; // Remove the field if not provided
      }
      
      // Log the complete request for debugging
      console.log('UPDATE REQUEST BODY:', JSON.stringify(updateData, null, 2));
      
      // Get the access token
      const accessToken = getAccessToken();
      console.log('Using access token (first few chars):', accessToken?.substring(0, 10));
      
      // Make the API call using fetch directly
      const response = await fetch(`${backendURL}/api/v1/project/task/${taskId}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      });
      
      // Handle non-OK responses
      if (!response.ok) {
        // Get the error response data
        const errorText = await response.text();
        console.error(`Error response (${response.status}):`, errorText);
        
        let errorMessage = 'Failed to update task.';
        try {
          const errorData = JSON.parse(errorText);
          
          // Check for specific error messages
          if (errorData.project) {
            errorMessage += ` Project error: ${errorData.project}`;
          }
          if (errorData.detail) {
            errorMessage += ` ${errorData.detail}`;
          }
          
          console.error('Parsed error data:', errorData);
        } catch (e) {
          errorMessage += ` Server responded with: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Success! Parse response and refresh data
      const responseData = await response.json();
      console.log('API success response:', responseData);
      
      // Refresh task details to reflect the change
      await fetchTaskDetails();
      
      toast({
        title: "Task updated",
        description: "Your changes have been saved successfully.",
      });
      
      // Call onTaskUpdated if provided
      if (onTaskUpdated) {
        onTaskUpdated();
      }
      
    } catch (err) {
      console.error('Error updating task:', err);
      
      // Show error toast
      toast({
        title: "Update failed",
        description: err.message || "Could not update the task.",
        variant: "destructive",
      });
      
      setError(err.message || "Failed to update task");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Add a debug function to directly examine the network traffic
  const addNetworkDebugger = () => {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const [url, options] = args;
      console.log('------ NETWORK REQUEST ------');
      console.log('URL:', url);
      console.log('Method:', options?.method || 'GET');
      console.log('Headers:', options?.headers);
      if (options?.body) {
        try {
          // Try to parse and log JSON body
          const bodyObj = JSON.parse(options.body as string);
          console.log('Body:', bodyObj);
          console.log('Project ID in body:', bodyObj.project);
        } catch (e) {
          console.log('Body (raw):', options.body);
        }
      }
      
      try {
        const response = await originalFetch.apply(this, args);
        console.log('------ NETWORK RESPONSE ------');
        console.log('Status:', response.status);
        console.log('OK:', response.ok);
        console.log('Status Text:', response.statusText);
        // Clone the response to avoid consuming it
        const clonedResponse = response.clone();
        try {
          const responseData = await clonedResponse.text();
          try {
            // Try to parse as JSON
            const jsonData = JSON.parse(responseData);
            console.log('Response Body (JSON):', jsonData);
          } catch (e) {
            // If not JSON, show as text
            console.log('Response Body (text):', responseData);
          }
        } catch (e) {
          console.log('Could not read response body');
        }
        console.log('------------------------');
        return response;
      } catch (error) {
        console.log('------ NETWORK ERROR ------');
        console.error('Error:', error);
        console.log('------------------------');
        throw error;
      }
    };
  };
  
  // Set up network debugger when component mounts
  useEffect(() => {
    // Only set this up once
    if (process.env.NODE_ENV !== 'production') {
      addNetworkDebugger();
    }
    
    return () => {
      // Clean up by restoring original fetch if needed
      // This is a simplification - a real implementation would restore the original fetch
    };
  }, []);
  
  // Add a function to handle task deletion
  const handleDeleteTask = async () => {
    if (!taskDetail || !taskId) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      console.log(`Deleting task with ID: ${taskId}`);
      
      // Store task data before deletion for status count update
      const deletedTaskDetail = { ...taskDetail };
      
      // Use apiDelete to delete the task
      await apiDelete(`${backendURL}/api/v1/project/task/${taskId}/delete/`);
      
      // Show success toast
      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
      });
      
      // Close the sheet
      onOpenChange(false);
      
      // Call onTaskDeleted if provided to update task status counts
      if (onTaskDeleted) {
        onTaskDeleted(deletedTaskDetail);
      }
      
      // Call onTaskUpdated if provided to refresh the task list
      if (onTaskUpdated) {
        onTaskUpdated();
      }
      
    } catch (err) {
      console.error('Error deleting task:', err);
      
      // Show error toast
      toast({
        title: "Delete failed",
        description: "Could not delete the task. Please try again.",
        variant: "destructive",
      });
      
      setError("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Task Details</SheetTitle>
          <SheetDescription>
            View and edit task information
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="py-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <div className="py-6">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={fetchTaskDetails}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="name">Task Title</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            {/* Status Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due_at">Due Date</Label>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="due_at"
                  name="due_at"
                  type="date"
                  value={formData.due_at}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* User Assignment */}
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <UserSelector
                selectedUserIds={assignedUserId ? [assignedUserId] : []}
                onUserAdd={handleUserAdd}
                onUserRemove={handleUserRemove}
                placeholder="Search for users..."
                className="mt-0"
              />
              {taskDetail?.assigned_to_name && (
                <p className="text-xs text-muted-foreground mt-1">
                  Currently assigned to: {taskDetail.assigned_to_name}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
              />
            </div>

            {/* Task Info Section */}
            {taskDetail && (
              <div className="space-y-3 bg-muted/30 p-3 rounded-md mt-2">
                <h4 className="text-sm font-medium">Additional Information</h4>
                
                {/* Creation Date */}
                {taskDetail.created_at && (
                  <div className="text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" /> Created:
                    </span>
                    <p className="ml-4">
                      {format(new Date(taskDetail.created_at), 'PP')}
                    </p>
                    <p className="ml-4 text-xs text-muted-foreground">
                      {formatDistance(new Date(taskDetail.created_at), new Date(), { addSuffix: true })}
                    </p>
                  </div>
                )}

                {/* Assigned To */}
                {taskDetail.assigned_to_name && (
                  <div className="text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <UserIcon className="h-3 w-3" /> Currently assigned to:
                    </span>
                    <p className="ml-4">{taskDetail.assigned_to_name}</p>
                  </div>
                )}

                {/* Last Updated */}
                {taskDetail.updated_at && (
                  <div className="text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" /> Last updated:
                    </span>
                    <p className="ml-4 text-xs text-muted-foreground">
                      {formatDistance(new Date(taskDetail.updated_at), new Date(), { addSuffix: true })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <SheetFooter className="pt-4 flex flex-col sm:flex-row justify-between">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDeleteTask}
            disabled={isLoading || isSaving || isDeleting}
            className="flex items-center gap-1 mb-2 sm:mb-0"
          >
            <Trash2Icon className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete Task"}
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleSaveTask}
              disabled={isLoading || isSaving || isDeleting}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <SheetClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetail; 