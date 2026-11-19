import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SecurityLessonJourney } from "@/components/learn/security-lesson-journey";
import { SecurityTip } from "@/components/learn/security-tip";
import { Badge } from "@/components/ui/badge";
import {
  getLearningLevelHref,
  getLessonStatusLabel,
} from "@/config/learning-path";
import { securityPath } from "@/config/security";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: securityPath.seoTitle },
  description: securityPath.seoDescription,
};

export default function SecurityLearnPage() {
  const statusLabel = getLessonStatusLabel(securityPath.status);
  const performanceHref = getLearningLevelHref("performance");

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
          Continue to Linux Performance and Troubleshooting
        </h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
          After security, Stage 05 covers performance metrics, bottleneck
          analysis, resource troubleshooting, and optimization — lessons are
          still being built, but the curriculum is ready to preview.
        </p>
        <Link
          href={performanceHref}
          className={cn(
            "text-primary mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium",
            "rounded-sm underline-offset-4 hover:underline",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          )}
        >
          Preview Linux Performance and Troubleshooting
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </aside>

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
          Twelve lessons make up this stage — from security fundamentals through
          the final Linux Security Challenge. Work through them in order for the
          strongest progression.
        </p>
        <SecurityLessonJourney />
      </section>
    </PageContainer>
  );
}
