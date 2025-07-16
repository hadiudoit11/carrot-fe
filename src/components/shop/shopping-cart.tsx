"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2,
  CreditCard,
  Truck,
  Sparkles
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export function ShoppingCart({ isOpen, onClose, items = [], onUpdateQuantity, onRemoveItem }: ShoppingCartProps) {
  const subtotal = (items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 1000 ? 0 : 99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Cart Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-slate-900 to-purple-900 border-l border-white/10 transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Shopping Cart</h2>
              {items && items.length > 0 && (
                <Badge className="bg-purple-500 text-white border-0">
                  {items.length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {!items || items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-semibold text-white mb-2">Your cart is empty</h3>
                <p className="text-gray-400">Add some amazing products to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="text-2xl">🚀</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{item.name}</h4>
                          <p className="text-gray-400 text-sm">${item.price.toLocaleString()}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 border-white/20 text-white hover:bg-white/10"
                              onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-white font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 border-white/20 text-white hover:bg-white/10"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => onRemoveItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {items && items.length > 0 && (
            <div className="border-t border-white/10 p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between text-white font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 h-12">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Checkout
                </Button>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 h-12">
                  <Truck className="h-5 w-5 mr-2" />
                  Continue Shopping
                </Button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  <span>Free shipping</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  <span>30-day returns</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  <span>2-year warranty</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  <span>24/7 support</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 