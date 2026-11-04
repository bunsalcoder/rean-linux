"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  getSshHardeningScenario,
  hasAllowUsersPolicy,
  hasRestrictiveMaxAuthTries,
  isPasswordAuthEnabled,
  isRootLoginAllowed,
  sshdConfigValid,
  type SimulatedSshHardeningState,
  type SshHardeningScenarioId,
} from "@/lib/simulate-security-ssh-hardening";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: SshHardeningScenarioId;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  requireState?: (state: SimulatedSshHardeningState) => boolean;
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
    id: "inspect-sshd",
    title: "Exercise 1 — Inspect SSH Configuration",
    scenarioId: "explore",
    task: "Review `cat /etc/ssh/sshd_config`, `sshd -T`, and `systemctl status ssh`. Note Port, PermitRootLogin, and authentication settings.",
    hint: "Run cat /etc/ssh/sshd_config, then sshd -T and systemctl status ssh.",
    relevantCommands: [
      "cat /etc/ssh/sshd_config",
      "sshd -T",
      "systemctl status ssh",
      "ss -tuln",
    ],
    options: [
      {
        key: "A",
        label:
          "sshd_config and sshd -T show policy and effective settings; systemctl/ss confirm the service is listening — changing Port alone is not meaningful protection",
      },
      {
        key: "B",
        label: "sshd -T permanently disables SSH encryption",
      },
      {
        key: "C",
        label: "systemctl status ssh rewrites authorized_keys",
      },
      {
        key: "D",
        label: "Configuration files are irrelevant to remote-access risk",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Inspect written config, effective values, and service exposure before hardening.",
    feedbackIncorrect:
      "Inspect the fictional config with cat and sshd -T, then check service status.",
  },
  {
    id: "disable-root",
    title: "Exercise 2 — Restrict Root Login",
    scenarioId: "root-login",
    task: "The server allows direct root SSH login. Disable it with a safer PermitRootLogin value and confirm with sshd -T.",
    hint: "Inspect with grep PermitRootLogin /etc/ssh/sshd_config, then ssh-set PermitRootLogin no.",
    relevantCommands: [
      "grep PermitRootLogin /etc/ssh/sshd_config",
      "ssh-set PermitRootLogin no",
      "sshd -T",
      "ssh root@host",
    ],
    options: [
      {
        key: "A",
        label:
          "Disable direct root SSH login and administer via individual accounts with controlled elevation",
      },
      {
        key: "B",
        label: "Keep PermitRootLogin yes and share the root password widely",
      },
      {
        key: "C",
        label: "Set PermitEmptyPasswords yes for root convenience",
      },
      {
        key: "D",
        label: "Raise MaxAuthTries to 100 for root only",
      },
    ],
    correct: "A",
    requireState: (state) => !isRootLoginAllowed(state),
    stateHint:
      "Set PermitRootLogin to no (or prohibit-password) with ssh-set before answering.",
    feedbackCorrect:
      "Correct. Individual accounts improve accountability; elevate with sudo when needed.",
    feedbackIncorrect:
      "Change PermitRootLogin away from yes, then re-check with sshd -T or ssh root@host.",
  },
  {
    id: "password-to-keys",
    title: "Exercise 3 — Prefer Public-Key Authentication",
    scenarioId: "password-auth",
    task: "Password authentication is open. Verify a fictional key path, then disable PasswordAuthentication.",
    hint: "Run ssh-verify-keys bunsal, then ssh-set PasswordAuthentication no.",
    relevantCommands: [
      "sshd -T",
      "ssh-verify-keys bunsal",
      "ssh-set PasswordAuthentication no",
      "ssh bunsal@host",
    ],
    options: [
      {
        key: "A",
        label:
          "Verify public-key access first, then disable PasswordAuthentication so remote access still works without passwords",
      },
      {
        key: "B",
        label: "Disable PubkeyAuthentication and keep only empty passwords",
      },
      {
        key: "C",
        label: "Turn off the SSH service permanently",
      },
      {
        key: "D",
        label: "Enable PermitEmptyPasswords before disabling keys",
      },
    ],
    correct: "A",
    requireState: (state) =>
      !isPasswordAuthEnabled(state) && state.pubkeyVerified,
    stateHint:
      "Verify keys with ssh-verify-keys bunsal, then ssh-set PasswordAuthentication no.",
    feedbackCorrect:
      "Correct. On real hosts, confirm a recovery session before applying that change.",
    feedbackIncorrect:
      "Mark keys verified and disable PasswordAuthentication in the simulator first.",
  },
  {
    id: "limit-tries-and-users",
    title: "Exercise 4 — Limit Tries and Allowed Users",
    scenarioId: "excess-auth-tries",
    task: "Lower MaxAuthTries to a reasonable value (≤ 4) and ensure AllowUsers limits SSH to bunsal and deploy.",
    hint: "Use ssh-set MaxAuthTries 3 and ssh-set AllowUsers bunsal deploy, then sshd -T.",
    relevantCommands: [
      "grep MaxAuthTries /etc/ssh/sshd_config",
      "ssh-set MaxAuthTries 3",
      "ssh-set AllowUsers bunsal deploy",
      "sshd -T",
    ],
    options: [
      {
        key: "A",
        label:
          "A lower MaxAuthTries limits guesses per connection; AllowUsers shrinks who may authenticate at all",
      },
      {
        key: "B",
        label: "MaxAuthTries encrypts private keys on disk",
      },
      {
        key: "C",
        label: "AllowUsers deletes local accounts not listed",
      },
      {
        key: "D",
        label: "Neither setting affects remote-access risk",
      },
    ],
    correct: "A",
    requireState: (state) =>
      hasRestrictiveMaxAuthTries(state) &&
      hasAllowUsersPolicy(state, ["bunsal", "deploy"]),
    stateHint:
      "Set MaxAuthTries ≤ 4 and AllowUsers to bunsal deploy before answering.",
    feedbackCorrect:
      "Correct. Layer attempt limits with identity allowlists for defense in depth.",
    feedbackIncorrect: "Apply both ssh-set changes, then confirm with sshd -T.",
  },
  {
    id: "validate-and-logs",
    title: "Exercise 5 — Validate Config and Read Logs",
    scenarioId: "invalid-config",
    task: "Validate the broken config with sshd -t, repair it, confirm restart works, then switch mental model to log review (journalctl -u ssh also works after fix).",
    hint: "Run sshd -t, then ssh-fix-syntax, sshd -t again, and systemctl restart ssh.",
    relevantCommands: [
      "sshd -t",
      "cat /etc/ssh/sshd_config",
      "ssh-fix-syntax",
      "systemctl restart ssh",
      "journalctl -u ssh",
    ],
    options: [
      {
        key: "A",
        label:
          "sshd -t catches syntax/option errors before restart; invalid config can fail service restarts — always validate and keep recovery access",
      },
      {
        key: "B",
        label: "Invalid sshd_config never affects restarts",
      },
      {
        key: "C",
        label: "journalctl permanently grants root SSH login",
      },
      {
        key: "D",
        label: "Fixing typos is unnecessary if Port is non-default",
      },
    ],
    correct: "A",
    requireState: (state) => sshdConfigValid(state) && state.lastRestartOk,
    stateHint:
      "Repair with ssh-fix-syntax, validate with sshd -t, then systemctl restart ssh.",
    feedbackCorrect:
      "Correct. Distinguish syntax validation (sshd -t) from effective values (sshd -T) and log review.",
    feedbackIncorrect:
      "Fix the invalid option, validate, restart successfully, then choose the option about validation and recovery.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "cat /etc/ssh/sshd_config", label: "cat sshd_config" },
  { command: "sshd -T", label: "sshd -T" },
  { command: "sshd -t", label: "sshd -t" },
  { command: "systemctl status ssh", label: "status ssh" },
  { command: "journalctl -u ssh", label: "journalctl" },
  { command: "help", label: "help" },
] as const;

export function SecuritySshHardeningPractice() {
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
  const sshRef = useRef<SimulatedSshHardeningState | null>(null);

  const exercise = EXERCISES[exerciseIndex]!;
  const scenario = getSshHardeningScenario(exercise.scenarioId);
  const allDone = EXERCISES.every((item) => completed.has(item.id));
  const isCorrect = selected === exercise.correct;

  function syncStateReady(state: SimulatedSshHardeningState) {
    if (!exercise.requireState) {
      setStateReady(true);
      return;
    }
    setStateReady(exercise.requireState(state));
  }

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setRanRelevant(false);
    sshRef.current = null;
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
    sshRef.current = null;
    setStateReady(!next.requireState);
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: SSH Security Hardening
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Inspect sshd
          settings, remediate root and password exposure, tighten attempt limits
          and allowlists, and validate fictional configuration before restart.
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
          This terminal is simulated — it never runs real SSH, never reads host
          sshd_config, and never generates real keys or credentials.
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
        securitySshHardening={exercise.scenarioId}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="SSH hardening commands"
        onSecuritySshHardeningChange={(state) => {
          sshRef.current = state;
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
                ? "Almost — finish the configuration change"
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
            You finished all five exercises. Continue to the interactive SSH
            hardening lab or the final knowledge check when ready.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
