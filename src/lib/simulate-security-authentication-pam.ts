/**
 * Frontend-only authentication & PAM simulation for Stage 04 Lesson 09.
 * Does not execute real authentication, never reads or modifies host PAM,
 * never accesses real users, passwords, hashes, or tokens.
 * All accounts, policies, configs, logs, and results are fictional teaching data.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_AUTH_PAM_USER = "bunsal";
export const SIMULATED_AUTH_PAM_HOST = "rean-auth";

export type AuthPamScenarioId =
  | "explore"
  | "account-expired"
  | "locked-account"
  | "invalid-pam"
  | "auth-vs-account"
  | "weak-policy"
  | "auth-logs"
  | "healthy";

export type PamModuleType = "auth" | "account" | "password" | "session";

export type PamControlFlag =
  "required" | "requisite" | "sufficient" | "optional";

export type PamServiceName =
  | "login"
  | "sshd"
  | "sudo"
  | "common-auth"
  | "common-account"
  | "common-password"
  | "common-session";

export type SimulatedPamModule = {
  type: PamModuleType;
  control: PamControlFlag;
  module: string;
  args: readonly string[];
  purpose: string;
  /** Deterministic fictional result for teaching evaluation. */
  result: "success" | "failure";
};

export type SimulatedAccountPolicy = {
  /** passwd -S style status letter: P=usable password, L=locked, NP=no password */
  status: "P" | "L" | "NP";
  /** Password last changed (YYYY-MM-DD), educational only. */
  lastChanged: string;
  minDays: number;
  maxDays: number;
  warnDays: number;
  inactiveDays: number | null;
  /** Account expiration date or null if never. */
  accountExpires: string | null;
  /** True when account is past expiration. */
  expired: boolean;
  /** Failed authentication counter for faillock teaching. */
  failCount: number;
  /** Locked by faillock / repeated failures. */
  lockedOut: boolean;
  /** Shell for getent/passwd display. */
  shell: string;
  uid: number;
  gid: number;
  gecos: string;
  home: string;
};

export type PasswordQualityPolicy = {
  minlen: number;
  dcredit: number;
  ucredit: number;
  ocredit: number;
  lcredit: number;
  /** Whether pam_pwquality is referenced in common-password. */
  pwqualityEnabled: boolean;
  /** Whether pam_faillock is referenced in common-auth. */
  faillockEnabled: boolean;
  denyThreshold: number;
  unlockTimeSeconds: number;
  /** Whether password history / reuse prevention is configured. */
  rememberEnabled: boolean;
  rememberCount: number;
};

export type SimulatedAuthLogEntry = {
  timestamp: string;
  level: "info" | "notice" | "warning";
  message: string;
};

export type SimulatedAuthPamState = {
  scenarioId: AuthPamScenarioId;
  currentUser: string;
  accounts: Record<string, SimulatedAccountPolicy>;
  groups: Record<string, readonly string[]>;
  pamServices: Record<PamServiceName, readonly SimulatedPamModule[]>;
  /** Raw pam.d lines may include an invalid educational entry. */
  pamConfigValid: boolean;
  pamConfigError: string | null;
  passwordPolicy: PasswordQualityPolicy;
  logs: SimulatedAuthLogEntry[];
  sshServiceActive: boolean;
  /** Last pam-eval diagnostic lines for UI feedback. */
  lastEvalSummary: string | null;
  /** Teaching flag: learner inspected auth logs. */
  logsInspected: boolean;
};

export type AuthPamScenarioMeta = {
  id: AuthPamScenarioId;
  label: string;
  summary: string;
};

export type SimulateAuthPamResult = {
  result: SimulateResult;
  state: SimulatedAuthPamState;
};

export type PamEvalStep = {
  index: number;
  type: PamModuleType;
  control: PamControlFlag;
  module: string;
  args: readonly string[];
  purpose: string;
  moduleResult: "success" | "failure";
  stackContinues: boolean;
  note: string;
};

export type PamEvalOutcome = {
  service: PamServiceName;
  user: string;
  authOk: boolean;
  accountOk: boolean;
  sessionOk: boolean;
  overall:
    | "success"
    | "auth-failure"
    | "account-denied"
    | "session-failure"
    | "config-error";
  summary: string;
  steps: readonly PamEvalStep[];
  diagnostics: readonly string[];
};

export type PamExplorerExampleId =
  | "success-path"
  | "required-failure"
  | "requisite-failure"
  | "sufficient-success"
  | "account-rejection"
  | "session-processing";

export type PamExplorerExample = {
  id: PamExplorerExampleId;
  label: string;
  description: string;
  service: PamServiceName;
  user: string;
  /** Override modules for this teaching example (does not mutate host state). */
  modules: readonly SimulatedPamModule[];
};

export const AUTH_PAM_SCENARIOS: readonly AuthPamScenarioMeta[] = [
  {
    id: "explore",
    label: "Explore authentication environment",
    summary:
      "Baseline fictional host for inspecting accounts, PAM services, password policy, and SSH status.",
  },
  {
    id: "account-expired",
    label: "Account expiration",
    summary:
      "The analyst account has passed its account expiration date and cannot start a session.",
  },
  {
    id: "locked-account",
    label: "Repeated failed authentication",
    summary:
      "deploy has exceeded the failed-login threshold and is locked by the fictional faillock policy.",
  },
  {
    id: "invalid-pam",
    label: "Invalid PAM configuration",
    summary:
      "The SSH PAM stack references an unknown module — validation should catch it before login relies on it.",
  },
  {
    id: "auth-vs-account",
    label: "Authentication vs account authorization",
    summary:
      "Credentials succeed at the auth stage, but the account stage rejects access (expired or locked).",
  },
  {
    id: "weak-policy",
    label: "Weak authentication policy",
    summary:
      "Password quality and lockout modules are missing — identify gaps and recommend safer controls.",
  },
  {
    id: "auth-logs",
    label: "Authentication log investigation",
    summary:
      "Fictional logs mix failures, successes, lockouts, and expiration events — interpret carefully.",
  },
  {
    id: "healthy",
    label: "Healthy authentication baseline",
    summary: "Findings remediated — use this to confirm a clean recheck.",
  },
] as const;

const SCENARIO_IDS = new Set<string>(AUTH_PAM_SCENARIOS.map((s) => s.id));

export function isAuthPamScenarioId(value: string): value is AuthPamScenarioId {
  return SCENARIO_IDS.has(value);
}

export function getAuthPamScenario(id: AuthPamScenarioId): AuthPamScenarioMeta {
  return (
    AUTH_PAM_SCENARIOS.find((scenario) => scenario.id === id) ??
    AUTH_PAM_SCENARIOS[0]!
  );
}

export const DEFAULT_SECURITY_AUTH_PAM_SUGGESTIONS = [
  "getent passwd",
  "passwd -S bunsal",
  "chage -l analyst",
  "faillock --user deploy",
  "cat /etc/pam.d/sshd",
  "pam-eval sshd bunsal",
  "journalctl -u ssh",
  "help",
] as const;

