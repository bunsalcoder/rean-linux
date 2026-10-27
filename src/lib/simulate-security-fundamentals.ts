/**
 * Frontend-only Linux security fundamentals simulation for Stage 04 Lesson 01.
 * Does not execute real security commands, scan hosts, or access the host OS.
 * Never exploits vulnerabilities or collects credentials.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_SECURITY_USER = "bunsal";
export const SIMULATED_SECURITY_HOST = "rean-secure";

export type SecuritySeverity = "critical" | "high" | "medium" | "low";

export type SecurityCategory =
  | "attack-surface"
  | "privilege"
  | "permissions"
  | "authentication"
  | "network"
  | "vulnerability"
  | "availability"
  | "monitoring";

export type SecurityFindingId =
  | "unnecessary-service"
  | "excessive-privileges"
  | "permissive-file"
  | "ssh-password-auth"
  | "open-firewall-port"
  | "pending-updates"
  | "unverified-backup"
  | "log-warning";

export type SecurityScenarioId =
  | "full-assessment"
  | "least-privilege"
  | "permissive-file"
  | "network-exposure"
  | "pending-updates"
  | "auth-vs-authz"
  | "logs-and-backups"
  | "layered-defense"
  | "healthy";

export type SecurityFinding = {
  id: SecurityFindingId;
  /** Short label shown before the learner inspects evidence. */
  title: string;
  description: string;
  category: SecurityCategory;
  severity: SecuritySeverity;
  evidenceHint: string;
  remediation: string;
  principle: string;
};

export type SimulatedSecurityState = {
  scenarioId: SecurityScenarioId;
  /** Unused telnet service still enabled/active. */
  telnetEnabled: boolean;
  telnetActive: boolean;
  /** contractor account incorrectly in the sudo group. */
  contractorInSudo: boolean;
  /** Mode bits for /opt/app/secrets.env — "0644" is too open; "0600" is remediated. */
  secretsMode: "0644" | "0600";
  /** SSH PasswordAuthentication still enabled. */
  sshPasswordAuth: boolean;
  /** Firewall allows unnecessary TCP 8080. */
  firewallAllows8080: boolean;
  /** Simulated security packages awaiting upgrade. */
  updatesPending: boolean;
  /** Daily backup archive exists but has not been verified. */
  backupVerified: boolean;
  /** Predefined journal warning (failed SSH attempts) — evidence, not proof of compromise. */
  logWarningPresent: boolean;
};

export type SecurityScenarioMeta = {
  id: SecurityScenarioId;
  label: string;
  summary: string;
};

export type SimulateSecurityFundamentalsResult = {
  result: SimulateResult;
  state: SimulatedSecurityState;
};

