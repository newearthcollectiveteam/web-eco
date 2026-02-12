import { TestHomePage } from "~/components/pages/test-home";
import { DomainLayout } from "~/components/domain-layout";

export default function AdminPage() {
  return (
    <DomainLayout>
      <TestHomePage />
    </DomainLayout>
  );
}
