import { Draggable } from "@hello-pangea/dnd";
import { Post } from "./statuses";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { apiGet, apiPut } from "@/providers/apiRequest";
import { formatDistance } from "date-fns";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon, ClockIcon, SaveIcon, PlusCircleIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import UserSelector from "@/components/sub/forms/user-selector";
import TaskDetail from '@/components/projects/TaskDetail';

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

// Change the TaskDetail interface name to avoid conflict with the imported component
interface TaskDetailType {
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

// Status interface for dropdown
interface Status {
  id: string;
  name: string;
  type: string;
  color: string;
}

// Add this interface for users
interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export const PostCard = ({ 
  post, 
  index,
  onTaskDeleted 
}: { 
  post: Post; 
  index: number;
  onTaskDeleted?: (taskDetail: TaskDetailType) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [taskDetail, setTaskDetail] = useState<TaskDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: '',
    due_at: ''
  });
  
  // User search state
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Generate a unique draggable ID that's guaranteed to be a string
  const draggableId = typeof post.id === 'string' ? post.id : `post-${index}-${Date.now()}`;
  
  // Ensure content is a string using our helper function
  const safeContent = getContentText(post.content);

  // Only render the Draggable component after client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch task details when the sheet is opened
  const fetchTaskDetails = async () => {
    if (!post.id) {
      console.error('No post ID found for task', post);
      setError('Cannot load task details: Missing task ID');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      console.log(`Fetching task details for ID: ${post.id}`);
      
      // Fetch task details
      const data = await apiGet(`${backendURL}/api/v1/project/task/${post.id}/`);
      console.log('Task details response:', data);
      setTaskDetail(data);
      
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

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchTaskDetails();
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
  
  // Handle adding a user to the task
  const handleUserAdd = async (user: User) => {
    if (!taskDetail || !post.id) return;
    
    setIsSaving(true);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      
      // Prepare the data for API
      const updateData = {
        ...formData,
        assigned_to: user.id
      };
      
      // Call the API to update the task
      await apiPut(`${backendURL}/api/v1/project/task/${post.id}/update/`, updateData);
      
      // Refresh task details to show the latest data
      await fetchTaskDetails();
      
      toast({
        title: "User assigned",
        description: "The task has been assigned successfully.",
      });
      
    } catch (err) {
      console.error('Error assigning user:', err);
      toast({
        title: "Assignment failed",
        description: "There was a problem assigning the user.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle removing a user from the task
  const handleUserRemove = async (userId: string) => {
    if (!taskDetail || !post.id) return;
    
    setIsSaving(true);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      
      // Prepare the data for API
      const updateData = {
        ...formData,
        assigned_to: null
      };
      
      // Call the API to update the task
      await apiPut(`${backendURL}/api/v1/project/task/${post.id}/update/`, updateData);
      
      // Refresh task details to show the latest data
      await fetchTaskDetails();
      
      toast({
        title: "Assignment removed",
        description: "The task is no longer assigned.",
      });
      
    } catch (err) {
      console.error('Error removing assignment:', err);
      toast({
        title: "Operation failed",
        description: "There was a problem removing the assignment.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Save task changes
  const handleSaveTask = async () => {
    if (!taskDetail || !post.id) return;
    
    setIsSaving(true);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      
      // Prepare the data for API
      const updateData = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        due_at: formData.due_at ? new Date(formData.due_at).toISOString() : null,
        project: taskDetail.project
      };
      
      console.log('Updating task with data:', updateData);
      
      // Call the API to update the task
      await apiPut(`${backendURL}/api/v1/project/task/${post.id}/update/`, updateData);
      
      // Refresh task details to show the latest data
      await fetchTaskDetails();
      
      toast({
        title: "Task updated",
        description: "Your changes have been saved successfully.",
      });
      
    } catch (err) {
      console.error('Error updating task:', err);
      toast({
        title: "Update failed",
        description: "There was a problem updating the task.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle task updates
  const handleTaskUpdated = () => {
    // Refresh data after task update
    fetchTaskDetails();
  };
  
  // Handle task deletion with progress bar update
  const handleTaskDeleted = (deletedTask: TaskDetailType) => {
    // Close the detail sheet
    setIsOpen(false);
    
    // Pass the deleted task detail to parent component for progress bar update
    if (onTaskDeleted) {
      onTaskDeleted(deletedTask);
    }
  };
  
  // If not mounted yet, render a placeholder with the same structure
  if (!isMounted) {
    return (
      <div className="mb-2">
        <Card className="bg-card text-card-foreground border shadow-sm">
          <CardHeader className="py-2 px-3">
            <h4 className="text-sm font-medium">{post.title || 'Untitled'}</h4>
          </CardHeader>
          {safeContent && (
            <CardContent className="py-1 px-3 pb-3">
              <p className="text-muted-foreground text-xs truncate">
                {safeContent}
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }
  
  // Only render the Draggable when client-side mounted
  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => (
        <div
          className="mb-2"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <TaskDetail
            taskId={post.id}
            open={isOpen}
            onOpenChange={setIsOpen}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />
          
          <Card 
            className={`bg-card text-card-foreground border shadow-sm hover:shadow hover:bg-accent/5 cursor-pointer ${
              snapshot.isDragging ? "opacity-90 rotate-1" : ""
            }`}
            onClick={() => setIsOpen(true)}
          >
            <CardHeader className="py-2 px-3">
              <h4 className="text-sm font-medium">{post.title || 'Untitled'}</h4>
            </CardHeader>
            {safeContent && (
              <CardContent className="py-1 px-3 pb-3">
                <p className="text-muted-foreground text-xs truncate">
                  {safeContent}
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </Draggable>
  );
};
