import { type Metadata } from "next";
import { SiteLayout } from "~/components/layouts/site-layout";

export const metadata: Metadata = {
  title: "The Pathway | New Earth Collective",
  description:
    "Trace the New Earth Collective journey — from formation through first events to the vision ahead.",
  openGraph: {
    title: "The Pathway | New Earth Collective",
    description:
      "Trace the New Earth Collective journey — from formation through first events to the vision ahead.",
    type: "website",
  },
};

export default function PathwayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
