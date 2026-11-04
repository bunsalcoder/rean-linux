/**
 * Frontend-only security auditing simulation for Stage 04 Lesson 08.
 * Never executes real shell commands, never inspects the host system,
 * never scans networks, never touches real configs/logs/packages.
 * All users, groups, files, services, packages, and log entries are
 * fictional teaching data held entirely in memory.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_AUDIT_USER = "bunsal";
export const SIMULATED_AUDIT_HOST = "rean-audit";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuditSeverity =
  "critical" | "high" | "medium" | "low" | "informational";

export type AuditRemediationStatus =
  "open" | "in-progress" | "remediated" | "accepted-risk" | "verified";

export type AuditCategoryId =
  | "account-security"
  | "permissions-ownership"
  | "privilege-management"
  | "ssh-configuration"
  | "firewall-network"
  | "services-processes"
  | "package-security"
  | "logs-authentication"
  | "storage-backup";

export type AuditFinding = {
  id: string;
  category: AuditCategoryId;
  title: string;
  description: string;
  evidence: readonly string[];
  severity: AuditSeverity;
  potentialImpact: string;
  recommendation: string;
  remediationOwner: string;
  verificationCriteria: string;
  remediationStatus: AuditRemediationStatus;
  /** Operational priority can differ from severity */
  priority: "immediate" | "high" | "medium" | "low";
};

export type SecurityAuditingScenarioId =
  | "explore"
  | "account-admin-group"
  | "sensitive-file-perms"
  | "excessive-sudo"
  | "ssh-misconfig"
  | "network-exposure"
  | "vulnerable-package"
  | "auth-activity"
  | "backup-readiness"
  | "healthy";

export type SimulatedSecurityAuditingState = {
  scenarioId: SecurityAuditingScenarioId;
  /** Finding A: contractor is in sudo group */
  contractorInSudo: boolean;
  /** Finding B: /srv/app/secrets.env is world-readable */
  secretsWorldReadable: boolean;
  /** Finding C: deploy has NOPASSWD ALL */
  deploySudoNopasswdAll: boolean;
  /** Finding D: sshd allows password auth + root login */
  sshPasswordAuth: boolean;
  sshPermitRootLogin: boolean;
  /** Finding E: postgresql listening on 0.0.0.0:5432, ufw allows 5432 */
  postgresPublicBind: boolean;
  ufwAllows5432: boolean;
  /** Finding F: openssh-server outdated */
  opensshOutdated: boolean;
  /** Finding G: auth log shows suspicious activity (inspection-only) */
  authActivityPresent: boolean;
  authActivityInspected: boolean;
  /** Finding H: backup restore not verified */
  backupRestoreVerified: boolean;
};

export type SecurityAuditingScenarioMeta = {
  id: SecurityAuditingScenarioId;
  label: string;
  summary: string;
};

export type SimulateSecurityAuditingResult = {
  result: SimulateResult;
  state: SimulatedSecurityAuditingState;
};

// ---------------------------------------------------------------------------
// Findings catalog
// ---------------------------------------------------------------------------

