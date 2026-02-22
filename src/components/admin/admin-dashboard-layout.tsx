"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebarProvider, useAdminSidebar } from "./admin-sidebar-context";
import {
  AdminSidebar,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_COLLAPSED,
} from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

// Pages that should NOT get the dashboard shell.
// Gallery listing pages (/admin/shaders, /admin/playground) DO get the shell.
// Individual shader viewers and playground demos do NOT (they're full-screen).
const STANDALONE_PREFIXES = ["/admin/templates/"];

// These are exact matches for standalone checking — the gallery index pages
// at /admin/shaders and /admin/playground should get the shell,
// but their sub-pages (e.g. /admin/shaders/flower-of-life) should not.
function isStandalonePage(pathname: string): boolean {
  // Exact standalone prefixes
  if (STANDALONE_PREFIXES.some((p) => pathname.startsWith(p))) return true;

  // Individual shader pages (not the gallery index)
  if (pathname.startsWith("/admin/shaders/") && pathname !== "/admin/shaders") {
    return true;
  }

  // Individual playground pages (not the gallery index)
  if (
    pathname.startsWith("/admin/playground/") &&
    pathname !== "/admin/playground"
  ) {
    return true;
  }

  // Landing page routes
  if (pathname.startsWith("/admin/dope-ass-landing")) return true;
  if (pathname.startsWith("/admin/join-community-1")) return true;
  if (pathname.startsWith("/admin/launch-landing-1")) return true;

  return false;
}

function DashboardContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed, closeMobile } = useAdminSidebar();

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  if (isStandalonePage(pathname)) {
    return <div className="min-h-screen bg-black text-white">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminSidebar />
      <AdminHeader />

      <main
        className="min-h-screen pt-14 transition-all duration-200 ease-out"
        style={{
          marginLeft: isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
        }}
      >
        <div className="p-4 sm:p-6">{children}</div>
      </main>

      {/* Mobile: remove margin on main */}
      <style jsx>{`
        @media (max-width: 767px) {
          main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminSidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </AdminSidebarProvider>
  );
}
