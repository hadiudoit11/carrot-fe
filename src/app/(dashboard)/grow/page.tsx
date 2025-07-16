"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, Filter, TrendingUp, MapPin, Calendar, DollarSign, Users, Target, Tv, Square, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Mock data for marketing campaigns
const mockCampaigns = [
  {
    id: 1,
    name: "Downtown TV Campaign",
    description: "Local TV advertising campaign targeting downtown area viewers during prime time hours.",
    location: "Downtown Area",
    type: "TV Advertising",
    budget: 5000,
    currentContributions: 3200,
    participants: 8,
    startDate: "2024-02-15",
    endDate: "2024-03-15",
    status: "Active",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&h=300&fit=crop",
    details: {
      reach: "50,000+ viewers",
      frequency: "3x per week",
      channels: ["Local News", "Sports Network"],
      targetDemographic: "25-54 age group",
      expectedROI: "3:1"
    }
  },
  {
    id: 2,
    name: "Highway Billboard Initiative",
    description: "Strategic billboard placement along major highways to capture commuter traffic.",
    location: "Highway Corridor",
    type: "Billboard",
    budget: 3000,
    currentContributions: 1800,
    participants: 5,
    startDate: "2024-02-01",
    endDate: "2024-04-01",
    status: "Active",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
    details: {
      reach: "100,000+ daily commuters",
      frequency: "24/7 visibility",
      locations: ["Exit 15", "Exit 22", "Exit 28"],
      targetDemographic: "Commuting professionals",
      expectedROI: "4:1"
    }
  },
  {
    id: 3,
    name: "Google Ads Local Search",
    description: "Targeted Google Ads campaign for local coffee searches in the metro area.",
    location: "Metro Area",
    type: "Digital Advertising",
    budget: 2000,
    currentContributions: 1500,
    participants: 12,
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    status: "Active",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    details: {
      reach: "25,000+ monthly searches",
      keywords: ["coffee near me", "best coffee", "espresso"],
      targetDemographic: "Local coffee seekers",
      expectedROI: "5:1",
      platforms: ["Google Search", "Google Maps"]
    }
  },
  {
    id: 4,
    name: "Community Flyer Distribution",
    description: "Local flyer distribution campaign in residential neighborhoods and business districts.",
    location: "Residential Areas",
    type: "Print Marketing",
    budget: 800,
    currentContributions: 600,
    participants: 15,
    startDate: "2024-02-10",
    endDate: "2024-02-25",
    status: "Active",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    details: {
      reach: "10,000+ households",
      distribution: "Door-to-door + mailboxes",
      targetDemographic: "Local residents",
      expectedROI: "2:1",
      areas: ["North District", "South District", "East District"]
    }
  },
  {
    id: 5,
    name: "Social Media Influencer Campaign",
    description: "Collaboration with local food and lifestyle influencers to promote brand awareness.",
    location: "Social Media",
    type: "Influencer Marketing",
    budget: 4000,
    currentContributions: 2800,
    participants: 6,
    startDate: "2024-03-01",
    endDate: "2024-04-30",
    status: "Upcoming",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=300&fit=crop",
    details: {
      reach: "200,000+ followers",
      influencers: ["@LocalFoodie", "@CoffeeLover", "@CityLife"],
      targetDemographic: "18-35 age group",
      expectedROI: "6:1",
      platforms: ["Instagram", "TikTok", "YouTube"]
    }
  },
  {
    id: 6,
    name: "Radio Advertising Blitz",
    description: "Local radio advertising during morning and evening commute times.",
    location: "Local Radio",
    type: "Radio Advertising",
    budget: 2500,
    currentContributions: 1200,
    participants: 4,
    startDate: "2024-02-20",
    endDate: "2024-03-20",
    status: "Active",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
    details: {
      reach: "75,000+ listeners",
      frequency: "5x per week",
      stations: ["Local FM 98.5", "News Radio 101.3"],
      targetDemographic: "Commuting adults",
      expectedROI: "3.5:1"
    }
  }
];

const campaignTypes = ["All", "TV Advertising", "Billboard", "Digital Advertising", "Print Marketing", "Influencer Marketing", "Radio Advertising"];
const locations = ["All", "Downtown Area", "Highway Corridor", "Metro Area", "Residential Areas", "Social Media", "Local Radio"];
const statuses = ["All", "Active", "Upcoming", "Completed"];

