import { SiteLayout } from "~/components/layouts/site-layout";

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
