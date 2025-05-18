"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OrganizationPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/organization/general");
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