const HELP_OUTPUT = [
  "Available commands (educational simulation):",
  "",
  "  help                              Show this help",
  "  getent passwd [USER]              Show fictional passwd entries",
  "  getent group [GROUP]              Show fictional group membership",
  "  passwd -S USER                    Show password status (no secrets)",
  "  chage -l USER                     Show aging / expiration metadata",
  "  faillock [--user USER]            Show failed-login / lockout state",
  "  pam-auth-update --status          Summarize fictional PAM profile",
  "  cat /etc/pam.d/SERVICE            Show PAM service file",
  "  journalctl -u ssh|auth            Show simulated authentication logs",
  "  systemctl status ssh              Show simulated SSH service status",
  "  pam-eval SERVICE USER             Evaluate fictional PAM stack",
  "  pam-unlock USER                   Lab helper: clear lockout",
  "  pam-extend USER                   Lab helper: clear account expiration",
  "  pam-fix-config                    Lab helper: repair invalid PAM entry",
  "  pam-harden-policy                 Lab helper: enable quality + lockout",
  "  clear                             Clear the terminal screen",
  "",
  "PAM services: login  sshd  sudo  common-auth  common-account",
  "              common-password  common-session",
  "",
  "Examples:",
  "  chage -l analyst",
  "  faillock --user deploy",
  "  cat /etc/pam.d/sshd",
  "  pam-eval sshd analyst",
  "",
  "This terminal never authenticates real users, never reads host PAM,",
  "and never stores or requests real passwords, hashes, or tokens.",
] as const;

const SUPPORTED_MODULE_TYPES = new Set<PamModuleType>([
  "auth",
  "account",
  "password",
  "session",
]);

const SUPPORTED_CONTROL_FLAGS = new Set<PamControlFlag>([
  "required",
  "requisite",
  "sufficient",
  "optional",
]);

const KNOWN_MODULES = new Set([
  "pam_unix.so",
  "pam_deny.so",
  "pam_permit.so",
  "pam_faillock.so",
  "pam_pwquality.so",
  "pam_pwhistory.so",
  "pam_nologin.so",
  "pam_env.so",
  "pam_limits.so",
  "pam_umask.so",
  "pam_systemd.so",
  "pam_succeed_if.so",
  "pam_wheel.so",
  "@include",
]);

function baseAccounts(): Record<string, SimulatedAccountPolicy> {
  return {
    root: {
      status: "P",
      lastChanged: "2026-01-15",
      minDays: 0,
      maxDays: 99999,
      warnDays: 7,
      inactiveDays: null,
      accountExpires: null,
      expired: false,
      failCount: 0,
      lockedOut: false,
      shell: "/bin/bash",
      uid: 0,
      gid: 0,
      gecos: "root",
      home: "/root",
    },
    bunsal: {
      status: "P",
      lastChanged: "2026-09-01",
      minDays: 1,
      maxDays: 90,
      warnDays: 14,
      inactiveDays: 30,
      accountExpires: null,
      expired: false,
      failCount: 0,
      lockedOut: false,
      shell: "/bin/bash",
      uid: 1000,
      gid: 1000,
      gecos: "Bunsal Operator",
      home: "/home/bunsal",
    },
    deploy: {
      status: "P",
      lastChanged: "2026-08-12",
      minDays: 1,
      maxDays: 90,
      warnDays: 14,
      inactiveDays: 30,
      accountExpires: null,
      expired: false,
      failCount: 0,
      lockedOut: false,
      shell: "/bin/bash",
      uid: 1001,
      gid: 1001,
      gecos: "Deploy Service",
      home: "/home/deploy",
    },
    analyst: {
      status: "P",
      lastChanged: "2026-07-20",
      minDays: 1,
      maxDays: 90,
      warnDays: 14,
      inactiveDays: 14,
      accountExpires: null,
      expired: false,
      failCount: 0,
      lockedOut: false,
      shell: "/bin/bash",
      uid: 1002,
      gid: 1002,
      gecos: "Security Analyst",
      home: "/home/analyst",
    },
    backup: {
      status: "L",
      lastChanged: "2026-03-01",
      minDays: 0,
      maxDays: 99999,
      warnDays: 7,
      inactiveDays: null,
      accountExpires: null,
      expired: false,
      failCount: 0,
      lockedOut: false,
      shell: "/usr/sbin/nologin",
      uid: 1003,
      gid: 1003,
      gecos: "Backup Service",
      home: "/var/backups",
    },
  };
}

function baseGroups(): Record<string, readonly string[]> {
  return {
    root: ["root"],
    bunsal: ["bunsal"],
    deploy: ["deploy"],
    analyst: ["analyst"],
    backup: ["backup"],
    sudo: ["bunsal"],
    operators: ["bunsal", "deploy"],
    analysts: ["analyst"],
  };
}

function healthyPasswordPolicy(): PasswordQualityPolicy {
  return {
    minlen: 12,
    dcredit: -1,
    ucredit: -1,
    ocredit: -1,
    lcredit: -1,
    pwqualityEnabled: true,
    faillockEnabled: true,
    denyThreshold: 5,
    unlockTimeSeconds: 900,
    rememberEnabled: true,
    rememberCount: 5,
  };
}

function weakPasswordPolicy(): PasswordQualityPolicy {
  return {
    minlen: 6,
    dcredit: 0,
    ucredit: 0,
    ocredit: 0,
    lcredit: 0,
    pwqualityEnabled: false,
    faillockEnabled: false,
    denyThreshold: 50,
    unlockTimeSeconds: 0,
    rememberEnabled: false,
    rememberCount: 0,
  };
}

function module(
  type: PamModuleType,
  control: PamControlFlag,
  name: string,
  args: readonly string[],
  purpose: string,
  result: "success" | "failure" = "success",
): SimulatedPamModule {
  return { type, control, module: name, args, purpose, result };
}

function healthyCommonAuth(): SimulatedPamModule[] {
  return [
    module(
      "auth",
      "required",
      "pam_faillock.so",
      ["preauth", "silent", "deny=5", "unlock_time=900"],
      "Check whether the account is already locked from prior failures",
    ),
    module(
      "auth",
      "sufficient",
      "pam_unix.so",
      ["nullok"],
      "Primary local password authentication (educational — no real secrets)",
    ),
    module(
      "auth",
      "required",
      "pam_faillock.so",
      ["authfail", "deny=5", "unlock_time=900"],
      "Record a failed attempt and lock after the threshold",
    ),
    module(
      "auth",
      "required",
      "pam_deny.so",
      [],
      "Deny if no earlier module granted success",
    ),
  ];
}

function healthyCommonAccount(): SimulatedPamModule[] {
  return [
    module(
      "account",
      "required",
      "pam_unix.so",
      [],
      "Verify account validity, expiration, and password aging",
    ),
    module(
      "account",
      "required",
      "pam_faillock.so",
      [],
      "Reject access while the account remains locked out",
    ),
  ];
}

function healthyCommonPassword(): SimulatedPamModule[] {
  return [
    module(
      "password",
      "requisite",
      "pam_pwquality.so",
      ["retry=3", "minlen=12"],
      "Enforce password quality rules before accepting a new password",
    ),
    module(
      "password",
      "requisite",
      "pam_pwhistory.so",
      ["remember=5", "use_authtok"],
      "Prevent reuse of recent passwords",
    ),
    module(
      "password",
      "required",
      "pam_unix.so",
      ["obscure", "use_authtok"],
      "Update the local password database (fictional)",
    ),
  ];
}

