"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  getSshScenario,
  type SshScenarioId,
} from "@/lib/simulate-ssh-remote-access";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: SshScenarioId;
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
    const target = normalizeCommand(candidate);
    if (target === "ss -tuln") {
      return isSsTuln(normalized);
    }
    if (target.startsWith("ssh ")) {
      return normalized.startsWith("ssh ");
    }
    if (target.startsWith("cat ")) {
      return normalized === target;
    }
    return normalized === target;
  });
}

const EXERCISES: readonly PracticeExercise[] = [
  {
    id: "connect-hostname",
    title: "Exercise 1 — Connect with Username and Hostname",
    scenarioId: "healthy",
    task: "Use SSH to connect to the remote host named `server` as `user`. Confirm a successful simulated login.",
    hint: "The usual form is `ssh username@hostname`. Try `ssh user@server`.",
    relevantCommands: ["ssh user@server"],
    options: [
      { key: "A", label: "ssh user@server succeeds on a healthy host" },
      { key: "B", label: "SSH always requires port 2222" },
      { key: "C", label: "Hostname resolution always fails for server" },
      { key: "D", label: "Private keys must be emailed to the server" },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. `ssh user@server` reaches a listening SSH service and authenticates successfully in this healthy scenario.",
    feedbackIncorrect:
      "Run `ssh user@server` in the simulator and read whether the connection completes.",
  },
  {
    id: "non-default-port",
    title: "Exercise 2 — Non-Default SSH Port",
    scenarioId: "wrong-port",
    task: "Default SSH fails. Find which port SSH actually listens on, then connect using that port.",
    hint: "Compare a default `ssh user@server` attempt with `ss -tuln`, then use `ssh -p`.",
    relevantCommands: [
      "ss -tuln",
      "ssh -p 2222 user@server",
      "ssh user@server",
    ],
    options: [
      { key: "A", label: "DNS is broken — hostnames never resolve" },
      {
        key: "B",
        label: "sshd listens on TCP 2222; connect with ssh -p 2222 user@server",
      },
      { key: "C", label: "The private key was deleted" },
      { key: "D", label: "Host-key mismatch blocks every port" },
    ],
    correct: "B",
    feedbackCorrect:
      "Correct. Connection refused on port 22 plus a listener on 2222 means you must specify `-p 2222`.",
    feedbackIncorrect:
      "Check `ss -tuln` for the listening SSH port, then retry with `ssh -p`.",
  },
  {
    id: "ssh-stopped",
    title: "Exercise 3 — SSH Service Stopped",
    scenarioId: "ssh-stopped",
    task: "Remote login is refused. Diagnose whether the SSH service itself is the problem.",
    hint: "Connection refused often means nothing is accepting the TCP connection. Check `systemctl status ssh` and `ss -tuln`.",
    relevantCommands: ["systemctl status ssh", "ss -tuln", "ssh user@server"],
    options: [
      { key: "A", label: "Authentication failed with a wrong password" },
      { key: "B", label: "The hostname does not resolve" },
      {
        key: "C",
        label: "The SSH service is stopped and nothing listens on port 22",
      },
      { key: "D", label: "known_hosts is empty" },
    ],
    correct: "C",
    feedbackCorrect:
      "Correct. `systemctl status ssh` shows inactive, and `ss -tuln` has no SSH listener — this is a service/network-accept problem, not auth.",
    feedbackIncorrect:
      "Look at service status and listening sockets before assuming credentials are wrong.",
  },
  {
    id: "auth-vs-network",
    title: "Exercise 4 — Auth Failure Versus Connection Failure",
    scenarioId: "auth-failure",
    task: "Distinguish an authentication failure from a refused or timed-out connection.",
    hint: "If SSH prints `Permission denied` after reaching the host, the TCP path worked — authentication did not.",
    relevantCommands: ["ssh user@server", "ssh -v user@server", "ss -tuln"],
    options: [
      {
        key: "A",
        label:
          "Permission denied means authentication failed after reaching SSH",
      },
      {
        key: "B",
        label: "Permission denied means the interface is down",
      },
      { key: "C", label: "Permission denied means port 22 is closed" },
      { key: "D", label: "Permission denied means DNS failed" },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Connection refused / timeouts are network or service issues; `Permission denied` means SSH answered and rejected authentication.",
    feedbackIncorrect:
      "Compare `Connection refused` with `Permission denied` — only one means you reached the SSH daemon.",
  },
  {
    id: "key-not-authorized",
    title: "Exercise 5 — Public Key Must Be Authorized",
    scenarioId: "key-not-authorized",
    task: "A local key exists, but key login still fails. Find what is missing on the remote account.",
    hint: "Compare `cat ~/.ssh/authorized_keys` with a failed `ssh` attempt. Installing the key with `ssh-copy-id` is the usual fix.",
    relevantCommands: [
      "ssh user@server",
      "cat ~/.ssh/authorized_keys",
      "ssh-copy-id user@server",
    ],
    options: [
      { key: "A", label: "The SSH port must always be 2222" },
      {
        key: "B",
        label:
          "The public key is not listed in the remote account's authorized_keys",
      },
      { key: "C", label: "known_hosts stores private keys" },
      { key: "D", label: "systemctl status ssh is always inactive" },
    ],
    correct: "B",
    feedbackCorrect:
      "Correct. Having a local private key is not enough — the matching public key must appear in the remote `authorized_keys` file.",
    feedbackIncorrect:
      "Inspect `authorized_keys`, then use `ssh-copy-id user@server` and retry SSH.",
  },
  {
    id: "authorized-vs-known",
    title: "Exercise 6 — authorized_keys Versus known_hosts",
    scenarioId: "healthy",
    task: "Inspect both files and identify which one authorizes your login versus which one trusts the remote host.",
    hint: "`authorized_keys` is about your identity on the server. `known_hosts` is about recognizing the server’s host key.",
    relevantCommands: ["cat ~/.ssh/authorized_keys", "cat ~/.ssh/known_hosts"],
    options: [
      {
        key: "A",
        label:
          "authorized_keys authorizes client public keys; known_hosts records trusted host keys",
      },
      {
        key: "B",
        label: "Both files store the same private key",
      },
      {
        key: "C",
        label: "known_hosts is only used for password authentication",
      },
      {
        key: "D",
        label: "authorized_keys replaces /etc/passwd",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Keep the concepts separate: who may log in (authorized_keys) versus which servers you trust (known_hosts).",
    feedbackIncorrect:
      "Open both files in the simulator and compare what each line represents.",
  },
  {
    id: "host-key-mismatch",
    title: "Exercise 7 — Host-Key Mismatch Warning",
    scenarioId: "host-key-mismatch",
    task: "Attempt SSH and interpret the host-key warning. Choose the safest response.",
    hint: "An unexpected host-key change can be a rebuild — or an attack. Do not blindly bypass the warning.",
    relevantCommands: ["ssh user@server", "cat ~/.ssh/known_hosts"],
    options: [
      {
        key: "A",
        label: "Ignore the warning and force the connection immediately",
      },
      {
        key: "B",
        label:
          "Stop, treat it as a serious warning, and verify the host key through a trusted channel before changing known_hosts",
      },
      {
        key: "C",
        label: "Delete all private keys and regenerate them",
      },
      {
        key: "D",
        label: "Change the SSH port to fix the fingerprint",
      },
    ],
    correct: "B",
    feedbackCorrect:
      "Correct. Host-key mismatch warnings deserve verification through a trusted channel — never teach yourself to skip them by habit.",
    feedbackIncorrect:
      "Read the WARNING output carefully. The safe path is verify first, not bypass.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "ssh user@server", label: "ssh user@server" },
  { command: "ssh -p 2222 user@server", label: "ssh -p 2222" },
  { command: "ssh -v user@server", label: "ssh -v" },
  { command: "ssh-keygen -t ed25519", label: "ssh-keygen" },
  { command: "ssh-copy-id user@server", label: "ssh-copy-id" },
  { command: "cat ~/.ssh/authorized_keys", label: "authorized_keys" },
  { command: "cat ~/.ssh/known_hosts", label: "known_hosts" },
  { command: "systemctl status ssh", label: "systemctl status ssh" },
  { command: "ss -tuln", label: "ss -tuln" },
  { command: "getent hosts server", label: "getent hosts server" },
  { command: "help", label: "help" },
] as const;

export function SshAndRemoteAccessPractice() {
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
  const scenario = getSshScenario(exercise.scenarioId);
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
          Practice: SSH and Remote Access
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Connect, diagnose,
          and interpret SSH outcomes using evidence from the simulated terminal
          — without making real network connections.
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
            1. Resolve the hostname (`getent hosts`){"\n"}
            2. Check SSH service (`systemctl status ssh`){"\n"}
            3. Check listening port (`ss -tuln`){"\n"}
            4. Try SSH / SSH -v{"\n"}
            5. Separate Connection refused from Permission denied{"\n"}
            6. Treat host-key warnings as serious — verify first
          </pre>
        </div>

        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs real{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ssh
          </code>
          , never opens network sockets, and never reads or writes real{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ~/.ssh
          </code>{" "}
          files.
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
        sshRemoteAccess={exercise.scenarioId}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="SSH commands"
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
              Tip: run at least one relevant diagnostic or SSH command in the
              simulator so your conclusion is based on evidence.
            </p>
          ) : null}
        </Callout>
      ) : null}

      {allDone ? (
        <Callout title="Nice work!">
          <p>
            You practiced connecting with SSH, non-default ports, service
            failures, authentication vs connection errors, key authorization,
            known_hosts trust, and safe handling of host-key warnings.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
