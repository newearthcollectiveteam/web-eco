import "~/styles/globals.css";
import "./fonts.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "~/lib/auth/hooks";

export const metadata: Metadata = {
  title: "New Earth Collective",
  description: "Building a Regenerative Future Together",
  icons: {
    icon: [
      { rel: "icon", url: "/brand/symbol.png" },
      { rel: "icon", url: "/brand/symbol.svg", type: "image/svg+xml" },
    ],
    shortcut: "/brand/symbol.png",
    apple: "/brand/symbol.png",
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
