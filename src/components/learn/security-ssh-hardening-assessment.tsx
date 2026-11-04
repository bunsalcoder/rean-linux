"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  evaluateSshAccess,
  hasAllowUsersPolicy,
  hasRestrictiveMaxAuthTries,
  isPasswordAuthEnabled,
  isRootLoginAllowed,
  sshdConfigValid,
  type SimulatedSshHardeningState,
  type SshHardeningScenarioId,
} from "@/lib/simulate-security-ssh-hardening";
import { cn } from "@/lib/utils";

type LabScenarioId = "A" | "B" | "C" | "D" | "E" | "F";

type LabScenario = {
  id: LabScenarioId;
  title: string;
  simulatorScenario: SshHardeningScenarioId;
  requirement: string;
  inspectHint: string;
  hint: string;
  successExplain: string;
  securityNote: string;
  relevantCommands: readonly string[];
  verify: (state: SimulatedSshHardeningState) => boolean;
  verifyHint: string;
};

const LAB_SCENARIOS: readonly LabScenario[] = [
  {
    id: "A",
    title: "Root login exposure",
    simulatorScenario: "root-login",
    requirement:
      "The fictional server allows direct root SSH login. Inspect the configuration, identify the risk, and set a safer PermitRootLogin value.",
    inspectHint:
      "Start with `grep PermitRootLogin /etc/ssh/sshd_config`, `sshd -T`, and `ssh root@host`.",
    hint: "Run `ssh-set PermitRootLogin no`, then confirm with `sshd -T` or `ssh root@host`.",
    successExplain:
      "Disabling direct root login removes a high-value shared target. Operators should use individual accounts and elevate when needed.",
    securityNote:
      "On production hosts, keep a recovery session open and confirm an admin account can still connect before applying the change.",
    relevantCommands: [
      "grep PermitRootLogin /etc/ssh/sshd_config",
      "sshd -T",
      "ssh root@host",
      "ssh-set PermitRootLogin no",
    ],
    verify: (state) => !isRootLoginAllowed(state),
    verifyHint:
      "PermitRootLogin must no longer be yes. Use ssh-set PermitRootLogin no.",
  },
  {
    id: "B",
    title: "Password authentication",
    simulatorScenario: "password-auth",
    requirement:
      "Password authentication is permitted for users. Assess the policy, verify a fictional public-key path, then disable PasswordAuthentication.",
    inspectHint:
      "Inspect with `sshd -T` and `grep PasswordAuthentication /etc/ssh/sshd_config`.",
    hint: "Run `ssh-verify-keys bunsal`, then `ssh-set PasswordAuthentication no`. Re-check with `sshd -T`.",
    successExplain:
      "Public-key authentication is preferred once verified. PasswordAuthentication is off in the simulated policy.",
    securityNote:
      "Never disable passwords on a real server until key-based login (and recovery access) is confirmed working.",
    relevantCommands: [
      "sshd -T",
      "grep PasswordAuthentication /etc/ssh/sshd_config",
      "ssh-verify-keys bunsal",
      "ssh-set PasswordAuthentication no",
    ],
    verify: (state) =>
      !isPasswordAuthEnabled(state) && state.pubkeyVerified === true,
    verifyHint:
      "Verify keys with ssh-verify-keys bunsal, then disable PasswordAuthentication.",
  },
  {
    id: "C",
    title: "Excessive authentication attempts",
    simulatorScenario: "excess-auth-tries",
    requirement:
      "MaxAuthTries is unnecessarily high. Choose a reasonable restrictive value (≤ 4) and explain its purpose by verifying the simulated state.",
    inspectHint:
      "Check `grep MaxAuthTries /etc/ssh/sshd_config` and `sshd -T`.",
    hint: "Run `ssh-set MaxAuthTries 3` (or 4), then confirm with `sshd -T`.",
    successExplain:
      "A lower MaxAuthTries limits how many authentication attempts a connection may try before SSH disconnects.",
    securityNote:
      "Attempt limits complement strong credentials and network controls — they do not replace them.",
    relevantCommands: [
      "grep MaxAuthTries /etc/ssh/sshd_config",
      "sshd -T",
      "ssh-set MaxAuthTries 3",
    ],
    verify: (state) => hasRestrictiveMaxAuthTries(state),
    verifyHint: "Set MaxAuthTries to 4 or fewer with ssh-set MaxAuthTries 3.",
  },
  {
    id: "D",
    title: "Unrestricted user access",
    simulatorScenario: "unrestricted-users",
    requirement:
      "Any local user may attempt SSH. Configure AllowUsers for bunsal and deploy, then verify analyst is denied while bunsal can connect.",
    inspectHint:
      "Try `ssh analyst@host` and `ssh bunsal@host`, and inspect `sshd -T` for allowusers.",
    hint: "Run `ssh-set AllowUsers bunsal deploy`, then retest `ssh analyst@host` and `ssh bunsal@host`.",
    successExplain:
      "AllowUsers restricts authentication to the accounts that need remote access. analyst is rejected; bunsal remains allowed.",
    securityNote:
      "Allowlists shrink blast radius if weak or unused accounts exist on the system.",
    relevantCommands: [
      "sshd -T",
      "ssh analyst@host",
      "ssh bunsal@host",
      "ssh-set AllowUsers bunsal deploy",
    ],
    verify: (state) => {
      const allowOk = hasAllowUsersPolicy(state, ["bunsal", "deploy"]);
      const analystDenied = !evaluateSshAccess(state, "analyst").allowed;
      const bunsalOk = evaluateSshAccess(state, "bunsal").allowed;
      return allowOk && analystDenied && bunsalOk;
    },
    verifyHint:
      "AllowUsers must be bunsal deploy. Confirm analyst is denied and bunsal can still connect.",
  },
  {
    id: "E",
    title: "Invalid SSH configuration",
    simulatorScenario: "invalid-config",
    requirement:
      "sshd_config contains an invalid setting. Validate with sshd -t, repair it, and restart the fictional SSH service successfully.",
    inspectHint:
      "Run `sshd -t` and `cat /etc/ssh/sshd_config`. Note the misspelled PermitRootLogon line.",
    hint: "After confirming the error, run `ssh-fix-syntax`, then `sshd -t` and `systemctl restart ssh`.",
    successExplain:
      "Syntax validation caught the bad option. After repair, the simulated service restarts cleanly.",
    securityNote:
      "On real hosts, a bad sshd_config can leave SSH down. Always validate and preserve recovery access.",
    relevantCommands: [
      "sshd -t",
      "cat /etc/ssh/sshd_config",
      "ssh-fix-syntax",
      "systemctl restart ssh",
    ],
    verify: (state) => sshdConfigValid(state) && state.lastRestartOk,
    verifyHint:
      "Fix syntax with ssh-fix-syntax, validate with sshd -t, then systemctl restart ssh.",
  },
  {
    id: "F",
    title: "Authentication log investigation",
    simulatorScenario: "auth-logs",
    requirement:
      "Review fictional logs for repeated failed root attempts, a successful bunsal key login, and analyst rejected by AllowUsers. Verification succeeds when you have inspected the log stream — findings stay present as evidence.",
    inspectHint:
      "Run `journalctl -u ssh` and optionally `sshd -T` to correlate AllowUsers with the rejected analyst session.",
    hint: "You are verifying understanding of the initial log evidence. After reading journalctl -u ssh, click Verify — do not remediate yet.",
    successExplain:
      "Suspicious patterns (repeated internet root failures) differ from expected policy denials and legitimate admin key logins. Context prevents over-reacting to every failed attempt.",
    securityNote:
      "Failed authentication is a signal to investigate — not automatic proof of compromise. Correlate source, account, method, and timing.",
    relevantCommands: [
      "journalctl -u ssh",
      "sshd -T",
      "grep AllowUsers /etc/ssh/sshd_config",
    ],
    verify: (state) =>
      state.logs.some((entry) =>
        entry.message.includes("Failed password for root"),
      ) &&
      state.logs.some((entry) =>
        entry.message.includes("Accepted publickey for bunsal"),
      ) &&
      state.logs.some((entry) =>
        entry.message.includes("not listed in AllowUsers"),
      ),
    verifyHint:
      "Inspect journalctl -u ssh. Verification checks that the investigative evidence is still present.",
  },
] as const;

