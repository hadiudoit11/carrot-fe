'use client';

import React, { useState } from 'react';
import { apiPost, apiDelete } from '@/providers/apiRequest';

interface Task {
  id: string;
  title: string;
  description?: string;
  order: number;
}

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
}

export default function TaskModal({ task, onClose, onUpdate }: TaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    
    setIsLoading(true);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      const updatedTask = await apiPost(`${backendURL}/api/v1/project/task/${task.id}/update/`, {
        name: title.trim(),
        description: description.trim() || null
      });
      
      onUpdate(updatedTask);
    } catch (err) {
      console.error('Error updating task:', err);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setIsLoading(true);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      await apiDelete(`${backendURL}/api/v1/project/task/${task.id}/`);
      onClose();
    } catch (err) {
      console.error('Error deleting task:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-tertiary rounded-lg w-full max-w-md p-4 max-h-[90vh] overflow-y-auto border-2 border-accent shadow-accent-offset">
        {isEditing ? (
          <div className="mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-accent rounded mb-2 bg-primary text-text-light"
              placeholder="Enter task title..."
              autoFocus
            />
            
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-accent rounded h-32 bg-primary text-text-light"
              placeholder="Add a more detailed description..."
            />
            
            <div className="flex mt-2">
              <button
                onClick={handleSave}
                disabled={isLoading || !title.trim()}
                className="bg-accent hover:bg-accent/80 text-primary px-3 py-1 rounded mr-2 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
              
              <button
                onClick={() => {
                  setTitle(task.title);
                  setDescription(task.description || '');
                  setIsEditing(false);
                }}
                className="border border-accent px-3 py-1 rounded text-text-light hover:text-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold mb-2 text-text-light">{task.title}</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="text-text-secondary hover:text-accent"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            
            {task.description ? (
              <p className="text-text-secondary whitespace-pre-line">{task.description}</p>
            ) : (
              <p className="text-text-secondary/50 italic">No description</p>
            )}
          </div>
        )}
        
        <div className="flex justify-between mt-4 pt-4 border-t border-accent">
          <button
            onClick={handleDelete}
            className="text-status-error hover:text-status-error/80"
          >
            Delete Task
          </button>
          
          <button
            onClick={onClose}
            className="bg-secondary hover:bg-secondary/80 px-3 py-1 rounded text-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 