export const SECURITY_FINDINGS: readonly SecurityFinding[] = [
  {
    id: "unnecessary-service",
    title: "Unexpected listening service",
    description:
      "An unused telnet service is enabled and active, expanding the attack surface.",
    category: "attack-surface",
    severity: "high",
    evidenceHint: "systemctl status telnet · ss -tuln",
    remediation:
      "Stop and disable the unused telnet service (sudo systemctl stop/disable telnet).",
    principle: "Reduce attack surface — disable unnecessary services.",
  },
  {
    id: "excessive-privileges",
    title: "Account privilege review needed",
    description:
      "The contractor account belongs to the sudo group without a clear need.",
    category: "privilege",
    severity: "high",
    evidenceHint: "id contractor · groups contractor",
    remediation:
      "Remove contractor from sudo (sudo gpasswd -d contractor sudo).",
    principle: "Least privilege — grant only the access required for the job.",
  },
  {
    id: "permissive-file",
    title: "Sensitive file permissions",
    description:
      "/opt/app/secrets.env is world-readable (0644), exposing secrets to other local users.",
    category: "permissions",
    severity: "critical",
    evidenceHint: "ls -l /opt/app/secrets.env",
    remediation:
      "Restrict the file mode to 0600 (chmod 600 /opt/app/secrets.env).",
    principle:
      "Least privilege for files — protect confidentiality of secrets.",
  },
  {
    id: "ssh-password-auth",
    title: "SSH authentication configuration",
    description:
      "sshd still allows password authentication, which is weaker than key-only access.",
    category: "authentication",
    severity: "medium",
    evidenceHint: "cat /etc/ssh/sshd_config",
    remediation:
      "Disable password authentication (set PasswordAuthentication no).",
    principle: "Strengthen authentication — prefer SSH keys over passwords.",
  },
  {
    id: "open-firewall-port",
    title: "Firewall exposure",
    description:
      "UFW allows inbound TCP 8080 even though that service is not required.",
    category: "network",
    severity: "high",
    evidenceHint: "sudo ufw status · ss -tuln",
    remediation:
      "Remove the unnecessary allow rule (sudo ufw delete allow 8080/tcp).",
    principle: "Limit network exposure — open only required ports.",
  },
  {
    id: "pending-updates",
    title: "Pending security updates",
    description:
      "Known security-related packages have upgrades available but are not applied.",
    category: "vulnerability",
    severity: "high",
    evidenceHint: "apt list --upgradable",
    remediation: "Apply pending updates (sudo apt upgrade).",
    principle: "Vulnerability management — patch known weaknesses promptly.",
  },
  {
    id: "unverified-backup",
    title: "Backup verification status",
    description:
      "A daily backup archive exists, but it has never been verified as restorable.",
    category: "availability",
    severity: "medium",
    evidenceHint: "ls -l /var/backups/app-daily.tar.gz · verify-backup …",
    remediation:
      "Verify the backup archive (verify-backup /var/backups/app-daily.tar.gz).",
    principle: "Availability — backups only help if restore has been verified.",
  },
  {
    id: "log-warning",
    title: "Security log warning",
    description:
      "journald shows repeated failed SSH password attempts from a fictional address.",
    category: "monitoring",
    severity: "low",
    evidenceHint: "journalctl -u ssh",
    remediation:
      "Investigate and monitor; do not treat failed attempts alone as a confirmed compromise.",
    principle:
      "Monitoring — logs are evidence to review, not automatic proof of breach.",
  },
] as const;

export const SECURITY_SCENARIOS: readonly SecurityScenarioMeta[] = [
  {
    id: "full-assessment",
    label: "Full security posture review",
    summary:
      "A fictional app server with several findings across services, privileges, files, SSH, firewall, updates, backups, and logs.",
  },
  {
    id: "least-privilege",
    label: "Least privilege review",
    summary: "Focus on an account with more privilege than it needs.",
  },
  {
    id: "permissive-file",
    label: "Sensitive file permissions",
    summary: "A secrets file is readable more broadly than it should be.",
  },
  {
    id: "network-exposure",
    label: "Network exposure",
    summary:
      "An unnecessary service and an open firewall port expand exposure.",
  },
  {
    id: "pending-updates",
    label: "Pending security updates",
    summary: "Security-related packages report available upgrades.",
  },
  {
    id: "auth-vs-authz",
    label: "Authentication vs authorization",
    summary:
      "Compare how login proofs (authentication) differ from privilege grants (authorization).",
  },
  {
    id: "logs-and-backups",
    label: "Logs and verified backups",
    summary:
      "Review a log warning and an unverified backup without assuming compromise.",
  },
  {
    id: "layered-defense",
    label: "Layered defenses",
    summary:
      "Multiple weak controls at once — practice prioritizing layered remediation.",
  },
  {
    id: "healthy",
    label: "Hardened baseline",
    summary: "Findings are remediated — use this to confirm a clean recheck.",
  },
] as const;

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                              Show this help message",
  "  whoami                            Show the current username",
  "  id [USER]                         Show user and group identity",
  "  groups [USER]                     Show group membership",
  "  ls -l PATH                        List file permissions (supported paths)",
  "  systemctl status SERVICE          Show service status (ssh, telnet)",
  "  ss -tuln                          Show listening TCP/UDP sockets",
  "  journalctl -u ssh                 Show simulated SSH journal entries",
  "  sudo ufw status                   Show firewall status and rules",
  "  apt list --upgradable             List pending simulated package upgrades",
  "  cat /etc/ssh/sshd_config          Show simulated SSH daemon settings",
  "  chmod 600 /opt/app/secrets.env    Restrict secrets file permissions",
  "  sudo systemctl stop telnet        Stop the unused telnet service",
  "  sudo systemctl disable telnet     Disable telnet at boot",
  "  sudo gpasswd -d contractor sudo   Remove contractor from sudo",
  "  set-ssh PasswordAuthentication no Harden SSH password auth setting",
  "  sudo ufw delete allow 8080/tcp    Remove unnecessary firewall allow",
  "  sudo apt upgrade                  Apply pending simulated updates",
  "  verify-backup PATH                Verify a simulated backup archive",
  "  clear                             Clear the terminal screen",
  "",
  "Examples:",
  "  ss -tuln",
  "  ls -l /opt/app/secrets.env",
  "  systemctl status telnet",
  "  apt list --upgradable",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const SUPPORTED_LS_PATHS = [
  "/opt/app/secrets.env",
  "/var/backups/app-daily.tar.gz",
  "/etc/ssh/sshd_config",
] as const;

