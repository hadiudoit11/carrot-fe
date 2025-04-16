import React, { useState } from 'react';
import { apiPost } from '@/providers/apiRequest';
import UserSelector from '@/components/sub/forms/user-selector';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface CreateBoardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardCreated: (newBoard: any) => void;
}

export default function CreateBoardForm({ isOpen, onClose, onBoardCreated }: CreateBoardFormProps) {
  const [title, setTitle] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Board title is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newBoard = await apiPost('/api/v1/boards/', {
        title: title.trim(),
        users: selectedUserIds
      });
      
      onBoardCreated(newBoard);
      setTitle('');
      setSelectedUserIds([]);
      onClose();
    } catch (err) {
      console.error('Error creating board:', err);
      setError('Failed to create board. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAdd = (user: User) => {
    setSelectedUserIds([...selectedUserIds, user.id]);
  };

  const handleUserRemove = (userId: string) => {
    setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Board</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 mb-2">Board Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter board title..."
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <h3 className="block text-gray-700 mb-2">Board Members</h3>
            <UserSelector
              selectedUserIds={selectedUserIds}
              onUserAdd={handleUserAdd}
              onUserRemove={handleUserRemove}
              placeholder="Search for users to add to this board..."
            />
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded mr-2"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
