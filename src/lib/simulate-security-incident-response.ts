/**
 * Frontend-only security incident response simulation for Stage 04 Lesson 11.
 * Never executes real shell commands, never inspects the host system,
 * never isolates real networks, never modifies real accounts or services,
 * never restores real backups, and never provides malware payloads.
 * All users, logs, processes, configs, and evidence are fictional teaching data
 * held entirely in memory for the browser session.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_IR_USER = "bunsal";
export const SIMULATED_IR_HOST = "rean-ir";

/** Educational simulation label — not a real cryptographic hash. */
export const SIM_INTEGRITY_PREFIX = "SIM-HASH";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IncidentSeverity =
  "critical" | "high" | "medium" | "low" | "informational";

export type IncidentPriority = "immediate" | "high" | "medium" | "low";

export type EvidenceCategory =
  | "authentication"
  | "service"
  | "system"
  | "configuration"
  | "network"
  | "file"
  | "package"
  | "backup";

export type EvidenceRelevance = "unreviewed" | "relevant" | "inconclusive";

export type IrWorkflowStep =
  | "identify"
  | "assess-severity"
  | "determine-scope"
  | "collect-evidence"
  | "contain"
  | "eradicate"
  | "recover"
  | "verify"
  | "report";

export type SecurityIncidentResponseScenarioId =
  | "explore"
  | "suspicious-auth"
  | "compromised-account"
  | "unauthorized-config"
  | "network-exposure"
  | "suspicious-file"
  | "service-recovery"
  | "healthy";

export type SimulatedEvidenceItem = {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  category: EvidenceCategory;
  summary: string;
  detail: string;
  /** Educational integrity identifier — not a real cryptographic verification. */
  integrityId: string;
  relatedFinding: string;
};

export type SimulatedIrFinding = {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  priority: IncidentPriority;
  affectedAssets: readonly string[];
};

export type SimulatedSecurityIncidentResponseState = {
  scenarioId: SecurityIncidentResponseScenarioId;
  /** Finding: suspicious auth for contractor from 203.0.113.88 */
  suspiciousAuthPresent: boolean;
  /** Finding: contractor unexpectedly in sudo */
  contractorElevated: boolean;
  /** Finding: unusual simulated process running */
  unusualProcessRunning: boolean;
  /** Finding: nginx config unauthorized change */
  nginxConfigTampered: boolean;
  /** Finding: suspicious outbound connection record */
  suspiciousConnPresent: boolean;
  /** Finding: unexpected listener on port 31337 */
  unexpectedPortOpen: boolean;
  /** Finding: fictional outdated package */
  packageOutdated: boolean;
  /** Simulated clean backup available */
  backupAvailable: boolean;

  // Inspection flags
  authInspected: boolean;
  accountInspected: boolean;
  processInspected: boolean;
  configInspected: boolean;
  networkInspected: boolean;
  fileInspected: boolean;
  packageInspected: boolean;
  backupInspected: boolean;

  // Evidence preservation (must precede destructive containment in good practice)
  evidencePreserved: boolean;
  evidencePreservedBeforeContainment: boolean;
  containmentStartedBeforeEvidence: boolean;

  // Containment
  accountDisabled: boolean;
  serviceIsolated: boolean;
  sourceBlocked: boolean;
  processStopped: boolean;
  portClosed: boolean;

  // Eradication / recovery
  configRestored: boolean;
  backupIntegrityChecked: boolean;
  backupRestored: boolean;
  credentialsRotated: boolean;
  packageUpdated: boolean;
  servicesVerified: boolean;

  // Feedback notes accumulated for report/teaching
  decisionNotes: readonly string[];
};

export type SecurityIncidentResponseScenarioMeta = {
  id: SecurityIncidentResponseScenarioId;
  label: string;
  summary: string;
};

export type SimulateSecurityIncidentResponseResult = {
  result: SimulateResult;
  state: SimulatedSecurityIncidentResponseState;
};

export type IncidentReportSnapshot = {
  title: string;
  classification: string;
  severity: IncidentSeverity;
  affectedAssets: readonly string[];
  timeline: readonly { time: string; event: string }[];
  evidenceCollected: readonly string[];
  containmentActions: readonly string[];
  eradicationRecovery: readonly string[];
  verificationResults: readonly string[];
  finalStatus: string;
  lessonsLearned: readonly string[];
  qualityNotes: readonly string[];
};

// ---------------------------------------------------------------------------
// Catalog data (fictional)
// ---------------------------------------------------------------------------

export const IR_FINDINGS: readonly SimulatedIrFinding[] = [
  {
    id: "AUTH-1",
    title: "Suspicious authentication activity",
    description:
      "Repeated failed SSH passwords for fictional user 'contractor' from 203.0.113.88, followed by an accepted login.",
    severity: "high",
    priority: "immediate",
    affectedAssets: ["contractor", "sshd", "rean-ir"],
  },
  {
    id: "ACCT-1",
    title: "Unexpected privilege elevation",
    description:
      "User 'contractor' is a member of the sudo group without documented authorization.",
    severity: "high",
    priority: "immediate",
    affectedAssets: ["contractor", "sudo"],
  },
  {
    id: "PROC-1",
    title: "Unusual simulated process",
    description:
      "Process 'sim-crypto-miner' (PID 44821) is running under contractor — fictional teaching indicator only.",
    severity: "critical",
    priority: "immediate",
    affectedAssets: ["contractor", "sim-crypto-miner"],
  },
  {
    id: "CFG-1",
    title: "Unauthorized nginx configuration change",
    description:
      "nginx reverse-proxy config includes an unexpected upstream pointing to 198.51.100.77:8080.",
    severity: "high",
    priority: "high",
    affectedAssets: ["nginx", "/etc/nginx/sites-enabled/app"],
  },
  {
    id: "NET-1",
    title: "Suspicious network connection record",
    description:
      "ESTABLISHED TCP session from rean-ir to 203.0.113.88:4444 attributed to sim-crypto-miner.",
    severity: "high",
    priority: "immediate",
    affectedAssets: ["network", "sim-crypto-miner"],
  },
  {
    id: "NET-2",
    title: "Unexpected listening port",
    description:
      "TCP port 31337 is listening on 0.0.0.0 — not part of the approved service inventory.",
    severity: "high",
    priority: "high",
    affectedAssets: ["network", "unknown-listener"],
  },
  {
    id: "FILE-1",
    title: "Suspicious file indicator",
    description:
      "File /tmp/.sim-dropper.sh exists with mode 0755 owned by contractor — fictional indicator, not real malware.",
    severity: "medium",
    priority: "high",
    affectedAssets: ["/tmp/.sim-dropper.sh", "contractor"],
  },
  {
    id: "PKG-1",
    title: "Fictional outdated package",
    description:
      "openssl 3.0.2-0ubuntu1.DEMO is installed; DEMO-IR-2026-014 recommends ≥ 3.0.2-0ubuntu1.DEMO2.",
    severity: "medium",
    priority: "medium",
    affectedAssets: ["openssl"],
  },
] as const;

