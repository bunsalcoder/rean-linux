"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import {
  getMountedDevice,
  isDeviceMounted,
  type SimulatedDiskState,
} from "@/lib/simulate-disk-usage-mounts";

type PracticeFlags = {
  unmountedData: boolean;
  verifiedAfterUnmount: boolean;
};

type PracticeStep = {
  id: string;
  title: string;
  command: string;
  lookFor: string;
  validate: (
    command: string,
    state: SimulatedDiskState,
    flags: PracticeFlags,
  ) => boolean;
};

function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, " ");
}

const PRACTICE_STEPS: readonly PracticeStep[] = [
  {
    id: "check-filesystem-usage",
    title: "Exercise 1 — Check Filesystem Usage",
    command: "df -h",
    lookFor: "Which filesystem is mounted at /home? → /dev/sda2",
    validate: (command) => normalizeCommand(command) === "df -h",
  },
  {
    id: "check-directory-usage",
    title: "Exercise 2 — Check Directory Usage",
    command: "du -sh /home",
    lookFor: "Approximately how much space does /home use? → 6.5G",
    validate: (command) => {
      const normalized = normalizeCommand(command);
      return normalized === "du -sh /home" || normalized === "du -hs /home";
    },
  },
  {
    id: "investigate-var",
    title: "Exercise 3 — Investigate /var",
    command: "du -h --max-depth=1 /var",
    lookFor: "Which directory inside /var uses the most space? → /var/log",
    validate: (command) =>
      normalizeCommand(command) === "du -h --max-depth=1 /var",
  },
  {
    id: "inspect-mounts",
    title: "Exercise 4 — Inspect Mounts",
    command: "findmnt",
    lookFor: "Which filesystem is mounted at /? → /dev/sda1",
    validate: (command) => normalizeCommand(command) === "findmnt",
  },
  {
    id: "mount-data-disk",
    title: "Exercise 5 — Mount a Data Disk",
    command: "sudo mount /dev/sdb1 /data",
    lookFor: "Mount /dev/sdb1 at /data (a new simulated filesystem).",
    validate: (command, state) => {
      const normalized = normalizeCommand(command);
      const accepted =
        normalized === "sudo mount /dev/sdb1 /data" ||
        normalized === "mount /dev/sdb1 /data";
      if (!accepted) {
        return false;
      }
      return isDeviceMounted(state, "/dev/sdb1");
    },
  },
  {
    id: "verify-mount",
    title: "Exercise 6 — Verify the Mount",
    command: "findmnt",
    lookFor: "Confirm /data appears with SOURCE /dev/sdb1.",
    validate: (command, state) => {
      if (normalizeCommand(command) !== "findmnt") {
        return false;
      }
      const mounted = getMountedDevice(state, "/data");
      return mounted?.name === "/dev/sdb1";
    },
  },
  {
    id: "unmount-disk",
    title: "Exercise 7 — Unmount the Disk",
    command: "sudo umount /data",
    lookFor: "Unmount /data, then verify with findmnt that /data is gone.",
    validate: (command, state, flags) => {
      const normalized = normalizeCommand(command);

      if (normalized === "sudo umount /data" || normalized === "umount /data") {
        if (!isDeviceMounted(state, "/dev/sdb1")) {
          flags.unmountedData = true;
        }
      }

      if (normalized === "findmnt") {
        if (getMountedDevice(state, "/data") === undefined) {
          flags.verifiedAfterUnmount = true;
        }
      }

      return flags.unmountedData && flags.verifiedAfterUnmount;
    },
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "df -h", label: "df -h" },
  { command: "du -sh /home", label: "du -sh /home" },
  { command: "du -h --max-depth=1 /var", label: "du /var depth 1" },
  { command: "findmnt", label: "findmnt" },
  { command: "sudo mount /dev/sdb1 /data", label: "mount /data" },
  { command: "sudo umount /data", label: "umount /data" },
  { command: "help", label: "help" },
] as const;

export function DiskUsageAndMountsPractice() {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const diskRef = useRef<SimulatedDiskState | null>(null);
  const flagsRef = useRef<PracticeFlags>({
    unmountedData: false,
    verifiedAfterUnmount: false,
  });

  const allDone = PRACTICE_STEPS.every((step) => completed.has(step.id));

  function considerStep(command: string, state: SimulatedDiskState) {
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
          Practice: Disk Usage and Mounts
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Check filesystem
          and directory usage, inspect mounts, mount a data disk, verify it, and
          unmount it — all in the safe simulator.
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
                  {step.id === "unmount-disk" ? (
                    <>
                      Run{" "}
                      <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                        sudo umount /data
                      </code>
                      , then verify with{" "}
                      <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                        findmnt
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
          <p className="text-foreground text-sm font-medium">Storage tip</p>
          <pre className="bg-muted overflow-x-auto rounded px-2 py-1.5 font-mono text-xs sm:text-sm">
            df → filesystem capacity{"\n"}
            du → where space is used{"\n"}
            mount / umount → attach or detach{"\n"}
            findmnt → verify mounts
          </pre>
        </div>
        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs real{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            df
          </code>
          ,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            du
          </code>
          ,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            mount
          </code>
          , or{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            umount
          </code>
          , and never inspects host disks.
        </p>
      </div>

      <TerminalSimulator
        diskUsage
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Practice commands"
        onDiskUsageChange={(state) => {
          diskRef.current = state;
        }}
        onCommandRun={(command) => {
          const state = diskRef.current;
          if (!state) {
            return;
          }
          considerStep(command, state);
        }}
      />

      {allDone ? (
        <Callout title="Nice work!">
          <p>
            You checked filesystem and directory usage, inspected mounts,
            mounted{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              /dev/sdb1
            </code>{" "}
            at{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              /data
            </code>
            , verified it with{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              findmnt
            </code>
            , and unmounted it safely.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