export const AUDIT_FINDINGS: readonly AuditFinding[] = [
  {
    id: "A",
    category: "account-security",
    title: "Unauthorized user in sudo group",
    description:
      "User 'contractor' (UID 1002) is a member of the sudo group, granting full administrative privileges. Contractor accounts should follow least-privilege principles.",
    evidence: [
      "getent group sudo → root,bunsal,contractor",
      "id contractor → uid=1002(contractor) gid=1002(contractor) groups=1002(contractor),27(sudo)",
    ],
    severity: "high",
    potentialImpact:
      "Compromised contractor credentials grant unrestricted root access to the entire system.",
    recommendation:
      "Remove contractor from the sudo group: sudo gpasswd -d contractor sudo",
    remediationOwner: "System administrator",
    verificationCriteria:
      "getent group sudo no longer lists contractor; id contractor shows no sudo membership.",
    remediationStatus: "open",
    priority: "immediate",
  },
  {
    id: "B",
    category: "permissions-ownership",
    title: "Sensitive secrets file world-readable",
    description:
      "/srv/app/secrets.env has mode 0644 and an ACL granting other:r, exposing application secrets to all local users.",
    evidence: [
      "ls -l /srv/app/secrets.env → -rw-r--r-- 1 www-data www-data 512 Oct 20 09:00 /srv/app/secrets.env",
      "getfacl /srv/app/secrets.env → other::r--",
    ],
    severity: "critical",
    potentialImpact:
      "Any local user can read database credentials, API keys, and other secrets stored in this file.",
    recommendation:
      "Restrict to owner-only: chmod 600 /srv/app/secrets.env && setfacl -b /srv/app/secrets.env",
    remediationOwner: "Application team",
    verificationCriteria:
      "ls -l shows -rw------- and getfacl shows no extended ACL entries.",
    remediationStatus: "open",
    priority: "immediate",
  },
  {
    id: "C",
    category: "privilege-management",
    title: "Excessive sudo privileges for deploy user",
    description:
      "User 'deploy' has sudoers entry: deploy ALL=(ALL) NOPASSWD: ALL — granting unrestricted passwordless root access.",
    evidence: [
      "sudo -l -U deploy → (ALL) NOPASSWD: ALL",
      "/etc/sudoers.d/deploy contains: deploy ALL=(ALL) NOPASSWD: ALL",
    ],
    severity: "high",
    potentialImpact:
      "Compromised deploy credentials allow silent, passwordless execution of any command as root.",
    recommendation:
      "Restrict deploy to specific deployment commands only (set-sudo-rule deploy).",
    remediationOwner: "System administrator",
    verificationCriteria:
      "sudo -l -U deploy shows only specific allowed commands, not ALL.",
    remediationStatus: "open",
    priority: "high",
  },
  {
    id: "D",
    category: "ssh-configuration",
    title: "SSH allows password authentication and root login",
    description:
      "sshd_config has PasswordAuthentication yes and PermitRootLogin yes, increasing brute-force and credential-stuffing risk.",
    evidence: [
      "sshd -T | grep passwordauthentication → passwordauthentication yes",
      "sshd -T | grep permitrootlogin → permitrootlogin yes",
    ],
    severity: "high",
    potentialImpact:
      "Attackers can brute-force passwords remotely and directly target the root account via SSH.",
    recommendation:
      "Set PasswordAuthentication no and PermitRootLogin no (or prohibit-password) via set-ssh commands.",
    remediationOwner: "System administrator",
    verificationCriteria:
      "sshd -T shows passwordauthentication no and permitrootlogin no.",
    remediationStatus: "open",
    priority: "high",
  },
  {
    id: "E",
    category: "firewall-network",
    title: "PostgreSQL exposed on all interfaces",
    description:
      "PostgreSQL is listening on 0.0.0.0:5432 and UFW allows inbound 5432/tcp, exposing the database to the network.",
    evidence: [
      "ss -tuln | grep 5432 → tcp LISTEN 0.0.0.0:5432",
      "ufw status → 5432/tcp ALLOW Anywhere",
    ],
    severity: "critical",
    potentialImpact:
      "External attackers can attempt to connect to PostgreSQL, brute-force credentials, or exploit database vulnerabilities.",
    recommendation:
      "Bind PostgreSQL to localhost only (bind-postgres localhost) and deny inbound 5432 (ufw deny 5432/tcp).",
    remediationOwner: "Database / system administrator",
    verificationCriteria:
      "ss -tuln shows 127.0.0.1:5432 only; ufw status shows 5432/tcp denied or absent.",
    remediationStatus: "open",
    priority: "immediate",
  },
  {
    id: "F",
    category: "package-security",
    title: "Outdated openssh-server with known advisory",
    description:
      "openssh-server 1:9.6p1-3ubuntu13.4 is installed; DEMO-AUDIT-2026-001 advisory recommends ≥1:9.6p1-3ubuntu13.6.",
    evidence: [
      "apt list --upgradable → openssh-server upgradable to 1:9.6p1-3ubuntu13.6",
      "apt show openssh-server → Version: 1:9.6p1-3ubuntu13.4",
    ],
    severity: "critical",
    potentialImpact:
      "Known remote code execution vulnerability in the SSH daemon; exploit code is publicly available.",
    recommendation: "Upgrade openssh-server: sudo apt install openssh-server",
    remediationOwner: "System administrator",
    verificationCriteria:
      "apt show openssh-server shows version ≥1:9.6p1-3ubuntu13.6.",
    remediationStatus: "open",
    priority: "immediate",
  },
  {
    id: "G",
    category: "logs-authentication",
    title: "Suspicious authentication activity for contractor account",
    description:
      "Auth logs show repeated failed password attempts for 'contractor' from 203.0.113.50 followed by a successful login. Investigation is warranted — this may indicate credential compromise.",
    evidence: [
      "journalctl -u ssh → multiple 'Failed password for contractor from 203.0.113.50'",
      "journalctl -u ssh → 'Accepted password for contractor from 203.0.113.50'",
    ],
    severity: "high",
    potentialImpact:
      "If the contractor password was compromised, the attacker gained shell access. Combined with finding A (sudo membership), this could mean full root access.",
    recommendation:
      "Investigate the successful login, review contractor session activity, rotate credentials, and address finding A (remove sudo).",
    remediationOwner: "Security / incident response team",
    verificationCriteria:
      "Auth logs reviewed and documented; contractor account privileges restricted as part of finding A.",
    remediationStatus: "open",
    priority: "immediate",
  },
  {
    id: "H",
    category: "storage-backup",
    title: "Backup restore never verified",
    description:
      "Daily backups exist in /var/backups/daily, but restore testing has never been performed. Untested backups may be unusable when needed.",
    evidence: [
      "df -h /var/backups → backup partition exists with data",
      "Backup metadata shows lastBackupAt is recent but restoreTestVerified is false",
    ],
    severity: "medium",
    potentialImpact:
      "In a disaster recovery scenario, backups may be corrupt, incomplete, or incompatible — discovered only when recovery is urgently needed.",
    recommendation:
      "Perform a test restore and mark verified: mark-restore-tested",
    remediationOwner: "System administrator / backup operator",
    verificationCriteria:
      "mark-restore-tested has been run; backup metadata shows restoreTestVerified true.",
    remediationStatus: "open",
    priority: "medium",
  },
] as const;

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

export const SECURITY_AUDITING_SCENARIOS: readonly SecurityAuditingScenarioMeta[] =
  [
    {
      id: "explore",
      label: "Full baseline audit",
      summary:
        "All findings are present. Explore the fictional host, gather evidence, and review every audit category.",
    },
    {
      id: "account-admin-group",
      label: "A — Account security",
      summary:
        "Identify and remediate the unauthorized contractor in the sudo group.",
    },
    {
      id: "sensitive-file-perms",
      label: "B — Sensitive file permissions",
      summary: "Find and harden the world-readable secrets file.",
    },
    {
      id: "excessive-sudo",
      label: "C — Excessive sudo privileges",
      summary: "Restrict the deploy user's unrestricted NOPASSWD ALL entry.",
    },
    {
      id: "ssh-misconfig",
      label: "D — SSH misconfiguration",
      summary: "Disable SSH password authentication and root login.",
    },
    {
      id: "network-exposure",
      label: "E — Network exposure",
      summary: "Stop PostgreSQL from listening publicly and deny inbound 5432.",
    },
    {
      id: "vulnerable-package",
      label: "F — Vulnerable package",
      summary: "Upgrade the outdated openssh-server package.",
    },
    {
      id: "auth-activity",
      label: "G — Authentication activity",
      summary:
        "Investigate suspicious login patterns in the auth logs (inspection only).",
    },
    {
      id: "backup-readiness",
      label: "H — Backup readiness",
      summary: "Verify that backup restores actually work.",
    },
    {
      id: "healthy",
      label: "Remediated baseline",
      summary: "All findings resolved. Use to confirm a clean recheck.",
    },
  ] as const;

const SCENARIO_IDS = new Set<string>(
  SECURITY_AUDITING_SCENARIOS.map((s) => s.id),
);

export function isSecurityAuditingScenarioId(
  value: string,
): value is SecurityAuditingScenarioId {
  return SCENARIO_IDS.has(value);
}

export function getSecurityAuditingScenario(
  id: SecurityAuditingScenarioId,
): SecurityAuditingScenarioMeta {
  return (
    SECURITY_AUDITING_SCENARIOS.find((s) => s.id === id) ??
    SECURITY_AUDITING_SCENARIOS[0]!
  );
}

// ---------------------------------------------------------------------------
// State construction
// ---------------------------------------------------------------------------

function allOpenState(): SimulatedSecurityAuditingState {
  return {
    scenarioId: "explore",
    contractorInSudo: true,
    secretsWorldReadable: true,
    deploySudoNopasswdAll: true,
    sshPasswordAuth: true,
    sshPermitRootLogin: true,
    postgresPublicBind: true,
    ufwAllows5432: true,
    opensshOutdated: true,
    authActivityPresent: true,
    authActivityInspected: false,
    backupRestoreVerified: false,
  };
}

