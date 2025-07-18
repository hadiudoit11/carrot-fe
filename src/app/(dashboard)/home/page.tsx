"use client";

import { SectionCards } from '@/components/sub/analytics/section-cards';
import { ChartAreaInteractive } from '@/components/sub/analytics/chart-area-interactive';
import { DataTable } from '@/components/sub/analytics/data-table';

// Sample data for the DataTable
const data = [
  {
    id: 1,
    header: "Homepage Redesign",
    type: "UI/UX",
    status: "In Progress",
    target: "Q3 2024",
    limit: "$10,000",
    reviewer: "Alice Smith",
  },
  {
    id: 2,
    header: "API Performance Audit",
    type: "Backend",
    status: "Done",
    target: "Q2 2024",
    limit: "$5,000",
    reviewer: "Bob Johnson",
  },
  {
    id: 3,
    header: "Mobile App Launch",
    type: "Mobile",
    status: "In Review",
    target: "Q4 2024",
    limit: "$20,000",
    reviewer: "Carol Lee",
  },
  {
    id: 4,
    header: "Security Penetration Test",
    type: "Security",
    status: "Planned",
    target: "Q1 2025",
    limit: "$8,000",
    reviewer: "David Kim",
  },
  {
    id: 5,
    header: "Content Marketing Sprint",
    type: "Marketing",
    status: "Done",
    target: "Q3 2024",
    limit: "$3,000",
    reviewer: "Eve Martinez",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  );
}