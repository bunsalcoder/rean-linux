import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { AdministrationLessonJourney } from "@/components/learn/administration-lesson-journey";
import { AdministrationTip } from "@/components/learn/administration-tip";
import { Badge } from "@/components/ui/badge";
import { administrationPath } from "@/config/administration";
import {
  getLearningLevelHref,
  getLessonStatusLabel,
} from "@/config/learning-path";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: administrationPath.seoTitle },
  description: administrationPath.seoDescription,
};

export default function AdministrationLearnPage() {
  const statusLabel = getLessonStatusLabel(administrationPath.status);
  const securityHref = getLearningLevelHref("security");

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
          Continue to Linux Security and Hardening
        </h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
          After administration, Stage 04 covers security decisions, hardening,
          authentication, auditing, and incident response — lessons are still
          being built, but the curriculum is ready to preview.
        </p>
        <Link
          href={securityHref}
          className={cn(
            "text-primary mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium",
            "rounded-sm underline-offset-4 hover:underline",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          )}
        >
          Preview Linux Security and Hardening
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </aside>

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
          Twelve lessons make up this stage, including the Linux Administration
          Challenge capstone. Storage and Filesystems remains a curriculum
          preview until that lesson ships.
        </p>
        <AdministrationLessonJourney />
      </section>
    </PageContainer>
  );
}
