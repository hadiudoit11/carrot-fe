'use client';

import React, { useState } from 'react';
import { SafeDraggable, SafeDroppable } from '../SafeDndComponents';
import TaskItem from './TaskItem';
import CreateTaskForm from './CreateTaskForm';
import { apiPost, apiDelete } from '@/providers/apiRequest';

interface Status {
  id: string;
  title: string;
  order: number;
  cards: Task[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  order: number;
}

interface StatusViewProps {
  status: Status;
  index: number;
}

export default function StatusView({ status, index }: StatusViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(status.title);
  const [showAddTask, setShowAddTask] = useState(false);
  const [droppableError, setDroppableError] = useState(false);
  
  // Ensure cards is always an array
  const cards = Array.isArray(status.cards) ? status.cards : [];

  const handleTitleChange = async () => {
    const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
    if (title.trim() === '') return;
    if (title === status.title) {
      setIsEditing(false);
      return;
    }

    try {
      await apiPost(`${backendURL}/api/v1/project/status/${status.id}/update/`, {
        name: title.trim()
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating status title:', err);
      setTitle(status.title); // Revert on error
    }
  };

  const handleDeleteStatus = async () => {
    const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
    if (!confirm('Are you sure you want to delete this status and all its tasks?')) return;
    
    try {
      await apiDelete(`${backendURL}/api/v1/project/status/${status.id}/`);
      // Status removal should be handled by parent component
    } catch (err) {
      console.error('Error deleting status:', err);
    }
  };

  // Safely render the droppable area
  const renderDroppableContent = () => {
    if (droppableError) {
      // Fallback UI if droppable fails
      return (
        <div className="p-2 min-h-[50px] bg-red-50">
          <p className="text-sm text-red-500">Error loading tasks</p>
          {cards.map((task, taskIndex) => (
            <div 
              key={task.id}
              className="bg-tertiary p-3 rounded mb-2 cursor-not-allowed opacity-70"
            >
              <h4 className="font-medium text-text-light">{task.title}</h4>
              {task.description && (
                <p className="text-text-secondary text-sm mt-1 truncate">
                  {task.description}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    try {
      return (
        <SafeDroppable droppableId={status.id} type="task">
          {(provided) => (
            <div 
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="p-2 min-h-[50px]"
            >
              {cards.map((task, taskIndex) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  index={taskIndex} 
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </SafeDroppable>
      );
    } catch (error) {
      console.error('Error rendering Droppable:', error);
      setDroppableError(true);
      return (
        <div className="p-2 min-h-[50px] bg-red-50">
          <p className="text-sm text-red-500">Error loading tasks</p>
        </div>
      );
    }
  };

  return (
    <SafeDraggable draggableId={status.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-secondary rounded-lg w-72 flex-shrink-0 mr-3"
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
                className="bg-tertiary p-1 rounded w-full"
                autoFocus
              />
            ) : (
              <h3 
                className="font-medium px-1 py-1 cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                {status.title}
              </h3>
            )}
            
            <button 
              onClick={handleDeleteStatus}
              className="text-text-secondary hover:text-status-error"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {renderDroppableContent()}
          
          {showAddTask ? (
            <CreateTaskForm 
              statusId={status.id}
              onTaskCreated={(newTask) => {
                // Task addition should be handled by parent component
                setShowAddTask(false);
              }}
              onCancel={() => setShowAddTask(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddTask(true)}
              className="w-full text-left p-2 text-text-secondary hover:bg-accent hover:bg-opacity-10 hover:text-text-light rounded-b-lg"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add a task
              </span>
            </button>
          )}
        </div>
      )}
    </SafeDraggable>
  );
} 