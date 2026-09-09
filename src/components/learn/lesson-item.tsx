import { ArrowRight, ChevronDown, Clock } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLessonStatusLabel } from "@/config/learning-path";
import { cn } from "@/lib/utils";
import type { LessonStatus } from "@/types/lesson";

function padLessonNumber(number: number) {
  return String(number).padStart(2, "0");
}

export type LessonCardData = {
  number: number;
  title: string;
  description: string;
  duration: string;
  difficulty?: string;
  status: LessonStatus;
  href?: string;
};

type LessonItemProps = {
  lesson: LessonCardData;
  isLast?: boolean;
};

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

export function LessonItem({ lesson, isLast = false }: LessonItemProps) {
  const numberLabel = padLessonNumber(lesson.number);
  const titleId = `lesson-${numberLabel}-title`;
  const descId = `lesson-${numberLabel}-desc`;
  const metaId = `lesson-${numberLabel}-meta`;
  const statusLabel = getLessonStatusLabel(lesson.status);
  const isLinked = lesson.status !== "coming-soon" && Boolean(lesson.href);

  const card = (
    <Card
      className={cn(
        "h-full transition-[border-color,background-color,box-shadow] duration-200",
        isLinked &&
          "group-hover/lesson:border-primary/40 group-hover/lesson:bg-accent/30 group-focus-visible/lesson:border-primary/40 group-hover/lesson:shadow-sm",
        lesson.status === "coming-soon" && "bg-muted/20",
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="text-muted-foreground font-mono text-[0.65rem] tracking-[0.14em] uppercase">
              Lesson {numberLabel}
            </p>
            <Badge variant={statusBadgeVariant(lesson.status)}>
              {statusLabel}
            </Badge>
          </div>
          {isLinked ? (
            <ArrowRight
              aria-hidden="true"
              className="text-muted-foreground group-hover/lesson:text-primary group-focus-visible/lesson:text-primary size-4 shrink-0 transition-transform duration-200 group-hover/lesson:translate-x-0.5 group-focus-visible/lesson:translate-x-0.5"
            />
          ) : null}
        </div>

        <CardTitle>
          <h3
            id={titleId}
            className="font-heading text-lg leading-snug font-semibold sm:text-xl"
          >
            {lesson.title}
          </h3>
        </CardTitle>

        <CardDescription
          id={descId}
          className="leading-relaxed sm:text-[0.9375rem]"
        >
          {lesson.description}
        </CardDescription>

        <p
          id={metaId}
          className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
        >
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden="true" className="size-3.5 shrink-0" />
            <span>
              <span className="sr-only">Estimated reading time: </span>
              {lesson.duration}
            </span>
          </span>
          {lesson.difficulty ? (
            <span>
              <span className="sr-only">Difficulty: </span>
              {lesson.difficulty}
            </span>
          ) : null}
        </p>
      </CardHeader>
    </Card>
  );

  return (
    <li
      className={cn(
        "relative grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-4 pb-8 last:pb-0",
        "sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-5 sm:pb-10",
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
            "border-border bg-background text-muted-foreground flex size-10 items-center justify-center rounded-full border font-mono text-xs font-medium tabular-nums",
            "sm:size-12 sm:text-sm",
          )}
        >
          {numberLabel}
        </span>
      </div>

      <div className="min-w-0">
        {isLinked && lesson.href ? (
          <Link
            href={lesson.href}
            aria-labelledby={titleId}
            aria-describedby={`${descId} ${metaId}`}
            className={cn(
              "group/lesson block rounded-lg",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            )}
          >
            {card}
          </Link>
        ) : (
          <div
            aria-labelledby={titleId}
            aria-describedby={`${descId} ${metaId}`}
            className="rounded-lg"
          >
            {card}
          </div>
        )}
      </div>
    </li>
  );
}