function healthyCommonSession(): SimulatedPamModule[] {
  return [
    module(
      "session",
      "required",
      "pam_unix.so",
      [],
      "Record session open/close for the account",
    ),
    module(
      "session",
      "optional",
      "pam_systemd.so",
      [],
      "Register a systemd user session when available",
    ),
    module(
      "session",
      "required",
      "pam_limits.so",
      [],
      "Apply resource limits from limits.conf",
    ),
  ];
}

function serviceWithInclude(
  includeName:
    "common-auth" | "common-account" | "common-password" | "common-session",
  extras: readonly SimulatedPamModule[] = [],
): SimulatedPamModule[] {
  return [
    module(
      includeName === "common-auth"
        ? "auth"
        : includeName === "common-account"
          ? "account"
          : includeName === "common-password"
            ? "password"
            : "session",
      "required",
      "@include",
      [includeName],
      `Include shared ${includeName} stack`,
    ),
    ...extras,
  ];
}

function healthyPamServices(): Record<PamServiceName, SimulatedPamModule[]> {
  return {
    "common-auth": healthyCommonAuth(),
    "common-account": healthyCommonAccount(),
    "common-password": healthyCommonPassword(),
    "common-session": healthyCommonSession(),
    login: [
      ...serviceWithInclude("common-auth"),
      ...serviceWithInclude("common-account", [
        module(
          "account",
          "required",
          "pam_nologin.so",
          [],
          "Block non-root logins when /etc/nologin exists",
        ),
      ]),
      ...serviceWithInclude("common-password"),
      ...serviceWithInclude("common-session"),
    ],
    sshd: [
      ...serviceWithInclude("common-auth"),
      ...serviceWithInclude("common-account"),
      ...serviceWithInclude("common-session", [
        module(
          "session",
          "optional",
          "pam_env.so",
          [],
          "Load environment variables for the SSH session",
        ),
      ]),
    ],
    sudo: [
      module(
        "auth",
        "required",
        "pam_unix.so",
        [],
        "Authenticate the invoking user for sudo",
      ),
      module(
        "account",
        "required",
        "pam_unix.so",
        [],
        "Confirm the account may use privileged elevation",
      ),
      module(
        "session",
        "required",
        "pam_limits.so",
        [],
        "Apply limits for the elevated session",
      ),
    ],
  };
}

function weakPamServices(): Record<PamServiceName, SimulatedPamModule[]> {
  const services = healthyPamServices();
  services["common-auth"] = [
    module(
      "auth",
      "sufficient",
      "pam_unix.so",
      ["nullok"],
      "Password authentication without lockout accounting",
    ),
    module(
      "auth",
      "required",
      "pam_deny.so",
      [],
      "Deny if unix authentication did not succeed",
    ),
  ];
  services["common-password"] = [
    module(
      "password",
      "required",
      "pam_unix.so",
      ["obscure", "sha512"],
      "Update password without quality or history modules",
    ),
  ];
  services.sshd = [
    ...serviceWithInclude("common-auth"),
    ...serviceWithInclude("common-account"),
    ...serviceWithInclude("common-session"),
  ];
  return services;
}

function invalidPamServices(): Record<PamServiceName, SimulatedPamModule[]> {
  const services = healthyPamServices();
  services.sshd = [
    module("auth", "required", "pam_unix.so", [], "Primary authentication"),
    module(
      "auth",
      "required",
      "pam_magic_bypass.so",
      ["trust=everyone"],
      "INVALID educational module — does not exist",
      "failure",
    ),
    ...serviceWithInclude("common-account"),
    ...serviceWithInclude("common-session"),
  ];
  return services;
}

const BASE_LOGS: readonly SimulatedAuthLogEntry[] = [
  {
    timestamp: "Nov 13 07:01:02",
    level: "info",
    message: "sshd[2101]: Accepted publickey for bunsal from 192.168.1.40",
  },
  {
    timestamp: "Nov 13 07:15:44",
    level: "warning",
    message:
      "sshd[2210]: Failed password for invalid user oracle from 203.0.113.44",
  },
];

const INVESTIGATION_LOGS: readonly SimulatedAuthLogEntry[] = [
  {
    timestamp: "Nov 13 21:01:02",
    level: "warning",
    message:
      "sshd[4102]: Failed password for root from 198.51.100.23 port 39211",
  },
  {
    timestamp: "Nov 13 21:01:05",
    level: "warning",
    message:
      "sshd[4102]: Failed password for root from 198.51.100.23 port 39211",
  },
  {
    timestamp: "Nov 13 21:01:09",
    level: "warning",
    message:
      "sshd[4102]: Failed password for root from 198.51.100.23 port 39212",
  },
  {
    timestamp: "Nov 13 21:02:01",
    level: "warning",
    message:
      "pam_faillock(sshd:auth): Consecutive login failures for user deploy account temporarily locked",
  },
  {
    timestamp: "Nov 13 21:14:33",
    level: "info",
    message:
      "sshd[4220]: Accepted publickey for bunsal from 192.168.1.40 port 52001",
  },
  {
    timestamp: "Nov 13 21:22:08",
    level: "notice",
    message:
      "sshd[4301]: pam_unix(sshd:account): account analyst has expired (account expired)",
  },
  {
    timestamp: "Nov 13 21:22:08",
    level: "warning",
    message:
      "sshd[4301]: Connection closed by authenticating user analyst 192.168.1.55",
  },
  {
    timestamp: "Nov 13 21:40:02",
    level: "warning",
    message:
      "sshd[4410]: Failed password for deploy from 192.168.1.60 port 40112",
  },
  {
    timestamp: "Nov 13 21:40:07",
    level: "info",
    message:
      "sshd[4410]: Accepted publickey for deploy from 192.168.1.60 port 40112",
  },
];

function cloneAccount(account: SimulatedAccountPolicy): SimulatedAccountPolicy {
  return { ...account };
}

function cloneAccounts(
  accounts: Record<string, SimulatedAccountPolicy>,
): Record<string, SimulatedAccountPolicy> {
  const next: Record<string, SimulatedAccountPolicy> = {};
  for (const [name, account] of Object.entries(accounts)) {
    next[name] = cloneAccount(account);
  }
  return next;
}

function cloneModules(
  modules: readonly SimulatedPamModule[],
): SimulatedPamModule[] {
  return modules.map((entry) => ({
    ...entry,
    args: [...entry.args],
  }));
}

function clonePamServices(
  services: Record<PamServiceName, readonly SimulatedPamModule[]>,
): Record<PamServiceName, SimulatedPamModule[]> {
  return {
    login: cloneModules(services.login),
    sshd: cloneModules(services.sshd),
    sudo: cloneModules(services.sudo),
    "common-auth": cloneModules(services["common-auth"]),
    "common-account": cloneModules(services["common-account"]),
    "common-password": cloneModules(services["common-password"]),
    "common-session": cloneModules(services["common-session"]),
  };
}

