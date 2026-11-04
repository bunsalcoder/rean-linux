"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  contractorRemovedFromSudo,
  getSecurityAuditingScenario,
  postgresNotPubliclyExposed,
  sshHardened,
  type SecurityAuditingScenarioId,
  type SimulatedSecurityAuditingState,
} from "@/lib/simulate-security-auditing";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: SecurityAuditingScenarioId;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  requireState?: (state: SimulatedSecurityAuditingState) => boolean;
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
    id: "find-sudo-users",
    title: "Exercise 1 — Identify sudo group members",
    scenarioId: "explore",
    task: "Run `getent group sudo` and `id contractor` to identify all users with administrative privileges.",
    hint: "getent group sudo lists all members. id shows a user's group memberships.",
    relevantCommands: ["getent group sudo", "id contractor", "id bunsal"],
    options: [
      {
        key: "A",
        label:
          "The sudo group should be audited to ensure only authorized users have administrative access",
      },
      {
        key: "B",
        label: "All users should be in the sudo group for convenience",
      },
      {
        key: "C",
        label: "The sudo group is only for service accounts",
      },
      {
        key: "D",
        label: "Group membership has no security implications",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. The contractor account has sudo access — a finding worth documenting and remediating.",
    feedbackIncorrect:
      "Review who is in the sudo group. Unauthorized members represent a privilege escalation risk.",
  },
  {
    id: "check-file-perms",
    title: "Exercise 2 — Audit sensitive file permissions",
    scenarioId: "explore",
    task: "Use `ls -l /srv/app/secrets.env` and `getfacl /srv/app/secrets.env` to check whether secrets are properly protected.",
    hint: "Look at the permission mode and ACL entries — is the file readable by others?",
    relevantCommands: [
      "ls -l /srv/app/secrets.env",
      "getfacl /srv/app/secrets.env",
    ],
    options: [
      {
        key: "A",
        label:
          "Secrets files should use restrictive permissions (e.g., 0600) with no extra ACL entries granting read access",
      },
      {
        key: "B",
        label:
          "World-readable permissions on secrets files are acceptable in production",
      },
      {
        key: "C",
        label: "ACLs override all permission checks entirely",
      },
      {
        key: "D",
        label: "Only the file extension determines who can read a file",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. The file is world-readable (0644) — a critical finding requiring immediate remediation.",
    feedbackIncorrect:
      "Examine the ls -l output and ACL. World-readable secrets expose credentials to all local users.",
  },
  {
    id: "remediate-sudo",
    title: "Exercise 3 — Remove contractor from sudo",
    scenarioId: "account-admin-group",
    task: "Remove the contractor from the sudo group using `sudo gpasswd -d contractor sudo`, then verify with `getent group sudo`.",
    hint: "gpasswd -d removes a user from a group.",
    relevantCommands: [
      "getent group sudo",
      "sudo gpasswd -d contractor sudo",
      "id contractor",
    ],
    options: [
      {
        key: "A",
        label:
          "Unauthorized users should be removed from privileged groups promptly and verified",
      },
      {
        key: "B",
        label: "Removing a user from sudo has no effect on their privileges",
      },
      {
        key: "C",
        label: "Only root can be a member of the sudo group",
      },
      {
        key: "D",
        label: "Groups are cosmetic labels with no security function",
      },
    ],
    correct: "A",
    requireState: (state) => contractorRemovedFromSudo(state),
    stateHint:
      "Run sudo gpasswd -d contractor sudo to remove the unauthorized membership.",
    feedbackCorrect:
      "Correct. Privilege review and remediation are core auditing outputs.",
    feedbackIncorrect:
      "Complete the remediation in the terminal, then re-check your answer.",
  },
  {
    id: "ssh-audit",
    title: "Exercise 4 — Audit SSH configuration",
    scenarioId: "ssh-misconfig",
    task: "Use `sshd -T` to check effective SSH settings. Disable password auth and root login, then verify.",
    hint: "set-ssh PasswordAuthentication no and set-ssh PermitRootLogin no.",
    relevantCommands: [
      "sshd -T",
      "set-ssh PasswordAuthentication no",
      "set-ssh PermitRootLogin no",
    ],
    options: [
      {
        key: "A",
        label:
          "SSH should use key-based auth with root login disabled to reduce brute-force attack surface",
      },
      {
        key: "B",
        label: "Password authentication is always more secure than keys",
      },
      {
        key: "C",
        label: "Root login should always be enabled for emergencies",
      },
      {
        key: "D",
        label: "sshd -T output is not relevant to security auditing",
      },
    ],
    correct: "A",
    requireState: (state) => sshHardened(state),
    stateHint:
      "Disable both password auth and root login via set-ssh commands.",
    feedbackCorrect:
      "Correct. Key-based auth plus disabled root login significantly reduces SSH attack surface.",
    feedbackIncorrect:
      "Apply the SSH hardening settings in the terminal first.",
  },
  {
    id: "network-exposure",
    title: "Exercise 5 — Identify network exposure",
    scenarioId: "network-exposure",
    task: "Use `ss -tuln` and `ufw status` to find publicly exposed services. Remediate PostgreSQL exposure.",
    hint: "bind-postgres localhost restricts the listener; ufw deny 5432/tcp blocks inbound.",
    relevantCommands: [
      "ss -tuln",
      "ufw status",
      "bind-postgres localhost",
      "ufw deny 5432/tcp",
    ],
    options: [
      {
        key: "A",
        label:
          "Services should bind to localhost unless public access is required, and firewall rules should deny unnecessary ports",
      },
      {
        key: "B",
        label:
          "All services should listen on 0.0.0.0 for maximum compatibility",
      },
      {
        key: "C",
        label: "Firewalls are unnecessary if applications have passwords",
      },
      {
        key: "D",
        label: "Network exposure does not matter for database services",
      },
    ],
    correct: "A",
    requireState: (state) => postgresNotPubliclyExposed(state),
    stateHint:
      "Bind PostgreSQL to localhost and deny 5432/tcp in the firewall.",
    feedbackCorrect:
      "Correct. Defense in depth means both bind address and firewall should restrict access.",
    feedbackIncorrect:
      "Restrict PostgreSQL to localhost and update the firewall rule.",
  },
  {
    id: "log-investigation",
    title: "Exercise 6 — Investigate auth logs",
    scenarioId: "auth-activity",
    task: "Review `journalctl -u ssh` and identify the suspicious pattern: repeated failed passwords for contractor from 203.0.113.50 followed by a successful login.",
    hint: "Look for Failed password entries followed by an Accepted password from the same IP.",
    relevantCommands: ["journalctl -u ssh", "journalctl -u ssh -n 20"],
    options: [
      {
        key: "A",
        label:
          "Multiple failed passwords followed by success from the same IP may indicate brute-force compromise — this warrants investigation, not automatic proof of malice",
      },
      {
        key: "B",
        label:
          "A successful login after failures always proves the account was compromised",
      },
      {
        key: "C",
        label: "Failed password attempts are always benign typos",
      },
      {
        key: "D",
        label: "Auth logs are not useful for security auditing",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Log evidence supports investigation but does not automatically prove compromise. Document and escalate.",
    feedbackIncorrect:
      "Review the log pattern carefully — investigation is warranted but conclusions need more evidence.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "getent group sudo", label: "getent group sudo" },
  { command: "id contractor", label: "id contractor" },
  { command: "sshd -T", label: "sshd -T" },
  { command: "ss -tuln", label: "ss -tuln" },
  { command: "journalctl -u ssh", label: "journalctl -u ssh" },
  { command: "help", label: "help" },
] as const;

export function SecurityAuditingPractice() {
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
  const auditRef = useRef<SimulatedSecurityAuditingState | null>(null);

  const exercise = EXERCISES[exerciseIndex]!;
  const scenario = getSecurityAuditingScenario(exercise.scenarioId);
  const allDone = EXERCISES.every((item) => completed.has(item.id));
  const isCorrect = selected === exercise.correct;

  function syncStateReady(state: SimulatedSecurityAuditingState) {
    if (!exercise.requireState) {
      setStateReady(true);
      return;
    }
    setStateReady(exercise.requireState(state));
  }

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setRanRelevant(false);
    auditRef.current = null;
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
    auditRef.current = null;
    setStateReady(!next.requireState);
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Linux Security Auditing
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Audit user
          accounts, file permissions, sudo policies, SSH configuration, network
          exposure, and authentication logs on a fictional host.
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
          This terminal is simulated — it never runs real commands or inspects
          your actual system.
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
        securityAuditing={exercise.scenarioId}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Security auditing commands"
        onSecurityAuditingChange={(state) => {
          auditRef.current = state;
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
              Tip: run at least one suggested audit command so your conclusion
              is based on evidence.
            </p>
          ) : null}
        </Callout>
      ) : null}

      {allDone ? (
        <Callout title="Practice complete">
          <p>
            You finished all six exercises. Continue to the interactive lab or
            the final knowledge check when ready.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
