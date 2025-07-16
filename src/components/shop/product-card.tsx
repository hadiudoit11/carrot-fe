"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Heart, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  tags: string[];
  inStock: boolean;
  featured: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/shop/${product.id}`);
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/shop/${product.id}`)}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-lg">
          <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          
          {/* Badges */}
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

          {/* Action Buttons */}
          <div className={`absolute top-4 right-4 flex gap-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Button 
              size="icon" 
              variant="ghost" 
              className="bg-white/80 hover:bg-white dark:bg-black/80 dark:hover:bg-black/90"
              onClick={handleViewDetails}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="bg-white/80 hover:bg-white dark:bg-black/80 dark:hover:bg-black/90"
              onClick={handleWishlist}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current text-red-400" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Category and Tags */}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-purple-500/50 text-purple-600 dark:text-purple-300 text-xs">
              {product.category}
            </Badge>
            {product.tags.slice(0, 1).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Product Name */}
          <h3 className="text-lg font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground text-sm">
              ({product.reviews})
            </span>
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">
                ${product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-muted-foreground line-through text-sm">
                  ${product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 