"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ShoppingCart, Star, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCartSlideout } from "@/components/shop/shopping-cart-slideout";
import { ProductCard } from "@/components/shop/product-card";

// Mock data for restaurant supplies, clothing, hats, and coffee
const mockProducts = [
  {
    id: 1,
    name: "Chef's Premium Apron",
    description: "Professional-grade chef apron with adjustable straps and multiple pockets",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.8,
    reviews: 127,
    image: "https://espresso-works.com/cdn/shop/products/espressoworks-barista-apron-with-pockets-02.jpg?v=1605508140",
    category: "Clothing",
    tags: ["Chef", "Professional", "Apron"],
    inStock: true,
    featured: true
  },
  {
    id: 2,
    name: "Barista Coffee Grinder Pro",
    description: "Commercial-grade coffee grinder with precise settings for perfect espresso",
    price: 299.99,
    originalPrice: 399.99,
    rating: 4.6,
    reviews: 89,
    image: "https://thumbs.dreamstime.com/b/flat-lay-coffee-brewing-accessories-including-fresh-beans-grinder-cups-utensils-arranged-neatly-white-background-337725496.jpg",
    category: "Coffee Equipment",
    tags: ["Barista", "Grinder", "Commercial"],
    inStock: true,
    featured: false
  },
  {
    id: 3,
    name: "Brewing utensils",
    description: "Professional 8-piece knife set with wooden block and sharpening steel",
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.9,
    reviews: 203,
    image: "https://m.media-amazon.com/images/I/71Xtd+E1sSL.jpg",
    category: "Kitchen Tools",
    tags: ["Knives", "Professional", "Set"],
    inStock: true,
    featured: true
  },
  {
    id: 4,
    name: "Barista Hat - Classic Style",
    description: "Traditional barista hat with embroidered logo and comfortable fit",
    price: 24.99,
    originalPrice: 34.99,
    rating: 4.7,
    reviews: 156,
    image: "https://www.shutterstock.com/image-photo/black-baseball-cap-patch-your-600nw-2454597387.jpg",
    category: "Hats",
    tags: ["Barista", "Classic", "Embroidered"],
    inStock: true,
    featured: false
  },
  {
    id: 5,
    name: "Espresso Machine - Commercial",
    description: "Professional 2-group espresso machine with PID temperature control",
    price: 2499.99,
    originalPrice: 2999.99,
    rating: 4.5,
    reviews: 78,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop",
    category: "Coffee Equipment",
    tags: ["Espresso", "Commercial", "Professional"],
    inStock: false,
    featured: false
  },
  {
    id: 6,
    name: "Giftcards x 25",
    description: "Order giftcards, shipped directly to your store",
    price: 149.99,
    originalPrice: 189.99,
    rating: 4.8,
    reviews: 94,
    image: "https://static.wixstatic.com/media/078c7d_8983454dc3a742179a815c74ab03ce43~mv2.png/v1/fill/w_391,h_404,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.png",
    category: "Clothing",
    tags: ["Chef", "Uniform", "Professional"],
    inStock: true,
    featured: true
  },
  {
    id: 7,
    name: "Coffee Bean Storage Container",
    description: "Airtight coffee bean storage with CO2 valve and UV protection",
    price: 39.99,
    originalPrice: 49.99,
    rating: 4.4,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
    category: "Coffee Equipment",
    tags: ["Storage", "Airtight", "Freshness"],
    inStock: true,
    featured: false
  },
  {
    id: 8,
    name: "Restaurant Chef Hat",
    description: "Traditional tall chef hat with adjustable band and breathable fabric",
    price: 19.99,
    originalPrice: 29.99,
    rating: 4.6,
    reviews: 112,
    image: "https://www.shutterstock.com/image-photo/black-baseball-cap-patch-your-600nw-2454597387.jpg",
    category: "Hats",
    tags: ["Chef", "Traditional", "Tall"],
    inStock: true,
    featured: false
  },
  {
    id: 9,
    name: "Barista Training Manual",
    description: "Comprehensive guide to coffee brewing, latte art, and barista skills",
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.9,
    reviews: 45,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    category: "Books & Training",
    tags: ["Barista", "Training", "Guide"],
    inStock: true,
    featured: false
  }
];

const categories = ["All", "Clothing", "Coffee Equipment", "Kitchen Tools", "Hats", "Books & Training"];
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" }
];

export default function ShopPage() {
  const [products, setProducts] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Filter and sort products
  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered = [...filtered].sort((a, b) => b.id - a.id);
        break;
      case "featured":
      default:
        filtered = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  // Add item to cart
  const addToCart = (product: any) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Remove item from cart
  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  // Update cart item quantity
  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Restaurant Supply Store</h2>
          <p className="text-muted-foreground">
            Professional equipment, clothing, and supplies for chefs and baristas
          </p>
        </div>
        <Button
          onClick={() => setIsCartOpen(true)}
          className="relative bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Cart
          {cartItemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs">
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
              {filteredProducts.length} products found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={() => addToCart(product)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground text-lg mb-2">No products found</div>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Shopping Cart Slideout */}
      <ShoppingCartSlideout
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
      />
    </div>
  );
} 