const LAB_SUGGESTIONS = [
  { command: "cat /etc/ssh/sshd_config", label: "cat config" },
  { command: "sshd -T", label: "sshd -T" },
  { command: "sshd -t", label: "sshd -t" },
  { command: "systemctl status ssh", label: "status" },
  { command: "journalctl -u ssh", label: "logs" },
  { command: "help", label: "help" },
] as const;

type LabStep = "overview" | "work" | "complete";

export function SecuritySshHardeningAssessment() {
  const [step, setStep] = useState<LabStep>("overview");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [inspected, setInspected] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyAttempted, setVerifyAttempted] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [sshState, setSshState] = useState<SimulatedSshHardeningState | null>(
    null,
  );
  const [completed, setCompleted] = useState<ReadonlySet<LabScenarioId>>(
    () => new Set(),
  );

  const scenario = LAB_SCENARIOS[scenarioIndex]!;
  const stateOk = sshState ? scenario.verify(sshState) : false;

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setSshState(null);
  }

  function startScenario(index: number) {
    setScenarioIndex(index);
    setShowHint(false);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setSshState(null);
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
          Interactive SSH Hardening Lab
        </h3>
        <p className="text-sm">
          Six guided scenarios on a fictional host. Inspect state, apply
          deliberate sshd changes when required, and verify the resulting
          simulated policy — not just the command string.
        </p>
        <Callout title="Learning safety">
          <p>
            Everything is simulated. The app never runs real SSH, never reads
            host sshd_config, and never generates or requests real keys or
            passwords.
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
              disabled={!sshState}
              onClick={() => {
                setVerifyAttempted(true);
                if (sshState && scenario.verify(sshState)) {
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
            securitySshHardening={scenario.simulatorScenario}
            suggestions={[
              ...scenario.relevantCommands.map((command) => ({
                command,
                label: command.split(" ")[0] ?? command,
              })),
              ...LAB_SUGGESTIONS,
            ]}
            suggestionsLabel="Scenario commands"
            onSecuritySshHardeningChange={(state) => {
              setSshState(state);
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
                normalized.startsWith("sshd") ||
                normalized.startsWith("cat /etc/ssh") ||
                normalized.startsWith("journalctl") ||
                normalized.startsWith("ssh-set") ||
                normalized.startsWith("systemctl")
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
                    ? " Inspect the initial state with cat, sshd -T, or journalctl first."
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
        <Callout title="SSH hardening laboratory complete">
          <p>
            You worked through root login exposure, password authentication,
            attempt limits, user allowlists, invalid configuration, and log
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
