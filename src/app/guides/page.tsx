import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Practical Linux guides will be published here as the rean-linux content system is built.",
};

export default function GuidesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Guides"
        description="Step-by-step Linux guides will live here. This page is a navigation placeholder while the design foundation is completed."
      />
    </PageContainer>
  );
}
