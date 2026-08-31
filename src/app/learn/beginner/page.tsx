import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { BeginnerLessonJourney } from "@/components/learn/beginner-lesson-journey";
import { BeginnerTip } from "@/components/learn/beginner-tip";
import { beginnerPath } from "@/config/beginner";

export const metadata: Metadata = {
  title: beginnerPath.title,
  description: beginnerPath.description,
};

export default function BeginnerLearnPage() {
  return (
    <PageContainer>
      <Breadcrumb
        items={[{ label: "Learn", href: "/learn" }, { label: "Beginner" }]}
      />

      <PageHeader
        eyebrow={beginnerPath.eyebrow}
        title={beginnerPath.title}
        description={beginnerPath.description}
        badge={beginnerPath.badge}
      >
        <dl className="border-border text-muted-foreground mt-2 flex flex-wrap gap-x-6 gap-y-2 border-t pt-5 text-sm">
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Level</dt>
            <dd>{beginnerPath.level}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Lessons</dt>
            <dd>{beginnerPath.lessonCount}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Estimated time</dt>
            <dd>{beginnerPath.estimatedTime}</dd>
          </div>
        </dl>
      </PageHeader>

      <BeginnerTip />

      <section
        aria-labelledby="beginner-lessons-heading"
        className="mt-12 sm:mt-14"
      >
        <h2
          id="beginner-lessons-heading"
          className="font-heading text-xl font-semibold tracking-tight sm:text-2xl"
        >
          Lessons
        </h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
          Follow these lessons in order. Each one builds on the last.
        </p>
        <BeginnerLessonJourney />
      </section>
    </PageContainer>
  );
}
