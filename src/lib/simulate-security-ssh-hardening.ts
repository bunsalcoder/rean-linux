/**
 * Frontend-only SSH hardening simulation for Stage 04 Lesson 05.
 * Does not execute real SSH/shell commands, open sockets, read host sshd_config,
 * touch real keys/credentials, or talk to a real sshd.
 * All users, configuration, logs, and access decisions are fictional teaching examples.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_SSH_HARDENING_USER = "bunsal";
export const SIMULATED_SSH_HARDENING_HOST = "rean-ssh";

export type SshHardeningScenarioId =
  | "explore"
  | "root-login"
  | "password-auth"
  | "excess-auth-tries"
  | "unrestricted-users"
  | "invalid-config"
  | "auth-logs"
  | "healthy";

export type PermitRootLoginValue =
  "yes" | "no" | "prohibit-password" | "without-password";

export type YesNo = "yes" | "no";

export type SimulatedSshdConfig = {
  Port: number;
  PermitRootLogin: PermitRootLoginValue;
  PasswordAuthentication: YesNo;
  PubkeyAuthentication: YesNo;
  PermitEmptyPasswords: YesNo;
  MaxAuthTries: number;
  LoginGraceTime: number;
  AllowUsers: readonly string[];
  AllowGroups: readonly string[];
  DenyUsers: readonly string[];
  DenyGroups: readonly string[];
  X11Forwarding: YesNo;
};

export type SimulatedSshHardeningUser = {
  name: string;
  groups: readonly string[];
  /** Fictional public key authorized for this account. */
  hasAuthorizedKey: boolean;
};

export type SimulatedSshAuthLogEntry = {
  timestamp: string;
  level: "info" | "notice" | "warning";
  message: string;
};

export type SimulatedSshHardeningState = {
  scenarioId: SshHardeningScenarioId;
  currentUser: string;
  users: Record<string, SimulatedSshHardeningUser>;
  config: SimulatedSshdConfig;
  /** Raw lines shown by cat — may include an invalid educational line. */
  configLines: readonly string[];
  configValid: boolean;
  configErrorMessage: string | null;
  configErrorLine: number | null;
  serviceActive: boolean;
  /** Last restart outcome message for teaching feedback. */
  lastRestartOk: boolean;
  logs: SimulatedSshAuthLogEntry[];
  /** Teaching flag: pubkey path verified before disabling passwords. */
  pubkeyVerified: boolean;
};

export type SshHardeningScenarioMeta = {
  id: SshHardeningScenarioId;
  label: string;
  summary: string;
};

export type SimulateSshHardeningResult = {
  result: SimulateResult;
  state: SimulatedSshHardeningState;
};

export type SshAccessDecision = {
  allowed: boolean;
  reason: string;
};

export const SSH_HARDENING_SCENARIOS: readonly SshHardeningScenarioMeta[] = [
  {
    id: "explore",
    label: "Explore SSH configuration",
    summary:
      "Baseline fictional host for inspecting sshd_config, service status, and effective settings.",
  },
  {
    id: "root-login",
    label: "Root login exposure",
    summary:
      "Direct root SSH login is permitted — a common high-risk remote-access posture.",
  },
  {
    id: "password-auth",
    label: "Password authentication open",
    summary:
      "Password authentication is enabled for all users; prefer verified key-based access where suitable.",
  },
  {
    id: "excess-auth-tries",
    label: "Excessive authentication attempts",
    summary:
      "MaxAuthTries is set unnecessarily high, giving attackers more guesses per connection.",
  },
  {
    id: "unrestricted-users",
    label: "Unrestricted user access",
    summary:
      "No AllowUsers or AllowGroups policy — any local account may attempt SSH authentication.",
  },
  {
    id: "invalid-config",
    label: "Invalid SSH configuration",
    summary:
      "sshd_config contains an invalid educational setting that validation should catch.",
  },
  {
    id: "auth-logs",
    label: "Authentication log investigation",
    summary:
      "Fictional logs mix failed attempts, a successful login, and a rejected user — interpret carefully.",
  },
  {
    id: "healthy",
    label: "Hardened SSH baseline",
    summary: "Findings remediated — use this to confirm a clean recheck.",
  },
] as const;

const SCENARIO_IDS = new Set<string>(
  SSH_HARDENING_SCENARIOS.map((scenario) => scenario.id),
);

export function isSshHardeningScenarioId(
  value: string,
): value is SshHardeningScenarioId {
  return SCENARIO_IDS.has(value);
}

export function getSshHardeningScenario(
  id: SshHardeningScenarioId,
): SshHardeningScenarioMeta {
  return (
    SSH_HARDENING_SCENARIOS.find((scenario) => scenario.id === id) ??
    SSH_HARDENING_SCENARIOS[0]!
  );
}

