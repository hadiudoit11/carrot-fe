"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Building, 
  CreditCard, 
  Users, 
  ShieldCheck, 
  MapPin,
  Settings
} from "lucide-react";

const organizationLinks = [
  {
    title: "General",
    href: "/organization/general",
    icon: Building
  },
  {
    title: "Users",
    href: "/organization/users",
    icon: Users
  },
  {
    title: "Roles",
    href: "/organization/roles-permissions",
    icon: ShieldCheck
  },
  {
    title: "Sites",
    href: "/organization/sites",
    icon: MapPin
  },
  {
    title: "Billing",
    href: "/organization/billing",
    icon: CreditCard
  }
];

export function OrganizationSettingsNav() {
  const pathname = usePathname();
  
  return (
    <nav className="flex flex-col space-y-1">
      {organizationLinks.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
            )}
          >
            <link.icon className="h-4 w-4" />
            <span>{link.title}</span>
          </Link>
        );
      })}
    </nav>
  );
} 