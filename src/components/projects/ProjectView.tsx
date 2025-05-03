'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { apiGet, apiPost } from '@/providers/apiRequest';
import type { DropResult } from '@hello-pangea/dnd';
import CreateStatusForm from './CreateStatusForm';
import StableDndContext from '../StableDndContext';
import MemoizedColumn from '../MemoizedColumn';
import DndErrorBoundary from '../DndErrorBoundary';
import { useSession } from 'next-auth/react';

interface Project {
  id: string;
  title: string;
}

interface Status {
  id: string;
  title: string;
  order: number;
  cards: Task[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  order: number;
}

// API interfaces (matching exactly what your backend returns)
interface ApiProject {
  id: string;
  name: string;
  description?: string;
  status?: string;
  status_name?: string;
  [key: string]: any; // Allow for additional fields
}

interface ApiStatus {
  id: string;
  name: string;
  order?: number;
  type?: string;
  color?: string;
  cards?: any[]; // Some APIs include cards/tasks directly in the status
  tasks?: any[]; // Alternative property name for tasks
  [key: string]: any; // Allow for additional fields
}

interface ApiTask {
  id: string;
  name: string;
  description?: string | { details: string };
  status?: string;
  status_name?: string;
  order?: number;
  project?: string;
  project_name?: string;
  created_at?: string;
  due_at?: string;
  assigned_to?: string;
  [key: string]: any; // Allow for additional fields
}

interface ProjectViewProps {
  projectId: string;
}

// Sample data for development/fallback purposes
const SAMPLE_PROJECT = {
  id: 'sample-project',
  title: 'Sample Project'
};

const SAMPLE_STATUSES: Status[] = [
  {
    id: 'status-1',
    title: 'To Do',
    order: 0,
    cards: [
      { id: 'task-1', title: 'Task 1', description: 'Description for Task 1', order: 0 },
      { id: 'task-2', title: 'Task 2', description: 'Description for Task 2', order: 1 }
    ]
  },
  {
    id: 'status-2',
    title: 'In Progress',
    order: 1,
    cards: [
      { id: 'task-3', title: 'Task 3', description: 'Description for Task 3', order: 0 }
    ]
  },
  {
    id: 'status-3',
    title: 'Done',
    order: 2,
    cards: [
      { id: 'task-4', title: 'Task 4', description: 'Description for Task 4', order: 0 }
    ]
  }
];

export default function ProjectView({ projectId }: ProjectViewProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [useSampleData, setUseSampleData] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  
  // Use refs to prevent excessive re-renders
  const statusesRef = useRef<Status[]>([]);
  
  // Set mounted state once component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // We'll use a different approach for handling authentication errors
  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (session?.error === 'RefreshAccessTokenError') {
      // Instead of router.push, we can use window.location
      window.location.href = '/user/login';
      return;
    }
  }, [session, sessionStatus]);

  // Keep the ref updated with the latest statuses
  useEffect(() => {
    statusesRef.current = statuses;
  }, [statuses]);

  // Helper to transform API data to component format
  const transformApiStatus = useCallback((apiStatus: ApiStatus): Status => {
    // Look for tasks in the status object itself
    let cards: Task[] = [];
    
    // Check if tasks are embedded in the status itself (under cards or tasks property)
    if (Array.isArray(apiStatus.cards) && apiStatus.cards.length > 0) {
      cards = apiStatus.cards.map(task => transformApiTask(task));
    } else if (Array.isArray(apiStatus.tasks) && apiStatus.tasks.length > 0) {
      cards = apiStatus.tasks.map(task => transformApiTask(task));
    }
    
    return {
      id: apiStatus.id,
      title: apiStatus.name || 'Unnamed Status',
      order: typeof apiStatus.order === 'number' ? apiStatus.order : 0,
      cards: cards
    };
  }, []);

  // Helper to count tasks by status
  const countTasksByStatus = useCallback((tasks: ApiTask[]): Record<string, number> => {
    const counts: Record<string, number> = {};
    
    tasks.forEach(task => {
      const statusName = task.status_name || 'Unknown';
      counts[statusName] = (counts[statusName] || 0) + 1;
    });
    
    return counts;
  }, []);

  const transformApiTask = useCallback((apiTask: ApiTask): Task => {
    // Handle description which can be a string or an object with a details property
    let description = '';
    if (typeof apiTask.description === 'string') {
      description = apiTask.description;
    } else if (apiTask.description && typeof apiTask.description === 'object' && 'details' in apiTask.description) {
      description = apiTask.description.details;
    }

    return {
      id: apiTask.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
      title: apiTask.name || 'Unnamed Task',
      description: description,
      order: typeof apiTask.order === 'number' ? apiTask.order : 0
    };
  }, []);

  // Toggle sample data
  const toggleSampleData = () => {
    if (useSampleData) {
      // If already using sample data, fetch real data
      fetchProjectData();
    } else {
      // Switch to sample data
      setProject(SAMPLE_PROJECT);
      setStatuses(SAMPLE_STATUSES);
      setUseSampleData(true);
      setError(null);
    }
  };

  // Fetch project data
  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      setUseSampleData(false);
      
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      
      // Fetch project data
      console.log(`Fetching project data from: ${backendURL}/api/v1/project/project/${projectId}/`);
      const projectData: ApiProject = await apiGet(`${backendURL}/api/v1/project/project/${projectId}/`);
      console.log('Project data response:', projectData);
      setApiResponse(prevState => ({ ...prevState, project: projectData }));
      
      if (!projectData || !projectData.id) {
        throw new Error('Invalid project data received');
      }
      
      setProject({
        id: projectData.id,
        title: projectData.name || 'Untitled Project'
      });
      
      // Fetch statuses data
      console.log(`Fetching status data from: ${backendURL}/api/v1/project/status/`);
      const statusesData: ApiStatus[] = await apiGet(`${backendURL}/api/v1/project/status/`);
      console.log('Status data response:', statusesData);
      setApiResponse(prevState => ({ ...prevState, statuses: statusesData }));
      
      // Check if we have valid status data
      if (!Array.isArray(statusesData) || statusesData.length === 0) {
        console.warn('No status data found, using sample data');
        setUseSampleData(true);
        setProject(SAMPLE_PROJECT);
        setStatuses(SAMPLE_STATUSES);
        setError(null);
        setIsLoading(false);
        return;
      }
      
      // Initialize transformed statuses with empty cards arrays
      const transformedStatuses: Status[] = statusesData.map(status => ({
        id: status.id,
        title: status.name || 'Unnamed Status',
        order: typeof status.order === 'number' ? status.order : 0,
        cards: [] as Task[]
      }));
      
      // Fetch all tasks for this project using the new endpoint
      try {
        console.log(`Fetching all tasks for project from: ${backendURL}/api/v1/project/project/${projectId}/tasks/`);
        const tasksResponse = await apiGet(`${backendURL}/api/v1/project/project/${projectId}/tasks/`);
        console.log('Project tasks response:', tasksResponse);
        
        // Check if we have tasks and distribute them to their statuses
        // The API might return {tasks: [...]} or just an array directly
        const tasksData = Array.isArray(tasksResponse) ? tasksResponse : 
                        (tasksResponse && Array.isArray(tasksResponse.tasks)) ? tasksResponse.tasks : [];
        
        // Save full response for debugging
        setApiResponse(prevState => ({ 
          ...prevState, 
          tasks: tasksResponse,
          tasksSummary: {
            totalTaskCount: tasksData.length,
            tasksByStatus: countTasksByStatus(tasksData)
          }
        }));
        
        if (tasksData.length > 0) {
          tasksData.forEach(task => {
            if (task.status) {
              const statusIndex = transformedStatuses.findIndex(s => s.id === task.status);
              if (statusIndex !== -1) {
                transformedStatuses[statusIndex].cards.push(transformApiTask(task));
              }
            }
          });
        }
      } catch (err) {
        console.warn('Error fetching tasks from project tasks endpoint:', err);
        
        // Fallback: If the dedicated tasks endpoint fails, try the traditional approach
        // Only try this if we don't have tasks yet
        if (transformedStatuses.every(status => status.cards.length === 0)) {
          try {
            console.log(`Falling back to global tasks endpoint: ${backendURL}/api/v1/project/task/`);
            const tasksData: ApiTask[] = await apiGet(`${backendURL}/api/v1/project/task/`);
            console.log('Global tasks fallback response:', tasksData);
            
            if (Array.isArray(tasksData) && tasksData.length > 0) {
              // Add tasks to their respective statuses
              tasksData.forEach(task => {
                if (task.status) {
                  const statusIndex = transformedStatuses.findIndex(s => s.id === task.status);
                  if (statusIndex !== -1) {
                    transformedStatuses[statusIndex].cards.push(transformApiTask(task));
                  }
                }
              });
            }
          } catch (err) {
            console.warn('Error fetching tasks from fallback endpoint, continuing with empty tasks:', err);
          }
        }
      }
      
      // Sort statuses by order
      const sortedStatuses = transformedStatuses.sort((a, b) => a.order - b.order);
      
      // Sort cards within each status by order
      sortedStatuses.forEach(status => {
        status.cards.sort((a, b) => a.order - b.order);
      });
      
      console.log('Final prepared statuses with tasks:', sortedStatuses);
      
      setStatuses(sortedStatuses);
      setError(null);
    } catch (err) {
      console.error('Error fetching project data:', err);
      console.log('Falling back to sample data due to error');
      setProject(SAMPLE_PROJECT);
      setStatuses(SAMPLE_STATUSES);
      setUseSampleData(true);
      setError(err instanceof Error ? err.message : 'Unknown error fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (isMounted) {
      fetchProjectData();
    }
  }, [projectId, isMounted]);

  // Handle drag and drop for tasks and statuses
  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, type } = result;
    
    // If no destination or dropped in the same spot, do nothing
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }
    
    // Use the ref to get the latest statuses to avoid stale state issues
    const currentStatuses = [...statusesRef.current];
    
    // If dragging a status column
    if (type === 'column') {
      // Reorder the status columns
      const [movedStatus] = currentStatuses.splice(source.index, 1);
      currentStatuses.splice(destination.index, 0, movedStatus);
      
      // Update order of all affected statuses
      const updatedStatuses = currentStatuses.map((status, index) => ({
        ...status,
        order: index
      }));
      
      // Update local state
      setStatuses(updatedStatuses);
      
      // Update order in backend - this would normally be a batch update
      try {
        // This is a simplified example - you might want a batch API endpoint
        const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
        
        // For simplicity, just update the moved status
        // In a real app, you might want to update all affected statuses
        await apiPost(`${backendURL}/api/v1/project/status/${movedStatus.id}/update/`, {
          order: destination.index
        });
      } catch (err) {
        console.error('Error updating status order:', err);
        // Optionally revert the UI change on error
      }
      
      return;
    }
    
    // If dragging a task
    if (type === 'task') {
      const sourceStatusIndex = currentStatuses.findIndex(s => s.id === source.droppableId);
      const destStatusIndex = currentStatuses.findIndex(s => s.id === destination.droppableId);
      
      if (sourceStatusIndex === -1 || destStatusIndex === -1) {
        console.error('Could not find source or destination status');
        return;
      }
      
      // Create references
      const sourceStatus = currentStatuses[sourceStatusIndex];
      const destStatus = currentStatuses[destStatusIndex];
      
      // Create a deep copy of the cards arrays to prevent state mutation
      const sourceCards = [...sourceStatus.cards];
      const destCards = sourceStatusIndex === destStatusIndex ? sourceCards : [...destStatus.cards];
      
      // Move the task
      const [movedTask] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, movedTask);
      
      // Update the statuses with new card arrays
      const newStatuses = [...currentStatuses];
      
      // Update source status with new cards
      newStatuses[sourceStatusIndex] = {
        ...sourceStatus,
        cards: sourceCards.map((task, index) => ({
          ...task,
          order: index
        }))
      };
      
      // If destination is different, update it too
      if (sourceStatusIndex !== destStatusIndex) {
        newStatuses[destStatusIndex] = {
          ...destStatus,
          cards: destCards.map((task, index) => ({
            ...task,
            order: index
          }))
        };
      }
      
      // Update local state
      setStatuses(newStatuses);
      
      // Update in backend
      try {
        const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
        
        // Update the task with new status and order
        await apiPost(`${backendURL}/api/v1/project/task/${movedTask.id}/update/`, {
          status: destStatus.id,
          order: destination.index
        });
        
        // In a real app, you might want to update all affected tasks to ensure order consistency
      } catch (err) {
        console.error('Error updating task:', err);
        // Optionally revert the UI change on error
      }
    }
  }, []);

  // Handle task created - add it to the appropriate status
  const handleTaskCreated = useCallback((newTask: ApiTask, statusId: string) => {
    setStatuses(currentStatuses => {
      return currentStatuses.map(status => {
        if (status.id === statusId) {
          return {
            ...status,
            cards: [...status.cards, transformApiTask(newTask)]
          };
        }
        return status;
      });
    });
  }, [transformApiTask]);

  // Handle status created - add it to the list
  const handleStatusCreated = useCallback((newStatus: ApiStatus) => {
    const transformedStatus: Status = {
      id: newStatus.id,
      title: newStatus.name || 'Unnamed Status',
      order: typeof newStatus.order === 'number' ? newStatus.order : statusesRef.current.length,
      cards: []
    };
    
    setStatuses(currentStatuses => [...currentStatuses, transformedStatus]);
  }, []);

  // Loading state
  if (!isMounted || isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-secondary rounded mb-6"></div>
          <div className="h-48 w-full bg-secondary/20 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Error state with sample data fallback
  if (error && !useSampleData) {
    return (
      <div className="p-6 text-red-500">
        <p className="mb-4">{error}</p>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            setProject(SAMPLE_PROJECT);
            setStatuses(SAMPLE_STATUSES);
            setUseSampleData(true);
            setError(null);
          }}
        >
          Load Sample Data
        </button>
      </div>
    );
  }
  
  if (!project) return <div className="p-6">Project not found</div>;

  // Check if we have any statuses to render
  const hasStatuses = statuses.length > 0;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <button 
          onClick={toggleSampleData}
          className={`px-4 py-2 rounded-lg text-white ${useSampleData ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'}`}
        >
          {useSampleData ? 'Try Fetching Real Data' : 'Use Sample Data'}
        </button>
      </div>
      
      {useSampleData && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="font-bold">Using Sample Data</p>
          <p>The application is currently using sample data because:</p>
          <ul className="list-disc ml-5 mt-2">
            <li>API data was not available or</li>
            <li>There was an error loading data from the server</li>
          </ul>
        </div>
      )}
      
      {/* API Debug Information */}
      {!useSampleData && apiResponse && (
        <details className="mb-4 bg-gray-100 p-2 rounded-lg">
          <summary className="font-medium cursor-pointer">API Debug Information</summary>
          <div className="mt-2 p-2 bg-white rounded text-xs">
            <pre className="whitespace-pre-wrap overflow-auto max-h-64">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        </details>
      )}
      
      {hasStatuses ? (
        <DndErrorBoundary>
          <StableDndContext onDragEnd={handleDragEnd}>
            <div className="flex overflow-x-auto p-4 space-x-4">
              {statuses.map((status, index) => (
                <MemoizedColumn
                  key={status.id}
                  status={status}
                  index={index}
                  onTaskCreated={handleTaskCreated}
                />
              ))}
              
              <CreateStatusForm projectId={projectId} onStatusCreated={handleStatusCreated} />
            </div>
          </StableDndContext>
        </DndErrorBoundary>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-secondary/10 rounded-lg">
          <p className="text-text-secondary mb-4">No statuses found for this project.</p>
          <CreateStatusForm projectId={projectId} onStatusCreated={handleStatusCreated} />
        </div>
      )}
    </div>
  );
} 