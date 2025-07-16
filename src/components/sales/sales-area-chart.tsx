"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock sales data for the last 30 days
const salesChartData = [
  { date: "2024-05-01", inStore: 28450, doorDash: 8920, uberEats: 4560, grubHub: 3350 },
  { date: "2024-05-02", inStore: 28920, doorDash: 8230, uberEats: 4120, grubHub: 2980 },
  { date: "2024-05-03", inStore: 27560, doorDash: 9450, uberEats: 5230, grubHub: 3670 },
  { date: "2024-05-04", inStore: 31200, doorDash: 10230, uberEats: 5890, grubHub: 4120 },
  { date: "2024-05-05", inStore: 29890, doorDash: 8760, uberEats: 4450, grubHub: 3230 },
  { date: "2024-05-06", inStore: 26540, doorDash: 7230, uberEats: 3780, grubHub: 2890 },
  { date: "2024-05-07", inStore: 28920, doorDash: 8230, uberEats: 4120, grubHub: 2980 },
  { date: "2024-05-08", inStore: 27560, doorDash: 9450, uberEats: 5230, grubHub: 3670 },
  { date: "2024-05-09", inStore: 31200, doorDash: 10230, uberEats: 5890, grubHub: 4120 },
  { date: "2024-05-10", inStore: 29890, doorDash: 8760, uberEats: 4450, grubHub: 3230 },
  { date: "2024-05-11", inStore: 26540, doorDash: 7230, uberEats: 3780, grubHub: 2890 },
  { date: "2024-05-12", inStore: 28920, doorDash: 8230, uberEats: 4120, grubHub: 2980 },
  { date: "2024-05-13", inStore: 27560, doorDash: 9450, uberEats: 5230, grubHub: 3670 },
  { date: "2024-05-14", inStore: 31200, doorDash: 10230, uberEats: 5890, grubHub: 4120 },
  { date: "2024-05-15", inStore: 29890, doorDash: 8760, uberEats: 4450, grubHub: 3230 },
  { date: "2024-05-16", inStore: 26540, doorDash: 7230, uberEats: 3780, grubHub: 2890 },
  { date: "2024-05-17", inStore: 28920, doorDash: 8230, uberEats: 4120, grubHub: 2980 },
  { date: "2024-05-18", inStore: 27560, doorDash: 9450, uberEats: 5230, grubHub: 3670 },
  { date: "2024-05-19", inStore: 31200, doorDash: 10230, uberEats: 5890, grubHub: 4120 },
  { date: "2024-05-20", inStore: 29890, doorDash: 8760, uberEats: 4450, grubHub: 3230 },
  { date: "2024-05-21", inStore: 26540, doorDash: 7230, uberEats: 3780, grubHub: 2890 },
  { date: "2024-05-22", inStore: 28920, doorDash: 8230, uberEats: 4120, grubHub: 2980 },
  { date: "2024-05-23", inStore: 27560, doorDash: 9450, uberEats: 5230, grubHub: 3670 },
  { date: "2024-05-24", inStore: 31200, doorDash: 10230, uberEats: 5890, grubHub: 4120 },
  { date: "2024-05-25", inStore: 29890, doorDash: 8760, uberEats: 4450, grubHub: 3230 },
  { date: "2024-05-26", inStore: 26540, doorDash: 7230, uberEats: 3780, grubHub: 2890 },
  { date: "2024-05-27", inStore: 28920, doorDash: 8230, uberEats: 4120, grubHub: 2980 },
  { date: "2024-05-28", inStore: 27560, doorDash: 9450, uberEats: 5230, grubHub: 3670 },
  { date: "2024-05-29", inStore: 31200, doorDash: 10230, uberEats: 5890, grubHub: 4120 },
  { date: "2024-05-30", inStore: 29890, doorDash: 8760, uberEats: 4450, grubHub: 3230 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
  },
  inStore: {
    label: "In-Store",
    color: "hsl(var(--chart-1))",
  },
  doorDash: {
    label: "DoorDash",
    color: "hsl(var(--chart-2))",
  },
  uberEats: {
    label: "UberEats",
    color: "hsl(var(--chart-3))",
  },
  grubHub: {
    label: "GrubHub",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function SalesAreaChart() {
  const [timeRange, setTimeRange] = React.useState("30d")

  const filteredData = salesChartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-05-30")
    let daysToSubtract = 30
    if (timeRange === "14d") {
      daysToSubtract = 14
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>
            Daily revenue across all sales channels
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 30 days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="14d" className="rounded-lg">
              Last 14 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="w-full"
        >
                    <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillInStore" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-inStore)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-inStore)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillDoorDash" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-doorDash)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-doorDash)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillUberEats" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-uberEats)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-uberEats)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillGrubHub" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-grubHub)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-grubHub)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) {
                  return null
                }
                
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-sm">
                    <div className="space-y-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {new Date(label).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {payload.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-xs text-muted-foreground">
                                {item.dataKey}
                              </span>
                            </div>
                            <span className="font-bold text-xs">
                              {formatCurrency(item.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            <Area
              dataKey="grubHub"
              type="natural"
              fill="url(#fillGrubHub)"
              stroke="var(--color-grubHub)"
              stackId="a"
            />
            <Area
              dataKey="uberEats"
              type="natural"
              fill="url(#fillUberEats)"
              stroke="var(--color-uberEats)"
              stackId="a"
            />
            <Area
              dataKey="doorDash"
              type="natural"
              fill="url(#fillDoorDash)"
              stroke="var(--color-doorDash)"
              stackId="a"
            />
            <Area
              dataKey="inStore"
              type="natural"
              fill="url(#fillInStore)"
              stroke="var(--color-inStore)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 