function cloneState(state: SimulatedSecurityState): SimulatedSecurityState {
  return { ...state };
}

function scenarioState(scenarioId: SecurityScenarioId): SimulatedSecurityState {
  const healthy: SimulatedSecurityState = {
    scenarioId,
    telnetEnabled: false,
    telnetActive: false,
    contractorInSudo: false,
    secretsMode: "0600",
    sshPasswordAuth: false,
    firewallAllows8080: false,
    updatesPending: false,
    backupVerified: true,
    logWarningPresent: false,
  };

  switch (scenarioId) {
    case "healthy":
      return healthy;
    case "least-privilege":
      return { ...healthy, contractorInSudo: true };
    case "permissive-file":
      return { ...healthy, secretsMode: "0644" };
    case "network-exposure":
      return {
        ...healthy,
        telnetEnabled: true,
        telnetActive: true,
        firewallAllows8080: true,
      };
    case "pending-updates":
      return { ...healthy, updatesPending: true };
    case "auth-vs-authz":
      return {
        ...healthy,
        sshPasswordAuth: true,
        contractorInSudo: true,
      };
    case "logs-and-backups":
      return {
        ...healthy,
        backupVerified: false,
        logWarningPresent: true,
      };
    case "layered-defense":
      return {
        scenarioId,
        telnetEnabled: true,
        telnetActive: true,
        contractorInSudo: true,
        secretsMode: "0644",
        sshPasswordAuth: true,
        firewallAllows8080: true,
        updatesPending: true,
        backupVerified: false,
        logWarningPresent: true,
      };
    case "full-assessment":
    default:
      return {
        scenarioId,
        telnetEnabled: true,
        telnetActive: true,
        contractorInSudo: true,
        secretsMode: "0644",
        sshPasswordAuth: true,
        firewallAllows8080: true,
        updatesPending: true,
        backupVerified: false,
        logWarningPresent: true,
      };
  }
}

export function createInitialSecurityFundamentalsState(
  scenarioId: SecurityScenarioId = "full-assessment",
): SimulatedSecurityState {
  return scenarioState(scenarioId);
}

export function cloneSecurityFundamentalsState(
  state: SimulatedSecurityState,
): SimulatedSecurityState {
  return cloneState(state);
}

export function isSecurityFundamentalsScenarioId(
  value: string,
): value is SecurityScenarioId {
  return SECURITY_SCENARIOS.some((scenario) => scenario.id === value);
}

export function getSecurityScenario(
  scenarioId: SecurityScenarioId,
): SecurityScenarioMeta {
  return (
    SECURITY_SCENARIOS.find((scenario) => scenario.id === scenarioId) ??
    SECURITY_SCENARIOS[0]!
  );
}

export function getSecurityFinding(
  findingId: SecurityFindingId,
): SecurityFinding {
  return SECURITY_FINDINGS.find((finding) => finding.id === findingId)!;
}

export function formatSecurityFundamentalsPrompt(): string {
  return `${SIMULATED_SECURITY_USER}@${SIMULATED_SECURITY_HOST}:~$ `;
}