export const IR_EVIDENCE_CATALOG: readonly SimulatedEvidenceItem[] = [
  {
    id: "E1",
    title: "SSH authentication failures and success",
    source: "journalctl -u ssh (simulated)",
    timestamp: "2026-11-13T02:14:08Z",
    category: "authentication",
    summary:
      "Failed password ×6 for contractor from 203.0.113.88, then Accepted password.",
    detail:
      "Nov 13 02:13:41 rean-ir sshd[2201]: Failed password for contractor from 203.0.113.88 port 52110 ssh2\nNov 13 02:14:08 rean-ir sshd[2201]: Accepted password for contractor from 203.0.113.88 port 52110 ssh2",
    integrityId: `${SIM_INTEGRITY_PREFIX}-E1-A91C`,
    relatedFinding: "AUTH-1",
  },
  {
    id: "E2",
    title: "Account privilege membership",
    source: "getent group sudo / id contractor (simulated)",
    timestamp: "2026-11-13T02:20:00Z",
    category: "system",
    summary: "contractor is listed in sudo group (unexpected).",
    detail:
      "sudo:x:27:root,bunsal,contractor\nid contractor → groups=...,27(sudo)",
    integrityId: `${SIM_INTEGRITY_PREFIX}-E2-B22F`,
    relatedFinding: "ACCT-1",
  },
  {
    id: "E3",
    title: "Unusual process listing",
    source: "ps aux (simulated)",
    timestamp: "2026-11-13T02:21:15Z",
    category: "system",
    summary: "sim-crypto-miner running as contractor (PID 44821).",
    detail:
      "contractor  44821  98.2  1.1  ...  sim-crypto-miner --pool demo.invalid",
    integrityId: `${SIM_INTEGRITY_PREFIX}-E3-C40A`,
    relatedFinding: "PROC-1",
  },
  {
    id: "E4",
    title: "nginx configuration drift",
    source: "cat /etc/nginx/sites-enabled/app (simulated)",
    timestamp: "2026-11-13T02:22:40Z",
    category: "configuration",
    summary: "Unexpected proxy_pass to 198.51.100.77:8080.",
    detail:
      "location /api/ {\n  proxy_pass http://198.51.100.77:8080;\n  # DEMO: unauthorized upstream — not present in known-good backup\n}",
    integrityId: `${SIM_INTEGRITY_PREFIX}-E4-D81E`,
    relatedFinding: "CFG-1",
  },
  {
    id: "E5",
    title: "Outbound connection record",
    source: "ss -tpn (simulated)",
    timestamp: "2026-11-13T02:23:05Z",
    category: "network",
    summary: "ESTAB to 203.0.113.88:4444 by sim-crypto-miner.",
    detail:
      'tcp ESTAB 0 0 10.0.0.42:49152 203.0.113.88:4444 users:(("sim-crypto-miner",pid=44821,fd=3))',
    integrityId: `${SIM_INTEGRITY_PREFIX}-E5-E19B`,
    relatedFinding: "NET-1",
  },
  {
    id: "E6",
    title: "Unexpected listening port",
    source: "ss -tuln (simulated)",
    timestamp: "2026-11-13T02:23:30Z",
    category: "network",
    summary: "0.0.0.0:31337 LISTEN",
    detail: "tcp LISTEN 0 128 0.0.0.0:31337 0.0.0.0:*",
    integrityId: `${SIM_INTEGRITY_PREFIX}-E6-F55D`,
    relatedFinding: "NET-2",
  },
  {
    id: "E7",
    title: "Suspicious file indicator",
    source: "ls -l /tmp/.sim-dropper.sh (simulated)",
    timestamp: "2026-11-13T02:24:10Z",
    category: "file",
    summary: "Executable dropper indicator owned by contractor.",
    detail:
      "-rwxr-xr-x 1 contractor contractor 412 Nov 13 02:14 /tmp/.sim-dropper.sh\n# DEMO: fictional indicator file — not a real malware sample",
    integrityId: `${SIM_INTEGRITY_PREFIX}-E7-G70C`,
    relatedFinding: "FILE-1",
  },
  {
    id: "E8",
    title: "Outdated package advisory",
    source: "apt show openssl (simulated)",
    timestamp: "2026-11-13T02:25:00Z",
    category: "package",
    summary: "openssl below DEMO-IR-2026-014 recommended version.",
    detail:
      "Package: openssl\nVersion: 3.0.2-0ubuntu1.DEMO\n# Advisory DEMO-IR-2026-014 (fictional teaching label)",
    integrityId: `${SIM_INTEGRITY_PREFIX}-E8-H33A`,
    relatedFinding: "PKG-1",
  },
  {
    id: "E9",
    title: "Known-good backup metadata",
    source: "ls /var/backups/ir-lab (simulated)",
    timestamp: "2026-11-12T23:00:00Z",
    category: "backup",
    summary: "Clean nightly backup available for educational restore drill.",
    detail:
      "nginx-sites-2026-11-12.tgz  integrity: SIM-HASH-BACKUP-OK\npasswd-shadow-refs-2026-11-12.meta  integrity: SIM-HASH-BACKUP-OK",
    integrityId: `${SIM_INTEGRITY_PREFIX}-E9-I44B`,
    relatedFinding: "CFG-1",
  },
] as const;

export const SECURITY_INCIDENT_RESPONSE_SCENARIOS: readonly SecurityIncidentResponseScenarioMeta[] =
  [
    {
      id: "explore",
      label: "Full incident lab",
      summary:
        "All fictional findings are present. Investigate, preserve evidence, contain, eradicate, and recover.",
    },
    {
      id: "suspicious-auth",
      label: "Suspicious Authentication Activity",
      summary:
        "Investigate SSH failures and a successful login for contractor from 203.0.113.88.",
    },
    {
      id: "compromised-account",
      label: "Potentially Compromised User Account",
      summary:
        "Assess unexpected sudo membership and decide on containment for contractor.",
    },
    {
      id: "unauthorized-config",
      label: "Unauthorized Service Configuration",
      summary:
        "Find the unauthorized nginx upstream and restore a known-good configuration.",
    },
    {
      id: "network-exposure",
      label: "Unexpected Network Exposure",
      summary:
        "Identify the suspicious connection and unexpected port 31337 listener.",
    },
    {
      id: "suspicious-file",
      label: "Suspicious File Indicator",
      summary:
        "Inspect the fictional /tmp/.sim-dropper.sh indicator and related process.",
    },
    {
      id: "service-recovery",
      label: "Service Disruption and Recovery",
      summary:
        "After containment: verify backup integrity, restore clean config, rotate credentials, and validate services.",
    },
    {
      id: "healthy",
      label: "Recovered baseline",
      summary: "All findings remediated — use to confirm a clean verification.",
    },
  ] as const;

