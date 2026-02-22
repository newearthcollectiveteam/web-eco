import { SiteLayout } from "~/components/layouts/site-layout";

export default function EmergenceThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteLayout hideNav hideFooter>
      {children}
    </SiteLayout>
  );
}
