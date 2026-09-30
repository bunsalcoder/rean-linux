import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { AdministrationLessonJourney } from "@/components/learn/administration-lesson-journey";
import { AdministrationTip } from "@/components/learn/administration-tip";
import { Badge } from "@/components/ui/badge";
import { administrationPath } from "@/config/administration";
import { getLessonStatusLabel } from "@/config/learning-path";

export const metadata: Metadata = {
  title: { absolute: administrationPath.seoTitle },
  description: administrationPath.seoDescription,
};

export default function AdministrationLearnPage() {
  const statusLabel = getLessonStatusLabel(administrationPath.status);

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: "Learn", href: "/learn" },
          { label: "Administration" },
        ]}
      />

      <PageHeader
        eyebrow={administrationPath.eyebrow}
        title={administrationPath.title}
        description={administrationPath.description}
        badge={administrationPath.badge}
      >
        <dl className="border-border text-muted-foreground mt-2 flex flex-wrap gap-x-6 gap-y-2 border-t pt-5 text-sm">
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Level</dt>
            <dd>{administrationPath.level}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Lessons</dt>
            <dd>{administrationPath.lessonCount}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Estimated time</dt>
            <dd>{administrationPath.estimatedTime}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Status</dt>
            <dd>
              <Badge variant="info">{statusLabel}</Badge>
            </dd>
          </div>
        </dl>
      </PageHeader>

      <AdministrationTip />

      <section
        aria-labelledby="administration-lessons-heading"
        className="mt-12 sm:mt-14"
      >
        <h2
          id="administration-lessons-heading"
          className="font-heading text-xl font-semibold tracking-tight sm:text-2xl"
        >
          Lessons
        </h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
          Twelve lessons are planned for this stage. All lessons are coming soon
          — including the final challenge, which stays locked until the stage
          content ships.
        </p>
        <AdministrationLessonJourney />
      </section>
    </PageContainer>
  );
}
