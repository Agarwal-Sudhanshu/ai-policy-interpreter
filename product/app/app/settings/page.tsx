import Link from "next/link";
import { PageContainer, PageHeader } from "@/components/ui";

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader title="Settings" back={{ href: "/app/dashboard", label: "← Back to Dashboard" }} />
      <p className="text-sm text-gray-600">Settings placeholder.</p>
    </PageContainer>
  );
}
