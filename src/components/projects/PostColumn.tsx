import { Droppable } from "@hello-pangea/dnd";
import { Post } from "./statuses";
import { PostCard } from "./PostCard";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlusCircle, Loader2 } from "lucide-react";
import { useToastContext } from "@/components/ui/toast-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiPost } from "@/providers/apiRequest";

// Add the TaskDetailType interface
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

export const PostColumn = ({
  status,
  statusName,
  posts,
  onTaskDeleted,
  onTaskCreated
}: {
  status: string;
  statusName?: string;
  posts: Post[];
  onTaskDeleted?: (taskDetail: TaskDetailType) => void;
  onTaskCreated?: (newTask: Post) => void;
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToastContext ? useToastContext() : { toast: () => {} };
  
  // Only enable client-side features after mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Ensure posts is always a valid array with proper Post objects
  const safePosts = Array.isArray(posts) 
    ? posts.filter(post => post && typeof post === 'object') 
    : [];
  
  // Focus the input when entering creation mode
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);
  
  // Handle creating a new task
  const handleCreateTask = async (e?: React.KeyboardEvent) => {
    // Only proceed if Enter is pressed or if this is from the blur event (no event)
    if (e && e.key !== 'Enter') return;
    
    // Don't create empty tasks
    if (!newTaskTitle.trim()) {
      setIsCreating(false);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      
      // Get the project ID from the URL
      const projectId = window.location.pathname.split('/').pop();
      
      // Create the task
      const response = await apiPost(`${backendURL}/api/v1/project/task/create/`, {
        name: newTaskTitle.trim(),
        project: projectId,
        status: status,
        description: '', // Empty description to start
      });
      
      // Show success message
      toast({
        title: "Task created",
        variant: "default",
        duration: 3000,
      });
      
      // Create a local Post object from the response
      if (response && response.id) {
        const newPost: Post = {
          id: response.id,
          title: response.name || newTaskTitle.trim(),
          content: response.description || '',
          status: status,
          index: safePosts.length // Add to end of list
        };
        
        // Call the callback to inform parent component
        if (onTaskCreated) {
          onTaskCreated(newPost);
        }
      }
      
      // Reset the creation state
      setNewTaskTitle('');
      setIsCreating(false);
      
      // Instead of reloading the page, the parent component will update the state
      // window.location.reload(); - Remove this line
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Failed to create task",
        description: "An error occurred while creating the task.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle input blur (save the task when clicking away)
  const handleBlur = () => {
    if (newTaskTitle.trim() && !isSubmitting) {
      handleCreateTask();
    } else if (!isSubmitting) {
      setIsCreating(false);
    }
  };
  
  // Create task input field component
  const NewTaskInput = () => (
    <div className="p-2 bg-background/50 rounded-md border-2 border-dashed border-primary/20 focus-within:border-primary/50 transition-all my-1">
      {isSubmitting ? (
        <div className="flex items-center justify-center p-2">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm">Creating task...</span>
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleCreateTask}
          onBlur={handleBlur}
          placeholder="Task title..."
          className="w-full bg-transparent px-2 py-1 border-none focus:outline-none text-sm"
          data-testid="new-task-input"
        />
      )}
    </div>
  );
  
  return (
    <Card className="flex-1 w-72 flex-shrink-0 mr-3 border bg-card text-card-foreground rounded-md">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            {statusName || status}
          </h3>
          <Badge variant="outline" className="text-xs font-normal">
            {safePosts.length}
          </Badge>
        </div>
      </CardHeader>
      <Droppable droppableId={status} isDropDisabled={!isMounted}>
        {(droppableProvided, snapshot) => (
          <CardContent 
            className="p-2 min-h-[150px]"
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
          >
            <div className={`rounded-md ${
              snapshot.isDraggingOver ? "bg-muted" : ""
            }`}>
              {/* Render the list of posts */}
              {safePosts.length === 0 && !isCreating && (
                <div 
                  onClick={() => setIsCreating(true)}
                  className="flex flex-col items-center justify-center h-24 text-center border border-dashed border-muted rounded-lg p-2 my-1 cursor-pointer hover:bg-muted/20 transition-colors"
                >
                  <PlusCircle className="h-5 w-5 text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">No tasks yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to add one</p>
                </div>
              )}
              {safePosts.map((post, index) => 
                post && post.id ? (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    index={index} 
                    onTaskDeleted={onTaskDeleted}
                  />
                ) : null
              )}
              {droppableProvided.placeholder}
              {/* Always render the NewTaskInput at the end, but only show it if isCreating */}
              {isCreating && <NewTaskInput key="new-task-input" />}
            </div>
          </CardContent>
        )}
      </Droppable>
      {/* Add a button at the bottom of the column */}
      {!isCreating && (
        <div className="p-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setIsCreating(true)}
            disabled={isSubmitting}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add task
          </Button>
        </div>
      )}
    </Card>
  );
};
