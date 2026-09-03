import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { LessonNavLink } from "@/types/lesson";

type LessonNavigationProps = {
  previous?: LessonNavLink;
  next?: LessonNavLink;
  className?: string;
};

function NavCard({
  direction,
  link,
}: {
  direction: "previous" | "next";
  link: LessonNavLink;
}) {
  const isPrevious = direction === "previous";

  return (
    <Link
      href={link.href}
      className={cn(
        "group border-border bg-card hover:border-primary/40 hover:bg-accent/30 flex min-h-[5.5rem] flex-col justify-center rounded-lg border p-4 transition-[border-color,background-color] sm:p-5",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        isPrevious ? "items-start text-left" : "items-end text-right",
      )}
    >
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
        {isPrevious ? (
          <>
            <ArrowLeft
              aria-hidden="true"
              className="size-3.5 transition-transform group-hover:-translate-x-0.5"
            />
            Previous
          </>
        ) : (
          <>
            Next
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
            />
          </>
        )}
      </span>
      <span className="text-foreground mt-2 font-medium">{link.label}</span>
    </Link>
  );
}

function DisabledPrevious() {
  return (
    <div
      aria-disabled="true"
      className="border-border bg-muted/20 text-muted-foreground flex min-h-[5.5rem] flex-col items-start justify-center rounded-lg border border-dashed p-4 sm:p-5"
    >
      <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        Previous
      </span>
      <span className="mt-2 text-sm">Start of path</span>
    </div>
  );
}

export function LessonNavigation({
  previous,
  next,
  className,
}: LessonNavigationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      aria-label="Lesson navigation"
      className={cn(
        "border-border mt-12 grid gap-4 border-t pt-8 sm:mt-14 sm:grid-cols-2 sm:pt-10",
        className,
      )}
    >
      {previous ? (
        <NavCard direction="previous" link={previous} />
      ) : (
        <DisabledPrevious />
      )}
      {next ? <NavCard direction="next" link={next} /> : <div />}
    </nav>
  );
}