export function cloneAuthPamState(
  state: SimulatedAuthPamState,
): SimulatedAuthPamState {
  return {
    ...state,
    accounts: cloneAccounts(state.accounts),
    groups: Object.fromEntries(
      Object.entries(state.groups).map(([name, members]) => [
        name,
        [...members],
      ]),
    ),
    pamServices: clonePamServices(state.pamServices),
    passwordPolicy: { ...state.passwordPolicy },
    logs: state.logs.map((entry) => ({ ...entry })),
  };
}

function resolveModuleResult(
  entry: SimulatedPamModule,
  user: string,
  account: SimulatedAccountPolicy | undefined,
): "success" | "failure" {
  if (entry.module === "@include") {
    return "success";
  }
  if (entry.module === "pam_magic_bypass.so") {
    return "failure";
  }
  if (entry.module === "pam_deny.so") {
    return "failure";
  }
  if (entry.module === "pam_permit.so") {
    return "success";
  }

  if (entry.type === "auth") {
    if (entry.module === "pam_faillock.so" && entry.args.includes("preauth")) {
      if (account?.lockedOut) {
        return "failure";
      }
      return "success";
    }
    if (entry.module === "pam_faillock.so" && entry.args.includes("authfail")) {
      // Only runs as a failure recorder in real PAM; treat as success for stack bookkeeping
      // unless the user is already locked and this is a standalone failure path.
      return account?.lockedOut ? "failure" : "success";
    }
    if (entry.module === "pam_unix.so") {
      if (!account) {
        return "failure";
      }
      if (account.status === "L" || account.status === "NP") {
        return "failure";
      }
      if (account.lockedOut) {
        return "failure";
      }
      // Teaching override from module.result when set to failure (explorer examples)
      return entry.result;
    }
    return entry.result;
  }

  if (entry.type === "account") {
    if (!account) {
      return "failure";
    }
    if (entry.module === "pam_unix.so" || entry.module === "pam_faillock.so") {
      if (account.expired) {
        return "failure";
      }
      if (account.lockedOut) {
        return "failure";
      }
      if (account.status === "L" && user !== "root") {
        return "failure";
      }
      return entry.result;
    }
    if (entry.module === "pam_nologin.so") {
      return "success";
    }
    return entry.result;
  }

  if (entry.type === "session") {
    if (!account) {
      return "failure";
    }
    if (account.expired || account.lockedOut) {
      return "failure";
    }
    return entry.result;
  }

  // password stage — not evaluated for login access in this teaching subset
  return entry.result;
}

function expandServiceStack(
  state: SimulatedAuthPamState,
  service: PamServiceName,
): SimulatedPamModule[] | { error: string } {
  const top = state.pamServices[service];
  if (!top) {
    return { error: `Unknown PAM service '${service}'` };
  }

  const expanded: SimulatedPamModule[] = [];
  for (const entry of top) {
    if (!SUPPORTED_MODULE_TYPES.has(entry.type)) {
      return {
        error: `Unsupported PAM module type '${entry.type}' in ${service}`,
      };
    }
    if (!SUPPORTED_CONTROL_FLAGS.has(entry.control)) {
      return {
        error: `Unsupported PAM control flag '${entry.control}' in ${service}`,
      };
    }
    if (entry.module === "@include") {
      const includeName = entry.args[0] as PamServiceName | undefined;
      if (!includeName || !state.pamServices[includeName]) {
        return {
          error: `Invalid @include target '${entry.args[0] ?? ""}' in ${service}`,
        };
      }
      const included = state.pamServices[includeName];
      for (const child of included) {
        if (
          child.module === "pam_magic_bypass.so" ||
          !KNOWN_MODULES.has(child.module)
        ) {
          if (child.module !== "@include") {
            return {
              error: `Unknown or unsupported PAM module '${child.module}' (included via ${includeName})`,
            };
          }
        }
        expanded.push(child);
      }
      continue;
    }
    if (!KNOWN_MODULES.has(entry.module)) {
      return {
        error: `Unknown or unsupported PAM module '${entry.module}' in ${service}`,
      };
    }
    expanded.push(entry);
  }
  return expanded;
}

function evaluateExpandedStack(
  modules: readonly SimulatedPamModule[],
  type: PamModuleType,
  user: string,
  account: SimulatedAccountPolicy | undefined,
): { ok: boolean; steps: PamEvalStep[]; stoppedEarly: boolean } {
  const relevant = modules.filter((entry) => entry.type === type);
  const steps: PamEvalStep[] = [];
  let requiredFailed = false;
  let stoppedEarly = false;

  for (let index = 0; index < relevant.length; index += 1) {
    const entry = relevant[index]!;
    const moduleResult = resolveModuleResult(entry, user, account);
    let stackContinues = true;
    let note = "";

    if (entry.control === "requisite" && moduleResult === "failure") {
      requiredFailed = true;
      stackContinues = false;
      stoppedEarly = true;
      note = "requisite failed — stack stops immediately and the stage fails";
    } else if (entry.control === "required" && moduleResult === "failure") {
      requiredFailed = true;
      note =
        "required failed — failure is remembered; remaining modules still run";
    } else if (entry.control === "sufficient" && moduleResult === "success") {
      if (!requiredFailed) {
        stackContinues = false;
        stoppedEarly = true;
        note =
          "sufficient succeeded with no prior required failure — stage succeeds early";
      } else {
        note =
          "sufficient succeeded but a prior required failure remains — continue";
      }
    } else if (entry.control === "sufficient" && moduleResult === "failure") {
      note = "sufficient failed — ignored unless it was the only path";
    } else if (entry.control === "optional") {
      note =
        moduleResult === "success"
          ? "optional succeeded — does not decide the stage alone"
          : "optional failed — ignored for overall stage result";
    } else if (moduleResult === "success") {
      note = `${entry.control} succeeded`;
    } else {
      note = `${entry.control} failed`;
    }

    steps.push({
      index: index + 1,
      type: entry.type,
      control: entry.control,
      module: entry.module,
      args: entry.args,
      purpose: entry.purpose,
      moduleResult,
      stackContinues,
      note,
    });

    if (!stackContinues) {
      break;
    }
  }

  // Stage succeeds if no required/requisite failures were recorded.
  // Early sufficient success (without prior required failure) also succeeds.
  let ok = !requiredFailed;
  if (stoppedEarly) {
    const last = steps[steps.length - 1];
    if (
      last &&
      last.control === "requisite" &&
      last.moduleResult === "failure"
    ) {
      ok = false;
    } else if (
      last &&
      last.control === "sufficient" &&
      last.moduleResult === "success" &&
      !requiredFailed
    ) {
      ok = true;
    }
  }

  return { ok, steps, stoppedEarly };
}

/**
 * Deterministic PAM evaluation for the documented teaching subset.
 * Never authenticates a real user or loads system modules.
 */