export default function GrowPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [filteredCampaigns, setFilteredCampaigns] = useState(mockCampaigns);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session?.error === 'RefreshAccessTokenError') {
      router.push('/user/login');
      return;
    }
  }, [session, status, router]);

  // Filter and sort campaigns
  useEffect(() => {
    let filtered = campaigns;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== "All") {
      filtered = filtered.filter(campaign => campaign.type === selectedType);
    }

    // Filter by location
    if (selectedLocation !== "All") {
      filtered = filtered.filter(campaign => campaign.location === selectedLocation);
    }

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter(campaign => campaign.status === selectedStatus);
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, searchTerm, selectedType, selectedLocation, selectedStatus]);

  const handleContribute = (campaign: any) => {
    setSelectedCampaign(campaign);
    setContributionAmount("");
    setIsModalOpen(true);
  };

  const handleSubmitContribution = () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) return;
    
    // Here you would typically make an API call to submit the contribution
    console.log(`Contributing $${contributionAmount} to campaign: ${selectedCampaign.name}`);
    
    // Update the campaign's current contributions (in a real app, this would come from the API)
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === selectedCampaign.id 
        ? { ...campaign, currentContributions: campaign.currentContributions + parseFloat(contributionAmount) }
        : campaign
    ));
    
    setIsModalOpen(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "TV Advertising": return Tv;
      case "Billboard": return Square;
      case "Digital Advertising": return Globe;
      case "Print Marketing": return Mail;
      case "Influencer Marketing": return Users;
      case "Radio Advertising": return Target;
      default: return TrendingUp;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Upcoming": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressPercentage = (current: number, total: number) => {
    return Math.min((current / total) * 100, 100);
  };

  if (status === 'loading') {
    return <div className="text-text-primary font-secondary">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Grow Your Business</h2>
          <p className="text-muted-foreground">
            Join local marketing campaigns and expand your reach with collaborative advertising
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Campaign Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Campaign Type" />
              </SelectTrigger>
              <SelectContent>
                {campaignTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Results Count */}
            <div className="flex items-center justify-end text-muted-foreground">
              {filteredCampaigns.length} campaigns found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map(campaign => {
          const TypeIcon = getTypeIcon(campaign.type);
          const progressPercentage = getProgressPercentage(campaign.currentContributions, campaign.budget);
          
          return (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={campaign.image}
                  alt={campaign.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <CardDescription className="mt-2">{campaign.description}</CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{campaign.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TypeIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{campaign.type}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Funding Progress</span>
                    <span>${campaign.currentContributions.toLocaleString()} / ${campaign.budget.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{campaign.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(campaign.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
                  onClick={() => handleContribute(campaign)}
                  disabled={campaign.status === "Completed"}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Contribute to Campaign
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground text-lg mb-2">No campaigns found</div>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contribution Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contribute to Campaign</DialogTitle>
            <DialogDescription>
              {selectedCampaign && (
                <>
                  Join <strong>{selectedCampaign.name}</strong> and help fund this marketing initiative.
                  <br /><br />
                  <strong>Campaign Details:</strong><br />
                  • Location: {selectedCampaign.location}<br />
                  • Type: {selectedCampaign.type}<br />
                  • Total Budget: ${selectedCampaign.budget.toLocaleString()}<br />
                  • Current Funding: ${selectedCampaign.currentContributions.toLocaleString()}<br />
                  • Participants: {selectedCampaign.participants}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="contribution" className="block text-sm font-medium mb-2">
                Contribution Amount ($)
              </label>
              <Input
                id="contribution"
                type="number"
                placeholder="Enter amount"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                min="1"
                step="1"
              />
            </div>
            
            {selectedCampaign && contributionAmount && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Expected Benefits:</strong><br />
                  • {selectedCampaign.details.reach}<br />
                  • {selectedCampaign.details.expectedROI} ROI<br />
                  • Shared marketing costs
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitContribution}
              disabled={!contributionAmount || parseFloat(contributionAmount) <= 0}
            >
              Submit Contribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 