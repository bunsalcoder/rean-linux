import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { contentCategories } from "@/config/content";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Browse the Linux learning paths that Rean Linux will cover, from basics through administration, DevOps, and security.",
};

export default function LearnPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Learn"
        description="Tutorials, guides, and exercises will live here. These are the topic areas the platform is being built around."
      />
      <ul className="mt-8 grid gap-4">
        {contentCategories.map((category) => (
          <li key={category.slug} className="rounded-lg border px-4 py-3">
            <h2 className="font-medium">{category.title}</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {category.description}
            </p>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
