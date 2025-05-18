"use client";

import React, { useEffect, useState } from 'react';
import { apiGet } from '@/providers/apiRequest';
import Link from 'next/link';
import { CalendarIcon, TrendingUpIcon, MoreVertical, PlusIcon } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";
import { 
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistance } from "date-fns";
import { UserIcon, ClockIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskList from "@/components/projects/TaskList";
import { Progress, ProgressSegment } from '@/components/sub/projects/multi-progress-bar';

interface Project {
  id: string;
  title: string;
  createdAt: string;
  description?: string;
}

interface ProjectFromAPI {
  id: string;
  name: string;
  description: string | { details: string };
  status: string | null;
  status_name: string | null;
  is_active: boolean;
  started_at: string | null;
  created_at: string;
  due_at: string | null;
  updated_at: string;
  assigned_to: string | null;
  owner: string;
  organization: string;
  task_status_counts?: { [key: string]: number };
}

// Extended interface to include task status information
interface ProjectStatusCount {
  todo: number;
  inProgress: number;
  completed: number;
  total: number;
  [key: string]: number; // Allow for dynamic status keys
}

// Extended interface to include project status information
interface ProjectItem {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  dueDate: string | null;
  statusName: string | null;
  assignedTo: string | null;
  isActive: boolean;
  statusCounts: ProjectStatusCount;
  task_status_counts?: { [key: string]: number }; // Add the raw task status counts
}

// Add props interface
interface ProjectListProps {
  isCreateFormOpen?: boolean;
  setIsCreateFormOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onProjectCreated?: (projectId: string) => void;
}

// Function to generate progress segments for a project
const getProjectStatusSegments = (project: ProjectItem): ProgressSegment[] => {
  // If no task status counts, return empty array
  if (!project.task_status_counts) {
    return [];
  }
  
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
  return segments.sort((a, b) => (b.priority || 0) - (a.priority || 0));
};

export default function ProjectList({ 
  isCreateFormOpen, 
  setIsCreateFormOpen,
  onProjectCreated
}: ProjectListProps) {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Added state for project detail sheet
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [projectDetail, setProjectDetail] = useState<ProjectFromAPI | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      
      // Get the backend URL
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      
      // Fetch all projects
      const projectsData = await apiGet(`${backendURL}/api/v1/project/project/`);
      
      if (!Array.isArray(projectsData)) {
        throw new Error('Invalid project data format');
      }
      
      // Process the projects into our ProjectItem format
      const projectItems: ProjectItem[] = projectsData.map((project: ProjectFromAPI) => {
        // Extract description text (handle both string and object formats)
        let descriptionText = '';
        if (typeof project.description === 'string') {
          descriptionText = project.description;
        } else if (project.description && typeof project.description === 'object' && 'details' in project.description) {
          descriptionText = project.description.details;
        }
        
        // Get task status counts or create a default object
        let task_status_counts: { [key: string]: number } = {};
        
        // Attempt to get task_status_counts from the API response
        if (project.hasOwnProperty('task_status_counts') && typeof project.task_status_counts === 'object') {
          task_status_counts = project.task_status_counts || {};
        }
        
        // Create status counts object for backward compatibility
        const statusName = project.status_name?.toLowerCase() || '';
        const isCompleted = statusName.includes('done') || statusName.includes('complete');
        const isInProgress = statusName.includes('progress') || statusName.includes('doing');
        
        // Calculate the total from actual task status counts if available
        const totalTasks = task_status_counts ? 
          Object.values(task_status_counts).reduce((sum: number, count: any) => sum + (count as number), 0) : 1;
          
        const statusCounts: ProjectStatusCount = {
          todo: isInProgress || isCompleted ? 0 : 1,
          inProgress: isInProgress ? 1 : 0,
          completed: isCompleted ? 1 : 0,
          total: totalTasks || 1, // Ensure total is at least 1 to avoid divide by zero
          ...task_status_counts, // Include all status counts from API
        };
        
        return {
          id: project.id,
          title: project.name,
          description: descriptionText,
          createdAt: project.created_at,
          dueDate: project.due_at,
          statusName: project.status_name,
          assignedTo: project.assigned_to,
          isActive: project.is_active,
          statusCounts,
          task_status_counts: project.task_status_counts, // Store the raw task status counts
        };
      });
      
      setProjects(projectItems);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set';
    
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Calculate progress percentage for a project
  const calculateProgress = (project: ProjectItem) => {
    // If we have task_status_counts, use it to calculate more accurate progress
    if (project.task_status_counts && Object.keys(project.task_status_counts).length > 0) {
      const counts = project.task_status_counts;
      const totalTasks = Object.values(counts).reduce((sum, count) => sum + count, 0);
      
      if (totalTasks === 0) return 0;
      
      // Calculate completed tasks (status contains 'done' or 'completed')
      const completedTasks = Object.entries(counts)
        .filter(([status, _]) => 
          status.toLowerCase().includes('done') || 
          status.toLowerCase().includes('completed'))
        .reduce((sum, [_, count]) => sum + count, 0);
      
      return Math.round((completedTasks / totalTasks) * 100);
    }
    
    // Fallback to the original calculation
    if (!project.statusCounts || project.statusCounts.total === 0) return 0;
    return Math.round((project.statusCounts.completed / project.statusCounts.total) * 100);
  };
  
  // Get status badge variant based on status name
  const getStatusBadgeVariant = (statusName: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
    if (!statusName) return 'outline';
    
    const status = statusName.toLowerCase();
    if (status.includes('done') || status.includes('complete')) {
      return 'default'; // Use default for success (green)
    } else if (status.includes('progress')) {
      return 'secondary';
    } else if (status.includes('hold') || status.includes('warning')) {
      return 'secondary'; // Use secondary for warning
    } else if (status.includes('cancel') || status.includes('error')) {
      return 'destructive';
    }
    
    return 'outline';
  };

  // Fetch project details when the sheet is opened
  const fetchProjectDetail = async (projectId: string) => {
    if (!projectId) return;
    
    setIsDetailLoading(true);
    setDetailError(null);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      const data = await apiGet(`${backendURL}/api/v1/project/project/${projectId}/`);
      setProjectDetail(data);
    } catch (err) {
      console.error('Error fetching project details:', err);
      setDetailError('Failed to load project details. Please try again.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Handle opening/closing project detail sheet
  const handleDetailOpenChange = (open: boolean) => {
    setIsDetailOpen(open);
    if (!open) {
      // Clear data when closing
      setSelectedProject(null);
      setProjectDetail(null);
    }
  };

  // Open project detail with the selected project
  const openProjectDetail = (projectId: string) => {
    setSelectedProject(projectId);
    setIsDetailOpen(true);
    fetchProjectDetail(projectId);
  };

  // This function is now using the parent's state handler
  const handleProjectCreated = (projectId: string) => {
    // Call the parent's handler if provided
    if (onProjectCreated) {
      onProjectCreated(projectId);
    }
    
    // Refresh the projects list
    fetchProjects();
  };

  return (
    <>
      {isLoading && (
        <div className="text-center py-12 px-4 lg:px-6">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-muted rounded-full mb-4"></div>
            <div className="h-4 w-24 bg-muted rounded mb-2"></div>
            <div className="h-3 w-32 bg-muted rounded"></div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="px-4 lg:px-6 py-4">
          <div className="bg-destructive/10 text-destructive rounded p-4">
            {error}
            <Button variant="link" className="ml-2 p-0 h-auto" onClick={fetchProjects}>Retry</Button>
          </div>
        </div>
      )}
      
      {!isLoading && !error && (
        <>
          <div className="flex justify-between items-center mb-4 px-4 lg:px-6">
            <h2 className="text-xl font-medium">Project List</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-6">
            {Array.isArray(projects) && projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} className="block">
                  <Card className="overflow-hidden group">
                    <div 
                      className="cursor-pointer"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      <CardHeader className="relative">
                        <CardDescription className="text-xs text-muted-foreground">
                          {formatDate(project.createdAt)}
                        </CardDescription>
                        <CardTitle className="text-base font-semibold line-clamp-1">
                          {project.title}
                        </CardTitle>
                        <div className="absolute right-4 top-4">
                          <Badge variant={getStatusBadgeVariant(project.statusName)}>
                            {project.statusName || "No Status"}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {project.description || "No description provided."}
                        </p>
                        
                        {/* Replace the basic progress bar with the multi-segment progress bar */}
                        <Progress 
                          segments={getProjectStatusSegments(project)}
                          className="h-2 mb-2"
                        />
                      </CardContent>
                    </div>
                    
                    <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                      <div className="flex justify-between items-center w-full">
                        <div className="line-clamp-1 flex gap-1 font-medium">
                          <span className="text-muted-foreground">Due:</span>
                          <span>{formatDate(project.dueDate)}</span>
                        </div>
                        
                        <div className="flex gap-1 items-center">
                          <div className="flex items-center gap-1 mr-2">
                            <TrendingUpIcon className="size-3" />
                            <span>{calculateProgress(project)}% Complete</span>
                          </div>
                          
                          <div
                            className="rounded-full p-1 hover:bg-muted cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              openProjectDetail(project.id);
                            }}
                          >
                            <MoreVertical className="size-3" />
                          </div>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 bg-muted/20 rounded-lg">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-lg mb-4">No projects found</p>
                <Button onClick={() => setIsCreateFormOpen && setIsCreateFormOpen(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Project Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={handleDetailOpenChange}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{projectDetail?.name || "Project Details"}</SheetTitle>
            <SheetDescription>
              Project information and tasks
            </SheetDescription>
          </SheetHeader>

          {isDetailLoading ? (
            <div className="py-6 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : detailError ? (
            <div className="py-6">
              <p className="text-destructive">{detailError}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => selectedProject && fetchProjectDetail(selectedProject)}
              >
                Retry
              </Button>
            </div>
          ) : projectDetail && (
            <Tabs defaultValue="details" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4">
                <div className="grid gap-4 py-4">
                  {/* Status */}
                  <div className="flex justify-between items-center">
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge variant={getStatusBadgeVariant(projectDetail.status_name)}>
                      {projectDetail.status_name || "No Status"}
                    </Badge>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Description</Label>
                    <div className="rounded-md bg-muted p-3 text-sm">
                      {typeof projectDetail.description === 'string' 
                        ? projectDetail.description 
                        : projectDetail.description?.details || 'No description provided'}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    {projectDetail.created_at && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" /> Created
                        </Label>
                        <p className="text-sm">
                          {format(new Date(projectDetail.created_at), 'PP')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistance(new Date(projectDetail.created_at), new Date(), { addSuffix: true })}
                        </p>
                      </div>
                    )}

                    {projectDetail.due_at && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" /> Due
                        </Label>
                        <p className="text-sm">
                          {format(new Date(projectDetail.due_at), 'PP')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistance(new Date(projectDetail.due_at), new Date(), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-4">
                <TaskList 
                  projectId={projectDetail.id} 
                  limit={6}
                  title="Project Tasks"
                  onCreateTask={() => router.push(`/projects/${projectDetail.id}?tab=tasks&action=create`)}
                  showHeader={true}
                />
              </TabsContent>
            </Tabs>
          )}

          <SheetFooter className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button 
              className="w-full" 
              onClick={() => projectDetail && router.push(`/projects/${projectDetail.id}`)}
            >
              View Full Project
            </Button>
            <SheetClose asChild>
              <Button variant="outline" type="button" className="w-full">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
} 