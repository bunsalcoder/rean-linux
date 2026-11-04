/**
 * Frontend-only sudo / privilege-management simulation for Stage 04 Lesson 04.
 * Does not execute real shell commands, invoke real sudo, prompt for passwords,
 * or read/modify host users, groups, or sudoers files.
 * All accounts, policies, logs, and changes are fictional teaching examples.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_PRIVILEGE_USER = "bunsal";
export const SIMULATED_PRIVILEGE_HOST = "rean-sudo";

export type PrivilegeScenarioId =
  | "explore"
  | "excess-admin"
  | "unrestricted-sudo"
  | "nopasswd-risk"
  | "invalid-sudoers"
  | "audit-review"
  | "healthy";

export type SudoCommandSpec =
  { kind: "all" } | { kind: "commands"; commands: readonly string[] };

export type SimulatedSudoRule = {
  id: string;
  file: string;
  principalType: "user" | "group";
  principal: string;
  runAs: "ALL";
  hosts: "ALL";
  nopasswd: boolean;
  commands: SudoCommandSpec;
  /** Educational display line shown by cat / sudo -l. */
  displayLine: string;
};

export type SimulatedSudoersFile = {
  path: string;
  contentLines: readonly string[];
  syntaxValid: boolean;
  syntaxErrorLine?: number;
  syntaxErrorMessage?: string;
};

export type SimulatedAdminLogEntry = {
  timestamp: string;
  user: string;
  command: string;
  result: "allowed" | "denied";
};

export type SimulatedPrivilegeUser = {
  name: string;
  uid: number;
  gid: number;
  primaryGroup: string;
  /** Supplementary groups (mutable in labs). */
  groups: string[];
  shell: string;
  home: string;
  gecos: string;
};

export type SimulatedPrivilegeState = {
  scenarioId: PrivilegeScenarioId;
  currentUser: string;
  users: Record<string, SimulatedPrivilegeUser>;
  rules: SimulatedSudoRule[];
  files: SimulatedSudoersFile[];
  logs: SimulatedAdminLogEntry[];
  sudoersValid: boolean;
};

export type PrivilegeScenarioMeta = {
  id: PrivilegeScenarioId;
  label: string;
  summary: string;
};

export type SimulatePrivilegeResult = {
  result: SimulateResult;
  state: SimulatedPrivilegeState;
};

export type SudoPermissionCheck = {
  allowed: boolean;
  nopasswd: boolean;
  matchedRuleId: string | null;
  reason: string;
};

export const PRIVILEGE_SCENARIOS: readonly PrivilegeScenarioMeta[] = [
  {
    id: "explore",
    label: "Explore privilege layout",
    summary:
      "Baseline fictional host with mixed sudo policies for learning inspection commands.",
  },
  {
    id: "excess-admin",
    label: "Excessive administrative access",
    summary:
      "A reporting account belongs to the sudo group without an operational need.",
  },
  {
    id: "unrestricted-sudo",
    label: "Unrestricted sudo rule",
    summary:
      "A deployment account has ALL privileges though it only needs one deploy command.",
  },
  {
    id: "nopasswd-risk",
    label: "NOPASSWD risk",
    summary:
      "A service-related account can run administrative commands without a password prompt.",
  },
  {
    id: "invalid-sudoers",
    label: "Invalid sudoers configuration",
    summary:
      "A drop-in sudoers file contains a syntax error that validation should catch.",
  },
  {
    id: "audit-review",
    label: "Administrative access audit",
    summary:
      "Review users, groups, sudo rules, and simulated activity for a short assessment.",
  },
  {
    id: "healthy",
    label: "Hardened privilege baseline",
    summary: "Findings remediated — use this to confirm a clean recheck.",
  },
] as const;

const SCENARIO_IDS = new Set<string>(
  PRIVILEGE_SCENARIOS.map((scenario) => scenario.id),
);

export function isPrivilegeScenarioId(
  value: string,
): value is PrivilegeScenarioId {
  return SCENARIO_IDS.has(value);
}

export function getPrivilegeScenario(
  id: PrivilegeScenarioId,
): PrivilegeScenarioMeta {
  return (
    PRIVILEGE_SCENARIOS.find((scenario) => scenario.id === id) ??
    PRIVILEGE_SCENARIOS[0]!
  );
}

const HELP_OUTPUT = [
  "Available commands (educational simulation):",
  "",
  "  help                              Show this help",
  "  whoami                            Show current simulated user",
  "  id [USER]                         Show uid/gid/groups",
  "  groups [USER]                     List group membership",
  "  getent group [NAME]               Inspect a fictional group",
  "  getent passwd [USER]              Inspect a fictional account",
  "  sudo -l                           List sudo privileges for current user",
  "  sudo COMMAND                      Run an explicitly supported command if allowed",
  "  visudo -c                         Validate fictional sudoers syntax",
  "  cat /etc/sudoers                  Show main sudoers (educational example)",
  "  ls /etc/sudoers.d/                List drop-in policy files",
  "  cat /etc/sudoers.d/NAME           Show a drop-in policy file",
  "  sudoers-log                       Show simulated administrative activity",
  "  switch-user USER                  Teaching helper: change current user",
  "  sudo gpasswd -d USER GROUP        Remove a user from a group (lab)",
  "  policy set-commands USER CMD      Tighten a user rule to one command (lab)",
  "  policy remove-nopasswd USER       Require a password for a user rule (lab)",
  "  policy fix-syntax                 Repair invalid drop-in syntax (lab)",
  "  clear                             Clear the terminal screen",
  "",
  "Supported sudo COMMAND targets in this lab:",
  "  /usr/local/bin/deploy-app",
  "  systemctl status nginx",
  "  journalctl -u nginx",
  "  cat /etc/shadow",
  "  apt update",
  "",
  "This terminal never runs real sudo, never prompts for a real password,",
  "and never reads or changes host users, groups, or sudoers files.",
] as const;

