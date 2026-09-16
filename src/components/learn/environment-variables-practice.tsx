"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";

const PRACTICE_STEPS = [
  {
    command: "echo $HOME",
    lookFor: "Your simulated home directory, such as `/home/bunsal`.",
  },
  {
    command: "echo $USER",
    lookFor: "The simulated username `bunsal`.",
  },
  {
    command: "echo $PATH",
    lookFor:
      "A colon-separated list of directories such as `/usr/local/bin:/usr/bin:/bin`.",
  },
  {
    command: 'export APP_ENV="development"',
    lookFor: "No output — the variable is set and exported.",
  },
  {
    command: "echo $APP_ENV",
    lookFor: "The value `development`.",
  },
  {
    command: "printenv APP_ENV",
    lookFor: "The same value via `printenv`: `development`.",
  },
  {
    command: "unset APP_ENV",
    lookFor: "No output — the variable is removed from this session.",
  },
  {
    command: "printenv APP_ENV",
    lookFor: "Expect `(unset)` because `APP_ENV` is no longer set.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "echo $HOME", label: "echo $HOME" },
  { command: "echo $USER", label: "echo $USER" },
  { command: "echo $PATH", label: "echo $PATH" },
  {
    command: 'export APP_ENV="development"',
    label: 'export APP_ENV="development"',
  },
  { command: "echo $APP_ENV", label: "echo $APP_ENV" },
  { command: "printenv APP_ENV", label: "printenv APP_ENV" },
  { command: "unset APP_ENV", label: "unset APP_ENV" },
  { command: "printenv APP_ENV", label: "Confirm unset" },
] as const;

/** Track ordered practice steps that reuse the same command string. */
function matchNextStep(ran: readonly string[], command: string): string | null {
  const nextIndex = ran.length;
  const nextStep = PRACTICE_STEPS[nextIndex];
  if (!nextStep || nextStep.command !== command) {
    return null;
  }
  return command;
}

export function EnvironmentVariablesPractice() {
  const [ran, setRan] = useState<readonly string[]>([]);

  const complete = ran.length >= PRACTICE_STEPS.length;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Inspect, Export, and Unset Variables
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Read common
          environment variables with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            echo
          </code>
          , export{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            APP_ENV
          </code>
          , confirm it with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            printenv
          </code>
          , then unset it and confirm it is gone.
        </p>
        <ol className="list-decimal space-y-3 pl-5">
          {PRACTICE_STEPS.map((step, index) => (
            <li key={`${step.command}-${index}`}>
              <p>
                Run{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  {step.command}
                </code>
                .
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Look for: {step.lookFor}
              </p>
            </li>
          ))}
        </ol>
        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
          <p className="text-foreground text-sm font-medium">
            Environment Challenge
          </p>
          <p className="text-muted-foreground text-sm">Given:</p>
          <pre className="bg-muted overflow-x-auto rounded px-2 py-1.5 font-mono text-xs sm:text-sm">
            APP_ENV unset → development → unset
          </pre>
          <ol className="list-decimal space-y-3 pl-5 text-sm">
            <li>
              <p>
                Why does{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  echo PATH
                </code>{" "}
                not show the path list?
              </p>
            </li>
            <li>
              <p>
                Does{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  export
                </code>{" "}
                make a variable permanent for every future login?
              </p>
            </li>
            <li>
              <p>
                What character separates directories inside{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  PATH
                </code>
                ?
              </p>
            </li>
          </ol>
        </div>
        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never reads your real environment
          variables, never starts child processes, and never connects to the
          network.
        </p>
      </div>

      <TerminalSimulator
        environment
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Practice commands"
        onCommandRun={(command) => {
          const normalized = command.trim();
          setRan((prev) => {
            if (prev.length >= PRACTICE_STEPS.length) {
              return prev;
            }
            const matched = matchNextStep(prev, normalized);
            if (!matched) {
              return prev;
            }
            return [...prev, matched];
          });
        }}
      />

      {complete ? (
        <Callout title="Nice work!">
          <p>
            You inspected{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              HOME
            </code>
            ,{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              USER
            </code>
            , and{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              PATH
            </code>
            , exported{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              APP_ENV
            </code>
            , confirmed it, then unset it. Challenge answers: use{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              $PATH
            </code>{" "}
            to expand a variable;{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              export
            </code>{" "}
            affects the current shell session (and children), not every future
            login by itself; directories in{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              PATH
            </code>{" "}
            are separated by{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              :
            </code>
            .
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