const HELP_OUTPUT = [
  "Available commands (educational simulation):",
  "",
  "  help                              Show this help",
  "  systemctl status ssh              Show simulated SSH service status",
  "  systemctl restart ssh             Restart ssh if configuration validates",
  "  sshd -t                           Validate fictional sshd_config syntax",
  "  sshd -T                           Show effective configuration values",
  "  cat /etc/ssh/sshd_config          Show fictional sshd_config",
  "  grep PATTERN /etc/ssh/sshd_config Search the fictional config",
  "  journalctl -u ssh                 Show simulated authentication logs",
  "  ss -tuln                          Show listening sockets (SSH port)",
  "  ssh USER@host                     Test simulated access for a user",
  "  ssh-set KEY VALUE                 Lab helper: change a supported setting",
  "  ssh-fix-syntax                    Lab helper: repair invalid config",
  "  ssh-verify-keys USER              Lab helper: mark pubkey verified",
  "  clear                             Clear the terminal screen",
  "",
  "Supported ssh-set keys:",
  "  Port  PermitRootLogin  PasswordAuthentication  PubkeyAuthentication",
  "  PermitEmptyPasswords  MaxAuthTries  LoginGraceTime",
  "  AllowUsers  AllowGroups  DenyUsers  DenyGroups  X11Forwarding",
  "",
  "Examples:",
  "  ssh-set PermitRootLogin no",
  "  ssh-set MaxAuthTries 3",
  "  ssh-set AllowUsers bunsal deploy",
  "  ssh analyst@host",
  "",
  "This terminal never runs real SSH, never reads host sshd_config,",
  "and never generates or exposes real keys or credentials.",
] as const;

const BASE_USERS: readonly SimulatedSshHardeningUser[] = [
  { name: "root", groups: ["root"], hasAuthorizedKey: false },
  {
    name: "bunsal",
    groups: ["bunsal", "sudo", "operators"],
    hasAuthorizedKey: true,
  },
  {
    name: "deploy",
    groups: ["deploy", "operators"],
    hasAuthorizedKey: true,
  },
  {
    name: "analyst",
    groups: ["analyst", "analysts"],
    hasAuthorizedKey: false,
  },
];

const HARDENED_CONFIG: SimulatedSshdConfig = {
  Port: 22,
  PermitRootLogin: "no",
  PasswordAuthentication: "no",
  PubkeyAuthentication: "yes",
  PermitEmptyPasswords: "no",
  MaxAuthTries: 3,
  LoginGraceTime: 60,
  AllowUsers: ["bunsal", "deploy"],
  AllowGroups: [],
  DenyUsers: [],
  DenyGroups: [],
  X11Forwarding: "no",
};

const EXPLORE_CONFIG: SimulatedSshdConfig = {
  Port: 22,
  PermitRootLogin: "prohibit-password",
  PasswordAuthentication: "yes",
  PubkeyAuthentication: "yes",
  PermitEmptyPasswords: "no",
  MaxAuthTries: 6,
  LoginGraceTime: 120,
  AllowUsers: [],
  AllowGroups: [],
  DenyUsers: [],
  DenyGroups: [],
  X11Forwarding: "no",
};

const BASE_LOGS: readonly SimulatedSshAuthLogEntry[] = [
  {
    timestamp: "Nov 03 08:12:01",
    level: "info",
    message: "sshd[1421]: Server listening on 0.0.0.0 port 22.",
  },
  {
    timestamp: "Nov 03 09:04:11",
    level: "info",
    message:
      "sshd[2201]: Accepted publickey for bunsal from 192.168.1.40 port 51122",
  },
  {
    timestamp: "Nov 03 10:18:44",
    level: "warning",
    message:
      "sshd[2310]: Failed password for invalid user oracle from 203.0.113.44 port 44321",
  },
];

