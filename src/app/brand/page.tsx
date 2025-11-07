"use client";

import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DomainLayout } from "~/components/domain-layout";
import { BackButton } from "~/components/back-button";
import { Download, Palette, FileType, Image as ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const BRAND_ASSETS = {
  logos: {
    svg: [
      {
        name: "Color logo with background",
        file: "Logo Files/svg/Color logo with background.svg",
        bg: "dark",
        description: "Full color on dark slate background"
      },
      {
        name: "Color logo - no background",
        file: "Logo Files/svg/Color logo - no background.svg",
        bg: "black",
        description: "Golden logo on transparent background"
      },
      {
        name: "White logo - no background",
        file: "Logo Files/svg/White logo - no background.svg",
        bg: "gradient-dark",
        description: "White version for dark backgrounds"
      },
      {
        name: "Black logo - no background",
        file: "Logo Files/svg/Black logo - no background.svg",
        bg: "gradient-light",
        description: "Black version for light backgrounds"
      },
    ],
    png: [
      {
        name: "Color logo with background",
        file: "Logo Files/png/Color logo with background.png",
        bg: "dark",
        description: "Full color on dark slate background"
      },
      {
        name: "Color logo - no background",
        file: "Logo Files/png/Color logo - no background.png",
        bg: "black",
        description: "Golden logo on transparent background"
      },
      {
        name: "White logo - no background",
        file: "Logo Files/png/White logo - no background.png",
        bg: "gradient-dark",
        description: "White version for dark backgrounds"
      },
      {
        name: "Black logo - no background",
        file: "Logo Files/png/Black logo - no background.png",
        bg: "gradient-light",
        description: "Black version for light backgrounds"
      },
    ],
    pdf: [
      {
        name: "Color logo with background",
        file: "Logo Files/pdf/Color logo with background.pdf",
        preview: "Logo Files/png/Color logo with background.png",
        bg: "dark",
        description: "Print-ready full color version"
      },
      {
        name: "Color logo - no background",
        file: "Logo Files/pdf/Color logo - no background.pdf",
        preview: "Logo Files/png/Color logo - no background.png",
        bg: "black",
        description: "Print-ready golden version"
      },
      {
        name: "White logo - no background",
        file: "Logo Files/pdf/White logo - no background.pdf",
        preview: "Logo Files/png/White logo - no background.png",
        bg: "gradient-dark",
        description: "Print-ready white version"
      },
      {
        name: "Black logo - no background",
        file: "Logo Files/pdf/Black logo - no background.pdf",
        preview: "Logo Files/png/Black logo - no background.png",
        bg: "gradient-light",
        description: "Print-ready black version"
      },
    ],
  },
  favicons: [
    { name: "Android", file: "Logo Files/Favicons/Android.png", size: "192x192" },
    { name: "iPhone", file: "Logo Files/Favicons/iPhone.png", size: "180x180" },
    { name: "Browser", file: "Logo Files/Favicons/browser.png", size: "32x32" },
  ],
};

const getBackgroundClass = (bg: string) => {
  switch (bg) {
    case "dark":
      return "bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-900";
    case "black":
      return "bg-black";
    case "light":
      return "bg-gradient-to-br from-white via-gray-50 to-neutral-50";
    case "gradient-dark":
      return "bg-gradient-to-br from-neutral-100 via-amber-50 to-neutral-100 dark:from-neutral-900 dark:via-amber-950 dark:to-neutral-900";
    case "gradient-light":
      return "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100";
    default:
      return "bg-gray-100 dark:bg-gray-900";
  }
};

export default function BrandPage() {
  const [activeFormat, setActiveFormat] = useState<"svg" | "png" | "pdf">("svg");

  return (
    <DomainLayout>
      <BackButton />
      <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-white dark:from-black dark:via-neutral-950 dark:to-black">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <section className="mb-20 text-center">
            <div className="mb-8 inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-4 backdrop-blur-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl">
                <Palette className="h-7 w-7 text-white" />
              </div>
              <Sparkles className="h-6 w-6 text-amber-400" />
            </div>
            <h1 className="mb-6 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-7xl font-bold text-transparent dark:from-amber-400 dark:via-orange-400 dark:to-amber-500">
              Brand Assets
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-neutral-600 dark:text-slate-300">
              Complete visual identity system featuring our signature golden palette
            </p>
            <div className="flex items-center justify-center gap-3">
              <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-500/20 dark:text-amber-300">
                <FileType className="mr-1.5 h-3.5 w-3.5" />
                SVG · PNG · PDF
              </Badge>
              <Badge className="border-orange-500/30 bg-orange-500/10 text-orange-700 dark:border-orange-500/20 dark:text-orange-300">
                <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                High Resolution
              </Badge>
            </div>
          </section>

          {/* Brand Symbol & Colors */}
          <section className="mb-16">
            <div className="mb-8 text-center">
              <h2 className="mb-3 text-4xl font-bold text-neutral-900 dark:text-white">Brand Identity</h2>
              <p className="text-lg text-neutral-600 dark:text-slate-400">
                Core visual elements and color palette
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Symbol */}
              <Card className="overflow-hidden border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-white">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-black via-neutral-900 to-black flex h-64 items-center justify-center p-12">
                    <div className="relative h-full w-full">
                      <Image
                        src="/brand/symbol.svg"
                        alt="New Earth Collective Symbol"
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 bg-neutral-50 p-5">
                    <div>
                      <h3 className="mb-1 font-semibold text-neutral-900 dark:text-white">Brand Symbol</h3>
                      <p className="text-xs text-neutral-600 dark:text-slate-400">Interconnected unity icon</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                        SVG
                      </Badge>
                      <a href="/brand/symbol.svg" download>
                        <Button
                          size="sm"
                          className="group/btn bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover/btn:translate-y-0.5" />
                          Download
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Brand Colors */}
              <Card className="overflow-hidden border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-white">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <h3 className="mb-2 text-2xl font-semibold text-neutral-900">Brand Colors</h3>
                    <p className="text-sm text-neutral-600">Official color palette</p>
                  </div>

                  <div className="space-y-4">
                    {/* Primary Golden */}
                    <div className="flex items-center gap-4">
                      <div
                        className="h-16 w-16 rounded-xl shadow-lg ring-2 ring-neutral-200 dark:ring-neutral-700"
                        style={{ backgroundColor: '#facf39' }}
                      />
                      <div>
                        <p className="font-mono text-sm font-semibold text-neutral-900">#FACF39</p>
                        <p className="text-xs text-neutral-600">Primary Golden</p>
                      </div>
                    </div>

                    {/* Secondary Dark */}
                    <div className="flex items-center gap-4">
                      <div
                        className="h-16 w-16 rounded-xl shadow-lg ring-2 ring-neutral-200 dark:ring-neutral-700"
                        style={{ backgroundColor: '#393e46' }}
                      />
                      <div>
                        <p className="font-mono text-sm font-semibold text-neutral-900">#393E46</p>
                        <p className="text-xs text-neutral-600">Secondary Dark</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-neutral-200 pt-6 dark:border-neutral-700">
                    <h4 className="mb-3 text-sm font-semibold text-neutral-900">Typography</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Wordmark:</span>
                        <span className="font-medium text-neutral-900">Airwaves Regular</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Slogan:</span>
                        <span className="font-medium text-neutral-900">Bourton Bold</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Logo Variations */}
          <section className="mb-12">
            <div className="mb-8 text-center">
              <h2 className="mb-3 text-4xl font-bold text-neutral-900 dark:text-white">Logo Variations</h2>
              <p className="text-lg text-neutral-600 dark:text-slate-400">
                Download in your preferred format
              </p>
            </div>

            <div className="mb-12 flex justify-center gap-3">
              <Button
                variant={activeFormat === "svg" ? "default" : "outline"}
                onClick={() => setActiveFormat("svg")}
                size="lg"
                className={
                  activeFormat === "svg"
                    ? "border-amber-500/50 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-700"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-amber-500/30 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-slate-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                }
              >
                <FileType className="mr-2 h-4 w-4" />
                SVG Format
              </Button>
              <Button
                variant={activeFormat === "png" ? "default" : "outline"}
                onClick={() => setActiveFormat("png")}
                size="lg"
                className={
                  activeFormat === "png"
                    ? "border-amber-500/50 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-700"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-amber-500/30 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-slate-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                }
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                PNG Format
              </Button>
              <Button
                variant={activeFormat === "pdf" ? "default" : "outline"}
                onClick={() => setActiveFormat("pdf")}
                size="lg"
                className={
                  activeFormat === "pdf"
                    ? "border-amber-500/50 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-700"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-amber-500/30 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-slate-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                }
              >
                <FileType className="mr-2 h-4 w-4" />
                PDF Format
              </Button>
            </div>

            {/* Logo Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {BRAND_ASSETS.logos[activeFormat].map((logo, index) => (
                <Card
                  key={index}
                  className="group overflow-hidden border-neutral-200 bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10 dark:border-neutral-700 dark:bg-white"
                >
                  <CardContent className="p-0">
                    {/* Preview Area */}
                    <div className={`relative flex h-56 items-center justify-center p-8 ${getBackgroundClass(logo.bg)}`}>
                      <div className="relative h-full w-full">
                        <Image
                          src={`/brand/${activeFormat === "pdf" ? (logo as any).preview || logo.file : logo.file}`}
                          alt={logo.name}
                          fill
                          className="object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    </div>

                    {/* Info Area */}
                    <div className="space-y-4 bg-neutral-50 p-5">
                      <div>
                        <h3 className="mb-1 font-semibold text-neutral-900">{logo.name}</h3>
                        <p className="text-xs text-neutral-600">{logo.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                          {activeFormat.toUpperCase()}
                        </Badge>
                        <a href={`/brand/${logo.file}`} download>
                          <Button
                            size="sm"
                            className="group/btn bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
                          >
                            <Download className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover/btn:translate-y-0.5" />
                            Download
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Favicons */}
          <section className="mb-16">
            <div className="mb-8 text-center">
              <h2 className="mb-3 text-4xl font-bold text-neutral-900 dark:text-white">Favicons</h2>
              <p className="text-lg text-neutral-600 dark:text-slate-400">
                Device-optimized icons
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {BRAND_ASSETS.favicons.map((favicon, index) => (
                <Card
                  key={index}
                  className="group overflow-hidden border-neutral-200 bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10 dark:border-neutral-700 dark:bg-white"
                >
                  <CardContent className="p-0">
                    <div className="flex h-56 items-center justify-center bg-gradient-to-br from-neutral-100 via-amber-50 to-neutral-100 p-8 dark:from-neutral-900 dark:via-amber-950 dark:to-neutral-900">
                      <div className="relative h-32 w-32 rounded-2xl bg-white/80 p-6 shadow-2xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 dark:bg-neutral-900/50">
                        <Image
                          src={`/brand/${favicon.file}`}
                          alt={favicon.name}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                    </div>
                    <div className="space-y-4 bg-neutral-50 p-5">
                      <div>
                        <h3 className="mb-1 font-semibold text-neutral-900">{favicon.name} Favicon</h3>
                        <p className="text-xs text-neutral-600">{favicon.size} pixels</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                          PNG
                        </Badge>
                        <a href={`/brand/${favicon.file}`} download>
                          <Button
                            size="sm"
                            className="group/btn bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
                          >
                            <Download className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover/btn:translate-y-0.5" />
                            Download
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Usage Guidelines */}
          <section>
            <Card className="overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-amber-50/50 shadow-lg dark:border-amber-500/30 dark:from-amber-50/30 dark:via-orange-50/20 dark:to-amber-50/30 dark:bg-white">
              <CardContent className="p-10">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-2xl font-bold text-neutral-900">Brand Guidelines</h3>
                    <div className="space-y-2 text-neutral-700">
                      <p>
                        These brand assets are the visual foundation of New Earth Collective.
                        Please maintain proper spacing and avoid altering logo colors or proportions.
                      </p>
                      <p className="text-amber-700 dark:text-amber-700">
                        <strong>Best Practices:</strong> Use SVG for web applications, PNG for presentations and social media, and PDF for professional print materials.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </DomainLayout>
  );
}
