import { Droppable } from "@hello-pangea/dnd";
import { Post } from "./statuses";
import { PostCard } from "./PostCard";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

// Add the TaskDetailType interface
interface TaskDetailType {
  id: string;
  name: string;
  description: string | { details: string };
  status: string;
  status_name?: string;
  is_active: boolean;
  started_at: string | null;
  created_at: string;
  updated_at: string;
  due_at: string | null;
  assigned_to: string | null;
  assigned_to_name?: string;
  owner_name?: string;
  project: string;
}

export const PostColumn = ({
  status,
  statusName,
  posts,
  onTaskDeleted
}: {
  status: string;
  statusName?: string;
  posts: Post[];
  onTaskDeleted?: (taskDetail: TaskDetailType) => void;
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
    <Card className="flex-1 w-72 flex-shrink-0 mr-3 border bg-card text-card-foreground rounded-md">
      <CardHeader className="p-3 pb-2">
        <h3 className="text-sm font-medium text-center">
          {statusName || status}
        </h3>
      </CardHeader>
      <Droppable droppableId={status} isDropDisabled={!isMounted}>
        {(droppableProvided, snapshot) => (
          <CardContent 
            className="p-2 min-h-[150px]"
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
          >
            <div className={`rounded-md ${
              snapshot.isDraggingOver ? "bg-muted" : ""
            }`}>
              {safePosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 text-center border border-dashed border-muted rounded-lg p-2 my-1">
                  <PlusCircle className="w-6 h-6 text-muted-foreground mb-1" />
                  <p className="text-muted-foreground text-sm">
                    No tasks yet
                  </p>
                </div>
              ) : (
                safePosts.map((post, index) => 
                  post && post.id ? (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      index={index} 
                      onTaskDeleted={onTaskDeleted}
                    />
                  ) : null
                )
              )}
              {droppableProvided.placeholder}
            </div>
          </CardContent>
        )}
      </Droppable>
    </Card>
  );
};
