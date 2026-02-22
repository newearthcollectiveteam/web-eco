import { SiteLayout } from "~/components/layouts/site-layout";

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
