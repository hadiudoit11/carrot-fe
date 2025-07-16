"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, Heart, Share2, ShoppingCart, Check, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Mock product data for restaurant supplies
const mockProducts = [
  {
    id: "1",
    name: "Chef's Premium Apron",
    description: "Professional-grade chef apron with adjustable straps and multiple pockets",
    longDescription: "This premium chef apron is crafted from high-quality, durable cotton canvas that withstands the rigors of professional kitchen use. Features include adjustable neck straps, multiple utility pockets for tools and thermometers, and reinforced stitching for longevity. The apron provides excellent protection while maintaining comfort during long shifts.",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.8,
    reviews: 127,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    category: "Clothing",
    tags: ["Chef", "Professional", "Apron"],
    inStock: true,
    featured: true,
    specs: {
      "Material": "Heavy-duty cotton canvas",
      "Pockets": "3 utility pockets",
      "Straps": "Adjustable neck and waist",
      "Size": "One size fits most",
      "Care": "Machine washable",
      "Weight": "450g"
    },
    features: [
      "Heavy-duty cotton canvas construction",
      "Adjustable neck and waist straps",
      "Multiple utility pockets",
      "Reinforced stitching",
      "Machine washable",
      "Professional kitchen approved"
    ],
    reviews: [
      {
        id: 1,
        user: "Chef Maria Rodriguez",
        rating: 5,
        title: "Excellent Quality",
        comment: "This apron has held up perfectly through months of daily use in our busy kitchen. The pockets are perfectly sized for thermometers and pens.",
        date: "2024-01-15"
      },
      {
        id: 2,
        user: "James Wilson",
        rating: 4,
        title: "Great Value",
        comment: "Good quality for the price. The straps adjust easily and the material is thick enough to provide good protection.",
        date: "2024-01-10"
      }
    ]
  },
  {
    id: "2",
    name: "Barista Coffee Grinder Pro",
    description: "Commercial-grade coffee grinder with precise settings for perfect espresso",
    longDescription: "The Barista Coffee Grinder Pro delivers consistent, precise grinding for professional coffee preparation. Features include 40mm steel burrs, 25 grind settings, and a digital timer for precise dosing. Perfect for espresso, pour-over, and French press brewing methods.",
    price: 299.99,
    originalPrice: 399.99,
    rating: 4.6,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop",
    category: "Coffee Equipment",
    tags: ["Barista", "Grinder", "Commercial"],
    inStock: true,
    featured: false,
    specs: {
      "Burr Size": "40mm steel burrs",
      "Grind Settings": "25 positions",
      "Hopper Capacity": "1.2kg",
      "Motor Power": "250W",
      "Dimensions": "15\" x 8\" x 12\"",
      "Weight": "4.5kg"
    },
    features: [
      "40mm steel burrs for consistent grinding",
      "25 grind settings for all brewing methods",
      "Digital timer for precise dosing",
      "Large 1.2kg bean hopper",
      "Commercial-grade motor",
      "Easy cleaning and maintenance"
    ],
    reviews: [
      {
        id: 1,
        user: "Alex Thompson",
        rating: 5,
        title: "Perfect for Our Cafe",
        comment: "This grinder has been running daily in our cafe for 6 months without any issues. The grind consistency is excellent.",
        date: "2024-01-12"
      }
    ]
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    // Find product by ID
    const foundProduct = mockProducts.find(p => p.id === params.id);
    if (foundProduct) {
      setProduct(foundProduct);
    }
  }, [params.id]);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Product not found</div>
      </div>
    );
  }

  const addToCart = () => {
    // Add to cart logic here
    console.log(`Added ${quantity} of ${product.name} to cart`);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-4 left-4 flex gap-2">
            {product.featured && (
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                Featured
              </Badge>
            )}
            {!product.inStock && (
              <Badge className="bg-red-500 text-white border-0">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-purple-500/50 text-purple-600 dark:text-purple-300">
                {product.category}
              </Badge>
              {product.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground text-lg">{product.description}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">{product.rating} ({product.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">${product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xl text-muted-foreground line-through">
                ${product.originalPrice.toLocaleString()}
              </span>
            )}
            {product.originalPrice && (
              <Badge className="bg-green-500 text-white border-0">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </Badge>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.inStock ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Check className="h-4 w-4" />
                In Stock
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <div className="h-4 w-4 rounded-full bg-red-600 dark:bg-red-400" />
                Out of Stock
              </div>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border rounded px-3 py-1 text-sm"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={addToCart}
                disabled={!product.inStock}
                className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                onClick={toggleWishlist}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current text-red-400" : ""}`} />
              </Button>
              <Button
                variant="outline"
                onClick={shareProduct}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span className="text-sm">Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="text-sm">2 Year Warranty</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <RotateCcw className="h-4 w-4" />
              <span className="text-sm">30 Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="leading-relaxed">{product.longDescription}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {product.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specs" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium">{value as string}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {product.reviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{review.title}</h4>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mb-2">{review.comment}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>By {review.user}</span>
                        <span>{review.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 