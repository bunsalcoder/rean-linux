"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";

const PRACTICE_STEPS = [
  {
    command: "ls -l",
    lookFor:
      "Identify the owner, group, and the three permission triplets (owner / group / other) for each entry.",
  },
  {
    command: "chmod 755 script.sh",
    lookFor:
      "This sets owner rwx, group r-x, and other r-x. Run `ls -l` again to confirm `-rwxr-xr-x`.",
  },
  {
    command: "chmod 600 private.txt",
    lookFor:
      "Only the owner should retain read and write. Run `ls -l` again to confirm `-rw-------`.",
  },
  {
    command: "chmod u+x script.sh",
    lookFor:
      "Symbolic mode adds execute for the owner. If execute is already set from 755, the mode stays the same — that is expected.",
  },
] as const;

const PRACTICE_SUGGESTIONS = PRACTICE_STEPS.map((step) => ({
  command: step.command,
  label: `Run ${step.command}`,
}));

const REQUIRED_COMMANDS: ReadonlySet<string> = new Set(
  PRACTICE_STEPS.map((step) => step.command),
);

export function FilePermissionsPractice() {
  const [ran, setRan] = useState<ReadonlySet<string>>(() => new Set());

  const complete = PRACTICE_STEPS.every((step) => ran.has(step.command));

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Read and Change Permissions
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Inspect simulated
          permission strings with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ls -l
          </code>
          , then change modes with both numeric and symbolic{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            chmod
          </code>
          .
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
            Permission Challenge
          </p>
          <ol className="list-decimal space-y-3 pl-5 text-sm">
            <li>
              <p>What does this mean?</p>
              <pre className="bg-muted mt-1 overflow-x-auto rounded px-2 py-1.5 font-mono text-xs sm:text-sm">
                -rw-r--r--
              </pre>
            </li>
            <li>
              <p>
                What does{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  755
                </code>{" "}
                mean?
              </p>
            </li>
            <li>
              <p>
                Which command makes{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  script.sh
                </code>{" "}
                executable by its owner?
              </p>
            </li>
          </ol>
        </div>
        <p className="text-muted-foreground text-sm">
          This terminal is simulated. It never changes real files on your
          computer.
        </p>
      </div>

      <TerminalSimulator
        permissions
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
            You read permission strings and changed modes with both numeric and
            symbolic{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              chmod
            </code>
            . Challenge answers:{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              -rw-r--r--
            </code>{" "}
            means owner{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              rw-
            </code>
            , group{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              r--
            </code>
            , other{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              r--
            </code>
            ;{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              755
            </code>{" "}
            means owner{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              rwx
            </code>
            , group{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              r-x
            </code>
            , other{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              r-x
            </code>
            ; and{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              chmod u+x script.sh
            </code>{" "}
            adds execute for the owner.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
