"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  getPrivilegeScenario,
  hasCommandSpecificRule,
  hasNopasswdRule,
  hasUnrestrictedSudo,
  isUserInGroup,
  sudoersSyntaxValid,
  type PrivilegeScenarioId,
  type SimulatedPrivilegeState,
} from "@/lib/simulate-security-privilege-management";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: PrivilegeScenarioId;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  requireState?: (state: SimulatedPrivilegeState) => boolean;
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
    id: "inspect-identity",
    title: "Exercise 1 — Inspect Privilege Levels",
    scenarioId: "explore",
    task: "Compare `id`, `id root`, and `getent group sudo`. Note that root is UID 0 and that sudo group membership grants administrative authorization in this lab.",
    hint: "Run `id`, `id root`, and `getent group sudo`. bunsal should appear in sudo; root shows uid=0(root).",
    relevantCommands: ["id", "id root", "whoami", "getent group sudo"],
    options: [
      {
        key: "A",
        label:
          "root is UID 0 with unrestricted administrative authority; sudo group membership is an authorization path for elevated commands",
      },
      {
        key: "B",
        label: "UID 0 means a regular unprivileged desktop account",
      },
      {
        key: "C",
        label: "Group membership never affects sudo",
      },
      {
        key: "D",
        label: "whoami always prints root even for regular users",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Separate identity (whoami/id) from authorization (groups and sudo rules).",
    feedbackIncorrect:
      "Compare id for bunsal vs root, then read getent group sudo before answering.",
  },
  {
    id: "list-sudo",
    title: "Exercise 2 — List sudo Authorization",
    scenarioId: "explore",
    task: "Use `sudo -l` as bunsal, then `switch-user analyst` and `sudo -l` again. Contrast broad group-based rights with a restrictive command-specific rule.",
    hint: "Run `sudo -l`, then `switch-user analyst` and `sudo -l`. Analyst should only see a status check rule unless group membership expands rights.",
    relevantCommands: [
      "sudo -l",
      "switch-user analyst",
      "cat /etc/sudoers.d/30-analyst",
    ],
    options: [
      {
        key: "A",
        label:
          "sudo -l shows which elevated commands the current user may run; restrictive rules limit analyst to specific diagnostics",
      },
      {
        key: "B",
        label: "sudo -l permanently elevates the user to a root shell",
      },
      {
        key: "C",
        label: "sudo -l only works for UID 0",
      },
      {
        key: "D",
        label: "Listing rights always grants NOPASSWD ALL",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Listing policy is inspection — it does not by itself execute an elevated command.",
    feedbackIncorrect:
      "Inspect sudo -l for bunsal and analyst, and read the analyst drop-in if needed.",
  },
  {
    id: "remove-excess-sudo",
    title: "Exercise 3 — Remove Unnecessary sudo Membership",
    scenarioId: "excess-admin",
    task: "`analyst` is in the sudo group without needing administration. Remove that membership and choose the least-privilege conclusion.",
    hint: "Confirm with `id analyst`, then `sudo gpasswd -d analyst sudo`.",
    relevantCommands: [
      "id analyst",
      "getent group sudo",
      "sudo gpasswd -d analyst sudo",
    ],
    options: [
      {
        key: "A",
        label:
          "Remove analyst from sudo so reporting stays unprivileged unless a justified rule is added later",
      },
      {
        key: "B",
        label: "Add NOPASSWD ALL for analyst to simplify reporting",
      },
      {
        key: "C",
        label: "Leave sudo membership forever once granted",
      },
      {
        key: "D",
        label: "Delete the analyst account instead of trimming group access",
      },
    ],
    correct: "A",
    requireState: (state) => !isUserInGroup(state, "analyst", "sudo"),
    stateHint:
      "Remove analyst from the sudo group with sudo gpasswd -d analyst sudo before answering.",
    feedbackCorrect:
      "Correct. Least privilege removes unnecessary administrative group membership.",
    feedbackIncorrect:
      "Inspect membership, remove analyst from sudo, then re-check id analyst.",
  },
  {
    id: "tighten-deploy",
    title: "Exercise 4 — Replace Unrestricted sudo with a Command Rule",
    scenarioId: "unrestricted-sudo",
    task: "`deploy` has unrestricted sudo but only needs `/usr/local/bin/deploy-app`. Tighten the fictional policy.",
    hint: "Inspect with `switch-user deploy` / `sudo -l`, then `policy set-commands deploy /usr/local/bin/deploy-app`.",
    relevantCommands: [
      "switch-user deploy",
      "sudo -l",
      "policy set-commands deploy /usr/local/bin/deploy-app",
    ],
    options: [
      {
        key: "A",
        label:
          "Replace ALL with a command-specific rule for the deploy script so elevation matches the operational need",
      },
      {
        key: "B",
        label: "Keep ALL and add NOPASSWD for convenience",
      },
      {
        key: "C",
        label: "Move deploy into every privileged group",
      },
      {
        key: "D",
        label: "Disable visudo so syntax is never checked",
      },
    ],
    correct: "A",
    requireState: (state) =>
      !hasUnrestrictedSudo(state, "deploy") &&
      hasCommandSpecificRule(state, "deploy", "/usr/local/bin/deploy-app"),
    stateHint:
      "Apply policy set-commands deploy /usr/local/bin/deploy-app so deploy no longer has ALL.",
    feedbackCorrect:
      "Correct. Command-specific sudo rules are the least-privilege default for service roles.",
    feedbackIncorrect:
      "Tighten deploy’s rule with policy set-commands, then confirm with sudo -l.",
  },
  {
    id: "nopasswd-and-syntax",
    title: "Exercise 5 — NOPASSWD Review and Syntax Validation",
    scenarioId: "nopasswd-risk",
    task: "Inspect backup’s NOPASSWD rule, remove the unjustified passwordless elevation, then confirm understanding of why `visudo -c` matters (also try the invalid-sudoers scenario if you want to see a parse failure).",
    hint: "Read `cat /etc/sudoers.d/40-backup`, run `policy remove-nopasswd backup`, and practice `visudo -c`.",
    relevantCommands: [
      "cat /etc/sudoers.d/40-backup",
      "policy remove-nopasswd backup",
      "visudo -c",
      "sudoers-log",
    ],
    options: [
      {
        key: "A",
        label:
          "NOPASSWD skips the password prompt and needs strong justification; visudo -c validates sudoers syntax before you rely on policy",
      },
      {
        key: "B",
        label: "NOPASSWD encrypts sudoers files automatically",
      },
      {
        key: "C",
        label: "visudo -c grants root shells to every user",
      },
      {
        key: "D",
        label: "Syntax errors never affect administrative access",
      },
    ],
    correct: "A",
    requireState: (state) =>
      !hasNopasswdRule(state, "backup") && sudoersSyntaxValid(state),
    stateHint:
      "Remove NOPASSWD from backup and keep a valid sudoers configuration before answering.",
    feedbackCorrect:
      "Correct. Treat NOPASSWD as an exception, and always validate sudoers syntax.",
    feedbackIncorrect:
      "Remove NOPASSWD for backup, run visudo -c, then choose the option that matches both ideas.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "whoami", label: "whoami" },
  { command: "id", label: "id" },
  { command: "sudo -l", label: "sudo -l" },
  { command: "getent group sudo", label: "getent sudo" },
  { command: "visudo -c", label: "visudo -c" },
  { command: "help", label: "help" },
] as const;

export function SecurityPrivilegeManagementPractice() {
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
  const privilegeRef = useRef<SimulatedPrivilegeState | null>(null);

  const exercise = EXERCISES[exerciseIndex]!;
  const scenario = getPrivilegeScenario(exercise.scenarioId);
  const allDone = EXERCISES.every((item) => completed.has(item.id));
  const isCorrect = selected === exercise.correct;

  function syncStateReady(state: SimulatedPrivilegeState) {
    if (!exercise.requireState) {
      setStateReady(true);
      return;
    }
    setStateReady(exercise.requireState(state));
  }

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setRanRelevant(false);
    privilegeRef.current = null;
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
    privilegeRef.current = null;
    setStateReady(!next.requireState);
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: sudo and Privilege Management
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Inspect identity
          and sudo rights, remediate excess privileges, tighten policies, and
          validate fictional sudoers configuration in the simulator.
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
          This terminal is simulated — it never runs real sudo, never prompts
          for a real password, and never touches host users or sudoers files.
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
        securityPrivilegeManagement={exercise.scenarioId}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Privilege lab commands"
        onSecurityPrivilegeManagementChange={(state) => {
          privilegeRef.current = state;
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
                ? "Almost — finish the policy change"
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
            You finished all five exercises. Continue to the interactive
            privilege lab or the final knowledge check when ready.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
