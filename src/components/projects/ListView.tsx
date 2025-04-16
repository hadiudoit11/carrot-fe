import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import CardItem from '../card/CardItem';
import CreateCardForm from '../card/CreateCardForm';
import { apiPost, apiDelete } from '@/providers/apiRequest';

interface List {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
}

interface ListViewProps {
  list: List;
  index: number;
}

export default function ListView({ list, index }: ListViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showAddCard, setShowAddCard] = useState(false);

  const handleTitleChange = async () => {
    if (title.trim() === '') return;
    if (title === list.title) {
      setIsEditing(false);
      return;
    }

    try {
      await apiPost(`/api/v1/lists/${list.id}/`, {
        title: title.trim()
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating list title:', err);
      setTitle(list.title); // Revert on error
    }
  };

  const handleDeleteList = async () => {
    if (!confirm('Are you sure you want to delete this list and all its cards?')) return;
    
    try {
      await apiDelete(`/api/v1/lists/${list.id}/`);
      // List removal should be handled by parent component
    } catch (err) {
      console.error('Error deleting list:', err);
    }
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-gray-100 rounded-lg w-72 flex-shrink-0 mr-3"
        >
          <div 
            className="p-2 flex justify-between items-center"
            {...provided.dragHandleProps}
          >
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleChange}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleChange()}
                className="bg-white p-1 rounded w-full"
                autoFocus
              />
            ) : (
              <h3 
                className="font-medium px-1 py-1 cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                {list.title}
              </h3>
            )}
            
            <button 
              onClick={handleDeleteList}
              className="text-gray-500 hover:text-red-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <Droppable droppableId={list.id} type="card">
            {(provided) => (
              <div 
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="p-2 min-h-[50px]"
              >
                {list.cards.map((card, cardIndex) => (
                  <CardItem 
                    key={card.id} 
                    card={card} 
                    index={cardIndex} 
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          
          {showAddCard ? (
            <CreateCardForm 
              listId={list.id}
              onCardCreated={(newCard) => {
                // Card addition should be handled by parent component
                setShowAddCard(false);
              }}
              onCancel={() => setShowAddCard(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddCard(true)}
              className="w-full text-left p-2 text-gray-500 hover:bg-gray-200 rounded-b-lg"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add a card
              </span>
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
}