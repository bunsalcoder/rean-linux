import { ArrowRight, ChevronDown, Clock } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BeginnerLesson } from "@/config/beginner";
import { cn } from "@/lib/utils";

function padLessonNumber(number: number) {
  return String(number).padStart(2, "0");
}

type LessonItemProps = {
  lesson: BeginnerLesson;
  isLast?: boolean;
};

export function LessonItem({ lesson, isLast = false }: LessonItemProps) {
  const numberLabel = padLessonNumber(lesson.number);
  const titleId = `lesson-${numberLabel}-title`;
  const descId = `lesson-${numberLabel}-desc`;
  const metaId = `lesson-${numberLabel}-meta`;

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
        <Link
          href={lesson.href}
          aria-labelledby={titleId}
          aria-describedby={`${descId} ${metaId}`}
          className={cn(
            "group/lesson block rounded-lg",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          )}
        >
          <Card
            className={cn(
              "h-full transition-[border-color,background-color,box-shadow] duration-200",
              "group-hover/lesson:border-primary/40 group-hover/lesson:bg-accent/30 group-hover/lesson:shadow-sm",
              "group-focus-visible/lesson:border-primary/40",
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <p className="text-muted-foreground font-mono text-[0.65rem] tracking-[0.14em] uppercase">
                  Lesson {numberLabel}
                </p>
                <ArrowRight
                  aria-hidden="true"
                  className="text-muted-foreground group-hover/lesson:text-primary group-focus-visible/lesson:text-primary size-4 shrink-0 transition-transform duration-200 group-hover/lesson:translate-x-0.5 group-focus-visible/lesson:translate-x-0.5"
                />
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
                className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs"
              >
                <Clock aria-hidden="true" className="size-3.5 shrink-0" />
                <span>
                  <span className="sr-only">Estimated reading time: </span>
                  {lesson.duration}
                </span>
              </p>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </li>
  );
}