export function isFindingRemediated(
  state: SimulatedSecurityState,
  findingId: SecurityFindingId,
): boolean {
  switch (findingId) {
    case "unnecessary-service":
      return !state.telnetActive && !state.telnetEnabled;
    case "excessive-privileges":
      return !state.contractorInSudo;
    case "permissive-file":
      return state.secretsMode === "0600";
    case "ssh-password-auth":
      return !state.sshPasswordAuth;
    case "open-firewall-port":
      return !state.firewallAllows8080;
    case "pending-updates":
      return !state.updatesPending;
    case "unverified-backup":
      return state.backupVerified;
    case "log-warning":
      // Logs are historical evidence; "remediation" is understanding, not deletion.
      return true;
  }
}

export function listOpenFindings(
  state: SimulatedSecurityState,
): readonly SecurityFinding[] {
  return SECURITY_FINDINGS.filter((finding) =>
    finding.id === "log-warning"
      ? state.logWarningPresent
      : !isFindingRemediated(state, finding.id),
  );
}

function modeDisplay(mode: "0644" | "0600"): string {
  return mode === "0644" ? "-rw-r--r--" : "-rw-------";
}

function formatSsTuln(state: SimulatedSecurityState): string[] {
  const rows: string[] = [
    "Netid  State   Recv-Q  Send-Q  Local Address:Port  Peer Address:Port",
    "tcp    LISTEN  0       128     0.0.0.0:22         0.0.0.0:*",
    "tcp    LISTEN  0       128     0.0.0.0:443        0.0.0.0:*",
  ];
  if (state.telnetActive) {
    rows.push("tcp    LISTEN  0       128     0.0.0.0:23         0.0.0.0:*");
  }
  if (state.firewallAllows8080) {
    // A listener may exist even when the firewall also exposes it.
    rows.push("tcp    LISTEN  0       128     0.0.0.0:8080       0.0.0.0:*");
  }
  return rows;
}

function formatSystemctlStatus(
  service: string,
  state: SimulatedSecurityState,
): SimulateResult {
  if (service === "ssh" || service === "sshd") {
    return {
      kind: "output",
      lines: [
        "● ssh.service - OpenBSD Secure Shell server",
        "     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)",
        "     Active: active (running)",
        "   Main PID: 812 (sshd)",
      ],
    };
  }
  if (
    service === "telnet" ||
    service === "telnetd" ||
    service === "telnet.socket"
  ) {
    const active = state.telnetActive;
    const enabled = state.telnetEnabled;
    return {
      kind: "output",
      lines: [
        "● telnet.service - Legacy TELNET server (simulated)",
        `     Loaded: loaded (/etc/systemd/system/telnet.service; ${enabled ? "enabled" : "disabled"})`,
        active
          ? "     Active: active (running)"
          : "     Active: inactive (dead)",
        "   Main PID: 1402 (in.telnetd)",
        "",
        "Note: Telnet sends credentials in cleartext. Prefer SSH for remote access.",
      ],
    };
  }
  return {
    kind: "output",
    lines: [
      `Unit ${service}.service could not be found in this learning terminal.`,
      "Supported services: ssh, telnet",
    ],
  };
}

function formatId(user: string, state: SimulatedSecurityState): string[] {
  if (user === "bunsal" || user === "") {
    return ["uid=1000(bunsal) gid=1000(bunsal) groups=1000(bunsal),27(sudo)"];
  }
  if (user === "contractor") {
    if (state.contractorInSudo) {
      return [
        "uid=1005(contractor) gid=1005(contractor) groups=1005(contractor),27(sudo)",
      ];
    }
    return [
      "uid=1005(contractor) gid=1005(contractor) groups=1005(contractor)",
    ];
  }
  if (user === "root") {
    return ["uid=0(root) gid=0(root) groups=0(root)"];
  }
  return [`id: ‘${user}’: no such user`];
}

function formatGroups(user: string, state: SimulatedSecurityState): string[] {
  if (user === "bunsal" || user === "") {
    return ["bunsal sudo"];
  }
  if (user === "contractor") {
    return state.contractorInSudo ? ["contractor sudo"] : ["contractor"];
  }
  if (user === "root") {
    return ["root"];
  }
  return [`groups: ‘${user}’: no such user`];
}

function formatSshConfig(state: SimulatedSecurityState): string[] {
  return [
    "# Simulated /etc/ssh/sshd_config (fictional lab host)",
    "Port 22",
    "PermitRootLogin no",
    `PasswordAuthentication ${state.sshPasswordAuth ? "yes" : "no"}`,
    "PubkeyAuthentication yes",
    "ChallengeResponseAuthentication no",
  ];
}

