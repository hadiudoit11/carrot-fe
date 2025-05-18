"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function GeneralSettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [organizationName, setOrganizationName] = useState("Carrot Organization");
  const [organizationWebsite, setOrganizationWebsite] = useState("https://example.com");
  const [organizationDescription, setOrganizationDescription] = useState("Your organization description goes here.");

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Your organization settings have been updated successfully.",
      });
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            Basic information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={organizationWebsite}
              onChange={(e) => setOrganizationWebsite(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={organizationDescription}
              onChange={(e) => setOrganizationDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            How people can reach your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Contact Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@example.com"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              rows={3}
              placeholder="123 Main St, Anytown, ST 12345"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
