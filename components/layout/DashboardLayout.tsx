"use client";

import Sidebar from "./Sidebar";
import { ReactNode } from "react";
import { SidebarProvider } from "./SidebarContext";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "OWNER" | "ADMIN_GUDANG" | "PACKING";
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#F8FAFC]">
        {/* Sidebar - fixed on the left */}
        <Sidebar role={role} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="p-8 w-full max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
