import "~/styles/globals.css";
import "./fonts.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "New Earth Collective",
  description: "Building a Regenerative Future Together",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
          storageKey="theme"
        >
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
