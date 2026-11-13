"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  evaluatePamStack,
  hasHealthyPasswordPolicy,
  isAccountExpired,
  isAccountLockedOut,
  pamConfigIsValid,
  type AuthPamScenarioId,
  type SimulatedAuthPamState,
} from "@/lib/simulate-security-authentication-pam";
import { cn } from "@/lib/utils";

type LabScenarioId = "A" | "B" | "C" | "D" | "E" | "F";

type LabScenario = {
  id: LabScenarioId;
  title: string;
  simulatorScenario: AuthPamScenarioId;
  requirement: string;
  inspectHint: string;
  hint: string;
  successExplain: string;
  securityNote: string;
  relevantCommands: readonly string[];
  verify: (state: SimulatedAuthPamState) => boolean;
  verifyHint: string;
};

const LAB_SCENARIOS: readonly LabScenario[] = [
  {
    id: "A",
    title: "Account expiration",
    simulatorScenario: "account-expired",
    requirement:
      "The fictional analyst account has expired. Inspect the account policy, identify the issue, clear expiration with the lab helper, and confirm pam-eval allows access again.",
    inspectHint: "Start with `chage -l analyst` and `pam-eval sshd analyst`.",
    hint: "Run `pam-extend analyst`, then confirm with `chage -l analyst` and `pam-eval sshd analyst`.",
    successExplain:
      "Account expiration is enforced in the account stage. Clearing the fictional expiration restores access without changing credentials.",
    securityNote:
      "On real hosts, renew or extend accounts according to policy — and document why the account needed more time.",
    relevantCommands: [
      "chage -l analyst",
      "pam-eval sshd analyst",
      "pam-extend analyst",
      "passwd -S analyst",
    ],
    verify: (state) =>
      !isAccountExpired(state, "analyst") &&
      evaluatePamStack(state, "sshd", "analyst").overall === "success",
    verifyHint:
      "Clear expiration with pam-extend analyst, then re-evaluate with pam-eval sshd analyst.",
  },
  {
    id: "B",
    title: "Repeated failed authentication",
    simulatorScenario: "locked-account",
    requirement:
      "deploy has exceeded the failed-login threshold. Inspect lockout state, unlock after understanding the issue, and verify authentication evaluation succeeds.",
    inspectHint:
      "Inspect with `faillock --user deploy` and `journalctl -u ssh`.",
    hint: "Run `pam-unlock deploy`, then `faillock --user deploy` and `pam-eval sshd deploy`.",
    successExplain:
      "Lockout stops further guesses after repeated failures. Unlocking clears the fictional counter so a legitimate operator can proceed — after investigation.",
    securityNote:
      "Unlocking without investigating may hide credential stuffing or a compromised password.",
    relevantCommands: [
      "faillock --user deploy",
      "journalctl -u ssh",
      "pam-unlock deploy",
      "pam-eval sshd deploy",
    ],
    verify: (state) =>
      !isAccountLockedOut(state, "deploy") &&
      evaluatePamStack(state, "sshd", "deploy").overall === "success",
    verifyHint:
      "Unlock with pam-unlock deploy and confirm faillock shows locked_out=no.",
  },
  {
    id: "C",
    title: "PAM configuration failure",
    simulatorScenario: "invalid-pam",
    requirement:
      "SSH PAM contains an invalid module entry. Inspect the configuration, use simulated validation feedback, repair it, and confirm evaluation succeeds.",
    inspectHint:
      "Run `cat /etc/pam.d/sshd` and `pam-eval sshd bunsal` — note the unknown module error.",
    hint: "After confirming the error, run `pam-fix-config`, then `cat /etc/pam.d/sshd` and `pam-eval sshd bunsal`.",
    successExplain:
      "Unknown modules invalidate the teaching stack. After repair, fictional SSH PAM evaluation succeeds again.",
    securityNote:
      "On real hosts, a bad PAM edit can lock everyone out. Validate and keep console recovery ready.",
    relevantCommands: [
      "cat /etc/pam.d/sshd",
      "pam-eval sshd bunsal",
      "pam-fix-config",
      "systemctl status ssh",
    ],
    verify: (state) =>
      pamConfigIsValid(state) &&
      evaluatePamStack(state, "sshd", "bunsal").overall === "success",
    verifyHint:
      "Repair with pam-fix-config, then pam-eval sshd bunsal must succeed.",
  },
  {
    id: "D",
    title: "Authentication versus account authorization",
    simulatorScenario: "auth-vs-account",
    requirement:
      "analyst can complete fictional authentication but is rejected at the account stage. Inspect evidence, clear expiration, and verify both stages succeed.",
    inspectHint:
      "Compare `journalctl -u ssh` with `pam-eval sshd analyst` — note auth ok vs account denial.",
    hint: "Understand the separation first, then `pam-extend analyst` and re-run `pam-eval sshd analyst`.",
    successExplain:
      "Successful authentication does not automatically grant access. Account management can still deny expired or locked identities.",
    securityNote:
      "Troubleshooting must separate “bad password” from “account policy rejection.”",
    relevantCommands: [
      "journalctl -u ssh",
      "pam-eval sshd analyst",
      "chage -l analyst",
      "pam-extend analyst",
    ],
    verify: (state) => {
      const outcome = evaluatePamStack(state, "sshd", "analyst");
      return (
        !isAccountExpired(state, "analyst") &&
        outcome.authOk &&
        outcome.accountOk &&
        outcome.overall === "success"
      );
    },
    verifyHint:
      "Extend analyst, then pam-eval must show auth and account both ok.",
  },
  {
    id: "E",
    title: "Weak authentication policy",
    simulatorScenario: "weak-policy",
    requirement:
      "Password quality and lockout protections are missing. Identify gaps, apply a safer fictional policy, and verify with pam-auth-update --status.",
    inspectHint:
      "Run `pam-auth-update --status` and inspect `cat /etc/pam.d/common-auth` / `common-password`.",
    hint: "Run `pam-harden-policy`, then confirm quality, faillock, and history show enabled.",
    successExplain:
      "A safer policy enables password quality, failed-login lockout, and reuse prevention in the fictional stack.",
    securityNote:
      "Exact module names and defaults vary by distribution — adapt carefully and keep recovery access.",
    relevantCommands: [
      "pam-auth-update --status",
      "cat /etc/pam.d/common-auth",
      "cat /etc/pam.d/common-password",
      "pam-harden-policy",
    ],
    verify: (state) => hasHealthyPasswordPolicy(state),
    verifyHint:
      "Apply pam-harden-policy so pwquality, faillock, and history are enabled.",
  },
  {
    id: "F",
    title: "Authentication log investigation",
    simulatorScenario: "auth-logs",
    requirement:
      "Review fictional logs for failed root attempts, a successful bunsal login, deploy lockout, and analyst expiration. Verification succeeds when you have inspected the log stream — findings stay present as evidence.",
    inspectHint:
      "Run `journalctl -u ssh` and optionally `faillock --user deploy` / `chage -l analyst` to correlate.",
    hint: "You are verifying understanding of the initial evidence. After reading journalctl -u ssh, click Verify — do not remediate yet.",
    successExplain:
      "Suspicious internet root failures differ from expected lockouts, expiration denials, and legitimate admin key logins. Context prevents over-reacting to every failed attempt.",
    securityNote:
      "Failed authentication is a signal to investigate — not automatic proof of compromise.",
    relevantCommands: [
      "journalctl -u ssh",
      "faillock --user deploy",
      "chage -l analyst",
      "pam-eval sshd analyst",
    ],
    verify: (state) =>
      state.logsInspected &&
      state.logs.some((entry) =>
        entry.message.includes("Failed password for root"),
      ) &&
      state.logs.some((entry) =>
        entry.message.includes("Accepted publickey for bunsal"),
      ) &&
      state.logs.some((entry) =>
        entry.message.includes("account temporarily locked"),
      ) &&
      state.logs.some((entry) =>
        entry.message.includes("account analyst has expired"),
      ),
    verifyHint:
      "Inspect journalctl -u ssh. Verification checks that investigative evidence is still present.",
  },
] as const;

