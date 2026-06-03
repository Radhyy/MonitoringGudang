"use client";

import { useSidebar } from "./SidebarContext";
import { Menu } from "lucide-react";
import { signOut } from "next-auth/react";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div className="flex items-center gap-4">
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600 shadow-sm hover:shadow-md shrink-0"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Title & Description without background/border */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {description && <p className="text-slate-500 mt-1">{description}</p>}
        </div>
      </div>
    </div>
  );
}