export function evaluatePamStack(
  state: SimulatedAuthPamState,
  service: PamServiceName,
  user: string,
): PamEvalOutcome {
  if (!state.pamConfigValid) {
    return {
      service,
      user,
      authOk: false,
      accountOk: false,
      sessionOk: false,
      overall: "config-error",
      summary:
        state.pamConfigError ??
        "PAM configuration is invalid — fix before evaluating access.",
      steps: [],
      diagnostics: [
        state.pamConfigError ?? "Invalid PAM configuration",
        "Preserve a recovery path before changing authentication policy on real hosts.",
      ],
    };
  }

  const expanded = expandServiceStack(state, service);
  if ("error" in expanded) {
    return {
      service,
      user,
      authOk: false,
      accountOk: false,
      sessionOk: false,
      overall: "config-error",
      summary: expanded.error,
      steps: [],
      diagnostics: [expanded.error],
    };
  }

  const account = state.accounts[user];
  const authEval = evaluateExpandedStack(expanded, "auth", user, account);
  const accountEval = evaluateExpandedStack(expanded, "account", user, account);
  const sessionEval = evaluateExpandedStack(expanded, "session", user, account);

  const steps = [...authEval.steps, ...accountEval.steps, ...sessionEval.steps];

  const diagnostics: string[] = [];
  if (!account) {
    diagnostics.push(`Unknown fictional user '${user}'.`);
  }
  if (account?.expired) {
    diagnostics.push(
      `Account '${user}' is expired (accountExpires=${account.accountExpires}).`,
    );
  }
  if (account?.lockedOut) {
    diagnostics.push(
      `Account '${user}' is locked out (failCount=${account.failCount}).`,
    );
  }

  let overall: PamEvalOutcome["overall"] = "success";
  let summary = `Simulated ${service} access for ${user}: success`;

  if (!authEval.ok) {
    overall = "auth-failure";
    summary = `Simulated ${service} access for ${user}: authentication failed`;
    diagnostics.push(
      "Authentication stage failed — identity was not accepted.",
    );
  } else if (!accountEval.ok) {
    overall = "account-denied";
    summary = `Simulated ${service} access for ${user}: authentication succeeded, account stage denied access`;
    diagnostics.push(
      "Authentication succeeded, but account management rejected the session (expiration, lockout, or policy).",
    );
  } else if (!sessionEval.ok) {
    overall = "session-failure";
    summary = `Simulated ${service} access for ${user}: session stage failed`;
    diagnostics.push("Session stage failed after earlier stages succeeded.");
  } else {
    diagnostics.push(
      "Authentication, account, and session stages completed successfully in this simulation.",
    );
  }

  return {
    service,
    user,
    authOk: authEval.ok,
    accountOk: accountEval.ok,
    sessionOk: sessionEval.ok,
    overall,
    summary,
    steps,
    diagnostics,
  };
}

/** Explorer examples — structured teaching stacks, not live host configs. */
export const PAM_EXPLORER_EXAMPLES: readonly PamExplorerExample[] = [
  {
    id: "success-path",
    label: "Successful authentication path",
    description:
      "unix auth is sufficient and succeeds; account and session modules succeed.",
    service: "sshd",
    user: "bunsal",
    modules: [
      module(
        "auth",
        "sufficient",
        "pam_unix.so",
        [],
        "Local password/key gate (fictional success)",
        "success",
      ),
      module(
        "auth",
        "required",
        "pam_deny.so",
        [],
        "Fallback deny — not reached after sufficient success",
        "failure",
      ),
      module(
        "account",
        "required",
        "pam_unix.so",
        [],
        "Account validity check",
        "success",
      ),
      module(
        "session",
        "required",
        "pam_unix.so",
        [],
        "Open session",
        "success",
      ),
    ],
  },
  {
    id: "required-failure",
    label: "Required module failure",
    description:
      "A required auth module fails; later modules still run, but the stage fails.",
    service: "sshd",
    user: "bunsal",
    modules: [
      module(
        "auth",
        "required",
        "pam_unix.so",
        [],
        "Primary auth — fails in this example",
        "failure",
      ),
      module(
        "auth",
        "optional",
        "pam_env.so",
        [],
        "Still runs after required failure",
        "success",
      ),
      module(
        "account",
        "required",
        "pam_unix.so",
        [],
        "Not reached for access because auth already failed",
        "success",
      ),
    ],
  },
  {
    id: "requisite-failure",
    label: "Requisite module failure",
    description:
      "A requisite failure stops the stack immediately — remaining modules are skipped.",
    service: "login",
    user: "bunsal",
    modules: [
      module(
        "auth",
        "requisite",
        "pam_faillock.so",
        ["preauth"],
        "Locked-out check — fails and aborts",
        "failure",
      ),
      module(
        "auth",
        "sufficient",
        "pam_unix.so",
        [],
        "Would authenticate — but never reached",
        "success",
      ),
    ],
  },
  {
    id: "sufficient-success",
    label: "Sufficient module success",
    description:
      "A sufficient success with no prior required failure ends the stage early.",
    service: "sshd",
    user: "deploy",
    modules: [
      module(
        "auth",
        "sufficient",
        "pam_unix.so",
        [],
        "Succeeds — stage ends early",
        "success",
      ),
      module(
        "auth",
        "required",
        "pam_deny.so",
        [],
        "Skipped after sufficient success",
        "failure",
      ),
      module(
        "account",
        "required",
        "pam_unix.so",
        [],
        "Account stage still evaluated separately",
        "success",
      ),
    ],
  },
  {
    id: "account-rejection",
    label: "Account-stage rejection",
    description:
      "Auth succeeds; account management rejects an expired fictional user.",
    service: "sshd",
    user: "analyst",
    modules: [
      module(
        "auth",
        "sufficient",
        "pam_unix.so",
        [],
        "Credentials accepted (fictional)",
        "success",
      ),
      module(
        "account",
        "required",
        "pam_unix.so",
        [],
        "Account expired — reject",
        "failure",
      ),
      module(
        "session",
        "required",
        "pam_unix.so",
        [],
        "Session not granted after account denial",
        "success",
      ),
    ],
  },
  {
    id: "session-processing",
    label: "Session-stage processing",
    description:
      "Auth and account succeed; session modules open limits and optional systemd registration.",
    service: "login",
    user: "bunsal",
    modules: [
      module(
        "auth",
        "sufficient",
        "pam_unix.so",
        [],
        "Authentication ok",
        "success",
      ),
      module("account", "required", "pam_unix.so", [], "Account ok", "success"),
      module(
        "session",
        "required",
        "pam_limits.so",
        [],
        "Apply resource limits",
        "success",
      ),
      module(
        "session",
        "optional",
        "pam_systemd.so",
        [],
        "Optional session registration",
        "success",
      ),
    ],
  },
] as const;

export function evaluateExplorerExample(
  exampleId: PamExplorerExampleId,
): PamEvalOutcome {
  const example = PAM_EXPLORER_EXAMPLES.find((item) => item.id === exampleId)!;
  const syntheticState = createInitialAuthPamState("explore");

  // Force account expiration for the account-rejection teaching example
  if (exampleId === "account-rejection") {
    const analyst = syntheticState.accounts.analyst!;
    analyst.expired = true;
    analyst.accountExpires = "2026-10-01";
  }
  if (exampleId === "requisite-failure") {
    const bunsal = syntheticState.accounts.bunsal!;
    bunsal.lockedOut = true;
    bunsal.failCount = 5;
  }

  // Build a temporary service from the example modules
  syntheticState.pamServices.sshd = cloneModules(example.modules);
  syntheticState.pamServices.login = cloneModules(example.modules);
  syntheticState.pamConfigValid = true;
  syntheticState.pamConfigError = null;

  return evaluatePamStack(syntheticState, example.service, example.user);
}

