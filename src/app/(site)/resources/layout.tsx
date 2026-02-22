import { SiteLayout } from "~/components/layouts/site-layout";

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
