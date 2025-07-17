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

// Add TaskDetailType interface for task deletion handling
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

// Update the Project interface to include statuses
interface Project {
  id: string;
  name: string;
  description: string | { details: string };
  status_name: string;
  task_status_counts?: {
    [key: string]: number;
  };
  statuses?: Status[]; // Add statuses array
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
  console.log('mapTasksToPostFormat called with:', { tasks, availableStatuses });
  
  if (!Array.isArray(tasks)) {
    console.warn('Tasks is not an array:', tasks);
    return [];
  }
  
  const result = tasks.map(task => {
    console.log('Processing task:', task);
    
    // Use our helper function to extract description content
    const content = getDescriptionText(task.description);
    
    // Determine which status to use
    let status = task.status;
    console.log(`Task ${task.id} original status: ${status}`);
    console.log(`Task ${task.id} status_name: ${task.status_name}`);
    
    // Check if the task has a status_id property that might be the actual status identifier
    if (task.status_id) {
      console.log(`Task ${task.id} has status_id: ${task.status_id}`);
      // If status_id is in available statuses, use it
      if (availableStatuses.includes(task.status_id)) {
        status = task.status_id;
        console.log(`Using status_id: ${status}`);
      }
    }
    
    // If this status isn't in our available statuses, try to find a match
    if (availableStatuses.length > 0 && !availableStatuses.includes(status)) {
      console.log(`Status "${status}" not in available statuses:`, availableStatuses);
      
      // Try to find a status that matches by name (case-insensitive)
      const matchingStatus = availableStatuses.find(availableStatus => 
        availableStatus.toLowerCase() === status.toLowerCase() ||
        availableStatus.toLowerCase() === (task.status_name || '').toLowerCase()
      );
      
      if (matchingStatus) {
        status = matchingStatus;
        console.log(`Found matching status by name: ${status}`);
      } else {
        // Use the first available status as a fallback
        status = availableStatuses[0];
        console.warn(`Task ${task.id || task.name} has status "${task.status}" that is not in available statuses. Using ${availableStatuses[0]} instead.`);
      }
    }
    
    const mappedTask = {
      id: task.id || `temp-${Math.random().toString(36).substring(2, 9)}`,
      title: task.title || task.name || 'Untitled Task',
      content: content,
      status: status,
      index: task.order || 0
    };
    
    console.log('Mapped task:', mappedTask);
    return mappedTask;
  });
  
  console.log('Final result from mapTasksToPostFormat:', result);
  return result;
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
  const [project, setProject] = useState<Project | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Add state for project-specific statuses
  const [projectStatuses, setProjectStatuses] = useState<string[]>([]);
  const [projectStatusNames, setProjectStatusNames] = useState<Record<string, string>>({});
  
  // Keep the organization statuses as fallback
  const { statuses: orgStatuses, statusNames: orgStatusNames, loading: statusesLoading } = useOrgProjectStatuses();
  
  // Initialize postsByStatus with empty arrays for each status
  const [postsByStatus, setPostsByStatus] = useState<PostsByStatus>({});
  

  
  const [dataReady, setDataReady] = useState(false);

  // Check if component is mounted on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle authentication
  useEffect(() => {
    if (sessionStatus === 'loading') {
      return; // Wait for session to load
    }
    
    if (sessionStatus === 'unauthenticated') {
      router.push('/user/login');
      return;
    }
    
    if (session?.error === 'RefreshAccessTokenError') {
      router.push('/user/login');
      return;
    }
  }, [session, sessionStatus, router]);

  // Function to handle newly created tasks
  const handleTaskCreated = (newTask: Post) => {
    // Update posts array with the new task
    setPosts(prevPosts => {
      const updatedPosts = [...prevPosts, newTask];
      return updatedPosts;
    });
    
    // Update postsByStatus with the new task
    setPostsByStatus(prevPostsByStatus => {
      const updatedPostsByStatus = { ...prevPostsByStatus };
      
      // If the status array exists, add the task to it
      if (Array.isArray(updatedPostsByStatus[newTask.status])) {
        updatedPostsByStatus[newTask.status] = [...updatedPostsByStatus[newTask.status], newTask];
      } else {
        // Create the status array if it doesn't exist
        updatedPostsByStatus[newTask.status] = [newTask];
      }
      
      return updatedPostsByStatus;
    });
    
    // Update task status counts in the project
    if (project && project.task_status_counts) {
      const statusName = projectStatuses.length > 0 ? 
        projectStatusNames[newTask.status] : 
        orgStatusNames[newTask.status];
      
      // Create a copy of the current counts
      const updatedTaskCounts = { ...project.task_status_counts };
      
      // Increment the count for this status
      if (updatedTaskCounts[statusName] !== undefined) {
        updatedTaskCounts[statusName] = (updatedTaskCounts[statusName] as number) + 1;
      } else {
        updatedTaskCounts[statusName] = 1;
      }
      
      // Update the project with new counts
      setProject({
        ...project,
        task_status_counts: updatedTaskCounts
      });
    }
  };

