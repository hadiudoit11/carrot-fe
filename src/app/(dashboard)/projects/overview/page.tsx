"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProjectList from "@/components/sub/projects/project-list";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function ProjectsOverviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    
    setIsLoading(false);
    
    if (session?.error === 'RefreshAccessTokenError') {
      router.push('/user/login');
      return;
    }
  }, [session, status, router]);

  // Function to handle "New Project" button click
  const handleCreateProject = () => {
    router.push('/projects/new');
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:gap-6 md:py-6">
      <div className="flex justify-between items-center px-4 lg:px-6">
        <h1 className="text-3xl font-bold font-primary">Projects</h1>
        <Button 
          className="flex items-center gap-1" 
          onClick={handleCreateProject}
        >
          <PlusIcon className="h-4 w-4" />
          New Project
        </Button>
      </div>
      
      <ProjectList />
    </div>
  );
}
