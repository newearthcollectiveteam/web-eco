import { SiteLayout } from "~/components/layouts/site-layout";

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
