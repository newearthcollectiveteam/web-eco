import { SiteLayout } from "~/components/layouts/site-layout";

// Questionnaire has its own header and design, so we hide the nav and footer
export default function QuestionnaireLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout hideNav hideFooter>{children}</SiteLayout>;
}
