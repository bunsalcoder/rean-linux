"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";

const PRACTICE_STEPS = [
  {
    command: "wc -l notes.txt",
    lookFor: "The line count for `notes.txt`.",
  },
  {
    command: "sort names.txt",
    lookFor: "The names from `names.txt` in sorted order.",
  },
  {
    command: "sort -r names.txt",
    lookFor: "The same names in reverse sorted order.",
  },
  {
    command: "sort names.txt | uniq",
    lookFor: "Unique names after sorting — duplicates collapse.",
  },
  {
    command: "sort names.txt | uniq -c",
    lookFor: "Each unique name prefixed with how many times it appears.",
  },
  {
    command: "cut -d: -f1 users.txt",
    lookFor: "Usernames from field 1 of `users.txt`.",
  },
  {
    command: "cut -d: -f3 users.txt",
    lookFor: "Group names from field 3 of `users.txt`.",
  },
  {
    command: "cat users.txt | cut -d: -f3 | sort | uniq",
    lookFor: "The unique group names after cut, sort, and uniq.",
  },
  {
    command: "head -n 5 notes.txt",
    lookFor: "The first five lines of `notes.txt`.",
  },
  {
    command: "tail -n 5 notes.txt",
    lookFor: "The last five lines of `notes.txt`.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "wc -l notes.txt", label: "wc -l notes.txt" },
  { command: "sort names.txt", label: "sort names.txt" },
  { command: "sort -r names.txt", label: "sort -r names.txt" },
  {
    command: "sort names.txt | uniq",
    label: "sort names.txt | uniq",
  },
  {
    command: "sort names.txt | uniq -c",
    label: "sort names.txt | uniq -c",
  },
  {
    command: "cut -d: -f1 users.txt",
    label: "cut -d: -f1 users.txt",
  },
  {
    command: "cut -d: -f3 users.txt",
    label: "cut -d: -f3 users.txt",
  },
  {
    command: "cat users.txt | cut -d: -f3 | sort | uniq",
    label: "cat users.txt | cut -d: -f3 | sort | uniq",
  },
  { command: "head -n 5 notes.txt", label: "head -n 5 notes.txt" },
  { command: "tail -n 5 notes.txt", label: "tail -n 5 notes.txt" },
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

export function TextProcessingPractice() {
  const [ran, setRan] = useState<readonly string[]>([]);

  const complete = ran.length >= PRACTICE_STEPS.length;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Process Text with Small Tools
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Count, sort,
          deduplicate, extract fields, and inspect text using{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            wc
          </code>
          ,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            sort
          </code>
          ,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            uniq
          </code>
          ,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            cut
          </code>
          ,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            head
          </code>
          , and{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            tail
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
            Text-Processing Challenge
          </p>
          <p className="text-muted-foreground text-sm">Think about:</p>
          <ol className="list-decimal space-y-3 pl-5 text-sm">
            <li>
              <p>
                Why do you usually{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  sort
                </code>{" "}
                before{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  uniq
                </code>
                ?
              </p>
            </li>
            <li>
              <p>
                What does{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  cut -d: -f1
                </code>{" "}
                select from each line?
              </p>
            </li>
            <li>
              <p>
                How would you save sorted output with redirection instead of
                only printing it?
              </p>
            </li>
          </ol>
        </div>
        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs a real shell, never
          processes files on your computer, and never connects to the network.
        </p>
      </div>

      <TerminalSimulator
        textProcessing
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
            You counted lines with{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              wc
            </code>
            , sorted and deduplicated with{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              sort
            </code>{" "}
            and{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              uniq
            </code>
            , extracted fields with{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              cut
            </code>
            , combined tools in a pipeline, and inspected edges with{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              head
            </code>{" "}
            and{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              tail
            </code>
            . Challenge answers: sort brings identical lines together for{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              uniq
            </code>
            ;{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              -f1
            </code>{" "}
            selects the first field; redirect with{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              {"sort names.txt > sorted.txt"}
            </code>{" "}
            to save output.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
