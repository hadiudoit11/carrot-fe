'use client';

import React, { useState } from 'react';
import { apiPost } from '@/providers/apiRequest';

interface CreateStatusFormProps {
  projectId: string;
  onStatusCreated: (newStatus: any) => void;
}

export default function CreateStatusForm({ projectId, onStatusCreated }: CreateStatusFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setIsLoading(true);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      const newStatus = await apiPost(`${backendURL}/api/v1/project/status/create/`, {
        name: title.trim(),
        project: projectId
      });
      
      onStatusCreated(newStatus);
      setTitle('');
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error creating status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isFormOpen) {
    return (
      <div className="bg-secondary bg-opacity-50 w-72 h-12 rounded-lg flex items-center justify-center cursor-pointer hover:bg-opacity-80"
           onClick={() => setIsFormOpen(true)}>
        <span className="flex items-center text-text-secondary">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add another status
        </span>
      </div>
    );
  }

  return (
    <div className="bg-secondary w-72 rounded-lg p-2">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter status title..."
          className="w-full p-2 rounded mb-2 bg-tertiary"
          autoFocus
        />
        
        <div className="flex items-center">
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="bg-accent hover:bg-accent/80 text-primary px-3 py-1 rounded mr-2 disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : 'Add Status'}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setIsFormOpen(false);
              setTitle('');
            }}
            className="text-text-secondary hover:text-text-light"
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