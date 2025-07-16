"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  ChevronRight,
  ShoppingBag,
  TrendingUp,
  BarChart3,
} from "lucide-react"

import { NavMain } from "@/components/sub/navbars/nav-main"
import { NavProjects } from "@/components/sub/navbars/nav-projects"
import { NavUser } from "@/components/sub/navbars/nav-user"
import { TeamSwitcher } from "@/components/sub/navbars/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Foxtail Coffee",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "HQ",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "WinterPark.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/home",
      icon: SquareTerminal,
      isActive: true,
      // items: [
      //   {
      //     title: "History",
      //     url: "#",
      //   },
      //   {
      //     title: "Starred",
      //     url: "#",
      //   },
      //   {
      //     title: "Settings",
      //     url: "#",
      //   },
      // ],
    },
    {
      title: "Projects",
      url: "/projects/overview",
      icon: Bot,
      items: [
        {
          title: "Overview",
          url: "/projects/overview",
        },
        // {
        //   title: "Projects",
        //   url: "#",
        // },
        // {
        //   title: "Your Tasks",
        //   url: "#",
        // },
      ],
    },
    {
      title: "Training",
      url: "/training",
      icon: BookOpen,
      items: [
        {
          title: "Recipes",
          url: "/training/recipes",
        },
        {
          title: "Operations",
          url: "/training/operations",
        },
        {
          title: "Tutorials",
          url: "/training/tutorials",
        },
        {
          title: "Shop",
          url: "/shop",
        },
      ],
    },
    {
      title: "Grow",
      url: "/grow",
      icon: TrendingUp,
    },
    {
      title: "Sales",
      url: "/sales",
      icon: BarChart3,
    },
    {
      title: "Organization",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/organization/general",
        },
        {
          title: "Sites",
          url: "/organization/sites",
        },
        {
          title: "Billing",
          url: "/organization/billing",
        },
        {
          title: "Roles & Permissions",
          url: "/organization/roles-permissions",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