const AUTH_INVESTIGATION_LOGS: readonly SimulatedSshAuthLogEntry[] = [
  {
    timestamp: "Nov 03 21:01:02",
    level: "warning",
    message:
      "sshd[4102]: Failed password for root from 198.51.100.23 port 39211",
  },
  {
    timestamp: "Nov 03 21:01:05",
    level: "warning",
    message:
      "sshd[4102]: Failed password for root from 198.51.100.23 port 39211",
  },
  {
    timestamp: "Nov 03 21:01:09",
    level: "warning",
    message:
      "sshd[4102]: Failed password for root from 198.51.100.23 port 39212",
  },
  {
    timestamp: "Nov 03 21:01:14",
    level: "warning",
    message:
      "sshd[4102]: Failed password for invalid user admin from 198.51.100.23 port 39215",
  },
  {
    timestamp: "Nov 03 21:01:18",
    level: "warning",
    message:
      "sshd[4102]: Failed password for invalid user test from 198.51.100.23 port 39218",
  },
  {
    timestamp: "Nov 03 21:14:33",
    level: "info",
    message:
      "sshd[4220]: Accepted publickey for bunsal from 192.168.1.40 port 52001",
  },
  {
    timestamp: "Nov 03 21:22:08",
    level: "notice",
    message:
      "sshd[4301]: User analyst from 192.168.1.55 not allowed because not listed in AllowUsers",
  },
  {
    timestamp: "Nov 03 21:22:08",
    level: "warning",
    message:
      "sshd[4301]: Connection closed by authenticating user analyst 192.168.1.55 port 52110",
  },
  {
    timestamp: "Nov 03 21:40:02",
    level: "warning",
    message:
      "sshd[4410]: Failed password for deploy from 192.168.1.60 port 40112",
  },
  {
    timestamp: "Nov 03 21:40:07",
    level: "info",
    message:
      "sshd[4410]: Accepted publickey for deploy from 192.168.1.60 port 40112",
  },
];

function cloneConfig(config: SimulatedSshdConfig): SimulatedSshdConfig {
  return {
    ...config,
    AllowUsers: [...config.AllowUsers],
    AllowGroups: [...config.AllowGroups],
    DenyUsers: [...config.DenyUsers],
    DenyGroups: [...config.DenyGroups],
  };
}

function usersRecord(): Record<string, SimulatedSshHardeningUser> {
  const record: Record<string, SimulatedSshHardeningUser> = {};
  for (const user of BASE_USERS) {
    record[user.name] = {
      name: user.name,
      groups: [...user.groups],
      hasAuthorizedKey: user.hasAuthorizedKey,
    };
  }
  return record;
}

function formatList(values: readonly string[]): string {
  return values.length > 0 ? values.join(" ") : "(none)";
}

function renderConfigLines(
  config: SimulatedSshdConfig,
  options?: {
    invalidLine?: string;
    invalidAfter?: string;
  },
): string[] {
  const lines = [
    "# Educational example — fictional /etc/ssh/sshd_config for Rean Linux",
    "# Do not copy to a real host without review and a recovery plan.",
    "",
    `Port ${config.Port}`,
    `PermitRootLogin ${config.PermitRootLogin}`,
    `PasswordAuthentication ${config.PasswordAuthentication}`,
    `PubkeyAuthentication ${config.PubkeyAuthentication}`,
    `PermitEmptyPasswords ${config.PermitEmptyPasswords}`,
    `MaxAuthTries ${config.MaxAuthTries}`,
    `LoginGraceTime ${config.LoginGraceTime}`,
  ];

  if (config.AllowUsers.length > 0) {
    lines.push(`AllowUsers ${config.AllowUsers.join(" ")}`);
  }
  if (config.AllowGroups.length > 0) {
    lines.push(`AllowGroups ${config.AllowGroups.join(" ")}`);
  }
  if (config.DenyUsers.length > 0) {
    lines.push(`DenyUsers ${config.DenyUsers.join(" ")}`);
  }
  if (config.DenyGroups.length > 0) {
    lines.push(`DenyGroups ${config.DenyGroups.join(" ")}`);
  }

  lines.push(`X11Forwarding ${config.X11Forwarding}`);
  lines.push("");
  lines.push("# End of educational sshd_config excerpt");

  if (options?.invalidLine) {
    const marker = options.invalidAfter ?? "MaxAuthTries";
    const index = lines.findIndex((line) => line.startsWith(marker));
    if (index >= 0) {
      lines.splice(index + 1, 0, options.invalidLine);
    } else {
      lines.push(options.invalidLine);
    }
  }

  return lines;
}

function effectiveConfigOutput(config: SimulatedSshdConfig): string[] {
  return [
    `port ${config.Port}`,
    `permitrootlogin ${config.PermitRootLogin}`,
    `passwordauthentication ${config.PasswordAuthentication}`,
    `pubkeyauthentication ${config.PubkeyAuthentication}`,
    `permitemptypasswords ${config.PermitEmptyPasswords}`,
    `maxauthtries ${config.MaxAuthTries}`,
    `logingracetime ${config.LoginGraceTime}`,
    `allowusers ${formatList(config.AllowUsers).toLowerCase()}`,
    `allowgroups ${formatList(config.AllowGroups).toLowerCase()}`,
    `denyusers ${formatList(config.DenyUsers).toLowerCase()}`,
    `denygroups ${formatList(config.DenyGroups).toLowerCase()}`,
    `x11forwarding ${config.X11Forwarding}`,
  ];
}

