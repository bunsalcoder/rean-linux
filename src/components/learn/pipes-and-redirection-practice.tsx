"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";

const PRACTICE_STEPS = [
  {
    command: 'echo "Linux is powerful" > notes.txt',
    lookFor: "No visible output — stdout was written into `notes.txt`.",
  },
  {
    command: 'echo "Pipes are useful" >> notes.txt',
    lookFor: "No visible output — the second line was appended.",
  },
  {
    command: "cat notes.txt",
    lookFor: "Both lines: `Linux is powerful` and `Pipes are useful`.",
  },
  {
    command: "ls | grep txt",
    lookFor:
      "Filenames containing `txt`, such as `notes.txt` and `readme.txt`.",
  },
  {
    command: "ls nonexistent 2> errors.txt",
    lookFor: "No error on screen — stderr was redirected into `errors.txt`.",
  },
  {
    command: "cat errors.txt",
    lookFor: "The stored error message about `nonexistent` not existing.",
  },
  {
    command: "ls nonexistent > output.txt 2>&1",
    lookFor: "No visible output — stdout and stderr both went to `output.txt`.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  {
    command: 'echo "Linux is powerful" > notes.txt',
    label: 'echo "..." > notes.txt',
  },
  {
    command: 'echo "Pipes are useful" >> notes.txt',
    label: 'echo "..." >> notes.txt',
  },
  { command: "cat notes.txt", label: "cat notes.txt" },
  { command: "ls | grep txt", label: "ls | grep txt" },
  {
    command: "ls nonexistent 2> errors.txt",
    label: "ls nonexistent 2> errors.txt",
  },
  { command: "cat errors.txt", label: "cat errors.txt" },
  {
    command: "ls nonexistent > output.txt 2>&1",
    label: "ls nonexistent > output.txt 2>&1",
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

export function PipesAndRedirectionPractice() {
  const [ran, setRan] = useState<readonly string[]>([]);

  const complete = ran.length >= PRACTICE_STEPS.length;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Redirect, Append, Pipe, and Capture Errors
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Create and append a
          file with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            {">"}
          </code>{" "}
          and{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            {">>"}
          </code>
          , filter with a pipe, then redirect stderr with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            2{">"}
          </code>{" "}
          and{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            2{">"}&1
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
            Redirection Challenge
          </p>
          <p className="text-muted-foreground text-sm">Think about:</p>
          <ol className="list-decimal space-y-3 pl-5 text-sm">
            <li>
              <p>
                What happens to the first line if you use{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  {">"}
                </code>{" "}
                again instead of{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  {">>"}
                </code>
                ?
              </p>
            </li>
            <li>
              <p>
                Does{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  |
                </code>{" "}
                write to a file by itself, or only connect commands?
              </p>
            </li>
            <li>
              <p>
                Why does{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  2{">"}
                </code>{" "}
                need the{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  2
                </code>
                ?
              </p>
            </li>
          </ol>
        </div>
        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs a real shell, never touches
          your computer&apos;s files, and never connects to the network.
        </p>
      </div>

      <TerminalSimulator
        pipes
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
            You overwrote and appended with{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              {">"}
            </code>{" "}
            and{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              {">>"}
            </code>
            , piped{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              ls
            </code>{" "}
            into{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              grep
            </code>
            , and captured stderr with{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              2{">"}
            </code>{" "}
            and{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              2{">"}&1
            </code>
            . Challenge answers:{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              {">"}
            </code>{" "}
            replaces the file;{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              |
            </code>{" "}
            only connects stdout to the next command&apos;s stdin;{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              2
            </code>{" "}
            is the stderr file descriptor.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