function formatUfwStatus(state: SimulatedSecurityState): string[] {
  const lines = [
    "Status: active",
    "",
    "To                         Action      From",
    "--                         ------      ----",
    "22/tcp                     ALLOW       Anywhere",
    "443/tcp                    ALLOW       Anywhere",
  ];
  if (state.firewallAllows8080) {
    lines.push("8080/tcp                   ALLOW       Anywhere");
  }
  return lines;
}

function formatUpgradable(state: SimulatedSecurityState): string[] {
  if (!state.updatesPending) {
    return ["Listing... Done"];
  }
  return [
    "Listing... Done",
    "openssl/security 3.0.13-1ubuntu0.2 [upgradable from: 3.0.13-1ubuntu0.1]",
    "openssh-server/security 1:9.6p1-3ubuntu13.5 [upgradable from: 1:9.6p1-3ubuntu13.4]",
    "linux-image-generic/security 6.8.0-45.45 [upgradable from: 6.8.0-40.40]",
  ];
}

function formatJournal(state: SimulatedSecurityState): string[] {
  const lines = [
    "-- Simulated journal for unit ssh.service (fictional timestamps) --",
    "Oct 26 08:12:01 rean-secure sshd[912]: Accepted publickey for bunsal from 203.0.113.40 port 51822",
    "Oct 26 09:01:14 rean-secure sshd[940]: Accepted publickey for bunsal from 203.0.113.40 port 52001",
  ];
  if (state.logWarningPresent) {
    lines.push(
      "Oct 26 22:14:03 rean-secure sshd[1102]: Failed password for invalid user admin from 198.51.100.66 port 44112 ssh2",
      "Oct 26 22:14:05 rean-secure sshd[1104]: Failed password for invalid user root from 198.51.100.66 port 44118 ssh2",
      "Oct 26 22:14:08 rean-secure sshd[1106]: Failed password for invalid user ubuntu from 198.51.100.66 port 44124 ssh2",
      "",
      "Note: Failed attempts are a warning worth reviewing — not automatic proof of compromise.",
    );
  } else {
    lines.push(
      "Oct 26 23:00:00 rean-secure sshd[1200]: Server listening on 0.0.0.0 port 22.",
    );
  }
  return lines;
}

function formatLs(path: string, state: SimulatedSecurityState): string[] {
  if (path === "/opt/app/secrets.env") {
    return [
      `${modeDisplay(state.secretsMode)} 1 app app 128 Oct 20 09:00 /opt/app/secrets.env`,
    ];
  }
  if (path === "/var/backups/app-daily.tar.gz") {
    const verifiedTag = state.backupVerified ? "verified" : "unverified";
    return [
      `-rw-r----- 1 root backup 48234496 Oct 26 02:00 /var/backups/app-daily.tar.gz`,
      `# backup status: ${verifiedTag}`,
    ];
  }
  if (path === "/etc/ssh/sshd_config") {
    return ["-rw-r--r-- 1 root root 3452 Jan 12 2024 /etc/ssh/sshd_config"];
  }
  return [
    `ls: cannot access '${path}': No such file in this learning terminal`,
    `Supported paths: ${SUPPORTED_LS_PATHS.join(", ")}`,
  ];
}

function isSsTuln(tokens: readonly string[]): boolean {
  if (tokens[0]?.toLowerCase() !== "ss") {
    return false;
  }
  if (tokens.length === 2 && tokens[1] === "-tuln") {
    return true;
  }
  if (
    tokens.length !== 2 ||
    !tokens[1]?.startsWith("-") ||
    tokens[1].startsWith("--")
  ) {
    return false;
  }
  const flags = new Set(tokens[1].slice(1).split(""));
  return (
    flags.size === 4 &&
    flags.has("t") &&
    flags.has("u") &&
    flags.has("l") &&
    flags.has("n")
  );
}

function output(
  lines: readonly string[],
  state: SimulatedSecurityState,
): SimulateSecurityFundamentalsResult {
  return { result: { kind: "output", lines }, state };
}

/**
 * Resolve security-fundamentals learning commands against the fictional assessment host.
 * Never executes a real shell or touches the host system.
 */