function formatPamFile(
  service: PamServiceName,
  modules: readonly SimulatedPamModule[],
): string[] {
  const lines = [
    `# Educational /etc/pam.d/${service} — fictional teaching example`,
    `# Do not copy to a real host without review and a recovery plan.`,
    `# Module type · control flag · module · arguments`,
    "",
  ];
  for (const entry of modules) {
    if (entry.module === "@include") {
      lines.push(`@include ${entry.args.join(" ")}`);
      continue;
    }
    const args = entry.args.length > 0 ? ` ${entry.args.join(" ")}` : "";
    lines.push(`${entry.type}\t${entry.control}\t${entry.module}${args}`);
  }
  lines.push("");
  lines.push(`# End of educational pam.d/${service}`);
  return lines;
}

function formatPasswdLine(
  name: string,
  account: SimulatedAccountPolicy,
): string {
  // x placeholder — never a real hash
  return `${name}:x:${account.uid}:${account.gid}:${account.gecos}:${account.home}:${account.shell}`;
}

function formatChage(name: string, account: SimulatedAccountPolicy): string[] {
  return [
    `Last password change\t\t\t: ${account.lastChanged}`,
    `Password expires\t\t\t: ${
      account.maxDays >= 99999
        ? "never"
        : `(max days ${account.maxDays} from last change)`
    }`,
    `Password inactive\t\t\t: ${
      account.inactiveDays === null
        ? "never"
        : `${account.inactiveDays} days after expire`
    }`,
    `Account expires\t\t\t\t: ${account.accountExpires ?? "never"}`,
    `Minimum number of days between password change\t\t: ${account.minDays}`,
    `Maximum number of days between password change\t\t: ${account.maxDays}`,
    `Number of days of warning before password expires\t: ${account.warnDays}`,
    "",
    account.expired
      ? `# NOTE: fictional account '${name}' is EXPIRED`
      : `# fictional account '${name}' is within policy dates`,
  ];
}

function scenarioBlueprint(scenarioId: AuthPamScenarioId): {
  accounts: Record<string, SimulatedAccountPolicy>;
  pamServices: Record<PamServiceName, SimulatedPamModule[]>;
  pamConfigValid: boolean;
  pamConfigError: string | null;
  passwordPolicy: PasswordQualityPolicy;
  logs: SimulatedAuthLogEntry[];
} {
  const accounts = baseAccounts();
  switch (scenarioId) {
    case "account-expired": {
      accounts.analyst!.expired = true;
      accounts.analyst!.accountExpires = "2026-10-01";
      return {
        accounts,
        pamServices: healthyPamServices(),
        pamConfigValid: true,
        pamConfigError: null,
        passwordPolicy: healthyPasswordPolicy(),
        logs: BASE_LOGS.map((e) => ({ ...e })),
      };
    }
    case "locked-account": {
      accounts.deploy!.failCount = 6;
      accounts.deploy!.lockedOut = true;
      return {
        accounts,
        pamServices: healthyPamServices(),
        pamConfigValid: true,
        pamConfigError: null,
        passwordPolicy: healthyPasswordPolicy(),
        logs: [
          ...BASE_LOGS.map((e) => ({ ...e })),
          {
            timestamp: "Nov 13 10:44:01",
            level: "warning",
            message:
              "pam_faillock(sshd:auth): Consecutive login failures for user deploy account temporarily locked",
          },
        ],
      };
    }
    case "invalid-pam":
      return {
        accounts,
        pamServices: invalidPamServices(),
        pamConfigValid: false,
        pamConfigError:
          "Unknown PAM module 'pam_magic_bypass.so' in /etc/pam.d/sshd (educational invalid entry)",
        passwordPolicy: healthyPasswordPolicy(),
        logs: BASE_LOGS.map((e) => ({ ...e })),
      };
    case "auth-vs-account": {
      accounts.analyst!.expired = true;
      accounts.analyst!.accountExpires = "2026-09-15";
      accounts.analyst!.failCount = 0;
      accounts.analyst!.lockedOut = false;
      accounts.analyst!.status = "P";
      return {
        accounts,
        pamServices: healthyPamServices(),
        pamConfigValid: true,
        pamConfigError: null,
        passwordPolicy: healthyPasswordPolicy(),
        logs: [
          {
            timestamp: "Nov 13 11:02:10",
            level: "info",
            message:
              "sshd[3301]: pam_unix(sshd:auth): authentication ok for analyst (fictional)",
          },
          {
            timestamp: "Nov 13 11:02:10",
            level: "notice",
            message:
              "sshd[3301]: pam_unix(sshd:account): account analyst has expired (account expired)",
          },
        ],
      };
    }
    case "weak-policy":
      return {
        accounts,
        pamServices: weakPamServices(),
        pamConfigValid: true,
        pamConfigError: null,
        passwordPolicy: weakPasswordPolicy(),
        logs: BASE_LOGS.map((e) => ({ ...e })),
      };
    case "auth-logs": {
      accounts.analyst!.expired = true;
      accounts.analyst!.accountExpires = "2026-10-01";
      accounts.deploy!.failCount = 5;
      accounts.deploy!.lockedOut = true;
      return {
        accounts,
        pamServices: healthyPamServices(),
        pamConfigValid: true,
        pamConfigError: null,
        passwordPolicy: healthyPasswordPolicy(),
        logs: INVESTIGATION_LOGS.map((e) => ({ ...e })),
      };
    }
    case "healthy":
      return {
        accounts,
        pamServices: healthyPamServices(),
        pamConfigValid: true,
        pamConfigError: null,
        passwordPolicy: healthyPasswordPolicy(),
        logs: BASE_LOGS.map((e) => ({ ...e })),
      };
    case "explore":
    default:
      return {
        accounts,
        pamServices: healthyPamServices(),
        pamConfigValid: true,
        pamConfigError: null,
        passwordPolicy: healthyPasswordPolicy(),
        logs: BASE_LOGS.map((e) => ({ ...e })),
      };
  }
}

export function createInitialAuthPamState(
  scenarioId: AuthPamScenarioId = "explore",
): SimulatedAuthPamState {
  const blueprint = scenarioBlueprint(scenarioId);
  return {
    scenarioId,
    currentUser: SIMULATED_AUTH_PAM_USER,
    accounts: blueprint.accounts,
    groups: baseGroups(),
    pamServices: blueprint.pamServices,
    pamConfigValid: blueprint.pamConfigValid,
    pamConfigError: blueprint.pamConfigError,
    passwordPolicy: blueprint.passwordPolicy,
    logs: blueprint.logs,
    sshServiceActive: true,
    lastEvalSummary: null,
    logsInspected: false,
  };
}

