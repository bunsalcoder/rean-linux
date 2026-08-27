import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { CopyButton } from "@/components/ui/copy-button";
import { spotlightCommands, type SpotlightCommand } from "@/config/commands";
import { cn } from "@/lib/utils";

const exploreLinkClassName = cn(
  "group/all text-primary inline-flex min-h-11 items-center gap-1 text-sm font-medium sm:min-h-0",
  "focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
);

export function CommandSpotlight() {
  return (
    <section aria-labelledby="command-spotlight-heading" className="border-t">
      <Container className="py-16 sm:py-20 lg:py-24">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="max-w-2xl min-w-0">
            <p className="text-muted-foreground font-mono text-xs tracking-[0.14em] sm:tracking-[0.16em]">
              <span className="text-primary" aria-hidden="true">
                ${" "}
              </span>
              COMMAND REFERENCE
            </p>
            <h2
              id="command-spotlight-heading"
              className="font-heading mt-5 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl"
            >
              Learn the commands. Understand what they do.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
              Explore essential Linux commands with clear explanations and
              practical examples.
            </p>
          </div>

          <ExploreCommandsLink className="hidden shrink-0 sm:inline-flex" />
        </header>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:gap-5 md:grid-cols-2">
          {spotlightCommands.map((command) => (
            <li key={command.name} className="min-w-0">
              <CommandCard command={command} />
            </li>
          ))}
        </ul>

        <div className="mt-8 sm:hidden">
          <ExploreCommandsLink />
        </div>
      </Container>
    </section>
  );
}

function CommandCard({ command }: { command: SpotlightCommand }) {
  const titleId = `command-${command.name}-title`;
  const descId = `command-${command.name}-desc`;

  return (
    <article
      aria-labelledby={titleId}
      aria-describedby={descId}
      className={cn(
        "group/command bg-card flex h-full min-w-0 flex-col rounded-lg border p-4 sm:p-5",
        "transition-[border-color,box-shadow] duration-200",
        "hover:border-primary/40 hover:shadow-sm",
        "focus-within:border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={titleId} className="leading-none">
            <Link
              href={command.href}
              className={cn(
                "text-primary font-mono text-xl font-semibold tracking-tight sm:text-2xl",
                "rounded-sm transition-colors duration-200",
                "hover:text-primary/80",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              )}
            >
              {command.name}
            </Link>
          </h3>
          <p
            id={descId}
            className="text-muted-foreground mt-2 text-sm leading-relaxed"
          >
            {command.description}
          </p>
        </div>

        <Link
          href={command.href}
          className={cn(
            "text-muted-foreground hover:text-primary inline-flex size-10 shrink-0 items-center justify-center rounded-md sm:size-8",
            "transition-colors duration-200",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          )}
          aria-label={`Learn more about ${command.name}`}
        >
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover/command:translate-x-0.5"
          />
        </Link>
      </div>

      <div
        className={cn(
          "bg-terminal text-terminal-foreground mt-4 flex min-w-0 items-center gap-2 rounded-md border",
          "px-3 py-2",
        )}
      >
        <div className="min-w-0 flex-1 overflow-x-auto font-mono text-sm leading-relaxed whitespace-nowrap">
          <span className="text-prompt select-none" aria-hidden="true">
            ${" "}
          </span>
          <span>{command.example}</span>
        </div>
        <CopyButton
          text={command.example}
          label={`Copy ${command.name} command`}
          className="text-terminal-foreground/80 hover:text-terminal-foreground size-10 shrink-0 hover:bg-white/10 sm:size-8"
        />
      </div>
    </article>
  );
}

function ExploreCommandsLink({ className }: { className?: string }) {
  return (
    <Link href="/commands" className={cn(exploreLinkClassName, className)}>
      Explore all commands
      <ArrowRight
        aria-hidden="true"
        className="size-3.5 transition-transform duration-200 group-hover/all:translate-x-0.5 group-focus-visible/all:translate-x-0.5"
      />
    </Link>
  );
}
