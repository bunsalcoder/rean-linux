import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "rean-linux is a modern Linux learning platform, from beginner fundamentals to advanced real-world practice.",
};

export default function AboutPage() {
  return (
    <PageContainer>
      <PageHeader
        title="About"
        description={`${siteConfig.name} is a Linux learning platform for people who want a clear path from first commands to real systems work.`}
      />
      <div className="mt-6 space-y-4 leading-relaxed">
        <p>
          The long-term goal is practical education: fundamentals, the terminal,
          administration, networking, security, and the tools used to run
          software in production.
        </p>
        <p>
          Content, courses, and interactive features are not part of this
          foundation release. This site currently exists to establish the
          application structure, design system, and routing.
        </p>
      </div>
    </PageContainer>
  );
}