const SCENARIO_IDS = new Set<string>(
  SECURITY_INCIDENT_RESPONSE_SCENARIOS.map((s) => s.id),
);

export function isSecurityIncidentResponseScenarioId(
  value: string,
): value is SecurityIncidentResponseScenarioId {
  return SCENARIO_IDS.has(value);
}

export function getSecurityIncidentResponseScenario(
  id: SecurityIncidentResponseScenarioId,
): SecurityIncidentResponseScenarioMeta {
  return (
    SECURITY_INCIDENT_RESPONSE_SCENARIOS.find((s) => s.id === id) ??
    SECURITY_INCIDENT_RESPONSE_SCENARIOS[0]!
  );
}

// ---------------------------------------------------------------------------
// State construction
// ---------------------------------------------------------------------------

function allOpenState(): SimulatedSecurityIncidentResponseState {
  return {
    scenarioId: "explore",
    suspiciousAuthPresent: true,
    contractorElevated: true,
    unusualProcessRunning: true,
    nginxConfigTampered: true,
    suspiciousConnPresent: true,
    unexpectedPortOpen: true,
    packageOutdated: true,
    backupAvailable: true,
    authInspected: false,
    accountInspected: false,
    processInspected: false,
    configInspected: false,
    networkInspected: false,
    fileInspected: false,
    packageInspected: false,
    backupInspected: false,
    evidencePreserved: false,
    evidencePreservedBeforeContainment: false,
    containmentStartedBeforeEvidence: false,
    accountDisabled: false,
    serviceIsolated: false,
    sourceBlocked: false,
    processStopped: false,
    portClosed: false,
    configRestored: false,
    backupIntegrityChecked: false,
    backupRestored: false,
    credentialsRotated: false,
    packageUpdated: false,
    servicesVerified: false,
    decisionNotes: [],
  };
}

function healthyState(): SimulatedSecurityIncidentResponseState {
  return {
    scenarioId: "healthy",
    suspiciousAuthPresent: true,
    contractorElevated: false,
    unusualProcessRunning: false,
    nginxConfigTampered: false,
    suspiciousConnPresent: false,
    unexpectedPortOpen: false,
    packageOutdated: false,
    backupAvailable: true,
    authInspected: true,
    accountInspected: true,
    processInspected: true,
    configInspected: true,
    networkInspected: true,
    fileInspected: true,
    packageInspected: true,
    backupInspected: true,
    evidencePreserved: true,
    evidencePreservedBeforeContainment: true,
    containmentStartedBeforeEvidence: false,
    accountDisabled: true,
    serviceIsolated: false,
    sourceBlocked: true,
    processStopped: true,
    portClosed: true,
    configRestored: true,
    backupIntegrityChecked: true,
    backupRestored: true,
    credentialsRotated: true,
    packageUpdated: true,
    servicesVerified: true,
    decisionNotes: [
      "Recovered baseline: evidence preserved before containment; services verified after recovery.",
    ],
  };
}

function scenarioState(
  id: SecurityIncidentResponseScenarioId,
): SimulatedSecurityIncidentResponseState {
  if (id === "healthy") {
    return healthyState();
  }
  const base = allOpenState();
  base.scenarioId = id;

  // Recovery drill assumes containment already happened — focus on restore + verify.
  if (id === "service-recovery") {
    return {
      ...base,
      evidencePreserved: true,
      evidencePreservedBeforeContainment: true,
      accountDisabled: true,
      contractorElevated: false,
      sourceBlocked: true,
      processStopped: true,
      unusualProcessRunning: false,
      suspiciousConnPresent: false,
      portClosed: true,
      unexpectedPortOpen: false,
      authInspected: true,
      accountInspected: true,
      processInspected: true,
      networkInspected: true,
      // Config still tampered until restore — recovery objective.
      nginxConfigTampered: true,
      decisionNotes: [
        "Containment already applied for this recovery drill (account disabled, source blocked, process stopped).",
      ],
    };
  }

  return base;
}

export function cloneSecurityIncidentResponseState(
  state: SimulatedSecurityIncidentResponseState,
): SimulatedSecurityIncidentResponseState {
  return {
    ...state,
    decisionNotes: [...state.decisionNotes],
  };
}

export function createInitialSecurityIncidentResponseState(
  scenarioId: SecurityIncidentResponseScenarioId = "explore",
): SimulatedSecurityIncidentResponseState {
  return cloneSecurityIncidentResponseState(scenarioState(scenarioId));
}

export function formatSecurityIncidentResponsePrompt(): string {
  return `${SIMULATED_IR_USER}@${SIMULATED_IR_HOST}:~$`;
}

function pushNote(
  state: SimulatedSecurityIncidentResponseState,
  note: string,
): SimulatedSecurityIncidentResponseState {
  if (state.decisionNotes.includes(note)) {
    return state;
  }
  return { ...state, decisionNotes: [...state.decisionNotes, note] };
}

function markContainmentStart(
  state: SimulatedSecurityIncidentResponseState,
): SimulatedSecurityIncidentResponseState {
  if (state.evidencePreserved) {
    return {
      ...state,
      evidencePreservedBeforeContainment: true,
    };
  }
  return pushNote(
    {
      ...state,
      containmentStartedBeforeEvidence: true,
    },
    "Containment began before evidence preservation — investigation quality may be reduced.",
  );
}

// ---------------------------------------------------------------------------
// Verification helpers (for lab / practice)
// ---------------------------------------------------------------------------

export function authInvestigated(
  state: SimulatedSecurityIncidentResponseState,
): boolean {
  return state.authInspected && state.suspiciousAuthPresent;
}

export function accountContained(
  state: SimulatedSecurityIncidentResponseState,
): boolean {
  return (
    state.accountInspected &&
    state.evidencePreserved &&
    state.accountDisabled &&
    !state.contractorElevated
  );
}

export function configEradicated(
  state: SimulatedSecurityIncidentResponseState,
): boolean {
  return (
    state.configInspected &&
    state.evidencePreserved &&
    state.configRestored &&
    !state.nginxConfigTampered
  );
}

export function networkContained(
  state: SimulatedSecurityIncidentResponseState,
): boolean {
  return (
    state.networkInspected &&
    state.evidencePreserved &&
    state.sourceBlocked &&
    state.portClosed &&
    !state.unexpectedPortOpen &&
    !state.suspiciousConnPresent
  );
}

export function suspiciousFileHandled(
  state: SimulatedSecurityIncidentResponseState,
): boolean {
  return (
    state.fileInspected &&
    state.processInspected &&
    state.evidencePreserved &&
    state.processStopped &&
    !state.unusualProcessRunning
  );
}

