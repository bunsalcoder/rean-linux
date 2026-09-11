"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import {
  SIMULATED_IDENTITY_PRIMARY_GID,
  SIMULATED_IDENTITY_PRIMARY_GROUP,
  SIMULATED_IDENTITY_SUPPLEMENTARY_GROUPS,
  SIMULATED_IDENTITY_UID,
  SIMULATED_IDENTITY_USER,
} from "@/lib/simulate-users-identity";

const PRACTICE_STEPS = [
  {
    command: "whoami",
    lookFor: `You should see the username ${SIMULATED_IDENTITY_USER}.`,
  },
  {
    command: "id",
    lookFor:
      "Find uid, gid, and the groups= list — numbers with names in parentheses.",
  },
  {
    command: "groups",
    lookFor:
      "Confirm your primary group name appears first, followed by any supplementary groups.",
  },
  {
    command: "cat /etc/passwd",
    lookFor:
      "Locate your user line and spot the UID, GID, home directory, and login shell fields.",
  },
  {
    command: "cat /etc/group",
    lookFor:
      "Find the developers and docker lines and notice who is listed as a member.",
  },
] as const;

const PRACTICE_SUGGESTIONS = PRACTICE_STEPS.map((step) => ({
  command: step.command,
  label: `Run ${step.command}`,
}));

const REQUIRED_COMMANDS: ReadonlySet<string> = new Set(
  PRACTICE_STEPS.map((step) => step.command),
);

export function UsersAndGroupsPractice() {
  const [ran, setRan] = useState<ReadonlySet<string>>(() => new Set());

  const complete = PRACTICE_STEPS.every((step) => ran.has(step.command));

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Inspect Your Linux Identity
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Run each identity
          command below in the simulated terminal and notice what the output
          tells you about the current user.
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
        <div className="border-border bg-muted/30 space-y-2 rounded-lg border p-4">
          <p className="text-foreground text-sm font-medium">Challenge</p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            <li>Which value is your UID?</li>
            <li>Which value is your primary GID?</li>
            <li>Which groups are supplementary groups?</li>
          </ul>
        </div>
        <p className="text-muted-foreground text-sm">
          This terminal is simulated. It never reads your real{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /etc/passwd
          </code>{" "}
          or{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /etc/group
          </code>
          .
        </p>
      </div>

      <TerminalSimulator
        identity
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
            You inspected a simulated Linux identity. Answers for this terminal:{" "}
            UID is {SIMULATED_IDENTITY_UID}, primary GID is{" "}
            {SIMULATED_IDENTITY_PRIMARY_GID} (group{" "}
            {SIMULATED_IDENTITY_PRIMARY_GROUP}), and the supplementary groups are{" "}
            {SIMULATED_IDENTITY_SUPPLEMENTARY_GROUPS.map(
              (group) => group.name,
            ).join(" and ")}
            .
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
