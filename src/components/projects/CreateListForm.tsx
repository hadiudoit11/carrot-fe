import React, { useState } from 'react';
import { apiPost } from '@/providers/apiRequest';

interface CreateListFormProps {
  boardId: string;
  onListCreated: (newList: any) => void;
}

export default function CreateListForm({ boardId, onListCreated }: CreateListFormProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setIsLoading(true);
    
    try {
      const newList = await apiPost(`/api/v1/boards/${boardId}/lists/`, {
        title: title.trim()
      });
      
      onListCreated(newList);
      setTitle('');
      setIsFormVisible(false);
    } catch (err) {
      console.error('Error creating list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isFormVisible) {
    return (
      <button
        onClick={() => setIsFormVisible(true)}
        className="bg-gray-100 hover:bg-gray-200 rounded-lg w-72 h-10 flex-shrink-0 flex items-center justify-center"
      >
        <span className="flex items-center text-gray-600">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add another list
        </span>
      </button>
    );
  }

  return (
    <div className="bg-gray-100 rounded-lg w-72 flex-shrink-0 p-2">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter list title..."
          className="w-full p-2 rounded mb-2"
          autoFocus
        />
        
        <div className="flex items-center">
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2 disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : 'Add List'}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setIsFormVisible(false);
              setTitle('');
            }}
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