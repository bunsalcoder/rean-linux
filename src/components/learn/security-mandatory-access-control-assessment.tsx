"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  apparmorAllowsPath,
  apparmorProfileIsEnforce,
  evaluateCombinedAccess,
  fileHasExpectedSelinuxContext,
  profileIsLeastPrivilege,
  type MacScenarioId,
  type SimulatedMacState,
} from "@/lib/simulate-security-mandatory-access-control";
import { cn } from "@/lib/utils";

type LabScenarioId = "A" | "B" | "C" | "D" | "E" | "F";

type LabScenario = {
  id: LabScenarioId;
  title: string;
  simulatorScenario: MacScenarioId;
  requirement: string;
  inspectHint: string;
  hint: string;
  successExplain: string;
  securityNote: string;
  relevantCommands: readonly string[];
  verify: (state: SimulatedMacState) => boolean;
  verifyHint: string;
};

const LAB_SCENARIOS: readonly LabScenario[] = [
  {
    id: "A",
    title: "AppArmor file access denial",
    simulatorScenario: "apparmor-file-denial",
    requirement:
      "rean-app cannot read /srv/app/config.yml under its enforce profile. Inspect the denial, add the minimal allow, and confirm mac-eval succeeds.",
    inspectHint:
      "Start with `aa-status`, `journalctl -u apparmor`, and `mac-eval rean-app read /srv/app/config.yml`.",
    hint: "After confirming the deny, run `mac-allow-path rean-app /srv/app/config.yml r`, then re-evaluate.",
    successExplain:
      "AppArmor enforce mode blocked a path DAC would otherwise allow. A narrow allow restores only the needed read.",
    securityNote:
      "Prefer the smallest path change. Avoid disabling profiles to “make it work.”",
    relevantCommands: [
      "aa-status",
      "journalctl -u apparmor",
      "mac-eval rean-app read /srv/app/config.yml",
      "mac-allow-path rean-app /srv/app/config.yml r",
    ],
    verify: (state) =>
      apparmorAllowsPath(state, "rean-app", "/srv/app/config.yml", "read") &&
      evaluateCombinedAccess(state, {
        profileName: "rean-app",
        path: "/srv/app/config.yml",
        op: "read",
      }).allowed,
    verifyHint:
      "Add a minimal allow with mac-allow-path, then confirm mac-eval allows the read.",
  },
  {
    id: "B",
    title: "AppArmor enforcement modes",
    simulatorScenario: "apparmor-complain",
    requirement:
      "rean-app is in complain mode. Explain that violations are logged but not blocked, then restore enforce with mac-restore-mode or aa-enforce.",
    inspectHint:
      "Compare `aa-status` with `mac-eval rean-app read /srv/app/config.yml` while still in complain mode.",
    hint: "Run `mac-restore-mode rean-app` (or `aa-enforce rean-app`) so the profile returns to enforce.",
    successExplain:
      "Complain mode is for learning and tuning. Production intent here is enforce — restore it after inspection.",
    securityNote: "Leaving profiles in complain forever weakens containment.",
    relevantCommands: [
      "aa-status",
      "mac-eval rean-app read /srv/app/config.yml",
      "mac-restore-mode rean-app",
      "aa-enforce rean-app",
    ],
    verify: (state) => apparmorProfileIsEnforce(state, "rean-app"),
    verifyHint:
      "Restore enforce mode with mac-restore-mode rean-app or aa-enforce rean-app.",
  },
  {
    id: "C",
    title: "SELinux context mismatch",
    simulatorScenario: "selinux-context-mismatch",
    requirement:
      "httpd cannot read secret.html because the file type is wrong. Inspect contexts, restore the expected label, and verify.",
    inspectHint:
      "Use `ls -Z /var/www/html/secret.html`, `ps -Z`, and `mac-eval httpd_t read /var/www/html/secret.html`.",
    hint: "Run `restorecon /var/www/html/secret.html`, then re-check with ls -Z and mac-eval.",
    successExplain:
      "Wrong file types cause SELinux denials even when chmod looks correct. restorecon applies the expected teaching context.",
    securityNote: "Do not setenforce 0 just to silence a labeling mistake.",
    relevantCommands: [
      "ls -Z /var/www/html/secret.html",
      "ps -Z",
      "mac-eval httpd_t read /var/www/html/secret.html",
      "restorecon /var/www/html/secret.html",
    ],
    verify: (state) =>
      fileHasExpectedSelinuxContext(state, "/var/www/html/secret.html") &&
      evaluateCombinedAccess(state, {
        processType: "httpd_t",
        path: "/var/www/html/secret.html",
        op: "read",
      }).allowed,
    verifyHint:
      "restorecon the file, then confirm mac-eval httpd_t read succeeds.",
  },
  {
    id: "D",
    title: "SELinux type enforcement",
    simulatorScenario: "selinux-type-enforcement",
    requirement:
      "httpd_t cannot write upload.dat while DAC appears writable. Inspect, understand the type mismatch, restore a writable content type, and verify.",
    inspectHint:
      "Compare `ls -l` / `ls -Z` on /srv/web/upload.dat with `mac-eval httpd_t write /srv/web/upload.dat`.",
    hint: "Traditional modes are not enough. Run `restorecon /srv/web/upload.dat` to the expected rw content type.",
    successExplain:
      "Type enforcement can deny writes to read-only content types. Fixing labels (or policy) addresses the real control — not chmod alone.",
    securityNote:
      "If a service needs write access, use the correct content type or a deliberate policy change — not blanket permissive mode.",
    relevantCommands: [
      "ls -l /srv/web/upload.dat",
      "ls -Z /srv/web/upload.dat",
      "mac-eval httpd_t write /srv/web/upload.dat",
      "restorecon /srv/web/upload.dat",
    ],
    verify: (state) =>
      fileHasExpectedSelinuxContext(state, "/srv/web/upload.dat") &&
      evaluateCombinedAccess(state, {
        processType: "httpd_t",
        path: "/srv/web/upload.dat",
        op: "write",
      }).allowed,
    verifyHint:
      "restorecon /srv/web/upload.dat so the type becomes writable for httpd_t.",
  },
  {
    id: "E",
    title: "Diagnose an access denial",
    simulatorScenario: "dac-and-mac",
    requirement:
      "Identify which layer blocks /srv/app/private.key (DAC) versus /srv/app/config.yml (AppArmor). Inspect both with mac-eval; verification checks evidence inspection.",
    inspectHint:
      "Run mac-eval for both paths and review `aa-status` / `ls -l` — do not remediate yet.",
    hint: "You are verifying diagnosis. After mac-eval on both paths (and optional journalctl), click Verify.",
    successExplain:
      "private.key fails DAC (mode 600). config.yml fails AppArmor while DAC would allow the app user. Layered controls need layered investigation.",
    securityNote:
      "Fix the layer that actually denies access — changing the wrong control wastes time and can weaken security.",
    relevantCommands: [
      "ls -l /srv/app/private.key",
      "mac-eval rean-app read /srv/app/private.key",
      "mac-eval rean-app read /srv/app/config.yml",
      "aa-status",
      "journalctl -u apparmor",
    ],
    verify: (state) => {
      const key = evaluateCombinedAccess(state, {
        profileName: "rean-app",
        path: "/srv/app/private.key",
        op: "read",
      });
      const config = evaluateCombinedAccess(state, {
        profileName: "rean-app",
        path: "/srv/app/config.yml",
        op: "read",
      });
      const layered =
        !key.dacAllowed &&
        key.enforcedBlock &&
        config.dacAllowed &&
        config.apparmorAllowed === false;
      return layered && (state.logsInspected || state.lastEvalSummary !== null);
    },
    verifyHint:
      "Evaluate both paths with mac-eval (and optionally journalctl). Verification expects you inspected the layered denials.",
  },
  {
    id: "F",
    title: "Security policy review",
    simulatorScenario: "policy-review",
    requirement:
      "rean-app allows /** and wild network capabilities. Inspect with aa-status, then apply mac-narrow-profile for least privilege.",
    inspectHint:
      "Run `aa-status` and think about which allows are broader than the app needs.",
    hint: "Run `mac-narrow-profile rean-app` to replace overly broad rules with a teaching least-privilege set.",
    successExplain:
      "Least privilege removes blanket filesystem and network rights while keeping required app paths and DB connect.",
    securityNote:
      "Broad profiles feel convenient until a compromise abuses them.",
    relevantCommands: [
      "aa-status",
      "mac-eval rean-app read /etc/shadow",
      "mac-narrow-profile rean-app",
      "mac-eval rean-app read /srv/app/config.yml",
    ],
    verify: (state) => profileIsLeastPrivilege(state, "rean-app"),
    verifyHint:
      "Apply mac-narrow-profile rean-app so overly broad allows are removed.",
  },
] as const;

