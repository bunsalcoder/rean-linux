"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  getSecurityScenario,
  type SecurityScenarioId,
  type SimulatedSecurityState,
} from "@/lib/simulate-security-fundamentals";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: SecurityScenarioId;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  requireState?: (state: SimulatedSecurityState) => boolean;
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
    if (target.startsWith("sudo ")) {
      return normalized.startsWith(target) || normalized === target;
    }
    return normalized === target || normalized.startsWith(`${target} `);
  });
}

const EXERCISES: readonly PracticeExercise[] = [
  {
    id: "least-privilege",
    title: "Exercise 1 — Apply Least Privilege",
    scenarioId: "least-privilege",
    task: "Inspect the contractor account. Remove excessive sudo membership, then confirm the group list no longer includes sudo.",
    hint: "Compare `id contractor` before and after `sudo gpasswd -d contractor sudo`.",
    relevantCommands: [
      "id contractor",
      "groups contractor",
      "sudo gpasswd -d contractor sudo",
    ],
    options: [
      {
        key: "A",
        label:
          "contractor had sudo; removing that membership restores least privilege",
      },
      {
        key: "B",
        label: "Every account should remain in sudo for convenience",
      },
      {
        key: "C",
        label: "groups contractor proves authentication failed",
      },
      {
        key: "D",
        label: "Least privilege only applies to firewall rules",
      },
    ],
    correct: "A",
    requireState: (state) => !state.contractorInSudo,
    stateHint:
      "Remove contractor from sudo in the simulator before selecting an answer.",
    feedbackCorrect:
      "Correct. Authorization (what the account may do) should match job need — contractor no longer has sudo.",
    feedbackIncorrect:
      "Inspect `id contractor`, remove sudo membership, then re-check groups.",
  },
  {
    id: "permissive-file",
    title: "Exercise 2 — Overly Permissive File",
    scenarioId: "permissive-file",
    task: "Find the secrets file with overly broad permissions and restrict it to owner read/write only.",
    hint: "Run `ls -l /opt/app/secrets.env`. World-readable (`r--` for others) is too open for secrets.",
    relevantCommands: [
      "ls -l /opt/app/secrets.env",
      "chmod 600 /opt/app/secrets.env",
    ],
    options: [
      {
        key: "A",
        label:
          "0644/world-readable secrets are a confidentiality risk; chmod 600 hardens the file",
      },
      {
        key: "B",
        label: "World-readable secrets are fine on shared hosts",
      },
      {
        key: "C",
        label: "File modes never affect Linux security",
      },
      {
        key: "D",
        label: "Only firewall rules protect secret files",
      },
    ],
    correct: "A",
    requireState: (state) => state.secretsMode === "0600",
    stateHint: "Apply chmod 600 to the secrets file before answering.",
    feedbackCorrect:
      "Correct. Overly permissive modes leak confidential data to other local users.",
    feedbackIncorrect:
      "Use `ls -l` to spot world-readable mode, then `chmod 600` and re-list.",
  },
  {
    id: "network-exposure",
    title: "Exercise 3 — Unnecessary Network Exposure",
    scenarioId: "network-exposure",
    task: "Identify unnecessary exposure: an unused telnet listener and an open firewall allow for TCP 8080.",
    hint: "Compare `ss -tuln`, `systemctl status telnet`, and `sudo ufw status`.",
    relevantCommands: [
      "ss -tuln",
      "systemctl status telnet",
      "sudo ufw status",
    ],
    options: [
      {
        key: "A",
        label:
          "Unused telnet plus an allow for 8080/tcp expand attack surface without clear need",
      },
      {
        key: "B",
        label: "Any listening port proves the host is already compromised",
      },
      {
        key: "C",
        label: "Firewall allows never matter if a service listens",
      },
      {
        key: "D",
        label: "Only outbound traffic can create exposure",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Unnecessary services and open ports increase exposure even when no incident is confirmed.",
    feedbackIncorrect:
      "Look for telnet on port 23 and an allow rule for 8080 — exposure without necessity.",
  },
  {
    id: "pending-updates",
    title: "Exercise 4 — Prioritize Security Updates",
    scenarioId: "pending-updates",
    task: "Confirm pending security upgrades and apply them in the simulator.",
    hint: "Start with `apt list --upgradable`, then `sudo apt upgrade`.",
    relevantCommands: ["apt list --upgradable", "sudo apt upgrade"],
    options: [
      {
        key: "A",
        label:
          "Pending security package upgrades should be prioritized because they close known weaknesses",
      },
      {
        key: "B",
        label: "Updates are only cosmetic and can wait forever",
      },
      {
        key: "C",
        label: "Listing upgradable packages proves an active breach",
      },
      {
        key: "D",
        label: "Only kernel packages matter; OpenSSL can be ignored",
      },
    ],
    correct: "A",
    requireState: (state) => !state.updatesPending,
    stateHint: "Apply `sudo apt upgrade` so pending updates clear.",
    feedbackCorrect:
      "Correct. Vulnerability management means patching known issues promptly after a quick operational review.",
    feedbackIncorrect:
      "List upgradable packages, apply the simulated upgrade, then re-check.",
  },
  {
    id: "auth-vs-authz",
    title: "Exercise 5 — Authentication vs Authorization",
    scenarioId: "auth-vs-authz",
    task: "Inspect SSH password authentication and contractor sudo membership. Separate proving identity from granting power.",
    hint: "Read `cat /etc/ssh/sshd_config` for authentication, and `id contractor` for authorization.",
    relevantCommands: [
      "cat /etc/ssh/sshd_config",
      "id contractor",
      "groups contractor",
    ],
    options: [
      {
        key: "A",
        label:
          "PasswordAuthentication is authentication; sudo group membership is authorization",
      },
      {
        key: "B",
        label: "Authentication and authorization are the same control",
      },
      {
        key: "C",
        label: "sudo membership only affects file modes",
      },
      {
        key: "D",
        label: "SSH settings never relate to authentication",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Authentication answers “who are you?”; authorization answers “what may you do?”",
    feedbackIncorrect:
      "Compare sshd PasswordAuthentication (login proof) with sudo membership (privilege grant).",
  },
  {
    id: "logs-and-backups",
    title: "Exercise 6 — Logs and Verified Backups",
    scenarioId: "logs-and-backups",
    task: "Review the SSH journal warning and verify the daily backup. Do not treat failed logins alone as a confirmed compromise.",
    hint: "Use `journalctl -u ssh`, then `verify-backup /var/backups/app-daily.tar.gz`.",
    relevantCommands: [
      "journalctl -u ssh",
      "ls -l /var/backups/app-daily.tar.gz",
      "verify-backup /var/backups/app-daily.tar.gz",
    ],
    options: [
      {
        key: "A",
        label:
          "Failed attempts need review, and a backup only helps availability after verification — neither alone proves compromise",
      },
      {
        key: "B",
        label: "Three failed passwords always mean the host is owned",
      },
      {
        key: "C",
        label: "An unverified backup file size guarantees restore success",
      },
      {
        key: "D",
        label: "Logs replace the need for backups",
      },
    ],
    correct: "A",
    requireState: (state) => state.backupVerified,
    stateHint: "Run verify-backup on the daily archive before answering.",
    feedbackCorrect:
      "Correct. Monitoring and verified backups support detection and recovery without over-claiming an incident.",
    feedbackIncorrect:
      "Read the journal warning carefully, verify the backup, and avoid assuming compromise from failed attempts alone.",
  },
  {
    id: "layered-defense",
    title: "Exercise 7 — Choose Layered Defenses",
    scenarioId: "layered-defense",
    task: "This host has many weak controls at once. Pick the layered approach that reduces risk without relying on a single fix.",
    hint: "Skim `ss -tuln`, `ls -l /opt/app/secrets.env`, `apt list --upgradable`, and `sudo ufw status` — no single control covers everything.",
    relevantCommands: [
      "ss -tuln",
      "ls -l /opt/app/secrets.env",
      "apt list --upgradable",
      "sudo ufw status",
      "id contractor",
    ],
    options: [
      {
        key: "A",
        label:
          "Combine least privilege, tighter file modes, fewer open services/ports, updates, stronger auth, monitoring, and verified backups",
      },
      {
        key: "B",
        label: "Fix only the firewall and ignore users, files, and updates",
      },
      {
        key: "C",
        label: "Rely only on a single antivirus package",
      },
      {
        key: "D",
        label: "Disable logging so warnings stop appearing",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Defense in depth stacks independent controls so one failure does not equal total exposure.",
    feedbackIncorrect:
      "Look across users, files, network, updates, auth, logs, and backups — one layer is not enough.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "whoami", label: "whoami" },
  { command: "id contractor", label: "id contractor" },
  { command: "ls -l /opt/app/secrets.env", label: "ls secrets" },
  { command: "ss -tuln", label: "ss -tuln" },
  { command: "systemctl status telnet", label: "status telnet" },
  { command: "sudo ufw status", label: "ufw status" },
  { command: "apt list --upgradable", label: "upgradable" },
  { command: "journalctl -u ssh", label: "journal ssh" },
  { command: "cat /etc/ssh/sshd_config", label: "sshd_config" },
  { command: "help", label: "help" },
] as const;

export function SecurityFundamentalsPractice() {
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
  const securityRef = useRef<SimulatedSecurityState | null>(null);

  const exercise = EXERCISES[exerciseIndex]!;
  const scenario = getSecurityScenario(exercise.scenarioId);
  const allDone = EXERCISES.every((item) => completed.has(item.id));
  const isCorrect = selected === exercise.correct;

  function syncStateReady(state: SimulatedSecurityState) {
    if (!exercise.requireState) {
      setStateReady(true);
      return;
    }
    setStateReady(exercise.requireState(state));
  }

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setRanRelevant(false);
    securityRef.current = null;
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
    securityRef.current = null;
    setStateReady(!next.requireState);
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Security Fundamentals
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Apply least
          privilege, spot weak file modes and network exposure, prioritize
          updates, separate authentication from authorization, and value logs
          plus verified backups — entirely in the simulator.
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
          This terminal is simulated — it never runs real security scanners,
          never touches host accounts or firewalls, and never exploits anything.
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
        securityFundamentals={exercise.scenarioId}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Security commands"
        onSecurityFundamentalsChange={(state) => {
          securityRef.current = state;
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
                : !ranRelevant
                  ? `${exercise.feedbackIncorrect} Tip: run a relevant diagnostic command first.`
                  : exercise.feedbackIncorrect}
          </p>
        </Callout>
      ) : null}

      {allDone ? (
        <Callout title="Practice complete">
          <p>
            You covered least privilege, permissive files, network exposure,
            update priority, authentication vs authorization, logs and verified
            backups, and layered defenses.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
