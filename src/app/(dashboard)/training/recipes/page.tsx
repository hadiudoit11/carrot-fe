"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, Filter, BookOpen, Clock, Coffee, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

// Mock data for coffee recipes
const mockRecipes = [
  {
    id: 1,
    name: "Classic Espresso",
    description: "The foundation of all espresso-based drinks. Perfect your shot extraction.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop",
    category: "Espresso",
    difficulty: "Beginner",
    time: "3-5 min",
    rating: 4.9,
    reviews: 156,
    tags: ["Espresso", "Foundation", "Classic"],
    steps: [
      {
        title: "Grind Your Beans",
        description: "Grind 18-21g of fresh coffee beans to a fine consistency",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
        tips: ["Use a burr grinder for consistent results", "Grind should feel like table salt"]
      },
      {
        title: "Prepare Your Portafilter",
        description: "Clean and dry your portafilter, then dose your coffee",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop",
        tips: ["Distribute coffee evenly", "Tamp with 30lbs of pressure"]
      },
      {
        title: "Extract Your Shot",
        description: "Lock in portafilter and start extraction. Aim for 25-30 seconds",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop",
        tips: ["Look for a steady stream", "Stop when you reach 36g of espresso"]
      }
    ]
  },
  {
    id: 2,
    name: "Pour Over Coffee",
    description: "Clean, bright flavors with full control over the brewing process.",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
    category: "Filter",
    difficulty: "Intermediate",
    time: "4-6 min",
    rating: 4.7,
    reviews: 89,
    tags: ["Pour Over", "Filter", "Clean"],
    steps: [
      {
        title: "Heat Your Water",
        description: "Bring water to 200-205°F (93-96°C)",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
        tips: ["Use filtered water", "Let it cool slightly if too hot"]
      },
      {
        title: "Rinse Your Filter",
        description: "Place filter in dripper and rinse with hot water",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
        tips: ["Discard rinse water", "This removes paper taste"]
      },
      {
        title: "Bloom Your Coffee",
        description: "Add 30g of water to 15g of coffee and let bloom for 30 seconds",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
        tips: ["Stir gently", "Look for bubbles and expansion"]
      },
      {
        title: "Complete the Pour",
        description: "Slowly pour remaining water in circular motions",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
        tips: ["Keep water level consistent", "Total time should be 3-4 minutes"]
      }
    ]
  },
  {
    id: 3,
    name: "Cappuccino",
    description: "Perfect balance of espresso, steamed milk, and milk foam.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop",
    category: "Milk Drinks",
    difficulty: "Intermediate",
    time: "5-7 min",
    rating: 4.8,
    reviews: 203,
    tags: ["Cappuccino", "Milk", "Foam"],
    steps: [
      {
        title: "Pull Your Espresso",
        description: "Extract a double shot of espresso (36g)",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop",
        tips: ["Use fresh beans", "Check your grind size"]
      },
      {
        title: "Steam Your Milk",
        description: "Steam 6oz of cold milk to 150°F with microfoam",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop",
        tips: ["Start with cold milk", "Listen for the 'paper tearing' sound"]
      },
      {
        title: "Pour and Top",
        description: "Pour steamed milk over espresso, then spoon foam on top",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop",
        tips: ["1/3 espresso, 1/3 milk, 1/3 foam", "Serve immediately"]
      }
    ]
  },
  {
    id: 4,
    name: "Cold Brew",
    description: "Smooth, low-acid coffee perfect for hot summer days.",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
    category: "Cold",
    difficulty: "Beginner",
    time: "12-24 hours",
    rating: 4.6,
    reviews: 78,
    tags: ["Cold Brew", "Cold", "Smooth"],
    steps: [
      {
        title: "Coarse Grind",
        description: "Grind coffee beans to a coarse consistency",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
        tips: ["Should look like breadcrumbs", "Use 1:4 coffee to water ratio"]
      },
      {
        title: "Combine and Steep",
        description: "Mix coffee and cold water, let steep for 12-24 hours",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
        tips: ["Room temperature is fine", "Stir gently after adding water"]
      },
      {
        title: "Filter and Serve",
        description: "Filter through a fine mesh and serve over ice",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
        tips: ["Can be stored for up to 2 weeks", "Dilute with water or milk"]
      }
    ]
  },
  {
    id: 5,
    name: "Latte Art - Heart",
    description: "Learn to pour beautiful heart patterns in your lattes.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop",
    category: "Latte Art",
    difficulty: "Advanced",
    time: "8-10 min",
    rating: 4.5,
    reviews: 45,
    tags: ["Latte Art", "Heart", "Advanced"],
    steps: [
      {
        title: "Perfect Your Milk",
        description: "Steam milk to create silky microfoam",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop",
        tips: ["Milk should be 140-150°F", "Look for a glossy surface"]
      },
      {
        title: "Start Your Pour",
        description: "Begin pouring from high up to break the crema",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop",
        tips: ["Pour in the center", "Keep the stream thin"]
      },
      {
        title: "Create the Heart",
        description: "Lower your pitcher and pour in a circular motion, then pull through",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop",
        tips: ["Practice the motion", "Don't rush the pour"]
      }
    ]
  },
  {
    id: 6,
    name: "Aeropress",
    description: "Quick, clean coffee with full control over extraction.",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
    category: "Immersion",
    difficulty: "Beginner",
    time: "3-4 min",
    rating: 4.8,
    reviews: 112,
    tags: ["Aeropress", "Immersion", "Quick"],
    steps: [
      {
        title: "Prepare Your Setup",
        description: "Place filter in cap and rinse with hot water",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
        tips: ["Use paper or metal filter", "Screw cap on tightly"]
      },
      {
        title: "Add Coffee and Water",
        description: "Add 17g of coffee and 250g of water at 175°F",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
        tips: ["Stir for 10 seconds", "Let steep for 1 minute"]
      },
      {
        title: "Press and Serve",
        description: "Insert plunger and press down slowly over 30 seconds",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
        tips: ["Stop when you hear air", "Serve immediately"]
      }
    ]
  }
];

