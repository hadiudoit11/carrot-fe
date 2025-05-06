import React, { useState, useEffect, useCallback } from 'react';
import { apiGet } from '@/providers/apiRequest';
import TaskCard from './TaskCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle, PackageOpen, RefreshCw } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  description: string | { details: string };
  status: string;
  status_name: string;
  is_active: boolean;
  started_at: string | null;
  created_at: string;
  updated_at: string;
  due_at: string | null;
  assigned_to: string | null;
  assigned_to_name: string | null;
  owner_name: string | null;
  project: string;
}

interface TaskListProps {
  projectId?: string;
  limit?: number;
  title?: string;
  showHeader?: boolean;
  onCreateTask?: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  projectId,
  limit = 4,
  title = 'Tasks',
  showHeader = true,
  onCreateTask,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  
  // Create a memoized fetchTasks function to avoid recreating it on each render
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      let endpoint = `${backendURL}/api/v1/project/task/`;
      
      // If projectId is provided, fetch tasks for that specific project
      if (projectId) {
        endpoint = `${backendURL}/api/v1/project/project/${projectId}/tasks/`;
      }
      
      console.log(`Fetching tasks from: ${endpoint}`);
      const data = await apiGet(endpoint);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from API');
      }
      
      console.log(`Fetched ${data.length} tasks`);
      
      // Apply the limit if specified
      const limitedTasks = limit > 0 ? data.slice(0, limit) : data;
      setTasks(limitedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, limit]);
  
  // Fetch tasks when the component mounts, projectId changes, or refresh is triggered
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshKey]);
  
  // Handle task update by refreshing the list
  const handleTaskUpdated = () => {
    // Use refreshKey to trigger a re-fetch
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleTaskUpdated}
              className="h-6 w-6"
              title="Refresh tasks"
              aria-label="Refresh tasks"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          {onCreateTask && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onCreateTask}
              className="gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              New Task
            </Button>
          )}
        </div>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(Math.min(4, limit))].map((_, index) => (
            <div key={index} className="h-32">
              <Skeleton className="h-full w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/10 text-destructive">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={fetchTasks}
            size="sm"
          >
            Retry
          </Button>
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.name}
              description={task.description}
              status={task.status}
              statusName={task.status_name}
              dueDate={task.due_at}
              assignedToName={task.assigned_to_name}
              createdAt={task.created_at}
              onTaskUpdated={handleTaskUpdated}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
          <PackageOpen className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-4">No tasks found</p>
          {onCreateTask && (
            <Button onClick={onCreateTask} size="sm">
              Create your first task
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList; 