const LAB_SUGGESTIONS = [
  { command: "aa-status", label: "aa-status" },
  { command: "getenforce", label: "getenforce" },
  { command: "ls -Z /var/www/html", label: "ls -Z" },
  { command: "ps -Z", label: "ps -Z" },
  {
    command: "mac-eval rean-app read /srv/app/config.yml",
    label: "mac-eval",
  },
  { command: "help", label: "help" },
] as const;

type LabStep = "overview" | "work" | "complete";

export function SecurityMandatoryAccessControlAssessment() {
  const [step, setStep] = useState<LabStep>("overview");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [inspected, setInspected] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyAttempted, setVerifyAttempted] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [macState, setMacState] = useState<SimulatedMacState | null>(null);
  const [completed, setCompleted] = useState<ReadonlySet<LabScenarioId>>(
    () => new Set(),
  );

  const scenario = LAB_SCENARIOS[scenarioIndex]!;
  const stateOk = macState ? scenario.verify(macState) : false;

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setMacState(null);
  }

  function startScenario(index: number) {
    setScenarioIndex(index);
    setShowHint(false);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setMacState(null);
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
          Interactive Mandatory Access Control Lab
        </h3>
        <p className="text-sm">
          Six guided scenarios on a fictional host. Inspect AppArmor profiles
          and SELinux contexts, apply minimal simulated fixes, and verify access
          decisions — not just the command string.
        </p>
        <Callout title="Learning safety">
          <p>
            Everything is simulated. The app never runs real AppArmor or
            SELinux, never changes host labels or profiles, and never inspects
            real process security identities.
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
              disabled={!macState}
              onClick={() => {
                setVerifyAttempted(true);
                if (macState && scenario.verify(macState)) {
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
            securityMandatoryAccessControl={scenario.simulatorScenario}
            suggestions={[
              ...scenario.relevantCommands.map((command) => ({
                command,
                label: command.split(" ")[0] ?? command,
              })),
              ...LAB_SUGGESTIONS,
            ]}
            suggestionsLabel="Scenario commands"
            onSecurityMandatoryAccessControlChange={(state) => {
              setMacState(state);
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
                normalized.startsWith("aa-") ||
                normalized.startsWith("mac-") ||
                normalized.startsWith("ls") ||
                normalized.startsWith("ps") ||
                normalized.startsWith("restorecon") ||
                normalized.startsWith("getenforce") ||
                normalized.startsWith("sestatus") ||
                normalized.startsWith("journalctl") ||
                normalized.startsWith("stat")
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
                    ? " Inspect profiles, contexts, or denials first."
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
        <Callout title="Mandatory access control laboratory complete">
          <p>
            You worked through AppArmor denials and modes, SELinux labeling and
            type enforcement, layered DAC+MAC diagnosis, and least-privilege
            profile review. Continue to practice or the final knowledge check
            when ready.
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
