import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import CardModal from './CardModal';

interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
}

interface CardItemProps {
  card: Card;
  index: number;
}

export default function CardItem({ card, index }: CardItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="bg-white p-3 rounded shadow mb-2 cursor-pointer hover:bg-gray-50"
            onClick={() => setIsModalOpen(true)}
          >
            <h4 className="font-medium">{card.title}</h4>
            {card.description && (
              <p className="text-gray-500 text-sm mt-1 truncate">
                {card.description}
              </p>
            )}
          </div>
        )}
      </Draggable>
      
      {isModalOpen && (
        <CardModal
          card={card}
          onClose={() => setIsModalOpen(false)}
          onUpdate={(updatedCard) => {
            // Card update should be handled by parent component
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
}