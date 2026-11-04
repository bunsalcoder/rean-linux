"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  getSecurityUpdatesScenario,
  hasAppliedSecurityUpgrades,
  hasRefreshedIndex,
  kernelUpdateInstalled,
  listOutdatedPackages,
  nginxRuntimeMatchesInstalled,
  opensshRemediated,
  patchRiskApproved,
  runningKernelIsUpdated,
  type SecurityUpdatesScenarioId,
  type SimulatedSecurityUpdatesState,
} from "@/lib/simulate-security-updates";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: SecurityUpdatesScenarioId;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  requireState?: (state: SimulatedSecurityUpdatesState) => boolean;
  stateHint?: string;
};

function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, " ").toLowerCase();
}

function commandMatchesHint(command: string, candidates: readonly string[]) {
  const normalized = normalizeCommand(command);
  return candidates.some((candidate) => {
    const target = normalizeCommand(candidate);
    return normalized === target || normalized.startsWith(`${target} `);
  });
}

const EXERCISES: readonly PracticeExercise[] = [
  {
    id: "inventory",
    title: "Exercise 1 — Inventory Outdated Packages",
    scenarioId: "identify-outdated",
    task: "Run `sudo apt update` and `apt list --upgradable`. Identify that several packages have candidates without applying upgrades yet.",
    hint: "apt update refreshes metadata only. Use apt list --upgradable afterward.",
    relevantCommands: [
      "sudo apt update",
      "apt list --upgradable",
      "apt policy nginx",
    ],
    options: [
      {
        key: "A",
        label:
          "Refreshing the index reveals upgradable packages; installed versions stay the same until upgrade/install runs",
      },
      {
        key: "B",
        label: "apt update immediately installs every security patch",
      },
      {
        key: "C",
        label: "Upgradable lists only appear after a reboot",
      },
      {
        key: "D",
        label: "apt list --upgradable removes vulnerable packages",
      },
    ],
    correct: "A",
    requireState: (state) =>
      hasRefreshedIndex(state) && listOutdatedPackages(state).length >= 4,
    stateHint:
      "Run sudo apt update and apt list --upgradable without upgrading yet.",
    feedbackCorrect:
      "Correct. Inventory first — then prioritize and patch deliberately.",
    feedbackIncorrect:
      "Refresh metadata and list upgradable packages before changing installed versions.",
  },
  {
    id: "update-vs-upgrade",
    title: "Exercise 2 — apt update vs apt upgrade",
    scenarioId: "update-workflow",
    task: "Refresh metadata, then apply upgrades. Confirm security packages no longer show a candidate version.",
    hint: "sudo apt update, then sudo apt upgrade (or full-upgrade).",
    relevantCommands: [
      "sudo apt update",
      "apt list --upgradable",
      "sudo apt upgrade",
    ],
    options: [
      {
        key: "A",
        label:
          "apt update refreshes package metadata; apt upgrade installs available newer versions of installed packages",
      },
      {
        key: "B",
        label: "apt update and apt upgrade are identical operations",
      },
      {
        key: "C",
        label: "apt upgrade only refreshes repository signatures",
      },
      {
        key: "D",
        label: "apt update reboots into a new kernel",
      },
    ],
    correct: "A",
    requireState: (state) =>
      hasRefreshedIndex(state) && hasAppliedSecurityUpgrades(state),
    stateHint: "Refresh the index, then apply upgrades until candidates clear.",
    feedbackCorrect:
      "Correct. Separating metadata refresh from installation is a core patch workflow skill.",
    feedbackIncorrect:
      "Complete both sudo apt update and sudo apt upgrade in the simulation.",
  },
  {
    id: "critical-ssh",
    title: "Exercise 3 — Remediate a Critical SSH Advisory",
    scenarioId: "prioritize-critical",
    task: "Upgrade openssh-server to the fixed version and restart ssh so the running daemon loads the new code.",
    hint: "sudo apt update, sudo apt install openssh-server, sudo systemctl restart ssh.",
    relevantCommands: [
      "sudo apt update",
      "apt changelog openssh-server",
      "sudo apt install openssh-server",
      "sudo systemctl restart ssh",
      "systemctl status ssh",
    ],
    options: [
      {
        key: "A",
        label:
          "Critical network-exposed services with available fixes and known exploits should be remediated promptly, including required restarts",
      },
      {
        key: "B",
        label: "Ignore critical SSH advisories if CVSS is above 9",
      },
      {
        key: "C",
        label:
          "Installing a package always restarts every service automatically",
      },
      {
        key: "D",
        label: "Only bugfix packages need restarts",
      },
    ],
    correct: "A",
    requireState: (state) =>
      hasRefreshedIndex(state) && opensshRemediated(state),
    stateHint:
      "Upgrade openssh-server and restart ssh until runtime matches installed.",
    feedbackCorrect:
      "Correct. Priority combines severity, exposure, exploitability, and fix availability.",
    feedbackIncorrect:
      "Install the fixed openssh-server package and restart the ssh service.",
  },
  {
    id: "service-restart",
    title: "Exercise 4 — Clear a Pending Service Restart",
    scenarioId: "service-restart",
    task: "nginx is upgraded on disk but still runs the old version. Restart it and verify status.",
    hint: "sudo systemctl restart nginx, then systemctl status nginx.",
    relevantCommands: [
      "systemctl status nginx",
      "journalctl -u nginx",
      "sudo systemctl restart nginx",
    ],
    options: [
      {
        key: "A",
        label:
          "Package installation updates on-disk files; running services may need a restart before the new code is active",
      },
      {
        key: "B",
        label: "Pending restarts mean the package was never installed",
      },
      {
        key: "C",
        label: "systemctl status always reboots the kernel",
      },
      {
        key: "D",
        label: "journalctl removes vulnerable packages",
      },
    ],
    correct: "A",
    requireState: (state) => nginxRuntimeMatchesInstalled(state),
    stateHint: "Restart nginx so runningVersion matches the installed package.",
    feedbackCorrect:
      "Correct. Verify runtime after security updates that touch long-lived daemons.",
    feedbackIncorrect:
      "Restart nginx and confirm the pending restart notice clears.",
  },
  {
    id: "kernel-reboot",
    title: "Exercise 5 — Boot the Updated Kernel",
    scenarioId: "reboot-required",
    task: "The kernel package is installed, but uname -r still shows the old release. Perform a simulated reboot and re-check.",
    hint: "Compare apt policy linux-image-generic with uname -r, then sudo reboot.",
    relevantCommands: [
      "apt policy linux-image-generic",
      "uname -r",
      "sudo reboot",
    ],
    options: [
      {
        key: "A",
        label:
          "Installing a kernel package is not the same as running it — reboot (here: simulated) activates the new kernel",
      },
      {
        key: "B",
        label: "uname -r changes as soon as apt finishes downloading",
      },
      {
        key: "C",
        label: "Kernel updates never require reboot",
      },
      {
        key: "D",
        label: "apt update reboots the host automatically",
      },
    ],
    correct: "A",
    requireState: (state) =>
      kernelUpdateInstalled(state) && runningKernelIsUpdated(state),
    stateHint: "Run sudo reboot after the kernel package is installed.",
    feedbackCorrect:
      "Correct. Track reboot debt separately from package install success.",
    feedbackIncorrect:
      "Use the simulated sudo reboot, then confirm uname -r changed.",
  },
  {
    id: "patch-risk",
    title: "Exercise 6 — Approve a Disruptive Update Safely",
    scenarioId: "patch-risk",
    task: "Complete testing, backup, maintenance-window, and rollback checks; approve the change; then upgrade docker.io.",
    hint: "assess-risk … on for each flag, approve-change, then sudo apt install docker.io.",
    relevantCommands: [
      "assess-risk tested on",
      "assess-risk backup on",
      "assess-risk window on",
      "assess-risk rollback on",
      "approve-change",
      "sudo apt install docker.io",
    ],
    options: [
      {
        key: "A",
        label:
          "Disruptive security updates should follow testing, backup, maintenance-window, and rollback planning before production approval",
      },
      {
        key: "B",
        label:
          "Production hosts should always upgrade immediately with no checks",
      },
      {
        key: "C",
        label: "Rollback plans are unnecessary for container runtimes",
      },
      {
        key: "D",
        label: "Backups replace the need for maintenance windows",
      },
    ],
    correct: "A",
    requireState: (state) =>
      patchRiskApproved(state) &&
      state.packages["docker.io"]?.availableVersion === null,
    stateHint:
      "Enable all risk checks, approve-change, then upgrade docker.io.",
    feedbackCorrect:
      "Correct. Security urgency still needs operational safety for disruptive changes.",
    feedbackIncorrect:
      "Finish the assess-risk checklist and approve-change before installing docker.io.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "sudo apt update", label: "apt update" },
  { command: "apt list --upgradable", label: "list upgradable" },
  { command: "sudo apt upgrade", label: "apt upgrade" },
  { command: "systemctl status nginx", label: "systemctl status" },
  { command: "uname -r", label: "uname -r" },
  { command: "help", label: "help" },
] as const;

export function SecurityUpdatesPractice() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [ranRelevant, setRanRelevant] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [stateReady, setStateReady] = useState(
    () => !EXERCISES[0]?.requireState,
  );
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const updatesRef = useRef<SimulatedSecurityUpdatesState | null>(null);

  const exercise = EXERCISES[exerciseIndex]!;
  const scenario = getSecurityUpdatesScenario(exercise.scenarioId);
  const allDone = EXERCISES.every((item) => completed.has(item.id));
  const isCorrect = selected === exercise.correct;

  function syncStateReady(state: SimulatedSecurityUpdatesState) {
    if (!exercise.requireState) {
      setStateReady(true);
      return;
    }
    setStateReady(exercise.requireState(state));
  }

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setRanRelevant(false);
    updatesRef.current = null;
    setStateReady(!exercise.requireState);
  }

  function resetExerciseInteraction() {
    setSelected(null);
    setSubmitted(false);
    setShowHint(false);
    resetTerminal();
  }

  function goToExercise(nextIndex: number) {
    const next = EXERCISES[nextIndex]!;
    setExerciseIndex(nextIndex);
    setSelected(null);
    setSubmitted(false);
    setShowHint(false);
    setRanRelevant(false);
    updatesRef.current = null;
    setStateReady(!next.requireState);
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Security Updates and Vulnerability Management
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Inventory outdated
          packages, separate apt update from upgrade, remediate critical
          findings, clear pending restarts and reboots, and approve disruptive
          changes safely.
        </p>

        <ol className="list-decimal space-y-2 pl-5 text-sm">
          {EXERCISES.map((item, index) => {
            const done = completed.has(item.id);
            const active = index === exerciseIndex;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => goToExercise(index)}
                  className={cn(
                    "text-left transition-colors",
                    active && "text-foreground font-medium",
                    done && !active && "text-muted-foreground line-through",
                    !done &&
                      !active &&
                      "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.title}
                  {done ? " ✓" : null}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
          <p className="text-foreground text-sm font-medium">
            {exercise.title}
          </p>
          <p className="text-sm">
            <strong className="text-foreground">Scenario:</strong>{" "}
            {scenario.label}
          </p>
          <p className="text-sm">
            <strong className="text-foreground">Context:</strong>{" "}
            {scenario.summary}
          </p>
          <p className="text-sm">{exercise.task}</p>
          <p className="text-muted-foreground text-sm">
            Useful commands:{" "}
            {exercise.relevantCommands.map((command, index) => (
              <span key={command}>
                {index > 0 ? ", " : null}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  {command}
                </code>
              </span>
            ))}
          </p>
        </div>

        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs real apt, never contacts
          repositories, and never reboots your machine.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={resetTerminal}>
          Reset scenario
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowHint((value) => !value)}
        >
          {showHint ? "Hide hint" : "Show hint"}
        </Button>
      </div>

      {showHint ? (
        <Callout title="Hint">
          <p>{exercise.hint}</p>
        </Callout>
      ) : null}

      <TerminalSimulator
        key={`${exercise.id}-${terminalKey}`}
        securityUpdates={exercise.scenarioId}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Security update commands"
        onSecurityUpdatesChange={(state) => {
          updatesRef.current = state;
          syncStateReady(state);
        }}
        onCommandRun={(command) => {
          if (commandMatchesHint(command, exercise.relevantCommands)) {
            setRanRelevant(true);
          }
        }}
      />

      <div className="space-y-3">
        <p className="text-foreground font-medium">
          What is the best conclusion?
        </p>
        <ul className="space-y-2">
          {exercise.options.map((option) => {
            const isSelected = selected === option.key;
            const showResult = submitted && isSelected;
            return (
              <li key={option.key}>
                <button
                  type="button"
                  disabled={submitted && completed.has(exercise.id)}
                  onClick={() => {
                    if (submitted && completed.has(exercise.id)) {
                      return;
                    }
                    setSelected(option.key);
                    setSubmitted(false);
                  }}
                  className={cn(
                    "border-border bg-background hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                    isSelected &&
                      !submitted &&
                      "border-primary/50 bg-primary/5",
                    showResult &&
                      isCorrect &&
                      stateReady &&
                      "border-green-600/40 bg-green-500/10",
                    showResult &&
                      (!isCorrect || !stateReady) &&
                      "border-destructive/40 bg-destructive/10",
                  )}
                >
                  <span className="text-muted-foreground font-mono text-xs font-medium">
                    {option.key}.
                  </span>
                  <span>{option.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {!submitted || !(isCorrect && stateReady) ? (
          <Button
            type="button"
            disabled={!selected || (submitted && isCorrect && stateReady)}
            onClick={() => {
              setSubmitted(true);
              if (selected === exercise.correct && stateReady) {
                setCompleted((prev) => {
                  const next = new Set(prev);
                  next.add(exercise.id);
                  return next;
                });
              }
            }}
          >
            Check answer
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={resetExerciseInteraction}
        >
          Retry
        </Button>
        {exerciseIndex < EXERCISES.length - 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => goToExercise(exerciseIndex + 1)}
          >
            Next exercise
          </Button>
        ) : null}
      </div>

      {submitted ? (
        <Callout
          title={
            isCorrect && stateReady
              ? "Correct"
              : isCorrect && !stateReady
                ? "Almost — finish the simulated change"
                : "Not quite"
          }
        >
          <p>
            {isCorrect && stateReady
              ? exercise.feedbackCorrect
              : isCorrect && !stateReady
                ? (exercise.stateHint ??
                  "Complete the required simulated change, then check again.")
                : exercise.feedbackIncorrect}
          </p>
          {!ranRelevant ? (
            <p className="text-muted-foreground mt-2 text-sm">
              Tip: run at least one suggested inspection or remediation command
              so your conclusion is based on evidence.
            </p>
          ) : null}
        </Callout>
      ) : null}

      {allDone ? (
        <Callout title="Practice complete">
          <p>
            You finished all six exercises. Continue to the interactive lab or
            the final knowledge check when ready.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
