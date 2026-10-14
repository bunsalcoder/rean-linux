"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  evaluateConnection,
  getFirewallScenario,
  hasAllowRule,
  type FirewallScenarioId,
  type SimulatedFirewallState,
} from "@/lib/simulate-firewall-basics";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: FirewallScenarioId;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  /**
   * Optional state gate — correct MCQ only counts when the simulated
   * firewall matches the expected outcome (mutative exercises).
   */
  requireState?: (state: SimulatedFirewallState) => boolean;
  stateHint?: string;
};

function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, " ").toLowerCase();
}

function isSsTuln(command: string): boolean {
  const normalized = normalizeCommand(command);
  if (normalized === "ss -tuln") {
    return true;
  }
  if (!normalized.startsWith("ss -") || normalized.startsWith("ss --")) {
    return false;
  }
  const flags = normalized.slice(4);
  const set = new Set(flags.split(""));
  return (
    set.size === 4 &&
    set.has("t") &&
    set.has("u") &&
    set.has("l") &&
    set.has("n")
  );
}

function commandMatchesHint(command: string, candidates: readonly string[]) {
  const normalized = normalizeCommand(command);
  return candidates.some((candidate) => {
    const target = normalizeCommand(candidate);
    if (target === "ss -tuln") {
      return isSsTuln(normalized);
    }
    if (target.startsWith("check-connect ")) {
      return normalized.startsWith("check-connect ");
    }
    if (target.startsWith("sudo ufw ")) {
      return normalized.startsWith("sudo ufw ");
    }
    return normalized === target;
  });
}

