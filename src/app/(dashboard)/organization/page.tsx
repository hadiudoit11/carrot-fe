import HomeArticles from "@/components/main/dashboard-home";
import React from "react";
import Layout from "@/app/(dashboard)/layout";
import OrgHome from "@/components/main/organization-home";
import CreateUser from "@/components/sub/users";
import Navbar from "@/components/sub/navbars/navbar";

export default function Home() {
  return (
    <div>
      <div>
        <Navbar/>
      </div>
      <div className="bg-gray-100 p-8">
        <CreateUser />
      </div>
    </div>
  );
}
