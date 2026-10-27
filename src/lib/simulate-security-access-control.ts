/**
 * Frontend-only Linux access-control simulation for Stage 04 Lesson 02.
 * Does not execute real shell commands or inspect host users, groups, or files.
 * All accounts, memberships, and permissions are fictional teaching examples.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_ACCESS_USER = "bunsal";
export const SIMULATED_ACCESS_HOST = "rean-access";

export type AccessRiskLevel = "critical" | "high" | "medium" | "low";

export type AccessFindingId =
  | "config-world-readable"
  | "deploy-script-writable"
  | "deploy-in-sudo"
  | "backup-interactive-shell"
  | "shared-world-writable";

export type AccessControlScenarioId =
  | "full-review"
  | "config-readable"
  | "deploy-writable"
  | "excess-sudo"
  | "service-shell"
  | "shared-perms"
  | "least-privilege"
  | "authn-vs-authz"
  | "healthy";

export type AccessFinding = {
  id: AccessFindingId;
  title: string;
  description: string;
  risk: AccessRiskLevel;
  evidenceHint: string;
  remediation: string;
  principle: string;
};

export type SimulatedAccessControlState = {
  scenarioId: AccessControlScenarioId;
  /** deploy incorrectly belongs to the sudo group. */
  deployInSudo: boolean;
  /** backup service account still has an interactive login shell. */
  backupShell: "/bin/bash" | "/usr/sbin/nologin";
  /** Mode for /srv/app/config.yml — 0644 is too open; 0640 is remediated. */
  configMode: "0644" | "0640";
  /** Group ownership for /srv/app/deploy.sh — reports is unintended. */
  deployScriptGroup: "reports" | "deployers";
  /** Mode for /srv/app/deploy.sh — 0775 is too open; 0750 is remediated. */
  deployScriptMode: "0775" | "0750";
  /** Mode for /tmp/shared-report.txt — 0666 is too open; 0640 is remediated. */
  sharedReportMode: "0666" | "0640";
};

export type AccessControlScenarioMeta = {
  id: AccessControlScenarioId;
  label: string;
  summary: string;
};

export type SimulateAccessControlResult = {
  result: SimulateResult;
  state: SimulatedAccessControlState;
};

type SimulatedUser = {
  name: string;
  uid: number;
  gid: number;
  gecos: string;
  home: string;
  shell: string;
  primaryGroup: string;
  /** Supplementary groups excluding the primary group. */
  groups: readonly string[];
  kind: "root" | "system" | "human" | "service";
};

type SimulatedFile = {
  path: string;
  type: "file" | "directory";
  owner: string;
  group: string;
  mode: string;
  size: number;
  mtime: string;
};

export const ACCESS_FINDINGS: readonly AccessFinding[] = [
  {
    id: "config-world-readable",
    title: "Sensitive configuration readable too broadly",
    description:
      "/srv/app/config.yml is world-readable (0644), so local users who do not need the app secrets can still read them.",
    risk: "critical",
    evidenceHint: "ls -l /srv/app/config.yml · stat /srv/app/config.yml",
    remediation: "Restrict the file to owner/group read (chmod 640).",
    principle: "Least privilege for files — protect confidentiality.",
  },
  {
    id: "deploy-script-writable",
    title: "Deployment script writable by unintended group",
    description:
      "/srv/app/deploy.sh is group-owned by reports with write permission, so analysts could alter deployment behavior.",
    risk: "high",
    evidenceHint: "ls -l /srv/app/deploy.sh · namei -l /srv/app/deploy.sh",
    remediation:
      "Move group ownership to deployers and tighten mode (chgrp + chmod 750).",
    principle: "Authorization should match operational role.",
  },
  {
    id: "deploy-in-sudo",
    title: "Unnecessary administrative group membership",
    description:
      "The deploy account belongs to sudo even though deployments should not require full administrative rights.",
    risk: "high",
    evidenceHint: "id deploy · groups deploy · getent group sudo",
    remediation: "Remove deploy from sudo (sudo gpasswd -d deploy sudo).",
    principle: "Least privilege — grant only the access a role needs.",
  },
  {
    id: "backup-interactive-shell",
    title: "Service account usable for interactive administration",
    description:
      "The backup service account has /bin/bash, inviting routine interactive login instead of a non-login service shell.",
    risk: "medium",
    evidenceHint: "getent passwd backup · id backup",
    remediation:
      "Set a non-interactive shell (set-shell backup /usr/sbin/nologin).",
    principle:
      "Service identities should not double as day-to-day admin accounts.",
  },
  {
    id: "shared-world-writable",
    title: "Shared file permissions broader than intended",
    description:
      "/tmp/shared-report.txt is world-writable (0666), so any local user can overwrite the shared report.",
    risk: "medium",
    evidenceHint: "ls -l /tmp/shared-report.txt · stat /tmp/shared-report.txt",
    remediation: "Remove world write and limit to owner/group (chmod 640).",
    principle: "Shared locations still need deliberate permission boundaries.",
  },
] as const;