function healthyState(): SimulatedSecurityAuditingState {
  return {
    scenarioId: "healthy",
    contractorInSudo: false,
    secretsWorldReadable: false,
    deploySudoNopasswdAll: false,
    sshPasswordAuth: false,
    sshPermitRootLogin: false,
    postgresPublicBind: false,
    ufwAllows5432: false,
    opensshOutdated: false,
    authActivityPresent: true,
    authActivityInspected: true,
    backupRestoreVerified: true,
  };
}

function scenarioState(
  id: SecurityAuditingScenarioId,
): SimulatedSecurityAuditingState {
  const base = allOpenState();
  base.scenarioId = id;

  switch (id) {
    case "explore":
      return base;

    case "account-admin-group":
      return base;

    case "sensitive-file-perms":
      return base;

    case "excessive-sudo":
      return base;

    case "ssh-misconfig":
      return base;

    case "network-exposure":
      return base;

    case "vulnerable-package":
      return base;

    case "auth-activity":
      return base;

    case "backup-readiness":
      return base;

    case "healthy":
      return healthyState();

    default:
      return base;
  }
}

export function cloneSecurityAuditingState(
  state: SimulatedSecurityAuditingState,
): SimulatedSecurityAuditingState {
  return { ...state };
}

export function createInitialSecurityAuditingState(
  scenarioId: SecurityAuditingScenarioId = "explore",
): SimulatedSecurityAuditingState {
  return cloneSecurityAuditingState(scenarioState(scenarioId));
}

export function formatSecurityAuditingPrompt(): string {
  return `${SIMULATED_AUDIT_USER}@${SIMULATED_AUDIT_HOST}:~$`;
}

// ---------------------------------------------------------------------------
// Scoring helper (teaching aid, not an authoritative standard)
// ---------------------------------------------------------------------------

/**
 * Simple deterministic scoring helper for teaching purposes.
 * Weights: critical=5, high=4, medium=3, low=2, informational=1.
 * Score = 100 - sum(weights of open findings).
 * This is a TEACHING AID to illustrate relative posture improvement.
 * It is NOT an authoritative security scoring standard like CVSS,
 * NIST, or CIS benchmarks.
 */
export function computeAuditScore(state: SimulatedSecurityAuditingState): {
  score: number;
  maxScore: number;
  openWeight: number;
} {
  const WEIGHT: Record<AuditSeverity, number> = {
    critical: 5,
    high: 4,
    medium: 3,
    low: 2,
    informational: 1,
  };

  const openFindings = getOpenFindings(state);
  const openWeight = openFindings.reduce(
    (sum, f) => sum + WEIGHT[f.severity],
    0,
  );
  const totalWeight = AUDIT_FINDINGS.reduce(
    (sum, f) => sum + WEIGHT[f.severity],
    0,
  );
  const score = Math.max(
    0,
    Math.round(((totalWeight - openWeight) / totalWeight) * 100),
  );

  return { score, maxScore: 100, openWeight };
}

// ---------------------------------------------------------------------------
// Finding helpers
// ---------------------------------------------------------------------------

export function getOpenFindings(
  state: SimulatedSecurityAuditingState,
): readonly AuditFinding[] {
  return AUDIT_FINDINGS.filter((f) => {
    switch (f.id) {
      case "A":
        return state.contractorInSudo;
      case "B":
        return state.secretsWorldReadable;
      case "C":
        return state.deploySudoNopasswdAll;
      case "D":
        return state.sshPasswordAuth || state.sshPermitRootLogin;
      case "E":
        return state.postgresPublicBind || state.ufwAllows5432;
      case "F":
        return state.opensshOutdated;
      case "G":
        // Inspection documents evidence; it does not close the finding.
        return state.authActivityPresent;
      case "H":
        return !state.backupRestoreVerified;
      default:
        return false;
    }
  });
}

export function getFindingsByCategory(
  categoryId: AuditCategoryId,
): readonly AuditFinding[] {
  return AUDIT_FINDINGS.filter((f) => f.category === categoryId);
}

// ---------------------------------------------------------------------------
// Verification helpers (per-scenario)
// ---------------------------------------------------------------------------

export function contractorRemovedFromSudo(
  state: SimulatedSecurityAuditingState,
): boolean {
  return !state.contractorInSudo;
}

export function secretsHardened(
  state: SimulatedSecurityAuditingState,
): boolean {
  return !state.secretsWorldReadable;
}

export function deploySudoLeastPrivilege(
  state: SimulatedSecurityAuditingState,
): boolean {
  return !state.deploySudoNopasswdAll;
}

export function sshHardened(state: SimulatedSecurityAuditingState): boolean {
  return !state.sshPasswordAuth && !state.sshPermitRootLogin;
}

export function postgresNotPubliclyExposed(
  state: SimulatedSecurityAuditingState,
): boolean {
  return !state.postgresPublicBind && !state.ufwAllows5432;
}

export function opensshPatched(state: SimulatedSecurityAuditingState): boolean {
  return !state.opensshOutdated;
}

/** For inspection-only scenario G, verify succeeds when learner inspected logs. */
export function authActivityInspectable(
  state: SimulatedSecurityAuditingState,
): boolean {
  return state.authActivityInspected;
}

export function backupRestoreVerified(
  state: SimulatedSecurityAuditingState,
): boolean {
  return state.backupRestoreVerified;
}

// ---------------------------------------------------------------------------
// Fictional world data
// ---------------------------------------------------------------------------

type FictionalUser = {
  name: string;
  uid: number;
  gid: number;
  groups: string[];
  gecos: string;
  home: string;
  shell: string;
};

function getUsers(state: SimulatedSecurityAuditingState): FictionalUser[] {
  return [
    {
      name: "root",
      uid: 0,
      gid: 0,
      groups: ["root"],
      gecos: "root",
      home: "/root",
      shell: "/bin/bash",
    },
    {
      name: "www-data",
      uid: 33,
      gid: 33,
      groups: ["www-data"],
      gecos: "www-data",
      home: "/var/www",
      shell: "/usr/sbin/nologin",
    },
    {
      name: "postgres",
      uid: 116,
      gid: 120,
      groups: ["postgres", "ssl-cert"],
      gecos: "PostgreSQL administrator",
      home: "/var/lib/postgresql",
      shell: "/bin/bash",
    },
    {
      name: "backup",
      uid: 34,
      gid: 34,
      groups: ["backup"],
      gecos: "backup",
      home: "/var/backups",
      shell: "/usr/sbin/nologin",
    },
    {
      name: "bunsal",
      uid: 1000,
      gid: 1000,
      groups: ["bunsal", "sudo", "adm"],
      gecos: "Bunsal",
      home: "/home/bunsal",
      shell: "/bin/bash",
    },
    {
      name: "deploy",
      uid: 1001,
      gid: 1001,
      groups: ["deploy", "deployers"],
      gecos: "Deploy Service",
      home: "/home/deploy",
      shell: "/bin/bash",
    },
    {
      name: "contractor",
      uid: 1002,
      gid: 1002,
      groups: state.contractorInSudo ? ["contractor", "sudo"] : ["contractor"],
      gecos: "Contractor",
      home: "/home/contractor",
      shell: "/bin/bash",
    },
    {
      name: "analyst",
      uid: 1003,
      gid: 1003,
      groups: ["analyst", "reports"],
      gecos: "Analyst",
      home: "/home/analyst",
      shell: "/bin/bash",
    },
  ];
}