function scenarioBlueprint(scenarioId: SshHardeningScenarioId): {
  config: SimulatedSshdConfig;
  configValid: boolean;
  configErrorMessage: string | null;
  configErrorLine: number | null;
  invalidLine?: string;
  logs: SimulatedSshAuthLogEntry[];
  pubkeyVerified: boolean;
  serviceActive: boolean;
  lastRestartOk?: boolean;
} {
  switch (scenarioId) {
    case "root-login":
      return {
        config: {
          ...cloneConfig(EXPLORE_CONFIG),
          PermitRootLogin: "yes",
          AllowUsers: [],
        },
        configValid: true,
        configErrorMessage: null,
        configErrorLine: null,
        logs: BASE_LOGS.map((entry) => ({ ...entry })),
        pubkeyVerified: false,
        serviceActive: true,
      };
    case "password-auth":
      return {
        config: {
          ...cloneConfig(EXPLORE_CONFIG),
          PasswordAuthentication: "yes",
          PubkeyAuthentication: "yes",
          PermitRootLogin: "no",
          AllowUsers: ["bunsal", "deploy", "analyst"],
        },
        configValid: true,
        configErrorMessage: null,
        configErrorLine: null,
        logs: BASE_LOGS.map((entry) => ({ ...entry })),
        pubkeyVerified: false,
        serviceActive: true,
      };
    case "excess-auth-tries":
      return {
        config: {
          ...cloneConfig(EXPLORE_CONFIG),
          MaxAuthTries: 20,
          PermitRootLogin: "no",
          AllowUsers: ["bunsal", "deploy"],
        },
        configValid: true,
        configErrorMessage: null,
        configErrorLine: null,
        logs: BASE_LOGS.map((entry) => ({ ...entry })),
        pubkeyVerified: true,
        serviceActive: true,
      };
    case "unrestricted-users":
      return {
        config: {
          ...cloneConfig(EXPLORE_CONFIG),
          PermitRootLogin: "no",
          PasswordAuthentication: "yes",
          PubkeyAuthentication: "yes",
          AllowUsers: [],
          AllowGroups: [],
        },
        configValid: true,
        configErrorMessage: null,
        configErrorLine: null,
        logs: BASE_LOGS.map((entry) => ({ ...entry })),
        pubkeyVerified: true,
        serviceActive: true,
      };
    case "invalid-config":
      return {
        config: {
          ...cloneConfig(EXPLORE_CONFIG),
          PermitRootLogin: "no",
          MaxAuthTries: 3,
          AllowUsers: ["bunsal", "deploy"],
        },
        configValid: false,
        configErrorMessage:
          "Bad configuration option: PermitRootLogon (did you mean PermitRootLogin?)",
        configErrorLine: 10,
        invalidLine: "PermitRootLogon no",
        logs: BASE_LOGS.map((entry) => ({ ...entry })),
        pubkeyVerified: true,
        serviceActive: true,
        lastRestartOk: false,
      };
    case "auth-logs":
      return {
        config: {
          ...cloneConfig(HARDENED_CONFIG),
          PasswordAuthentication: "yes",
        },
        configValid: true,
        configErrorMessage: null,
        configErrorLine: null,
        logs: AUTH_INVESTIGATION_LOGS.map((entry) => ({ ...entry })),
        pubkeyVerified: true,
        serviceActive: true,
      };
    case "healthy":
      return {
        config: cloneConfig(HARDENED_CONFIG),
        configValid: true,
        configErrorMessage: null,
        configErrorLine: null,
        logs: BASE_LOGS.map((entry) => ({ ...entry })),
        pubkeyVerified: true,
        serviceActive: true,
      };
    case "explore":
    default:
      return {
        config: cloneConfig(EXPLORE_CONFIG),
        configValid: true,
        configErrorMessage: null,
        configErrorLine: null,
        logs: BASE_LOGS.map((entry) => ({ ...entry })),
        pubkeyVerified: false,
        serviceActive: true,
      };
  }
}

export function createInitialSshHardeningState(
  scenarioId: SshHardeningScenarioId = "explore",
): SimulatedSshHardeningState {
  const blueprint = scenarioBlueprint(scenarioId);
  return {
    scenarioId,
    currentUser: SIMULATED_SSH_HARDENING_USER,
    users: usersRecord(),
    config: blueprint.config,
    configLines: renderConfigLines(blueprint.config, {
      invalidLine: blueprint.invalidLine,
      invalidAfter: "PermitEmptyPasswords",
    }),
    configValid: blueprint.configValid,
    configErrorMessage: blueprint.configErrorMessage,
    configErrorLine: blueprint.configErrorLine,
    serviceActive: blueprint.serviceActive,
    lastRestartOk: blueprint.lastRestartOk ?? true,
    logs: blueprint.logs,
    pubkeyVerified: blueprint.pubkeyVerified,
  };
}

