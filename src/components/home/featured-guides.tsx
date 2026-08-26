import { ArrowRight, Clock } from "lucide-react";
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
import { featuredGuides, type FeaturedGuide } from "@/config/guides";
import { cn } from "@/lib/utils";

export function FeaturedGuides() {
  return (
    <section aria-labelledby="featured-guides-heading" className="border-t">
      <Container className="py-16 sm:py-20 lg:py-24">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="max-w-2xl min-w-0">
            <p className="text-muted-foreground font-mono text-xs tracking-[0.14em] sm:tracking-[0.16em]">
              <span className="text-primary" aria-hidden="true">
                ${" "}
              </span>
              START LEARNING
            </p>
            <h2
              id="featured-guides-heading"
              className="font-heading mt-5 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl"
            >
              Practical guides for{" "}
              <span className="text-primary">real Linux users</span>.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
              Learn through clear explanations, practical examples, and commands
              you can actually use.
            </p>
          </div>

          <Link
            href="/guides"
            className={cn(
              "group/all text-primary inline-flex shrink-0 items-center gap-1 text-sm font-medium",
              "focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            )}
          >
            View all guides
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-200 group-hover/all:translate-x-0.5 group-focus-visible/all:translate-x-0.5"
            />
          </Link>
        </header>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredGuides.map((guide) => (
            <li key={guide.href} className="min-w-0">
              <GuideCard guide={guide} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function guideId(href: FeaturedGuide["href"]) {
  return href.replace("/guides/", "");
}

function GuideCard({ guide }: { guide: FeaturedGuide }) {
  const Icon = guide.icon;
  const id = guideId(guide.href);

  return (
    <Link
      href={guide.href}
      aria-labelledby={`guide-${id}-title`}
      aria-describedby={`guide-${id}-desc guide-${id}-meta`}
      className={cn(
        "group/guide block h-full rounded-lg",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
      )}
    >
      <Card className="group-hover/guide:border-primary/40 group-hover/guide:bg-accent/30 group-focus-visible/guide:border-primary/40 h-full transition-[border-color,background-color,box-shadow] duration-200 group-hover/guide:shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="bg-muted text-muted-foreground group-hover/guide:bg-primary/10 group-hover/guide:text-primary group-focus-visible/guide:bg-primary/10 group-focus-visible/guide:text-primary flex size-8 shrink-0 items-center justify-center rounded-md transition-colors duration-200"
              >
                <Icon className="size-4" />
              </span>
              <Badge variant="outline">{guide.category}</Badge>
            </div>
            <ArrowRight
              aria-hidden="true"
              className="text-muted-foreground group-hover/guide:text-primary group-focus-visible/guide:text-primary size-4 shrink-0 transition-transform duration-200 group-hover/guide:translate-x-0.5 group-focus-visible/guide:translate-x-0.5"
            />
          </div>
          <CardTitle>
            <h3
              id={`guide-${id}-title`}
              className="font-heading text-lg leading-snug font-semibold"
            >
              {guide.title}
            </h3>
          </CardTitle>
          <CardDescription id={`guide-${id}-desc`} className="leading-relaxed">
            {guide.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto">
          <dl
            id={`guide-${id}-meta`}
            className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
          >
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Difficulty</dt>
              <dd>{guide.difficulty}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Estimated reading time</dt>
              <Clock aria-hidden="true" className="size-3.5 shrink-0" />
              <dd>{guide.readingTime}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </Link>
  );
}
