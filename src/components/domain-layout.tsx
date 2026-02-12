"use client";

import { useEffect, useState, Suspense } from "react";
import { getDomainConfig } from "~/lib/domains";
import { ThemeToggle } from "./theme-toggle";
import { SignOutButton } from "./auth/signout-button";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Mail } from "lucide-react";

interface DomainLayoutProps {
  children: React.ReactNode;
  headerClassName?: string;
  footerClassName?: string;
  hideAuthActions?: boolean;
}

function DomainLayoutInner({
  children,
  headerClassName,
  footerClassName,
  hideAuthActions = false,
}: DomainLayoutProps) {
  const [domainConfig, setDomainConfig] = useState(() =>
    getDomainConfig("joinnewearthcollective.com")
  );
  const isBrandDomain = domainConfig.theme === "brand";
  const isTestDomain = domainConfig.theme === "tech";
  const navItems = isBrandDomain
    ? domainConfig.nav.filter((item) => item.href !== "/about")
    : domainConfig.nav;

  useEffect(() => {
    const hostname = window.location.hostname || "joinnewearthcollective.com";
    setDomainConfig(getDomainConfig(hostname));
  }, []);

  // Default header/footer styles
  const defaultHeaderClass =
    "border-b border-black/10 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-black/80";
  const defaultFooterClass =
    "mt-auto border-t border-black/10 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-black/80";

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
            {isTestDomain ? (
              <div className="flex items-center space-x-3">
                <div className="relative h-8 w-8">
                  <Image
                    src="/brand/symbol.svg"
                    alt="New Earth Collective"
                    fill
                    className="object-contain"
                  />
                </div>
                <span
                  className="text-xl font-bold text-black dark:text-white"
                  style={{
                    fontFamily: "Airwaves, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  New Earth Collective
                </span>
              </div>
            ) : (
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative h-8 w-8">
                  <Image
                    src="/brand/symbol.svg"
                    alt="New Earth Collective"
                    fill
                    className="object-contain"
                  />
                </div>
                <span
                  className={
                    domainConfig.theme === "brand"
                      ? "bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-xl font-bold text-transparent"
                      : "text-xl font-bold text-black dark:text-white"
                  }
                  style={{
                    fontFamily: "Airwaves, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  New Earth Collective
                </span>
              </Link>
            )}
          </div>

          {/* Center Navigation */}
          <nav className="hidden items-center justify-center space-x-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400 dark:hover:text-[#facf39]"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side: Sign Out & Theme Toggle */}
          <div className="flex flex-1 items-center justify-end gap-3">
            {!hideAuthActions && !isBrandDomain && <SignOutButton />}
            {isBrandDomain ? (
              <Link
                href="/about"
                className="text-sm font-medium text-neutral-700 transition-colors hover:text-[#facf39] dark:text-neutral-200"
              >
                About
              </Link>
            ) : (
              <ThemeToggle />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className={footerClassName || defaultFooterClass}>
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center space-y-8">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10">
                <Image
                  src="/brand/symbol.svg"
                  alt="New Earth Collective"
                  fill
                  className="object-contain"
                />
              </div>
              <span
                className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-lg font-bold text-transparent"
                style={{
                  fontFamily: "Airwaves, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                New Earth Collective
              </span>
            </div>

            {/* Tagline */}
            <p
              className="text-sm text-neutral-600 dark:text-neutral-400"
              style={{ fontFamily: "Bourton, sans-serif", color: "#facf39" }}
            >
              {domainConfig.tagline}
            </p>

            {/* Social and Contact Links */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <a
                href="https://instagram.com/newearthcollectiveco"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
              >
                <Instagram className="h-5 w-5" />
                <span className="text-sm">@newearthcollectiveco</span>
              </a>
              <a
                href="mailto:community@joinnewearthcollective.com"
                className="flex items-center gap-2 text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
              >
                <Mail className="h-5 w-5" />
                <span className="text-sm">community@joinnewearthcollective.com</span>
              </a>
            </div>

            {/* Copyright */}
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              <span>© 2025 New Earth Collective. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function DomainLayout({
  children,
  headerClassName,
  footerClassName,
  hideAuthActions = false,
}: DomainLayoutProps) {
  return (
    <Suspense fallback={null}>
      <DomainLayoutInner
        headerClassName={headerClassName}
        footerClassName={footerClassName}
        hideAuthActions={hideAuthActions}
      >
        {children}
      </DomainLayoutInner>
    </Suspense>
  );
}
