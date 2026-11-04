"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  authActivityInspectable,
  backupRestoreVerified,
  contractorRemovedFromSudo,
  deploySudoLeastPrivilege,
  opensshPatched,
  postgresNotPubliclyExposed,
  secretsHardened,
  sshHardened,
  type SecurityAuditingScenarioId,
  type SimulatedSecurityAuditingState,
} from "@/lib/simulate-security-auditing";
import { cn } from "@/lib/utils";

type LabScenarioId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

type LabScenario = {
  id: LabScenarioId;
  title: string;
  simulatorScenario: SecurityAuditingScenarioId;
  requirement: string;
  inspectHint: string;
  hint: string;
  successExplain: string;
  securityNote: string;
  relevantCommands: readonly string[];
  verify: (state: SimulatedSecurityAuditingState) => boolean;
  verifyHint: string;
};

const LAB_SCENARIOS: readonly LabScenario[] = [
  {
    id: "A",
    title: "Account security — remove unauthorized sudo user",
    simulatorScenario: "account-admin-group",
    requirement:
      "Identify that the contractor user is in the sudo group and remove them.",
    inspectHint:
      "Start with `getent group sudo`, then `id contractor` to confirm.",
    hint: "Run sudo gpasswd -d contractor sudo to remove them from the sudo group.",
    successExplain:
      "The contractor account had unnecessary administrative privileges. Removing sudo membership follows least privilege.",
    securityNote:
      "Combined with finding G (suspicious auth activity from contractor's IP), this is especially urgent.",
    relevantCommands: [
      "getent group sudo",
      "id contractor",
      "sudo gpasswd -d contractor sudo",
    ],
    verify: (state) => contractorRemovedFromSudo(state),
    verifyHint:
      "Run sudo gpasswd -d contractor sudo, then verify with getent group sudo.",
  },
  {
    id: "B",
    title: "Permissions — harden sensitive secrets file",
    simulatorScenario: "sensitive-file-perms",
    requirement:
      "Find that /srv/app/secrets.env is world-readable and restrict it to owner-only.",
    inspectHint:
      "Use `ls -l /srv/app/secrets.env` and `getfacl /srv/app/secrets.env`.",
    hint: "Run chmod 600 /srv/app/secrets.env to restrict permissions.",
    successExplain:
      "Application secrets should never be readable by other users. Mode 0600 restricts to owner only.",
    securityNote:
      "ACL entries can override traditional permissions — always check both.",
    relevantCommands: [
      "ls -l /srv/app/secrets.env",
      "getfacl /srv/app/secrets.env",
      "chmod 600 /srv/app/secrets.env",
      "setfacl -b /srv/app/secrets.env",
    ],
    verify: (state) => secretsHardened(state),
    verifyHint:
      "Run chmod 600 /srv/app/secrets.env (and setfacl -b to clear ACLs).",
  },
  {
    id: "C",
    title: "Privilege management — restrict deploy sudo rules",
    simulatorScenario: "excessive-sudo",
    requirement:
      "The deploy user has NOPASSWD ALL. Restrict to specific deployment commands only.",
    inspectHint: "Check with `sudo -l -U deploy` and review `/etc/sudoers.d`.",
    hint: "Run set-sudo-rule deploy to apply least-privilege sudo rules.",
    successExplain:
      "Service accounts should only run specific commands they need, not unrestricted ALL.",
    securityNote:
      "NOPASSWD ALL is especially dangerous — a compromised service account becomes root silently.",
    relevantCommands: [
      "sudo -l -U deploy",
      "ls -l /etc/sudoers.d",
      "set-sudo-rule deploy",
    ],
    verify: (state) => deploySudoLeastPrivilege(state),
    verifyHint:
      "Run set-sudo-rule deploy to restrict the deploy user's sudo entry.",
  },
  {
    id: "D",
    title: "SSH — disable password auth and root login",
    simulatorScenario: "ssh-misconfig",
    requirement:
      "SSH allows password authentication and root login. Disable both.",
    inspectHint: "Check with `sshd -T` for current effective settings.",
    hint: "Run set-ssh PasswordAuthentication no and set-ssh PermitRootLogin no.",
    successExplain:
      "Disabling password auth forces key-based authentication. Disabling root login prevents direct root brute-force.",
    securityNote:
      "The auth log (finding G) already shows brute-force attempts leveraging password auth.",
    relevantCommands: [
      "sshd -T",
      "set-ssh PasswordAuthentication no",
      "set-ssh PermitRootLogin no",
    ],
    verify: (state) => sshHardened(state),
    verifyHint:
      "Run set-ssh PasswordAuthentication no and set-ssh PermitRootLogin no.",
  },
  {
    id: "E",
    title: "Network — stop PostgreSQL public exposure",
    simulatorScenario: "network-exposure",
    requirement:
      "PostgreSQL is listening on 0.0.0.0:5432 and the firewall allows it. Bind to localhost and deny the port.",
    inspectHint:
      "Use `ss -tuln` to see listening sockets and `ufw status` for firewall rules.",
    hint: "Run bind-postgres localhost and ufw deny 5432/tcp.",
    successExplain:
      "Databases should not be exposed to the network unless explicitly required with strong access controls.",
    securityNote:
      "Defense in depth: both the bind address and the firewall rule should restrict access.",
    relevantCommands: [
      "ss -tuln",
      "ufw status",
      "bind-postgres localhost",
      "ufw deny 5432/tcp",
    ],
    verify: (state) => postgresNotPubliclyExposed(state),
    verifyHint:
      "Run bind-postgres localhost and ufw deny 5432/tcp, then verify with ss -tuln.",
  },
  {
    id: "F",
    title: "Package — upgrade outdated openssh-server",
    simulatorScenario: "vulnerable-package",
    requirement:
      "openssh-server is outdated per DEMO-AUDIT-2026-001. Upgrade to the fixed version.",
    inspectHint:
      "Check with `apt list --upgradable` and `apt show openssh-server`.",
    hint: "Run sudo apt install openssh-server to upgrade.",
    successExplain:
      "The advisory describes a critical remote code execution flaw. Patching eliminates the vulnerability.",
    securityNote:
      "A network-exposed SSH daemon with a known exploit and available fix is an immediate remediation priority.",
    relevantCommands: [
      "apt list --upgradable",
      "apt show openssh-server",
      "sudo apt install openssh-server",
    ],
    verify: (state) => opensshPatched(state),
    verifyHint:
      "Run sudo apt install openssh-server and verify with apt show openssh-server.",
  },
  {
    id: "G",
    title: "Logs — investigate suspicious auth activity",
    simulatorScenario: "auth-activity",
    requirement:
      "Review SSH authentication logs for signs of suspicious activity. This is inspection-only — document what you find.",
    inspectHint: "Use `journalctl -u ssh` and review failed/accepted patterns.",
    hint: "Look for repeated failed attempts followed by a successful login from the same IP.",
    successExplain:
      "Multiple failed passwords from 203.0.113.50 followed by a successful login for contractor suggests credential compromise or brute-force success. This warrants investigation, not proof of malice alone.",
    securityNote:
      "Log evidence supports investigation — it does not automatically prove compromise. Document findings and escalate.",
    relevantCommands: [
      "journalctl -u ssh",
      "journalctl -u ssh -n 20",
      "journalctl",
    ],
    verify: (state) => authActivityInspectable(state),
    verifyHint:
      "Run journalctl -u ssh to review the authentication logs. Verification succeeds when you have inspected the logs.",
  },
  {
    id: "H",
    title: "Backup — verify restore capability",
    simulatorScenario: "backup-readiness",
    requirement:
      "Daily backups exist but restore has never been tested. Run a test restore verification.",
    inspectHint:
      "Check backup existence with `ls -l /var/backups` and `df -h`.",
    hint: "Run mark-restore-tested to simulate a restore verification.",
    successExplain:
      "Untested backups are untrusted backups. Regular restore testing ensures recovery capability when it matters most.",
    securityNote:
      "Backup verification is part of operational resilience — a security auditor should always check.",
    relevantCommands: [
      "ls -l /var/backups",
      "df -h",
      "findmnt",
      "mark-restore-tested",
    ],
    verify: (state) => backupRestoreVerified(state),
    verifyHint:
      "Review backups with ls -l /var/backups, then run mark-restore-tested.",
  },
] as const;

