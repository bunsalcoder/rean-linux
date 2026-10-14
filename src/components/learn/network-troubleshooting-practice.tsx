"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  getNetworkTroubleshootScenario,
  type NetworkTroubleshootScenarioId,
} from "@/lib/simulate-network-troubleshooting";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: NetworkTroubleshootScenarioId;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
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
    if (candidate === "ss -tuln") {
      return isSsTuln(normalized);
    }
    if (candidate === "ip addr") {
      return normalized === "ip addr" || normalized === "ip address";
    }
    return normalized === normalizeCommand(candidate);
  });
}

const EXERCISES: readonly PracticeExercise[] = [
  {
    id: "interface-down",
    title: "Exercise 1 — Interface Cannot Communicate",
    scenarioId: "interface-down",
    task: "Users say this host cannot reach anything on the LAN. Investigate with diagnostic commands, then identify the root cause.",
    hint: "Start with interface state (`ip link`) before assuming DNS or routes are wrong.",
    relevantCommands: ["ip link"],
    options: [
      { key: "A", label: "DNS resolution is failing" },
      { key: "B", label: "eth0 is down (no UP / LOWER_UP)" },
      { key: "C", label: "Nothing is listening on port 80" },
      { key: "D", label: "Network configuration is healthy" },
    ],
    correct: "B",
    feedbackCorrect:
      "Correct. `ip link` shows eth0 without UP/LOWER_UP, so Layer-2/link state must be fixed before IP or DNS checks matter.",
    feedbackIncorrect:
      "Not quite. Check `ip link` — if eth0 is not UP, later symptoms are secondary.",
  },
  {
    id: "no-ipv4",
    title: "Exercise 2 — Missing IP Address",
    scenarioId: "no-ipv4",
    task: "The interface looks present, but the host still cannot communicate by IP. Find what is missing.",
    hint: "An interface can be UP and still have no IPv4 address. Compare `ip link` with `ip addr`.",
    relevantCommands: ["ip link", "ip addr", "ip address"],
    options: [
      { key: "A", label: "eth0 has no IPv4 address assigned" },
      { key: "B", label: "eth0 is down" },
      { key: "C", label: "DNS resolution is failing" },
      { key: "D", label: "SSH is not listening" },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. `ip addr` shows eth0 without an `inet` address, so local and remote IP communication cannot work.",
    feedbackIncorrect:
      "Re-check `ip addr`. UP on the link does not guarantee an IPv4 address is configured.",
  },
  {
    id: "missing-route",
    title: "Exercise 3 — Missing Default Route",
    scenarioId: "missing-route",
    task: "Local checks may look partly fine, but remote networks fail. Identify the routing problem.",
    hint: "Compare `ping 192.168.1.1` with `ping 8.8.8.8`, then inspect `ip route`.",
    relevantCommands: ["ip route", "ping 192.168.1.1", "ping 8.8.8.8"],
    options: [
      { key: "A", label: "eth0 is down" },
      { key: "B", label: "DNS resolution is failing" },
      { key: "C", label: "The default route is missing" },
      { key: "D", label: "Nothing is listening on port 22" },
    ],
    correct: "C",
    feedbackCorrect:
      "Correct. Gateway/local reachability can succeed while a missing default route blocks external destinations like 8.8.8.8.",
    feedbackIncorrect:
      "Look at `ip route` and compare local gateway ping with an external IP ping.",
  },
  {
    id: "dns-failure",
    title: "Exercise 4 — DNS Versus Connectivity",
    scenarioId: "dns-failure",
    task: "Name-based access fails, but some IP checks succeed. Separate DNS failure from general connectivity failure.",
    hint: "Ping an IP address first, then run `getent hosts example.com`.",
    relevantCommands: [
      "ping 8.8.8.8",
      "ping 192.168.1.1",
      "getent hosts example.com",
    ],
    options: [
      { key: "A", label: "The default route is missing" },
      { key: "B", label: "eth0 has no IPv4 address" },
      { key: "C", label: "DNS resolution is failing" },
      { key: "D", label: "Network configuration is healthy" },
    ],
    correct: "C",
    feedbackCorrect:
      "Correct. Successful IP pings prove basic connectivity; failed `getent hosts` shows DNS is the broken piece.",
    feedbackIncorrect:
      "If an IP ping works but hostname lookup fails, the problem is DNS — not the whole network path.",
  },
  {
    id: "service-not-listening",
    title: "Exercise 5 — Service Not Listening",
    scenarioId: "service-not-listening",
    task: "The host is reachable, but the expected web service does not answer. Find what is missing on the host.",
    hint: "Host reachability is not the same as a listening service. Check `ss -tuln` for port 80.",
    relevantCommands: ["ss -tuln", "ping 127.0.0.1", "ip addr"],
    options: [
      { key: "A", label: "DNS resolution is failing" },
      { key: "B", label: "The default route is missing" },
      { key: "C", label: "Nothing is listening on the expected TCP port (80)" },
      { key: "D", label: "eth0 is down" },
    ],
    correct: "C",
    feedbackCorrect:
      "Correct. Connectivity can look healthy while `ss -tuln` shows no listener on 0.0.0.0:80.",
    feedbackIncorrect:
      "Use `ss -tuln` and look specifically for the expected service port.",
  },
  {
    id: "healthy",
    title: "Exercise 6 — Healthy Network",
    scenarioId: "healthy",
    task: "Confirm whether anything is actually wrong. Diagnose carefully and avoid changing a healthy configuration.",
    hint: "Walk the full checklist: link → address → route → ping → DNS → listening ports.",
    relevantCommands: [
      "ip link",
      "ip addr",
      "ip route",
      "ping 8.8.8.8",
      "getent hosts example.com",
      "ss -tuln",
    ],
    options: [
      { key: "A", label: "eth0 is down — bring it up" },
      { key: "B", label: "DNS is broken — replace the resolver" },
      { key: "C", label: "The default route is missing — add one" },
      {
        key: "D",
        label: "Network configuration is healthy — do not change it",
      },
    ],
    correct: "D",
    feedbackCorrect:
      "Correct. Evidence across link, address, route, connectivity, DNS, and ports looks healthy. Changing config would risk a working system.",
    feedbackIncorrect:
      "Compare the full checklist before changing anything. A healthy network should not be “fixed.”",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "ip link", label: "ip link" },
  { command: "ip addr", label: "ip addr" },
  { command: "ip route", label: "ip route" },
  { command: "ping 127.0.0.1", label: "ping loopback" },
  { command: "ping 192.168.1.1", label: "ping gateway" },
  { command: "ping 8.8.8.8", label: "ping external" },
  { command: "getent hosts example.com", label: "getent hosts" },
  { command: "ss -tuln", label: "ss -tuln" },
  { command: "help", label: "help" },
] as const;

export function NetworkTroubleshootingPractice() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [ranRelevant, setRanRelevant] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const exercise = EXERCISES[exerciseIndex]!;
  const scenario = getNetworkTroubleshootScenario(exercise.scenarioId);
  const allDone = EXERCISES.every((item) => completed.has(item.id));
  const isCorrect = selected === exercise.correct;

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setRanRelevant(false);
  }

  function resetExerciseInteraction() {
    setSelected(null);
    setSubmitted(false);
    setShowHint(false);
    resetTerminal();
  }

  function goToExercise(nextIndex: number) {
    setExerciseIndex(nextIndex);
    setSelected(null);
    setSubmitted(false);
    setShowHint(false);
    setRanRelevant(false);
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Network Troubleshooting
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Diagnose each
          simulated scenario with the checklist — then identify the root cause
          without guessing from the symptom alone.
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
            Troubleshooting tip
          </p>
          <pre className="bg-muted overflow-x-auto rounded px-2 py-1.5 font-mono text-xs sm:text-sm">
            1. ip link → interface{"\n"}
            2. ip addr → address{"\n"}
            3. ip route → route{"\n"}
            4. ping → connectivity{"\n"}
            5. getent hosts → DNS{"\n"}
            6. ss -tuln → listening ports{"\n"}
            7. compare evidence before changing config
          </pre>
        </div>

        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs real{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ip
          </code>
          ,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ping
          </code>
          , or{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ss
          </code>
          , and never inspects host interfaces or performs DNS lookups.
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
        networkTroubleshooting={exercise.scenarioId}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Diagnostic commands"
        onCommandRun={(command) => {
          if (commandMatchesHint(command, exercise.relevantCommands)) {
            setRanRelevant(true);
          }
        }}
      />

      <div className="space-y-3">
        <p className="text-foreground font-medium">What is the root cause?</p>
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
                      "border-green-600/40 bg-green-500/10",
                    showResult &&
                      !isCorrect &&
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
            if (selected === exercise.correct) {
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
        <Callout title={isCorrect ? "Correct" : "Not quite"}>
          <p>
            {isCorrect ? exercise.feedbackCorrect : exercise.feedbackIncorrect}
          </p>
          {!ranRelevant ? (
            <p className="mt-2">
              Tip: run at least one relevant diagnostic command in the simulator
              so your conclusion is based on evidence.
            </p>
          ) : null}
        </Callout>
      ) : null}

      {allDone ? (
        <Callout title="Nice work!">
          <p>
            You diagnosed interface, address, route, DNS, listening-port, and
            healthy-network cases using a systematic checklist — without
            changing a healthy configuration.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
