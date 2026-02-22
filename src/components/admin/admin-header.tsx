"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, ChevronRight } from "lucide-react";
import { createClient } from "~/lib/supabase/client";
import { AdminSidebarMobileToggle } from "./admin-sidebar";
import { useAdminSidebar } from "./admin-sidebar-context";
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED } from "./admin-sidebar";
import { ADMIN_SIDEBAR_NAV } from "./admin-nav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

function useBreadcrumbs() {
  const pathname = usePathname();

  for (const item of ADMIN_SIDEBAR_NAV) {
    if (item.href === pathname) {
      return [{ label: item.title, href: item.href, isCurrent: true }];
    }

    if (item.items) {
      for (const subItem of item.items) {
        if (pathname.startsWith(subItem.href)) {
          const isExactMatch = pathname === subItem.href;
          const deeperPath = pathname.slice(subItem.href.length);
          const deeperSegments = deeperPath.split("/").filter(Boolean);

          const crumbs = [
            { label: item.title, href: undefined, isCurrent: false },
            {
              label: subItem.title,
              href: subItem.href,
              isCurrent: isExactMatch,
            },
          ];

          if (deeperSegments.length > 0) {
            let currentPath = subItem.href;
            for (let i = 0; i < deeperSegments.length; i++) {
              const segment = deeperSegments[i]!;
              currentPath = `${currentPath}/${segment}`;
              const isLast = i === deeperSegments.length - 1;
              crumbs.push({
                label: formatSegment(segment),
                href: isLast ? undefined : currentPath,
                isCurrent: isLast,
              });
            }
          }

          return crumbs;
        }
      }
    }
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "admin") {
    return segments.slice(1).map((seg, idx, arr) => ({
      label: formatSegment(seg),
      href:
        idx < arr.length - 1
          ? `/admin/${arr.slice(0, idx + 1).join("/")}`
          : undefined,
      isCurrent: idx === arr.length - 1,
    }));
  }

  return [];
}

function formatSegment(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function AdminHeader() {
  const router = useRouter();
  const { isCollapsed } = useAdminSidebar();
  const breadcrumbs = useBreadcrumbs();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header
      className="fixed top-0 right-0 z-20 flex h-14 items-center justify-between border-b bg-black/95 px-4 backdrop-blur-sm transition-all duration-200 ease-out"
      style={{
        left: `${isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}px`,
        borderColor: "rgba(250, 207, 57, 0.2)",
      }}
    >
      {/* Left: Mobile hamburger + Breadcrumbs */}
      <div className="flex items-center gap-4">
        <AdminSidebarMobileToggle />

        {breadcrumbs.length > 0 && (
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </BreadcrumbSeparator>
                  )}
                  <BreadcrumbItem>
                    {crumb.isCurrent ? (
                      <BreadcrumbPage className="text-white">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : crumb.href ? (
                      <BreadcrumbLink
                        href={crumb.href}
                        className="text-gray-400 hover:text-white"
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <span className="text-gray-500">{crumb.label}</span>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      {/* Right side: sign out */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>

      {/* Mobile left adjustment */}
      <style jsx>{`
        @media (max-width: 767px) {
          header {
            left: 0 !important;
          }
        }
      `}</style>
    </header>
  );
}
