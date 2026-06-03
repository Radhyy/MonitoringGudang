import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const role = session?.user?.role;

  const isLoginPage = nextUrl.pathname === "/login";
  const isRootOrDashboard = nextUrl.pathname === "/" || nextUrl.pathname === "/dashboard";
  
  const isOwnerRoute = nextUrl.pathname.startsWith("/owner");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isKaryawanRoute = nextUrl.pathname.startsWith("/karyawan");

  // Kalau belum login, redirect ke login (kecuali sudah di login page)
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Kalau sudah login dan buka halaman login, root, atau /dashboard umum -> redirect ke dashboard masing-masing
  if (isLoggedIn && (isLoginPage || isRootOrDashboard)) {
    if (role === "OWNER") return NextResponse.redirect(new URL("/owner/dashboard", nextUrl));
    if (role === "ADMIN_GUDANG") return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    if (role === "KARYAWAN") return NextResponse.redirect(new URL("/karyawan/dashboard", nextUrl));
  }

  // Proteksi route per role
  if (isOwnerRoute && role !== "OWNER") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (isAdminRoute && role !== "ADMIN_GUDANG") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (isKaryawanRoute && role !== "KARYAWAN") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard",
    "/owner/:path*",
    "/admin/:path*",
    "/karyawan/:path*",
  ],
};
