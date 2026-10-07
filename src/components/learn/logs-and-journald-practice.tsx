"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import {
  filterJournalEntries,
  journalEntryContains,
  type SimulatedJournalState,
} from "@/lib/simulate-logs-journald";

type PracticeFlags = {
  checkedNginxStatus: boolean;
  inspectedNginxLogs: boolean;
};

type PracticeStep = {
  id: string;
  title: string;
  command: string;
  lookFor: string;
  validate: (
    command: string,
    state: SimulatedJournalState,
    flags: PracticeFlags,
  ) => boolean;
};

function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, " ");
}

const PRACTICE_STEPS: readonly PracticeStep[] = [
  {
    id: "view-journal",
    title: "Exercise 1 — View the Journal",
    command: "journalctl",
    lookFor: "Scan recent simulated system events (boot, ssh, nginx, cron).",
    validate: (command) => normalizeCommand(command) === "journalctl",
  },
  {
    id: "recent-entries",
    title: "Exercise 2 — Show Recent Entries",
    command: "journalctl -n 10",
    lookFor: "Only the last 10 journal entries should appear.",
    validate: (command) => {
      const normalized = normalizeCommand(command);
      return (
        normalized === "journalctl -n 10" || normalized === "journalctl -n10"
      );
    },
  },
  {
    id: "nginx-logs",
    title: "Exercise 3 — Inspect Nginx Logs",
    command: "journalctl -u nginx",
    lookFor: "Entries should mention nginx starting and configuration errors.",
    validate: (command) => {
      const normalized = normalizeCommand(command).toLowerCase();
      if (
        normalized !== "journalctl -u nginx" &&
        normalized !== "journalctl -u nginx.service" &&
        normalized !== "journalctl --unit=nginx" &&
        normalized !== "journalctl --unit=nginx.service"
      ) {
        return false;
      }
      const entries = filterJournalEntries({ unit: "nginx" });
      return entries.length > 0 && journalEntryContains(entries, "nginx");
    },
  },
  {
    id: "find-errors",
    title: "Exercise 4 — Find Errors",
    command: "journalctl -p err",
    lookFor: "Only error-level (and more severe) messages should appear.",
    validate: (command) => {
      const normalized = normalizeCommand(command).toLowerCase();
      if (
        normalized !== "journalctl -p err" &&
        normalized !== "journalctl -p error" &&
        normalized !== "journalctl --priority=err"
      ) {
        return false;
      }
      const entries = filterJournalEntries({ priority: "err" });
      return entries.every((entry) =>
        ["emerg", "alert", "crit", "err"].includes(entry.priority),
      );
    },
  },
  {
    id: "combine-filters",
    title: "Exercise 5 — Combine Filters",
    command: "journalctl -u nginx -p err",
    lookFor: "Nginx error lines about failed start / invalid directive.",
    validate: (command) => {
      const normalized = normalizeCommand(command).toLowerCase();
      const accepted = new Set([
        "journalctl -u nginx -p err",
        "journalctl -p err -u nginx",
        "journalctl -u nginx.service -p err",
        "journalctl -p err -u nginx.service",
        "journalctl -u nginx -p error",
        "journalctl -p error -u nginx",
      ]);
      if (!accepted.has(normalized)) {
        return false;
      }
      const entries = filterJournalEntries({ unit: "nginx", priority: "err" });
      return (
        entries.length > 0 && journalEntryContains(entries, "invalid directive")
      );
    },
  },
  {
    id: "current-boot",
    title: "Exercise 6 — Inspect Current Boot",
    command: "journalctl -b",
    lookFor: "Logs from the simulated current boot (boot id 0).",
    validate: (command) => {
      const normalized = normalizeCommand(command).toLowerCase();
      if (
        normalized !== "journalctl -b" &&
        normalized !== "journalctl -b 0" &&
        normalized !== "journalctl --boot"
      ) {
        return false;
      }
      const entries = filterJournalEntries({ boot: 0 });
      return entries.length > 0 && entries.every((entry) => entry.boot === 0);
    },
  },
  {
    id: "troubleshoot-nginx",
    title: "Exercise 7 — Troubleshoot Nginx",
    command: "systemctl status nginx",
    lookFor:
      "Run systemctl status nginx and journalctl -u nginx. Discover the simulated configuration error.",
    validate: (command, _state, flags) => {
      const normalized = normalizeCommand(command).toLowerCase();

      if (
        normalized === "systemctl status nginx" ||
        normalized === "systemctl status nginx.service"
      ) {
        flags.checkedNginxStatus = true;
      }

      if (
        normalized === "journalctl -u nginx" ||
        normalized === "journalctl -u nginx.service" ||
        normalized === "journalctl -u nginx -p err" ||
        normalized === "journalctl -p err -u nginx"
      ) {
        flags.inspectedNginxLogs = true;
      }

      if (!flags.checkedNginxStatus || !flags.inspectedNginxLogs) {
        return false;
      }

      const nginxErrors = filterJournalEntries({
        unit: "nginx",
        priority: "err",
      });
      return journalEntryContains(nginxErrors, "invalid directive");
    },
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "journalctl", label: "journalctl" },
  { command: "journalctl -n 10", label: "last 10" },
  { command: "journalctl -u nginx", label: "nginx logs" },
  { command: "journalctl -p err", label: "errors" },
  { command: "journalctl -u nginx -p err", label: "nginx errors" },
  { command: "journalctl -b", label: "current boot" },
  { command: "systemctl status nginx", label: "status nginx" },
  { command: "journalctl -f", label: "follow" },
  { command: "help", label: "help" },
] as const;

