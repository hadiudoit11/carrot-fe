"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SalesAreaChart } from "@/components/sales/sales-area-chart";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

// Mock data
const salesData = {
  summary: {
    totalRevenue: 45280,
    totalOrders: 1247,
    averageOrder: 36.31,
    growthRate: 12.5
  },
  channels: {
    inStore: { revenue: 28450, orders: 823, percentage: 62.8 },
    doorDash: { revenue: 8920, orders: 245, percentage: 19.7 },
    uberEats: { revenue: 4560, orders: 98, percentage: 10.1 },
    grubHub: { revenue: 3350, orders: 81, percentage: 7.4 }
  },
  topItems: [
    { name: "Carrot Cake", revenue: 2840, orders: 78, growth: 15.2 },
    { name: "Carrot Juice", revenue: 2150, orders: 156, growth: 8.7 },
    { name: "Carrot Soup", revenue: 1890, orders: 42, growth: -3.1 },
    { name: "Carrot Fries", revenue: 1650, orders: 89, growth: 22.4 },
    { name: "Carrot Salad", revenue: 1420, orders: 67, growth: 5.8 }
  ],
  addOns: [
    { name: "Extra Carrots", revenue: 890, orders: 234, percentage: 18.7 },
    { name: "Organic Upgrade", revenue: 670, orders: 156, percentage: 12.5 },
    { name: "Delivery Insurance", revenue: 450, orders: 89, percentage: 7.1 },
    { name: "Priority Service", revenue: 320, orders: 45, percentage: 2.6 }
  ],
  trends: [
    { period: "Jan", revenue: 38500, orders: 1056 },
    { period: "Feb", revenue: 41200, orders: 1134 },
    { period: "Mar", revenue: 39800, orders: 1098 },
    { period: "Apr", revenue: 45280, orders: 1247 }
  ]
};

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="text-muted-foreground">
            Track your sales performance across all channels
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.summary.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +{salesData.summary.growthRate}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(salesData.summary.totalOrders)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +8.2% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.summary.averageOrder)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +3.9% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{salesData.summary.growthRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              Strong performance
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Channel</CardTitle>
          <CardDescription>
            Distribution of sales across different ordering channels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In-Store</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(salesData.channels.inStore.revenue)}
                </span>
              </div>
              <Progress value={salesData.channels.inStore.percentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{salesData.channels.inStore.orders} orders</span>
                <span>{salesData.channels.inStore.percentage}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">DoorDash</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(salesData.channels.doorDash.revenue)}
                </span>
              </div>
              <Progress value={salesData.channels.doorDash.percentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{salesData.channels.doorDash.orders} orders</span>
                <span>{salesData.channels.doorDash.percentage}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">UberEats</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(salesData.channels.uberEats.revenue)}
                </span>
              </div>
              <Progress value={salesData.channels.uberEats.percentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{salesData.channels.uberEats.orders} orders</span>
                <span>{salesData.channels.uberEats.percentage}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">GrubHub</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(salesData.channels.grubHub.revenue)}
                </span>
              </div>
              <Progress value={salesData.channels.grubHub.percentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{salesData.channels.grubHub.orders} orders</span>
                <span>{salesData.channels.grubHub.percentage}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
          <CardDescription>
            Deep dive into your sales performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="top-items">Top Items</TabsTrigger>
              <TabsTrigger value="add-ons">Add-ons</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <SalesAreaChart />
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">In-Store Sales</span>
                        <span className="text-sm font-medium">{salesData.channels.inStore.percentage}%</span>
                      </div>
                      <Progress value={salesData.channels.inStore.percentage} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Delivery Services</span>
                        <span className="text-sm font-medium">
                          {salesData.channels.doorDash.percentage + salesData.channels.uberEats.percentage + salesData.channels.grubHub.percentage}%
                        </span>
                      </div>
                      <Progress 
                        value={salesData.channels.doorDash.percentage + salesData.channels.uberEats.percentage + salesData.channels.grubHub.percentage} 
                        className="h-2" 
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversion Rate</span>
                      <Badge variant="secondary">12.4%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Customer Retention</span>
                      <Badge variant="secondary">78.2%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Peak Hours</span>
                      <Badge variant="secondary">6-8 PM</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Best Day</span>
                      <Badge variant="secondary">Saturday</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="top-items" className="space-y-4">
              <div className="space-y-4">
                {salesData.topItems.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-medium text-primary">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatNumber(item.orders)} orders
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.revenue)}</p>
                          <div className="flex items-center text-sm">
                            {item.growth > 0 ? (
                              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                            ) : (
                              <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                            )}
                            <span className={item.growth > 0 ? "text-green-600" : "text-red-600"}>
                              {Math.abs(item.growth)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="add-ons" className="space-y-4">
              <div className="space-y-4">
                {salesData.addOns.map((addon, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{addon.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(addon.orders)} orders
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(addon.revenue)}</p>
                          <p className="text-sm text-muted-foreground">
                            {addon.percentage}% of orders
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Trends</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {salesData.trends.map((trend, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{trend.period}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(trend.revenue)}
                          </span>
                        </div>
                        <Progress 
                          value={(trend.revenue / Math.max(...salesData.trends.map(t => t.revenue))) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Volume</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {salesData.trends.map((trend, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{trend.period}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatNumber(trend.orders)} orders
                          </span>
                        </div>
                        <Progress 
                          value={(trend.orders / Math.max(...salesData.trends.map(t => t.orders))) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 