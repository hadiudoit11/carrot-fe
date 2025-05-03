import React, { useState } from 'react';
import { apiPost } from '@/providers/apiRequest';
import StatusTable from './StatusTable';

interface CreateProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (newProject: any) => void;
}

// Default status types that can be customized
export const DEFAULT_STATUSES = [
  { name: 'To Do', type: 'todo', color: '#3498db' },
  { name: 'In Progress', type: 'in_progress', color: '#f39c12' },
  { name: 'Done', type: 'done', color: '#2ecc71' }
];

export default function CreateProjectForm({ isOpen, onClose, onProjectCreated }: CreateProjectFormProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statuses, setStatuses] = useState([...DEFAULT_STATUSES]);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  if (!isOpen) return null;
  
  const handleStatusesChange = (updatedStatuses: typeof DEFAULT_STATUSES) => {
    setStatuses(updatedStatuses);
  };
  
  // Create project statuses after project creation
  const createProjectStatuses = async (projectId: string) => {
    const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
    const statusPromises = statuses.map(async (status, index) => {
      try {
        const newStatus = await apiPost(`${backendURL}/api/v1/project/status/create/`, {
          name: status.name,
          type: status.type,
          color: status.color,
          project: projectId,
          order: index
        });
        return newStatus;
      } catch (err) {
        console.error(`Error creating status ${status.name}:`, err);
        return null;
      }
    });
    
    try {
      await Promise.all(statusPromises);
    } catch (err) {
      console.error('Error creating statuses:', err);
    }
  };
  
  const nextStep = () => {
    if (step === 1 && !name.trim()) return;
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Create the project
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      const newProject = await apiPost(`${backendURL}/api/v1/project/project/create/`, {
        name: name.trim(),
        description: description.trim() || null
      });
      
      setProjectId(newProject.id);
      
      // If we have a project ID, create the statuses
      if (newProject.id) {
        await createProjectStatuses(newProject.id);
      }
      
      onProjectCreated(newProject);
      resetForm();
    } catch (err) {
      console.error('Error creating project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setStatuses([...DEFAULT_STATUSES]);
    setStep(1);
    setProjectId(null);
    setIsSubmitting(false);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-tertiary rounded-lg w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto border-2 border-accent shadow-accent-offset">
        <h2 className="text-xl font-bold mb-4 text-text-light">Create New Project</h2>
        
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
            <div className="mb-4">
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-primary text-text-light w-full px-3 py-2 border border-accent rounded focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Enter project name"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-primary text-text-light w-full px-3 py-2 border border-accent rounded focus:outline-none focus:ring-2 focus:ring-accent h-32"
                placeholder="Enter project description (optional)"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-secondary hover:bg-secondary/80 px-4 py-2 rounded text-text-light border border-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="bg-accent hover:bg-accent/80 text-primary px-4 py-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </form>
        )}
        
        {step === 2 && (
          <div>
            <p className="text-text-secondary mb-4">
              Configure status types for your project tasks. You can add, rename, or remove statuses.
            </p>
            
            <StatusTable 
              defaultStatuses={DEFAULT_STATUSES}
              onChange={handleStatusesChange}
            />
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={prevStep}
                className="bg-secondary hover:bg-secondary/80 px-4 py-2 rounded text-text-light border border-accent"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-accent hover:bg-accent/80 text-primary px-4 py-2 rounded disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 