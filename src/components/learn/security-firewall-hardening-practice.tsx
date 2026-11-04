"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  appPortRestrictedToInternal,
  databaseRestrictedToInternal,
  getFirewallHardeningScenario,
  hasRestrictiveInboundDefault,
  isSshReachable,
  requiredWebServicesReachable,
  udpDiscoveryAllowed,
  type FirewallHardeningScenarioId,
  type SimulatedFirewallHardeningState,
} from "@/lib/simulate-security-firewall-hardening";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: FirewallHardeningScenarioId;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  requireState?: (state: SimulatedFirewallHardeningState) => boolean;
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
    id: "inspect-exposure",
    title: "Exercise 1 — Inspect Network Exposure",
    scenarioId: "explore",
    task: "Run `ss -tuln`, `sudo ufw status verbose`, and `ip addr`. Note which services listen and which rules allow Anywhere access.",
    hint: "Start with ss -tuln, then sudo ufw status verbose and ip addr.",
    relevantCommands: [
      "ss -tuln",
      "sudo ufw status verbose",
      "ip addr",
      "ip route",
    ],
    options: [
      {
        key: "A",
        label:
          "ss shows listening sockets; ufw status shows policy; a listener is not automatically reachable from the public internet",
      },
      {
        key: "B",
        label: "Every listening port is always reachable from the internet",
      },
      {
        key: "C",
        label: "ufw status permanently patches application CVEs",
      },
      {
        key: "D",
        label: "ip addr disables all firewall rules",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Evaluate listening state and firewall policy separately before changing rules.",
    feedbackIncorrect:
      "Inspect ss and ufw status again — listening and reachability are different questions.",
  },
  {
    id: "restrictive-default",
    title: "Exercise 2 — Set a Restrictive Inbound Default",
    scenarioId: "restrictive-default",
    task: "Inbound traffic is allowed by default. Set default deny incoming, keep allow outgoing, and preserve SSH/HTTP/HTTPS reachability.",
    hint: "Run sudo ufw default deny incoming and sudo ufw default allow outgoing, then verify with sudo ufw status verbose.",
    relevantCommands: [
      "sudo ufw status verbose",
      "sudo ufw default deny incoming",
      "sudo ufw default allow outgoing",
      "check-connect 22/tcp",
    ],
    options: [
      {
        key: "A",
        label:
          "Default-deny inbound shrinks unmatched exposure while explicit allow rules keep required services reachable",
      },
      {
        key: "B",
        label: "Default-allow inbound is always safer on public hosts",
      },
      {
        key: "C",
        label: "Outgoing deny is required before any inbound change",
      },
      {
        key: "D",
        label: "Defaults never matter when no rules exist",
      },
    ],
    correct: "A",
    requireState: (state) =>
      hasRestrictiveInboundDefault(state) &&
      state.defaultOutgoing === "allow" &&
      requiredWebServicesReachable(state),
    stateHint:
      "Set default deny incoming (and allow outgoing), and keep 22/80/443 allowed.",
    feedbackCorrect:
      "Correct. Restrictive defaults plus explicit allows are the usual hardening pattern.",
    feedbackIncorrect:
      "Apply default deny incoming while preserving SSH and web allows, then re-check.",
  },
  {
    id: "protect-ssh",
    title: "Exercise 3 — Allow SSH Before Enabling",
    scenarioId: "protect-ssh",
    task: "The firewall is inactive and SSH is not explicitly allowed. Add 22/tcp, enable the firewall, and confirm SSH remains reachable.",
    hint: "Run sudo ufw allow 22/tcp, then sudo ufw enable, then check-connect 22/tcp.",
    relevantCommands: [
      "sudo ufw status verbose",
      "sudo ufw allow 22/tcp",
      "sudo ufw enable",
      "check-connect 22/tcp",
    ],
    options: [
      {
        key: "A",
        label:
          "Permit SSH before enabling a restrictive firewall so remote administration is not locked out",
      },
      {
        key: "B",
        label: "Enable first, then hope SSH still works without a rule",
      },
      {
        key: "C",
        label: "Disable SSH permanently to harden the host",
      },
      {
        key: "D",
        label: "Only allow UDP 22 for SSH",
      },
    ],
    correct: "A",
    requireState: (state) =>
      state.enabled &&
      hasRestrictiveInboundDefault(state) &&
      isSshReachable(state),
    stateHint:
      "Allow 22/tcp, enable the firewall with deny incoming still in effect, then confirm SSH.",
    feedbackCorrect:
      "Correct. On real hosts, keep a recovery session before applying the change.",
    feedbackIncorrect:
      "Add sudo ufw allow 22/tcp before sudo ufw enable, then verify reachability.",
  },
  {
    id: "database-exposure",
    title: "Exercise 4 — Restrict Database Exposure",
    scenarioId: "database-exposure",
    task: "TCP 5432 is allowed from Anywhere. Remove the public allow and permit only 192.168.1.0/24.",
    hint: "Delete the Anywhere rule, then: sudo ufw allow from 192.168.1.0/24 to any port 5432 proto tcp.",
    relevantCommands: [
      "sudo ufw status",
      "sudo ufw delete allow 5432/tcp",
      "sudo ufw allow from 192.168.1.0/24 to any port 5432 proto tcp",
      "check-connect 5432/tcp from 203.0.113.10",
      "check-connect 5432/tcp from 192.168.1.50",
    ],
    options: [
      {
        key: "A",
        label:
          "Databases should not be publicly reachable; restrict sources to the internal network that needs them",
      },
      {
        key: "B",
        label: "Public database ports are fine if the password is short",
      },
      {
        key: "C",
        label: "Allow Anywhere on 5432 improves encryption",
      },
      {
        key: "D",
        label: "Listening on 5432 automatically blocks remote clients",
      },
    ],
    correct: "A",
    requireState: (state) => databaseRestrictedToInternal(state),
    stateHint:
      "Remove Anywhere 5432/tcp and allow only from 192.168.1.0/24, then verify public blocked / LAN allowed.",
    feedbackCorrect:
      "Correct. Source-restricted rules express least privilege for data services.",
    feedbackIncorrect:
      "Replace the public 5432 allow with an internal CIDR allow, then re-test check-connect.",
  },
  {
    id: "app-port",
    title: "Exercise 5 — Limit the Application Port",
    scenarioId: "app-port",
    task: "TCP 8080 is reachable from any source. Restrict it to 192.168.1.0/24 while keeping public web ports available.",
    hint: "Delete allow 8080/tcp, then allow from 192.168.1.0/24 to any port 8080 proto tcp.",
    relevantCommands: [
      "sudo ufw status",
      "sudo ufw delete allow 8080/tcp",
      "sudo ufw allow from 192.168.1.0/24 to any port 8080 proto tcp",
      "check-connect 8080/tcp from 203.0.113.10",
      "check-connect 80/tcp",
    ],
    options: [
      {
        key: "A",
        label:
          "Internal-only application ports reduce public attack surface while HTTPS/HTTP can remain public if required",
      },
      {
        key: "B",
        label: "Every application port must be open to Anywhere",
      },
      {
        key: "C",
        label: "Restricting 8080 disables SSH automatically",
      },
      {
        key: "D",
        label: "UDP rules are enough for TCP 8080",
      },
    ],
    correct: "A",
    requireState: (state) =>
      appPortRestrictedToInternal(state) && requiredWebServicesReachable(state),
    stateHint:
      "Restrict 8080 to the internal CIDR and keep 22/80/443 publicly reachable.",
    feedbackCorrect:
      "Correct. Match each service’s intended audience with its firewall rule.",
    feedbackIncorrect:
      "Source-restrict 8080 without removing the public web allows.",
  },
  {
    id: "tcp-udp",
    title: "Exercise 6 — Fix TCP/UDP Mismatch",
    scenarioId: "tcp-udp",
    task: "UDP 5353 is listening, but the policy allows TCP 5353. Remove the wrong TCP allow and add 5353/udp.",
    hint: "sudo ufw delete allow 5353/tcp, then sudo ufw allow 5353/udp, then check-connect 5353/udp.",
    relevantCommands: [
      "ss -tuln",
      "sudo ufw status",
      "sudo ufw delete allow 5353/tcp",
      "sudo ufw allow 5353/udp",
      "check-connect 5353/udp",
      "check-connect 5353/tcp",
    ],
    options: [
      {
        key: "A",
        label:
          "TCP and UDP are separate; a TCP allow does not permit UDP traffic on the same port number",
      },
      {
        key: "B",
        label: "Allowing TCP 5353 also allows UDP 5353 automatically",
      },
      {
        key: "C",
        label: "Port numbers ignore protocol in firewall rules",
      },
      {
        key: "D",
        label: "UDP services never need firewall rules",
      },
    ],
    correct: "A",
    requireState: (state) => udpDiscoveryAllowed(state),
    stateHint:
      "Delete the TCP 5353 allow, add 5353/udp, and confirm UDP reachability.",
    feedbackCorrect:
      "Correct. Always match the protocol the service actually uses.",
    feedbackIncorrect:
      "Replace the TCP 5353 rule with an explicit UDP allow, then re-check.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "ss -tuln", label: "ss -tuln" },
  { command: "sudo ufw status verbose", label: "ufw status" },
  { command: "ip addr", label: "ip addr" },
  { command: "check-connect 22/tcp", label: "check SSH" },
  { command: "help", label: "help" },
] as const;

export function SecurityFirewallHardeningPractice() {
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
  const fwRef = useRef<SimulatedFirewallHardeningState | null>(null);

  const exercise = EXERCISES[exerciseIndex]!;
  const scenario = getFirewallHardeningScenario(exercise.scenarioId);
  const allDone = EXERCISES.every((item) => completed.has(item.id));
  const isCorrect = selected === exercise.correct;

  function syncStateReady(state: SimulatedFirewallHardeningState) {
    if (!exercise.requireState) {
      setStateReady(true);
      return;
    }
    setStateReady(exercise.requireState(state));
  }

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setRanRelevant(false);
    fwRef.current = null;
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
    fwRef.current = null;
    setStateReady(!next.requireState);
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Firewall Hardening and Network Exposure
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Inspect listeners
          and policy, apply default-deny inbound, preserve SSH, restrict
          database and application exposure, and match TCP/UDP correctly.
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
          This terminal is simulated — it never runs real firewall commands,
          never scans networks, and never opens real sockets.
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
        securityFirewallHardening={exercise.scenarioId}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Firewall hardening commands"
        onSecurityFirewallHardeningChange={(state) => {
          fwRef.current = state;
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
              Tip: run at least one suggested inspection or remediation command
              so your conclusion is based on evidence.
            </p>
          ) : null}
        </Callout>
      ) : null}

      {allDone ? (
        <Callout title="Practice complete">
          <p>
            You finished all six exercises. Continue to the interactive firewall
            hardening lab or the final knowledge check when ready.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
