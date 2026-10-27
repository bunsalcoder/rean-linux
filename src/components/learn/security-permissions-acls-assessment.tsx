"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  checkEffectiveAccess,
  hasDefaultAclEntry,
  hasNamedUserAcl,
  lacksNamedUserAcl,
  maskAllows,
  userCan,
  type AclScenarioId,
  type SimulatedAclState,
} from "@/lib/simulate-security-permissions-acls";
import { cn } from "@/lib/utils";

type LabScenarioId = "A" | "B" | "C" | "D" | "E";

type LabScenario = {
  id: LabScenarioId;
  title: string;
  simulatorScenario: AclScenarioId;
  requirement: string;
  inspectHint: string;
  hint: string;
  successExplain: string;
  securityNote: string;
  relevantCommands: readonly string[];
  verify: (state: SimulatedAclState) => boolean;
  verifyHint: string;
};

const LAB_SCENARIOS: readonly LabScenario[] = [
  {
    id: "A",
    title: "Grant specific access",
    simulatorScenario: "grant-access",
    requirement:
      "A project file `/srv/projects/app.conf` must be readable by the named user `analyst` without granting read to every other user.",
    inspectHint:
      "Start with `ls -l` and `getfacl` on `/srv/projects/app.conf`. Confirm analyst currently has no named-user entry.",
    hint: "Prefer `setfacl -m u:analyst:r-- /srv/projects/app.conf` over widening other:: or chmod 644.",
    successExplain:
      "A named-user ACL entry grants exactly the identity that needs access. Owner/group modes stay intentional, and other users still lack read.",
    securityNote:
      "Do not broaden world-readable modes “temporarily” to clear an access error — that expands confidentiality risk for every local account.",
    relevantCommands: [
      "ls -l /srv/projects/app.conf",
      "getfacl /srv/projects/app.conf",
      "setfacl -m u:analyst:r-- /srv/projects/app.conf",
      "check-access analyst /srv/projects/app.conf",
    ],
    verify: (state) =>
      hasNamedUserAcl(state, "/srv/projects/app.conf", "analyst", {
        r: true,
      }) &&
      userCan(state, "/srv/projects/app.conf", "analyst", "r") &&
      !userCan(state, "/srv/projects/app.conf", "contractor", "r"),
    verifyHint:
      "Analyst must have an effective read ACL entry, and contractor must still lack read.",
  },
  {
    id: "B",
    title: "Diagnose an ACL mask",
    simulatorScenario: "mask-diagnosis",
    requirement:
      "Contractor has an ACL entry allowing write on `/srv/reports/quarterly.csv`, but effective write is restricted by the ACL mask. Identify the gap and raise the mask so write becomes effective — without deleting the named-user entry.",
    inspectHint:
      "Run `getfacl /srv/reports/quarterly.csv` and look for `#effective:`. Compare listed `rw-` with the mask.",
    hint: "Keep `u:contractor:rw-` and run `setfacl -m m::rw- /srv/reports/quarterly.csv`.",
    successExplain:
      "Changing the mask updates effective permissions for named users and groups. The underlying ACL entry remains; only the intersection with the mask changes.",
    securityNote:
      "Raising a mask can also increase effective rights for other named entries that share the group class — review all entries before widening it.",
    relevantCommands: [
      "getfacl /srv/reports/quarterly.csv",
      "check-access contractor /srv/reports/quarterly.csv",
      "setfacl -m m::rw- /srv/reports/quarterly.csv",
    ],
    verify: (state) => {
      const node = state.nodes["/srv/reports/quarterly.csv"];
      if (!node) return false;
      const access = checkEffectiveAccess(node, "contractor");
      return (
        hasNamedUserAcl(state, "/srv/reports/quarterly.csv", "contractor", {
          r: true,
          w: true,
        }) &&
        maskAllows(state, "/srv/reports/quarterly.csv", {
          r: true,
          w: true,
        }) &&
        access.write
      );
    },
    verifyHint:
      "Contractor’s listed write must remain, the mask must allow write, and effective write must succeed.",
  },
  {
    id: "C",
    title: "Remove excessive access",
    simulatorScenario: "remove-excess",
    requirement:
      "Sensitive `/srv/projects/app.conf` has an unnecessary `tempadmin` named-user ACL entry. Remove that excess access without removing analyst’s legitimate read entry.",
    inspectHint:
      "List ACL entries with `getfacl /srv/projects/app.conf` and identify both `tempadmin` and `analyst`.",
    hint: "Use `setfacl -x u:tempadmin /srv/projects/app.conf`. Avoid `setfacl -b`, which would wipe more than you intend.",
    successExplain:
      "Targeted removal with `-x` deletes one named entry. Unrelated grants (analyst read) remain, matching least privilege.",
    securityNote:
      "Wiping all ACLs or chmod’ing to 000 can break legitimate workflows. Prefer the smallest removal that closes the excess path.",
    relevantCommands: [
      "getfacl /srv/projects/app.conf",
      "setfacl -x u:tempadmin /srv/projects/app.conf",
      "check-access tempadmin /srv/projects/app.conf",
      "check-access analyst /srv/projects/app.conf",
    ],
    verify: (state) =>
      lacksNamedUserAcl(state, "/srv/projects/app.conf", "tempadmin") &&
      hasNamedUserAcl(state, "/srv/projects/app.conf", "analyst", {
        r: true,
      }) &&
      userCan(state, "/srv/projects/app.conf", "analyst", "r"),
    verifyHint:
      "tempadmin must be gone; analyst read must still be present and effective.",
  },
  {
    id: "D",
    title: "Default ACLs",
    simulatorScenario: "default-acls",
    requirement:
      "`/srv/shared` needs a predictable policy for newly created children: grant the `reports` group read via a default ACL, then inspect the result.",
    inspectHint:
      "Run `getfacl /srv/shared` first — this scenario starts without default ACL lines.",
    hint: "Configure with `setfacl -d -m g:reports:r-- /srv/shared`. Optionally `touch /srv/shared/new-note.txt` and `getfacl` the new file.",
    successExplain:
      "Default ACL entries apply to newly created children. They are distinct from the directory’s access ACL, which still governs the directory itself.",
    securityNote:
      "Default ACLs do not silently rewrite existing files. Plan inheritance carefully, then verify new objects after creation.",
    relevantCommands: [
      "getfacl /srv/shared",
      "setfacl -d -m g:reports:r-- /srv/shared",
      "touch /srv/shared/new-note.txt",
      "getfacl /srv/shared/new-note.txt",
    ],
    verify: (state) =>
      hasDefaultAclEntry(state, "/srv/shared", "group", "reports", {
        r: true,
      }),
    verifyHint:
      "getfacl on /srv/shared must show a default:group:reports entry with read.",
  },
  {
    id: "E",
    title: "Verify effective permissions",
    simulatorScenario: "verify-effective",
    requirement:
      "Inspect standard permissions and ACL together for `/srv/reports/quarterly.csv`. Determine whether contractor can write in the initial state, then confirm with the teaching helper.",
    inspectHint:
      "Use `ls -l`, `getfacl`, and `check-access contractor /srv/reports/quarterly.csv`.",
    hint: "Listed `user:contractor:rw-` with `mask::r--` means effective write is false. You are verifying understanding — no change is required for success in this scenario.",
    successExplain:
      "Effective access follows owner → named-user (+ mask) → matching groups (+ mask) → other. Contractor matches a named-user entry, then the mask removes write.",
    securityNote:
      "Trusting only the ACL entry text without checking `#effective:` (or an access test) is a common mistake during audits.",
    relevantCommands: [
      "ls -l /srv/reports/quarterly.csv",
      "getfacl /srv/reports/quarterly.csv",
      "check-access contractor /srv/reports/quarterly.csv",
    ],
    verify: (state) => {
      const node = state.nodes["/srv/reports/quarterly.csv"];
      if (!node) return false;
      const access = checkEffectiveAccess(node, "contractor");
      // Success = learner has inspected a state where write is effectively denied
      // while listed write remains true (the teaching point).
      return (
        hasNamedUserAcl(state, "/srv/reports/quarterly.csv", "contractor", {
          w: true,
        }) &&
        !access.write &&
        access.maskApplied
      );
    },
    verifyHint:
      "Confirm contractor still has listed write, the mask restricts it, and effective write is false. No permission change is required.",
  },
] as const;

