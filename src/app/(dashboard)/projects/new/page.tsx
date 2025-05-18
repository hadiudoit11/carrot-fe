"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateProjectForm from "@/components/forms/create-project-form";
import { Button } from "@/components/ui/button";
import { PlusIcon, ArrowLeftIcon } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(true);

  const handleProjectCreated = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/projects/overview")}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">New Project</h1>
        </div>
      </div>

      <div className="grid place-items-center h-[50vh]">
        {!isFormOpen ? (
          <div className="text-center space-y-4">
            <Button
              className="gap-2"
              size="lg"
              onClick={() => setIsFormOpen(true)}
            >
              <PlusIcon className="h-5 w-5" />
              Create New Project
            </Button>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start a new project to organize your tasks, collaborate with
              team members, and track progress.
            </p>
          </div>
        ) : (
          <CreateProjectForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              router.push("/projects/overview");
            }}
            onSuccess={handleProjectCreated}
          />
        )}
      </div>
    </div>
  );
} 