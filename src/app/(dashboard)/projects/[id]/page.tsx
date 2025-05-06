"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { apiGet, apiPost, apiPut } from "@/providers/apiRequest";
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';

// Import components from projects_2
import { PostColumn } from '@/components/projects/PostColumn';
import { Post, useOrgProjectStatuses, getPostsByStatus, PostsByStatus } from '@/components/projects/statuses';

// Import ShadCN components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProgressBars from "@/components/sub/projects/progress-bar";
import { Progress } from "@/components/sub/projects/multi-progress-bar";

// Import ProgressSegment type
import type { ProgressSegment } from "@/components/sub/projects/multi-progress-bar";

// Import TaskDetail component
import TaskDetail from '@/components/projects/TaskDetail';

// Define the TaskDetail type interface directly instead of importing it
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

// Helper function to safely extract text from potentially complex description objects
const getDescriptionText = (description: any): string => {
  if (description === null || description === undefined) {
    return '';
  }
  
  if (typeof description === 'string') {
    return description;
  }
  
  if (typeof description === 'object') {
    // Check if it has a details property
    if (description.details && typeof description.details === 'string') {
      return description.details;
    }
    
    // Try to convert to JSON string if it's another kind of object
    try {
      return JSON.stringify(description);
    } catch (e) {
      return '';
    }
  }
  
  return String(description);
};

interface Status {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface Task {
  id: string;
  name: string;
  description?: string;
  status: string;
  status_name: string;
  assigned_to_name?: string;
  due_at?: string;
  order: number;
}

interface Project {
  id: string;
  name: string;
  description: string | { details: string };
  status_name: string;
  task_status_counts?: {
    [key: string]: number;
  };
}

// Map status types to their corresponding lists
interface TaskList {
  id: string;
  title: string;
  statusId: string;
  color: string;
  order: number;
  cards: {
    id: string;
    title: string;
    description?: string;
    order: number;
    dueAt?: string;
    assignedTo?: string;
  }[];
}

// Map our Task data structure to Post data structure
const mapTasksToPostFormat = (tasks, availableStatuses): Post[] => {
  if (!Array.isArray(tasks)) return [];
  
  return tasks.map(task => {
    // Use our helper function to extract description content
    const content = getDescriptionText(task.description);
    
    // Determine which status to use
    let status = task.status;
    // If this status isn't in our available statuses, use the first available status
    if (availableStatuses.length > 0 && !availableStatuses.includes(status)) {
      status = availableStatuses[0];
    }
    
    return {
      id: task.id || `temp-${Math.random().toString(36).substring(2, 9)}`,
      title: task.title || task.name || 'Untitled Task',
      content: content,
      status: status,
      index: task.order || 0
    };
  });
};

// Initialize an empty PostsByStatus object with the provided statuses
const getEmptyPostsByStatus = (statuses: string[]): PostsByStatus => {
  return statuses.reduce(
    (obj, status) => ({ ...obj, [status]: [] }),
    {} as PostsByStatus
  );
};

// Add this function to convert task status counts to progress bar segments
const getTaskStatusSegments = (project: Project | null): ProgressSegment[] => {
  if (!project || !project.task_status_counts) {
    return [];
  }
  
  // Get the counts from project
  const counts = project.task_status_counts;
  
  // Calculate total tasks for percentage calculation
  const totalTasks = Object.values(counts).reduce((sum, count) => sum + count, 0);
  
  if (totalTasks === 0) {
    return [];
  }
  
  // Map status types to colors and priority (higher priority = appears first)
  const statusInfo: { 
    [key: string]: { 
      color: string, 
      priority: number 
    } 
  } = {
    'todo': { color: 'bg-blue-500', priority: 300 },
    'in_progress': { color: 'bg-amber-500', priority: 400 },
    'doing': { color: 'bg-amber-500', priority: 400 },
    'on_hold': { color: 'bg-purple-500', priority: 100 },
    'done': { color: 'bg-green-500', priority: 500 },
    'completed': { color: 'bg-green-500', priority: 500 },
    'cancelled': { color: 'bg-red-500', priority: 200 }
  };
  
  // Convert to progress segments with priority
  const segments = Object.entries(counts).map(([status, count]) => {
    // Convert status to lowercase for matching
    const statusLower = status.toLowerCase();
    const info = statusInfo[statusLower] || { color: 'bg-gray-500', priority: 0 };
    
    return {
      value: (count / totalTasks) * 100,
      color: info.color,
      priority: info.priority
    };
  });
  
  // Sort segments by priority (highest to lowest)
  return segments.sort((a, b) => b.priority - a.priority);
};

// Add this function to handle task deletion updating the progress bar
const handleTaskDeleted = (project: Project | null, setProject: React.Dispatch<React.SetStateAction<any>>) => {
  return (deletedTask: TaskDetailType) => {
    if (!project || !project.task_status_counts) return;
    
    // Get status name of the deleted task
    const deletedStatusName = deletedTask.status_name || deletedTask.status;
    
    // Update task status counts
    if (project.task_status_counts[deletedStatusName]) {
      // Create a copy of the current counts
      const updatedTaskCounts = { ...project.task_status_counts };
      
      // Decrement the count for the deleted task's status
      updatedTaskCounts[deletedStatusName] = Math.max(0, updatedTaskCounts[deletedStatusName] - 1);
      
      // Update the project with new counts
      setProject({
        ...project,
        task_status_counts: updatedTaskCounts
      });
      
      console.log(`Updated counts after deletion:`, updatedTaskCounts);
    }
  };
};

export default function ProjectPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Get organization statuses
  const { statuses, statusNames, loading: statusesLoading } = useOrgProjectStatuses();
  
