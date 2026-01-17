import { type Metadata } from "next";
import { SiteLayout } from "~/components/layouts/site-layout";

export const metadata: Metadata = {
  title: "Contact | Connect with the Collective",
  description: "Reach out for collaboration, questions, or to share your gifts with the New Earth Collective.",
  openGraph: {
    title: "Contact | New Earth Collective",
    description: "Reach out for collaboration, questions, or to share your gifts.",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout>{children}</SiteLayout>;
}