export function cloneSshHardeningState(
  state: SimulatedSshHardeningState,
): SimulatedSshHardeningState {
  const users: Record<string, SimulatedSshHardeningUser> = {};
  for (const [name, user] of Object.entries(state.users)) {
    users[name] = {
      name: user.name,
      groups: [...user.groups],
      hasAuthorizedKey: user.hasAuthorizedKey,
    };
  }
  return {
    scenarioId: state.scenarioId,
    currentUser: state.currentUser,
    users,
    config: cloneConfig(state.config),
    configLines: [...state.configLines],
    configValid: state.configValid,
    configErrorMessage: state.configErrorMessage,
    configErrorLine: state.configErrorLine,
    serviceActive: state.serviceActive,
    lastRestartOk: state.lastRestartOk,
    logs: state.logs.map((entry) => ({ ...entry })),
    pubkeyVerified: state.pubkeyVerified,
  };
}

export function formatSshHardeningPrompt(user?: string): string {
  const name = user ?? SIMULATED_SSH_HARDENING_USER;
  return `${name}@${SIMULATED_SSH_HARDENING_HOST}:~$ `;
}

function tokenize(raw: string): string[] {
  return raw.trim().split(/\s+/).filter(Boolean);
}

function output(
  lines: readonly string[],
  state: SimulatedSshHardeningState,
): SimulateSshHardeningResult {
  return { result: { kind: "output", lines }, state };
}

function syncConfigLines(
  state: SimulatedSshHardeningState,
  invalidLine?: string,
): SimulatedSshHardeningState {
  const next = cloneSshHardeningState(state);
  next.configLines = renderConfigLines(next.config, {
    invalidLine:
      invalidLine ?? (next.configValid ? undefined : "PermitRootLogon no"),
    invalidAfter: "PermitEmptyPasswords",
  });
  return next;
}

export function sshdConfigValid(state: SimulatedSshHardeningState): boolean {
  return state.configValid;
}

export function getEffectiveConfig(
  state: SimulatedSshHardeningState,
): SimulatedSshdConfig {
  return cloneConfig(state.config);
}

export function isRootLoginAllowed(state: SimulatedSshHardeningState): boolean {
  return state.config.PermitRootLogin === "yes";
}

export function isPasswordAuthEnabled(
  state: SimulatedSshHardeningState,
): boolean {
  return state.config.PasswordAuthentication === "yes";
}

export function hasRestrictiveMaxAuthTries(
  state: SimulatedSshHardeningState,
  maxInclusive = 4,
): boolean {
  return (
    state.config.MaxAuthTries <= maxInclusive && state.config.MaxAuthTries >= 1
  );
}

export function hasAllowUsersPolicy(
  state: SimulatedSshHardeningState,
  expected?: readonly string[],
): boolean {
  if (
    state.config.AllowUsers.length === 0 &&
    state.config.AllowGroups.length === 0
  ) {
    return false;
  }
  if (!expected) {
    return true;
  }
  const actual = new Set(state.config.AllowUsers);
  return (
    expected.every((name) => actual.has(name)) &&
    actual.size === expected.length
  );
}

export function evaluateSshAccess(
  state: SimulatedSshHardeningState,
  username: string,
): SshAccessDecision {
  if (!state.serviceActive) {
    return {
      allowed: false,
      reason: "ssh: connect to host host port 22: Connection refused",
    };
  }

  const user = state.users[username];
  if (!user && username !== "root") {
    return {
      allowed: false,
      reason: `Permission denied (publickey,password).`,
    };
  }

  if (username === "root") {
    if (state.config.PermitRootLogin === "no") {
      return {
        allowed: false,
        reason: "Permission denied (root login disabled by PermitRootLogin).",
      };
    }
    if (
      state.config.PermitRootLogin === "prohibit-password" ||
      state.config.PermitRootLogin === "without-password"
    ) {
      if (state.config.PubkeyAuthentication !== "yes") {
        return {
          allowed: false,
          reason:
            "Permission denied (root may only use public-key authentication).",
        };
      }
    }
  }

  if (state.config.DenyUsers.includes(username)) {
    return {
      allowed: false,
      reason: `User ${username} not allowed because listed in DenyUsers`,
    };
  }

  const userGroups = user?.groups ?? (username === "root" ? ["root"] : []);
  if (userGroups.some((group) => state.config.DenyGroups.includes(group))) {
    return {
      allowed: false,
      reason: `User ${username} not allowed because a group is listed in DenyGroups`,
    };
  }

  if (state.config.AllowUsers.length > 0) {
    if (!state.config.AllowUsers.includes(username)) {
      return {
        allowed: false,
        reason: `User ${username} from 192.168.1.40 not allowed because not listed in AllowUsers`,
      };
    }
  } else if (state.config.AllowGroups.length > 0) {
    const allowedByGroup = userGroups.some((group) =>
      state.config.AllowGroups.includes(group),
    );
    if (!allowedByGroup) {
      return {
        allowed: false,
        reason: `User ${username} not allowed because not in AllowGroups`,
      };
    }
  }

  const canPubkey =
    state.config.PubkeyAuthentication === "yes" &&
    (user?.hasAuthorizedKey || username === "bunsal" || username === "deploy");
  const canPassword = state.config.PasswordAuthentication === "yes";

  if (username === "root" && state.config.PermitRootLogin === "yes") {
    if (canPassword || canPubkey) {
      return {
        allowed: true,
        reason: "Accepted authentication for root (educational simulation).",
      };
    }
  }

  if (!canPubkey && !canPassword) {
    return {
      allowed: false,
      reason: "Permission denied (no authentication methods available).",
    };
  }

  if (canPubkey) {
    return {
      allowed: true,
      reason: `Accepted publickey for ${username} from 192.168.1.40 port 52010`,
    };
  }

  return {
    allowed: true,
    reason: `Accepted password for ${username} from 192.168.1.40 port 52010`,
  };
}