export const ACCESS_CONTROL_SCENARIOS: readonly AccessControlScenarioMeta[] = [
  {
    id: "full-review",
    label: "Full access-control review",
    summary:
      "A fictional app host with several identity and permission findings across users, groups, and files.",
  },
  {
    id: "config-readable",
    label: "Overly readable configuration",
    summary: "Focus on a sensitive config file readable by too many users.",
  },
  {
    id: "deploy-writable",
    label: "Writable deployment script",
    summary: "A deploy script is writable by an unintended group.",
  },
  {
    id: "excess-sudo",
    label: "Unnecessary sudo membership",
    summary: "A deployment account has administrative group membership.",
  },
  {
    id: "service-shell",
    label: "Interactive service account",
    summary: "A backup service account still has a login shell.",
  },
  {
    id: "shared-perms",
    label: "Overly broad shared permissions",
    summary: "A shared report file is world-writable.",
  },
  {
    id: "least-privilege",
    label: "Least privilege decisions",
    summary:
      "Compare intended roles with current group and file grants before changing anything.",
  },
  {
    id: "authn-vs-authz",
    label: "Authentication vs authorization",
    summary:
      "Separate proving identity from deciding what that identity may access.",
  },
  {
    id: "healthy",
    label: "Hardened access baseline",
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
  "  getent passwd [USER]              Show simulated passwd entries",
  "  getent group [GROUP]              Show simulated group entries",
  "  ls -l PATH                        List permissions for supported paths",
  "  ls -ld PATH                       List a directory itself",
  "  stat PATH                         Show detailed file metadata",
  "  namei -l PATH                     Walk path components with ownership",
  "  chmod MODE PATH                   Apply a supported permission change",
  "  sudo chgrp GROUP PATH             Change group ownership (supported paths)",
  "  sudo gpasswd -d USER GROUP        Remove a user from a group",
  "  set-shell USER SHELL              Teaching command: change a login shell",
  "  access-review                     Summarize open access findings (lab only)",
  "  clear                             Clear the terminal screen",
  "",
  "Examples:",
  "  id deploy",
  "  getent passwd backup",
  "  ls -l /srv/app/config.yml",
  "  namei -l /srv/app/deploy.sh",
  "  chmod 640 /srv/app/config.yml",
  "",
  "All users, groups, and files are fictional teaching examples.",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const SUPPORTED_PATHS = [
  "/srv/app/config.yml",
  "/srv/app/deploy.sh",
  "/srv/reports/monthly.csv",
  "/srv/backups",
  "/srv/backups/",
  "/tmp/shared-report.txt",
  "/srv/app",
  "/srv/reports",
  "/tmp",
  "/srv",
] as const;

function cloneState(
  state: SimulatedAccessControlState,
): SimulatedAccessControlState {
  return { ...state };
}

function healthyState(
  scenarioId: AccessControlScenarioId,
): SimulatedAccessControlState {
  return {
    scenarioId,
    deployInSudo: false,
    backupShell: "/usr/sbin/nologin",
    configMode: "0640",
    deployScriptGroup: "deployers",
    deployScriptMode: "0750",
    sharedReportMode: "0640",
  };
}

function scenarioState(
  scenarioId: AccessControlScenarioId,
): SimulatedAccessControlState {
  const healthy = healthyState(scenarioId);

  switch (scenarioId) {
    case "healthy":
      return healthy;
    case "config-readable":
      return { ...healthy, configMode: "0644" };
    case "deploy-writable":
      return {
        ...healthy,
        deployScriptGroup: "reports",
        deployScriptMode: "0775",
      };
    case "excess-sudo":
    case "least-privilege":
      return { ...healthy, deployInSudo: true };
    case "service-shell":
      return { ...healthy, backupShell: "/bin/bash" };
    case "shared-perms":
      return { ...healthy, sharedReportMode: "0666" };
    case "authn-vs-authz":
      return {
        ...healthy,
        deployInSudo: true,
        configMode: "0644",
      };
    case "full-review":
    default:
      return {
        scenarioId,
        deployInSudo: true,
        backupShell: "/bin/bash",
        configMode: "0644",
        deployScriptGroup: "reports",
        deployScriptMode: "0775",
        sharedReportMode: "0666",
      };
  }
}

export function createInitialAccessControlState(
  scenarioId: AccessControlScenarioId = "full-review",
): SimulatedAccessControlState {
  return scenarioState(scenarioId);
}

export function cloneAccessControlState(
  state: SimulatedAccessControlState,
): SimulatedAccessControlState {
  return cloneState(state);
}

export function isAccessControlScenarioId(
  value: string,
): value is AccessControlScenarioId {
  return ACCESS_CONTROL_SCENARIOS.some((scenario) => scenario.id === value);
}

export function getAccessControlScenario(
  scenarioId: AccessControlScenarioId,
): AccessControlScenarioMeta {
  return (
    ACCESS_CONTROL_SCENARIOS.find((scenario) => scenario.id === scenarioId) ??
    ACCESS_CONTROL_SCENARIOS[0]!
  );
}

export function getAccessFinding(findingId: AccessFindingId): AccessFinding {
  return ACCESS_FINDINGS.find((finding) => finding.id === findingId)!;
}

export function formatAccessControlPrompt(): string {
  return `${SIMULATED_ACCESS_USER}@${SIMULATED_ACCESS_HOST}:~$ `;
}

export function isAccessFindingRemediated(
  state: SimulatedAccessControlState,
  findingId: AccessFindingId,
): boolean {
  switch (findingId) {
    case "config-world-readable":
      return state.configMode === "0640";
    case "deploy-script-writable":
      return (
        state.deployScriptGroup === "deployers" &&
        state.deployScriptMode === "0750"
      );
    case "deploy-in-sudo":
      return !state.deployInSudo;
    case "backup-interactive-shell":
      return state.backupShell === "/usr/sbin/nologin";
    case "shared-world-writable":
      return state.sharedReportMode === "0640";
  }
}

export function listOpenAccessFindings(
  state: SimulatedAccessControlState,
): readonly AccessFinding[] {
  return ACCESS_FINDINGS.filter(
    (finding) => !isAccessFindingRemediated(state, finding.id),
  );
}

function buildUsers(state: SimulatedAccessControlState): SimulatedUser[] {
  const deployGroups = state.deployInSudo
    ? (["sudo", "deployers"] as const)
    : (["deployers"] as const);

  return [
    {
      name: "root",
      uid: 0,
      gid: 0,
      gecos: "root",
      home: "/root",
      shell: "/bin/bash",
      primaryGroup: "root",
      groups: [],
      kind: "root",
    },
    {
      name: "daemon",
      uid: 1,
      gid: 1,
      gecos: "daemon",
      home: "/usr/sbin",
      shell: "/usr/sbin/nologin",
      primaryGroup: "daemon",
      groups: [],
      kind: "system",
    },
    {
      name: "backup",
      uid: 110,
      gid: 110,
      gecos: "Backup Service",
      home: "/var/backups",
      shell: state.backupShell,
      primaryGroup: "backup",
      groups: [],
      kind: "service",
    },
    {
      name: "bunsal",
      uid: 1000,
      gid: 1000,
      gecos: "Bunsal Learner",
      home: "/home/bunsal",
      shell: "/bin/bash",
      primaryGroup: "bunsal",
      groups: ["sudo", "deployers"],
      kind: "human",
    },
    {
      name: "deploy",
      uid: 1001,
      gid: 1001,
      gecos: "Deploy Service",
      home: "/home/deploy",
      shell: "/bin/bash",
      primaryGroup: "deploy",
      groups: deployGroups,
      kind: "service",
    },
    {
      name: "analyst",
      uid: 1002,
      gid: 1002,
      gecos: "Report Analyst",
      home: "/home/analyst",
      shell: "/bin/bash",
      primaryGroup: "analyst",
      groups: ["reports"],
      kind: "human",
    },
  ];
}

function buildGroups(
  state: SimulatedAccessControlState,
): { name: string; gid: number; members: readonly string[] }[] {
  return [
    { name: "root", gid: 0, members: ["root"] },
    { name: "daemon", gid: 1, members: [] },
    { name: "backup", gid: 110, members: [] },
    {
      name: "sudo",
      gid: 27,
      members: state.deployInSudo ? ["bunsal", "deploy"] : ["bunsal"],
    },
    { name: "bunsal", gid: 1000, members: [] },
    { name: "deploy", gid: 1001, members: [] },
    { name: "analyst", gid: 1002, members: [] },
    { name: "deployers", gid: 1003, members: ["bunsal", "deploy"] },
    { name: "reports", gid: 1004, members: ["analyst"] },
  ];
}

function findUser(
  state: SimulatedAccessControlState,
  name: string,
): SimulatedUser | undefined {
  return buildUsers(state).find((user) => user.name === name);
}

function findGroup(state: SimulatedAccessControlState, name: string) {
  return buildGroups(state).find((group) => group.name === name);
}

function modeToSymbolic(mode: string, type: "file" | "directory"): string {
  const bits = mode.padStart(4, "0").slice(-3);
  const map = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"] as const;
  const owner = map[Number(bits[0] ?? "0")] ?? "---";
  const group = map[Number(bits[1] ?? "0")] ?? "---";
  const other = map[Number(bits[2] ?? "0")] ?? "---";
  const prefix = type === "directory" ? "d" : "-";
  return `${prefix}${owner}${group}${other}`;
}

function resolveFile(
  path: string,
  state: SimulatedAccessControlState,
): SimulatedFile | null {
  const normalized = path === "/srv/backups/" ? "/srv/backups" : path;

  switch (normalized) {
    case "/srv/app/config.yml":
      return {
        path: normalized,
        type: "file",
        owner: "deploy",
        group: "deployers",
        mode: state.configMode,
        size: 482,
        mtime: "2024-03-12 09:14",
      };
    case "/srv/app/deploy.sh":
      return {
        path: normalized,
        type: "file",
        owner: "deploy",
        group: state.deployScriptGroup,
        mode: state.deployScriptMode,
        size: 1260,
        mtime: "2024-03-18 16:02",
      };
    case "/srv/reports/monthly.csv":
      return {
        path: normalized,
        type: "file",
        owner: "analyst",
        group: "reports",
        mode: "0640",
        size: 8192,
        mtime: "2024-03-20 08:45",
      };
    case "/srv/backups":
      return {
        path: normalized,
        type: "directory",
        owner: "backup",
        group: "backup",
        mode: "0750",
        size: 4096,
        mtime: "2024-03-21 01:00",
      };
    case "/tmp/shared-report.txt":
      return {
        path: normalized,
        type: "file",
        owner: "analyst",
        group: "reports",
        mode: state.sharedReportMode,
        size: 240,
        mtime: "2024-03-21 11:30",
      };
    case "/srv/app":
      return {
        path: normalized,
        type: "directory",
        owner: "deploy",
        group: "deployers",
        mode: "0750",
        size: 4096,
        mtime: "2024-03-10 10:00",
      };
    case "/srv/reports":
      return {
        path: normalized,
        type: "directory",
        owner: "analyst",
        group: "reports",
        mode: "0750",
        size: 4096,
        mtime: "2024-03-10 10:05",
      };
    case "/tmp":
      return {
        path: normalized,
        type: "directory",
        owner: "root",
        group: "root",
        mode: "1777",
        size: 4096,
        mtime: "2024-03-21 12:00",
      };
    case "/srv":
      return {
        path: normalized,
        type: "directory",
        owner: "root",
        group: "root",
        mode: "0755",
        size: 4096,
        mtime: "2024-01-02 08:00",
      };
    default:
      return null;
  }
}

function formatPasswdLine(user: SimulatedUser): string {
  return `${user.name}:x:${user.uid}:${user.gid}:${user.gecos}:${user.home}:${user.shell}`;
}

function formatGroupLine(group: {
  name: string;
  gid: number;
  members: readonly string[];
}): string {
  return `${group.name}:x:${group.gid}:${group.members.join(",")}`;
}

function formatIdLine(user: SimulatedUser, state: SimulatedAccessControlState) {
  const groups = buildGroups(state);
  const membership = [user.primaryGroup, ...user.groups];
  const parts = membership.map((name) => {
    const group = groups.find((item) => item.name === name);
    return group ? `${group.gid}(${group.name})` : name;
  });
  const primary = groups.find((item) => item.name === user.primaryGroup);
  return `uid=${user.uid}(${user.name}) gid=${primary?.gid ?? user.gid}(${user.primaryGroup}) groups=${parts.join(",")}`;
}

function formatGroupsLine(user: SimulatedUser): string {
  return [user.primaryGroup, ...user.groups].join(" ");
}

function formatLsLine(file: SimulatedFile): string {
  const stickyAware =
    file.mode === "1777" ? "drwxrwxrwt" : modeToSymbolic(file.mode, file.type);
  const name = file.path;
  return `${stickyAware} 1 ${file.owner} ${file.group} ${String(file.size).padStart(4, " ")} ${file.mtime} ${name}`;
}

function formatStat(
  file: SimulatedFile,
  state: SimulatedAccessControlState,
): string[] {
  const access =
    file.mode === "1777" ? "drwxrwxrwt" : modeToSymbolic(file.mode, file.type);
  const owner = findUser(state, file.owner);
  const group = findGroup(state, file.group);

  return [
    `  File: ${file.path}`,
    `  Size: ${file.size}\tBlocks: 8\tIO Block: 4096\t${file.type === "directory" ? "directory" : "regular file"}`,
    `Device: 10301h/66305d\tInode: 24576\tLinks: ${file.type === "directory" ? "3" : "1"}`,
    `Access: (${file.mode.padStart(4, "0")}/${access})  Uid: (${owner?.uid ?? 0}/${file.owner})   Gid: (${group?.gid ?? 0}/${file.group})`,
    `Access: 2024-03-21 12:00:00.000000000 +0000`,
    `Modify: ${file.mtime}:00.000000000 +0000`,
    `Change: ${file.mtime}:00.000000000 +0000`,
  ];
}

function formatNamei(
  path: string,
  state: SimulatedAccessControlState,
): string[] {
  const normalized = path === "/srv/backups/" ? "/srv/backups" : path;
  const segments =
    normalized === "/"
      ? ["/"]
      : ["/", ...normalized.split("/").filter(Boolean)];

  const lines = [`f: ${normalized}`];
  let current = "";

  for (const segment of segments) {
    current =
      segment === "/"
        ? "/"
        : current === "/"
          ? `/${segment}`
          : `${current}/${segment}`;
    const file =
      resolveFile(current, state) ??
      (current === "/"
        ? {
            path: "/",
            type: "directory" as const,
            owner: "root",
            group: "root",
            mode: "0755",
            size: 4096,
            mtime: "2024-01-01 00:00",
          }
        : null);

    if (!file) {
      lines.push(` ? ${segment}`);
      continue;
    }

    const symbolic =
      file.mode === "1777"
        ? "drwxrwxrwt"
        : modeToSymbolic(file.mode, file.type);
    const label = segment === "/" ? "/" : segment;
    lines.push(` ${symbolic} ${file.owner} ${file.group} ${label}`);
  }

  return lines;
}

function formatAccessReview(state: SimulatedAccessControlState): string[] {
  const open = listOpenAccessFindings(state);
  if (open.length === 0) {
    return [
      "access-review (teaching command — not a standard Linux tool)",
      "Open findings: 0",
      "Simulated access posture looks consistent with least privilege for this lab.",
    ];
  }

  return [
    "access-review (teaching command — not a standard Linux tool)",
    `Open findings: ${open.length}`,
    "",
    ...open.flatMap((finding, index) => [
      `${index + 1}. [${finding.risk}] ${finding.title}`,
      `   Evidence: ${finding.evidenceHint}`,
      `   Suggest: ${finding.remediation}`,
      "",
    ]),
    "Inspect evidence before changing access. Prefer the smallest necessary fix.",
  ];
}

function output(
  lines: readonly string[],
  state: SimulatedAccessControlState,
): SimulateAccessControlResult {
  return { result: { kind: "output", lines }, state };
}

function normalizePathArg(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

/**
 * Resolve access-control learning commands against the fictional review host.
 * Never executes a real shell or touches the host system.
 */
export function simulateAccessControlCommand(
  rawInput: string,
  state: SimulatedAccessControlState,
): SimulateAccessControlResult {
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
    return output([SIMULATED_ACCESS_USER], state);
  }
  if (command === "id") {
    if (tokens.length > 2) {
      return output(
        ['Unsupported id usage. Try "id", "id deploy", or "id backup".'],
        state,
      );
    }
    const username = tokens[1] ?? SIMULATED_ACCESS_USER;
    const user = findUser(state, username);
    if (!user) {
      return output([`id: ‘${username}’: no such user`], state);
    }
    return output([formatIdLine(user, state)], state);
  }
  if (command === "groups") {
    if (tokens.length > 2) {
      return output(
        ['Unsupported groups usage. Try "groups" or "groups deploy".'],
        state,
      );
    }
    const username = tokens[1] ?? SIMULATED_ACCESS_USER;
    const user = findUser(state, username);
    if (!user) {
      return output([`groups: ‘${username}’: no such user`], state);
    }
    return output([formatGroupsLine(user)], state);
  }
  if (command === "getent") {
    const database = tokens[1]?.toLowerCase();
    if (database === "passwd") {
      const users = buildUsers(state);
      if (tokens.length === 2) {
        return output(users.map(formatPasswdLine), state);
      }
      if (tokens.length === 3) {
        const user = findUser(state, tokens[2]!);
        if (!user) {
          return output([], state);
        }
        return output([formatPasswdLine(user)], state);
      }
      return output(
        ["Usage: getent passwd [USER]", "Example: getent passwd backup"],
        state,
      );
    }
    if (database === "group") {
      const groups = buildGroups(state);
      if (tokens.length === 2) {
        return output(groups.map(formatGroupLine), state);
      }
      if (tokens.length === 3) {
        const group = findGroup(state, tokens[2]!);
        if (!group) {
          return output([], state);
        }
        return output([formatGroupLine(group)], state);
      }
      return output(
        ["Usage: getent group [GROUP]", "Example: getent group sudo"],
        state,
      );
    }
    return output(
      [
        "Supported getent databases in this lesson: passwd, group",
        "Examples: getent passwd backup · getent group sudo",
      ],
      state,
    );
  }
  if (command === "ls") {
    const long = tokens[1] === "-l" || tokens[1] === "-ld";
    const directoryOnly = tokens[1] === "-ld";
    if (!long || tokens.length !== 3) {
      return output(
        [
          "Supported forms: ls -l PATH · ls -ld PATH",
          `Paths: ${SUPPORTED_PATHS.filter((path) => !path.endsWith("/") || path === "/srv/backups/").join(", ")}`,
        ],
        state,
      );
    }
    const path = normalizePathArg(tokens[2]!);
    const file = resolveFile(path, state);
    if (!file) {
      return output(
        [
          `ls: cannot access '${tokens[2]}': No such file in this learning terminal`,
          `Supported paths include: /srv/app/config.yml, /srv/app/deploy.sh, /srv/reports/monthly.csv, /srv/backups/, /tmp/shared-report.txt`,
        ],
        state,
      );
    }
    if (directoryOnly && file.type !== "directory") {
      return output([formatLsLine(file)], state);
    }
    return output([formatLsLine(file)], state);
  }
  if (command === "stat") {
    if (tokens.length !== 2) {
      return output(
        ["Usage: stat PATH", "Example: stat /srv/app/config.yml"],
        state,
      );
    }
    const path = normalizePathArg(tokens[1]!);
    const file = resolveFile(path, state);
    if (!file) {
      return output(
        [
          `stat: cannot statx '${tokens[1]}': No such file in this learning terminal`,
        ],
        state,
      );
    }
    return output(formatStat(file, state), state);
  }
  if (command === "namei") {
    if (tokens.length === 3 && tokens[1] === "-l") {
      const path = tokens[2]!;
      const normalized = normalizePathArg(path);
      if (!resolveFile(normalized, state) && normalized !== "/") {
        // Allow walking to known files; reject unknown leaves.
        const knownLeaf = SUPPORTED_PATHS.some(
          (supported) => normalizePathArg(supported) === normalized,
        );
        if (!knownLeaf) {
          return output(
            [
              `namei: ${path}: No such file in this learning terminal`,
              "Try a supported path such as /srv/app/deploy.sh",
            ],
            state,
          );
        }
      }
      return output(formatNamei(path, state), state);
    }
    return output(
      ["Supported form: namei -l PATH", "Example: namei -l /srv/app/deploy.sh"],
      state,
    );
  }
  if (command === "chmod") {
    if (tokens.length !== 3) {
      return output(
        [
          "Supported chmod forms:",
          "  chmod 640 /srv/app/config.yml",
          "  chmod 750 /srv/app/deploy.sh",
          "  chmod 640 /tmp/shared-report.txt",
        ],
        state,
      );
    }
    const mode = tokens[1]!;
    const path = normalizePathArg(tokens[2]!);
    const next = cloneState(state);

    if ((mode === "640" || mode === "0640") && path === "/srv/app/config.yml") {
      next.configMode = "0640";
      return output([], next);
    }
    if ((mode === "750" || mode === "0750") && path === "/srv/app/deploy.sh") {
      next.deployScriptMode = "0750";
      return output([], next);
    }
    if (
      (mode === "640" || mode === "0640") &&
      path === "/tmp/shared-report.txt"
    ) {
      next.sharedReportMode = "0640";
      return output([], next);
    }

    return output(
      [
        "That chmod target is not supported in this lesson.",
        "Supported:",
        "  chmod 640 /srv/app/config.yml",
        "  chmod 750 /srv/app/deploy.sh",
        "  chmod 640 /tmp/shared-report.txt",
      ],
      state,
    );
  }
  if (command === "chgrp") {
    return output(
      ["Permission denied. Try: sudo chgrp deployers /srv/app/deploy.sh"],
      state,
    );
  }
  if (command === "gpasswd") {
    return output(
      ["Permission denied. Try: sudo gpasswd -d deploy sudo"],
      state,
    );
  }
  if (command === "sudo") {
    const sub = tokens[1]?.toLowerCase();
    if (sub === "chgrp") {
      if (
        tokens.length === 4 &&
        tokens[2] === "deployers" &&
        normalizePathArg(tokens[3]!) === "/srv/app/deploy.sh"
      ) {
        const next = cloneState(state);
        next.deployScriptGroup = "deployers";
        return output([], next);
      }
      return output(
        ["Supported form: sudo chgrp deployers /srv/app/deploy.sh"],
        state,
      );
    }
    if (sub === "gpasswd") {
      if (
        tokens.length === 5 &&
        tokens[2] === "-d" &&
        tokens[3] === "deploy" &&
        tokens[4] === "sudo"
      ) {
        if (!state.deployInSudo) {
          return output(
            ["gpasswd: user 'deploy' is not a member of 'sudo'"],
            state,
          );
        }
        const next = cloneState(state);
        next.deployInSudo = false;
        return output(["Removing user deploy from group sudo"], next);
      }
      return output(["Supported form: sudo gpasswd -d deploy sudo"], state);
    }
    return output(
      [
        "Unsupported sudo command in this learning terminal.",
        'Try "help" to see available commands.',
      ],
      state,
    );
  }
  if (command === "set-shell") {
    if (
      tokens.length === 3 &&
      tokens[1] === "backup" &&
      (tokens[2] === "/usr/sbin/nologin" || tokens[2] === "nologin")
    ) {
      const next = cloneState(state);
      next.backupShell = "/usr/sbin/nologin";
      return output(
        [
          "Updated simulated shell for backup: /usr/sbin/nologin",
          "(Teaching command only — never changes a real account shell.)",
        ],
        next,
      );
    }
    return output(
      [
        "Supported form: set-shell backup /usr/sbin/nologin",
        "This is a lesson helper, not a standard Linux command.",
      ],
      state,
    );
  }
  if (command === "access-review") {
    if (tokens.length > 1) {
      return output(
        ['access-review takes no arguments — try "access-review"'],
        state,
      );
    }
    return output(formatAccessReview(state), state);
  }

  return output(UNSUPPORTED_MESSAGE, state);
}
