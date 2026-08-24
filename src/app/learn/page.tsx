import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {contentCategories.map((category) => (
          <li key={category.slug}>
            <Card className="hover:border-foreground/15 h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle>
                    <h2 className="font-heading text-base leading-snug font-medium">
                      {category.title}
                    </h2>
                  </CardTitle>
                  <Badge variant="outline">Soon</Badge>
                </div>
                <CardDescription className="leading-relaxed">
                  {category.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