const BASE_USERS: readonly SimulatedPrivilegeUser[] = [
  {
    name: "root",
    uid: 0,
    gid: 0,
    primaryGroup: "root",
    groups: [],
    shell: "/bin/bash",
    home: "/root",
    gecos: "root",
  },
  {
    name: "bunsal",
    uid: 1000,
    gid: 1000,
    primaryGroup: "bunsal",
    groups: ["sudo", "developers", "operations"],
    shell: "/bin/bash",
    home: "/home/bunsal",
    gecos: "Bunsal Learner",
  },
  {
    name: "deploy",
    uid: 1001,
    gid: 1001,
    primaryGroup: "deploy",
    groups: ["developers", "operations"],
    shell: "/bin/bash",
    home: "/home/deploy",
    gecos: "Deploy Account",
  },
  {
    name: "analyst",
    uid: 1002,
    gid: 1002,
    primaryGroup: "analyst",
    groups: ["analysts"],
    shell: "/bin/bash",
    home: "/home/analyst",
    gecos: "Reporting Analyst",
  },
  {
    name: "backup",
    uid: 1003,
    gid: 1003,
    primaryGroup: "backup",
    groups: ["backup"],
    shell: "/usr/sbin/nologin",
    home: "/var/backups",
    gecos: "Backup Service",
  },
];

const KNOWN_GROUPS = [
  "root",
  "bunsal",
  "deploy",
  "analyst",
  "backup",
  "sudo",
  "developers",
  "operations",
  "analysts",
] as const;

const SUPPORTED_SUDO_COMMANDS = [
  "/usr/local/bin/deploy-app",
  "systemctl status nginx",
  "journalctl -u nginx",
  "cat /etc/shadow",
  "apt update",
] as const;

const BASE_LOGS: readonly SimulatedAdminLogEntry[] = [
  {
    timestamp: "2026-11-03T09:14:22Z",
    user: "bunsal",
    command: "sudo systemctl status nginx",
    result: "allowed",
  },
  {
    timestamp: "2026-11-03T10:02:11Z",
    user: "deploy",
    command: "sudo /usr/local/bin/deploy-app",
    result: "allowed",
  },
  {
    timestamp: "2026-11-03T11:41:05Z",
    user: "analyst",
    command: "sudo cat /etc/shadow",
    result: "denied",
  },
  {
    timestamp: "2026-11-03T13:18:44Z",
    user: "backup",
    command: "sudo apt update",
    result: "allowed",
  },
];

function cloneUser(user: SimulatedPrivilegeUser): SimulatedPrivilegeUser {
  return {
    ...user,
    groups: [...user.groups],
  };
}

function usersRecord(
  overrides?: Partial<Record<string, Partial<SimulatedPrivilegeUser>>>,
): Record<string, SimulatedPrivilegeUser> {
  const record: Record<string, SimulatedPrivilegeUser> = {};
  for (const user of BASE_USERS) {
    const override = overrides?.[user.name];
    record[user.name] = cloneUser({
      ...user,
      ...override,
      groups: override?.groups ? [...override.groups] : [...user.groups],
    });
  }
  return record;
}

function ruleLine(rule: Omit<SimulatedSudoRule, "displayLine">): string {
  const principal =
    rule.principalType === "group" ? `%${rule.principal}` : rule.principal;
  const tag = rule.nopasswd ? "NOPASSWD: " : "";
  const commands =
    rule.commands.kind === "all" ? "ALL" : rule.commands.commands.join(", ");
  return `${principal} ${rule.hosts}=(${rule.runAs}) ${tag}${commands}`;
}

function makeRule(
  partial: Omit<SimulatedSudoRule, "displayLine">,
): SimulatedSudoRule {
  return {
    ...partial,
    displayLine: ruleLine(partial),
  };
}

function mainSudoersFile(includeDefaults = true): SimulatedSudoersFile {
  const lines = [
    "# Educational example — fictional /etc/sudoers for Rean Linux labs",
    "# Do not copy to a real host without review.",
    "",
    "Defaults env_reset",
    "Defaults mail_badpass",
    "",
    "root ALL=(ALL:ALL) ALL",
    "%sudo ALL=(ALL:ALL) ALL",
  ];
  if (!includeDefaults) {
    return {
      path: "/etc/sudoers",
      contentLines: lines,
      syntaxValid: true,
    };
  }
  return {
    path: "/etc/sudoers",
    contentLines: lines,
    syntaxValid: true,
  };
}