export function recoveryComplete(
  state: SimulatedSecurityIncidentResponseState,
): boolean {
  return (
    state.backupInspected &&
    state.backupIntegrityChecked &&
    state.backupRestored &&
    state.credentialsRotated &&
    state.servicesVerified &&
    !state.nginxConfigTampered
  );
}

export function evidenceFirstWorkflow(
  state: SimulatedSecurityIncidentResponseState,
): boolean {
  return (
    state.evidencePreserved &&
    state.evidencePreservedBeforeContainment &&
    !state.containmentStartedBeforeEvidence
  );
}

export function buildIncidentReport(
  state: SimulatedSecurityIncidentResponseState,
): IncidentReportSnapshot {
  const openFindings = IR_FINDINGS.filter((f) => {
    switch (f.id) {
      case "AUTH-1":
        return state.suspiciousAuthPresent && !state.accountDisabled;
      case "ACCT-1":
        return state.contractorElevated;
      case "PROC-1":
        return state.unusualProcessRunning;
      case "CFG-1":
        return state.nginxConfigTampered;
      case "NET-1":
        return state.suspiciousConnPresent;
      case "NET-2":
        return state.unexpectedPortOpen;
      case "FILE-1":
        return state.fileInspected
          ? state.unusualProcessRunning || !state.processStopped
          : true;
      case "PKG-1":
        return state.packageOutdated;
      default:
        return true;
    }
  });

  const maxSeverity: IncidentSeverity = openFindings.some(
    (f) => f.severity === "critical",
  )
    ? "critical"
    : openFindings.some((f) => f.severity === "high")
      ? "high"
      : openFindings.some((f) => f.severity === "medium")
        ? "medium"
        : "low";

  const timeline: { time: string; event: string }[] = [
    {
      time: "2026-11-13T02:13:41Z",
      event: "Alert: repeated SSH failures for contractor from 203.0.113.88",
    },
    {
      time: "2026-11-13T02:14:08Z",
      event: "Accepted password for contractor (simulated)",
    },
  ];
  if (state.authInspected) {
    timeline.push({
      time: "session",
      event: "Analyst inspected authentication logs",
    });
  }
  if (state.evidencePreserved) {
    timeline.push({
      time: "session",
      event: "Evidence preserved (SIM-HASH educational identifiers recorded)",
    });
  }
  if (state.accountDisabled) {
    timeline.push({
      time: "session",
      event: "Containment: contractor account disabled (simulated)",
    });
  }
  if (state.sourceBlocked) {
    timeline.push({
      time: "session",
      event: "Containment: blocked 203.0.113.88 (simulated)",
    });
  }
  if (state.processStopped) {
    timeline.push({
      time: "session",
      event: "Eradication: stopped sim-crypto-miner (simulated)",
    });
  }
  if (state.configRestored || state.backupRestored) {
    timeline.push({
      time: "session",
      event: "Recovery: restored known-good nginx configuration (simulated)",
    });
  }
  if (state.servicesVerified) {
    timeline.push({
      time: "session",
      event: "Verification: services and access controls checked (simulated)",
    });
  }

  const evidenceCollected: string[] = [];
  if (state.authInspected) evidenceCollected.push("E1 authentication logs");
  if (state.accountInspected) evidenceCollected.push("E2 account privileges");
  if (state.processInspected) evidenceCollected.push("E3 unusual process");
  if (state.configInspected) evidenceCollected.push("E4 nginx config");
  if (state.networkInspected)
    evidenceCollected.push("E5/E6 network exposure records");
  if (state.fileInspected) evidenceCollected.push("E7 suspicious file");
  if (state.packageInspected) evidenceCollected.push("E8 package advisory");
  if (state.backupInspected) evidenceCollected.push("E9 backup metadata");

  const containment: string[] = [];
  if (state.accountDisabled) containment.push("Disabled contractor account");
  if (state.serviceIsolated) containment.push("Isolated nginx service");
  if (state.sourceBlocked) containment.push("Blocked 203.0.113.88");
  if (state.portClosed) containment.push("Closed unexpected port 31337");
  if (state.processStopped) containment.push("Stopped unusual process");

  const recovery: string[] = [];
  if (state.configRestored) recovery.push("Restored nginx known-good config");
  if (state.backupIntegrityChecked)
    recovery.push("Checked backup integrity (SIM-HASH-BACKUP-OK)");
  if (state.backupRestored)
    recovery.push("Restored from simulated clean backup");
  if (state.credentialsRotated)
    recovery.push("Conceptually rotated contractor credentials");
  if (state.packageUpdated)
    recovery.push("Updated openssl (fictional advisory)");

  const verification: string[] = [];
  if (state.servicesVerified) {
    verification.push("Services and access controls validated after recovery");
  } else {
    verification.push(
      "Verification not completed — do not close the incident yet",
    );
  }

  const qualityNotes = [...state.decisionNotes];
  if (state.containmentStartedBeforeEvidence) {
    qualityNotes.push(
      "Lesson: preserve volatile evidence before changing system state when safe to do so.",
    );
  }
  if (state.backupRestored && !state.backupIntegrityChecked) {
    qualityNotes.push(
      "Restored backup without checking integrity — recovery decision is incomplete.",
    );
  }
  if (
    (state.accountDisabled ||
      state.sourceBlocked ||
      state.configRestored ||
      state.backupRestored) &&
    !state.servicesVerified
  ) {
    qualityNotes.push(
      "Incident should not be closed without validating affected services.",
    );
  }

  const fullyRecovered =
    !state.contractorElevated &&
    !state.unusualProcessRunning &&
    !state.nginxConfigTampered &&
    !state.unexpectedPortOpen &&
    !state.suspiciousConnPresent &&
    state.servicesVerified;

  return {
    title: "Suspected account compromise and service tampering on rean-ir",
    classification:
      "Security incident — unauthorized access / persistence indicators",
    severity: fullyRecovered ? "low" : maxSeverity,
    affectedAssets: [
      "rean-ir",
      "contractor",
      "sshd",
      "nginx",
      "openssl (advisory)",
    ],
    timeline,
    evidenceCollected:
      evidenceCollected.length > 0
        ? evidenceCollected
        : ["No evidence inspected yet"],
    containmentActions:
      containment.length > 0 ? containment : ["No containment actions yet"],
    eradicationRecovery:
      recovery.length > 0 ? recovery : ["No eradication/recovery actions yet"],
    verificationResults: verification,
    finalStatus: fullyRecovered
      ? "Contained and recovered — pending post-incident review"
      : openFindings.length > 0
        ? `Active — ${openFindings.length} finding(s) still open`
        : "Investigation in progress",
    lessonsLearned: [
      "Distinguish events, alerts, and confirmed incidents with confidence levels",
      "Preserve evidence before destructive containment when operationally safe",
      "Verify backup integrity before restore; validate services before closing",
      "Document timeline, decisions, and preventive recommendations",
    ],
    qualityNotes,
  };
}

