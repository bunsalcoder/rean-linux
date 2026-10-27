"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  getAccessControlScenario,
  type AccessControlScenarioId,
  type SimulatedAccessControlState,
} from "@/lib/simulate-security-access-control";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: AccessControlScenarioId;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  requireState?: (state: SimulatedAccessControlState) => boolean;
  stateHint?: string;
};

function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, " ").toLowerCase();
}

function commandMatchesHint(command: string, candidates: readonly string[]) {
  const normalized = normalizeCommand(command);
  return candidates.some((candidate) => {
    const target = normalizeCommand(candidate);
    if (target.startsWith("sudo ")) {
      return normalized === target || normalized.startsWith(`${target} `);
    }
    return normalized === target || normalized.startsWith(`${target} `);
  });
}

const EXERCISES: readonly PracticeExercise[] = [
  {
    id: "inspect-identities",
    title: "Exercise 1 — Inspect Users and Groups",
    scenarioId: "full-review",
    task: "Compare human, service, and system accounts. Note that daemon (UID 1) is a normal system account — not automatically suspicious.",
    hint: "Try `getent passwd`, `id deploy`, and `id backup`. Compare shells and group lists.",
    relevantCommands: [
      "whoami",
      "getent passwd",
      "id deploy",
      "id backup",
      "getent group sudo",
    ],
    options: [
      {
        key: "A",
        label:
          "Review purpose, shell, and groups; low-UID system accounts like daemon are expected unless something else looks wrong",
      },
      {
        key: "B",
        label: "Every UID below 1000 proves compromise and must be deleted",
      },
      {
        key: "C",
        label: "Only root exists on healthy Linux systems",
      },
      {
        key: "D",
        label: "getent passwd only lists interactive users",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Access review starts with identity context — system accounts are normal; focus on unexpected shells and privileges.",
    feedbackIncorrect:
      "List passwd entries and compare deploy/backup shells and groups before concluding risk.",
  },
  {
    id: "config-readable",
    title: "Exercise 2 — Overly Readable Configuration",
    scenarioId: "config-readable",
    task: "Find the sensitive config that is world-readable and restrict it to owner/group read.",
    hint: "Run `ls -l /srv/app/config.yml`. World-readable (`r--` for others) is too open for secrets — use `chmod 640`.",
    relevantCommands: [
      "ls -l /srv/app/config.yml",
      "stat /srv/app/config.yml",
      "chmod 640 /srv/app/config.yml",
    ],
    options: [
      {
        key: "A",
        label:
          "0644/world-readable config leaks confidentiality; chmod 640 hardens without breaking owner/group use",
      },
      {
        key: "B",
        label: "World-readable secrets are fine on multi-user hosts",
      },
      {
        key: "C",
        label: "Only execute bits matter for configuration files",
      },
      {
        key: "D",
        label: "chmod 777 is the least-privilege fix",
      },
    ],
    correct: "A",
    requireState: (state) => state.configMode === "0640",
    stateHint: "Apply chmod 640 to /srv/app/config.yml before answering.",
    feedbackCorrect:
      "Correct. Least privilege for files means removing access that nobody in the role needs.",
    feedbackIncorrect:
      "Inspect the mode with ls -l or stat, tighten to 640, then re-list.",
  },
  {
    id: "deploy-writable",
    title: "Exercise 3 — Unintended Write Access on Deploy Script",
    scenarioId: "deploy-writable",
    task: "The deploy script is group-owned by reports with write permission. Restore deployers ownership and a tighter mode.",
    hint: "Use `ls -l` / `namei -l`, then `sudo chgrp deployers /srv/app/deploy.sh` and `chmod 750 /srv/app/deploy.sh`.",
    relevantCommands: [
      "ls -l /srv/app/deploy.sh",
      "namei -l /srv/app/deploy.sh",
      "sudo chgrp deployers /srv/app/deploy.sh",
      "chmod 750 /srv/app/deploy.sh",
    ],
    options: [
      {
        key: "A",
        label:
          "Analysts in reports should not rewrite deploy.sh; move group to deployers and tighten mode",
      },
      {
        key: "B",
        label: "Any group write on scripts improves collaboration and safety",
      },
      {
        key: "C",
        label: "namei proves authentication failed",
      },
      {
        key: "D",
        label: "Leave ownership alone and chmod 777 instead",
      },
    ],
    correct: "A",
    requireState: (state) =>
      state.deployScriptGroup === "deployers" &&
      state.deployScriptMode === "0750",
    stateHint:
      "Change group to deployers and chmod 750 on deploy.sh before answering.",
    feedbackCorrect:
      "Correct. Authorization should match role — deployment write access belongs with deployers, not reports.",
    feedbackIncorrect:
      "Confirm group ownership, chgrp to deployers, chmod 750, then verify with ls -l.",
  },
  {
    id: "excess-sudo",
    title: "Exercise 4 — Remove Unnecessary sudo Membership",
    scenarioId: "excess-sudo",
    task: "Confirm deploy is in sudo without needing full admin rights, remove the membership, and re-check groups.",
    hint: "Compare `id deploy` / `getent group sudo` before and after `sudo gpasswd -d deploy sudo`.",
    relevantCommands: [
      "id deploy",
      "groups deploy",
      "getent group sudo",
      "sudo gpasswd -d deploy sudo",
    ],
    options: [
      {
        key: "A",
        label:
          "deploy had excess authorization via sudo; removing it restores least privilege while deployers can remain",
      },
      {
        key: "B",
        label: "Every service account should stay in sudo forever",
      },
      {
        key: "C",
        label: "sudo membership is authentication, not authorization",
      },
      {
        key: "D",
        label: "groups deploy only proves the password is wrong",
      },
    ],
    correct: "A",
    requireState: (state) => !state.deployInSudo,
    stateHint:
      "Remove deploy from sudo in the simulator before selecting an answer.",
    feedbackCorrect:
      "Correct. Authentication may succeed for deploy, but authorization (sudo) should match the job.",
    feedbackIncorrect:
      "Inspect id/groups, remove sudo membership, then verify getent group sudo.",
  },
  {
    id: "service-shell",
    title: "Exercise 5 — Service Account Shell Hygiene",
    scenarioId: "service-shell",
    task: "The backup service account has an interactive shell. Change it to a non-login shell in the simulator.",
    hint: "Inspect with `getent passwd backup`, then run `set-shell backup /usr/sbin/nologin` (teaching command).",
    relevantCommands: [
      "getent passwd backup",
      "id backup",
      "set-shell backup /usr/sbin/nologin",
    ],
    options: [
      {
        key: "A",
        label:
          "Service accounts should not be used for routine interactive admin; a nologin shell reduces that risk",
      },
      {
        key: "B",
        label: "Every service account needs /bin/bash for least privilege",
      },
      {
        key: "C",
        label: "Shell choice never affects access risk",
      },
      {
        key: "D",
        label: "Delete backup immediately without checking backup jobs",
      },
    ],
    correct: "A",
    requireState: (state) => state.backupShell === "/usr/sbin/nologin",
    stateHint: "Apply set-shell backup /usr/sbin/nologin before answering.",
    feedbackCorrect:
      "Correct. Keep service identities for their job — not as shared interactive admin accounts.",
    feedbackIncorrect:
      "Read the passwd shell field, set nologin with the teaching command, then re-check getent.",
  },
  {
    id: "shared-perms",
    title: "Exercise 6 — Tighten Shared File Permissions",
    scenarioId: "shared-perms",
    task: "A shared report in /tmp is world-writable. Restrict it without removing legitimate owner/group access.",
    hint: "Inspect with `ls -l /tmp/shared-report.txt`, then `chmod 640 /tmp/shared-report.txt`.",
    relevantCommands: [
      "ls -l /tmp/shared-report.txt",
      "stat /tmp/shared-report.txt",
      "chmod 640 /tmp/shared-report.txt",
    ],
    options: [
      {
        key: "A",
        label:
          "World-writable shared files invite integrity problems; 640 keeps owner/group access without others write",
      },
      {
        key: "B",
        label: "0666 is always required for files under /tmp",
      },
      {
        key: "C",
        label: "Removing all access is the only safe fix, even for the owner",
      },
      {
        key: "D",
        label: "Sticky bit on /tmp means file modes no longer matter",
      },
    ],
    correct: "A",
    requireState: (state) => state.sharedReportMode === "0640",
    stateHint: "Apply chmod 640 to the shared report before answering.",
    feedbackCorrect:
      "Correct. Shared locations still need deliberate boundaries — do not confuse convenience with least privilege.",
    feedbackIncorrect:
      "Confirm world write with ls -l, apply chmod 640, and verify the new mode.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "whoami", label: "whoami" },
  { command: "id deploy", label: "id deploy" },
  { command: "getent passwd backup", label: "passwd backup" },
  { command: "getent group sudo", label: "group sudo" },
  { command: "ls -l /srv/app/config.yml", label: "ls config" },
  { command: "ls -l /srv/app/deploy.sh", label: "ls deploy.sh" },
  { command: "namei -l /srv/app/deploy.sh", label: "namei" },
  { command: "access-review", label: "access-review" },
  { command: "help", label: "help" },
] as const;

export function SecurityAccessControlPractice() {
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
  const accessRef = useRef<SimulatedAccessControlState | null>(null);

  const exercise = EXERCISES[exerciseIndex]!;
  const scenario = getAccessControlScenario(exercise.scenarioId);
  const allDone = EXERCISES.every((item) => completed.has(item.id));
  const isCorrect = selected === exercise.correct;

  function syncStateReady(state: SimulatedAccessControlState) {
    if (!exercise.requireState) {
      setStateReady(true);
      return;
    }
    setStateReady(exercise.requireState(state));
  }

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setRanRelevant(false);
    accessRef.current = null;
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
    accessRef.current = null;
    setStateReady(!next.requireState);
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Access Control Review
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Inspect users and
          groups, spot excessive privileges and overly broad file modes, apply
          least-privilege fixes in the simulator, and verify the new state.
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
          This terminal is simulated — it never reads host users/groups/files
          and never runs a real shell.
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
        securityAccessControl={exercise.scenarioId}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Access-control commands"
        onSecurityAccessControlChange={(state) => {
          accessRef.current = state;
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
                ? "Almost — finish the remediation"
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
              Tip: run at least one of the suggested inspection commands so your
              conclusion is based on evidence.
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
