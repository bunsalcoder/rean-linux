import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <PageContainer>
      <PageHeader
        title={siteConfig.name}
        description='Rean means "Learn" in Khmer. This site will teach Linux from absolute beginner through advanced, practical system work.'
      />
      <p className="mt-6 leading-relaxed">
        The learning platform is being set up. Start at{" "}
        <Link
          href="/learn"
          className="text-foreground focus-visible:ring-ring font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          Learn
        </Link>{" "}
        when you are ready to browse upcoming topics, or read{" "}
        <Link
          href="/about"
          className="text-foreground focus-visible:ring-ring font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          About
        </Link>{" "}
        for the project direction.
      </p>
    </PageContainer>
  );
}