  // Function to handle deleted tasks
  const handleTaskDeleted = (project: Project | null, setProject: React.Dispatch<React.SetStateAction<Project | null>>) => {
    return (taskDetail: TaskDetailType) => {
      // Update posts array by removing the deleted task
      setPosts(prevPosts => prevPosts.filter(post => post.id !== taskDetail.id));
      
      // Update postsByStatus by removing the deleted task
      setPostsByStatus(prevPostsByStatus => {
        const updatedPostsByStatus = { ...prevPostsByStatus };
        if (Array.isArray(updatedPostsByStatus[taskDetail.status])) {
          updatedPostsByStatus[taskDetail.status] = updatedPostsByStatus[taskDetail.status].filter(
            post => post.id !== taskDetail.id
          );
        }
        return updatedPostsByStatus;
      });
      
      // Update task status counts in the project
      if (project && project.task_status_counts) {
        const statusName = projectStatuses.length > 0 ? 
          projectStatusNames[taskDetail.status] : 
          orgStatusNames[taskDetail.status];
        
        // Create a copy of the current counts
        const updatedTaskCounts = { ...project.task_status_counts };
        
        // Decrement the count for this status
        if (updatedTaskCounts[statusName] !== undefined && updatedTaskCounts[statusName] > 0) {
          updatedTaskCounts[statusName] = (updatedTaskCounts[statusName] as number) - 1;
        }
        
        // Update the project with new counts
        setProject({
          ...project,
          task_status_counts: updatedTaskCounts
        });
      }
    };
  };

