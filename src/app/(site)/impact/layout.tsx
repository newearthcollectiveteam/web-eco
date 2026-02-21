import { SiteLayout } from "~/components/layouts/site-layout";

export default function ImpactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
