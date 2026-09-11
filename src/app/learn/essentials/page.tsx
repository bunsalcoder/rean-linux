import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EssentialsLessonJourney } from "@/components/learn/essentials-lesson-journey";
import { EssentialsTip } from "@/components/learn/essentials-tip";
import { Badge } from "@/components/ui/badge";
import { essentialsPath } from "@/config/essentials";
import { getLessonStatusLabel } from "@/config/learning-path";

export const metadata: Metadata = {
  title: { absolute: essentialsPath.seoTitle },
  description: essentialsPath.seoDescription,
};

export default function EssentialsLearnPage() {
  const statusLabel = getLessonStatusLabel(essentialsPath.status);

  return (
    <PageContainer>
      <Breadcrumb
        items={[{ label: "Learn", href: "/learn" }, { label: "Essentials" }]}
      />

      <PageHeader
        eyebrow={essentialsPath.eyebrow}
        title={essentialsPath.title}
        description={essentialsPath.description}
        badge={essentialsPath.badge}
      >
        <dl className="border-border text-muted-foreground mt-2 flex flex-wrap gap-x-6 gap-y-2 border-t pt-5 text-sm">
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Level</dt>
            <dd>{essentialsPath.level}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Lessons</dt>
            <dd>{essentialsPath.lessonCount}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Estimated time</dt>
            <dd>{essentialsPath.estimatedTime}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Status</dt>
            <dd>
              <Badge variant="info">{statusLabel}</Badge>
            </dd>
          </div>
        </dl>
      </PageHeader>

      <EssentialsTip />

      <section
        aria-labelledby="essentials-lessons-heading"
        className="mt-12 sm:mt-14"
      >
        <h2
          id="essentials-lessons-heading"
          className="font-heading text-xl font-semibold tracking-tight sm:text-2xl"
        >
          Lessons
        </h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
          Twelve lessons are planned for this stage. Users and Groups is ready
          now — the rest remain curriculum previews until they ship.
        </p>
        <EssentialsLessonJourney />
      </section>
    </PageContainer>
  );
}
