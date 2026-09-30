"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";

const PRACTICE_STEPS = [
  {
    command: 'NAME="Bunsal"',
    lookFor: "No output — the shell variable is set quietly.",
  },
  {
    command: 'echo "$NAME"',
    lookFor: "`Bunsal` — double quotes allow variable expansion.",
  },
  {
    command: "echo '$HOME'",
    lookFor: "The literal text `$HOME` — single quotes block expansion.",
  },
  {
    command: 'echo "$HOME"',
    lookFor: "Your simulated home path, such as `/home/bunsal`.",
  },
  {
    command: 'echo "Today is $(date)"',
    lookFor: "A line that includes the simulated date after `Today is`.",
  },
  {
    command: "pwd",
    lookFor: "The current directory path.",
  },
  {
    command: "echo $?",
    lookFor: "`0` — the previous command succeeded.",
  },
  {
    command: 'echo "First"; echo "Second"',
    lookFor: "`First` then `Second` on separate lines.",
  },
  {
    command: "mkdir projects && cd projects",
    lookFor: "No error — `cd` runs because `mkdir` succeeded. The prompt should move into `projects`.",
  },
  {
    command: 'ls nonexistent || echo "Command failed"',
    lookFor: "An `ls` error, then `Command failed` because `||` runs on failure.",
  },
  {
    command: 'echo "A"; echo "B"',
    lookFor: "`A` and `B` — `;` always continues.",
  },
  {
    command: 'ls missing && echo skipped',
    lookFor: "An `ls` error only — `&&` does not run `echo skipped` after failure.",
  },
  {
    command: 'pwd || echo skipped',
    lookFor: "Only the `pwd` path — `||` skips when the previous command succeeds.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: 'NAME="Bunsal"', label: 'NAME="Bunsal"' },
  { command: 'echo "$NAME"', label: 'echo "$NAME"' },
  { command: "echo '$HOME'", label: "echo '$HOME'" },
  { command: 'echo "$HOME"', label: 'echo "$HOME"' },
  {
    command: 'echo "Today is $(date)"',
    label: 'echo "Today is $(date)"',
  },
  { command: "pwd", label: "pwd" },
  { command: "echo $?", label: "echo $?" },
  {
    command: 'echo "First"; echo "Second"',
    label: 'echo "First"; echo "Second"',
  },
  {
    command: "mkdir projects && cd projects",
    label: "mkdir projects && cd projects",
  },
  {
    command: 'ls nonexistent || echo "Command failed"',
    label: 'ls nonexistent || echo "Command failed"',
  },
  {
    command: 'echo "A"; echo "B"',
    label: 'echo "A"; echo "B"',
  },
  {
    command: 'ls missing && echo skipped',
    label: "ls missing && echo skipped",
  },
  {
    command: 'pwd || echo skipped',
    label: "pwd || echo skipped",
  },
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

export function ShellBasicsPractice() {
  const [ran, setRan] = useState<readonly string[]>([]);

  const complete = ran.length >= PRACTICE_STEPS.length;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Shell Basics Workflows
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Set variables,
          compare quotes, use command substitution, check{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            $?
          </code>
          , and combine commands with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ;
          </code>
          ,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            &&
          </code>
          , and{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ||
          </code>
          .
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
            Shell Basics Challenge
          </p>
          <p className="text-muted-foreground text-sm">Think about:</p>
          <ol className="list-decimal space-y-3 pl-5 text-sm">
            <li>
              <p>
                Why does{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  echo &apos;$HOME&apos;
                </code>{" "}
                print differently from{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  echo &quot;$HOME&quot;
                </code>
                ?
              </p>
            </li>
            <li>
              <p>
                When does{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  &&
                </code>{" "}
                run the next command, and when does{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  ||
                </code>{" "}
                ?
              </p>
            </li>
            <li>
              <p>
                What does{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  $?
                </code>{" "}
                tell you after a successful command versus a failing one?
              </p>
            </li>
          </ol>
        </div>
        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs a real shell, never reads
          your computer&apos;s environment, and never touches the host
          filesystem.
        </p>
      </div>

      <TerminalSimulator
        shellBasics
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
            You set a shell variable, compared single and double quotes, used{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              $(date)
            </code>
            , checked exit status with{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              $?
            </code>
            , and combined commands with{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              ;
            </code>
            ,{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              &&
            </code>
            , and{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              ||
            </code>
            . Challenge answers: single quotes keep text literal while double
            quotes expand variables;{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              &&
            </code>{" "}
            continues on success and{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              ||
            </code>{" "}
            on failure;{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              $?
            </code>{" "}
            is usually{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              0
            </code>{" "}
            on success and nonzero on failure.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
