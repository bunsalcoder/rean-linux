"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";

const PRACTICE_STEPS = [
  {
    command: "ls -l",
    lookFor:
      "Who owns `report.txt`? Which group owns it? Note the permission string `-rw-r-----`.",
  },
  {
    command: "chown alice report.txt",
    lookFor:
      "Expect a simulated “Operation not permitted” error. Why did it fail for a normal user?",
  },
  {
    command: "sudo chown alice report.txt",
    lookFor:
      "Elevated privileges let the ownership change succeed. Run `ls -l` afterward to confirm the owner is `alice`.",
  },
  {
    command: "sudo chgrp engineering report.txt",
    lookFor:
      "Only the group should change. Verify with `ls -l` that the group is now `engineering`.",
  },
] as const;

const PRACTICE_SUGGESTIONS = PRACTICE_STEPS.map((step) => ({
  command: step.command,
  label: `Run ${step.command}`,
}));

const REQUIRED_COMMANDS: ReadonlySet<string> = new Set(
  PRACTICE_STEPS.map((step) => step.command),
);

export function OwnershipAndSudoPractice() {
  const [ran, setRan] = useState<ReadonlySet<string>>(() => new Set());

  const complete = PRACTICE_STEPS.every((step) => ran.has(step.command));

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Ownership and Privileges
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Inspect ownership
          with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ls -l
          </code>
          , see why{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            chown
          </code>{" "}
          fails without privileges, then use{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            sudo
          </code>{" "}
          to change the owner and group.
        </p>
        <ol className="list-decimal space-y-3 pl-5">
          {PRACTICE_STEPS.map((step) => (
            <li key={step.command}>
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
            Ownership Challenge
          </p>
          <p className="text-muted-foreground text-sm">Given:</p>
          <pre className="bg-muted overflow-x-auto rounded px-2 py-1.5 font-mono text-xs sm:text-sm">
            -rw-r----- alice developers report.txt
          </pre>
          <ol className="list-decimal space-y-3 pl-5 text-sm">
            <li>
              <p>Who owns the file?</p>
            </li>
            <li>
              <p>What is the group owner?</p>
            </li>
            <li>
              <p>
                Which command changes the owner to{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  bunsal
                </code>
                ?
              </p>
            </li>
            <li>
              <p>Which command changes only the group?</p>
            </li>
          </ol>
        </div>
        <p className="text-muted-foreground text-sm">
          This terminal is simulated. It never changes real files, never asks
          for your real password, and never runs commands on your computer.
        </p>
      </div>

      <TerminalSimulator
        ownership
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Practice commands"
        onCommandRun={(command) => {
          const normalized = command.trim();
          if (!REQUIRED_COMMANDS.has(normalized)) {
            return;
          }
          setRan((prev) => {
            if (prev.has(normalized)) {
              return prev;
            }
            const next = new Set(prev);
            next.add(normalized);
            return next;
          });
        }}
      />

      {complete ? (
        <Callout title="Nice work!">
          <p>
            You connected permissions, owner, group, and{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              sudo
            </code>
            . Challenge answers: owner is{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              alice
            </code>
            ; group owner is{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              developers
            </code>
            ; change owner with{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              sudo chown bunsal report.txt
            </code>
            ; change only the group with{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              sudo chgrp developers report.txt
            </code>
            .
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
