import React, { useState } from 'react';
import { apiPost, apiDelete } from '@/providers/apiRequest';

interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
}

interface CardModalProps {
  card: Card;
  onClose: () => void;
  onUpdate: (updatedCard: Card) => void;
}

export default function CardModal({ card, onClose, onUpdate }: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    
    setIsLoading(true);
    
    try {
      const updatedCard = await apiPost(`/api/v1/cards/${card.id}/`, {
        title: title.trim(),
        description: description.trim() || null
      });
      
      onUpdate(updatedCard);
    } catch (err) {
      console.error('Error updating card:', err);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    
    setIsLoading(true);
    
    try {
      await apiDelete(`/api/v1/cards/${card.id}/`);
      onClose();
    } catch (err) {
      console.error('Error deleting card:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-4 max-h-[90vh] overflow-y-auto">
        {isEditing ? (
          <div className="mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded mb-2"
              placeholder="Enter card title..."
              autoFocus
            />
            
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded h-32"
              placeholder="Add a more detailed description..."
            />
            
            <div className="flex mt-2">
              <button
                onClick={handleSave}
                disabled={isLoading || !title.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
              
              <button
                onClick={() => {
                  setTitle(card.title);
                  setDescription(card.description || '');
                  setIsEditing(false);
                }}
                className="border px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold mb-2">{card.title}</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-500 hover:text-blue-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            
            {card.description ? (
              <p className="text-gray-700 whitespace-pre-line">{card.description}</p>
            ) : (
              <p className="text-gray-400 italic">No description</p>
            )}
          </div>
        )}
        
        <div className="flex justify-between mt-4 pt-4 border-t">
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
          >
            Delete Card
          </button>
          
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}