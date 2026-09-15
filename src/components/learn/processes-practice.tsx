"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";

const PRACTICE_STEPS = [
  {
    command: "ps",
    lookFor:
      "Find the session processes. Note PID `2345` for `node server.js`.",
  },
  {
    command: "ps aux",
    lookFor:
      "Confirm `USER bunsal`, `PID 2345`, and `COMMAND node server.js`. Also notice root-owned processes such as `3100`.",
  },
  {
    command: "kill 2345",
    lookFor:
      "Expect a simulated termination message. This sends SIGTERM — a graceful stop request, not a file delete.",
  },
  {
    command: "ps",
    lookFor:
      "PID `2345` should no longer appear. The simulated process list updates as you interact.",
  },
  {
    command: "kill 3100",
    lookFor:
      "Expect “Operation not permitted” — that process belongs to `root`.",
  },
  {
    command: "sudo kill 3100",
    lookFor:
      "Elevated privileges allow the signal. Confirm with `ps aux` that `3100` is gone.",
  },
  {
    command: "kill -15 2410",
    lookFor:
      "Explicit SIGTERM — the same graceful request as a plain `kill`. Prefer this before escalating.",
  },
  {
    command: "kill -9 2500",
    lookFor:
      "SIGKILL forces termination of the simulated `hung-demo` process. Use `kill -9` only when SIGTERM is not enough — never as a default habit.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "ps", label: "Run ps" },
  { command: "ps aux", label: "Run ps aux" },
  { command: "kill 2345", label: "kill 2345" },
  { command: "ps", label: "Check with ps" },
  { command: "kill 3100", label: "kill 3100" },
  { command: "sudo kill 3100", label: "sudo kill 3100" },
  { command: "kill -15 2410", label: "kill -15 2410" },
  { command: "kill -9 2500", label: "kill -9 2500" },
  { command: "jobs", label: "Run jobs" },
] as const;

const REQUIRED_COMMANDS: ReadonlySet<string> = new Set(
  PRACTICE_STEPS.map((step) => step.command),
);

export function ProcessesPractice() {
  const [ran, setRan] = useState<ReadonlySet<string>>(() => new Set());

  const complete = PRACTICE_STEPS.every((step) => ran.has(step.command));

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Inspect and Stop Processes
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Use{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ps
          </code>{" "}
          and{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ps aux
          </code>{" "}
          to find a process, stop it with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            kill
          </code>
          , handle a root-owned process with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            sudo
          </code>
          , and compare{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            SIGTERM
          </code>{" "}
          vs{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            SIGKILL
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
            Process Challenge
          </p>
          <p className="text-muted-foreground text-sm">Given:</p>
          <pre className="bg-muted overflow-x-auto rounded px-2 py-1.5 font-mono text-xs sm:text-sm">
            PID 2345{"\n"}USER bunsal{"\n"}COMMAND node server.js
          </pre>
          <ol className="list-decimal space-y-3 pl-5 text-sm">
            <li>
              <p>Which command shows a quick process snapshot?</p>
            </li>
            <li>
              <p>
                Which signal does a plain{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  kill 2345
                </code>{" "}
                send?
              </p>
            </li>
            <li>
              <p>
                Why might{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  kill 3100
                </code>{" "}
                fail?
              </p>
            </li>
            <li>
              <p>
                When should you use{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  kill -9
                </code>
                ?
              </p>
            </li>
          </ol>
        </div>
        <p className="text-muted-foreground text-sm">
          Explanations stay beside this terminal on purpose. Prefer
          understanding signals over memorizing destructive real-world habits.
          This terminal is simulated — it never signals processes on your
          computer.
        </p>
      </div>

      <TerminalSimulator
        processes
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
            You inspected processes, stopped one with SIGTERM, used{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              sudo
            </code>{" "}
            for a privileged process, and compared graceful vs forced
            termination. Challenge answers:{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              ps
            </code>{" "}
            for a snapshot; plain{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              kill
            </code>{" "}
            sends SIGTERM;{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              kill 3100
            </code>{" "}
            fails because the process is owned by{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              root
            </code>
            ; use{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              kill -9
            </code>{" "}
            only when a process will not exit after SIGTERM.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
