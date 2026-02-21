import { SiteLayout } from "~/components/layouts/site-layout";

export default function PartnershipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