const LAB_SUGGESTIONS = [
  { command: "id contractor", label: "id contractor" },
  { command: "getent group sudo", label: "getent group sudo" },
  { command: "ss -tuln", label: "ss -tuln" },
  { command: "sshd -T", label: "sshd -T" },
  { command: "journalctl -u ssh", label: "journalctl -u ssh" },
  { command: "help", label: "help" },
] as const;

type LabStep = "overview" | "work" | "complete";

export function SecurityAuditingAssessment() {
  const [step, setStep] = useState<LabStep>("overview");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [inspected, setInspected] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyAttempted, setVerifyAttempted] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [auditState, setAuditState] =
    useState<SimulatedSecurityAuditingState | null>(null);
  const [completed, setCompleted] = useState<ReadonlySet<LabScenarioId>>(
    () => new Set(),
  );

  const scenario = LAB_SCENARIOS[scenarioIndex]!;
  const stateOk = auditState ? scenario.verify(auditState) : false;

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setAuditState(null);
  }

  function startScenario(index: number) {
    setScenarioIndex(index);
    setShowHint(false);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setAuditState(null);
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
          Interactive Security Auditing Lab
        </h3>
        <p className="text-sm">
          Eight guided scenarios on fictional host{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            rean-audit
          </code>
          . Gather evidence, apply remediations, and verify outcomes — never
          real commands.
        </p>
        <Callout title="Learning safety">
          <p>
            Everything is simulated. The app never runs real commands, never
            scans networks, and never modifies your system. Advisory IDs use
            DEMO-AUDIT-* labels only.
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
              disabled={!auditState}
              onClick={() => {
                setVerifyAttempted(true);
                if (auditState && scenario.verify(auditState)) {
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
            securityAuditing={scenario.simulatorScenario}
            suggestions={[
              ...scenario.relevantCommands.map((command) => ({
                command,
                label: command.split(" ").slice(0, 3).join(" "),
              })),
              ...LAB_SUGGESTIONS,
            ]}
            suggestionsLabel="Scenario commands"
            onSecurityAuditingChange={(state) => {
              setAuditState(state);
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
                normalized.startsWith("getent ") ||
                normalized.startsWith("id ") ||
                normalized.startsWith("journalctl") ||
                normalized.startsWith("ss ") ||
                normalized.startsWith("sshd ") ||
                normalized.startsWith("ufw") ||
                normalized.startsWith("apt") ||
                normalized.startsWith("ls ")
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
                    ? " Inspect the environment with audit commands first."
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
        <Callout title="Security auditing laboratory complete">
          <p>
            You practiced all eight audit categories: account security, file
            permissions, privilege management, SSH configuration, network
            exposure, package security, log investigation, and backup
            verification.
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
