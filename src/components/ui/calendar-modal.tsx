"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface CalendarModalProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function CalendarModal({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
}: CalendarModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Handle clicks outside the calendar to close it
  React.useEffect(() => {
    if (!isOpen) return;
    
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) && 
        // Make sure we're not clicking within the modal
        !(event.target as HTMLElement).closest('.calendar-modal-content')
      ) {
        setIsOpen(false);
      }
    }
    
    // Add the event listener for mousedown
    document.addEventListener('mousedown', handleClickOutside);
    
    // Return cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full pl-3 text-left font-normal",
          !value && "text-muted-foreground"
        )}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {value ? format(value, "PPP") : <span>{placeholder}</span>}
        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
      </Button>
      
      {isOpen && (
        <div 
          className="calendar-modal-content absolute left-0 z-[9999] mt-1 w-auto rounded-md border bg-background shadow-md"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="p-3">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleSelect}
              initialFocus
              className="rounded-md border"
            />
          </div>
        </div>
      )}
    </div>
  );
} 