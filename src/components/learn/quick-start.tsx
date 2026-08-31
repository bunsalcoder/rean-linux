import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { getLearningLevelHref } from "@/config/learning-path";
import { cn } from "@/lib/utils";

export function QuickStart() {
  const href = getLearningLevelHref("beginner");

  return (
    <aside
      aria-labelledby="quick-start-heading"
      className="border-border bg-muted/40 mt-14 rounded-lg border p-5 sm:mt-16 sm:p-6"
    >
      <p className="text-muted-foreground font-mono text-[0.65rem] tracking-[0.14em] uppercase">
        Not sure where to start?
      </p>
      <h2
        id="quick-start-heading"
        className="font-heading mt-3 text-lg font-semibold tracking-tight sm:text-xl"
      >
        New to Linux? Start here.
      </h2>
      <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
        Begin with Linux fundamentals and learn the terminal before moving into
        more advanced topics.
      </p>
      <Link
        href={href}
        className={cn(
          "text-primary mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium",
          "rounded-sm underline-offset-4 hover:underline",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        )}
      >
        Start with Linux Fundamentals
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </aside>
  );
}
