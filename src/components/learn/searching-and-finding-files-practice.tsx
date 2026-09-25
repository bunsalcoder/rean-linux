"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";

const PRACTICE_STEPS = [
  {
    command: 'find . -name "*.txt"',
    lookFor:
      "Matching text files such as `./notes.txt` and `./projects/app.txt`.",
  },
  {
    command: "find . -type d",
    lookFor:
      "Directories under the current path, including `.`, `./projects`, and `./logs`.",
  },
  {
    command: 'find . -name "notes.txt"',
    lookFor: "The path to `notes.txt`.",
  },
  {
    command: 'grep "bunsal" /etc/passwd',
    lookFor: "The passwd line that contains `bunsal`.",
  },
  {
    command: 'grep -i "linux" notes.txt',
    lookFor: "The notes line that mentions Linux, matched case-insensitively.",
  },
  {
    command: 'grep -r "bunsal" .',
    lookFor:
      "Matching lines from files under the current directory that contain `bunsal`.",
  },
  {
    command: 'find . -type f | grep ".txt"',
    lookFor: "File paths from `find` that contain `.txt`.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: 'find . -name "*.txt"', label: 'find . -name "*.txt"' },
  { command: "find . -type d", label: "find . -type d" },
  { command: 'find . -name "notes.txt"', label: 'find . -name "notes.txt"' },
  {
    command: 'grep "bunsal" /etc/passwd',
    label: 'grep "bunsal" /etc/passwd',
  },
  {
    command: 'grep -i "linux" notes.txt',
    label: 'grep -i "linux" notes.txt',
  },
  { command: 'grep -r "bunsal" .', label: 'grep -r "bunsal" .' },
  {
    command: 'find . -type f | grep ".txt"',
    label: 'find . -type f | grep ".txt"',
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

export function SearchingAndFindingFilesPractice() {
  const [ran, setRan] = useState<readonly string[]>([]);

  const complete = ran.length >= PRACTICE_STEPS.length;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Find Files and Search Text
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Use{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            find
          </code>{" "}
          to locate files and directories, use{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            grep
          </code>{" "}
          to search text, then combine them with a pipe.
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
            Search Challenge
          </p>
          <p className="text-muted-foreground text-sm">Think about:</p>
          <ol className="list-decimal space-y-3 pl-5 text-sm">
            <li>
              <p>
                When do you reach for{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  find
                </code>{" "}
                instead of{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  grep
                </code>
                ?
              </p>
            </li>
            <li>
              <p>
                Why wrap a pattern like{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  {"*.txt"}
                </code>{" "}
                in quotes?
              </p>
            </li>
            <li>
              <p>
                What does the pipe pass from{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  find
                </code>{" "}
                into{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  grep
                </code>
                — filenames, or file contents?
              </p>
            </li>
          </ol>
        </div>
        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs a real shell, never
          searches your computer&apos;s files, and never connects to the
          network.
        </p>
      </div>

      <TerminalSimulator
        searching
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
            You used{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              find
            </code>{" "}
            to locate files and directories,{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              grep
            </code>{" "}
            to search text (including{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              -i
            </code>{" "}
            and{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              -r
            </code>
            ), and a pipe to filter{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              find
            </code>{" "}
            output. Challenge answers:{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              find
            </code>{" "}
            locates paths;{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              grep
            </code>{" "}
            searches text; quotes protect wildcards from the shell; the pipe
            passes{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              find
            </code>
            &apos;s path list as stdin lines to{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              grep
            </code>
            .
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