const categories = ["All", "Espresso", "Filter", "Milk Drinks", "Cold", "Latte Art", "Immersion"];
const difficultyLevels = ["All", "Beginner", "Intermediate", "Advanced"];
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "difficulty", label: "Difficulty" },
  { value: "time", label: "Time" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" }
];

export default function TrainingRecipesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recipes, setRecipes] = useState(mockRecipes);
  const [filteredRecipes, setFilteredRecipes] = useState(mockRecipes);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session?.error === 'RefreshAccessTokenError') {
      router.push('/user/login');
      return;
    }
  }, [session, status, router]);

  // Filter and sort recipes
  useEffect(() => {
    let filtered = recipes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== "All") {
      filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty);
    }

    // Sort recipes
    switch (sortBy) {
      case "difficulty":
        const difficultyOrder = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };
        filtered = [...filtered].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      case "time":
        filtered = [...filtered].sort((a, b) => {
          const timeA = parseInt(a.time.split('-')[0]);
          const timeB = parseInt(b.time.split('-')[0]);
          return timeA - timeB;
        });
        break;
      case "rating":
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered = [...filtered].sort((a, b) => b.id - a.id);
        break;
      case "featured":
      default:
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
    }

    setFilteredRecipes(filtered);
  }, [recipes, searchTerm, selectedCategory, selectedDifficulty, sortBy]);

  const handleLearnRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    setCurrentStep(0);
    setIsModalOpen(true);
  };

  const nextStep = () => {
    if (currentStep < selectedRecipe.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Espresso": return Coffee;
      case "Filter": return Zap;
      case "Milk Drinks": return Target;
      default: return Coffee;
    }
  };

  if (status === 'loading') {
    return <div className="text-text-primary font-secondary">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Coffee Recipes</h2>
          <p className="text-muted-foreground">
            Master the art of coffee brewing with our step-by-step guides
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
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficultyLevels.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Results Count */}
            <div className="flex items-center justify-end text-muted-foreground">
              {filteredRecipes.length} recipes found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map(recipe => (
          <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute top-2 right-2">
                <Badge className={getDifficultyColor(recipe.difficulty)}>
                  {recipe.difficulty}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{recipe.name}</CardTitle>
                  <CardDescription className="mt-2">{recipe.description}</CardDescription>
                </div>
              </div>
                             <div className="flex items-center gap-2 mt-3">
                 <div className="flex items-center gap-1">
                   <Clock className="h-4 w-4 text-muted-foreground" />
                   <span className="text-sm text-muted-foreground">{recipe.time}</span>
                 </div>
               </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {recipe.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0"
                onClick={() => handleLearnRecipe(recipe)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Learn Recipe
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecipes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground text-lg mb-2">No recipes found</div>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recipe Learning Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedRecipe?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedRecipe && (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Step {currentStep + 1} of {selectedRecipe.steps.length}</span>
                  <span>{Math.round(((currentStep + 1) / selectedRecipe.steps.length) * 100)}% Complete</span>
                </div>
                <Progress value={((currentStep + 1) / selectedRecipe.steps.length) * 100} />
              </div>

              {/* Current Step */}
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={selectedRecipe.steps[currentStep].image}
                    alt={selectedRecipe.steps[currentStep].title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-black">
                      Step {currentStep + 1}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {selectedRecipe.steps[currentStep].title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedRecipe.steps[currentStep].description}
                  </p>
                  
                  {/* Tips */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Pro Tips:</h4>
                    <ul className="space-y-1">
                      {selectedRecipe.steps[currentStep].tips.map((tip: string, index: number) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                
                <div className="flex gap-2">
                  {currentStep < selectedRecipe.steps.length - 1 ? (
                    <Button onClick={nextStep}>
                      Next Step
                    </Button>
                  ) : (
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Complete Recipe
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 