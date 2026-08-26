import { ArrowRight } from "lucide-react";
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
import { linuxTopics, type LinuxTopic } from "@/config/topics";
import { cn } from "@/lib/utils";

function topicNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function ExploreTopics() {
  return (
    <section aria-labelledby="explore-topics-heading" className="border-t">
      <Container className="py-16 sm:py-20 lg:py-24">
        <header className="max-w-2xl">
          <p className="text-muted-foreground font-mono text-xs tracking-[0.14em] sm:tracking-[0.16em]">
            <span className="text-primary" aria-hidden="true">
              ${" "}
            </span>
            EXPLORE LINUX
          </p>
          <h2
            id="explore-topics-heading"
            className="font-heading mt-5 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl"
          >
            Everything you need to{" "}
            <span className="text-primary">master Linux</span>.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
            Explore Linux from the command line and filesystem to networking,
            security, servers, and DevOps.
          </p>
        </header>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {linuxTopics.map((topic, index) => (
            <li key={topic.id} className="min-w-0">
              <TopicCard topic={topic} index={index} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function TopicCard({ topic, index }: { topic: LinuxTopic; index: number }) {
  const Icon = topic.icon;
  const number = topicNumber(index);

  return (
    <Link
      href={topic.href}
      aria-labelledby={`topic-${topic.id}-title`}
      aria-describedby={`topic-${topic.id}-desc`}
      className={cn(
        "group/topic block h-full rounded-lg",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
      )}
    >
      <Card className="group-hover/topic:border-primary/40 group-hover/topic:bg-accent/30 group-focus-visible/topic:border-primary/40 h-full transition-[border-color,background-color,box-shadow] duration-200 group-hover/topic:shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <span
              aria-hidden="true"
              className="text-muted-foreground font-mono text-xs tabular-nums"
            >
              {number}
            </span>
            <span
              aria-hidden="true"
              className="bg-muted text-muted-foreground group-hover/topic:bg-primary/10 group-hover/topic:text-primary group-focus-visible/topic:bg-primary/10 group-focus-visible/topic:text-primary flex size-8 shrink-0 items-center justify-center rounded-md transition-colors duration-200"
            >
              <Icon className="size-4" />
            </span>
          </div>
          <CardTitle>
            <h3
              id={`topic-${topic.id}-title`}
              className="font-heading text-lg leading-snug font-semibold"
            >
              {topic.title}
            </h3>
          </CardTitle>
          <CardDescription
            id={`topic-${topic.id}-desc`}
            className="leading-relaxed"
          >
            {topic.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto flex flex-col gap-4">
          <ul
            className="flex flex-wrap gap-1.5"
            aria-label={`Topics in ${topic.title}`}
          >
            {topic.topics.map((item) => (
              <li key={item}>
                <Badge variant="outline">{item}</Badge>
              </li>
            ))}
          </ul>
          <span
            aria-hidden="true"
            className="text-muted-foreground group-hover/topic:text-primary group-focus-visible/topic:text-primary inline-flex items-center gap-1 text-xs font-medium transition-colors duration-200"
          >
            Explore
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/topic:translate-x-0.5 group-focus-visible/topic:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
