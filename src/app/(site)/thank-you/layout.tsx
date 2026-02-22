import { type Metadata } from "next";
import { SiteLayout } from "~/components/layouts/site-layout";

export const metadata: Metadata = {
  title: "Thank You | New Earth Collective",
  description:
    "Thank you for sharing your blueprint with the New Earth Collective.",
};

// Thank you page has its own design, hide nav but show footer
export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout hideNav>{children}</SiteLayout>;
}
