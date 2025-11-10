"use client";

import { getDomainConfig } from "~/lib/domains";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import Image from "next/image";

interface DomainLayoutProps {
  children: React.ReactNode;
  headerClassName?: string;
  footerClassName?: string;
}

export function DomainLayout({ children, headerClassName, footerClassName }: DomainLayoutProps) {
  // Use test domain configuration
  const domainConfig = getDomainConfig("test.joinnewearthcollective.com");

  // Default header/footer styles
  const defaultHeaderClass = "border-b border-black/10 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-black/80";
  const defaultFooterClass = "mt-auto border-t border-black/10 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-black/80";

  return (
    <div
      className="min-h-screen transition-all duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Header Navigation */}
      <header className={headerClassName || defaultHeaderClass}>
        <div className="container mx-auto flex h-16 items-center px-4">
          {/* Left side: Logo */}
          <div className="flex flex-1 items-center">
            <Link
              href="/"
              className="flex items-center space-x-3"
            >
              <div className="relative h-8 w-8">
                <Image
                  src="/brand/symbol.svg"
                  alt="New Earth Collective"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-black dark:text-white" style={{ fontFamily: 'Airwaves, sans-serif', letterSpacing: '0.05em' }}>
                New Earth Collective
              </span>
            </Link>
          </div>

          {/* Center Navigation */}
          <nav className="hidden items-center justify-center space-x-8 md:flex">
            {domainConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400 dark:hover:text-[#facf39]"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side: Theme Toggle */}
          <div className="flex flex-1 items-center justify-end">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className={footerClassName || defaultFooterClass}>
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10">
                <Image
                  src="/brand/symbol.svg"
                  alt="New Earth Collective"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-black dark:text-white" style={{ fontFamily: 'Airwaves, sans-serif', letterSpacing: '0.05em' }}>
                New Earth Collective
              </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400" style={{ fontFamily: 'Bourton, sans-serif', color: '#facf39' }}>
              {domainConfig.tagline}
            </p>
            <div className="flex space-x-6 text-sm text-neutral-600 dark:text-neutral-400">
              <span>© 2025</span>
              <Link href="/privacy" className="transition-colors hover:text-[#facf39]">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-[#facf39]">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
