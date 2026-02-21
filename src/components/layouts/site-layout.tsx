"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Mail, Menu, X } from "lucide-react";
import { Button } from "~/components/ui/button";

interface SiteLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
  hideFooter?: boolean;
}

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Values", href: "/values" },
  { name: "Resources", href: "/resources" },
];

export function SiteLayout({ children, hideNav = false, hideFooter = false }: SiteLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Skip to content - a11y */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[#FACF39] focus:px-4 focus:py-2 focus:text-black focus:font-bold focus:outline-none"
      >
        Skip to content
      </a>

      {/* Fixed Navigation */}
      {!hideNav && (
        <header
          className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
            isScrolled ? "bg-black/90 backdrop-blur-md" : "bg-transparent"
          }`}
          style={{
            borderColor: "rgba(250, 207, 57, 0.2)",
          }}
        >
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-8 w-8">
                <Image
                  src="/brand/symbol.svg"
                  alt="New Earth Collective"
                  fill
                  className="object-contain"
                />
              </div>
              <span
                className="text-lg font-bold leading-tight bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent"
                style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
              >
                New Earth Collective
              </span>
            </Link>

            {/* Desktop Navigation + Button (Right-aligned) */}
            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-white/80 transition-colors hover:text-[#FACF39]"
                >
                  {link.name}
                </Link>
              ))}
              <Button
                asChild
                className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] px-6 py-2 font-bold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#f6c43f]/30"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                <Link href="/questionnaire">Join Now</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="text-[#FACF39] md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </nav>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="absolute left-0 right-0 top-16 border-t border-white/10 bg-black/95 backdrop-blur-md md:hidden">
              <div className="flex flex-col px-4 py-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="border-b border-white/10 py-3 text-lg font-medium text-white/80 transition-colors hover:text-[#FACF39]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <Button
                  asChild
                  className="mt-6 bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] py-3 font-bold text-black"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  <Link href="/questionnaire" onClick={() => setMobileMenuOpen(false)}>
                    Join Now
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Main Content */}
      <main id="main-content">{children}</main>

      {/* Footer */}
      {!hideFooter && (
        <footer className="border-t border-white/10 bg-black px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center gap-8">
              {/* Footer Navigation */}
              <nav className="flex flex-wrap items-center justify-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-[#FACF39]"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Social & Contact */}
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
                <a
                  href="https://www.instagram.com/newearthcollectiveco/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/70 transition-colors hover:text-[#FACF39]"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="text-sm">@newearthcollectiveco</span>
                </a>
                <a
                  href="mailto:community@joinnewearthcollective.com"
                  className="flex items-center gap-2 text-white/70 transition-colors hover:text-[#FACF39]"
                >
                  <Mail className="h-5 w-5" />
                  <span className="text-sm">community@joinnewearthcollective.com</span>
                </a>
              </div>

              {/* Tagline */}
              <p
                className="text-center text-sm text-[#FACF39]"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                Empowering the Co-Creation of Heaven on Earth
              </p>

              {/* Copyright */}
              <p className="text-xs text-white/50">
                © 2026 New Earth Collective. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
