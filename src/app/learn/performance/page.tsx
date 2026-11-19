import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PerformanceLessonJourney } from "@/components/learn/performance-lesson-journey";
import { PerformanceTip } from "@/components/learn/performance-tip";
import { Badge } from "@/components/ui/badge";
import { getLessonStatusLabel } from "@/config/learning-path";
import { performancePath } from "@/config/performance";

export const metadata: Metadata = {
  title: { absolute: performancePath.seoTitle },
  description: performancePath.seoDescription,
};

export default function PerformanceLearnPage() {
  const statusLabel = getLessonStatusLabel(performancePath.status);

  return (
    <PageContainer>
      <Breadcrumb
        items={[{ label: "Learn", href: "/learn" }, { label: "Performance" }]}
      />

      <PageHeader
        eyebrow={performancePath.eyebrow}
        title={performancePath.title}
        description={performancePath.description}
        badge={performancePath.badge}
      >
        <dl className="border-border text-muted-foreground mt-2 flex flex-wrap gap-x-6 gap-y-2 border-t pt-5 text-sm">
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Level</dt>
            <dd>{performancePath.level}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Lessons</dt>
            <dd>{performancePath.lessonCount}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Estimated time</dt>
            <dd>{performancePath.estimatedTime}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Status</dt>
            <dd>
              <Badge variant="info">{statusLabel}</Badge>
            </dd>
          </div>
        </dl>
      </PageHeader>

      <PerformanceTip />

      <section
        aria-labelledby="performance-lessons-heading"
        className="mt-12 sm:mt-14"
      >
        <h2
          id="performance-lessons-heading"
          className="font-heading text-xl font-semibold tracking-tight sm:text-2xl"
        >
          Lessons
        </h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
          Twelve lessons make up this stage — from performance fundamentals
          through the final Linux Performance and Troubleshooting Challenge.
          Individual lessons will unlock as they are implemented; the curriculum
          order below is the planned learning path.
        </p>
        <PerformanceLessonJourney />
      </section>
    </PageContainer>
  );
}
