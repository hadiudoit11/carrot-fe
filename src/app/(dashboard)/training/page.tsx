"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChefHat, Coffee, ShoppingBag, PlayCircle, Users } from "lucide-react";

export default function TrainingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    setIsLoading(false);
    
    if (!session || session?.error === 'RefreshAccessTokenError') {
      router.push('/user/login');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading' || isLoading) {
    return <div className="text-text-primary font-secondary">Loading...</div>;
  }

  const trainingModules = [
    {
      title: "Recipes",
      description: "Learn essential coffee recipes and brewing techniques",
      icon: Coffee,
      url: "/training/recipes",
      color: "bg-blue-500",
      status: "Coming Soon"
    },
    {
      title: "Operations",
      description: "Master daily operations and workflow management",
      icon: ChefHat,
      url: "/training/operations", 
      color: "bg-green-500",
      status: "Coming Soon"
    },
    {
      title: "Tutorials",
      description: "Step-by-step video tutorials and guides",
      icon: PlayCircle,
      url: "/training/tutorials",
      color: "bg-purple-500",
      status: "Coming Soon"
    },
    {
      title: "Shop",
      description: "Browse training materials and equipment",
      icon: ShoppingBag,
      url: "/shop",
      color: "bg-orange-500",
      status: "Available"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Training Center</h2>
          <p className="text-muted-foreground">
            Enhance your skills with our comprehensive training resources
          </p>
        </div>
      </div>

      {/* Training Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainingModules.map((module) => (
          <Card key={module.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${module.color}`}>
                  <module.icon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  module.status === "Available" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {module.status}
                </span>
              </div>
              <CardTitle className="mt-4">{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant={module.status === "Available" ? "default" : "outline"}
                onClick={() => {
                  if (module.status === "Available") {
                    router.push(module.url);
                  }
                }}
                disabled={module.status !== "Available"}
              >
                {module.status === "Available" ? "Get Started" : "Coming Soon"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Training Modules</p>
                <p className="text-2xl font-bold">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Active Learners</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <PlayCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Hours Completed</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 