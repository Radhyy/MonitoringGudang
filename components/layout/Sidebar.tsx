"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Users, 
  FileText, 
  TrendingUp,
  Box,
  ClipboardList,
  Bell,
  Layers
} from "lucide-react";

interface SidebarProps {
  role: "OWNER" | "ADMIN_GUDANG" | "KARYAWAN";
}

export default function Sidebar({ role }: SidebarProps) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();

  const getMenuItems = () => {
    switch (role) {
      case "OWNER":
        return [
          { name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
          { name: "Laporan Stok", href: "/owner/laporan/stok", icon: Package },
          { name: "Pembelian Masuk", href: "/owner/laporan/pembelian", icon: ArrowDownToLine },
          { name: "Penjualan", href: "/owner/laporan/penjualan", icon: ArrowUpFromLine },
          { name: "Pemakaian Packing", href: "/owner/laporan/pemakaian", icon: Box },
          { name: "Penggajian", href: "/owner/laporan/penggajian", icon: FileText },
          { name: "Laba Rugi", href: "/owner/laporan/laba-rugi", icon: TrendingUp },
          { name: "Kelola User", href: "/owner/kelola-user", icon: Users },
        ];
      case "ADMIN_GUDANG":
        return [
          { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { name: "Data Barang", href: "/admin/barang", icon: Package },
          { name: "Kelola Produk", href: "/admin/produk", icon: Layers },
          { name: "Supplier", href: "/admin/supplier", icon: Users },
          { name: "Barang Masuk", href: "/admin/barang-masuk", icon: ArrowDownToLine },
          { name: "Barang Keluar", href: "/admin/barang-keluar", icon: ArrowUpFromLine },
          { name: "Input Packing", href: "/admin/packing", icon: Box },
          { name: "Input Penjualan", href: "/admin/penjualan", icon: TrendingUp },
          { name: "Penggajian", href: "/admin/penggajian", icon: FileText },
        ];
      case "KARYAWAN":
        return [
          { name: "Dashboard Gaji", href: "/karyawan/dashboard", icon: LayoutDashboard },
          { name: "Data Barang", href: "/karyawan/barang", icon: Package },
          { name: "Supplier", href: "/karyawan/supplier", icon: Users },
          { name: "Input Barang Masuk", href: "/karyawan/barang-masuk/tambah", icon: ArrowDownToLine },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside 
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-slate-900 text-slate-300 min-h-screen transition-all duration-300 ease-in-out flex flex-col relative z-20 border-r border-slate-800 shadow-2xl shrink-0`}
    >
      {/* Sidebar Header */}
      <div className="h-[88px] flex items-center justify-between px-6 border-b border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden w-full">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight whitespace-nowrap">GudangKu</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Box className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center ${isCollapsed ? "justify-center" : "justify-start"} px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-blue-600/15 text-blue-400" 
                  : "hover:bg-slate-800 hover:text-white"
              }`}
              title={isCollapsed ? item.name : ""}
            >
              <item.icon className={`w-[22px] h-[22px] shrink-0 ${isActive ? "text-blue-500" : "text-slate-400 group-hover:text-slate-300"}`} />
              {!isCollapsed && (
                <span className="ml-3 font-medium text-sm whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Profile / Logout */}
      <div className="p-4 border-t border-slate-800 mt-auto">
        <button
          onClick={() => {
            // Need to import signOut from next-auth/react at the top
            import("next-auth/react").then((mod) => mod.signOut({ callbackUrl: "/login" }));
          }}
          className={`flex items-center w-full ${isCollapsed ? "justify-center" : "justify-start"} px-3 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors group`}
          title={isCollapsed ? "Logout" : ""}
        >
          {/* Need to import LogOut icon at the top */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px] shrink-0"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
          {!isCollapsed && <span className="ml-3 font-medium text-sm whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
