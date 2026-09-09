import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { BeginnerLessonJourney } from "@/components/learn/beginner-lesson-journey";
import { BeginnerTip } from "@/components/learn/beginner-tip";
import { Badge } from "@/components/ui/badge";
import { beginnerPath } from "@/config/beginner";
import {
  getLearningLevelHref,
  getLessonStatusLabel,
} from "@/config/learning-path";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: beginnerPath.title,
  description: beginnerPath.description,
};

export default function BeginnerLearnPage() {
  const statusLabel = getLessonStatusLabel(beginnerPath.status);
  const essentialsHref = getLearningLevelHref("essentials");

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
          <div className="flex items-baseline gap-2">
            <dt className="text-foreground font-medium">Status</dt>
            <dd>
              <Badge variant="success">{statusLabel}</Badge>
            </dd>
          </div>
        </dl>
      </PageHeader>

      <BeginnerTip />

      <aside
        aria-labelledby="next-stage-heading"
        className="border-border bg-muted/40 mt-8 rounded-lg border p-5 sm:mt-10 sm:p-6"
      >
        <p className="text-muted-foreground font-mono text-[0.65rem] tracking-[0.14em] uppercase">
          Next stage
        </p>
        <h2
          id="next-stage-heading"
          className="font-heading mt-2 text-base font-semibold tracking-tight sm:text-lg"
        >
          Continue to Linux Essentials
        </h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
          You&apos;ve completed the foundation. Stage 02 covers users,
          permissions, processes, packages, and shell techniques — lessons are
          still being built, but the curriculum is ready to preview.
        </p>
        <Link
          href={essentialsHref}
          className={cn(
            "text-primary mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium",
            "rounded-sm underline-offset-4 hover:underline",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          )}
        >
          Preview Linux Essentials
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </aside>

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
