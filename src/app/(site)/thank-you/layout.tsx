import { SiteLayout } from "~/components/layouts/site-layout";

// Thank you page has its own design, hide nav but show footer
export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout hideNav>{children}</SiteLayout>;
}
