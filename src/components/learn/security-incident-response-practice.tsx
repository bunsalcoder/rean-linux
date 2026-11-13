"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  evidenceFirstWorkflow,
  getSecurityIncidentResponseScenario,
  type SecurityIncidentResponseScenarioId,
  type SimulatedSecurityIncidentResponseState,
} from "@/lib/simulate-security-incident-response";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: SecurityIncidentResponseScenarioId;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  requireState?: (state: SimulatedSecurityIncidentResponseState) => boolean;
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
    id: "event-vs-incident",
    title: "Exercise 1 — Event, alert, or incident?",
    scenarioId: "explore",
    task: "Run `journalctl -u ssh` and decide how to classify the fictional auth pattern.",
    hint: "Failures alone are often events/alerts; success after failures raises incident confidence.",
    relevantCommands: ["journalctl -u ssh", "ir-status"],
    options: [
      {
        key: "A",
        label:
          "Repeated failures then success warrant investigation as a potential incident — confidence grows with corroborating evidence",
      },
      {
        key: "B",
        label: "Any failed password is automatically a confirmed breach",
      },
      {
        key: "C",
        label: "Successful logins never require review",
      },
      {
        key: "D",
        label: "Alerts and incidents are identical terms",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Treat the pattern as suspicious; confirm with account, process, and network evidence.",
    feedbackIncorrect:
      "Re-read the auth log pattern. Alerts need triage; incidents require justified confidence.",
  },
  {
    id: "evidence-first",
    title: "Exercise 2 — Preserve before contain",
    scenarioId: "compromised-account",
    task: "Inspect `id contractor`, run `preserve-evidence`, then contain with `disable-account contractor`.",
    hint: "preserve-evidence should come before disable-account when safe.",
    relevantCommands: [
      "id contractor",
      "preserve-evidence",
      "disable-account contractor",
    ],
    options: [
      {
        key: "A",
        label:
          "Preserving evidence before changing system state protects investigation quality when operationally safe",
      },
      {
        key: "B",
        label: "Always wipe the host immediately before collecting logs",
      },
      {
        key: "C",
        label: "Evidence preservation is optional once an alert fires",
      },
      {
        key: "D",
        label: "Containment never affects forensic value",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Containment can be urgent, but recording evidence first is preferred when safe.",
    feedbackIncorrect:
      "Changing state early can erase volatile clues. Prefer preserve-evidence first in this lab.",
    requireState: (state) =>
      state.evidencePreserved &&
      state.accountDisabled &&
      evidenceFirstWorkflow(state),
    stateHint:
      "Run preserve-evidence before disable-account contractor, then answer.",
  },
  {
    id: "scope-impact",
    title: "Exercise 3 — Scope and severity",
    scenarioId: "explore",
    task: "Review `ps aux`, `ss -tuln`, and `id contractor` to judge scope.",
    hint: "Look for elevated privileges, unusual process, and unexpected ports together.",
    relevantCommands: ["ps aux", "ss -tuln", "id contractor"],
    options: [
      {
        key: "A",
        label:
          "Scope includes the contractor identity, sshd/nginx services, unexpected process/port, and host rean-ir — severity is likely high/critical",
      },
      {
        key: "B",
        label: "Only the package cache is affected",
      },
      {
        key: "C",
        label: "Severity is always informational for SSH failures",
      },
      {
        key: "D",
        label: "Scope assessment can wait until after closing the ticket",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Multiple corroborating indicators raise both scope and priority.",
    feedbackIncorrect:
      "Combine account, process, and network evidence before downplaying severity.",
  },
  {
    id: "containment-tradeoff",
    title: "Exercise 4 — Containment trade-offs",
    scenarioId: "unauthorized-config",
    task: "Inspect nginx config, then choose a containment/eradication path.",
    hint: "compare isolate-service nginx vs restore-config nginx after preserve-evidence.",
    relevantCommands: [
      "cat /etc/nginx/sites-enabled/app",
      "preserve-evidence",
      "restore-config nginx",
      "isolate-service nginx",
    ],
    options: [
      {
        key: "A",
        label:
          "Isolating nginx stops exposure quickly but hurts availability; restoring known-good config is often better after evidence is preserved",
      },
      {
        key: "B",
        label:
          "Always leave tampered reverse proxies online for observation forever",
      },
      {
        key: "C",
        label: "Availability must never be considered during incidents",
      },
      {
        key: "D",
        label: "Configuration restore never needs evidence first",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Multiple decisions can be reasonable — explain the CIA trade-offs.",
    feedbackIncorrect:
      "Think about confidentiality/integrity vs availability when choosing isolation vs restore.",
  },
  {
    id: "recovery-verify",
    title: "Exercise 5 — Recovery completeness",
    scenarioId: "service-recovery",
    task: "Run verify-backup, restore-backup, rotate-credentials contractor, and verify-services.",
    hint: "Closing without verify-services should not count as complete.",
    relevantCommands: [
      "verify-backup",
      "restore-backup",
      "rotate-credentials contractor",
      "verify-services",
    ],
    options: [
      {
        key: "A",
        label:
          "Integrity-checked restore, credential rotation, and service validation are all part of complete recovery",
      },
      {
        key: "B",
        label: "Restoring any backup without checks is always sufficient",
      },
      {
        key: "C",
        label: "Verification is only needed for low-severity incidents",
      },
      {
        key: "D",
        label: "Credential rotation is unrelated to account compromise cases",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Incomplete recovery leaves residual risk and weak post-incident confidence.",
    feedbackIncorrect:
      "Complete the full recovery sequence in the terminal, then reassess.",
    requireState: (state) =>
      state.backupIntegrityChecked &&
      state.backupRestored &&
      state.credentialsRotated &&
      state.servicesVerified,
    stateHint:
      "Finish verify-backup → restore-backup → rotate-credentials contractor → verify-services.",
  },
  {
    id: "lessons-learned",
    title: "Exercise 6 — Post-incident review",
    scenarioId: "explore",
    task: "Run `ir-status` after exploring findings and choose the best lessons-learned focus.",
    hint: "Post-incident work documents timeline, root causes, and preventive improvements.",
    relevantCommands: ["ir-status", "help"],
    options: [
      {
        key: "A",
        label:
          "Document the timeline, decisions, root causes, and preventive controls (SSH hardening, monitoring, backup tests)",
      },
      {
        key: "B",
        label: "Delete all logs immediately so nobody reviews mistakes",
      },
      {
        key: "C",
        label: "Skip documentation if containment seemed successful",
      },
      {
        key: "D",
        label: "Blame a single person without analyzing process gaps",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Lessons learned improve preparation for the next incident.",
    feedbackIncorrect:
      "Post-incident review is about learning and prevention, not blame or log deletion.",
  },
] as const;

export function SecurityIncidentResponsePractice() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [ranRelevant, setRanRelevant] = useState(false);
  const [irState, setIrState] =
    useState<SimulatedSecurityIncidentResponseState | null>(null);
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const exercise = EXERCISES[index]!;
  const scenarioMeta = getSecurityIncidentResponseScenario(exercise.scenarioId);
  const stateReady = exercise.requireState
    ? irState
      ? exercise.requireState(irState)
      : false
    : true;
  const canCheck = selected !== null && ranRelevant && stateReady;
  const isCorrect = checked && selected === exercise.correct;

  function resetTerminal() {
    setTerminalKey((v) => v + 1);
    setRanRelevant(false);
    setIrState(null);
    setChecked(false);
    setSelected(null);
  }

  function goTo(nextIndex: number) {
    setIndex(nextIndex);
    setSelected(null);
    setChecked(false);
    setShowHint(false);
    setRanRelevant(false);
    setIrState(null);
    setTerminalKey((v) => v + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice Session
        </h3>
        <p className="text-sm">
          Six terminal exercises on{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            rean-ir
          </code>
          . Run relevant commands, then choose the best answer. Session-only —
          no host changes.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXERCISES.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => goTo(i)}
            className={cn(
              "rounded border px-2 py-1 text-xs transition-colors",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              i === index
                ? "border-primary/50 bg-primary/10 text-foreground"
                : completed.has(item.id)
                  ? "border-border text-muted-foreground line-through"
                  : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {i + 1}
            {completed.has(item.id) ? " ✓" : ""}
          </button>
        ))}
      </div>

      <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
        <p className="text-foreground font-medium">{exercise.title}</p>
        <p className="text-muted-foreground text-xs">
          Scenario: {scenarioMeta.label}
        </p>
        <p className="text-sm">{exercise.task}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowHint((v) => !v)}
          >
            {showHint ? "Hide hint" : "Show hint"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={resetTerminal}
          >
            Reset terminal
          </Button>
        </div>
        {showHint ? (
          <Callout title="Hint">
            <p>{exercise.hint}</p>
          </Callout>
        ) : null}
      </div>

      <TerminalSimulator
        key={`${exercise.id}-${terminalKey}`}
        securityIncidentResponse={exercise.scenarioId}
        suggestions={exercise.relevantCommands.map((command) => ({
          command,
          label: command,
        }))}
        suggestionsLabel="Practice commands"
        onSecurityIncidentResponseChange={setIrState}
        onCommandRun={(command) => {
          if (commandMatchesHint(command, exercise.relevantCommands)) {
            setRanRelevant(true);
          }
        }}
      />

      <fieldset className="space-y-2">
        <legend className="text-foreground text-sm font-medium">
          Choose the best answer
        </legend>
        {exercise.options.map((opt) => (
          <label
            key={opt.key}
            className={cn(
              "border-border flex cursor-pointer gap-3 rounded-lg border p-3 text-sm",
              selected === opt.key && "border-primary/50 bg-primary/5",
            )}
          >
            <input
              type="radio"
              name={`ir-practice-${exercise.id}`}
              value={opt.key}
              checked={selected === opt.key}
              onChange={() => {
                setSelected(opt.key);
                setChecked(false);
              }}
              className="mt-1"
            />
            <span>
              <span className="font-medium">{opt.key}.</span> {opt.label}
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={!canCheck}
          onClick={() => {
            setChecked(true);
            if (selected === exercise.correct) {
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
        <Button
          type="button"
          variant="outline"
          disabled={index >= EXERCISES.length - 1}
          onClick={() => goTo(index + 1)}
        >
          Next exercise
        </Button>
      </div>

      {!ranRelevant ? (
        <p className="text-muted-foreground text-sm">
          Run at least one relevant command in the terminal before checking.
        </p>
      ) : null}
      {ranRelevant && exercise.requireState && !stateReady ? (
        <p className="text-muted-foreground text-sm">{exercise.stateHint}</p>
      ) : null}

      {checked ? (
        <Callout title={isCorrect ? "Correct" : "Not quite"}>
          <p>
            {isCorrect ? exercise.feedbackCorrect : exercise.feedbackIncorrect}
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
