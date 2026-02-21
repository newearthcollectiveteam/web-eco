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
  { name: "About", href: "/about" },
  { name: "Values", href: "/values" },
  { name: "Pathway", href: "/pathway" },
  { name: "Impact", href: "/impact" },
  { name: "Partnerships", href: "/partnerships" },
];

const footerNavigate = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Values", href: "/values" },
  { name: "Pathway", href: "/pathway" },
];

const footerCommunity = [
  { name: "Impact", href: "/impact" },
  { name: "Partnerships", href: "/partnerships" },
  { name: "Questionnaire", href: "/questionnaire" },
];

const footerLegal = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
];

export function SiteLayout({
  children,
  hideNav = false,
  hideFooter = false,
}: SiteLayoutProps) {
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
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-[#FACF39] focus:px-4 focus:py-2 focus:font-bold focus:text-black focus:outline-none"
      >
        Skip to content
      </a>

      {/* Fixed Navigation */}
      {!hideNav && (
        <header
          className={`fixed top-0 right-0 left-0 z-50 border-b transition-all duration-300 ${
            isScrolled ? "bg-black" : "bg-black"
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
                className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-lg leading-tight font-bold text-transparent"
                style={{
                  fontFamily: "Airwaves, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                New Earth Collective
              </span>
            </Link>

            {/* Desktop Navigation + Button (Right-aligned) */}
            <div className="hidden items-center gap-5 md:flex">
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
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </nav>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="absolute top-16 right-0 left-0 border-t border-white/10 bg-black/95 backdrop-blur-md md:hidden">
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
                  <Link
                    href="/questionnaire"
                    onClick={() => setMobileMenuOpen(false)}
                  >
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
        <footer
          className="border-t px-4 py-16"
          style={{
            borderColor: "rgba(250, 207, 57, 0.3)",
            backgroundColor: "#0b0b0b",
          }}
        >
          <div className="mx-auto max-w-7xl">
            {/* Main footer grid — equal outer columns, center auto-sized */}
            <div className="grid items-start gap-8 md:grid-cols-[1fr_auto_1fr]">
              {/* Left Column: CTA + Socials */}
              <div className="flex flex-col items-center gap-5 md:items-start">
                <p
                  className="text-lg text-white/90"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Ready to co-create?
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] px-8 py-3 font-bold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#f6c43f]/30"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  <Link href="/questionnaire">Join Now</Link>
                </Button>
                <div className="flex items-center gap-4">
                  <a
                    href="https://www.instagram.com/newearthcollectiveco/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 transition-colors hover:text-[#FACF39]"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="mailto:community@joinnewearthcollective.com"
                    className="text-white/60 transition-colors hover:text-[#FACF39]"
                    aria-label="Email"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Center Column: Logo + Tagline */}
              <div className="flex flex-col items-center gap-4 px-8">
                <div className="relative h-16 w-16">
                  <Image
                    src="/brand/symbol.svg"
                    alt="New Earth Collective"
                    fill
                    className="object-contain"
                  />
                </div>
                <p
                  className="text-center text-sm text-[#FACF39]"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Empowering the Co-Creation
                  <br />
                  of Heaven on Earth
                </p>
              </div>

              {/* Right Column: 3 Sub-columns */}
              <div className="grid grid-cols-3 gap-8 text-sm md:justify-items-end">
                {/* Navigate */}
                <div>
                  <h4
                    className="mb-3 text-xs font-bold tracking-wider text-[#FACF39]/80 uppercase"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Navigate
                  </h4>
                  <ul className="space-y-2">
                    {footerNavigate.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-white/60 transition-colors hover:text-[#FACF39]"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Community */}
                <div>
                  <h4
                    className="mb-3 text-xs font-bold tracking-wider text-[#FACF39]/80 uppercase"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Community
                  </h4>
                  <ul className="space-y-2">
                    {footerCommunity.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-white/60 transition-colors hover:text-[#FACF39]"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h4
                    className="mb-3 text-xs font-bold tracking-wider text-[#FACF39]/80 uppercase"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Legal
                  </h4>
                  <ul className="space-y-2">
                    {footerLegal.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-white/60 transition-colors hover:text-[#FACF39]"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Copyright — full width below */}
            <div className="mt-10 border-t border-white/10 pt-6 text-center">
              <p className="text-xs text-white/40">
                &copy; {new Date().getFullYear()} New Earth Collective. All
                rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