const EXERCISES: readonly PracticeExercise[] = [
  {
    id: "inspect-enabled",
    title: "Exercise 1 — Is the Firewall Enabled?",
    scenarioId: "firewall-disabled",
    task: "Inspect firewall status. Decide whether UFW is currently enforcing rules.",
    hint: "Run `sudo ufw status`. Look for Status: active versus inactive.",
    relevantCommands: ["sudo ufw status", "sudo ufw status verbose"],
    options: [
      {
        key: "A",
        label: "The firewall is inactive — rules are not enforcing filters",
      },
      { key: "B", label: "The firewall is active and blocking all SSH" },
      { key: "C", label: "ss -tuln alone proves the firewall is enabled" },
      { key: "D", label: "UFW is always enabled on every Linux system" },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Status: inactive means this simulated firewall is not filtering traffic until you enable it.",
    feedbackIncorrect:
      "Re-check `sudo ufw status` and read whether Status is active or inactive.",
  },
  {
    id: "why-http-blocked",
    title: "Exercise 2 — Why Is HTTP Blocked?",
    scenarioId: "http-blocked",
    task: "SSH works, but HTTP fails. Diagnose why inbound port 80 is blocked.",
    hint: "Compare `sudo ufw status`, `ss -tuln`, and `check-connect 80/tcp`. nginx may be listening while the firewall still denies the port.",
    relevantCommands: [
      "sudo ufw status",
      "sudo ufw status verbose",
      "ss -tuln",
      "check-connect 80/tcp",
      "check-connect 22/tcp",
    ],
    options: [
      {
        key: "A",
        label:
          "Default incoming deny with no allow rule for 80/tcp (HTTP is filtered)",
      },
      { key: "B", label: "Nothing is listening on port 80" },
      { key: "C", label: "The firewall is disabled" },
      { key: "D", label: "Outbound policy denies all traffic" },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. nginx listens on 80, but with default deny incoming and no allow 80/tcp rule, inbound HTTP is blocked.",
    feedbackIncorrect:
      "Confirm a listener with `ss -tuln`, then compare firewall rules and `check-connect 80/tcp`.",
  },
  {
    id: "allow-http",
    title: "Exercise 3 — Allow HTTP on TCP 80",
    scenarioId: "http-blocked",
    task: "Open inbound HTTP. Add an allow rule for TCP port 80, then verify with status and check-connect.",
    hint: "Use `sudo ufw allow 80/tcp`, then confirm with `sudo ufw status` and `check-connect 80/tcp`.",
    relevantCommands: [
      "sudo ufw allow 80/tcp",
      "sudo ufw status",
      "check-connect 80/tcp",
    ],
    options: [
      {
        key: "A",
        label: "sudo ufw allow 80/tcp opens inbound HTTP when nginx listens",
      },
      { key: "B", label: "You must deny 22/tcp before HTTP can work" },
      { key: "C", label: "Disabling UFW is the only way to allow HTTP" },
      { key: "D", label: "HTTP always uses UDP 80" },
    ],
    correct: "A",
    requireState: (state) =>
      hasAllowRule(state, 80, "tcp") &&
      evaluateConnection(state, 80, "tcp") === "success",
    stateHint:
      "Add the allow rule and re-test before selecting an answer — HTTP must succeed in the simulator.",
    feedbackCorrect:
      "Correct. An explicit allow for 80/tcp overrides the default deny for that port, and the listening nginx service can answer.",
    feedbackIncorrect:
      "Run `sudo ufw allow 80/tcp`, verify the rule, then retry `check-connect 80/tcp`.",
  },
  {
    id: "keep-ssh",
    title: "Exercise 4 — Keep SSH While Opening HTTP",
    scenarioId: "keep-ssh",
    task: "Allow HTTP without removing SSH access. Confirm both 22/tcp and 80/tcp remain allowed.",
    hint: "Add `sudo ufw allow 80/tcp` without deleting or denying 22/tcp. Check both with status and check-connect.",
    relevantCommands: [
      "sudo ufw allow 80/tcp",
      "sudo ufw status",
      "check-connect 22/tcp",
      "check-connect 80/tcp",
    ],
    options: [
      {
        key: "A",
        label:
          "Add allow 80/tcp while leaving the existing allow 22/tcp rule in place",
      },
      {
        key: "B",
        label: "Delete allow 22/tcp so HTTP can take its place",
      },
      {
        key: "C",
        label: "Set default deny outgoing to protect SSH",
      },
      {
        key: "D",
        label: "Disable the firewall permanently",
      },
    ],
    correct: "A",
    requireState: (state) =>
      hasAllowRule(state, 22, "tcp") &&
      hasAllowRule(state, 80, "tcp") &&
      evaluateConnection(state, 22, "tcp") === "success" &&
      evaluateConnection(state, 80, "tcp") === "success",
    stateHint:
      "Both SSH and HTTP must succeed with allow rules present. Do not remove 22/tcp.",
    feedbackCorrect:
      "Correct. Least privilege means opening only what you need — add HTTP without sacrificing the SSH allow rule.",
    feedbackIncorrect:
      "Keep 22/tcp allowed, add 80/tcp, then verify both connections succeed.",
  },
  {
    id: "firewall-vs-listener",
    title: "Exercise 5 — Firewall Block Versus No Listener",
    scenarioId: "service-not-listening",
    task: "HTTP still fails even though the firewall allows port 80. Find the real cause.",
    hint: "If the firewall allows the port, check `ss -tuln`. Connection refused usually means nothing is listening.",
    relevantCommands: [
      "sudo ufw status",
      "ss -tuln",
      "check-connect 80/tcp",
      "check-connect 22/tcp",
    ],
    options: [
      {
        key: "A",
        label:
          "Port 80/tcp is allowed, but no service is listening — not a firewall deny",
      },
      {
        key: "B",
        label: "UFW is inactive so every connection must succeed",
      },
      {
        key: "C",
        label: "Default outgoing deny blocks HTTP replies only",
      },
      {
        key: "D",
        label: "SSH is blocked on port 22",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. An allowed port is not enough — a process must listen. Firewall allow ≠ service availability.",
    feedbackIncorrect:
      "Compare `sudo ufw status` (allow 80/tcp?) with `ss -tuln` (is anything on :80?).",
  },
  {
    id: "default-policies",
    title: "Exercise 6 — Inbound Versus Outbound Defaults",
    scenarioId: "default-policies",
    task: "Inspect verbose status and identify how unmatched inbound traffic differs from unmatched outbound traffic.",
    hint: "`sudo ufw status verbose` shows Default: deny (incoming), allow (outgoing) in this lab.",
    relevantCommands: ["sudo ufw status verbose", "sudo ufw status"],
    options: [
      {
        key: "A",
        label:
          "Unmatched inbound is denied; unmatched outbound is allowed by default here",
      },
      {
        key: "B",
        label: "Inbound and outbound defaults are always identical",
      },
      {
        key: "C",
        label: "Default policies only apply when the firewall is disabled",
      },
      {
        key: "D",
        label: "Verbose status never shows default policies",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Defaults apply when no explicit rule matches — and inbound vs outbound policies are independent.",
    feedbackIncorrect:
      "Run `sudo ufw status verbose` and read the Default: line carefully.",
  },
  {
    id: "udp-vs-tcp",
    title: "Exercise 7 — UDP Versus TCP Rules",
    scenarioId: "udp-vs-tcp",
    task: "Port 53 has a TCP allow rule. Test both 53/tcp and 53/udp and explain the difference.",
    hint: "Firewall rules are protocol-specific. Allowing 53/tcp does not automatically allow 53/udp.",
    relevantCommands: [
      "sudo ufw status",
      "check-connect 53/tcp",
      "check-connect 53/udp",
      "ss -tuln",
    ],
    options: [
      {
        key: "A",
        label:
          "53/tcp is allowed by an explicit rule; 53/udp falls to default deny",
      },
      {
        key: "B",
        label: "Allowing any TCP port always allows the same UDP port",
      },
      {
        key: "C",
        label: "UDP never needs firewall rules",
      },
      {
        key: "D",
        label: "ss -tuln replaces firewall configuration",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. TCP and UDP are separate. An allow for 53/tcp does not cover 53/udp under a deny-incoming default.",
    feedbackIncorrect:
      "Compare `check-connect 53/tcp` with `check-connect 53/udp` and the listed UFW rules.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "sudo ufw status", label: "ufw status" },
  { command: "sudo ufw status verbose", label: "ufw status verbose" },
  { command: "sudo ufw allow 80/tcp", label: "allow 80/tcp" },
  { command: "sudo ufw allow 22/tcp", label: "allow 22/tcp" },
  { command: "ss -tuln", label: "ss -tuln" },
  { command: "check-connect 80/tcp", label: "check 80/tcp" },
  { command: "check-connect 22/tcp", label: "check 22/tcp" },
  { command: "check-connect 53/udp", label: "check 53/udp" },
  { command: "help", label: "help" },
] as const;

export function FirewallBasicsPractice() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [ranRelevant, setRanRelevant] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [stateReady, setStateReady] = useState(true);
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const firewallRef = useRef<SimulatedFirewallState | null>(null);

  const exercise = EXERCISES[exerciseIndex]!;
  const scenario = getFirewallScenario(exercise.scenarioId);
  const allDone = EXERCISES.every((item) => completed.has(item.id));
  const isCorrect = selected === exercise.correct;

  function syncStateReady(state: SimulatedFirewallState) {
    if (!exercise.requireState) {
      setStateReady(true);
      return;
    }
    setStateReady(exercise.requireState(state));
  }

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setRanRelevant(false);
    firewallRef.current = null;
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
    firewallRef.current = null;
    setStateReady(!next.requireState);
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Firewall Basics
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Inspect UFW state,
          open the right ports, keep SSH available, and separate firewall blocks
          from missing listeners — entirely in the simulator.
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
            <strong className="text-foreground">Symptom:</strong>{" "}
            {scenario.symptom}
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

        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
          <p className="text-foreground text-sm font-medium">
            Firewall checklist
          </p>
          <pre className="bg-muted overflow-x-auto rounded px-2 py-1.5 font-mono text-xs sm:text-sm">
            1. Confirm destination IP and port{"\n"}
            2. Check whether the service is listening (`ss -tuln`){"\n"}
            3. Inspect firewall status and rules (`sudo ufw status`){"\n"}
            4. Verify inbound and outbound defaults (`status verbose`){"\n"}
            5. Consider routing and other network controls{"\n"}
            6. Make the smallest appropriate change{"\n"}
            7. Re-test connectivity and verify SSH still works
          </pre>
        </div>

        <Callout title="Remote safety tip">
          <p>
            On a real remote server, enabling a firewall or removing SSH allow
            rules can lock you out. This lab warns you educationally — practice
            here is safe and simulated.
          </p>
        </Callout>

        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs real{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ufw
          </code>
          , never changes the host firewall, and never opens network sockets.
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
        firewallBasics={exercise.scenarioId}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Firewall commands"
        onFirewallBasicsChange={(state) => {
          firewallRef.current = state;
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
        <Button
          type="button"
          disabled={!selected}
          onClick={() => {
            if (!selected) {
              return;
            }
            setSubmitted(true);
            const stateOk =
              !exercise.requireState ||
              (firewallRef.current
                ? exercise.requireState(firewallRef.current)
                : false);
            if (selected === exercise.correct && stateOk) {
              setCompleted((prev) => new Set(prev).add(exercise.id));
            }
          }}
        >
          Check answer
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={resetExerciseInteraction}
        >
          Retry exercise
        </Button>
        {exerciseIndex < EXERCISES.length - 1 ? (
          <Button
            type="button"
            variant="outline"
            disabled={!completed.has(exercise.id)}
            onClick={() => goToExercise(exerciseIndex + 1)}
          >
            Next exercise
          </Button>
        ) : null}
      </div>

      {submitted && selected ? (
        <Callout
          title={
            isCorrect && (!exercise.requireState || stateReady)
              ? "Correct"
              : "Not quite"
          }
        >
          <p>
            {isCorrect && (!exercise.requireState || stateReady)
              ? exercise.feedbackCorrect
              : isCorrect && exercise.requireState && !stateReady
                ? (exercise.stateHint ?? exercise.feedbackIncorrect)
                : exercise.feedbackIncorrect}
          </p>
          {!ranRelevant ? (
            <p className="mt-2">
              Tip: run at least one relevant firewall or diagnostic command so
              your conclusion is based on evidence.
            </p>
          ) : null}
        </Callout>
      ) : null}

      {allDone ? (
        <Callout title="Nice work!">
          <p>
            You inspected firewall status, diagnosed blocked HTTP, allowed port
            80 safely, kept SSH available, separated firewall blocks from
            missing listeners, compared default policies, and treated TCP and
            UDP as separate rules.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
