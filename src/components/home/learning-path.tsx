import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
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
  learningLevels,
  type LearningLevel,
} from "@/config/learning-path";
import { cn } from "@/lib/utils";

const NODE_STYLES = [
  "border-border bg-background text-muted-foreground",
  "border-primary/40 bg-background text-primary",
  "border-primary/50 bg-accent text-primary",
  "border-primary/70 bg-primary/10 text-primary",
  "border-primary bg-primary text-primary-foreground",
] as const;

export function LearningPath() {
  return (
    <section aria-labelledby="learning-path-heading" className="border-t">
      <Container className="py-16 sm:py-20 lg:py-24">
        <header className="max-w-2xl">
          <p className="text-muted-foreground font-mono text-xs tracking-[0.14em] sm:tracking-[0.16em]">
            <span className="text-primary" aria-hidden="true">
              ${" "}
            </span>
            YOUR LINUX JOURNEY
          </p>
          <h2
            id="learning-path-heading"
            className="font-heading mt-5 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl"
          >
            From zero to <span className="text-primary">Linux hero</span>.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
            Follow a structured learning path designed to take you from your
            first terminal command to confidently managing real Linux systems.
          </p>
        </header>

        <ol
          aria-label="Learning path from beginner to expert"
          className="relative mt-12 sm:mt-16"
        >
          {learningLevels.map((level, index) => (
            <LearningPathLevel
              key={level.slug}
              level={level}
              index={index}
              isLast={index === learningLevels.length - 1}
            />
          ))}
        </ol>
      </Container>
    </section>
  );
}

function LearningPathLevel({
  level,
  index,
  isLast,
}: {
  level: LearningLevel;
  index: number;
  isLast: boolean;
}) {
  const isEven = index % 2 === 1;
  const href = getLearningLevelHref(level.slug);
  const nodeStyle =
    NODE_STYLES[index] ?? "border-border bg-background text-muted-foreground";

  return (
    <li
      className={cn(
        "relative grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-4 pb-10 last:pb-0",
        "sm:gap-6 sm:pb-12",
        "lg:grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] lg:gap-8 lg:pb-14",
      )}
    >
      {!isLast ? (
        <>
          <div
            aria-hidden="true"
            className="bg-border absolute top-10 bottom-0 left-5 w-px lg:left-1/2 lg:-translate-x-1/2"
          />
          <span
            aria-hidden="true"
            className="bg-background text-muted-foreground absolute -bottom-0.5 left-5 z-10 flex size-4 -translate-x-1/2 items-center justify-center lg:left-1/2"
          >
            <ChevronDown className="size-3.5" />
          </span>
        </>
      ) : null}

      <div
        className={cn(
          "relative z-10 flex justify-center",
          "lg:col-start-2 lg:row-start-1",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex size-10 items-center justify-center rounded-full border font-mono text-xs font-medium tabular-nums",
            nodeStyle,
          )}
        >
          {level.indicator}
        </span>
      </div>

      <div
        className={cn(
          "min-w-0 lg:row-start-1",
          isEven
            ? "lg:col-start-3 lg:justify-self-start"
            : "lg:col-start-1 lg:justify-self-end",
        )}
      >
        <Link
          href={href}
          aria-labelledby={`learning-level-${level.slug}-title`}
          aria-describedby={`learning-level-${level.slug}-desc`}
          className={cn(
            "group/level block rounded-lg",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          )}
        >
          <Card className="group-hover/level:border-primary/40 group-hover/level:bg-accent/30 group-focus-visible/level:border-primary/40 h-full transition-[border-color,background-color,box-shadow] duration-200 group-hover/level:shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground font-mono text-xs tabular-nums"
                  >
                    {level.indicator}
                  </span>
                  {index === 0 ? (
                    <Badge variant="success">Start here</Badge>
                  ) : null}
                </div>
                <ArrowRight
                  aria-hidden="true"
                  className="text-muted-foreground group-hover/level:text-primary group-focus-visible/level:text-primary size-4 shrink-0 transition-transform duration-200 group-hover/level:translate-x-0.5 group-focus-visible/level:translate-x-0.5"
                />
              </div>
              <CardTitle>
                <h3
                  id={`learning-level-${level.slug}-title`}
                  className="font-heading text-lg leading-snug font-semibold"
                >
                  {level.title}
                </h3>
              </CardTitle>
              <CardDescription
                id={`learning-level-${level.slug}-desc`}
                className="leading-relaxed"
              >
                {level.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </Link>
      </div>
    </li>
  );
}
