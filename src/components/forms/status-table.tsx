"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Trash2Icon, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the status type interface
export interface StatusType {
  name: string;
  type: string;
  color: string;
}

interface StatusTableProps {
  defaultStatuses: StatusType[];
  onChange: (statuses: StatusType[]) => void;
}

export default function StatusTable({ defaultStatuses, onChange }: StatusTableProps) {
  const [statuses, setStatuses] = useState<StatusType[]>([...defaultStatuses]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Add a new status
  const addStatus = () => {
    const newStatuses = [
      ...statuses,
      {
        name: "New Status",
        type: `status_${statuses.length + 1}`,
        color: getRandomColor(),
      },
    ];
    setStatuses(newStatuses);
    onChange(newStatuses);
  };

  // Update a status
  const updateStatus = (
    index: number,
    field: keyof StatusType,
    value: string
  ) => {
    const newStatuses = [...statuses];
    
    // If updating the name, also update the type
    if (field === "name") {
      newStatuses[index] = {
        ...newStatuses[index],
        name: value,
        type: value.toLowerCase().replace(/\s+/g, "_"),
      };
    } else {
      newStatuses[index] = {
        ...newStatuses[index],
        [field]: value,
      };
    }
    
    setStatuses(newStatuses);
    onChange(newStatuses);
  };

  // Remove a status
  const removeStatus = (index: number) => {
    const newStatuses = statuses.filter((_, i) => i !== index);
    setStatuses(newStatuses);
    onChange(newStatuses);
  };

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Reorder statuses
    const newStatuses = [...statuses];
    const draggedStatus = newStatuses[draggedIndex];
    newStatuses.splice(draggedIndex, 1);
    newStatuses.splice(index, 0, draggedStatus);

    setStatuses(newStatuses);
    setDraggedIndex(index);
    onChange(newStatuses);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Generate a random color
  const getRandomColor = () => {
    const colors = [
      "#3498db", // Blue
      "#2ecc71", // Green
      "#f39c12", // Orange
      "#9b59b6", // Purple
      "#e74c3c", // Red
      "#1abc9c", // Teal
      "#34495e", // Dark Blue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">Status Types</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addStatus}
          className="flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4" />
          Add Status
        </Button>
      </div>

      <div className="bg-muted/30 rounded-md p-1">
        <div className="grid grid-cols-12 gap-2 text-sm font-medium px-2 py-1.5 text-muted-foreground">
          <div className="col-span-1"></div>
          <div className="col-span-5">Name</div>
          <div className="col-span-4">Color</div>
          <div className="col-span-2"></div>
        </div>

        <div className="space-y-1">
          {statuses.map((status, index) => (
            <div
              key={index}
              className={cn(
                "grid grid-cols-12 gap-2 items-center p-2 rounded-md",
                "bg-card hover:bg-muted/50 transition-colors",
                draggedIndex === index && "bg-muted/70 border border-dashed"
              )}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="col-span-1 flex justify-center cursor-grab">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="col-span-5">
                <Input
                  value={status.name}
                  onChange={(e) => updateStatus(index, "name", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="col-span-4 flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded-full border"
                  style={{ backgroundColor: status.color }}
                ></div>
                <Input
                  value={status.color}
                  onChange={(e) => updateStatus(index, "color", e.target.value)}
                  className="h-8 text-sm font-mono"
                  placeholder="#000000"
                />
              </div>
              
              <div className="col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStatus(index)}
                  disabled={statuses.length <= 1}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mt-2">
        <p>Drag and drop to reorder statuses. The order defines the workflow progression.</p>
      </div>
    </div>
  );
} 