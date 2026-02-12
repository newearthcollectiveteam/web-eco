import "~/styles/globals.css";
import "./fonts.css";

import { type Metadata, type Viewport } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "~/lib/auth/hooks";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: {
    default: "New Earth Collective | Empowering Collective Sovereignty",
    template: "%s | New Earth Collective",
  },
  description: "Join immersive festivals connecting creators into a sovereign, living network. Honor love, land, and collective intelligence.",
  keywords: [
    "New Earth Collective",
    "regenerative community",
    "heart-led creators",
    "collective intelligence",
    "conscious technology",
    "sovereignty",
    "festival",
    "collaboration",
  ],
  authors: [{ name: "New Earth Collective" }],
  creator: "New Earth Collective",
  metadataBase: new URL("https://joinnewearthcollective.com"),
  icons: {
    icon: [
      { rel: "icon", url: "/brand/symbol.png" },
      { rel: "icon", url: "/brand/symbol.svg", type: "image/svg+xml" },
    ],
    shortcut: "/brand/symbol.png",
    apple: "/brand/symbol.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://joinnewearthcollective.com",
    siteName: "New Earth Collective",
    title: "New Earth Collective | Empowering Collective Sovereignty",
    description: "Join immersive festivals connecting creators into a sovereign, living network. Honor love, land, and collective intelligence.",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "New Earth Collective - Heart-Led Creators United",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "New Earth Collective | Empowering Collective Sovereignty",
    description: "Join immersive festivals connecting creators into a sovereign, living network.",
    images: ["/brand/og-image.png"],
    creator: "@newearthcollectiveco",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/Airwaves-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/bourtonlinebold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
          storageKey="theme"
        >
          <AuthProvider>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
