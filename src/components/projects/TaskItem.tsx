'use client';

import React, { useState } from 'react';
import { SafeDraggable } from '../SafeDndComponents';
import TaskModal from './TaskModal';

interface Task {
  id: string;
  title: string;
  description?: string;
  order: number;
}

interface TaskItemProps {
  task: Task;
  index: number;
}

export default function TaskItem({ task, index }: TaskItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragError, setDragError] = useState(false);

  const renderDraggableTask = () => {
    if (dragError) {
      // Fallback UI if draggable fails
      return (
        <div className="bg-tertiary p-3 rounded shadow-accent-offset border border-accent mb-2 cursor-not-allowed opacity-70">
          <h4 className="font-medium text-text-light">{task.title}</h4>
          {task.description && (
            <p className="text-text-secondary text-sm mt-1 truncate">
              {task.description}
            </p>
          )}
        </div>
      );
    }

    try {
      return (
        <SafeDraggable draggableId={task.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="bg-tertiary p-3 rounded shadow-accent-offset border border-accent mb-2 cursor-pointer hover:bg-accent hover:bg-opacity-10"
              onClick={() => setIsModalOpen(true)}
            >
              <h4 className="font-medium text-text-light">{task.title}</h4>
              {task.description && (
                <p className="text-text-secondary text-sm mt-1 truncate">
                  {task.description}
                </p>
              )}
            </div>
          )}
        </SafeDraggable>
      );
    } catch (error) {
      console.error('Error rendering Draggable task:', error);
      setDragError(true);
      return (
        <div className="bg-tertiary p-3 rounded shadow-accent-offset border border-accent mb-2 cursor-not-allowed opacity-70">
          <h4 className="font-medium text-text-light">{task.title}</h4>
          {task.description && (
            <p className="text-text-secondary text-sm mt-1 truncate">
              {task.description}
            </p>
          )}
          <p className="text-red-500 text-xs mt-1">Error: Task cannot be dragged</p>
        </div>
      );
    }
  };

  return (
    <>
      {renderDraggableTask()}
      
      {isModalOpen && (
        <TaskModal
          task={task}
          onClose={() => setIsModalOpen(false)}
          onUpdate={(updatedTask) => {
            // Task update should be handled by parent component
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
} 