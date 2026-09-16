"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";

const PRACTICE_STEPS = [
  {
    command: "apt search curl",
    lookFor:
      "Find `curl` and related packages such as `libcurl4` in the search results.",
  },
  {
    command: "apt show curl",
    lookFor:
      "Confirm `Status: not installed`, plus version and description details.",
  },
  {
    command: "sudo apt update",
    lookFor:
      "Package information is refreshed. This does not upgrade installed software by itself.",
  },
  {
    command: "sudo apt install curl",
    lookFor: "Expect a successful install message. `curl` becomes installed.",
  },
  {
    command: "apt show curl",
    lookFor: "Status should now read `installed`.",
  },
  {
    command: "sudo apt remove curl",
    lookFor: "The package is removed from the simulated system.",
  },
  {
    command: "apt show curl",
    lookFor: "Status should return to `not installed`.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "apt search curl", label: "apt search curl" },
  { command: "apt show curl", label: "apt show curl" },
  { command: "sudo apt update", label: "sudo apt update" },
  { command: "sudo apt install curl", label: "sudo apt install curl" },
  { command: "apt show curl", label: "Check status" },
  { command: "sudo apt remove curl", label: "sudo apt remove curl" },
  { command: "apt show curl", label: "Confirm removal" },
  { command: "apt --help", label: "apt --help" },
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

export function PackageManagementPractice() {
  const [ran, setRan] = useState<readonly string[]>([]);

  const complete = ran.length >= PRACTICE_STEPS.length;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Search, Install, and Remove a Package
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Search for{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            curl
          </code>
          , inspect it, refresh package information, install it with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            sudo
          </code>
          , confirm the status change, then remove it and confirm again.
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
            Package Challenge
          </p>
          <p className="text-muted-foreground text-sm">Given:</p>
          <pre className="bg-muted overflow-x-auto rounded px-2 py-1.5 font-mono text-xs sm:text-sm">
            Package: curl{"\n"}Status: not installed → installed → not installed
          </pre>
          <ol className="list-decimal space-y-3 pl-5 text-sm">
            <li>
              <p>
                Does{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  apt update
                </code>{" "}
                upgrade installed packages?
              </p>
            </li>
            <li>
              <p>
                Why might{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  apt install curl
                </code>{" "}
                fail without{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  sudo
                </code>
                ?
              </p>
            </li>
            <li>
              <p>
                Which command shows whether{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  curl
                </code>{" "}
                is installed?
              </p>
            </li>
          </ol>
        </div>
        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs real{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            apt
          </code>
          , never downloads packages, and never changes software on your
          computer.
        </p>
      </div>

      <TerminalSimulator
        packages
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
            You searched, inspected, updated the index, installed{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              curl
            </code>
            , confirmed status, then removed it. Challenge answers:{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              apt update
            </code>{" "}
            refreshes package information only; installing packages usually
            needs elevated privileges;{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              apt show curl
            </code>{" "}
            displays the install status.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