function dropInFile(
  name: string,
  rules: readonly SimulatedSudoRule[],
  options?: {
    syntaxValid?: boolean;
    syntaxErrorLine?: number;
    syntaxErrorMessage?: string;
    extraLines?: readonly string[];
  },
): SimulatedSudoersFile {
  const path = `/etc/sudoers.d/${name}`;
  const header = [
    `# Educational example — fictional ${path}`,
    "# Labelled for teaching only.",
    "",
  ];
  const body = rules
    .filter((rule) => rule.file === path)
    .map((rule) => rule.displayLine);
  const extra = options?.extraLines ? [...options.extraLines] : [];
  return {
    path,
    contentLines: [...header, ...body, ...extra],
    syntaxValid: options?.syntaxValid ?? true,
    syntaxErrorLine: options?.syntaxErrorLine,
    syntaxErrorMessage: options?.syntaxErrorMessage,
  };
}

function rebuildFilesFromRules(
  rules: readonly SimulatedSudoRule[],
  sudoersValid: boolean,
  invalidExtra?: readonly string[],
): SimulatedSudoersFile[] {
  const main = mainSudoersFile();
  const names = [
    ...new Set(
      rules
        .map((rule) => rule.file)
        .filter((file) => file.startsWith("/etc/sudoers.d/"))
        .map((file) => file.replace("/etc/sudoers.d/", "")),
    ),
  ];

  const dropIns = names.map((name) => {
    const path = `/etc/sudoers.d/${name}`;
    const fileRules = rules.filter((rule) => rule.file === path);
    if (name === "99-broken" && !sudoersValid) {
      return dropInFile(name, fileRules, {
        syntaxValid: false,
        syntaxErrorLine: 4,
        syntaxErrorMessage:
          "syntax error near unexpected token '=' (missing runas specification)",
        extraLines: invalidExtra ?? [
          "# Broken educational example — missing parentheses around runas",
          "deploy ALL= ALL",
        ],
      });
    }
    return dropInFile(name, fileRules);
  });

  return [main, ...dropIns];
}

function baselineRules(): SimulatedSudoRule[] {
  return [
    makeRule({
      id: "root-all",
      file: "/etc/sudoers",
      principalType: "user",
      principal: "root",
      runAs: "ALL",
      hosts: "ALL",
      nopasswd: false,
      commands: { kind: "all" },
    }),
    makeRule({
      id: "group-sudo-all",
      file: "/etc/sudoers",
      principalType: "group",
      principal: "sudo",
      runAs: "ALL",
      hosts: "ALL",
      nopasswd: false,
      commands: { kind: "all" },
    }),
    makeRule({
      id: "deploy-app",
      file: "/etc/sudoers.d/10-deploy",
      principalType: "user",
      principal: "deploy",
      runAs: "ALL",
      hosts: "ALL",
      nopasswd: false,
      commands: { kind: "commands", commands: ["/usr/local/bin/deploy-app"] },
    }),
    makeRule({
      id: "bunsal-diag",
      file: "/etc/sudoers.d/20-diagnostics",
      principalType: "user",
      principal: "bunsal",
      runAs: "ALL",
      hosts: "ALL",
      nopasswd: false,
      commands: {
        kind: "commands",
        commands: ["systemctl status nginx", "journalctl -u nginx"],
      },
    }),
    makeRule({
      id: "analyst-restrict",
      file: "/etc/sudoers.d/30-analyst",
      principalType: "user",
      principal: "analyst",
      runAs: "ALL",
      hosts: "ALL",
      nopasswd: false,
      commands: {
        kind: "commands",
        commands: ["systemctl status nginx"],
      },
    }),
  ];
}