  // Initialize postsByStatus with empty arrays for each status
  const [postsByStatus, setPostsByStatus] = useState<PostsByStatus>({});
  
  useEffect(() => {
    if (statuses.length > 0) {
      setPostsByStatus(getEmptyPostsByStatus(statuses));
    }
  }, [statuses]);
  
  const [dataReady, setDataReady] = useState(false);

  // Check if component is mounted on client
  useEffect(() => {
    setIsMounted(true);

    if (sessionStatus === 'unauthenticated') {
      window.location.href = '/user/login';
    }
  }, [sessionStatus]);

  // Fetch project and tasks data
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId || !isMounted || statusesLoading || statuses.length === 0) return;
      
      setIsLoading(true);
      setDataReady(false);
      
      try {
        const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
        const projectData = await apiGet(`${backendURL}/api/v1/project/project/${projectId}/`);
        const tasksData = await apiGet(`${backendURL}/api/v1/project/project/${projectId}/tasks/`);
        
        setProject(projectData);
        
        // Convert tasks to the post format expected by the components
        const formattedPosts = mapTasksToPostFormat(tasksData, statuses);
        setPosts(formattedPosts);
        setPostsByStatus(getPostsByStatus(formattedPosts, statuses));
        
        // Mark data as ready after a slight delay to ensure rendering is complete
        setTimeout(() => {
          setDataReady(true);
        }, 100);
      } catch (error) {
        console.error('Error fetching project data:', error);
        setDataReady(true); // Still mark as ready to show empty state
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isMounted && statuses.length > 0) {
      fetchProject();
    }
  }, [projectId, isMounted, statuses, statusesLoading]);

  // Handle drag end event
  const onDragEnd: OnDragEndResponder = async (result) => {
    const { destination, source } = result;
    
    // Drop outside a valid area or no change
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    const sourceStatus = source.droppableId;
    const destinationStatus = destination.droppableId;
    
    // Safety check for the source post
    if (!postsByStatus[sourceStatus] || 
        !Array.isArray(postsByStatus[sourceStatus]) ||
        !postsByStatus[sourceStatus][source.index]) {
      console.error('Invalid source post for drag operation');
      return;
    }
    
    // Get the post being moved
    const sourcePost = postsByStatus[sourceStatus][source.index];
    
    // Get or create destination post info
    const destinationPost = postsByStatus[destinationStatus] && 
                           postsByStatus[destinationStatus][destination.index] || {
      status: destinationStatus,
      index: destination.index
    };
    
    // Create a new state with updated positions
    const updatedPostsByStatus = updatePostStatusLocal(
      sourcePost,
      { status: sourceStatus, index: source.index },
      { status: destinationStatus, index: destination.index },
      postsByStatus
    );
    
    // Update state first for immediate UI feedback
    setPostsByStatus(updatedPostsByStatus);
    
    // Update task status counts for the progress bar
    if (project?.task_status_counts && sourceStatus !== destinationStatus) {
      const sourceStatusName = statusNames[sourceStatus] || sourceStatus;
      const destStatusName = statusNames[destinationStatus] || destinationStatus;
      
      // Create a copy of the current task status counts
      const updatedTaskCounts = { ...project.task_status_counts };
      
      // Decrement the count for source status
      if (updatedTaskCounts[sourceStatusName]) {
        updatedTaskCounts[sourceStatusName] = Math.max(0, (updatedTaskCounts[sourceStatusName] as number) - 1);
      }
      
      // Increment the count for destination status
      if (updatedTaskCounts[destStatusName] !== undefined) {
        updatedTaskCounts[destStatusName] = (updatedTaskCounts[destStatusName] as number) + 1;
      } else {
        updatedTaskCounts[destStatusName] = 1;
      }
      
      // Update the project with new task counts
      setProject({
        ...project,
        task_status_counts: updatedTaskCounts
      });
    }
    
    // Save changes to backend
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      
      await apiPut(`${backendURL}/api/v1/project/task/${sourcePost.id}/update/`, {
        name: sourcePost.title,
        description: sourcePost.content,
        project: projectId,
        status: destinationStatus,
        order: destination.index
      });
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert to original state on error
      setPostsByStatus(postsByStatus);
      
      // Revert the task_status_counts if we updated them
      if (project?.task_status_counts && sourceStatus !== destinationStatus) {
        // Refresh project data from server to get accurate counts
        const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
        try {
          const refreshedProject = await apiGet(`${backendURL}/api/v1/project/project/${projectId}/`);
          setProject(refreshedProject);
        } catch (refreshError) {
          console.error('Error refreshing project data:', refreshError);
        }
      }
    }
  };

  // Function to update local state
  const updatePostStatusLocal = (
    sourcePost: Post,
    source: { status: string; index: number },
    destination: {
      status: string;
      index: number;
    },
    postsByStatus: PostsByStatus
  ): PostsByStatus => {
    if (source.status === destination.status) {
      // Moving item inside the same column
      const column = Array.isArray(postsByStatus[source.status]) ? 
                    [...postsByStatus[source.status]] : [];
      
      column.splice(source.index, 1);
      column.splice(destination.index, 0, sourcePost);
      
      return {
        ...postsByStatus,
        [destination.status]: column,
      };
    } else {
      // Moving item across columns
      const sourceColumn = Array.isArray(postsByStatus[source.status]) ? 
                          [...postsByStatus[source.status]] : [];
                          
      const destinationColumn = Array.isArray(postsByStatus[destination.status]) ? 
                               [...postsByStatus[destination.status]] : [];
      
      sourceColumn.splice(source.index, 1);
      destinationColumn.splice(
        destination.index,
        0,
        {...sourcePost, status: destination.status}
      );
      
      return {
        ...postsByStatus,
        [source.status]: sourceColumn,
        [destination.status]: destinationColumn,
      };
    }
  };

  if (sessionStatus === 'loading' || !isMounted || isLoading || statusesLoading) {
    return (
      <div className="w-full max-w-full py-6 space-y-6 px-4">
        <Card className="w-full">
          <CardContent className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-32 w-full max-w-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full py-6 space-y-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <div className="w-full md:w-2/5 lg:w-1/2">
          <h1 className="text-2xl font-bold">{project?.name || 'Project Board'}</h1>
          {project?.description && (
            <p className="text-muted-foreground mt-1 text-sm">{getDescriptionText(project.description)}</p>
          )}
        </div>
        
        <div className="w-full md:w-3/5 lg:w-1/2">
          <div className="bg-background/50 rounded-lg border border-border/50 p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Task Progress</h3>
              {project?.status_name && (
                <Badge className="h-6" variant="outline">
                  {project.status_name}
                </Badge>
              )}
            </div>
            
            <Progress 
              segments={getTaskStatusSegments(project)} 
              className="h-3 mb-2"
            />
            
            {project?.task_status_counts && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(project.task_status_counts).map(([status, count]) => {
                    // Determine color class based on status name
                    const colorClass = 
                      status.toLowerCase().includes('done') || status.toLowerCase().includes('completed') 
                        ? 'bg-green-500' 
                        : status.toLowerCase().includes('progress') || status.toLowerCase().includes('doing')
                        ? 'bg-amber-500'
                        : status.toLowerCase().includes('hold')
                        ? 'bg-purple-500'
                        : status.toLowerCase().includes('cancel')
                        ? 'bg-red-500'
                        : 'bg-blue-500';
                        
                    return (
                      <div key={status} className="flex items-center bg-background/80 border border-border/30 rounded-full px-2 py-0.5 text-xs">
                        <div className={`w-2.5 h-2.5 mr-1.5 rounded-full ${colorClass}`} />
                        <span className="font-medium">{status}</span>
                        <span className="ml-1 text-muted-foreground">({count as number})</span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-right text-xs font-medium text-muted-foreground mt-1.5">
                  Total: {`${Object.values(project.task_status_counts)
                    .reduce((sum: number, count: unknown) => sum + (count as number), 0)} tasks`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="w-full rounded-lg border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        {isMounted && dataReady && statuses.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto p-4 bg-background">
              {statuses.map((status) => (
                <PostColumn
                  key={status}
                  status={status}
                  statusName={statusNames[status]}
                  posts={postsByStatus[status] || []}
                  onTaskDeleted={handleTaskDeleted(project, setProject)}
                />
              ))}
            </div>
          </DragDropContext>
        ) : (
          <div className="flex overflow-x-auto p-4 bg-background">
            {statuses.length > 0 ? (
              statuses.map((status) => (
                <div key={status} className="flex-1 bg-card rounded-lg w-72 flex-shrink-0 mr-3 p-2 border">
                  <h3 className="text-center font-medium text-card-foreground mb-3">
                    {statusNames[status] || status}
                  </h3>
                  <div className="min-h-[100px] p-2 rounded-md">
                    <div className="flex flex-col items-center justify-center h-24 text-center border border-dashed border-muted rounded-lg p-2 my-1">
                      <Skeleton className="h-6 w-6 rounded-full mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-12">
                <p className="text-muted-foreground">No status categories available</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.refresh()}
                >
                  Retry
                </Button>
              </div>
            )}
        </div>
        )}
        </div>
    </div>
  );
}