  // Fetch project and tasks data - modify this function
  useEffect(() => {
    const fetchProject = async () => {
      // Only require the component to be mounted, since we'll get statuses from the project
      if (!projectId || !isMounted) return;
      
      setIsLoading(true);
      setDataReady(false);
      
      try {
        const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        console.log('Fetching project data for ID:', projectId);
        
        const projectData = await apiGet(`${backendURL}/api/v1/project/project/${projectId}/`);
        console.log('Project data response:', projectData);
        
        const tasksData = await apiGet(`${backendURL}/api/v1/project/project/${projectId}/tasks/`);
        console.log('Tasks data response:', tasksData);
        console.log('Tasks data type:', typeof tasksData);
        console.log('Tasks data length:', Array.isArray(tasksData) ? tasksData.length : 'Not an array');
        if (Array.isArray(tasksData) && tasksData.length > 0) {
          console.log('First task example:', tasksData[0]);
        }
        
        setProject(projectData);
        
        // Extract project-specific statuses if available
        if (projectData.statuses && Array.isArray(projectData.statuses) && projectData.statuses.length > 0) {
          console.log('Using project-specific statuses:', projectData.statuses);
          
          // Extract status IDs to use as keys
          const statusIds = projectData.statuses.map(status => status.id);
          console.log('Project status IDs:', statusIds);
          
          // Create mapping of IDs to names
          const statusMapping = projectData.statuses.reduce((acc, status) => {
            acc[status.id] = status.name;
            return acc;
          }, {} as Record<string, string>);
          console.log('Status mapping:', statusMapping);
          
          // Set the project-specific statuses
          setProjectStatuses(statusIds);
          setProjectStatusNames(statusMapping);
          
          // Convert tasks using project-specific statuses
          const formattedPosts = mapTasksToPostFormat(tasksData, statusIds);
          console.log('Formatted posts with project statuses:', formattedPosts);
          console.log('Posts by status result:', getPostsByStatus(formattedPosts, statusIds));
          setPosts(formattedPosts);
          setPostsByStatus(getPostsByStatus(formattedPosts, statusIds));
        } else {
          // Fall back to organization statuses if project doesn't have specific ones
          console.warn('Project does not have specific statuses, falling back to organization statuses');
          console.log('Organization statuses:', orgStatuses);
          
          // Wait for org statuses if they're still loading
          if (statusesLoading) {
            console.log('Waiting for organization statuses to load...');
            return;
          }
          
          console.log('Statuses loading state:', statusesLoading);
          console.log('Organization statuses length:', orgStatuses.length);
          
          // If org statuses are empty, create statuses from task data
          if (orgStatuses.length === 0 && Array.isArray(tasksData) && tasksData.length > 0) {
            console.log('Organization statuses are empty, creating statuses from task data');
            
            // Extract unique statuses from tasks
            const taskStatuses = new Set();
            const taskStatusNames = new Map();
            
            tasksData.forEach(task => {
              if (task.status) {
                taskStatuses.add(task.status);
                if (task.status_name) {
                  taskStatusNames.set(task.status, task.status_name);
                }
              }
            });
            
            const extractedStatuses = Array.from(taskStatuses);
            const extractedStatusNames = Object.fromEntries(taskStatusNames);
            
            console.log('Extracted statuses from tasks:', extractedStatuses);
            console.log('Extracted status names:', extractedStatusNames);
            
            // Use extracted statuses
            const formattedPosts = mapTasksToPostFormat(tasksData, extractedStatuses);
            console.log('Formatted posts with extracted statuses:', formattedPosts);
            console.log('Raw tasks data for comparison:', tasksData);
            console.log('Extracted statuses being used:', extractedStatuses);
            const postsByStatusResult = getPostsByStatus(formattedPosts, extractedStatuses);
            console.log('Posts by status result:', postsByStatusResult);
            setPosts(formattedPosts);
            setPostsByStatus(postsByStatusResult);
            
            // Set these as project statuses
            setProjectStatuses(extractedStatuses);
            setProjectStatusNames(extractedStatusNames);
          } else {
            // Convert tasks using organization statuses
            const formattedPosts = mapTasksToPostFormat(tasksData, orgStatuses);
            console.log('Formatted posts with org statuses:', formattedPosts);
            console.log('Posts by status result:', getPostsByStatus(formattedPosts, orgStatuses));
            setPosts(formattedPosts);
            setPostsByStatus(getPostsByStatus(formattedPosts, orgStatuses));
          }
        }
        
        // Mark data as ready after a slight delay to ensure rendering is complete
        setTimeout(() => {
          console.log('Setting dataReady to true');
          setDataReady(true);
        }, 100);
      } catch (error) {
        console.error('Error fetching project data:', error);
        setDataReady(true); // Still mark as ready to show empty state
      } finally {
        setIsLoading(false);
      }
    };
    
      // Run fetchProject when component is mounted
  if (isMounted) {
    fetchProject();
  }
}, [projectId, isMounted, orgStatuses, statusesLoading]);

// Debug effect to monitor postsByStatus changes
useEffect(() => {
  console.log('postsByStatus state changed:', postsByStatus);
}, [postsByStatus]);

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
      // Get status names from project status names if available, otherwise fallback to org status names
      const statusNames = projectStatuses.length > 0 ? projectStatusNames : orgStatusNames;
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
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
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
        const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
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
        {isMounted && dataReady ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto p-4 bg-background">
              {(() => {
                const statuses = projectStatuses.length > 0 ? projectStatuses : orgStatuses;
                console.log('Rendering columns with statuses:', statuses);
                console.log('Current postsByStatus:', postsByStatus);
                return statuses.map((status) => {
                  const posts = postsByStatus[status] || [];
                  console.log(`Column ${status} will have ${posts.length} posts:`, posts);
                  return (
                    <PostColumn
                      key={status}
                      status={status}
                      statusName={projectStatuses.length > 0 ? projectStatusNames[status] : orgStatusNames[status]}
                      posts={posts}
                      onTaskDeleted={handleTaskDeleted(project, setProject)}
                      onTaskCreated={handleTaskCreated}
                    />
                  );
                });
              })()}
            </div>
          </DragDropContext>
        ) : (
          <div className="flex overflow-x-auto p-4 bg-background">
            {(projectStatuses.length > 0 ? projectStatuses : orgStatuses).length > 0 ? (
              (projectStatuses.length > 0 ? projectStatuses : orgStatuses).map((status) => (
                <div key={status} className="flex-1 bg-card rounded-lg w-72 flex-shrink-0 mr-3 p-2 border">
                  <h3 className="text-center font-medium text-card-foreground mb-3">
                    {(projectStatuses.length > 0 ? projectStatusNames[status] : orgStatusNames[status]) || status}
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