export function formatAuthPamPrompt(user?: string): string {
  return `${user ?? SIMULATED_AUTH_PAM_USER}@${SIMULATED_AUTH_PAM_HOST}:~$ `;
}

export function isAccountExpired(
  state: SimulatedAuthPamState,
  user: string,
): boolean {
  return state.accounts[user]?.expired === true;
}

export function isAccountLockedOut(
  state: SimulatedAuthPamState,
  user: string,
): boolean {
  return state.accounts[user]?.lockedOut === true;
}

export function hasHealthyPasswordPolicy(
  state: SimulatedAuthPamState,
): boolean {
  const p = state.passwordPolicy;
  return (
    p.pwqualityEnabled &&
    p.faillockEnabled &&
    p.rememberEnabled &&
    p.minlen >= 12 &&
    p.denyThreshold <= 5
  );
}

export function pamConfigIsValid(state: SimulatedAuthPamState): boolean {
  return state.pamConfigValid;
}

function output(
  lines: readonly string[],
  state: SimulatedAuthPamState,
): SimulateAuthPamResult {
  return { result: { kind: "output", lines }, state };
}

function parseServiceName(raw: string | undefined): PamServiceName | null {
  if (!raw) {
    return null;
  }
  const name = raw.replace(/^\/etc\/pam\.d\//, "") as PamServiceName;
  const allowed: PamServiceName[] = [
    "login",
    "sshd",
    "sudo",
    "common-auth",
    "common-account",
    "common-password",
    "common-session",
  ];
  return allowed.includes(name) ? name : null;
}

export function simulateAuthPamCommand(
  rawCommand: string,
  state: SimulatedAuthPamState,
): SimulateAuthPamResult {
  const trimmed = rawCommand.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return { result: { kind: "empty" }, state };
  }

  const tokens = trimmed.split(" ");
  const command = tokens[0]!.toLowerCase();

  if (command === "clear") {
    return { result: { kind: "clear" }, state };
  }

  if (command === "help" || command === "?") {
    return output(HELP_OUTPUT, state);
  }

  if (command === "getent") {
    const db = tokens[1]?.toLowerCase();
    if (db === "passwd") {
      const user = tokens[2];
      if (user) {
        const account = state.accounts[user];
        if (!account) {
          return output([], state);
        }
        return output([formatPasswdLine(user, account)], state);
      }
      return output(
        Object.entries(state.accounts).map(([name, account]) =>
          formatPasswdLine(name, account),
        ),
        state,
      );
    }
    if (db === "group") {
      const group = tokens[2];
      if (group) {
        const members = state.groups[group];
        if (!members) {
          return output([], state);
        }
        return output(
          [`${group}:x:${group === "root" ? 0 : 1000}:${members.join(",")}`],
          state,
        );
      }
      return output(
        Object.entries(state.groups).map(
          ([name, members], index) =>
            `${name}:x:${name === "root" ? 0 : 1000 + index}:${members.join(",")}`,
        ),
        state,
      );
    }
    return output(
      ["Usage: getent passwd [USER] | getent group [GROUP]"],
      state,
    );
  }

  if (command === "passwd") {
    if (tokens[1] !== "-S" || !tokens[2]) {
      return output(
        [
          "passwd: in this lab use: passwd -S USER",
          "Never enter real passwords here — status only, no secrets stored.",
        ],
        state,
      );
    }
    const user = tokens[2]!;
    const account = state.accounts[user];
    if (!account) {
      return output([`passwd: user '${user}' does not exist`], state);
    }
    // Format similar to passwd -S: name status lastchange min max warn
    return output(
      [
        `${user} ${account.status} ${account.lastChanged} ${account.minDays} ${account.maxDays} ${account.warnDays}`,
        "",
        "# Status letters (educational): P=usable password set, L=locked, NP=no password",
        "# No password hashes or secrets are stored in this simulation.",
      ],
      state,
    );
  }

  if (command === "chage") {
    if (tokens[1] !== "-l" || !tokens[2]) {
      return output(["Usage: chage -l USER"], state);
    }
    const user = tokens[2]!;
    const account = state.accounts[user];
    if (!account) {
      return output([`chage: user '${user}' does not exist`], state);
    }
    return output(formatChage(user, account), state);
  }

  if (command === "faillock") {
    let user: string | undefined;
    if (tokens[1] === "--user" || tokens[1] === "-u") {
      user = tokens[2];
    } else if (tokens[1] && !tokens[1].startsWith("-")) {
      user = tokens[1];
    }

    const names = user ? [user] : Object.keys(state.accounts);
    const lines: string[] = [
      "# Simulated faillock status (educational — not host state)",
      "",
    ];
    for (const name of names) {
      const account = state.accounts[name];
      if (!account) {
        lines.push(`faillock: unknown user '${name}'`);
        continue;
      }
      lines.push(`${name}:`);
      lines.push(`  fail_count=${account.failCount}`);
      lines.push(`  locked_out=${account.lockedOut ? "yes" : "no"}`);
      lines.push(
        `  deny_threshold=${state.passwordPolicy.denyThreshold}  unlock_time=${state.passwordPolicy.unlockTimeSeconds}s`,
      );
      lines.push("");
    }
    if (!state.passwordPolicy.faillockEnabled) {
      lines.push(
        "# NOTE: pam_faillock is not enabled in the current fictional policy.",
      );
    }
    return output(lines, state);
  }

  if (command === "pam-auth-update") {
    if (tokens[1] !== "--status") {
      return output(
        ["pam-auth-update: in this lab use: pam-auth-update --status"],
        state,
      );
    }
    const p = state.passwordPolicy;
    return output(
      [
        "Simulated pam-auth-update status (Debian-style teaching summary):",
        "",
        `[*] Unix authentication                  ${state.pamServices["common-auth"].some((m) => m.module === "pam_unix.so") ? "enabled" : "disabled"}`,
        `[${p.faillockEnabled ? "*" : " "}] Failed-login lockout (faillock)     ${p.faillockEnabled ? "enabled" : "disabled"}`,
        `[${p.pwqualityEnabled ? "*" : " "}] Password quality (pwquality)       ${p.pwqualityEnabled ? "enabled" : "disabled"}`,
        `[${p.rememberEnabled ? "*" : " "}] Password history (pwhistory)       ${p.rememberEnabled ? "enabled" : "disabled"}`,
        "",
        `Password minlen=${p.minlen}  deny=${p.denyThreshold}  unlock_time=${p.unlockTimeSeconds}`,
        "",
        "Exact module availability varies across distributions.",
        "This summary is fictional and never changes host PAM.",
      ],
      state,
    );
  }

  if (command === "cat") {
    const path = tokens[1];
    if (!path) {
      return output(["cat: missing file operand"], state);
    }
    if (path.startsWith("/etc/pam.d/") || path.startsWith("pam.d/")) {
      const service = parseServiceName(path);
      if (!service) {
        return output(
          [
            `cat: ${path}: not available in this lab`,
            "Try: cat /etc/pam.d/sshd | login | sudo | common-auth | common-account",
          ],
          state,
        );
      }
      return output(formatPamFile(service, state.pamServices[service]), state);
    }
    if (path === "/etc/nsswitch.conf") {
      return output(
        [
          "# Educational /etc/nsswitch.conf excerpt",
          "passwd:         files systemd",
          "group:          files systemd",
          "shadow:         files",
          "hosts:          files dns",
          "",
          "# NSS resolves identity sources; PAM handles authentication stacks.",
        ],
        state,
      );
    }
    if (path === "/etc/passwd") {
      return output(
        Object.entries(state.accounts).map(([name, account]) =>
          formatPasswdLine(name, account),
        ),
        state,
      );
    }
    if (path === "/etc/group") {
      return output(
        Object.entries(state.groups).map(
          ([name, members], index) =>
            `${name}:x:${name === "root" ? 0 : 1000 + index}:${members.join(",")}`,
        ),
        state,
      );
    }
    if (path === "/etc/shadow") {
      return output(
        [
          "# /etc/shadow is not displayed in this learning terminal.",
          "# Reason: shadow holds password hashes — this lab never stores or shows secrets.",
          "# Use passwd -S and chage -l for educational account status instead.",
        ],
        state,
      );
    }
    return output([`cat: ${path}: No such file or directory`], state);
  }

  if (command === "journalctl") {
    const next = cloneAuthPamState(state);
    next.logsInspected = true;
    const unitFlag = tokens[1];
    const unit = tokens[2]?.toLowerCase();
    const authLike =
      (unitFlag === "-u" &&
        (unit === "ssh" ||
          unit === "sshd" ||
          unit === "ssh.service" ||
          unit === "auth" ||
          unit === "systemd-journald")) ||
      tokens.includes("_TRANSPORT=syslog") ||
      tokens.includes("-t") ||
      tokens.length === 1;

    if (authLike || (unitFlag === "-u" && unit)) {
      return output(
        [
          "-- Simulated authentication journal (fictional) --",
          ...next.logs.map(
            (entry) =>
              `${entry.timestamp} ${SIMULATED_AUTH_PAM_HOST} ${entry.message}`,
          ),
          "",
          "Note: failed logins are signals to investigate — not automatic proof of compromise.",
        ],
        next,
      );
    }
    return output(
      ["journalctl: try journalctl -u ssh   or   journalctl -u auth"],
      next,
    );
  }

  if (command === "systemctl") {
    const action = tokens[1];
    const unit = tokens[2]?.toLowerCase();
    if (
      action === "status" &&
      (unit === "ssh" || unit === "sshd" || unit === "ssh.service")
    ) {
      return output(
        [
          `● ssh.service - OpenSSH server daemon (simulated on ${SIMULATED_AUTH_PAM_HOST})`,
          `     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)`,
          `     Active: ${state.sshServiceActive ? "active (running)" : "inactive (dead)"}`,
          "       Docs: educational simulation only",
          "",
          state.pamConfigValid
            ? "PAM sshd stack: validates in this simulation"
            : `PAM sshd stack: INVALID — ${state.pamConfigError}`,
        ],
        state,
      );
    }
    return output(
      ["systemctl: try systemctl status ssh in this learning terminal"],
      state,
    );
  }

  if (command === "pam-eval") {
    const service = parseServiceName(tokens[1]);
    const user = tokens[2];
    if (!service || !user) {
      return output(
        [
          "Usage: pam-eval SERVICE USER",
          "Services: login sshd sudo common-auth common-account common-session",
        ],
        state,
      );
    }
    const outcome = evaluatePamStack(state, service, user);
    const next = cloneAuthPamState(state);
    next.lastEvalSummary = outcome.summary;
    const lines = [
      `=== Simulated PAM evaluation: service=${service} user=${user} ===`,
      "",
      `Overall: ${outcome.overall}`,
      outcome.summary,
      "",
      `auth=${outcome.authOk ? "ok" : "FAIL"}  account=${outcome.accountOk ? "ok" : "FAIL"}  session=${outcome.sessionOk ? "ok" : "FAIL"}`,
      "",
      "Module steps:",
    ];
    if (outcome.steps.length === 0) {
      lines.push("  (no steps — configuration error)");
    }
    for (const step of outcome.steps) {
      lines.push(
        `  [${step.type}] ${step.control} ${step.module} → ${step.moduleResult}`,
      );
      lines.push(`      ${step.note}`);
    }
    lines.push("");
    lines.push("Diagnostics:");
    for (const line of outcome.diagnostics) {
      lines.push(`  - ${line}`);
    }
    lines.push("");
    lines.push(
      "This evaluation never authenticates a real user or loads system PAM modules.",
    );
    return output(lines, next);
  }

  if (command === "pam-unlock") {
    const user = tokens[1];
    if (!user || !state.accounts[user]) {
      return output(
        [
          "Usage: pam-unlock USER",
          "Known users: bunsal deploy analyst backup root",
        ],
        state,
      );
    }
    const next = cloneAuthPamState(state);
    next.accounts[user]!.lockedOut = false;
    next.accounts[user]!.failCount = 0;
    return output(
      [
        `Cleared fictional lockout for '${user}' (failCount=0, locked_out=no).`,
        "On real hosts: investigate why failures occurred before unlocking.",
        `Verify with: faillock --user ${user}   and   pam-eval sshd ${user}`,
      ],
      next,
    );
  }

  if (command === "pam-extend") {
    const user = tokens[1];
    if (!user || !state.accounts[user]) {
      return output(
        [
          "Usage: pam-extend USER",
          "Known users: bunsal deploy analyst backup root",
        ],
        state,
      );
    }
    const next = cloneAuthPamState(state);
    next.accounts[user]!.expired = false;
    next.accounts[user]!.accountExpires = null;
    return output(
      [
        `Cleared fictional account expiration for '${user}'.`,
        "Account expires: never",
        "On real hosts: use chage with authorization and document the policy change.",
        `Verify with: chage -l ${user}   and   pam-eval sshd ${user}`,
      ],
      next,
    );
  }

  if (command === "pam-fix-config") {
    if (state.pamConfigValid) {
      return output(
        ["pam-fix-config: fictional PAM configuration already validates."],
        state,
      );
    }
    const next = cloneAuthPamState(state);
    next.pamServices = healthyPamServices();
    next.pamConfigValid = true;
    next.pamConfigError = null;
    return output(
      [
        "Removed invalid 'pam_magic_bypass.so' entry from fictional /etc/pam.d/sshd.",
        "Restored @include common-auth / common-account / common-session pattern.",
        "Verify with: cat /etc/pam.d/sshd   and   pam-eval sshd bunsal",
      ],
      next,
    );
  }

  if (command === "pam-harden-policy") {
    const next = cloneAuthPamState(state);
    next.passwordPolicy = healthyPasswordPolicy();
    next.pamServices = healthyPamServices();
    next.pamConfigValid = true;
    next.pamConfigError = null;
    return output(
      [
        "Applied fictional hardened authentication policy:",
        "  - pam_pwquality enabled (minlen=12)",
        "  - pam_faillock enabled (deny=5, unlock_time=900)",
        "  - pam_pwhistory enabled (remember=5)",
        "",
        "Verify with: pam-auth-update --status",
        "Preserve a recovery path before changing real authentication policy.",
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
