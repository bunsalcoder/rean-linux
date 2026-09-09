import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getLearningLevelHref,
  getLessonStatusLabel,
  learningLevels,
  type LearningLevel,
} from "@/config/learning-path";
import { cn } from "@/lib/utils";
import type { LessonStatus } from "@/types/lesson";

export function LearningJourney() {
  return (
    <ol
      aria-label="Learning path from beginner foundations to DevOps"
      className="relative mt-12 sm:mt-16"
    >
      {learningLevels.map((level, index) => (
        <LearningStage
          key={level.slug}
          level={level}
          isLast={index === learningLevels.length - 1}
        />
      ))}
    </ol>
  );
}

function statusBadgeVariant(
  status: LessonStatus,
): "success" | "info" | "warning" {
  switch (status) {
    case "completed":
      return "success";
    case "available":
      return "info";
    case "coming-soon":
      return "warning";
  }
}

function stageCtaLabel(level: LearningLevel) {
  switch (level.status) {
    case "completed":
      return "Review this stage";
    case "available":
      return level.slug === "essentials"
        ? "Explore the curriculum"
        : "Begin this path";
    case "coming-soon":
      return "View placeholder";
  }
}

function LearningStage({
  level,
  isLast,
}: {
  level: LearningLevel;
  isLast: boolean;
}) {
  const Icon = level.icon;
  const href = getLearningLevelHref(level.slug);
  const titleId = `learn-stage-${level.slug}-title`;
  const descId = `learn-stage-${level.slug}-desc`;
  const statusLabel = getLessonStatusLabel(level.status);
  const isHighlighted =
    level.status === "completed" || level.status === "available";

  return (
    <li
      className={cn(
        "relative grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-4 pb-10 last:pb-0",
        "sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-6 sm:pb-12",
      )}
    >
      {!isLast ? (
        <>
          <div
            aria-hidden="true"
            className="bg-border absolute top-10 bottom-0 left-5 w-px sm:left-6"
          />
          <span
            aria-hidden="true"
            className="bg-background text-muted-foreground absolute -bottom-0.5 left-5 z-10 flex size-4 -translate-x-1/2 items-center justify-center sm:left-6"
          >
            <ChevronDown className="size-3.5" />
          </span>
        </>
      ) : null}

      <div className="relative z-10 flex justify-center pt-0.5">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-10 items-center justify-center rounded-full border font-mono text-xs font-medium tabular-nums sm:size-12 sm:text-sm",
            isHighlighted
              ? "border-primary/60 bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground",
          )}
        >
          {level.indicator}
        </span>
      </div>

      <div className="min-w-0">
        <div
          aria-hidden="true"
          className="border-border mb-4 hidden items-center gap-3 sm:flex"
        >
          <span className="text-muted-foreground font-mono text-xs tabular-nums">
            {level.indicator}
          </span>
          <span className="bg-border h-px min-w-0 flex-1" />
        </div>

        <Link
          href={href}
          aria-labelledby={titleId}
          aria-describedby={descId}
          className={cn(
            "group/stage block rounded-lg",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          )}
        >
          <Card
            className={cn(
              "h-full transition-[border-color,background-color,box-shadow] duration-200",
              "group-hover/stage:border-primary/40 group-hover/stage:bg-accent/30 group-hover/stage:shadow-sm",
              "group-focus-visible/stage:border-primary/40",
              level.status === "completed" &&
                "border-primary/35 bg-accent/20 ring-primary/10 shadow-xs ring-1",
              level.status === "available" &&
                "border-primary/35 bg-accent/20 ring-primary/10 shadow-xs ring-1",
              level.status === "coming-soon" && "opacity-90",
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors duration-200",
                      isHighlighted
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground group-hover/stage:border-primary/30 group-hover/stage:bg-primary/10 group-hover/stage:text-primary group-focus-visible/stage:border-primary/30 group-focus-visible/stage:bg-primary/10 group-focus-visible/stage:text-primary",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <Badge variant={statusBadgeVariant(level.status)}>
                    {statusLabel}
                  </Badge>
                  {level.label !== statusLabel ? (
                    <span className="text-muted-foreground text-xs font-medium">
                      {level.label}
                    </span>
                  ) : null}
                </div>
                <ArrowRight
                  aria-hidden="true"
                  className="text-muted-foreground group-hover/stage:text-primary group-focus-visible/stage:text-primary size-4 shrink-0 transition-transform duration-200 group-hover/stage:translate-x-0.5 group-focus-visible/stage:translate-x-0.5"
                />
              </div>

              <CardTitle>
                <h2
                  id={titleId}
                  className="font-heading text-lg leading-snug font-semibold sm:text-xl"
                >
                  {level.title}
                </h2>
              </CardTitle>

              <CardDescription
                id={descId}
                className="leading-relaxed sm:text-[0.9375rem]"
              >
                {level.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="mt-auto flex flex-col gap-4">
              <p className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs">
                {typeof level.lessonCount === "number" ? (
                  <span>
                    <span className="sr-only">Lessons: </span>
                    {level.lessonCount} lessons
                  </span>
                ) : null}
                <span>
                  <span className="sr-only">Difficulty: </span>
                  {level.difficulty}
                </span>
              </p>

              <ul
                className="flex flex-wrap gap-1.5"
                aria-label={`Topics in ${level.title}`}
              >
                {level.topics.map((topic) => (
                  <li key={topic}>
                    <Badge variant="outline">{topic}</Badge>
                  </li>
                ))}
              </ul>

              <span
                aria-hidden="true"
                className="text-muted-foreground group-hover/stage:text-primary group-focus-visible/stage:text-primary inline-flex items-center gap-1 text-xs font-medium transition-colors duration-200"
              >
                {stageCtaLabel(level)}
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/stage:translate-x-0.5 group-focus-visible/stage:translate-x-0.5" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </li>
  );
}
