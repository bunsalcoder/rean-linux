import Link from "next/link";

import { HeroTerminal } from "@/components/home/hero-terminal";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_70%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_70%,transparent)_1px,transparent_1px)] mask-[linear-gradient(to_bottom,black_0%,black_55%,transparent_100%)] bg-[size:3rem_3rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent)]"
      />

      <Container className="relative py-16 sm:py-20 lg:py-28">
        <div className="grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl min-w-0">
            <p className="text-muted-foreground font-mono text-xs tracking-[0.14em] sm:tracking-[0.16em]">
              <span className="text-primary" aria-hidden="true">
                ${" "}
              </span>
              LEARN LINUX FROM ZERO TO HERO
            </p>

            <h1 className="font-heading mt-5 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]">
              Master <span className="text-primary">Linux</span>, one command at
              a time.
            </h1>

            <p className="text-muted-foreground mt-5 max-w-md text-base leading-relaxed sm:text-lg">
              A modern, practical way to learn Linux — from the basics of the
              terminal to servers, DevOps, and beyond.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/learn"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "h-11 w-full px-5 sm:w-auto",
                )}
              >
                Start Learning
              </Link>
              <Link
                href="/commands"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 w-full px-5 sm:w-auto",
                )}
              >
                Explore Commands
              </Link>
            </div>
          </div>

          <HeroTerminal className="lg:justify-self-stretch" />
        </div>
      </Container>
    </section>
  );
}