const LAB_SUGGESTIONS = [
  { command: "chage -l analyst", label: "chage" },
  { command: "faillock --user deploy", label: "faillock" },
  { command: "cat /etc/pam.d/sshd", label: "pam.d/sshd" },
  { command: "pam-eval sshd bunsal", label: "pam-eval" },
  { command: "journalctl -u ssh", label: "logs" },
  { command: "help", label: "help" },
] as const;

type LabStep = "overview" | "work" | "complete";

export function SecurityAuthenticationPamAssessment() {
  const [step, setStep] = useState<LabStep>("overview");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [inspected, setInspected] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyAttempted, setVerifyAttempted] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [pamState, setPamState] = useState<SimulatedAuthPamState | null>(null);
  const [completed, setCompleted] = useState<ReadonlySet<LabScenarioId>>(
    () => new Set(),
  );

  const scenario = LAB_SCENARIOS[scenarioIndex]!;
  const stateOk = pamState ? scenario.verify(pamState) : false;

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setPamState(null);
  }

  function startScenario(index: number) {
    setScenarioIndex(index);
    setShowHint(false);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setPamState(null);
    setTerminalKey((value) => value + 1);
    setStep("work");
  }

  function goNext() {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(scenario.id);
      return next;
    });
    const nextIndex = scenarioIndex + 1;
    if (nextIndex >= LAB_SCENARIOS.length) {
      setStep("complete");
      return;
    }
    startScenario(nextIndex);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Interactive Authentication Security Lab
        </h3>
        <p className="text-sm">
          Six guided scenarios on a fictional host. Inspect state, apply
          deliberate policy or PAM repairs when required, and verify simulated
          authentication behavior — not just the command string.
        </p>
        <Callout title="Learning safety">
          <p>
            Everything is simulated. The app never authenticates real users,
            never reads or modifies host PAM, and never stores passwords,
            hashes, or tokens.
          </p>
        </Callout>
      </div>

      {step === "overview" ? (
        <div className="space-y-4">
          <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
            <p className="text-foreground text-sm font-medium">
              Laboratory scenarios
            </p>
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {LAB_SCENARIOS.map((item) => (
                <li key={item.id}>
                  <span className="text-foreground font-medium">
                    Scenario {item.id} — {item.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <Button type="button" onClick={() => startScenario(0)}>
            Begin Scenario A
          </Button>
        </div>
      ) : null}

      {step === "work" ? (
        <div className="space-y-4">
          <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
            <p className="text-foreground text-sm font-medium">
              Scenario {scenario.id} of {LAB_SCENARIOS.length}: {scenario.title}
            </p>
            <p className="text-sm">
              <strong className="text-foreground">Requirement:</strong>{" "}
              {scenario.requirement}
            </p>
            <p className="text-muted-foreground text-sm">
              {scenario.inspectHint}
            </p>
            <p className="text-sm">
              Progress: {completed.size} completed
              {inspected ? " · inspection started" : ""}
              {verified ? " · verified" : ""}.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {LAB_SCENARIOS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => startScenario(index)}
                  className={cn(
                    "rounded border px-2 py-1 font-mono text-xs transition-colors",
                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                    index === scenarioIndex
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : completed.has(item.id)
                        ? "border-border text-muted-foreground line-through"
                        : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.id}
                  {completed.has(item.id) ? " ✓" : null}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowHint((value) => !value)}
            >
              {showHint ? "Hide hint" : "Show hint"}
            </Button>
            <Button type="button" variant="outline" onClick={resetTerminal}>
              Reset scenario
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!pamState}
              onClick={() => {
                setVerifyAttempted(true);
                if (pamState && scenario.verify(pamState)) {
                  setVerified(true);
                } else {
                  setVerified(false);
                }
              }}
            >
              Verify simulated state
            </Button>
            <Button type="button" disabled={!verified} onClick={goNext}>
              {scenarioIndex < LAB_SCENARIOS.length - 1
                ? "Next scenario"
                : "Finish lab"}
            </Button>
          </div>

          {showHint ? (
            <Callout title="Hint">
              <p>{scenario.hint}</p>
            </Callout>
          ) : null}

          <TerminalSimulator
            key={`${scenario.id}-${terminalKey}`}
            securityAuthenticationPam={scenario.simulatorScenario}
            suggestions={[
              ...scenario.relevantCommands.map((command) => ({
                command,
                label: command.split(" ")[0] ?? command,
              })),
              ...LAB_SUGGESTIONS,
            ]}
            suggestionsLabel="Scenario commands"
            onSecurityAuthenticationPamChange={(state) => {
              setPamState(state);
              if (scenario.verify(state)) {
                if (verifyAttempted) {
                  setVerified(true);
                }
              } else if (verifyAttempted) {
                setVerified(false);
              }
            }}
            onCommandRun={(command) => {
              const normalized = command.trim().toLowerCase();
              if (
                scenario.relevantCommands.some((candidate) => {
                  const target = candidate.toLowerCase();
                  return (
                    normalized === target || normalized.startsWith(`${target} `)
                  );
                }) ||
                normalized.startsWith("chage") ||
                normalized.startsWith("faillock") ||
                normalized.startsWith("cat /etc/pam") ||
                normalized.startsWith("pam-") ||
                normalized.startsWith("journalctl") ||
                normalized.startsWith("getent") ||
                normalized.startsWith("passwd")
              ) {
                setInspected(true);
              }
            }}
          />

          {verifyAttempted ? (
            <Callout title={verified ? "State verified" : "Not verified yet"}>
              {verified ? (
                <>
                  <p>{scenario.successExplain}</p>
                  <p className="mt-2 text-sm">
                    <strong className="text-foreground">Security note:</strong>{" "}
                    {scenario.securityNote}
                  </p>
                </>
              ) : (
                <p>
                  {scenario.verifyHint}
                  {!inspected
                    ? " Inspect the initial state with chage, faillock, cat, or journalctl first."
                    : stateOk
                      ? " State looks ready — click Verify again."
                      : ""}
                </p>
              )}
            </Callout>
          ) : null}
        </div>
      ) : null}

      {step === "complete" ? (
        <Callout title="Authentication laboratory complete">
          <p>
            You worked through expiration, lockout, invalid PAM configuration,
            auth-versus-account separation, weak policy hardening, and log
            investigation. Continue to the practice session or final knowledge
            check when ready.
          </p>
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => startScenario(0)}
            >
              Restart lab
            </Button>
          </div>
        </Callout>
      ) : null}
    </div>
  );
}
