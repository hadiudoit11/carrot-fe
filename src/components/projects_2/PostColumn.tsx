import { Droppable } from "@hello-pangea/dnd";
import { Post } from "./statuses";
import { PostCard } from "./PostCard";
import { useEffect, useState } from "react";

export const PostColumn = ({
  status,
  statusName,
  posts,
}: {
  status: string;
  statusName?: string;
  posts: Post[];
}) => {
  const [isMounted, setIsMounted] = useState(false);
  
  // Only enable client-side features after mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Ensure posts is always a valid array with proper Post objects
  const safePosts = Array.isArray(posts) 
    ? posts.filter(post => post && typeof post === 'object') 
    : [];
  
  return (
    <div
      className="flex-1 bg-secondary rounded-lg w-72 flex-shrink-0 mr-3 p-2"
    >
      <h3 className="text-center font-medium text-text-light mb-3">
        {statusName || status}
      </h3>
      <Droppable droppableId={status} isDropDisabled={!isMounted}>
        {(droppableProvided, snapshot) => (
          <div
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
            className={`min-h-[100px] p-2 rounded-md ${
              snapshot.isDraggingOver ? "bg-accent bg-opacity-10" : ""
            }`}
          >
            {safePosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 text-center border border-dashed border-accent/30 rounded-lg p-2 my-1">
                <svg className="w-6 h-6 text-text-secondary mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-text-secondary text-sm">
                  No tasks yet
                </p>
              </div>
            ) : (
              safePosts.map((post, index) => 
                post && post.id ? (
                  <PostCard key={post.id} post={post} index={index} />
                ) : null
              )
            )}
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
