import { Draggable } from "@hello-pangea/dnd";
import { Post } from "./statuses";
import { useState, useEffect } from "react";

export const PostCard = ({ post, index }: { post: Post; index: number }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Only render the Draggable component after client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Generate a unique draggable ID that's guaranteed to be a string
  const draggableId = typeof post.id === 'string' ? post.id : `post-${index}-${Date.now()}`;
  
  // Ensure content is a string
  let safeContent = '';
  if (typeof post.content === 'string') {
    safeContent = post.content;
  } else if (typeof post.content === 'object' && post.content !== null) {
    // Check for details property in the object
    safeContent = (post.content as any).details || '';
  }
  
  // If not mounted yet, render a placeholder with the same structure
  if (!isMounted) {
    return (
      <div className="mb-2">
        <div className="bg-tertiary p-3 rounded shadow-accent-offset border border-accent">
          <h4 className="font-medium text-text-light">{post.title || 'Untitled'}</h4>
          {safeContent && (
            <p className="text-text-secondary text-sm mt-1 truncate">
              {safeContent}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  // Only render the Draggable when client-side mounted
  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => (
        <div
          className="mb-2"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <div
            className={`bg-tertiary p-3 rounded shadow-accent-offset border border-accent cursor-pointer hover:bg-accent hover:bg-opacity-10 ${
              snapshot.isDragging ? "opacity-90 rotate-1" : ""
            }`}
            onClick={() => setIsModalOpen(true)}
          >
            <h4 className="font-medium text-text-light">{post.title || 'Untitled'}</h4>
            {safeContent && (
              <p className="text-text-secondary text-sm mt-1 truncate">
                {safeContent}
              </p>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