function scenarioBlueprint(scenarioId: PrivilegeScenarioId): {
  users: Record<string, SimulatedPrivilegeUser>;
  rules: SimulatedSudoRule[];
  sudoersValid: boolean;
  logs: SimulatedAdminLogEntry[];
  invalidExtra?: readonly string[];
} {
  const logs = BASE_LOGS.map((entry) => ({ ...entry }));

  switch (scenarioId) {
    case "excess-admin":
      return {
        users: usersRecord({
          analyst: { groups: ["analysts", "sudo"] },
        }),
        rules: baselineRules(),
        sudoersValid: true,
        logs,
      };
    case "unrestricted-sudo":
      return {
        users: usersRecord(),
        rules: [
          ...baselineRules().filter((rule) => rule.id !== "deploy-app"),
          makeRule({
            id: "deploy-all",
            file: "/etc/sudoers.d/10-deploy",
            principalType: "user",
            principal: "deploy",
            runAs: "ALL",
            hosts: "ALL",
            nopasswd: false,
            commands: { kind: "all" },
          }),
        ],
        sudoersValid: true,
        logs,
      };
    case "nopasswd-risk":
      return {
        users: usersRecord(),
        rules: [
          ...baselineRules(),
          makeRule({
            id: "backup-nopasswd",
            file: "/etc/sudoers.d/40-backup",
            principalType: "user",
            principal: "backup",
            runAs: "ALL",
            hosts: "ALL",
            nopasswd: true,
            commands: {
              kind: "commands",
              commands: ["apt update", "cat /etc/shadow"],
            },
          }),
        ],
        sudoersValid: true,
        logs,
      };
    case "invalid-sudoers":
      return {
        users: usersRecord(),
        rules: [
          ...baselineRules().filter((rule) => rule.id !== "deploy-app"),
          makeRule({
            id: "deploy-broken",
            file: "/etc/sudoers.d/99-broken",
            principalType: "user",
            principal: "deploy",
            runAs: "ALL",
            hosts: "ALL",
            nopasswd: false,
            commands: { kind: "all" },
          }),
        ],
        sudoersValid: false,
        logs,
        invalidExtra: [
          "# Broken educational example — missing parentheses around runas",
          "deploy ALL= ALL",
        ],
      };
    case "audit-review":
      return {
        users: usersRecord({
          analyst: { groups: ["analysts", "sudo"] },
        }),
        rules: [
          ...baselineRules().filter((rule) => rule.id !== "deploy-app"),
          makeRule({
            id: "deploy-all",
            file: "/etc/sudoers.d/10-deploy",
            principalType: "user",
            principal: "deploy",
            runAs: "ALL",
            hosts: "ALL",
            nopasswd: false,
            commands: { kind: "all" },
          }),
          makeRule({
            id: "backup-nopasswd",
            file: "/etc/sudoers.d/40-backup",
            principalType: "user",
            principal: "backup",
            runAs: "ALL",
            hosts: "ALL",
            nopasswd: true,
            commands: {
              kind: "commands",
              commands: ["apt update", "cat /etc/shadow"],
            },
          }),
        ],
        sudoersValid: true,
        logs,
      };
    case "healthy":
      return {
        users: usersRecord({
          analyst: { groups: ["analysts"] },
          deploy: { groups: ["developers", "operations"] },
        }),
        rules: baselineRules(),
        sudoersValid: true,
        logs: logs.filter((entry) => entry.user !== "backup"),
      };
    case "explore":
    default:
      return {
        users: usersRecord(),
        rules: [
          ...baselineRules(),
          makeRule({
            id: "backup-nopasswd-explore",
            file: "/etc/sudoers.d/40-backup",
            principalType: "user",
            principal: "backup",
            runAs: "ALL",
            hosts: "ALL",
            nopasswd: true,
            commands: {
              kind: "commands",
              commands: ["apt update"],
            },
          }),
        ],
        sudoersValid: true,
        logs,
      };
  }
}

export function createInitialPrivilegeState(
  scenarioId: PrivilegeScenarioId = "explore",
): SimulatedPrivilegeState {
  const blueprint = scenarioBlueprint(scenarioId);
  return {
    scenarioId,
    currentUser: SIMULATED_PRIVILEGE_USER,
    users: blueprint.users,
    rules: blueprint.rules,
    files: rebuildFilesFromRules(
      blueprint.rules,
      blueprint.sudoersValid,
      blueprint.invalidExtra,
    ),
    logs: blueprint.logs,
    sudoersValid: blueprint.sudoersValid,
  };
}

export function clonePrivilegeState(
  state: SimulatedPrivilegeState,
): SimulatedPrivilegeState {
  const users: Record<string, SimulatedPrivilegeUser> = {};
  for (const [name, user] of Object.entries(state.users)) {
    users[name] = cloneUser(user);
  }
  return {
    scenarioId: state.scenarioId,
    currentUser: state.currentUser,
    users,
    rules: state.rules.map((rule) => ({
      ...rule,
      commands:
        rule.commands.kind === "all"
          ? { kind: "all" }
          : { kind: "commands", commands: [...rule.commands.commands] },
    })),
    files: state.files.map((file) => ({
      ...file,
      contentLines: [...file.contentLines],
    })),
    logs: state.logs.map((entry) => ({ ...entry })),
    sudoersValid: state.sudoersValid,
  };
}

export function formatPrivilegePrompt(user?: string): string {
  const name = user ?? SIMULATED_PRIVILEGE_USER;
  return `${name}@${SIMULATED_PRIVILEGE_HOST}:~$ `;
}

function tokenize(raw: string): string[] {
  return raw.trim().split(/\s+/).filter(Boolean);
}

function output(
  lines: readonly string[],
  state: SimulatedPrivilegeState,
): SimulatePrivilegeResult {
  return { result: { kind: "output", lines }, state };
}

function groupMembers(
  state: SimulatedPrivilegeState,
  groupName: string,
): string[] {
  const members: string[] = [];
  for (const user of Object.values(state.users)) {
    if (user.primaryGroup === groupName || user.groups.includes(groupName)) {
      members.push(user.name);
    }
  }
  return members.sort();
}

export function isUserInGroup(
  state: SimulatedPrivilegeState,
  username: string,
  groupName: string,
): boolean {
  const user = state.users[username];
  if (!user) return false;
  return user.primaryGroup === groupName || user.groups.includes(groupName);
}