const LAB_SUGGESTIONS = [
  { command: "ls -l /srv/projects", label: "ls projects" },
  { command: "getfacl /srv/projects/app.conf", label: "getfacl app.conf" },
  { command: "getfacl /srv/reports/quarterly.csv", label: "getfacl csv" },
  { command: "getfacl /srv/shared", label: "getfacl shared" },
  {
    command: "check-access analyst /srv/projects/app.conf",
    label: "check analyst",
  },
  {
    command: "check-access contractor /srv/reports/quarterly.csv",
    label: "check contractor",
  },
  { command: "help", label: "help" },
] as const;

type LabStep = "overview" | "work" | "complete";

export function SecurityPermissionsAclsAssessment() {
  const [step, setStep] = useState<LabStep>("overview");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [inspected, setInspected] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyAttempted, setVerifyAttempted] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [aclState, setAclState] = useState<SimulatedAclState | null>(null);
  const [completed, setCompleted] = useState<ReadonlySet<LabScenarioId>>(
    () => new Set(),
  );

  const scenario = LAB_SCENARIOS[scenarioIndex]!;
  const stateOk = aclState ? scenario.verify(aclState) : false;

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setAclState(null);
  }

  function startScenario(index: number) {
    setScenarioIndex(index);
    setShowHint(false);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setAclState(null);
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
          Interactive ACL Laboratory
        </h3>
        <p className="text-sm">
          Five guided scenarios on a fictional host. Inspect state, apply a
          deliberate ACL change when required, and verify the resulting
          simulated permissions — not just the command string.
        </p>
        <Callout title="Learning safety">
          <p>
            Everything is simulated. The app never runs real getfacl/setfacl,
            never changes host permissions, and never executes a real shell.
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
              disabled={!aclState}
              onClick={() => {
                setVerifyAttempted(true);
                if (aclState && scenario.verify(aclState)) {
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
            securityPermissionsAcls={scenario.simulatorScenario}
            suggestions={[
              ...scenario.relevantCommands.map((command) => ({
                command,
                label: command.split(" ")[0] ?? command,
              })),
              ...LAB_SUGGESTIONS,
            ]}
            suggestionsLabel="Scenario commands"
            onSecurityPermissionsAclsChange={(state) => {
              setAclState(state);
              if (scenario.verify(state)) {
                // Keep verified in sync if they already attempted
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
                normalized.startsWith("getfacl") ||
                normalized.startsWith("ls") ||
                normalized.startsWith("check-access")
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
                    ? " Inspect the initial state with getfacl or ls -l first."
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
        <Callout title="ACL laboratory complete">
          <p>
            You worked through grant, mask diagnosis, excess removal, default
            ACLs, and effective-permission verification. Continue to the
            practice session or final knowledge check when ready.
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