export function simulateSecurityFundamentalsCommand(
  rawInput: string,
  state: SimulatedSecurityState,
): SimulateSecurityFundamentalsResult {
  const input = rawInput.trim();
  if (!input) {
    return { result: { kind: "empty" }, state };
  }

  const tokens = input.split(/\s+/);
  const command = (tokens[0] ?? "").toLowerCase();

  if (command === "help") {
    return output(HELP_OUTPUT, state);
  }
  if (command === "clear") {
    return { result: { kind: "clear" }, state };
  }
  if (command === "whoami") {
    if (tokens.length > 1) {
      return output(
        ['whoami: unexpected arguments — try "whoami" with no options'],
        state,
      );
    }
    return output([SIMULATED_SECURITY_USER], state);
  }
  if (command === "id") {
    const user = tokens[1] ?? "";
    if (tokens.length > 2) {
      return output(
        ['Unsupported id usage. Try "id", "id contractor", or "id bunsal".'],
        state,
      );
    }
    return output(formatId(user, state), state);
  }
  if (command === "groups") {
    const user = tokens[1] ?? "";
    if (tokens.length > 2) {
      return output(
        ['Unsupported groups usage. Try "groups" or "groups contractor".'],
        state,
      );
    }
    return output(formatGroups(user, state), state);
  }
  if (command === "ls") {
    if (tokens[1] !== "-l" || tokens.length !== 3) {
      return output(
        [
          "Supported form: ls -l PATH",
          `Paths: ${SUPPORTED_LS_PATHS.join(", ")}`,
        ],
        state,
      );
    }
    return output(formatLs(tokens[2]!, state), state);
  }
  if (command === "systemctl") {
    if (tokens[1] === "status" && tokens[2]) {
      if (tokens.length !== 3) {
        return output(["Usage: systemctl status SERVICE"], state);
      }
      return {
        result: formatSystemctlStatus(tokens[2].toLowerCase(), state),
        state,
      };
    }
    if (
      tokens[1] === "stop" &&
      tokens.length === 3 &&
      (tokens[2] === "telnet" || tokens[2] === "telnetd")
    ) {
      return output(
        ["Permission denied. Try: sudo systemctl stop telnet"],
        state,
      );
    }
    if (
      tokens[1] === "disable" &&
      tokens.length === 3 &&
      (tokens[2] === "telnet" || tokens[2] === "telnetd")
    ) {
      return output(
        ["Permission denied. Try: sudo systemctl disable telnet"],
        state,
      );
    }
    return output(
      [
        "Supported systemctl forms:",
        "  systemctl status ssh|telnet",
        "  sudo systemctl stop telnet",
        "  sudo systemctl disable telnet",
      ],
      state,
    );
  }
  if (isSsTuln(tokens)) {
    return output(formatSsTuln(state), state);
  }
  if (command === "ss") {
    return output(
      ['Unsupported ss usage. Try the exact form: "ss -tuln".'],
      state,
    );
  }
  if (command === "journalctl") {
    if (
      tokens.length === 3 &&
      tokens[1] === "-u" &&
      (tokens[2] === "ssh" || tokens[2] === "sshd")
    ) {
      return output(formatJournal(state), state);
    }
    return output(
      ['Unsupported journalctl usage. Try: "journalctl -u ssh".'],
      state,
    );
  }
  if (command === "ufw") {
    return output(["Permission denied. Try: sudo ufw status"], state);
  }
  if (command === "sudo") {
    const sub = tokens[1]?.toLowerCase();
    if (sub === "ufw") {
      if (tokens[2] === "status" && tokens.length === 3) {
        return output(formatUfwStatus(state), state);
      }
      if (
        tokens.length === 5 &&
        tokens[2] === "delete" &&
        tokens[3] === "allow" &&
        tokens[4] === "8080/tcp"
      ) {
        const next = cloneState(state);
        next.firewallAllows8080 = false;
        return output(["Rule deleted"], next);
      }
      return output(
        [
          "Supported sudo ufw forms:",
          "  sudo ufw status",
          "  sudo ufw delete allow 8080/tcp",
        ],
        state,
      );
    }
    if (sub === "systemctl") {
      const action = tokens[2];
      const unit = tokens[3]?.toLowerCase();
      if (
        tokens.length === 4 &&
        (action === "stop" || action === "disable") &&
        (unit === "telnet" || unit === "telnetd")
      ) {
        const next = cloneState(state);
        if (action === "stop") {
          next.telnetActive = false;
          return output(["Stopped telnet.service"], next);
        }
        next.telnetEnabled = false;
        return output(["Disabled telnet.service"], next);
      }
      return output(
        [
          "Supported privileged service forms:",
          "  sudo systemctl stop telnet",
          "  sudo systemctl disable telnet",
        ],
        state,
      );
    }
    if (sub === "gpasswd") {
      if (
        tokens.length === 5 &&
        tokens[2] === "-d" &&
        tokens[3] === "contractor" &&
        tokens[4] === "sudo"
      ) {
        if (!state.contractorInSudo) {
          return output(
            ["gpasswd: user 'contractor' is not a member of 'sudo'"],
            state,
          );
        }
        const next = cloneState(state);
        next.contractorInSudo = false;
        return output(["Removing user contractor from group sudo"], next);
      }
      return output(["Supported form: sudo gpasswd -d contractor sudo"], state);
    }
    if (sub === "apt") {
      if (tokens[2] === "upgrade" && tokens.length === 3) {
        if (!state.updatesPending) {
          return output(["0 upgraded, 0 newly installed."], state);
        }
        const next = cloneState(state);
        next.updatesPending = false;
        return output(
          [
            "Reading package lists... Done",
            "Building dependency tree... Done",
            "The following packages will be upgraded:",
            "  linux-image-generic openssl openssh-server",
            "3 upgraded, 0 newly installed.",
            "Simulated security updates applied.",
          ],
          next,
        );
      }
      return output(
        [
          "Supported privileged apt form in this lesson: sudo apt upgrade",
          'Also try: "apt list --upgradable"',
        ],
        state,
      );
    }
    return output(
      [
        "Unsupported sudo command in this learning terminal.",
        'Try "help" to see available commands.',
      ],
      state,
    );
  }
  if (command === "apt") {
    if (
      tokens.length === 3 &&
      tokens[1] === "list" &&
      tokens[2] === "--upgradable"
    ) {
      return output(formatUpgradable(state), state);
    }
    return output(
      [
        "Supported apt form: apt list --upgradable",
        "To apply updates: sudo apt upgrade",
      ],
      state,
    );
  }
  if (command === "cat") {
    if (tokens.length === 2 && tokens[1] === "/etc/ssh/sshd_config") {
      return output(formatSshConfig(state), state);
    }
    return output(
      [
        "Supported cat path in this lesson: /etc/ssh/sshd_config",
        'Try "help" for other diagnostic commands.',
      ],
      state,
    );
  }
  if (command === "chmod") {
    if (
      tokens.length === 3 &&
      (tokens[1] === "600" || tokens[1] === "0600") &&
      tokens[2] === "/opt/app/secrets.env"
    ) {
      const next = cloneState(state);
      next.secretsMode = "0600";
      return output([], next);
    }
    return output(["Supported form: chmod 600 /opt/app/secrets.env"], state);
  }
  if (command === "set-ssh") {
    if (
      tokens.length === 3 &&
      tokens[1] === "PasswordAuthentication" &&
      tokens[2]?.toLowerCase() === "no"
    ) {
      const next = cloneState(state);
      next.sshPasswordAuth = false;
      return output(
        [
          "Updated simulated sshd_config: PasswordAuthentication no",
          "(Educational setting only — never writes a real sshd_config.)",
        ],
        next,
      );
    }
    return output(["Supported form: set-ssh PasswordAuthentication no"], state);
  }
  if (command === "verify-backup") {
    if (tokens.length === 2 && tokens[1] === "/var/backups/app-daily.tar.gz") {
      const next = cloneState(state);
      next.backupVerified = true;
      return output(
        [
          "Verifying /var/backups/app-daily.tar.gz ...",
          "Archive readable: yes",
          "Sample restore check: ok",
          "Backup marked verified in this simulation.",
        ],
        next,
      );
    }
    return output(
      ["Supported form: verify-backup /var/backups/app-daily.tar.gz"],
      state,
    );
  }

  return output(UNSUPPORTED_MESSAGE, state);
}