const YES_NO = new Set(["yes", "no"]);
const PERMIT_ROOT = new Set([
  "yes",
  "no",
  "prohibit-password",
  "without-password",
]);

const SUPPORTED_SET_KEYS = new Set([
  "port",
  "permitrootlogin",
  "passwordauthentication",
  "pubkeyauthentication",
  "permitemptypasswords",
  "maxauthtries",
  "logingracetime",
  "allowusers",
  "allowgroups",
  "denyusers",
  "denygroups",
  "x11forwarding",
]);

function applySetting(
  state: SimulatedSshHardeningState,
  keyRaw: string,
  values: readonly string[],
): SimulateSshHardeningResult {
  const key = keyRaw.toLowerCase();
  if (!SUPPORTED_SET_KEYS.has(key)) {
    return output(
      [
        `ssh-set: unsupported key '${keyRaw}' in this lab.`,
        "Run help to see supported settings.",
      ],
      state,
    );
  }

  if (values.length === 0) {
    return output([`ssh-set: missing value for ${keyRaw}`], state);
  }

  const next = cloneSshHardeningState(state);
  const value = values[0]!.toLowerCase();

  switch (key) {
    case "port": {
      const port = Number(values[0]);
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        return output(
          ["ssh-set: Port must be an integer between 1 and 65535"],
          state,
        );
      }
      next.config.Port = port;
      break;
    }
    case "permitrootlogin": {
      if (!PERMIT_ROOT.has(value)) {
        return output(
          [
            "ssh-set: PermitRootLogin must be yes, no, prohibit-password, or without-password",
          ],
          state,
        );
      }
      next.config.PermitRootLogin = value as PermitRootLoginValue;
      break;
    }
    case "passwordauthentication":
    case "pubkeyauthentication":
    case "permitemptypasswords":
    case "x11forwarding": {
      if (!YES_NO.has(value)) {
        return output([`ssh-set: ${keyRaw} must be yes or no`], state);
      }
      const mapped = value as YesNo;
      if (key === "passwordauthentication") {
        next.config.PasswordAuthentication = mapped;
      } else if (key === "pubkeyauthentication") {
        next.config.PubkeyAuthentication = mapped;
      } else if (key === "permitemptypasswords") {
        next.config.PermitEmptyPasswords = mapped;
      } else {
        next.config.X11Forwarding = mapped;
      }
      break;
    }
    case "maxauthtries": {
      const tries = Number(values[0]);
      if (!Number.isInteger(tries) || tries < 1 || tries > 100) {
        return output(
          ["ssh-set: MaxAuthTries must be an integer from 1 to 100"],
          state,
        );
      }
      next.config.MaxAuthTries = tries;
      break;
    }
    case "logingracetime": {
      const seconds = Number(values[0]);
      if (!Number.isInteger(seconds) || seconds < 1 || seconds > 600) {
        return output(
          [
            "ssh-set: LoginGraceTime must be an integer from 1 to 600 (seconds)",
          ],
          state,
        );
      }
      next.config.LoginGraceTime = seconds;
      break;
    }
    case "allowusers":
      next.config.AllowUsers = [...values];
      break;
    case "allowgroups":
      next.config.AllowGroups = [...values];
      break;
    case "denyusers":
      next.config.DenyUsers = [...values];
      break;
    case "denygroups":
      next.config.DenyGroups = [...values];
      break;
    default:
      return output([`ssh-set: unsupported key '${keyRaw}'`], state);
  }

  // Keep config valid unless this scenario still carries a deliberate invalid line.
  if (next.configValid) {
    return output(
      [
        `Updated fictional setting: ${keyRaw}`,
        "Run sshd -T to inspect effective values, then systemctl restart ssh when ready.",
        "Reminder: on a real host, keep a recovery session open before applying remote-access changes.",
      ],
      syncConfigLines(next),
    );
  }

  return output(
    [
      `Updated fictional setting: ${keyRaw}`,
      "Configuration still has a syntax problem — run sshd -t, then ssh-fix-syntax if needed.",
    ],
    syncConfigLines(next, "PermitRootLogon no"),
  );
}

