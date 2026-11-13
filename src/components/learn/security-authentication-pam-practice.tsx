"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  evaluatePamStack,
  getAuthPamScenario,
  hasHealthyPasswordPolicy,
  isAccountExpired,
  isAccountLockedOut,
  pamConfigIsValid,
  type AuthPamScenarioId,
  type SimulatedAuthPamState,
} from "@/lib/simulate-security-authentication-pam";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: AuthPamScenarioId;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  requireState?: (state: SimulatedAuthPamState) => boolean;
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
    id: "inspect-accounts",
    title: "Exercise 1 — Inspect Accounts and Identity",
    scenarioId: "explore",
    task: "Review `getent passwd`, `passwd -S bunsal`, and `chage -l bunsal`. Note that shadow hashes are never shown.",
    hint: "Run getent passwd, passwd -S bunsal, and chage -l bunsal.",
    relevantCommands: [
      "getent passwd",
      "passwd -S bunsal",
      "chage -l bunsal",
      "getent group",
    ],
    options: [
      {
        key: "A",
        label:
          "getent/passwd -S/chage show identity and policy metadata without exposing password hashes — /etc/shadow stays hidden in this lab",
      },
      {
        key: "B",
        label: "getent prints real password hashes for every user",
      },
      {
        key: "C",
        label: "chage permanently disables PAM",
      },
      {
        key: "D",
        label: "Account metadata is irrelevant to authentication",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Inspect identity and aging safely — never treat shadow contents as teaching material here.",
    feedbackIncorrect:
      "Inspect the fictional accounts with getent, passwd -S, and chage -l first.",
  },
  {
    id: "read-pam-sshd",
    title: "Exercise 2 — Read SSH PAM Configuration",
    scenarioId: "explore",
    task: "Inspect `cat /etc/pam.d/sshd` and `pam-auth-update --status`. Identify how shared common-* includes shape the stack.",
    hint: "Run cat /etc/pam.d/sshd and pam-auth-update --status.",
    relevantCommands: [
      "cat /etc/pam.d/sshd",
      "cat /etc/pam.d/common-auth",
      "pam-auth-update --status",
    ],
    options: [
      {
        key: "A",
        label:
          "Application PAM files often @include shared common-* stacks so auth/account/session policy stays consistent across services",
      },
      {
        key: "B",
        label: "PAM files only store firewall rules",
      },
      {
        key: "C",
        label: "sshd never consults PAM on Linux",
      },
      {
        key: "D",
        label: "@include deletes /etc/passwd",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Shared includes reduce duplication — and a bad common-* change can affect many services.",
    feedbackIncorrect:
      "Read /etc/pam.d/sshd and the status summary, then choose the option about shared includes.",
  },
  {
    id: "expired-account",
    title: "Exercise 3 — Remediate Account Expiration",
    scenarioId: "account-expired",
    task: "analyst is expired. Confirm with `chage -l analyst` and `pam-eval sshd analyst`, then clear expiration with `pam-extend analyst`.",
    hint: "Inspect with chage -l analyst and pam-eval sshd analyst, then pam-extend analyst.",
    relevantCommands: [
      "chage -l analyst",
      "pam-eval sshd analyst",
      "pam-extend analyst",
      "passwd -S analyst",
    ],
    options: [
      {
        key: "A",
        label:
          "Expired accounts fail the account stage even if credentials would succeed — extend or renew per policy after verification",
      },
      {
        key: "B",
        label: "Expiration only affects desktop wallpapers",
      },
      {
        key: "C",
        label: "pam-extend disables encryption for everyone",
      },
      {
        key: "D",
        label: "Expired accounts always authenticate as root",
      },
    ],
    correct: "A",
    requireState: (state) => !isAccountExpired(state, "analyst"),
    stateHint:
      "Run pam-extend analyst, then re-check with pam-eval sshd analyst.",
    feedbackCorrect:
      "Correct. Account management is separate from proving credentials.",
    feedbackIncorrect:
      "Clear analyst’s fictional expiration with pam-extend before answering.",
  },
  {
    id: "unlock-deploy",
    title: "Exercise 4 — Clear Failed-Login Lockout",
    scenarioId: "locked-account",
    task: "deploy is locked after repeated failures. Inspect `faillock --user deploy`, then unlock with `pam-unlock deploy` and re-evaluate.",
    hint: "Run faillock --user deploy, then pam-unlock deploy and pam-eval sshd deploy.",
    relevantCommands: [
      "faillock --user deploy",
      "pam-unlock deploy",
      "pam-eval sshd deploy",
      "journalctl -u ssh",
    ],
    options: [
      {
        key: "A",
        label:
          "Lockout stops further guesses after a threshold; unlock only after investigating why failures occurred",
      },
      {
        key: "B",
        label: "faillock permanently grants root without authentication",
      },
      {
        key: "C",
        label: "Locked accounts are immune to all security policy",
      },
      {
        key: "D",
        label: "Unlocking deletes the user from NSS",
      },
    ],
    correct: "A",
    requireState: (state) => !isAccountLockedOut(state, "deploy"),
    stateHint: "Run pam-unlock deploy before selecting the answer.",
    feedbackCorrect:
      "Correct. Treat unlock as an operational decision, not a habit that hides attacks.",
    feedbackIncorrect:
      "Clear deploy’s fictional lockout with pam-unlock, then choose the investigation-aware option.",
  },
  {
    id: "fix-invalid-pam",
    title: "Exercise 5 — Repair Invalid PAM Configuration",
    scenarioId: "invalid-pam",
    task: "sshd PAM references an invalid module. Inspect with `cat /etc/pam.d/sshd` and `pam-eval sshd bunsal`, then repair with `pam-fix-config`.",
    hint: "Run cat /etc/pam.d/sshd, pam-eval sshd bunsal, then pam-fix-config.",
    relevantCommands: [
      "cat /etc/pam.d/sshd",
      "pam-eval sshd bunsal",
      "pam-fix-config",
      "systemctl status ssh",
    ],
    options: [
      {
        key: "A",
        label:
          "Unknown modules invalidate the stack — repair, re-validate, and keep a recovery path before relying on login",
      },
      {
        key: "B",
        label: "Invalid PAM modules improve security automatically",
      },
      {
        key: "C",
        label: "pam-eval authenticates real users on the host",
      },
      {
        key: "D",
        label: "Syntax errors in PAM never affect access",
      },
    ],
    correct: "A",
    requireState: (state) =>
      pamConfigIsValid(state) &&
      evaluatePamStack(state, "sshd", "bunsal").overall === "success",
    stateHint: "Repair with pam-fix-config, then pam-eval sshd bunsal.",
    feedbackCorrect:
      "Correct. Bad PAM edits are a classic lockout cause — validate carefully.",
    feedbackIncorrect:
      "Fix the invalid module with pam-fix-config and confirm pam-eval succeeds.",
  },
  {
    id: "harden-weak-policy",
    title: "Exercise 6 — Harden Weak Authentication Policy",
    scenarioId: "weak-policy",
    task: "Quality and lockout controls are missing. Inspect `pam-auth-update --status`, then apply `pam-harden-policy` and verify.",
    hint: "Run pam-auth-update --status, then pam-harden-policy and re-check status.",
    relevantCommands: [
      "pam-auth-update --status",
      "cat /etc/pam.d/common-auth",
      "cat /etc/pam.d/common-password",
      "pam-harden-policy",
    ],
    options: [
      {
        key: "A",
        label:
          "Enable password quality, failed-login lockout, and reuse prevention appropriate to policy — after confirming a recovery path",
      },
      {
        key: "B",
        label: "Remove all authentication so anyone can log in",
      },
      {
        key: "C",
        label: "Disable faillock and set minlen to 1 for convenience",
      },
      {
        key: "D",
        label: "Weak policy is preferred for internet-facing SSH",
      },
    ],
    correct: "A",
    requireState: (state) => hasHealthyPasswordPolicy(state),
    stateHint: "Run pam-harden-policy, then pam-auth-update --status.",
    feedbackCorrect:
      "Correct. Layer quality, lockout, and history controls without removing recovery access.",
    feedbackIncorrect:
      "Apply pam-harden-policy so quality and lockout show as enabled.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "getent passwd", label: "getent passwd" },
  { command: "chage -l analyst", label: "chage" },
  { command: "faillock --user deploy", label: "faillock" },
  { command: "cat /etc/pam.d/sshd", label: "pam.d/sshd" },
  { command: "pam-eval sshd bunsal", label: "pam-eval" },
  { command: "help", label: "help" },
] as const;

export function SecurityAuthenticationPamPractice() {
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
  const pamRef = useRef<SimulatedAuthPamState | null>(null);

  const exercise = EXERCISES[exerciseIndex]!;
  const scenario = getAuthPamScenario(exercise.scenarioId);
  const allDone = EXERCISES.every((item) => completed.has(item.id));
  const isCorrect = selected === exercise.correct;

  function syncStateReady(state: SimulatedAuthPamState) {
    if (!exercise.requireState) {
      setStateReady(true);
      return;
    }
    setStateReady(exercise.requireState(state));
  }

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setRanRelevant(false);
    pamRef.current = null;
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
    pamRef.current = null;
    setStateReady(!next.requireState);
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Authentication and PAM
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Inspect accounts
          and PAM configuration, remediate expiration and lockout, repair
          invalid stacks, and harden weak authentication policy in simulation.
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
          This terminal is simulated — it never authenticates real users, never
          reads host PAM, and never stores passwords or hashes.
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
        securityAuthenticationPam={exercise.scenarioId}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Authentication commands"
        onSecurityAuthenticationPamChange={(state) => {
          pamRef.current = state;
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
              Tip: run at least one suggested inspection command so your
              conclusion is based on evidence.
            </p>
          ) : null}
        </Callout>
      ) : null}

      {allDone ? (
        <Callout title="Practice complete">
          <p>
            You finished all six exercises. Continue to the interactive
            authentication lab or the final knowledge check when ready.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