function rulesForUser(
  state: SimulatedPrivilegeState,
  username: string,
): SimulatedSudoRule[] {
  const user = state.users[username];
  if (!user) return [];
  return state.rules.filter((rule) => {
    if (rule.principalType === "user") {
      return rule.principal === username;
    }
    return isUserInGroup(state, username, rule.principal);
  });
}

export function listSudoPrivileges(
  state: SimulatedPrivilegeState,
  username: string,
): readonly SimulatedSudoRule[] {
  return rulesForUser(state, username);
}

export function userHasAdministrativeAccess(
  state: SimulatedPrivilegeState,
  username: string,
): boolean {
  if (username === "root") return true;
  return rulesForUser(state, username).length > 0;
}

export function hasUnrestrictedSudo(
  state: SimulatedPrivilegeState,
  username: string,
): boolean {
  return rulesForUser(state, username).some(
    (rule) => rule.commands.kind === "all",
  );
}

export function hasNopasswdRule(
  state: SimulatedPrivilegeState,
  username: string,
): boolean {
  return rulesForUser(state, username).some((rule) => rule.nopasswd);
}

export function hasCommandSpecificRule(
  state: SimulatedPrivilegeState,
  username: string,
  command: string,
): boolean {
  return rulesForUser(state, username).some(
    (rule) =>
      rule.commands.kind === "commands" &&
      rule.commands.commands.includes(command),
  );
}

export function sudoersSyntaxValid(state: SimulatedPrivilegeState): boolean {
  return state.sudoersValid && state.files.every((file) => file.syntaxValid);
}

function normalizeSudoTarget(tokens: readonly string[]): string {
  return tokens.join(" ").trim();
}

function commandMatchesSpec(spec: SudoCommandSpec, command: string): boolean {
  if (spec.kind === "all") return true;
  return spec.commands.includes(command);
}

/**
 * Narrow policy evaluator for the educational subset documented in this lesson.
 * Does not parse arbitrary sudoers text as code.
 */
export function evaluateSudoPermission(
  state: SimulatedPrivilegeState,
  username: string,
  command: string,
): SudoPermissionCheck {
  if (username === "root") {
    return {
      allowed: true,
      nopasswd: true,
      matchedRuleId: "root-implicit",
      reason: "UID 0 has unrestricted administrative authority in this lab.",
    };
  }

  if (!state.sudoersValid) {
    return {
      allowed: false,
      nopasswd: false,
      matchedRuleId: null,
      reason:
        "Simulated sudoers configuration is invalid — fix syntax before relying on policy.",
    };
  }

  const matching = rulesForUser(state, username).filter((rule) =>
    commandMatchesSpec(rule.commands, command),
  );

  if (matching.length === 0) {
    return {
      allowed: false,
      nopasswd: false,
      matchedRuleId: null,
      reason: `Sorry, user ${username} is not allowed to execute '${command}' as root on ${SIMULATED_PRIVILEGE_HOST}.`,
    };
  }

  const preferred =
    matching.find((rule) => rule.commands.kind === "commands") ?? matching[0]!;

  return {
    allowed: true,
    nopasswd: preferred.nopasswd,
    matchedRuleId: preferred.id,
    reason: preferred.nopasswd
      ? "Matched a NOPASSWD rule (educational simulation — no real password prompt)."
      : "Matched a sudo rule (educational simulation — password would be required on a real host).",
  };
}

function formatIdLine(
  state: SimulatedPrivilegeState,
  username: string,
): string[] {
  const user = state.users[username];
  if (!user) {
    return [`id: ‘${username}’: no such user`];
  }
  const groups = [user.primaryGroup, ...user.groups];
  const unique = [...new Set(groups)];
  const groupPart = unique
    .map((groupName) => {
      const gid =
        Object.values(state.users).find((u) => u.primaryGroup === groupName)
          ?.gid ??
        (groupName === "sudo"
          ? 27
          : groupName === "developers"
            ? 1100
            : groupName === "operations"
              ? 1101
              : groupName === "analysts"
                ? 1102
                : groupName === "backup"
                  ? 1103
                  : user.gid);
      return `${gid}(${groupName})`;
    })
    .join(",");
  return [
    `uid=${user.uid}(${user.name}) gid=${user.gid}(${user.primaryGroup}) groups=${groupPart}`,
  ];
}

function formatSudoList(
  state: SimulatedPrivilegeState,
  username: string,
): string[] {
  const user = state.users[username];
  if (!user) {
    return [`sudo: unknown user ${username}`];
  }

  if (!state.sudoersValid) {
    return [
      `sudo: parse error in /etc/sudoers.d/99-broken near line 4`,
      `sudo: no valid sudoers sources found, quitting`,
      `sudo: error initializing audit plugin sudoers_audit`,
    ];
  }

  const rules = rulesForUser(state, username);
  if (rules.length === 0) {
    return [
      `User ${username} is not allowed to run sudo on ${SIMULATED_PRIVILEGE_HOST}.`,
    ];
  }

  const lines = [
    `Matching Defaults entries for ${username} on ${SIMULATED_PRIVILEGE_HOST}:`,
    `    env_reset, mail_badpass`,
    "",
    `User ${username} may run the following commands on ${SIMULATED_PRIVILEGE_HOST}:`,
  ];
  for (const rule of rules) {
    lines.push(`    ${rule.displayLine}`);
  }
  return lines;
}