type FictionalGroup = {
  name: string;
  gid: number;
  members: string[];
};

function getGroups(state: SimulatedSecurityAuditingState): FictionalGroup[] {
  const sudoMembers = state.contractorInSudo
    ? ["root", "bunsal", "contractor"]
    : ["root", "bunsal"];
  return [
    { name: "root", gid: 0, members: ["root"] },
    { name: "sudo", gid: 27, members: sudoMembers },
    { name: "adm", gid: 4, members: ["bunsal"] },
    { name: "www-data", gid: 33, members: ["www-data"] },
    { name: "backup", gid: 34, members: ["backup"] },
    { name: "postgres", gid: 120, members: ["postgres"] },
    { name: "ssl-cert", gid: 121, members: ["postgres"] },
    { name: "bunsal", gid: 1000, members: ["bunsal"] },
    { name: "deploy", gid: 1001, members: ["deploy"] },
    { name: "deployers", gid: 1010, members: ["deploy"] },
    { name: "contractor", gid: 1002, members: ["contractor"] },
    { name: "analyst", gid: 1003, members: ["analyst"] },
    { name: "reports", gid: 1011, members: ["analyst"] },
  ];
}

// ---------------------------------------------------------------------------
// Help text
// ---------------------------------------------------------------------------

const HELP_OUTPUT: readonly string[] = [
  "Available commands (educational simulation):",
  "",
  "  help                              Show this help",
  "  whoami                            Current user",
  "  id [USER]                         User identity and groups",
  "  getent passwd [USER]              Passwd entry for a user",
  "  getent group [GROUP]              Group membership",
  "  groups [USER]                     Group list for a user",
  "  ls -l PATH                        Long listing for known paths",
  "  getfacl PATH                      ACL for known paths",
  "  sudo -l [-U USER]                 Sudo rules for current/given user",
  "  systemctl status UNIT             Fictional service status",
  "  systemctl list-units [--type=service]  List fictional services",
  "  ss -tuln                          Listening sockets",
  "  ss -tulpn                         Listening sockets with process info",
  "  ufw status [verbose]              Firewall status",
  "  sshd -T                           Effective sshd configuration",
  "  apt list --upgradable             Upgradable packages",
  "  apt show openssh-server           Package details",
  "  journalctl [-u UNIT] [-n N]       Scoped fictional log entries",
  "  df -h                             Disk usage",
  "  findmnt                           Mount points",
  "",
  "  Remediation helpers:",
  "  sudo gpasswd -d contractor sudo   Remove contractor from sudo group",
  "  chmod 600 /srv/app/secrets.env    Restrict secrets file permissions",
  "  setfacl -b /srv/app/secrets.env   Remove ACL entries from secrets file",
  "  set-sudo-rule deploy              Restrict deploy to least-privilege sudo",
  "  set-ssh PasswordAuthentication no Disable SSH password auth",
  "  set-ssh PermitRootLogin no        Disable SSH root login",
  "  ufw deny 5432/tcp                 Deny inbound PostgreSQL",
  "  bind-postgres localhost            Bind PostgreSQL to localhost only",
  "  sudo apt install openssh-server   Upgrade openssh-server (simulated)",
  "  mark-restore-tested               Mark backup restore as verified",
  "  clear                             Clear the terminal screen",
  "",
  "This terminal never runs real commands, never scans networks,",
  "and never modifies your actual system. All data is fictional.",
];

const UNSUPPORTED_MESSAGE: readonly string[] = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
];

// ---------------------------------------------------------------------------
// Command simulation
// ---------------------------------------------------------------------------

