import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Commands",
  description:
    "A Linux command reference will be published here as the rean-linux content system is built.",
};

export default function CommandsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Commands"
        description="Command references and examples will live here. This page is a navigation placeholder while the design foundation is completed."
      />
    </PageContainer>
  );
}
