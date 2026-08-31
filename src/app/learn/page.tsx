import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { LearningJourney } from "@/components/learn/learning-journey";
import { QuickStart } from "@/components/learn/quick-start";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Follow a structured path from your first terminal command to managing Linux systems, servers, and modern infrastructure.",
};

export default function LearnPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="LEARNING PATH"
        title="Learn Linux from zero to hero."
        description="Follow a structured path from your first terminal command to managing Linux systems, servers, and modern infrastructure."
      />
      <LearningJourney />
      <QuickStart />
    </PageContainer>
  );
}