export function simulateSecurityAuditingCommand(
  rawInput: string,
  state: SimulatedSecurityAuditingState,
): SimulateSecurityAuditingResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { result: { kind: "empty" }, state };
  }

  if (trimmed === "clear") {
    return { result: { kind: "clear" }, state };
  }

  const tokens = trimmed.split(/\s+/);
  const command = tokens[0]!.toLowerCase();

  if (command === "help" || command === "?") {
    return {
      result: { kind: "output", lines: [...HELP_OUTPUT] },
      state,
    };
  }

  if (command === "whoami") {
    return {
      result: { kind: "output", lines: [SIMULATED_AUDIT_USER] },
      state,
    };
  }

  if (command === "id") {
    const targetName = tokens[1] ?? SIMULATED_AUDIT_USER;
    const users = getUsers(state);
    const user = users.find((u) => u.name === targetName);
    if (!user) {
      return {
        result: {
          kind: "output",
          lines: [`id: '${targetName}': no such user`],
        },
        state,
      };
    }
    const groupsList = user.groups
      .map((g) => {
        const grp = getGroups(state).find((gr) => gr.name === g);
        return grp ? `${grp.gid}(${grp.name})` : g;
      })
      .join(",");
    return {
      result: {
        kind: "output",
        lines: [
          `uid=${user.uid}(${user.name}) gid=${user.gid}(${user.name}) groups=${groupsList}`,
        ],
      },
      state,
    };
  }

  if (command === "getent") {
    const db = tokens[1]?.toLowerCase();
    if (db === "passwd") {
      const target = tokens[2];
      const users = getUsers(state);
      if (target) {
        const user = users.find((u) => u.name === target);
        if (!user) {
          return {
            result: { kind: "output", lines: [] },
            state,
          };
        }
        return {
          result: {
            kind: "output",
            lines: [
              `${user.name}:x:${user.uid}:${user.gid}:${user.gecos}:${user.home}:${user.shell}`,
            ],
          },
          state,
        };
      }
      const lines = users.map(
        (u) => `${u.name}:x:${u.uid}:${u.gid}:${u.gecos}:${u.home}:${u.shell}`,
      );
      return { result: { kind: "output", lines }, state };
    }
    if (db === "group") {
      const target = tokens[2];
      const groups = getGroups(state);
      if (target) {
        const group = groups.find((g) => g.name === target);
        if (!group) {
          return {
            result: { kind: "output", lines: [] },
            state,
          };
        }
        return {
          result: {
            kind: "output",
            lines: [`${group.name}:x:${group.gid}:${group.members.join(",")}`],
          },
          state,
        };
      }
      const lines = groups.map(
        (g) => `${g.name}:x:${g.gid}:${g.members.join(",")}`,
      );
      return { result: { kind: "output", lines }, state };
    }
    return {
      result: {
        kind: "output",
        lines: ["Usage: getent passwd [USER] | getent group [GROUP]"],
      },
      state,
    };
  }

  if (command === "groups") {
    const targetName = tokens[1] ?? SIMULATED_AUDIT_USER;
    const users = getUsers(state);
    const user = users.find((u) => u.name === targetName);
    if (!user) {
      return {
        result: {
          kind: "output",
          lines: [`groups: '${targetName}': no such user`],
        },
        state,
      };
    }
    return {
      result: {
        kind: "output",
        lines: [`${user.name} : ${user.groups.join(" ")}`],
      },
      state,
    };
  }

  // ls -l PATH
  if (command === "ls") {
    const rest = tokens.slice(1).join(" ");
    if (rest.includes("/srv/app/secrets.env")) {
      if (state.secretsWorldReadable) {
        return {
          result: {
            kind: "output",
            lines: [
              "-rw-r--r-- 1 www-data www-data 512 Oct 20 09:00 /srv/app/secrets.env",
            ],
          },
          state,
        };
      }
      return {
        result: {
          kind: "output",
          lines: [
            "-rw------- 1 www-data www-data 512 Oct 20 09:00 /srv/app/secrets.env",
          ],
        },
        state,
      };
    }
    if (rest.includes("/srv/app")) {
      return {
        result: {
          kind: "output",
          lines: [
            "total 16",
            "drwxr-xr-x 2 www-data www-data 4096 Oct 20 09:00 .",
            "drwxr-xr-x 3 root     root     4096 Oct 20 08:00 ..",
            "-rw-r--r-- 1 www-data www-data 2048 Oct 20 09:00 app.py",
            state.secretsWorldReadable
              ? "-rw-r--r-- 1 www-data www-data  512 Oct 20 09:00 secrets.env"
              : "-rw------- 1 www-data www-data  512 Oct 20 09:00 secrets.env",
          ],
        },
        state,
      };
    }
    if (rest.includes("/var/backups")) {
      return {
        result: {
          kind: "output",
          lines: [
            "total 2048",
            "drwxr-x--- 2 backup backup 4096 Nov  3 02:00 .",
            "drwxr-xr-x 3 root   root   4096 Oct  1 00:00 ..",
            "-rw-r----- 1 backup backup 1.2M Nov  3 02:00 daily-2026-11-03.tar.gz",
            "-rw-r----- 1 backup backup 1.1M Nov  2 02:00 daily-2026-11-02.tar.gz",
          ],
        },
        state,
      };
    }
    if (rest.includes("/etc/sudoers.d")) {
      return {
        result: {
          kind: "output",
          lines: [
            "total 8",
            "-r--r----- 1 root root  64 Oct 15 10:00 bunsal",
            state.deploySudoNopasswdAll
              ? "-r--r----- 1 root root  48 Oct 15 10:00 deploy"
              : "-r--r----- 1 root root 120 Nov  4 09:00 deploy",
          ],
        },
        state,
      };
    }
    return {
      result: {
        kind: "output",
        lines: [
          "ls: limited paths available in this simulation.",
          "Try: ls -l /srv/app/secrets.env, ls -l /srv/app, ls -l /var/backups, ls -l /etc/sudoers.d",
        ],
      },
      state,
    };
  }

  // getfacl
  if (command === "getfacl") {
    const path = tokens[1];
    if (path?.includes("secrets.env")) {
      if (state.secretsWorldReadable) {
        return {
          result: {
            kind: "output",
            lines: [
              "# file: srv/app/secrets.env",
              "# owner: www-data",
              "# group: www-data",
              "user::rw-",
              "group::r--",
              "other::r--",
              "",
            ],
          },
          state,
        };
      }
      return {
        result: {
          kind: "output",
          lines: [
            "# file: srv/app/secrets.env",
            "# owner: www-data",
            "# group: www-data",
            "user::rw-",
            "group::---",
            "other::---",
            "",
          ],
        },
        state,
      };
    }
    return {
      result: {
        kind: "output",
        lines: [
          "getfacl: limited paths in this simulation.",
          "Try: getfacl /srv/app/secrets.env",
        ],
      },
      state,
    };
  }

  // sudo -l / sudo -l -U user
  if (command === "sudo" && tokens[1] === "-l") {
    const uFlag = tokens.indexOf("-U");
    const targetUser =
      uFlag >= 0 && tokens[uFlag + 1]
        ? tokens[uFlag + 1]
        : SIMULATED_AUDIT_USER;

    if (targetUser === "bunsal") {
      return {
        result: {
          kind: "output",
          lines: [
            `User bunsal may run the following commands on ${SIMULATED_AUDIT_HOST}:`,
            "    (ALL : ALL) ALL",
          ],
        },
        state,
      };
    }
    if (targetUser === "deploy") {
      if (state.deploySudoNopasswdAll) {
        return {
          result: {
            kind: "output",
            lines: [
              `User deploy may run the following commands on ${SIMULATED_AUDIT_HOST}:`,
              "    (ALL) NOPASSWD: ALL",
            ],
          },
          state,
        };
      }
      return {
        result: {
          kind: "output",
          lines: [
            `User deploy may run the following commands on ${SIMULATED_AUDIT_HOST}:`,
            "    (root) NOPASSWD: /usr/bin/systemctl restart app, /usr/bin/systemctl reload app",
          ],
        },
        state,
      };
    }
    if (targetUser === "contractor") {
      if (state.contractorInSudo) {
        return {
          result: {
            kind: "output",
            lines: [
              `User contractor may run the following commands on ${SIMULATED_AUDIT_HOST}:`,
              "    (ALL : ALL) ALL",
            ],
          },
          state,
        };
      }
      return {
        result: {
          kind: "output",
          lines: [
            `User contractor is not allowed to run sudo on ${SIMULATED_AUDIT_HOST}.`,
          ],
        },
        state,
      };
    }
    const users = getUsers(state);
    const user = users.find((u) => u.name === targetUser);
    if (!user) {
      return {
        result: {
          kind: "output",
          lines: [`sudo: unknown user '${targetUser}'`],
        },
        state,
      };
    }
    return {
      result: {
        kind: "output",
        lines: [
          `User ${targetUser} is not allowed to run sudo on ${SIMULATED_AUDIT_HOST}.`,
        ],
      },
      state,
    };
  }

  // systemctl
  if (
    command === "systemctl" ||
    (command === "sudo" && tokens[1] === "systemctl")
  ) {
    const offset = command === "sudo" ? 2 : 1;
    const action = tokens[offset]?.toLowerCase();
    const unit = tokens[offset + 1];

    if (action === "list-units") {
      return {
        result: {
          kind: "output",
          lines: [
            "UNIT                     LOAD   ACTIVE SUB     DESCRIPTION",
            "ssh.service              loaded active running OpenBSD Secure Shell server",
            "nginx.service            loaded active running A high performance web server",
            "postgresql.service       loaded active running PostgreSQL RDBMS",
            "cron.service             loaded active running Regular background program processing",
            "",
            "4 units listed.",
          ],
        },
        state,
      };
    }

    if (action === "status") {
      if (!unit) {
        return {
          result: {
            kind: "output",
            lines: ["Usage: systemctl status UNIT"],
          },
          state,
        };
      }
      const normalized = unit.replace(/\.service$/, "");
      if (normalized === "ssh" || normalized === "sshd") {
        return {
          result: {
            kind: "output",
            lines: [
              "● ssh.service - OpenBSD Secure Shell server",
              "     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)",
              "     Active: active (running) since Mon 2026-11-03 08:00:00 UTC",
              `   Main PID: 1200 (sshd)`,
              `    Version: ${state.opensshOutdated ? "1:9.6p1-3ubuntu13.4" : "1:9.6p1-3ubuntu13.6"}`,
              "     CGroup: /system.slice/ssh.service",
              "             └─1200 sshd: /usr/sbin/sshd -D",
            ],
          },
          state,
        };
      }
      if (normalized === "nginx") {
        return {
          result: {
            kind: "output",
            lines: [
              "● nginx.service - A high performance web server and a reverse proxy server",
              "     Loaded: loaded (/lib/systemd/system/nginx.service; enabled)",
              "     Active: active (running) since Mon 2026-11-03 08:00:00 UTC",
              "   Main PID: 1300 (nginx)",
              "    Version: 1.24.0-2ubuntu0.2",
            ],
          },
          state,
        };
      }
      if (normalized === "postgresql") {
        return {
          result: {
            kind: "output",
            lines: [
              "● postgresql.service - PostgreSQL RDBMS",
              "     Loaded: loaded (/lib/systemd/system/postgresql.service; enabled)",
              "     Active: active (running) since Mon 2026-11-03 08:00:00 UTC",
              "   Main PID: 1400 (postgres)",
              `    Listen: ${state.postgresPublicBind ? "0.0.0.0:5432" : "127.0.0.1:5432"}`,
            ],
          },
          state,
        };
      }
      return {
        result: {
          kind: "output",
          lines: [`Unit ${unit}.service could not be found (simulation).`],
        },
        state,
      };
    }

    return {
      result: {
        kind: "output",
        lines: [
          "Supported: systemctl status UNIT, systemctl list-units [--type=service]",
        ],
      },
      state,
    };
  }

  // ss
  if (command === "ss") {
    const flags = tokens.slice(1).join("");
    if (flags.includes("tuln") || flags.includes("tulpn")) {
      const showProcess = flags.includes("p");
      const lines = [
        showProcess
          ? "State    Recv-Q Send-Q Local Address:Port Peer Address:Port Process"
          : "State    Recv-Q Send-Q Local Address:Port Peer Address:Port",
      ];
      lines.push(
        showProcess
          ? 'LISTEN   0      128    0.0.0.0:22         0.0.0.0:*     users:(("sshd",pid=1200,fd=3))'
          : "LISTEN   0      128    0.0.0.0:22         0.0.0.0:*",
      );
      lines.push(
        showProcess
          ? 'LISTEN   0      511    0.0.0.0:80         0.0.0.0:*     users:(("nginx",pid=1300,fd=6))'
          : "LISTEN   0      511    0.0.0.0:80         0.0.0.0:*",
      );
      const pgBind = state.postgresPublicBind ? "0.0.0.0" : "127.0.0.1";
      lines.push(
        showProcess
          ? `LISTEN   0      244    ${pgBind}:5432      0.0.0.0:*     users:(("postgres",pid=1400,fd=5))`
          : `LISTEN   0      244    ${pgBind}:5432      0.0.0.0:*`,
      );
      return { result: { kind: "output", lines }, state };
    }
    return {
      result: {
        kind: "output",
        lines: ["Usage: ss -tuln or ss -tulpn"],
      },
      state,
    };
  }

  // ufw
  if (command === "ufw" || (command === "sudo" && tokens[1] === "ufw")) {
    const offset = command === "sudo" ? 2 : 1;
    const action = tokens[offset]?.toLowerCase();
    const rest = tokens
      .slice(offset + 1)
      .join(" ")
      .toLowerCase();

    if (action === "status") {
      const lines = [
        "Status: active",
        "",
        "To                         Action      From",
        "--                         ------      ----",
        "22/tcp                     ALLOW       Anywhere",
        "80/tcp                     ALLOW       Anywhere",
      ];
      if (state.ufwAllows5432) {
        lines.push("5432/tcp                   ALLOW       Anywhere");
      } else {
        lines.push("5432/tcp                   DENY        Anywhere");
      }
      if (rest.includes("verbose")) {
        lines.push(
          "",
          "Default: deny (incoming), allow (outgoing), disabled (routed)",
          "Logging: on (low)",
        );
      }
      return { result: { kind: "output", lines }, state };
    }

    if (action === "deny" && rest.includes("5432")) {
      const next = cloneSecurityAuditingState(state);
      next.ufwAllows5432 = false;
      return {
        result: {
          kind: "output",
          lines: [
            "Rule updated (simulated)",
            "5432/tcp is now denied inbound.",
          ],
        },
        state: next,
      };
    }

    return {
      result: {
        kind: "output",
        lines: ["Supported: ufw status [verbose], ufw deny 5432/tcp"],
      },
      state,
    };
  }

  // sshd -T
  if (command === "sshd" && tokens[1] === "-T") {
    const lines = [
      `passwordauthentication ${state.sshPasswordAuth ? "yes" : "no"}`,
      `permitrootlogin ${state.sshPermitRootLogin ? "yes" : "no"}`,
      "pubkeyauthentication yes",
      "maxauthtries 6",
      "port 22",
      "addressfamily any",
      "listenaddress 0.0.0.0",
      "loglevel INFO",
      "x11forwarding no",
      "printmotd no",
      "acceptenv LANG LC_*",
    ];
    return { result: { kind: "output", lines }, state };
  }

  // apt list --upgradable
  if (command === "apt") {
    const sub = tokens[1]?.toLowerCase();
    if (sub === "list" && tokens[2]?.toLowerCase() === "--upgradable") {
      if (!state.opensshOutdated) {
        return {
          result: { kind: "output", lines: ["Listing... Done"] },
          state,
        };
      }
      return {
        result: {
          kind: "output",
          lines: [
            "Listing... Done",
            "openssh-server/jammy-security 1:9.6p1-3ubuntu13.6 amd64 [upgradable from: 1:9.6p1-3ubuntu13.4]",
          ],
        },
        state,
      };
    }
    if (sub === "show" && tokens[2]?.toLowerCase() === "openssh-server") {
      return {
        result: {
          kind: "output",
          lines: [
            "Package: openssh-server",
            `Version: ${state.opensshOutdated ? "1:9.6p1-3ubuntu13.4" : "1:9.6p1-3ubuntu13.6"}`,
            `Candidate: ${state.opensshOutdated ? "1:9.6p1-3ubuntu13.6" : "1:9.6p1-3ubuntu13.6"}`,
            "Priority: optional",
            "Section: security",
            "Origin: Ubuntu (fictional)",
            "Description: secure shell (SSH) server, for secure access from remote machines",
            "",
            "Advisory: DEMO-AUDIT-2026-001 — Remote code execution in OpenSSH server (fictional)",
            `Status: ${state.opensshOutdated ? "AFFECTED — upgrade recommended" : "FIXED — installed version is patched"}`,
          ],
        },
        state,
      };
    }
    return {
      result: {
        kind: "output",
        lines: ["Supported: apt list --upgradable, apt show openssh-server"],
      },
      state,
    };
  }

  // sudo apt install openssh-server
  if (
    command === "sudo" &&
    tokens[1] === "apt" &&
    tokens[2] === "install" &&
    tokens[3]?.toLowerCase() === "openssh-server"
  ) {
    if (!state.opensshOutdated) {
      return {
        result: {
          kind: "output",
          lines: [
            "openssh-server is already the newest version (1:9.6p1-3ubuntu13.6).",
          ],
        },
        state,
      };
    }
    const next = cloneSecurityAuditingState(state);
    next.opensshOutdated = false;
    return {
      result: {
        kind: "output",
        lines: [
          "Reading package lists... Done",
          "Unpacking openssh-server (1:9.6p1-3ubuntu13.6) over (1:9.6p1-3ubuntu13.4) ...",
          "Setting up openssh-server (1:9.6p1-3ubuntu13.6) ...",
          "openssh-server upgraded to fixed version (simulated).",
        ],
      },
      state: next,
    };
  }

  // journalctl
  if (command === "journalctl") {
    let unit: string | undefined;
    let count = 20;
    for (let i = 1; i < tokens.length; i++) {
      if ((tokens[i] === "-u" || tokens[i] === "--unit") && tokens[i + 1]) {
        unit = tokens[i + 1];
      }
      if (tokens[i] === "-n" && tokens[i + 1]) {
        count = Math.min(50, Math.max(1, parseInt(tokens[i + 1]!, 10) || 20));
      }
    }

    if (unit === "ssh" || unit === "sshd") {
      const next = cloneSecurityAuditingState(state);
      next.authActivityInspected = true;

      const lines = [
        "-- Journal begins at Mon 2026-11-03 08:00:00 UTC --",
        `Nov 03 08:00:01 ${SIMULATED_AUDIT_HOST} sshd[1200]: Server listening on 0.0.0.0 port 22.`,
        `Nov 03 09:15:22 ${SIMULATED_AUDIT_HOST} sshd[2001]: Failed password for contractor from 203.0.113.50 port 44820 ssh2`,
        `Nov 03 09:15:25 ${SIMULATED_AUDIT_HOST} sshd[2001]: Failed password for contractor from 203.0.113.50 port 44820 ssh2`,
        `Nov 03 09:15:28 ${SIMULATED_AUDIT_HOST} sshd[2001]: Failed password for contractor from 203.0.113.50 port 44820 ssh2`,
        `Nov 03 09:15:31 ${SIMULATED_AUDIT_HOST} sshd[2001]: Failed password for contractor from 203.0.113.50 port 44820 ssh2`,
        `Nov 03 09:15:34 ${SIMULATED_AUDIT_HOST} sshd[2001]: Failed password for contractor from 203.0.113.50 port 44820 ssh2`,
        `Nov 03 09:16:01 ${SIMULATED_AUDIT_HOST} sshd[2050]: Accepted password for contractor from 203.0.113.50 port 44890 ssh2`,
        `Nov 03 09:16:01 ${SIMULATED_AUDIT_HOST} sshd[2050]: pam_unix(sshd:session): session opened for user contractor`,
        `Nov 03 10:00:00 ${SIMULATED_AUDIT_HOST} sshd[2100]: Accepted publickey for bunsal from 10.0.1.5 port 52100 ssh2`,
      ];
      return {
        result: { kind: "output", lines: lines.slice(0, count + 1) },
        state: next,
      };
    }

    if (unit === "sudo") {
      const lines = [
        "-- Journal begins at Mon 2026-11-03 08:00:00 UTC --",
        `Nov 03 10:05:00 ${SIMULATED_AUDIT_HOST} sudo: bunsal : TTY=pts/0 ; PWD=/home/bunsal ; USER=root ; COMMAND=/usr/bin/apt update`,
        `Nov 03 10:10:00 ${SIMULATED_AUDIT_HOST} sudo: bunsal : TTY=pts/0 ; PWD=/home/bunsal ; USER=root ; COMMAND=/usr/bin/systemctl status ssh`,
      ];
      return {
        result: { kind: "output", lines: lines.slice(0, count + 1) },
        state,
      };
    }

    if (unit === "postgresql") {
      return {
        result: {
          kind: "output",
          lines: [
            "-- Journal begins at Mon 2026-11-03 08:00:00 UTC --",
            `Nov 03 08:00:05 ${SIMULATED_AUDIT_HOST} postgresql[1400]: database system is ready to accept connections`,
            `Nov 03 08:00:05 ${SIMULATED_AUDIT_HOST} postgresql[1400]: listening on ${state.postgresPublicBind ? "0.0.0.0" : "127.0.0.1"}:5432`,
          ],
        },
        state,
      };
    }

    if (!unit) {
      const next = cloneSecurityAuditingState(state);
      next.authActivityInspected = true;
      const lines = [
        "-- Journal begins at Mon 2026-11-03 08:00:00 UTC --",
        `Nov 03 08:00:01 ${SIMULATED_AUDIT_HOST} sshd[1200]: Server listening on 0.0.0.0 port 22.`,
        `Nov 03 09:15:22 ${SIMULATED_AUDIT_HOST} sshd[2001]: Failed password for contractor from 203.0.113.50 port 44820 ssh2`,
        `Nov 03 09:15:25 ${SIMULATED_AUDIT_HOST} sshd[2001]: Failed password for contractor from 203.0.113.50 port 44820 ssh2`,
        `Nov 03 09:16:01 ${SIMULATED_AUDIT_HOST} sshd[2050]: Accepted password for contractor from 203.0.113.50 port 44890 ssh2`,
        `Nov 03 10:00:00 ${SIMULATED_AUDIT_HOST} sshd[2100]: Accepted publickey for bunsal from 10.0.1.5 port 52100 ssh2`,
        `Nov 03 10:05:00 ${SIMULATED_AUDIT_HOST} sudo: bunsal : TTY=pts/0 ; PWD=/home/bunsal ; USER=root ; COMMAND=/usr/bin/apt update`,
      ];
      return {
        result: { kind: "output", lines: lines.slice(0, count + 1) },
        state: next,
      };
    }

    return {
      result: {
        kind: "output",
        lines: [`-- No entries for ${unit}.service in this simulation --`],
      },
      state,
    };
  }

  // df -h
  if (command === "df" && tokens[1] === "-h") {
    return {
      result: {
        kind: "output",
        lines: [
          "Filesystem      Size  Used Avail Use% Mounted on",
          "/dev/sda1        50G   18G   30G  38% /",
          "/dev/sda2        20G  1.2G   18G   7% /var/backups",
          "tmpfs           2.0G     0  2.0G   0% /dev/shm",
        ],
      },
      state,
    };
  }

  // findmnt
  if (command === "findmnt") {
    return {
      result: {
        kind: "output",
        lines: [
          "TARGET        SOURCE    FSTYPE OPTIONS",
          "/             /dev/sda1 ext4   rw,relatime",
          "/var/backups  /dev/sda2 ext4   rw,relatime",
          "/dev/shm      tmpfs     tmpfs  rw,nosuid,nodev",
        ],
      },
      state,
    };
  }

  // Remediation: sudo gpasswd -d contractor sudo
  if (
    command === "sudo" &&
    tokens[1] === "gpasswd" &&
    tokens[2] === "-d" &&
    tokens[3] === "contractor" &&
    tokens[4] === "sudo"
  ) {
    if (!state.contractorInSudo) {
      return {
        result: {
          kind: "output",
          lines: ["gpasswd: user 'contractor' is not a member of 'sudo'"],
        },
        state,
      };
    }
    const next = cloneSecurityAuditingState(state);
    next.contractorInSudo = false;
    return {
      result: {
        kind: "output",
        lines: ["Removing user contractor from group sudo (simulated)"],
      },
      state: next,
    };
  }

  // chmod 600 /srv/app/secrets.env
  if (
    command === "chmod" &&
    tokens[1] === "600" &&
    tokens[2]?.includes("secrets.env")
  ) {
    const next = cloneSecurityAuditingState(state);
    next.secretsWorldReadable = false;
    return {
      result: {
        kind: "output",
        lines: ["chmod: mode changed to 0600 (simulated)"],
      },
      state: next,
    };
  }

  // setfacl -b /srv/app/secrets.env
  if (
    command === "setfacl" &&
    tokens[1] === "-b" &&
    tokens[2]?.includes("secrets.env")
  ) {
    const next = cloneSecurityAuditingState(state);
    next.secretsWorldReadable = false;
    return {
      result: {
        kind: "output",
        lines: ["ACL entries removed (simulated)"],
      },
      state: next,
    };
  }

  // set-sudo-rule deploy
  if (command === "set-sudo-rule" && tokens[1] === "deploy") {
    const next = cloneSecurityAuditingState(state);
    next.deploySudoNopasswdAll = false;
    return {
      result: {
        kind: "output",
        lines: [
          "deploy sudoers rule updated (simulated):",
          "  deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart app, /usr/bin/systemctl reload app",
          "Unrestricted NOPASSWD ALL removed.",
        ],
      },
      state: next,
    };
  }

  // set-ssh PasswordAuthentication no / PermitRootLogin no
  if (command === "set-ssh") {
    const setting = tokens[1];
    const value = tokens[2]?.toLowerCase();
    if (
      setting === "PasswordAuthentication" &&
      (value === "no" || value === "yes")
    ) {
      const next = cloneSecurityAuditingState(state);
      next.sshPasswordAuth = value === "yes";
      return {
        result: {
          kind: "output",
          lines: [`PasswordAuthentication set to ${value} (simulated)`],
        },
        state: next,
      };
    }
    if (
      setting === "PermitRootLogin" &&
      (value === "no" || value === "prohibit-password" || value === "yes")
    ) {
      const next = cloneSecurityAuditingState(state);
      next.sshPermitRootLogin = value === "yes";
      return {
        result: {
          kind: "output",
          lines: [`PermitRootLogin set to ${value} (simulated)`],
        },
        state: next,
      };
    }
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: set-ssh PasswordAuthentication no|yes",
          "       set-ssh PermitRootLogin no|prohibit-password|yes",
        ],
      },
      state,
    };
  }

  // bind-postgres localhost
  if (command === "bind-postgres" && tokens[1] === "localhost") {
    const next = cloneSecurityAuditingState(state);
    next.postgresPublicBind = false;
    return {
      result: {
        kind: "output",
        lines: [
          "PostgreSQL listen_addresses set to 127.0.0.1 (simulated)",
          "Service restarted. ss -tuln will now show 127.0.0.1:5432.",
        ],
      },
      state: next,
    };
  }

  // mark-restore-tested
  if (command === "mark-restore-tested") {
    const next = cloneSecurityAuditingState(state);
    next.backupRestoreVerified = true;
    return {
      result: {
        kind: "output",
        lines: [
          "Backup restore test marked as verified (simulated).",
          "restoreTestVerified: true",
        ],
      },
      state: next,
    };
  }

  // Catch sudo with unrecognized subcommand
  if (command === "sudo") {
    return {
      result: {
        kind: "output",
        lines: [
          'Unsupported sudo command in this simulation. Try "help" for available commands.',
        ],
      },
      state,
    };
  }

  return {
    result: { kind: "output", lines: [...UNSUPPORTED_MESSAGE] },
    state,
  };
}

// ---------------------------------------------------------------------------
// Default suggestions
// ---------------------------------------------------------------------------

export const DEFAULT_SECURITY_AUDITING_SUGGESTIONS = [
  "id contractor",
  "getent group sudo",
  "ls -l /srv/app/secrets.env",
  "sudo -l -U deploy",
  "sshd -T",
  "ss -tuln",
  "ufw status",
  "apt list --upgradable",
  "journalctl -u ssh",
  "df -h",
  "help",
] as const;
