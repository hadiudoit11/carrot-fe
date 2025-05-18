"use client";

// This file is a symlink to the actual implementation in src/components/forms/create-project-form.tsx
// It exists to maintain backward compatibility with existing imports

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiPost } from "@/providers/apiRequest";
import { format } from "date-fns";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import StatusTable, { StatusType } from './status-table';
import { CalendarIcon, CheckIcon, Loader2, X } from "lucide-react";
import UserSelector from "../sub/forms/user-selector";
import { cn } from "@/lib/utils";
import { useToastContext } from "@/components/ui/toast-provider"; 

// Define the props for the CreateProjectForm component
interface CreateProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}

// Define the form schema
const projectFormSchema = z.object({
  name: z.string().min(2, { message: "Project name is required" }),
  description: z.string().optional(),
  started_at: z.date().optional(),
  due_at: z.date().optional(),
  assigned_users: z.array(z.string()).optional(),
  statuses: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      color: z.string()
    })
  ).optional(),
});

// Type for the form values
type ProjectFormValues = z.infer<typeof projectFormSchema>;

// Default statuses
const DEFAULT_STATUSES: StatusType[] = [
  { name: "To Do", type: "todo", color: "#3498db" },
  { name: "In Progress", type: "in_progress", color: "#f39c12" },
  { name: "Done", type: "done", color: "#2ecc71" },
];

