'use client';

import React, { useState } from 'react';
import { apiPost } from '@/providers/apiRequest';

interface CreateTaskFormProps {
  statusId: string;
  onTaskCreated: (newTask: any, statusId: string) => void;
  onCancel: () => void;
}

export default function CreateTaskForm({ statusId, onTaskCreated, onCancel }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setIsLoading(true);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      const newTask = await apiPost(`${backendURL}/api/v1/project/task/create/`, {
        name: title.trim(),
        status: statusId
      });
      
      onTaskCreated(newTask, statusId);
      setTitle('');
    } catch (err) {
      console.error('Error creating task:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-2">
      <form onSubmit={handleSubmit}>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for this task..."
          className="w-full p-2 rounded mb-2 min-h-[60px]"
          autoFocus
        />
        
        <div className="flex items-center">
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2 disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : 'Add Task'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
} 