export function LogsAndJournaldPractice() {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const journalRef = useRef<SimulatedJournalState | null>(null);
  const flagsRef = useRef<PracticeFlags>({
    checkedNginxStatus: false,
    inspectedNginxLogs: false,
  });

  const allDone = PRACTICE_STEPS.every((step) => completed.has(step.id));

  function considerStep(command: string, state: SimulatedJournalState) {
    const normalized = command.trim();
    setCompleted((prev) => {
      const next = new Set(prev);
      for (const step of PRACTICE_STEPS) {
        if (next.has(step.id)) {
          continue;
        }
        const stepIndex = PRACTICE_STEPS.findIndex((s) => s.id === step.id);
        const priorDone = PRACTICE_STEPS.slice(0, stepIndex).every((s) =>
          next.has(s.id),
        );
        if (!priorDone) {
          break;
        }
        if (step.validate(normalized, state, flagsRef.current)) {
          next.add(step.id);
        }
        break;
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Query the Simulated Journal
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> View the journal,
          limit recent lines, filter by service and priority, inspect the
          current boot, and troubleshoot the failed nginx service — all in the
          safe simulator.
        </p>
        <ol className="list-decimal space-y-3 pl-5">
          {PRACTICE_STEPS.map((step) => {
            const done = completed.has(step.id);
            return (
              <li key={step.id}>
                <p className={done ? "text-muted-foreground line-through" : ""}>
                  <span className="text-foreground font-medium">
                    {step.title}
                  </span>
                  {" — "}
                  {step.id === "troubleshoot-nginx" ? (
                    <>
                      Investigate with{" "}
                      <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                        systemctl status nginx
                      </code>{" "}
                      and{" "}
                      <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                        journalctl -u nginx
                      </code>
                    </>
                  ) : (
                    <>
                      Run{" "}
                      <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                        {step.command}
                      </code>
                    </>
                  )}
                  {done ? " ✓" : null}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Look for: {step.lookFor}
                </p>
              </li>
            );
          })}
        </ol>
        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
          <p className="text-foreground text-sm font-medium">
            Troubleshooting tip
          </p>
          <pre className="bg-muted overflow-x-auto rounded px-2 py-1.5 font-mono text-xs sm:text-sm">
            systemctl status → current state{"\n"}
            journalctl -u → what happened{"\n"}
            -p err → focus on errors
          </pre>
        </div>
        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs real{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            journalctl
          </code>
          , never reads host logs, and never accesses{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /var/log
          </code>
          .
        </p>
      </div>

      <TerminalSimulator
        journal
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Practice commands"
        onJournalChange={(state) => {
          journalRef.current = state;
        }}
        onCommandRun={(command) => {
          const state = journalRef.current;
          if (!state) {
            return;
          }
          considerStep(command, state);
        }}
      />

      {allDone ? (
        <Callout title="Nice work!">
          <p>
            You viewed the journal, limited recent entries, filtered by service
            and priority, inspected the current boot, and found nginx’s
            simulated configuration error by combining{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              systemctl status
            </code>{" "}
            with{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              journalctl
            </code>
            .
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