function runSupportedSudoCommand(command: string): readonly string[] {
  switch (command) {
    case "/usr/local/bin/deploy-app":
      return [
        "[deploy-app] starting fictional deployment…",
        "[deploy-app] build artifact synced",
        "[deploy-app] health check OK",
        "[deploy-app] done (simulated)",
      ];
    case "systemctl status nginx":
      return [
        "● nginx.service - A high performance web server (simulated)",
        "     Loaded: loaded (/lib/systemd/system/nginx.service; enabled)",
        "     Active: active (running) since Mon 2026-11-03 08:00:00 UTC",
      ];
    case "journalctl -u nginx":
      return [
        "-- Simulated journal for nginx.service --",
        "Nov 03 08:00:01 rean-sudo systemd[1]: Started nginx.service.",
        "Nov 03 09:14:22 rean-sudo nginx[512]: worker process started",
      ];
    case "cat /etc/shadow":
      return [
        "root:*:20300:0:99999:7:::",
        "bunsal:*:20300:0:99999:7:::",
        "deploy:*:20300:0:99999:7:::",
        "analyst:*:20300:0:99999:7:::",
        "backup:*:20300:0:99999:7:::",
        "# Educational placeholder hashes only — not real credentials.",
      ];
    case "apt update":
      return [
        "Hit:1 http://archive.example/ubuntu jammy InRelease (simulated)",
        "Reading package lists... Done",
        "Building dependency tree... Done",
      ];
    default:
      return [`(simulated) ran: ${command}`];
  }
}

function appendLog(
  state: SimulatedPrivilegeState,
  command: string,
  result: "allowed" | "denied",
): SimulatedPrivilegeState {
  const next = clonePrivilegeState(state);
  next.logs = [
    ...next.logs,
    {
      timestamp: "2026-11-04T08:00:00Z",
      user: state.currentUser,
      command: `sudo ${command}`,
      result,
    },
  ];
  return next;
}

function syncFiles(state: SimulatedPrivilegeState): SimulatedPrivilegeState {
  const next = clonePrivilegeState(state);
  next.files = rebuildFilesFromRules(next.rules, next.sudoersValid);
  return next;
}

