import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the Collective | New Earth Collective",
  description: "Scan to fill out our community alignment questionnaire.",
};

export default function QRQuestionnaireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
