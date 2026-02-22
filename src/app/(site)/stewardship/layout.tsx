import { SiteLayout } from "~/components/layouts/site-layout";

export default function StewardshipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
