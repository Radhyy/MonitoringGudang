"use client";

import Sidebar from "./Sidebar";
import { ReactNode } from "react";
import { SidebarProvider } from "./SidebarContext";
import { useSidebar } from "./SidebarContext";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "OWNER" | "ADMIN_GUDANG" | "KARYAWAN";
}

function LayoutContent({ children, role }: DashboardLayoutProps) {
  const { isMobileOpen, closeMobile } = useSidebar();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] relative">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar role={role} />
      </div>

      {/* Mobile Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed top-0 left-0 h-full z-40 md:hidden transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar role={role} mobile onClose={closeMobile} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto min-w-0">
        <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <LayoutContent role={role}>{children}</LayoutContent>
    </SidebarProvider>
  );
}
