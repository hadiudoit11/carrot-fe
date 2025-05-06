import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Sheet } from '@/components/ui/sheet';
import TaskDetail from './TaskDetail';

// Helper function to safely extract text from potentially complex content objects
const getContentText = (content: any): string => {
  if (content === null || content === undefined) {
    return '';
  }
  
  if (typeof content === 'string') {
    return content;
  }
  
  if (typeof content === 'object') {
    // Check if it has a details property
    if (content.details && typeof content.details === 'string') {
      return content.details;
    }
    
    // Try to convert to JSON string if it's another kind of object
    try {
      return JSON.stringify(content);
    } catch (e) {
      return '';
    }
  }
  
  return String(content);
};

// Define the task interface
interface TaskCardProps {
  id: string;
  title: string;
  description?: string | { details: string };
  status?: string;
  statusName?: string;
  dueDate?: string | null;
  assignedToName?: string | null;
  createdAt?: string;
  onClick?: () => void;
  onTaskUpdated?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  status,
  statusName,
  dueDate,
  assignedToName,
  createdAt,
  onTaskUpdated,
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Format the description text
  const descriptionText = getContentText(description);
  
  // Get status color based on status name
  const getStatusColor = (statusName: string | undefined): string => {
    if (!statusName) return 'bg-muted text-muted-foreground';
    
    const status = statusName.toLowerCase();
    if (status.includes('done') || status.includes('complete')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    } else if (status.includes('progress')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    } else if (status.includes('hold')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    } else if (status.includes('cancel')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
    
    return 'bg-muted text-muted-foreground';
  };
  
  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-md transition-all"
        onClick={() => setIsSheetOpen(true)}
      >
        <CardHeader className="p-3 pb-2">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium line-clamp-1">{title}</h3>
            {statusName && (
              <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(statusName)}`}>{statusName}</Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-3 pt-0">
          {descriptionText && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {descriptionText}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs">
            {dueDate && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                <span>{format(new Date(dueDate), 'MMM d')}</span>
              </div>
            )}
            
            {assignedToName && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <UserIcon className="h-3 w-3" />
                <span className="truncate max-w-[100px]">{assignedToName}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <TaskDetail 
        taskId={id}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onTaskUpdated={onTaskUpdated}
      />
    </>
  );
};

export default TaskCard; 