"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"

import { cn } from "@/lib/utils"

export interface ChartConfig {
  [key: string]: {
    label: string
    color?: string
  }
}

interface ChartContainerProps {
  config: ChartConfig
  children: React.ReactNode
  className?: string
}

export function ChartContainer({
  config,
  children,
  className,
}: ChartContainerProps) {
  const cssVars = React.useMemo(() => {
    const vars: Record<string, string> = {}
    Object.entries(config).forEach(([key, value]) => {
      if (value.color) {
        vars[`--color-${key}`] = value.color
      }
    })
    return vars
  }, [config])

  return (
    <div className={cn("", className)} style={cssVars}>
      {children}
    </div>
  )
}

interface ChartTooltipProps {
  children: React.ReactNode
  cursor?: boolean
  content?: React.ReactNode
}

export function ChartTooltip({ children, ...props }: ChartTooltipProps) {
  return React.cloneElement(children as React.ReactElement, props)
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  label?: string
  labelFormatter?: (label: string) => string
  formatter?: (value: any, name: string) => [string, string]
  indicator?: "dot" | "line"
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  formatter,
  indicator = "dot",
}: ChartTooltipContentProps) {
  if (!active || !payload) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="space-y-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {labelFormatter ? labelFormatter(label || "") : label}
          </span>
        </div>
        <div className="space-y-1">
          {payload.map((item, index) => {
            const [formattedValue, formattedName] = formatter 
              ? formatter(item.value, item.dataKey || item.name)
              : [item.value?.toLocaleString(), item.dataKey || item.name]
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {indicator === "dot" && (
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formattedName}
                  </span>
                </div>
                <span className="font-bold text-xs">
                  {formattedValue}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface ChartLegendProps {
  children: React.ReactNode
  content?: React.ReactNode
}

export function ChartLegend({ children, content }: ChartLegendProps) {
  return React.cloneElement(children as React.ReactElement, { content })
}

interface ChartLegendContentProps {
  payload?: any[]
}

export function ChartLegendContent({ payload }: ChartLegendContentProps) {
  if (!payload) {
    return null
  }

  return (
    <div className="flex items-center justify-center space-x-6 pt-4">
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center space-x-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}
