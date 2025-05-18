"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/providers/apiRequest";
import { Loader2, Plus, MapPin, Building2, Mail, Phone } from "lucide-react";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Site interface matching the Django model
interface Site {
  id: string;
  name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  contact_email?: string;
  phone_number?: string;
  manager?: string;
  manager_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function OrganizationSitesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  // State
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch sites data
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session?.error === 'RefreshAccessTokenError') {
      router.push('/user/login');
      return;
    }
    
    fetchSites();
  }, [session, status, router]);

  // Fetch sites from API
  const fetchSites = async () => {
    setIsLoading(true);
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      const response = await apiGet(`${backendURL}/api/v1/auth/site/list/`);
      
      if (response && Array.isArray(response)) {
        setSites(response);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
      toast({
        title: "Error",
        description: "Failed to load sites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to create site page
  const handleCreateSite = () => {
    router.push('/organization/sites/create');
  };

  // Navigate to edit site page
  const handleEditSite = (siteId: string) => {
    router.push(`/organization/sites/${siteId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Organization Sites</h1>
          <p className="text-muted-foreground">Manage your organization's locations</p>
        </div>
        <Button onClick={handleCreateSite}>
          <Plus className="h-4 w-4 mr-2" />
          Add Site
        </Button>
      </div>
      
      {sites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No sites found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Your organization doesn't have any sites yet. Add your first site to get started.
            </p>
            <Button onClick={handleCreateSite}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Site
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((site) => (
            <Card key={site.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{site.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {site.city}, {site.state}
                    </CardDescription>
                  </div>
                  <Badge variant={site.is_active ? "default" : "outline"}>
                    {site.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="space-y-3 text-sm">
                  <div className="flex">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="flex-1">
                      <p>{site.address_1}</p>
                      {site.address_2 && <p>{site.address_2}</p>}
                      <p>{site.city}, {site.state} {site.zip_code}</p>
                    </div>
                  </div>
                  
                  {site.contact_email && (
                    <div className="flex">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{site.contact_email}</p>
                    </div>
                  )}
                  
                  {site.phone_number && (
                    <div className="flex">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{site.phone_number}</p>
                    </div>
                  )}
                  
                  {site.manager_name && (
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Manager: {site.manager_name}</span>
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditSite(site.id)}
                  >
                    Edit Site
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
