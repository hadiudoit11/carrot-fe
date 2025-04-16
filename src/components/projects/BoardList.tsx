import React, { useEffect, useState } from 'react';
import { apiGet } from '@/providers/apiRequest';
import Link from 'next/link';
import CreateBoardForm from './CreateBoardForm';

interface Board {
  id: string;
  title: string;
  createdAt: string;
}

export default function BoardList() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);

  const fetchBoards = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet('/api/v1/boards/');
      setBoards(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching boards:', err);
      setError('Failed to load boards');
      setBoards([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleBoardCreated = (newBoard: Board) => {
    setBoards([...boards, newBoard]);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Boards</h1>
      
      {isLoading && <p className="text-gray-500">Loading boards...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.isArray(boards) && boards.length > 0 ? (
          boards.map((board) => (
            <Link href={`/projects/board/${board.id}`} key={board.id}>
              <div className="bg-white hover:bg-gray-50 border rounded-lg p-4 h-32 flex flex-col cursor-pointer transition-colors">
                <h3 className="font-medium text-lg mb-2 truncate">{board.title}</h3>
                <p className="text-gray-500 text-sm mt-auto">
                  Created: {new Date(board.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))
        ) : !isLoading && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No boards found. Create your first board to get started.
          </div>
        )}
        
        <button 
          onClick={() => setIsCreateBoardOpen(true)}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-500 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Board
          </span>
        </button>
      </div>
      
      <CreateBoardForm 
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
        onBoardCreated={handleBoardCreated}
      />
    </div>
  );
}