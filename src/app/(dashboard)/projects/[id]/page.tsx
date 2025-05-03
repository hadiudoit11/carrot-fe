"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { apiGet, apiPost, apiPut } from "@/providers/apiRequest";
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';

// Import components from projects_2
import { PostColumn } from '@/components/projects_2/PostColumn';
import { Post, useOrgProjectStatuses, getPostsByStatus, PostsByStatus } from '@/components/projects_2/statuses';

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
  description: string;
  status_name: string;
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
    // Handle description that could be a string or an object with details property
    let content = '';
    if (task.description) {
      if (typeof task.description === 'string') {
        content = task.description;
      } else if (typeof task.description === 'object' && task.description.details) {
        content = task.description.details;
      }
    }
    
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
      <div className="bg-primary p-8 text-text-primary h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="bg-primary p-8 text-text-primary">
      <h1 className="text-2xl font-bold mb-6">{project?.name || 'Project Board'}</h1>
      
      <div className="w-full rounded-lg border-2 border-border-accent overflow-hidden shadow-accent-offset">
        {isMounted && dataReady && statuses.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto p-4 bg-tertiary">
              {statuses.map((status) => (
                <PostColumn
                  key={status}
                  status={status}
                  statusName={statusNames[status]}
                  posts={postsByStatus[status] || []}
                />
              ))}
            </div>
          </DragDropContext>
        ) : (
          <div className="flex overflow-x-auto p-4 bg-tertiary">
            {statuses.length > 0 ? (
              statuses.map((status) => (
                <div key={status} className="flex-1 bg-secondary rounded-lg w-72 flex-shrink-0 mr-3 p-2">
                  <h3 className="text-center font-medium text-text-light mb-3">
                    {statusNames[status] || status}
                  </h3>
                  <div className="min-h-[100px] p-2 rounded-md">
                    <div className="flex flex-col items-center justify-center h-24 text-center border border-dashed border-accent/30 rounded-lg p-2 my-1">
                      <p className="text-text-secondary text-sm">Loading...</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-12">
                <p className="text-text-secondary">No status categories available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