// ---------------------------------------------------------------------------
// Command help
// ---------------------------------------------------------------------------

const HELP_OUTPUT = [
  "Incident response learning terminal (simulated — never touches the host).",
  "",
  "Inspect:",
  "  whoami / id [USER] / getent passwd|group [NAME]",
  "  journalctl -u ssh          Authentication evidence",
  "  ps aux                     Process listing",
  "  systemctl status nginx     Service status",
  "  cat /etc/nginx/sites-enabled/app",
  "  ss -tuln | ss -tpn         Listeners / connections",
  "  ls -l /tmp/.sim-dropper.sh Suspicious file indicator",
  "  apt list --upgradable | apt show openssl",
  "  ls -l /var/backups/ir-lab  Backup inventory",
  "  ir-status                  Summarize simulated IR state",
  "",
  "Evidence & response (lab helpers):",
  "  preserve-evidence          Record evidence before changing state",
  "  disable-account USER       Contain a compromised account",
  "  isolate-service UNIT       Isolate a simulated service",
  "  block-source IP            Block a fictional suspicious source",
  "  stop-process NAME          Stop unusual simulated process",
  "  close-port PORT            Close unexpected listener",
  "  restore-config nginx       Restore known-good nginx config",
  "  verify-backup              Check backup integrity (SIM-HASH)",
  "  restore-backup             Restore from simulated clean backup",
  "  rotate-credentials USER    Conceptual credential rotation",
  "  update-package openssl     Apply fictional package update",
  "  verify-services            Validate services after recovery",
  "  remove-sudo USER           Remove unexpected sudo membership",
  "",
  "All data is fictional. Integrity IDs are educational labels, not crypto proofs.",
] as const;

export const DEFAULT_SECURITY_INCIDENT_RESPONSE_SUGGESTIONS = [
  "help",
  "ir-status",
  "journalctl -u ssh",
  "id contractor",
  "ps aux",
  "ss -tuln",
  "preserve-evidence",
] as const;

// ---------------------------------------------------------------------------
// Command simulation
// ---------------------------------------------------------------------------

