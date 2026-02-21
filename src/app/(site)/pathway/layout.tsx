import { SiteLayout } from "~/components/layouts/site-layout";

export default function PathwayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
