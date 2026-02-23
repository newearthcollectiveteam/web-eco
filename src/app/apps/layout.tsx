import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NEC Apps",
  description: "Micro-apps from the New Earth Collective",
};

export default function AppsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {children}
    </div>
  );
}