export function simulateSecurityIncidentResponseCommand(
  rawInput: string,
  state: SimulatedSecurityIncidentResponseState,
): SimulateSecurityIncidentResponseResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { result: { kind: "empty" }, state };
  }

  if (trimmed === "clear") {
    return { result: { kind: "clear" }, state };
  }

  const tokens = trimmed.split(/\s+/);
  const command = tokens[0]!.toLowerCase();
  let next = cloneSecurityIncidentResponseState(state);

  if (command === "help" || command === "?") {
    return { result: { kind: "output", lines: [...HELP_OUTPUT] }, state: next };
  }

  if (command === "whoami") {
    return {
      result: { kind: "output", lines: [SIMULATED_IR_USER] },
      state: next,
    };
  }

  if (command === "id") {
    const target = tokens[1] ?? SIMULATED_IR_USER;
    next = { ...next, accountInspected: true };
    if (target === "contractor") {
      const groups = next.contractorElevated
        ? "uid=1002(contractor) gid=1002(contractor) groups=1002(contractor),27(sudo)"
        : next.accountDisabled
          ? "uid=1002(contractor) gid=1002(contractor) groups=1002(contractor)  # account disabled (simulated)"
          : "uid=1002(contractor) gid=1002(contractor) groups=1002(contractor)";
      return { result: { kind: "output", lines: [groups] }, state: next };
    }
    if (target === SIMULATED_IR_USER || target === "bunsal") {
      return {
        result: {
          kind: "output",
          lines: [
            "uid=1000(bunsal) gid=1000(bunsal) groups=1000(bunsal),27(sudo)",
          ],
        },
        state: next,
      };
    }
    return {
      result: { kind: "output", lines: [`id: '${target}': no such user`] },
      state: next,
    };
  }

  if (command === "getent") {
    const db = tokens[1]?.toLowerCase();
    const name = tokens[2];
    next = { ...next, accountInspected: true };
    if (db === "passwd") {
      const users = [
        "root:x:0:0:root:/root:/bin/bash",
        "bunsal:x:1000:1000:Bunsal:/home/bunsal:/bin/bash",
        next.accountDisabled
          ? "contractor:x:1002:1002:Contractor:/home/contractor:/usr/sbin/nologin"
          : "contractor:x:1002:1002:Contractor:/home/contractor:/bin/bash",
        "www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin",
      ];
      if (name) {
        const line = users.find((u) => u.startsWith(`${name}:`));
        return {
          result: { kind: "output", lines: line ? [line] : [] },
          state: next,
        };
      }
      return { result: { kind: "output", lines: users }, state: next };
    }
    if (db === "group") {
      const sudoMembers = next.contractorElevated
        ? "root,bunsal,contractor"
        : "root,bunsal";
      const groups = [
        `sudo:x:27:${sudoMembers}`,
        "bunsal:x:1000:bunsal",
        "contractor:x:1002:contractor",
      ];
      if (name) {
        const line = groups.find((g) => g.startsWith(`${name}:`));
        return {
          result: { kind: "output", lines: line ? [line] : [] },
          state: next,
        };
      }
      return { result: { kind: "output", lines: groups }, state: next };
    }
    return {
      result: {
        kind: "output",
        lines: ["getent: unsupported database in this learning terminal"],
      },
      state: next,
    };
  }

  if (command === "journalctl") {
    next = { ...next, authInspected: true };
    if (!next.suspiciousAuthPresent) {
      return {
        result: {
          kind: "output",
          lines: [
            "-- No suspicious authentication entries in the current baseline --",
          ],
        },
        state: next,
      };
    }
    const lines = [
      "-- Logs begin at Thu 2026-11-12 00:00:01 UTC. --",
      "Nov 13 02:13:11 rean-ir sshd[2201]: Failed password for contractor from 203.0.113.88 port 52110 ssh2",
      "Nov 13 02:13:18 rean-ir sshd[2201]: Failed password for contractor from 203.0.113.88 port 52110 ssh2",
      "Nov 13 02:13:25 rean-ir sshd[2201]: Failed password for contractor from 203.0.113.88 port 52110 ssh2",
      "Nov 13 02:13:33 rean-ir sshd[2201]: Failed password for contractor from 203.0.113.88 port 52110 ssh2",
      "Nov 13 02:13:41 rean-ir sshd[2201]: Failed password for contractor from 203.0.113.88 port 52110 ssh2",
      "Nov 13 02:13:55 rean-ir sshd[2201]: Failed password for contractor from 203.0.113.88 port 52110 ssh2",
      "Nov 13 02:14:08 rean-ir sshd[2201]: Accepted password for contractor from 203.0.113.88 port 52110 ssh2",
      "Nov 13 02:14:09 rean-ir sshd[2201]: pam_unix(sshd:session): session opened for user contractor",
      "",
      "# DEMO: fictional log excerpt. Pattern warrants investigation — not automatic proof of compromise.",
    ];
    return { result: { kind: "output", lines }, state: next };
  }

  if (command === "ps") {
    next = { ...next, processInspected: true };
    const lines = [
      "USER         PID %CPU %MEM    COMMAND",
      "root           1  0.0  0.2    /sbin/init",
      "root         812  0.0  0.3    sshd: /usr/sbin/sshd -D",
      "www-data    1204  0.1  0.8    nginx: worker process",
      "bunsal      3011  0.0  0.4    -bash",
    ];
    if (next.unusualProcessRunning) {
      lines.push(
        "contractor  44821 98.2  1.1    sim-crypto-miner --pool demo.invalid",
      );
      lines.push(
        "# DEMO: sim-crypto-miner is a fictional process name — not real malware.",
      );
    }
    return { result: { kind: "output", lines }, state: next };
  }

  if (command === "systemctl") {
    const sub = tokens[1]?.toLowerCase();
    const unit = tokens[2]?.toLowerCase();
    if (sub === "status" && unit === "nginx") {
      next = { ...next, configInspected: true };
      const active = next.serviceIsolated
        ? "inactive (dead)"
        : "active (running)";
      return {
        result: {
          kind: "output",
          lines: [
            `● nginx.service - A high performance web server`,
            `     Loaded: loaded (/lib/systemd/system/nginx.service; enabled)`,
            `     Active: ${active}`,
            next.nginxConfigTampered
              ? "     Notice: DEMO config drift detected in sites-enabled/app"
              : "     Notice: configuration matches known-good baseline",
          ],
        },
        state: next,
      };
    }
    return {
      result: {
        kind: "output",
        lines: [
          "systemctl: try `systemctl status nginx` in this learning terminal",
        ],
      },
      state: next,
    };
  }

  if (command === "cat") {
    const path = tokens.slice(1).join(" ");
    if (
      path === "/etc/nginx/sites-enabled/app" ||
      path === "/etc/nginx/sites-enabled/default"
    ) {
      next = { ...next, configInspected: true };
      if (next.nginxConfigTampered) {
        return {
          result: {
            kind: "output",
            lines: [
              "server {",
              "  listen 80;",
              "  server_name app.rean-ir.demo;",
              "  location /api/ {",
              "    proxy_pass http://198.51.100.77:8080;",
              "    # DEMO: unauthorized upstream — not in known-good backup",
              "  }",
              "}",
            ],
          },
          state: next,
        };
      }
      return {
        result: {
          kind: "output",
          lines: [
            "server {",
            "  listen 80;",
            "  server_name app.rean-ir.demo;",
            "  location /api/ {",
            "    proxy_pass http://127.0.0.1:3000;",
            "  }",
            "}",
          ],
        },
        state: next,
      };
    }
    if (path === "/tmp/.sim-dropper.sh") {
      next = { ...next, fileInspected: true };
      return {
        result: {
          kind: "output",
          lines: [
            "#!/bin/sh",
            "# DEMO: fictional indicator script — NOT real malware",
            "# Educational placeholder content only",
            "echo sim-indicator",
          ],
        },
        state: next,
      };
    }
    return {
      result: {
        kind: "output",
        lines: [`cat: ${path || "(missing path)"}: No such file in this lab`],
      },
      state: next,
    };
  }

  if (command === "ss") {
    next = { ...next, networkInspected: true };
    const flags = tokens.slice(1).join(" ");
    const lines: string[] = [
      "Netid State  Recv-Q Send-Q Local Address:Port  Peer",
    ];
    lines.push("tcp   LISTEN 0      128    0.0.0.0:22           0.0.0.0:*");
    lines.push("tcp   LISTEN 0      128    0.0.0.0:80           0.0.0.0:*");
    if (next.unexpectedPortOpen) {
      lines.push("tcp   LISTEN 0      128    0.0.0.0:31337        0.0.0.0:*");
    }
    if (
      next.suspiciousConnPresent &&
      (flags.includes("p") || flags.includes("tpn") || flags.includes("-tp"))
    ) {
      lines.push(
        'tcp   ESTAB  0      0      10.0.0.42:49152     203.0.113.88:4444 users:(("sim-crypto-miner",pid=44821,fd=3))',
      );
    } else if (next.suspiciousConnPresent && flags.includes("t")) {
      lines.push(
        "tcp   ESTAB  0      0      10.0.0.42:49152     203.0.113.88:4444",
      );
    }
    lines.push("# DEMO: fictional addresses (RFC 5737 documentation range).");
    return { result: { kind: "output", lines }, state: next };
  }

  if (command === "ls") {
    const path = tokens
      .filter((t) => !t.startsWith("-"))
      .slice(1)
      .join(" ");
    if (path.includes("/tmp/.sim-dropper.sh") || path === "/tmp") {
      next = { ...next, fileInspected: true };
      if (path === "/tmp") {
        return {
          result: {
            kind: "output",
            lines: next.unusualProcessRunning
              ? [".sim-dropper.sh", "systemd-private-demo"]
              : ["systemd-private-demo"],
          },
          state: next,
        };
      }
      return {
        result: {
          kind: "output",
          lines: [
            "-rwxr-xr-x 1 contractor contractor 412 Nov 13 02:14 /tmp/.sim-dropper.sh",
            "# DEMO: fictional indicator — not a real malware sample",
          ],
        },
        state: next,
      };
    }
    if (path.includes("/var/backups")) {
      next = { ...next, backupInspected: true };
      if (!next.backupAvailable) {
        return {
          result: {
            kind: "output",
            lines: ["ls: cannot access '/var/backups/ir-lab': No such file"],
          },
          state: next,
        };
      }
      return {
        result: {
          kind: "output",
          lines: [
            "total 8",
            "-rw-r----- 1 root root 2048 Nov 12 23:00 nginx-sites-2026-11-12.tgz",
            "-rw-r----- 1 root root  512 Nov 12 23:00 passwd-shadow-refs-2026-11-12.meta",
            "# integrity label: SIM-HASH-BACKUP-OK (educational — not real crypto)",
          ],
        },
        state: next,
      };
    }
    return {
      result: {
        kind: "output",
        lines: [
          "ls: path not in this IR lab. Try /tmp/.sim-dropper.sh or /var/backups/ir-lab",
        ],
      },
      state: next,
    };
  }

  if (command === "apt") {
    const sub = tokens[1]?.toLowerCase();
    next = { ...next, packageInspected: true };
    if (sub === "list" && tokens.includes("--upgradable")) {
      return {
        result: {
          kind: "output",
          lines: next.packageOutdated
            ? [
                "Listing... Done",
                "openssl/demo 3.0.2-0ubuntu1.DEMO2 [upgradable from: 3.0.2-0ubuntu1.DEMO]",
                "# Advisory DEMO-IR-2026-014 is a fictional teaching label",
              ]
            : ["Listing... Done"],
        },
        state: next,
      };
    }
    if (sub === "show" && tokens[2] === "openssl") {
      return {
        result: {
          kind: "output",
          lines: [
            "Package: openssl",
            `Version: ${next.packageOutdated ? "3.0.2-0ubuntu1.DEMO" : "3.0.2-0ubuntu1.DEMO2"}`,
            "Priority: important",
            "# DEMO package metadata only",
          ],
        },
        state: next,
      };
    }
    return {
      result: {
        kind: "output",
        lines: ["apt: try `apt list --upgradable` or `apt show openssl`"],
      },
      state: next,
    };
  }

  if (command === "ir-status") {
    const lines = [
      "=== Simulated incident response status ===",
      `Host: ${SIMULATED_IR_HOST} (fictional)`,
      `Evidence preserved: ${next.evidencePreserved ? "yes" : "no"}`,
      `Auth inspected: ${next.authInspected ? "yes" : "no"}`,
      `Account disabled: ${next.accountDisabled ? "yes" : "no"}`,
      `Contractor in sudo: ${next.contractorElevated ? "yes" : "no"}`,
      `Unusual process: ${next.unusualProcessRunning ? "running" : "stopped"}`,
      `nginx config tampered: ${next.nginxConfigTampered ? "yes" : "no"}`,
      `Source 203.0.113.88 blocked: ${next.sourceBlocked ? "yes" : "no"}`,
      `Port 31337 open: ${next.unexpectedPortOpen ? "yes" : "no"}`,
      `Backup integrity checked: ${next.backupIntegrityChecked ? "yes" : "no"}`,
      `Backup restored: ${next.backupRestored ? "yes" : "no"}`,
      `Credentials rotated: ${next.credentialsRotated ? "yes" : "no"}`,
      `Services verified: ${next.servicesVerified ? "yes" : "no"}`,
      next.containmentStartedBeforeEvidence
        ? "Note: containment started before evidence preservation"
        : "Note: evidence-first workflow intact or not yet started",
    ];
    return { result: { kind: "output", lines }, state: next };
  }

  // ---- Response actions ----

  if (command === "preserve-evidence") {
    if (next.evidencePreserved) {
      return {
        result: {
          kind: "output",
          lines: [
            "Evidence already preserved for this session.",
            `Labels: ${SIM_INTEGRITY_PREFIX}-E1…E9 (educational simulation identifiers).`,
          ],
        },
        state: next,
      };
    }
    next = {
      ...next,
      evidencePreserved: true,
      evidencePreservedBeforeContainment:
        !next.containmentStartedBeforeEvidence,
    };
    next = pushNote(
      next,
      "Evidence preserved before further remediation (recommended when safe).",
    );
    return {
      result: {
        kind: "output",
        lines: [
          "Simulated evidence package recorded for this session.",
          "Sources: auth logs, account membership, process list, nginx config,",
          "         network sockets, file indicator, package metadata, backup refs.",
          `Integrity labels: ${SIM_INTEGRITY_PREFIX}-* (educational — not real cryptography).`,
          "Preserve evidence before changing system state when operationally safe.",
        ],
      },
      state: next,
    };
  }

  if (command === "disable-account") {
    const user = tokens[1];
    if (user !== "contractor") {
      return {
        result: {
          kind: "output",
          lines: [
            "disable-account: only fictional user 'contractor' is in scope for this lab",
          ],
        },
        state: next,
      };
    }
    next = markContainmentStart(next);
    next = {
      ...next,
      accountDisabled: true,
      accountInspected: true,
    };
    next = pushNote(
      next,
      "Containment: disabled contractor account (appropriate for suspected compromise).",
    );
    return {
      result: {
        kind: "output",
        lines: [
          "Simulated: account 'contractor' locked / shell set to nologin.",
          "Trade-off: stops further interactive access; may disrupt contractor workflows.",
          next.evidencePreserved
            ? "Evidence was preserved beforehand — good practice."
            : "Warning: evidence was not preserved first — volatile clues may be weaker.",
        ],
      },
      state: next,
    };
  }

  if (command === "remove-sudo") {
    const user = tokens[1];
    if (user !== "contractor") {
      return {
        result: {
          kind: "output",
          lines: ["remove-sudo: only 'contractor' is supported in this lab"],
        },
        state: next,
      };
    }
    next = markContainmentStart(next);
    next = {
      ...next,
      contractorElevated: false,
      accountInspected: true,
    };
    next = pushNote(
      next,
      "Eradication: removed unexpected sudo membership for contractor.",
    );
    return {
      result: {
        kind: "output",
        lines: [
          "Simulated: removed contractor from sudo group.",
          "Verify with: getent group sudo / id contractor",
        ],
      },
      state: next,
    };
  }

  if (command === "isolate-service") {
    const unit = tokens[1]?.toLowerCase();
    if (unit !== "nginx") {
      return {
        result: {
          kind: "output",
          lines: [
            "isolate-service: only 'nginx' is supported in this educational lab",
          ],
        },
        state: next,
      };
    }
    next = markContainmentStart(next);
    next = { ...next, serviceIsolated: true, configInspected: true };
    next = pushNote(
      next,
      "Containment: isolated nginx — reduces exposure but causes service disruption.",
    );
    return {
      result: {
        kind: "output",
        lines: [
          "Simulated: nginx isolated (stopped / removed from traffic).",
          "Trade-off: contains unauthorized proxy risk but impacts availability (CIA).",
          "Prefer evidence preservation and scoped fixes when possible.",
        ],
      },
      state: next,
    };
  }

  if (command === "block-source") {
    const ip = tokens[1];
    if (ip !== "203.0.113.88") {
      return {
        result: {
          kind: "output",
          lines: [
            "block-source: use fictional IP 203.0.113.88 in this lab (RFC 5737).",
          ],
        },
        state: next,
      };
    }
    next = markContainmentStart(next);
    next = {
      ...next,
      sourceBlocked: true,
      networkInspected: true,
      suspiciousConnPresent: false,
    };
    next = pushNote(
      next,
      "Containment: blocked suspicious source 203.0.113.88 (simulated firewall rule).",
    );
    return {
      result: {
        kind: "output",
        lines: [
          "Simulated firewall rule: DENY from 203.0.113.88.",
          "Connection record cleared from active table (demo).",
          "Never run real firewall changes from this learning app.",
        ],
      },
      state: next,
    };
  }

  if (command === "stop-process") {
    const name = tokens[1];
    if (name !== "sim-crypto-miner" && name !== "44821") {
      return {
        result: {
          kind: "output",
          lines: [
            "stop-process: use 'sim-crypto-miner' (fictional process) in this lab",
          ],
        },
        state: next,
      };
    }
    next = markContainmentStart(next);
    next = {
      ...next,
      processStopped: true,
      unusualProcessRunning: false,
      processInspected: true,
      suspiciousConnPresent: false,
    };
    next = pushNote(
      next,
      "Containment/eradication: stopped fictional unusual process sim-crypto-miner.",
    );
    return {
      result: {
        kind: "output",
        lines: [
          "Simulated: process sim-crypto-miner (PID 44821) terminated.",
          "Preserve memory/process evidence first in real IR when forensics matter.",
          "# DEMO process only — no real malware was executed.",
        ],
      },
      state: next,
    };
  }

  if (command === "close-port") {
    const port = tokens[1];
    if (port !== "31337") {
      return {
        result: {
          kind: "output",
          lines: ["close-port: unexpected lab port is 31337"],
        },
        state: next,
      };
    }
    next = markContainmentStart(next);
    next = {
      ...next,
      portClosed: true,
      unexpectedPortOpen: false,
      networkInspected: true,
    };
    next = pushNote(
      next,
      "Containment: closed unexpected listener on port 31337.",
    );
    return {
      result: {
        kind: "output",
        lines: [
          "Simulated: listener on 0.0.0.0:31337 closed / blocked.",
          "Re-check with: ss -tuln",
        ],
      },
      state: next,
    };
  }

  if (command === "restore-config") {
    const target = tokens[1]?.toLowerCase();
    if (target !== "nginx") {
      return {
        result: {
          kind: "output",
          lines: ["restore-config: use `restore-config nginx`"],
        },
        state: next,
      };
    }
    if (!next.evidencePreserved) {
      next = pushNote(
        next,
        "Config restored without prior evidence preservation — weaker investigation record.",
      );
    }
    next = {
      ...next,
      configRestored: true,
      nginxConfigTampered: false,
      configInspected: true,
    };
    next = pushNote(
      next,
      "Eradication: restored known-good nginx configuration.",
    );
    return {
      result: {
        kind: "output",
        lines: [
          "Simulated: nginx sites-enabled/app restored to known-good upstream 127.0.0.1:3000.",
          next.evidencePreserved
            ? "Tampered config was recorded in the evidence package."
            : "Warning: consider preserve-evidence before overwriting configs next time.",
        ],
      },
      state: next,
    };
  }

  if (command === "verify-backup") {
    next = {
      ...next,
      backupInspected: true,
      backupIntegrityChecked: true,
    };
    next = pushNote(
      next,
      "Checked simulated backup integrity label SIM-HASH-BACKUP-OK.",
    );
    return {
      result: {
        kind: "output",
        lines: [
          "Simulated backup integrity check:",
          "  nginx-sites-2026-11-12.tgz → SIM-HASH-BACKUP-OK",
          "  passwd-shadow-refs-2026-11-12.meta → SIM-HASH-BACKUP-OK",
          "Educational label only — not a real cryptographic verification.",
        ],
      },
      state: next,
    };
  }

  if (command === "restore-backup") {
    if (!next.backupIntegrityChecked) {
      next = pushNote(
        next,
        "Restored backup without verifying integrity — incomplete recovery decision.",
      );
    }
    next = {
      ...next,
      backupRestored: true,
      backupInspected: true,
      nginxConfigTampered: false,
      configRestored: true,
      unusualProcessRunning: false,
      processStopped: true,
      unexpectedPortOpen: false,
      portClosed: true,
      suspiciousConnPresent: false,
    };
    next = pushNote(next, "Recovery: restored from simulated clean backup.");
    return {
      result: {
        kind: "output",
        lines: [
          "Simulated restore from /var/backups/ir-lab completed.",
          next.backupIntegrityChecked
            ? "Integrity was checked beforehand — good practice."
            : "Warning: integrity was not checked first (verify-backup).",
          "Still rotate credentials and verify-services before closing the incident.",
        ],
      },
      state: next,
    };
  }

  if (command === "rotate-credentials") {
    const user = tokens[1];
    if (user !== "contractor") {
      return {
        result: {
          kind: "output",
          lines: [
            "rotate-credentials: lab supports conceptual rotation for 'contractor'",
          ],
        },
        state: next,
      };
    }
    next = { ...next, credentialsRotated: true, accountInspected: true };
    next = pushNote(
      next,
      "Recovery: conceptually rotated contractor credentials (no real secrets touched).",
    );
    return {
      result: {
        kind: "output",
        lines: [
          "Simulated: contractor credentials marked rotated / sessions invalidated.",
          "No real passwords, keys, or tokens were changed on your machine.",
        ],
      },
      state: next,
    };
  }

  if (command === "update-package") {
    const pkg = tokens[1];
    if (pkg !== "openssl") {
      return {
        result: {
          kind: "output",
          lines: ["update-package: lab supports `update-package openssl`"],
        },
        state: next,
      };
    }
    next = {
      ...next,
      packageUpdated: true,
      packageOutdated: false,
      packageInspected: true,
    };
    return {
      result: {
        kind: "output",
        lines: [
          "Simulated: openssl upgraded to 3.0.2-0ubuntu1.DEMO2",
          "Advisory DEMO-IR-2026-014 is a fictional teaching label.",
        ],
      },
      state: next,
    };
  }

  if (command === "verify-services") {
    const issues: string[] = [];
    if (next.nginxConfigTampered) issues.push("nginx config still tampered");
    if (next.unusualProcessRunning)
      issues.push("unusual process still running");
    if (next.unexpectedPortOpen) issues.push("port 31337 still open");
    if (next.contractorElevated && !next.accountDisabled) {
      issues.push("contractor still has sudo and is not disabled");
    }
    next = { ...next, servicesVerified: issues.length === 0 };
    if (issues.length === 0) {
      next = pushNote(
        next,
        "Verification passed: services and access controls look clean in simulation.",
      );
      return {
        result: {
          kind: "output",
          lines: [
            "Verification OK (simulated):",
            "  nginx config: known-good",
            "  listeners: 22, 80 only",
            "  no unusual process",
            "  account controls consistent with containment choices",
            "Safe to draft the incident report and lessons learned.",
          ],
        },
        state: next,
      };
    }
    next = pushNote(
      next,
      "Verification failed — do not close the incident yet.",
    );
    return {
      result: {
        kind: "output",
        lines: [
          "Verification FAILED (simulated):",
          ...issues.map((i) => `  - ${i}`),
          "Continue containment/eradication, then re-run verify-services.",
        ],
      },
      state: next,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [
        `Command not available in this incident-response learning terminal: ${trimmed}`,
        'Try "help" to see available commands.',
      ],
    },
    state: next,
  };
}