export function simulatePrivilegeCommand(
  raw: string,
  state: SimulatedPrivilegeState,
): SimulatePrivilegeResult {
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

  if (command === "id") {
    const target = tokens[1] ?? state.currentUser;
    return output(formatIdLine(state, target), state);
  }

  if (command === "groups") {
    const target = tokens[1] ?? state.currentUser;
    const user = state.users[target];
    if (!user) {
      return output([`groups: ‘${target}’: no such user`], state);
    }
    const names = [user.primaryGroup, ...user.groups];
    return output([`${target} : ${[...new Set(names)].join(" ")}`], state);
  }

  if (command === "getent") {
    const database = tokens[1]?.toLowerCase();
    const key = tokens[2];
    if (database === "group") {
      if (!key) {
        const lines = KNOWN_GROUPS.map((name) => {
          const members = groupMembers(state, name);
          const gid =
            Object.values(state.users).find((u) => u.primaryGroup === name)
              ?.gid ??
            (name === "sudo"
              ? 27
              : name === "developers"
                ? 1100
                : name === "operations"
                  ? 1101
                  : name === "analysts"
                    ? 1102
                    : 1103);
          return `${name}:x:${gid}:${members.join(",")}`;
        });
        return output(lines, state);
      }
      if (!KNOWN_GROUPS.includes(key as (typeof KNOWN_GROUPS)[number])) {
        return output([], state);
      }
      const members = groupMembers(state, key);
      const gid =
        Object.values(state.users).find((u) => u.primaryGroup === key)?.gid ??
        (key === "sudo" ? 27 : 1100);
      return output([`${key}:x:${gid}:${members.join(",")}`], state);
    }
    if (database === "passwd") {
      if (!key) {
        return output(
          Object.values(state.users).map(
            (user) =>
              `${user.name}:x:${user.uid}:${user.gid}:${user.gecos}:${user.home}:${user.shell}`,
          ),
          state,
        );
      }
      const user = state.users[key];
      if (!user) {
        return output([], state);
      }
      return output(
        [
          `${user.name}:x:${user.uid}:${user.gid}:${user.gecos}:${user.home}:${user.shell}`,
        ],
        state,
      );
    }
    return output(
      [
        "getent: unsupported database in this lab. Try: getent group sudo",
        "or: getent passwd analyst",
      ],
      state,
    );
  }

  if (command === "visudo") {
    if (tokens[1] === "-c") {
      if (sudoersSyntaxValid(state)) {
        return output(
          [
            "/etc/sudoers: parsed OK",
            ...state.files
              .filter((file) => file.path.startsWith("/etc/sudoers.d/"))
              .map((file) => `${file.path}: parsed OK`),
          ],
          state,
        );
      }
      const broken = state.files.find((file) => !file.syntaxValid);
      return output(
        [
          `>>> ${broken?.path ?? "/etc/sudoers.d/99-broken"}: syntax error near line ${broken?.syntaxErrorLine ?? 4} <<<`,
          broken?.syntaxErrorMessage ??
            "syntax error in simulated sudoers drop-in",
          "visudo: Error: invalid sudoers configuration (educational simulation)",
        ],
        state,
      );
    }
    return output(
      [
        "visudo: interactive editing is not available in this learning terminal.",
        "Use: visudo -c",
        "Or lab helpers: policy fix-syntax",
      ],
      state,
    );
  }

  if (command === "ls") {
    const target = tokens[1] ?? "";
    if (
      target === "/etc/sudoers.d" ||
      target === "/etc/sudoers.d/" ||
      target === "-1" ||
      (tokens[1] === "-1" && tokens[2]?.startsWith("/etc/sudoers.d"))
    ) {
      const names = state.files
        .filter((file) => file.path.startsWith("/etc/sudoers.d/"))
        .map((file) => file.path.replace("/etc/sudoers.d/", ""));
      return output(names.length > 0 ? names : ["(empty)"], state);
    }
    return output(
      [`ls: unsupported path in this lab. Try: ls /etc/sudoers.d/`],
      state,
    );
  }

  if (command === "cat") {
    const path = tokens[1];
    if (!path) {
      return output(["cat: missing file operand"], state);
    }
    const file = state.files.find((entry) => entry.path === path);
    if (!file) {
      return output(
        [
          `cat: ${path}: No such file or directory (in this simulation)`,
          "Try: cat /etc/sudoers   or   cat /etc/sudoers.d/10-deploy",
        ],
        state,
      );
    }
    return output(
      [
        ...file.contentLines,
        "",
        "# Reminder: fictional educational example — not a real host file.",
      ],
      state,
    );
  }

  if (command === "sudoers-log") {
    const lines = [
      "Simulated administrative activity log (fictional):",
      "",
      ...state.logs.map(
        (entry) =>
          `${entry.timestamp}  user=${entry.user}  result=${entry.result}  cmd=${entry.command}`,
      ),
    ];
    return output(lines, state);
  }

  if (command === "switch-user") {
    const target = tokens[1];
    if (!target || !state.users[target]) {
      return output(
        [
          "Usage: switch-user USER",
          "Known users: bunsal, deploy, analyst, backup, root",
        ],
        state,
      );
    }
    const next = clonePrivilegeState(state);
    next.currentUser = target;
    return output(
      [
        `Switched simulated session user to ${target}.`,
        "(Teaching helper only — not a real login.)",
      ],
      next,
    );
  }

  if (command === "policy") {
    const action = tokens[1]?.toLowerCase();
    if (action === "set-commands") {
      const user = tokens[2];
      const cmd = tokens.slice(3).join(" ");
      if (!user || !cmd) {
        return output(
          [
            "Usage: policy set-commands USER COMMAND",
            "Example: policy set-commands deploy /usr/local/bin/deploy-app",
          ],
          state,
        );
      }
      if (!state.users[user]) {
        return output([`policy: unknown user ${user}`], state);
      }
      const next = clonePrivilegeState(state);
      next.rules = next.rules
        .filter(
          (rule) => !(rule.principalType === "user" && rule.principal === user),
        )
        .concat([
          makeRule({
            id: `${user}-tightened`,
            file: `/etc/sudoers.d/10-${user}`,
            principalType: "user",
            principal: user,
            runAs: "ALL",
            hosts: "ALL",
            nopasswd: false,
            commands: { kind: "commands", commands: [cmd] },
          }),
        ]);
      const synced = syncFiles(next);
      return output(
        [
          `Updated fictional sudo policy for ${user} to command-specific rule:`,
          `  ${user} ALL=(ALL) ${cmd}`,
          "Least privilege: grant only the elevated operation the role needs.",
        ],
        synced,
      );
    }

    if (action === "remove-nopasswd") {
      const user = tokens[2];
      if (!user) {
        return output(
          [
            "Usage: policy remove-nopasswd USER",
            "Example: policy remove-nopasswd backup",
          ],
          state,
        );
      }
      const next = clonePrivilegeState(state);
      let changed = false;
      next.rules = next.rules.map((rule) => {
        if (
          rule.principalType === "user" &&
          rule.principal === user &&
          rule.nopasswd
        ) {
          changed = true;
          return makeRule({
            ...rule,
            nopasswd: false,
          });
        }
        return rule;
      });
      if (!changed) {
        return output(
          [`policy: no NOPASSWD user rule found for ${user}`],
          state,
        );
      }
      const synced = syncFiles(next);
      return output(
        [
          `Removed NOPASSWD from fictional sudo rules for ${user}.`,
          "A password prompt would now be required on a real host for these commands.",
        ],
        synced,
      );
    }

    if (action === "fix-syntax") {
      if (state.sudoersValid) {
        return output(
          ["policy: simulated sudoers configuration is already valid."],
          state,
        );
      }
      const next = clonePrivilegeState(state);
      next.sudoersValid = true;
      next.rules = next.rules.map((rule) => {
        if (rule.id === "deploy-broken") {
          return makeRule({
            id: "deploy-app",
            file: "/etc/sudoers.d/10-deploy",
            principalType: "user",
            principal: "deploy",
            runAs: "ALL",
            hosts: "ALL",
            nopasswd: false,
            commands: {
              kind: "commands",
              commands: ["/usr/local/bin/deploy-app"],
            },
          });
        }
        return rule;
      });
      next.rules = next.rules.filter(
        (rule) => rule.file !== "/etc/sudoers.d/99-broken",
      );
      next.files = rebuildFilesFromRules(next.rules, true);
      return output(
        [
          "Repaired fictional drop-in syntax.",
          "Replaced invalid `deploy ALL= ALL` with a valid command-specific rule:",
          "  deploy ALL=(ALL) /usr/local/bin/deploy-app",
          "Run: visudo -c",
        ],
        next,
      );
    }

    return output(
      [
        "Unknown policy action. Supported lab helpers:",
        "  policy set-commands USER COMMAND",
        "  policy remove-nopasswd USER",
        "  policy fix-syntax",
      ],
      state,
    );
  }

  if (command === "sudo") {
    const sub = tokens[1]?.toLowerCase();

    if (!sub) {
      return output(["usage: sudo -h | -l | command"], state);
    }

    if (sub === "-l" || sub === "--list") {
      return output(formatSudoList(state, state.currentUser), state);
    }

    if (sub === "-i" || sub === "-s" || sub === "su" || tokens[1] === "-") {
      return output(
        [
          "sudo: interactive root shells (-i/-s) are not available in this learning terminal.",
          "Prefer `sudo COMMAND` for a single elevated operation when authorized.",
          "Difference: `sudo command` elevates one action; a root shell elevates an entire session.",
        ],
        state,
      );
    }

    if (sub === "gpasswd") {
      if (tokens[2] !== "-d" || !tokens[3] || !tokens[4]) {
        return output(["Supported form: sudo gpasswd -d USER GROUP"], state);
      }
      const targetUser = tokens[3]!;
      const groupName = tokens[4]!;
      const check = evaluateSudoPermission(
        state,
        state.currentUser,
        `gpasswd -d ${targetUser} ${groupName}`,
      );
      // Allow bunsal (admin-in-training with sudo group) to manage group membership in labs.
      const adminOk =
        state.currentUser === "root" ||
        isUserInGroup(state, state.currentUser, "sudo") ||
        hasUnrestrictedSudo(state, state.currentUser);

      if (!adminOk && !check.allowed) {
        const denied = appendLog(
          state,
          `gpasswd -d ${targetUser} ${groupName}`,
          "denied",
        );
        return output(
          [
            `Sorry, user ${state.currentUser} is not allowed to run 'gpasswd' as root on ${SIMULATED_PRIVILEGE_HOST}.`,
          ],
          denied,
        );
      }

      const user = state.users[targetUser];
      if (!user) {
        return output([`gpasswd: user '${targetUser}' does not exist`], state);
      }
      if (!user.groups.includes(groupName)) {
        return output(
          [`gpasswd: user '${targetUser}' is not a member of '${groupName}'`],
          state,
        );
      }
      const next = clonePrivilegeState(state);
      next.users[targetUser] = {
        ...user,
        groups: user.groups.filter((group) => group !== groupName),
      };
      const logged = appendLog(
        next,
        `gpasswd -d ${targetUser} ${groupName}`,
        "allowed",
      );
      return output(
        [
          `Removing user ${targetUser} from group ${groupName} (simulated).`,
          "Re-check with: id " + targetUser + " · getent group " + groupName,
        ],
        logged,
      );
    }

    const sudoTarget = normalizeSudoTarget(tokens.slice(1));
    const supported = (SUPPORTED_SUDO_COMMANDS as readonly string[]).includes(
      sudoTarget,
    );
    if (!supported) {
      return output(
        [
          `sudo: unsupported command in this lab: ${sudoTarget}`,
          "Supported targets:",
          ...SUPPORTED_SUDO_COMMANDS.map((item) => `  ${item}`),
          "Also: sudo -l · sudo gpasswd -d USER GROUP",
        ],
        state,
      );
    }

    const permission = evaluateSudoPermission(
      state,
      state.currentUser,
      sudoTarget,
    );
    if (!permission.allowed) {
      const denied = appendLog(state, sudoTarget, "denied");
      return output([permission.reason], denied);
    }

    const allowedState = appendLog(state, sudoTarget, "allowed");
    const preface = permission.nopasswd
      ? [
          `[lab] NOPASSWD matched — simulated elevation without a password prompt.`,
          permission.reason,
          "",
        ]
      : [
          `[lab] Password would be required on a real host (not prompted here).`,
          permission.reason,
          "",
        ];
    return output(
      [...preface, ...runSupportedSudoCommand(sudoTarget)],
      allowedState,
    );
  }

  if (command === "su" || command === "sudoers") {
    return output(
      [
        `${command}: not available as an interactive admin path in this lab.`,
        "Inspect with sudo -l, cat /etc/sudoers, and visudo -c instead.",
      ],
      state,
    );
  }

  return output(
    [
      `Command not available in this privilege-management terminal: ${tokens[0]}`,
      'Try "help" to see supported educational commands.',
    ],
    state,
  );
}
