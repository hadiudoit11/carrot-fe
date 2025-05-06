"use client";

import { Activity } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Metric {
    label: string;
    value: string;
    trend: number;
    unit?: "cal" | "min" | "hrs";
}

const METRIC_COLORS = {
    Move: "#FF2D55",
    Exercise: "#2CD758",
    Stand: "#007AFF",
} as const;

function CardDetails({
    metrics = [],
    className,
}: {
    metrics?: Metric[];
    className?: string;
}) {
    const [isHovering, setIsHovering] = useState<string | null>(null);

    return (
        <div
            className={cn(
                "relative rounded-lg p-3",
                "bg-card",

                "transition-all duration-300",
                className
            )}
        >
            <div className="grid grid-cols-3 gap-4">
                {metrics.map((metric) => (
                    <div
                        key={metric.label}
                        className="relative flex flex-col items-center"
                        onMouseEnter={() => setIsHovering(metric.label)}
                        onMouseLeave={() => setIsHovering(null)}
                    >
                        <div className="relative w-12 h-12 md:w-16 md:h-16">
                            <div className="absolute inset-0 rounded-full border-zinc-200 dark:border-zinc-800/50" />
                            <div
                                className={cn(
                                    "absolute inset-0 rounded-full border-4 transition-all duration-500",
                                    isHovering === metric.label && "scale-105"
                                )}
                                style={{
                                    borderColor:
                                        METRIC_COLORS[
                                            metric.label as keyof typeof METRIC_COLORS
                                        ],
                                    clipPath: `polygon(0 0, 100% 0, 100% ${metric.trend}%, 0 ${metric.trend}%)`,
                                }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-sm md:text-base font-bold text-card-foreground">
                                    {metric.value}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {metric.unit}
                                </span>
                            </div>
                        </div>
                        <span className="mt-2 text-xs md:text-sm font-medium text-card-foreground">
                            {metric.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {metric.trend}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const INITIAL_METRICS: Metric[] = [
    { label: "Move", value: "420", trend: 85, unit: "cal" },
    { label: "Exercise", value: "35", trend: 70, unit: "min" },
    { label: "Stand", value: "10", trend: 83, unit: "hrs" },
];

export default function ProgressBars() {
    const [metrics] = useState<Metric[]>(INITIAL_METRICS);

    return (
        <div className="flex items-center">
            <CardDetails metrics={metrics} />
        </div>
    );
}
