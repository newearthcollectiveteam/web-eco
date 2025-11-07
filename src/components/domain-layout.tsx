"use client";

import { getDomainConfig } from "~/lib/domains";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";

interface DomainLayoutProps {
  children: React.ReactNode;
}

export function DomainLayout({ children }: DomainLayoutProps) {
  // Use test domain configuration
  const domainConfig = getDomainConfig("test.joinnewearthcollective.com");

  return (
    <div
      className="min-h-screen transition-all duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Header Navigation */}
      <header className="border-border/40 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          {/* Left side: Logo */}
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl font-bold"
            >
              <span className="text-2xl">{domainConfig.logo}</span>
              <span className="hidden sm:inline">{domainConfig.name}</span>
            </Link>
          </div>

          {/* Center Navigation */}
          <nav className="hidden items-center space-x-6 md:flex">
            {domainConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side: Theme Toggle */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-border/40 mt-auto border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{domainConfig.logo}</span>
              <span className="font-medium">{domainConfig.name}</span>
            </div>
            <p className="text-muted-foreground text-sm">
              {domainConfig.tagline}
            </p>
            <div className="text-muted-foreground flex space-x-4 text-sm">
              <span>© 2025</span>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
