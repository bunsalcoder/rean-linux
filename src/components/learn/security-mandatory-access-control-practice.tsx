"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  apparmorAllowsPath,
  apparmorProfileIsEnforce,
  fileHasExpectedSelinuxContext,
  getMacScenario,
  profileIsLeastPrivilege,
  type MacScenarioId,
  type SimulatedMacState,
} from "@/lib/simulate-security-mandatory-access-control";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: MacScenarioId;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  requireState?: (state: SimulatedMacState) => boolean;
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
    id: "inspect-apparmor",
    title: "Exercise 1 — Inspect AppArmor Status",
    scenarioId: "explore",
    task: "Run `aa-status` and note which profiles are in enforce mode for nginx and rean-app.",
    hint: "Run aa-status and read the enforce/complain sections.",
    relevantCommands: ["aa-status", "help"],
    options: [
      {
        key: "A",
        label:
          "aa-status lists loaded profiles and whether each is enforce, complain, or unconfined — a first step before changing policy",
      },
      {
        key: "B",
        label: "aa-status rewrites SELinux labels on every file",
      },
      {
        key: "C",
        label: "aa-status disables the firewall permanently",
      },
      {
        key: "D",
        label: "AppArmor profiles only apply to kernel modules",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Status inspection tells you what is confined and how strictly before you touch policy.",
    feedbackIncorrect:
      "Inspect aa-status first — it reports profile modes, not SELinux labels.",
  },
  {
    id: "inspect-selinux",
    title: "Exercise 2 — Inspect SELinux Contexts",
    scenarioId: "explore",
    task: "Run `getenforce`, `sestatus`, `ls -Z /var/www/html/index.html`, and `ps -Z`. Identify user:role:type:level.",
    hint: "Use getenforce, sestatus, ls -Z, and ps -Z.",
    relevantCommands: [
      "getenforce",
      "sestatus",
      "ls -Z /var/www/html/index.html",
      "ps -Z",
    ],
    options: [
      {
        key: "A",
        label:
          "SELinux contexts are user:role:type:level; type enforcement uses process and file types to allow or deny operations",
      },
      {
        key: "B",
        label: "ls -Z only prints chmod octal modes",
      },
      {
        key: "C",
        label: "getenforce deletes AppArmor profiles",
      },
      {
        key: "D",
        label: "ps -Z shows password hashes",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Context components matter — especially the type used in allow rules.",
    feedbackIncorrect:
      "Inspect contexts with ls -Z and ps -Z, then choose the user:role:type:level option.",
  },
  {
    id: "apparmor-deny-fix",
    title: "Exercise 3 — Remediate AppArmor File Denial",
    scenarioId: "apparmor-file-denial",
    task: "Confirm the deny with mac-eval, then add a minimal allow for /srv/app/config.yml.",
    hint: "mac-eval rean-app read /srv/app/config.yml, then mac-allow-path rean-app /srv/app/config.yml r.",
    relevantCommands: [
      "mac-eval rean-app read /srv/app/config.yml",
      "mac-allow-path rean-app /srv/app/config.yml r",
      "aa-status",
    ],
    options: [
      {
        key: "A",
        label:
          "When DAC allows a path but AppArmor enforce denies it, add the narrowest allow that restores the needed operation",
      },
      {
        key: "B",
        label: "Always aa-disable every profile when any file is denied",
      },
      {
        key: "C",
        label: "chmod 777 fixes AppArmor denials automatically",
      },
      {
        key: "D",
        label: "AppArmor denials mean SELinux is disabled",
      },
    ],
    correct: "A",
    requireState: (state) =>
      apparmorAllowsPath(state, "rean-app", "/srv/app/config.yml", "read"),
    stateHint: "Run mac-allow-path rean-app /srv/app/config.yml r first.",
    feedbackCorrect:
      "Correct. Minimal policy changes preserve least privilege.",
    feedbackIncorrect:
      "Allow the specific path after confirming the AppArmor deny with mac-eval.",
  },
  {
    id: "restore-enforce",
    title: "Exercise 4 — Restore AppArmor Enforce Mode",
    scenarioId: "apparmor-complain",
    task: "Confirm rean-app is in complain mode, then restore enforce.",
    hint: "aa-status, then mac-restore-mode rean-app or aa-enforce rean-app.",
    relevantCommands: [
      "aa-status",
      "mac-restore-mode rean-app",
      "aa-enforce rean-app",
    ],
    options: [
      {
        key: "A",
        label:
          "Complain mode logs violations without blocking; restore enforce when the intended production posture is containment",
      },
      {
        key: "B",
        label: "Complain mode permanently deletes denials from disks",
      },
      {
        key: "C",
        label: "Enforce and complain are identical in all cases",
      },
      {
        key: "D",
        label: "aa-enforce disables SELinux MLS forever",
      },
    ],
    correct: "A",
    requireState: (state) => apparmorProfileIsEnforce(state, "rean-app"),
    stateHint: "Restore enforce with mac-restore-mode or aa-enforce.",
    feedbackCorrect:
      "Correct. Complain is a tuning aid — enforce is the containment mode here.",
    feedbackIncorrect: "Put rean-app back into enforce mode before answering.",
  },
  {
    id: "selinux-restorecon",
    title: "Exercise 5 — Fix an SELinux Context Mismatch",
    scenarioId: "selinux-context-mismatch",
    task: "Inspect secret.html context, restore the expected label, and confirm the type matches httpd content policy.",
    hint: "ls -Z, then restorecon /var/www/html/secret.html.",
    relevantCommands: [
      "ls -Z /var/www/html/secret.html",
      "mac-eval httpd_t read /var/www/html/secret.html",
      "restorecon /var/www/html/secret.html",
    ],
    options: [
      {
        key: "A",
        label:
          "A wrong SELinux type can deny access even when DAC modes look correct — restorecon reapplies the expected label",
      },
      {
        key: "B",
        label: "restorecon only changes file owners in /etc/passwd",
      },
      {
        key: "C",
        label: "SELinux denials are always fixed with chmod 777",
      },
      {
        key: "D",
        label: "Contexts are irrelevant on Fedora and RHEL",
      },
    ],
    correct: "A",
    requireState: (state) =>
      fileHasExpectedSelinuxContext(state, "/var/www/html/secret.html"),
    stateHint: "Run restorecon /var/www/html/secret.html.",
    feedbackCorrect:
      "Correct. Label mismatches are a classic SELinux troubleshooting case.",
    feedbackIncorrect:
      "Restore the expected context on secret.html, then re-check.",
  },
  {
    id: "least-privilege",
    title: "Exercise 6 — Narrow an Overly Broad Profile",
    scenarioId: "policy-review",
    task: "Identify broad /** and network allows, then apply mac-narrow-profile rean-app.",
    hint: "aa-status, then mac-narrow-profile rean-app.",
    relevantCommands: [
      "aa-status",
      "mac-narrow-profile rean-app",
      "mac-eval rean-app read /srv/app/config.yml",
    ],
    options: [
      {
        key: "A",
        label:
          "Least privilege removes blanket filesystem/network rights and keeps only the paths and sockets the application needs",
      },
      {
        key: "B",
        label: "Broader profiles are always safer because denials never happen",
      },
      {
        key: "C",
        label: "sys_admin capability should be granted to every web app",
      },
      {
        key: "D",
        label: "Policy review only matters for desktop wallpapers",
      },
    ],
    correct: "A",
    requireState: (state) => profileIsLeastPrivilege(state, "rean-app"),
    stateHint: "Apply mac-narrow-profile rean-app.",
    feedbackCorrect:
      "Correct. Containment quality depends on how tight the policy is.",
    feedbackIncorrect:
      "Narrow the fictional rean-app profile before selecting the answer.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "aa-status", label: "aa-status" },
  { command: "getenforce", label: "getenforce" },
  { command: "ls -Z /var/www/html", label: "ls -Z" },
  { command: "ps -Z", label: "ps -Z" },
  {
    command: "mac-eval rean-app read /srv/app/config.yml",
    label: "mac-eval",
  },
  { command: "help", label: "help" },
] as const;

export function SecurityMandatoryAccessControlPractice() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [ranRelevant, setRanRelevant] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [stateReady, setStateReady] = useState(
    () => !EXERCISES[0]!.requireState,
  );
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const macRef = useRef<SimulatedMacState | null>(null);

  const exercise = EXERCISES[exerciseIndex]!;
  const scenario = getMacScenario(exercise.scenarioId);
  const allDone = EXERCISES.every((item) => completed.has(item.id));
  const isCorrect = selected === exercise.correct;

  function syncStateReady(state: SimulatedMacState) {
    if (!exercise.requireState) {
      setStateReady(true);
      return;
    }
    setStateReady(exercise.requireState(state));
  }

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setRanRelevant(false);
    macRef.current = null;
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
    macRef.current = null;
    setStateReady(!next.requireState);
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Mandatory Access Control
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Inspect AppArmor
          and SELinux state, remediate denials and labels, restore enforce mode,
          and narrow overly broad profiles in simulation.
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
          This terminal is simulated — it never runs real AppArmor/SELinux or
          changes host security settings.
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
        securityMandatoryAccessControl={exercise.scenarioId}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="MAC commands"
        onSecurityMandatoryAccessControlChange={(state) => {
          macRef.current = state;
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
            You finished all six exercises. Continue to the interactive MAC lab
            or the final knowledge check when ready.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