export default function CreateProjectForm({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectFormProps) {
  const router = useRouter();
  const { toast } = useToastContext();
  
  // Form state
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // State for inline calendars
  const [showStartDateCalendar, setShowStartDateCalendar] = useState(false);
  const [showDueDateCalendar, setShowDueDateCalendar] = useState(false);

  // Initialize form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      statuses: DEFAULT_STATUSES,
      assigned_users: [],
    },
  });

  // Navigate between steps
  const nextStep = async () => {
    // Validate current step fields
    if (step === 1) {
      // Only validate name field on step 1
      const nameValid = await form.trigger("name");
      
      // Return early if validation fails
      if (!nameValid) {
        return;
      }
    } else if (step === 2) {
      // Validate timeline fields on step 2
      const stepValid = await form.trigger(["started_at", "due_at"]);
      if (!stepValid) {
        return;
      }
    }
    
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Handle user assignment
  const handleUserAdd = (user: any) => {
    const userId = user.id;
    if (!selectedUsers.includes(userId)) {
      const newUsers = [...selectedUsers, userId];
      setSelectedUsers(newUsers);
      form.setValue("assigned_users", newUsers);
    }
  };

  const handleUserRemove = (userId: string) => {
    const newUsers = selectedUsers.filter(id => id !== userId);
    setSelectedUsers(newUsers);
    form.setValue("assigned_users", newUsers);
  };

  // Handle status table changes
  const handleStatusesChange = (newStatuses: StatusType[]) => {
    form.setValue("statuses", newStatuses);
  };

  // Handle form submission
  const onSubmit = async (values: ProjectFormValues) => {
    setIsSubmitting(true);
    
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      // Format the data for the API
      const formattedData = {
        name: values.name,
        description: values.description,
        started_at: values.started_at ? format(values.started_at, 'yyyy-MM-dd') : null,
        due_at: values.due_at ? format(values.due_at, 'yyyy-MM-dd') : null,
        assigned_users: values.assigned_users || [],
        status_types: values.statuses?.map(status => ({
          name: status.name,
          type: status.type,
          color: status.color
        })) || DEFAULT_STATUSES,
      };
      
      // Submit to the API
      const response = await apiPost(`${backendURL}/api/v1/project/project/create/`, formattedData);
      
      // Log response details for debugging
      console.log("API Response:", response);
      console.log("Request body sent:", formattedData);
      
      if (response && response.id) {
        toast({
          title: "Project created successfully",
          variant: "default",
          duration: 3000,
        });
        
        // Call onSuccess callback with project ID
        if (onSuccess) {
          onSuccess(response.id);
        } else {
          // Navigate to the project page if no callback provided
          router.push(`/projects/${response.id}`);
        }
        
        // Close the form
        onClose();
      } else {
        console.error("API returned without ID:", response);
        throw new Error("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      // Also log the HTTP error response if available
      if (error.response) {
        console.error("Error response:", await error.response.text());
      }
      toast({
        title: "Failed to create project",
        description: "An error occurred while creating the project.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    if (!isSubmitting) {
      // Reset calendar display states when closing
      setShowStartDateCalendar(false);
      setShowDueDateCalendar(false);
      onClose();
    }
  };

  // Handle date selection
  const handleDateSelect = (onChange: (date: Date | undefined) => void, setShowCalendar: React.Dispatch<React.SetStateAction<boolean>>) => (date: Date | undefined) => {
    onChange(date);
    setShowCalendar(false);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) handleDialogClose();
      }}
    >
      <DialogContent 
        className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          // Prevent dialog from closing if clicking inside calendars
          if (e.target && (
            (e.target as HTMLElement).closest('.calendar-container')
          )) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Set up your project details in a few simple steps.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step indicator */}
            <div className="flex items-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-colors",
                    stepNumber <= step ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>

            {/* Step 1: Basic information */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter project name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the project purpose and goals"
                          className="resize-none min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Timeline */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Project Timeline</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="started_at"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-2">
                        <FormLabel>Start Date</FormLabel>
                        <div className="relative">
                          <Button
                            type="button" 
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            onClick={() => {
                              setShowStartDateCalendar(!showStartDateCalendar);
                              setShowDueDateCalendar(false);
                            }}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                          
                          {showStartDateCalendar && (
                            <div className="calendar-container absolute left-0 top-full mt-1 z-50 bg-popover border rounded-md shadow-md">
                              <div className="flex justify-between items-center p-2 border-b">
                                <span className="text-sm font-medium">Select start date</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => setShowStartDateCalendar(false)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={handleDateSelect(field.onChange, setShowStartDateCalendar)}
                                initialFocus
                                className="rounded-md"
                              />
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="due_at"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-2">
                        <FormLabel>Due Date</FormLabel>
                        <div className="relative">
                          <Button
                            type="button" 
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            onClick={() => {
                              setShowDueDateCalendar(!showDueDateCalendar);
                              setShowStartDateCalendar(false);
                            }}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                          
                          {showDueDateCalendar && (
                            <div className="calendar-container absolute left-0 top-full mt-1 z-50 bg-popover border rounded-md shadow-md">
                              <div className="flex justify-between items-center p-2 border-b">
                                <span className="text-sm font-medium">Select due date</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => setShowDueDateCalendar(false)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={handleDateSelect(field.onChange, setShowDueDateCalendar)}
                                initialFocus
                                className="rounded-md"
                              />
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Team assignment */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Team Assignment</h3>
                
                <FormField
                  control={form.control}
                  name="assigned_users"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Members</FormLabel>
                      <FormControl>
                        <UserSelector
                          selectedUserIds={selectedUsers}
                          onUserAdd={handleUserAdd}
                          onUserRemove={handleUserRemove}
                          placeholder="Search for team members..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="text-sm text-muted-foreground">
                  <p>Assign team members who will be working on this project.</p>
                  <p>You can add or remove members at any time after creating the project.</p>
                </div>
              </div>
            )}

            {/* Step 4: Status types */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Status Types</h3>
                
                <FormField
                  control={form.control}
                  name="statuses"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <StatusTable 
                          defaultStatuses={field.value || DEFAULT_STATUSES}
                          onChange={handleStatusesChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="text-sm text-muted-foreground">
                  <p>These status types will be used to track the progress of tasks within your project.</p>
                  <p>You can customize them later in the project settings.</p>
                </div>
              </div>
            )}

            {/* Step 5: Review and create */}
            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Review & Create</h3>
                
                <div className="space-y-3 bg-muted/30 p-4 rounded-md">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Project Name</h4>
                    <p>{form.getValues("name")}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="text-sm">{form.getValues("description") || "No description provided"}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
                      <p className="text-sm">
                        {form.getValues("started_at") ? format(form.getValues("started_at")!, "PPP") : "Not set"} to {form.getValues("due_at") ? format(form.getValues("due_at")!, "PPP") : "Not set"}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Team Members</h4>
                    <p>{selectedUsers.length > 0 ? `${selectedUsers.length} members assigned` : "No members assigned"}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status Types</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(form.getValues("statuses") || DEFAULT_STATUSES).map((status, index) => (
                        <div key={index} className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                          <span className="text-sm">{status.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Review the project details. You can go back to edit any information or create the project now.</p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4">
              {step > 1 ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    // Close any open calendars when navigating
                    setShowStartDateCalendar(false);
                    setShowDueDateCalendar(false);
                    prevStep();
                  }}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              ) : (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDialogClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              
              {step < 5 ? (
                <Button 
                  type="button" 
                  onClick={() => {
                    // Close any open calendars when navigating
                    setShowStartDateCalendar(false);
                    setShowDueDateCalendar(false);
                    nextStep();
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="gap-1" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      Create Project
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 