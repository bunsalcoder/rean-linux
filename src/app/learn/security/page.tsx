import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SecurityLessonJourney } from "@/components/learn/security-lesson-journey";
import { SecurityTip } from "@/components/learn/security-tip";
import { Badge } from "@/components/ui/badge";
import { getLessonStatusLabel } from "@/config/learning-path";
import { securityPath } from "@/config/security";

export const metadata: Metadata = {
  title: { absolute: securityPath.seoTitle },
  description: securityPath.seoDescription,
};

export default function SecurityLearnPage() {
  const statusLabel = getLessonStatusLabel(securityPath.status);

  return (
    <PageContainer>
      <Breadcrumb
        items={[{ label: "Learn", href: "/learn" }, { label: "Security" }]}
      />

      <PageHeader
        eyebrow={securityPath.eyebrow}
        title={securityPath.title}
        description={securityPath.description}
        badge={securityPath.badge}
      >
        <dl className="border-border text-muted-foreground mt-2 flex flex-wrap gap-x-6 gap-y-2 border-t pt-5 text-sm">
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Level</dt>
            <dd>{securityPath.level}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Lessons</dt>
            <dd>{securityPath.lessonCount}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Estimated time</dt>
            <dd>{securityPath.estimatedTime}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Status</dt>
            <dd>
              <Badge variant="info">{statusLabel}</Badge>
            </dd>
          </div>
        </dl>
      </PageHeader>

      <SecurityTip />

      <section
        aria-labelledby="security-lessons-heading"
        className="mt-12 sm:mt-14"
      >
        <h2
          id="security-lessons-heading"
          className="font-heading text-xl font-semibold tracking-tight sm:text-2xl"
        >
          Lessons
        </h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
          Twelve lessons make up this stage. Fundamentals and Access Control
          Review are available now; later lessons and the final challenge stay
          locked until they ship.
        </p>
        <SecurityLessonJourney />
      </section>
    </PageContainer>
  );
}