export function simulateSshHardeningCommand(
  raw: string,
  state: SimulatedSshHardeningState,
): SimulateSshHardeningResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { result: { kind: "empty" }, state };
  }

  const tokens = tokenize(trimmed);
  const command = tokens[0]?.toLowerCase() ?? "";

  if (command === "clear") {
    return { result: { kind: "clear" }, state };
  }

  if (command === "help" || command === "?") {
    return output(HELP_OUTPUT, state);
  }

  if (command === "whoami") {
    return output([state.currentUser], state);
  }

  if (command === "systemctl") {
    const action = tokens[1]?.toLowerCase();
    const unit = tokens[2]?.toLowerCase();
    if (
      (action === "status" || action === "restart") &&
      (unit === "ssh" || unit === "sshd" || unit === "ssh.service")
    ) {
      if (action === "status") {
        const active = state.serviceActive;
        return output(
          [
            `● ssh.service - OpenSSH server daemon (educational simulation)`,
            `     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)`,
            `     Active: ${active ? "active (running)" : "inactive (dead)"} since Mon 2026-11-03 08:12:01 UTC`,
            `   Main PID: ${active ? "1421 (sshd)" : "n/a"}`,
            `      Tasks: ${active ? "1" : "0"}`,
            `     Memory: 4.2M`,
            "",
            active
              ? `Nov 03 08:12:01 ${SIMULATED_SSH_HARDENING_HOST} sshd[1421]: Server listening on 0.0.0.0 port ${state.config.Port}.`
              : `Nov 03 08:12:01 ${SIMULATED_SSH_HARDENING_HOST} systemd[1]: Stopped ssh.service.`,
          ],
          state,
        );
      }

      if (!state.configValid) {
        const next = cloneSshHardeningState(state);
        next.lastRestartOk = false;
        return output(
          [
            "Job for ssh.service failed because the control process exited with error code.",
            "See journalctl -u ssh for details (educational simulation).",
            `sshd: ${state.configErrorMessage ?? "invalid configuration"}`,
            "Fix the fictional configuration (sshd -t / ssh-fix-syntax) before restarting.",
          ],
          next,
        );
      }

      const next = cloneSshHardeningState(state);
      next.serviceActive = true;
      next.lastRestartOk = true;
      return output(
        [
          "Restarted fictional ssh.service successfully.",
          `sshd is listening on port ${next.config.Port}.`,
          "On a real host: confirm a new SSH session works before closing your recovery session.",
        ],
        next,
      );
    }
    return output(
      [
        "systemctl: unsupported usage in this lab.",
        "Try: systemctl status ssh   or   systemctl restart ssh",
      ],
      state,
    );
  }

  if (command === "sshd") {
    const flag = tokens[1];
    if (flag === "-t") {
      if (state.configValid) {
        return output(
          ["sshd: fictional configuration OK (educational simulation)"],
          state,
        );
      }
      return output(
        [
          `sshd: /etc/ssh/sshd_config line ${state.configErrorLine ?? 10}: ${state.configErrorMessage ?? "invalid configuration"}`,
          "sshd: error while loading fictional configuration",
        ],
        state,
      );
    }
    if (flag === "-T") {
      if (!state.configValid) {
        return output(
          [
            `sshd: /etc/ssh/sshd_config line ${state.configErrorLine ?? 10}: ${state.configErrorMessage ?? "invalid configuration"}`,
            "Cannot dump effective configuration until syntax validates.",
          ],
          state,
        );
      }
      return output(
        [
          ...effectiveConfigOutput(state.config),
          "",
          "# Effective values from the in-memory educational model (not a real sshd).",
        ],
        state,
      );
    }
    return output(
      ["sshd: unsupported flag in this lab. Try: sshd -t   or   sshd -T"],
      state,
    );
  }

  if (command === "cat") {
    const path = tokens[1];
    if (!path) {
      return output(["cat: missing file operand"], state);
    }
    if (path === "/etc/ssh/sshd_config") {
      return output(
        [
          ...state.configLines,
          "",
          "# Reminder: fictional educational example — not a real host file.",
        ],
        state,
      );
    }
    return output(
      [
        `cat: ${path}: No such file or directory (in this simulation)`,
        "Try: cat /etc/ssh/sshd_config",
      ],
      state,
    );
  }

  if (command === "grep") {
    if (tokens.length < 3) {
      return output(
        ["grep: usage in this lab: grep PATTERN /etc/ssh/sshd_config"],
        state,
      );
    }
    const pattern = tokens[1]!;
    const path = tokens[2]!;
    if (path !== "/etc/ssh/sshd_config") {
      return output(
        ["grep: only /etc/ssh/sshd_config is available in this lab"],
        state,
      );
    }
    const lowered = pattern.toLowerCase();
    const matches = state.configLines.filter((line) =>
      line.toLowerCase().includes(lowered),
    );
    return output(matches.length > 0 ? matches : [], state);
  }

  if (command === "journalctl") {
    const unitFlag = tokens[1];
    const unit = tokens[2]?.toLowerCase();
    if (
      unitFlag === "-u" &&
      (unit === "ssh" || unit === "sshd" || unit === "ssh.service")
    ) {
      return output(
        [
          "-- Simulated journal for unit ssh.service (fictional) --",
          ...state.logs.map(
            (entry) =>
              `${entry.timestamp} ${SIMULATED_SSH_HARDENING_HOST} ${entry.message}`,
          ),
          "",
          "Note: failed logins are not always attacks — include typos, expired keys, and policy denials.",
        ],
        state,
      );
    }
    return output(
      ["journalctl: try journalctl -u ssh in this learning terminal"],
      state,
    );
  }

  if (command === "ss") {
    if (tokens[1] === "-tuln" || tokens.slice(1).join(" ") === "-tuln") {
      return output(
        [
          "Netid  State   Recv-Q  Send-Q   Local Address:Port   Peer Address:Port",
          state.serviceActive
            ? `tcp    LISTEN  0       128        0.0.0.0:${state.config.Port}         0.0.0.0:*`
            : "# (no SSH listener — service inactive in this simulation)",
          "tcp    LISTEN  0       128        127.0.0.1:631         0.0.0.0:*",
          "",
          "# Educational excerpt — not a live host socket table.",
        ],
        state,
      );
    }
    return output(["ss: try ss -tuln in this learning terminal"], state);
  }

  if (command === "ssh") {
    const target = tokens[1];
    if (!target || !target.includes("@")) {
      return output(
        [
          "ssh: usage in this lab: ssh USER@host",
          "Examples: ssh bunsal@host   ssh root@host   ssh analyst@host",
        ],
        state,
      );
    }
    const username = target.split("@")[0]!.toLowerCase();
    const decision = evaluateSshAccess(state, username);
    if (!decision.allowed) {
      return output(
        [
          decision.reason,
          "",
          "Access decision came from the fictional sshd policy model.",
        ],
        state,
      );
    }
    return output(
      [
        decision.reason,
        `Welcome to ${SIMULATED_SSH_HARDENING_HOST} (educational simulation)`,
        `Last login: Mon Nov 3 09:04:11 2026 from 192.168.1.40`,
        `${username}@${SIMULATED_SSH_HARDENING_HOST}:~$ # session ends (demo login only)`,
      ],
      state,
    );
  }

  if (command === "ssh-set") {
    const key = tokens[1];
    if (!key) {
      return output(
        ["ssh-set: usage: ssh-set KEY VALUE [VALUE...]", "Run help for keys."],
        state,
      );
    }
    return applySetting(state, key, tokens.slice(2));
  }

  if (command === "ssh-fix-syntax") {
    if (state.configValid) {
      return output(
        ["ssh-fix-syntax: fictional configuration already validates."],
        state,
      );
    }
    const next = cloneSshHardeningState(state);
    next.configValid = true;
    next.configErrorMessage = null;
    next.configErrorLine = null;
    next.config.PermitRootLogin = "no";
    return output(
      [
        "Removed invalid 'PermitRootLogon' line and set PermitRootLogin no.",
        "Run sshd -t, then systemctl restart ssh.",
      ],
      syncConfigLines(next),
    );
  }

  if (command === "ssh-verify-keys") {
    const username = tokens[1] ?? "bunsal";
    const user = state.users[username];
    if (!user) {
      return output(
        [`ssh-verify-keys: unknown fictional user '${username}'`],
        state,
      );
    }
    if (!user.hasAuthorizedKey) {
      return output(
        [
          `ssh-verify-keys: ${username} has no authorized public key in this lab.`,
          "Try: ssh-verify-keys bunsal   or   ssh-verify-keys deploy",
        ],
        state,
      );
    }
    const next = cloneSshHardeningState(state);
    next.pubkeyVerified = true;
    return output(
      [
        `Verified fictional public-key access path for ${username}.`,
        "On a real host: confirm a new key-based session works before disabling PasswordAuthentication.",
      ],
      next,
    );
  }

  return output(
    [
      "Command not available in this learning terminal.",
      'Try "help" to see available commands.',
    ],
    state,
  );
}
