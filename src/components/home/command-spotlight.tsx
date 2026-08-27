import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Terminal } from "@/components/ui/terminal";
import { spotlightCommand } from "@/config/commands";
import { cn } from "@/lib/utils";

const exploreLinkClassName = cn(
  "group/all text-primary inline-flex min-h-11 items-center gap-1 text-sm font-medium sm:min-h-0",
  "focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
);

export function CommandSpotlight() {
  const command = spotlightCommand;
  const headingId = "command-spotlight-heading";
  const titleId = `command-${command.command}-title`;

  return (
    <section aria-labelledby={headingId} className="border-t">
      <Container className="py-16 sm:py-20 lg:py-24">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="max-w-2xl min-w-0">
            <p className="text-muted-foreground font-mono text-xs tracking-[0.14em] sm:tracking-[0.16em]">
              <span className="text-primary" aria-hidden="true">
                ${" "}
              </span>
              LINUX COMMANDS
            </p>
            <h2
              id={headingId}
              className="font-heading mt-5 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl"
            >
              Get comfortable in the{" "}
              <span className="text-primary">terminal</span>.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
              Explore essential Linux commands with simple explanations and
              practical examples.
            </p>
          </div>

          <ExploreCommandsLink className="hidden shrink-0 sm:inline-flex" />
        </header>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:gap-5 lg:grid-cols-2 lg:items-stretch lg:gap-6">
          <article aria-labelledby={titleId} className="group/command min-w-0">
            <div
              className={cn(
                "bg-card h-full rounded-lg border p-5 sm:p-6",
                "transition-[border-color,box-shadow] duration-200",
                "group-hover/command:border-primary/40 group-hover/command:shadow-sm",
              )}
            >
              <h3
                id={titleId}
                className="font-heading text-xl font-semibold tracking-tight sm:text-2xl"
              >
                <code
                  className={cn(
                    "text-primary bg-transparent p-0 font-mono text-[1.15em] font-semibold",
                    "group-hover/command:text-primary/80 transition-colors duration-200",
                  )}
                >
                  {command.command}
                </code>
                <span> — </span>
                {command.title}
              </h3>

              <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-base">
                {command.description}
              </p>

              <dl className="mt-6 grid grid-cols-1 gap-3 border-y py-4 sm:grid-cols-3 sm:gap-4">
                <MetaItem term="Command" value={command.command} mono />
                <MetaItem term="Category" value={command.category} />
                <MetaItem term="Difficulty" value={command.difficulty} />
              </dl>

              <div className="mt-6">
                <h4 className="text-muted-foreground font-mono text-xs tracking-[0.14em] uppercase">
                  Syntax
                </h4>
                <pre className="bg-muted mt-2 overflow-x-auto rounded-md border-0 px-3 py-2.5">
                  <code>{command.syntax}</code>
                </pre>
              </div>

              <div className="mt-6">
                <h4 className="text-muted-foreground font-mono text-xs tracking-[0.14em] uppercase">
                  Common options
                </h4>
                <dl className="mt-3 space-y-2">
                  {command.options.map((option) => (
                    <div
                      key={option.flag}
                      className="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-0.5 text-sm"
                    >
                      <dt>
                        <code
                          className={cn(
                            "bg-muted text-foreground px-1.5 py-0.5",
                            "hover:text-primary transition-colors duration-200",
                          )}
                        >
                          {option.flag}
                        </code>
                      </dt>
                      <dd className="text-muted-foreground">
                        <span aria-hidden="true">— </span>
                        {option.description}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </article>

          <div className="flex min-w-0 flex-col gap-3">
            <Terminal
              title="learner@rean:~"
              language="bash"
              copyLabel="Copy command examples"
              className="h-full shadow-sm"
              lines={command.examples.map((example) => ({
                command: example.command,
                output: example.output,
                note:
                  example.description === command.description
                    ? undefined
                    : example.description,
              }))}
            />
          </div>
        </div>

        <div className="mt-8 sm:hidden">
          <ExploreCommandsLink />
        </div>
      </Container>
    </section>
  );
}

function MetaItem({
  term,
  value,
  mono = false,
}: {
  term: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.14em] uppercase">
        {term}
      </dt>
      <dd
        className={cn(
          "mt-1 text-sm font-medium",
          mono && "text-primary font-mono",
        )}
      >
        {mono ? <code className="bg-transparent p-0">{value}</code> : value}
      </dd>
    </div>
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
