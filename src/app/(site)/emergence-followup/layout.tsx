import { SiteLayout } from "~/components/layouts/site-layout";

// Emergence followup has its own header and design, so we hide the nav and footer
export default function EmergenceFollowupLayout({
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
