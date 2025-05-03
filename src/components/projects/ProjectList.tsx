"use client";

import React, { useEffect, useState } from 'react';
import { apiGet } from '@/providers/apiRequest';
import Link from 'next/link';
import CreateProjectForm from './CreateProjectForm';
import { PlusIcon, CalendarIcon, ClockIcon, UserCircleIcon } from '@heroicons/react/24/outline';

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
}

// Extended interface to include task status information
interface ProjectStatusCount {
  todo: number;
  inProgress: number;
  completed: number;
  total: number;
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
}

export default function ProjectList() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

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
        
        // Create status counts based on project status
        const statusName = project.status_name?.toLowerCase() || '';
        const isCompleted = statusName.includes('done') || statusName.includes('complete');
        const isInProgress = statusName.includes('progress') || statusName.includes('doing');
        
        // Create status counts object
        const statusCounts: ProjectStatusCount = {
          todo: isInProgress || isCompleted ? 0 : 1,
          inProgress: isInProgress ? 1 : 0,
          completed: isCompleted ? 1 : 0,
          total: 1
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
          statusCounts
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

  const handleProjectCreated = (newProject: Project) => {
    // Refresh the entire project list to ensure we have the latest data
    fetchProjects();
  };

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
  const calculateProgress = (statusCounts: ProjectStatusCount) => {
    if (!statusCounts || statusCounts.total === 0) return 0;
    return Math.round((statusCounts.completed / statusCounts.total) * 100);
  };
  
  // Get status color for a project status
  const getStatusColor = (statusName: string | null | undefined) => {
    if (!statusName) return 'bg-gray-200 text-gray-800';
    
    const status = statusName.toLowerCase();
    if (status.includes('done') || status.includes('complete')) {
      return 'bg-status-success/20 text-status-success';
    } else if (status.includes('progress')) {
      return 'bg-accent/20 text-accent';
    } else if (status.includes('hold')) {
      return 'bg-status-warning/20 text-status-warning';
    } else if (status.includes('cancel')) {
      return 'bg-status-error/20 text-status-error';
    }
    
    return 'bg-status-info/20 text-status-info';
  };

  return (
    <div className="p-6 font-secondary">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-light font-primary">Your Projects</h1>
        <button 
          onClick={() => setIsCreateProjectOpen(true)}
          className="form-button form-button-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          New Project
        </button>
      </div>
      
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-gray-300 rounded-full mb-4"></div>
            <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-form-state-error bg-opacity-10 border border-form-state-error text-form-state-error px-4 py-3 rounded mb-4">
          {error}
          <button onClick={fetchProjects} className="ml-2 underline">Retry</button>
        </div>
      )}
      
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.isArray(projects) && projects.length > 0 ? (
            projects.map((project, index) => (
              <Link href={`/projects/${project.id}`} key={project.id} className="block">
                <div className={`bg-bg-card hover:bg-opacity-90 border-2 border-accent rounded-lg p-5 h-48 flex flex-col transition-all hover:shadow-accent-offset ${getRadialBlurClass(index)}`}>
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg truncate text-text-secondary font-primary">
                        {project.title}
                      </h3>
                      {project.statusName && (
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.statusName)}`}>
                          {project.statusName}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-text-secondary text-sm mb-2 line-clamp-2 flex-grow">
                      {project.description || "No description provided."}
                    </div>
                    
                    {/* Project status visualization */}
                    <div className="mt-auto">
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1.5">
                        <div 
                          className="bg-accent h-2.5 rounded-full" 
                          style={{ width: `${calculateProgress(project.statusCounts)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex flex-wrap justify-between items-center text-xs mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-text-secondary mr-2">Due:</span>
                          <span className="text-text-light">{formatDate(project.dueDate)}</span>
                        </div>
                        
                        <div className="flex items-center text-text-secondary">
                          <ClockIcon className="h-3.5 w-3.5 mr-1" />
                          <span>{formatDate(project.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center py-12 bg-secondary rounded-lg border-2 border-accent">
              <CalendarIcon className="h-12 w-12 text-primary mb-3" />
              <p className="text-primary text-lg mb-4">
                No projects found
              </p>
              <button 
                onClick={() => setIsCreateProjectOpen(true)}
                className="bg-accent hover:bg-accent/80 text-primary px-4 py-2 rounded-lg flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Create your first project
              </button>
            </div>
          )}
        </div>
      )}
      
      {isCreateProjectOpen && (
        <CreateProjectForm 
          isOpen={isCreateProjectOpen}
          onClose={() => setIsCreateProjectOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}

// Helper function to get different radial blur classes
function getRadialBlurClass(index: number): string {
  const positions = ['tl', 'tr', 'br', 'bl'];
  const colorTypes = ['primary', 'accent', 'secondary']; 
  
  const positionIndex = index % positions.length;
  const colorIndex = Math.floor(index / positions.length) % colorTypes.length;
  
  const position = positions[positionIndex];
  const colorType = colorTypes[colorIndex];
  
  return colorType === 'primary' 
    ? `radial-blur-${position}` 
    : `radial-blur-${position} radial-blur-${colorType}-${position}`;
} 