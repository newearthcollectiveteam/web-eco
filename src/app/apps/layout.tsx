import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "NEC Apps",
  description: "Micro-apps from the New Earth Collective",
};

export default function AppsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0a0a0a] text-white">
      {children}
    </div>
  );
}
