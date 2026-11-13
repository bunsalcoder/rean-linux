/**
 * Frontend-only Mandatory Access Control simulation for Stage 04 Lesson 10.
 * Does not execute real AppArmor or SELinux commands, never reads or modifies
 * host profiles, contexts, labels, or kernel settings.
 * All profiles, processes, files, policies, and logs are fictional teaching data.
 *
 * Limitations (educational subset):
 * - AppArmor: profile modes, file/network/capability rules, denials — not full parser.
 * - SELinux: type enforcement + modes + contexts — not MLS/MCS policy language.
 * - AppArmor and SELinux are shown on one fictional lab host for comparison only;
 *   real distributions typically emphasize one MAC system.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_MAC_USER = "bunsal";
export const SIMULATED_MAC_HOST = "rean-mac";

export type MacScenarioId =
  | "explore"
  | "apparmor-file-denial"
  | "apparmor-complain"
  | "selinux-context-mismatch"
  | "selinux-type-enforcement"
  | "dac-and-mac"
  | "policy-review"
  | "healthy";

export type ApparmorMode = "enforce" | "complain" | "disabled";

export type ApparmorFileAccess = "r" | "w" | "rw" | "ra" | "rwa";

export type ApparmorFileRule = {
  path: string;
  access: ApparmorFileAccess;
};

export type SimulatedDenialEvent = {
  timestamp: string;
  source: "apparmor" | "selinux";
  subject: string;
  operation: string;
  target: string;
  message: string;
};

export type SimulatedApparmorProfile = {
  name: string;
  executable: string;
  mode: ApparmorMode;
  /** Mode to restore with lab helpers / aa-enforce after complain drills. */
  intendedMode: ApparmorMode;
  allowedFiles: readonly ApparmorFileRule[];
  deniedFiles: readonly ApparmorFileRule[];
  network: readonly string[];
  capabilities: readonly string[];
  /** Unnecessarily broad rules flagged in policy-review. */
  overlyBroad: boolean;
  notes: string;
};

export type SelinuxMode = "Enforcing" | "Permissive" | "Disabled";

export type SimulatedSelinuxContext = {
  user: string;
  role: string;
  type: string;
  level: string;
};

export type SimulatedMacFile = {
  path: string;
  owner: string;
  group: string;
  mode: string;
  kind: "file" | "directory";
  size: number;
  /** Traditional DAC: whether world/other can read/write as applicable. */
  dacRead: boolean;
  dacWrite: boolean;
  selinux: SimulatedSelinuxContext;
  /** Expected context after restorecon for this path class. */
  expectedSelinux: SimulatedSelinuxContext;
};

export type SimulatedMacProcess = {
  pid: number;
  user: string;
  command: string;
  /** AppArmor profile name when confined, or "unconfined". */
  apparmorProfile: string;
  selinux: SimulatedSelinuxContext;
};

export type SelinuxAllowRule = {
  sourceType: string;
  targetType: string;
  objectClass: "file" | "dir" | "tcp_socket";
  perms: readonly ("read" | "write" | "open" | "getattr" | "name_bind")[];
};

export type SimulatedMacState = {
  scenarioId: MacScenarioId;
  currentUser: string;
  /** Teaching flag: which MAC lens the fictional host emphasizes in sestatus text. */
  focus: "apparmor" | "selinux" | "both";
  apparmorProfiles: Record<string, SimulatedApparmorProfile>;
  selinuxMode: SelinuxMode;
  selinuxAllow: readonly SelinuxAllowRule[];
  files: Record<string, SimulatedMacFile>;
  processes: readonly SimulatedMacProcess[];
  denials: SimulatedDenialEvent[];
  logs: readonly string[];
  lastEvalSummary: string | null;
  logsInspected: boolean;
  /** Scenario F: learner narrowed overly broad profile. */
  policyReviewed: boolean;
};

export type MacScenarioMeta = {
  id: MacScenarioId;
  label: string;
  summary: string;
};

export type SimulateMacResult = {
  result: SimulateResult;
  state: SimulatedMacState;
};

export type AccessDecision = {
  allowed: boolean;
  dacAllowed: boolean;
  apparmorAllowed: boolean | null;
  selinuxAllowed: boolean | null;
  enforcedBlock: boolean;
  recordedViolation: boolean;
  summary: string;
  details: readonly string[];
};

export type MacExplorerViewId =
  | "apparmor-nginx"
  | "apparmor-app"
  | "apparmor-complain"
  | "selinux-httpd-ok"
  | "selinux-mismatch"
  | "selinux-write-deny"
  | "combined-dac-mac";

export type MacExplorerView = {
  id: MacExplorerViewId;
  label: string;
  model: "apparmor" | "selinux" | "combined";
  description: string;
};

export const MAC_SCENARIOS: readonly MacScenarioMeta[] = [
  {
    id: "explore",
    label: "Explore MAC environment",
    summary:
      "Baseline fictional host with AppArmor profiles and SELinux contexts for inspection.",
  },
  {
    id: "apparmor-file-denial",
    label: "AppArmor file access denial",
    summary:
      "rean-app is denied reading /srv/app/config.yml by its enforce-mode profile.",
  },
  {
    id: "apparmor-complain",
    label: "AppArmor complain mode",
    summary:
      "rean-app is in complain mode — violations are logged but not blocked.",
  },
  {
    id: "selinux-context-mismatch",
    label: "SELinux context mismatch",
    summary:
      "A web content file has the wrong type; httpd_t cannot read it until restorecon.",
  },
  {
    id: "selinux-type-enforcement",
    label: "SELinux type enforcement write deny",
    summary:
      "httpd_t may read httpd_sys_content_t but cannot write it — DAC alone looks fine.",
  },
  {
    id: "dac-and-mac",
    label: "DAC plus MAC denial",
    summary:
      "One path fails DAC; another fails AppArmor — learners must identify each layer.",
  },
  {
    id: "policy-review",
    label: "Security policy review",
    summary:
      "rean-app has overly broad file and network permissions — recommend least privilege.",
  },
  {
    id: "healthy",
    label: "Healthy MAC baseline",
    summary: "Profiles and contexts aligned for a clean recheck.",
  },
] as const;

const SCENARIO_IDS = new Set<string>(MAC_SCENARIOS.map((s) => s.id));

export function isMacScenarioId(value: string): value is MacScenarioId {
  return SCENARIO_IDS.has(value);
}

export function getMacScenario(id: MacScenarioId): MacScenarioMeta {
  return (
    MAC_SCENARIOS.find((scenario) => scenario.id === id) ?? MAC_SCENARIOS[0]!
  );
}

export const DEFAULT_SECURITY_MAC_SUGGESTIONS = [
  "aa-status",
  "getenforce",
  "sestatus",
  "ls -Z /var/www/html",
  "ps -Z",
  "mac-eval rean-app read /srv/app/config.yml",
  "journalctl -u apparmor",
  "help",
] as const;

const HELP_OUTPUT = [
  "Available commands (educational simulation):",
  "",
  "  help                                 Show this help",
  "  aa-status                            List fictional AppArmor profiles",
  "  aa-enforce PROFILE                   Set profile to enforce",
  "  aa-complain PROFILE                  Set profile to complain",
  "  aa-disable PROFILE                   Disable profile (lab only)",
  "  getenforce                           Show SELinux mode",
  "  sestatus                             Show SELinux status summary",
  "  setenforce 0|1                       Toggle Permissive/Enforcing (lab)",
  "  ls -l [PATH]                         Traditional listing",
  "  ls -Z [PATH]                         Listing with SELinux contexts",
  "  ps -Z                                Processes with SELinux contexts",
  "  stat PATH                            File metadata (incl. context)",
  "  restorecon PATH                      Restore expected SELinux context",
  "  journalctl -u apparmor|selinux|audit Show simulated denial logs",
  "  grep PATTERN                         Filter last denial list (lab)",
  "  mac-eval PROFILE OP PATH             Evaluate DAC + MAC for an access",
  "  mac-allow-path PROFILE PATH ACCESS   Lab: add minimal file allow",
  "  mac-restore-mode PROFILE             Lab: restore intended AppArmor mode",
  "  mac-narrow-profile PROFILE           Lab: apply least-privilege profile",
  "  clear                                Clear the terminal screen",
  "",
  "Profiles: nginx  rean-app",
  "Ops for mac-eval: read  write",
  "",
  "This terminal never runs real AppArmor/SELinux, never changes host",
  "security, and never inspects real process identities or audit logs.",
] as const;

function formatContext(ctx: SimulatedSelinuxContext): string {
  return `${ctx.user}:${ctx.role}:${ctx.type}:${ctx.level}`;
}

function cloneProfile(
  profile: SimulatedApparmorProfile,
): SimulatedApparmorProfile {
  return {
    ...profile,
    allowedFiles: profile.allowedFiles.map((r) => ({ ...r })),
    deniedFiles: profile.deniedFiles.map((r) => ({ ...r })),
    network: [...profile.network],
    capabilities: [...profile.capabilities],
  };
}

function cloneState(state: SimulatedMacState): SimulatedMacState {
  const profiles: Record<string, SimulatedApparmorProfile> = {};
  for (const [key, profile] of Object.entries(state.apparmorProfiles)) {
    profiles[key] = cloneProfile(profile);
  }
  const files: Record<string, SimulatedMacFile> = {};
  for (const [key, file] of Object.entries(state.files)) {
    files[key] = {
      ...file,
      selinux: { ...file.selinux },
      expectedSelinux: { ...file.expectedSelinux },
    };
  }
  return {
    ...state,
    apparmorProfiles: profiles,
    selinuxAllow: state.selinuxAllow.map((r) => ({
      ...r,
      perms: [...r.perms],
    })),
    files,
    processes: state.processes.map((p) => ({
      ...p,
      selinux: { ...p.selinux },
    })),
    denials: state.denials.map((d) => ({ ...d })),
    logs: [...state.logs],
  };
}

const HTTPD_T: SimulatedSelinuxContext = {
  user: "system_u",
  role: "system_r",
  type: "httpd_t",
  level: "s0",
};

const HTTPD_SYS_CONTENT: SimulatedSelinuxContext = {
  user: "system_u",
  role: "object_r",
  type: "httpd_sys_content_t",
  level: "s0",
};

const HTTPD_SYS_RW: SimulatedSelinuxContext = {
  user: "system_u",
  role: "object_r",
  type: "httpd_sys_rw_content_t",
  level: "s0",
};

const DEFAULT_T: SimulatedSelinuxContext = {
  user: "system_u",
  role: "object_r",
  type: "default_t",
  level: "s0",
};

const UNCONFINED_T: SimulatedSelinuxContext = {
  user: "unconfined_u",
  role: "unconfined_r",
  type: "unconfined_t",
  level: "s0",
};

const BASE_ALLOW: readonly SelinuxAllowRule[] = [
  {
    sourceType: "httpd_t",
    targetType: "httpd_sys_content_t",
    objectClass: "file",
    perms: ["read", "open", "getattr"],
  },
  {
    sourceType: "httpd_t",
    targetType: "httpd_sys_rw_content_t",
    objectClass: "file",
    perms: ["read", "write", "open", "getattr"],
  },
  {
    sourceType: "httpd_t",
    targetType: "httpd_sys_content_t",
    objectClass: "dir",
    perms: ["read", "getattr"],
  },
  {
    sourceType: "unconfined_t",
    targetType: "default_t",
    objectClass: "file",
    perms: ["read", "write", "open", "getattr"],
  },
];

function baseNginxProfile(
  overrides?: Partial<SimulatedApparmorProfile>,
): SimulatedApparmorProfile {
  return {
    name: "nginx",
    executable: "/usr/bin/nginx",
    mode: "enforce",
    intendedMode: "enforce",
    allowedFiles: [
      { path: "/var/www/html/**", access: "r" },
      { path: "/var/log/nginx/**", access: "rw" },
      { path: "/etc/nginx/**", access: "r" },
    ],
    deniedFiles: [{ path: "/srv/app/**", access: "rw" }],
    network: ["tcp bind 80", "tcp bind 443"],
    capabilities: ["net_bind_service", "setuid", "setgid"],
    overlyBroad: false,
    notes: "Confinement for the fictional web server binary.",
    ...overrides,
  };
}

function baseAppProfile(
  overrides?: Partial<SimulatedApparmorProfile>,
): SimulatedApparmorProfile {
  return {
    name: "rean-app",
    executable: "/usr/local/bin/rean-app",
    mode: "enforce",
    intendedMode: "enforce",
    allowedFiles: [
      { path: "/srv/app/uploads/**", access: "rw" },
      { path: "/srv/app/logs/**", access: "rw" },
    ],
    deniedFiles: [{ path: "/srv/app/config.yml", access: "r" }],
    network: ["tcp connect 5432"],
    capabilities: [],
    overlyBroad: false,
    notes:
      "Application profile — config.yml is intentionally denied until remediated.",
    ...overrides,
  };
}

function baseFiles(): Record<string, SimulatedMacFile> {
  return {
    "/usr/bin/nginx": {
      path: "/usr/bin/nginx",
      owner: "root",
      group: "root",
      mode: "-rwxr-xr-x",
      kind: "file",
      size: 1200000,
      dacRead: true,
      dacWrite: false,
      selinux: {
        user: "system_u",
        role: "object_r",
        type: "httpd_exec_t",
        level: "s0",
      },
      expectedSelinux: {
        user: "system_u",
        role: "object_r",
        type: "httpd_exec_t",
        level: "s0",
      },
    },
    "/var/www/html/index.html": {
      path: "/var/www/html/index.html",
      owner: "root",
      group: "root",
      mode: "-rw-r--r--",
      kind: "file",
      size: 512,
      dacRead: true,
      dacWrite: false,
      selinux: { ...HTTPD_SYS_CONTENT },
      expectedSelinux: { ...HTTPD_SYS_CONTENT },
    },
    "/var/www/html/secret.html": {
      path: "/var/www/html/secret.html",
      owner: "root",
      group: "root",
      mode: "-rw-r--r--",
      kind: "file",
      size: 256,
      dacRead: true,
      dacWrite: false,
      selinux: { ...HTTPD_SYS_CONTENT },
      expectedSelinux: { ...HTTPD_SYS_CONTENT },
    },
    "/var/log/nginx/access.log": {
      path: "/var/log/nginx/access.log",
      owner: "www-data",
      group: "adm",
      mode: "-rw-r-----",
      kind: "file",
      size: 4096,
      dacRead: false,
      dacWrite: true,
      selinux: {
        user: "system_u",
        role: "object_r",
        type: "httpd_log_t",
        level: "s0",
      },
      expectedSelinux: {
        user: "system_u",
        role: "object_r",
        type: "httpd_log_t",
        level: "s0",
      },
    },
    "/srv/app/config.yml": {
      path: "/srv/app/config.yml",
      owner: "app",
      group: "app",
      mode: "-rw-r-----",
      kind: "file",
      size: 320,
      dacRead: true,
      dacWrite: false,
      selinux: { ...DEFAULT_T },
      expectedSelinux: { ...DEFAULT_T },
    },
    "/srv/app/uploads": {
      path: "/srv/app/uploads",
      owner: "app",
      group: "app",
      mode: "drwxr-x---",
      kind: "directory",
      size: 4096,
      dacRead: true,
      dacWrite: true,
      selinux: { ...DEFAULT_T },
      expectedSelinux: { ...DEFAULT_T },
    },
    "/srv/app/private.key": {
      path: "/srv/app/private.key",
      owner: "app",
      group: "app",
      mode: "-rw-------",
      kind: "file",
      size: 128,
      dacRead: false,
      dacWrite: false,
      selinux: { ...DEFAULT_T },
      expectedSelinux: { ...DEFAULT_T },
    },
    "/srv/web/upload.dat": {
      path: "/srv/web/upload.dat",
      owner: "www-data",
      group: "www-data",
      mode: "-rw-rw-r--",
      kind: "file",
      size: 2048,
      dacRead: true,
      dacWrite: true,
      selinux: { ...HTTPD_SYS_CONTENT },
      expectedSelinux: { ...HTTPD_SYS_RW },
    },
  };
}

function baseProcesses(): SimulatedMacProcess[] {
  return [
    {
      pid: 1,
      user: "root",
      command: "/sbin/init",
      apparmorProfile: "unconfined",
      selinux: {
        user: "system_u",
        role: "system_r",
        type: "init_t",
        level: "s0",
      },
    },
    {
      pid: 812,
      user: "www-data",
      command: "/usr/bin/nginx",
      apparmorProfile: "nginx",
      selinux: { ...HTTPD_T },
    },
    {
      pid: 904,
      user: "app",
      command: "/usr/local/bin/rean-app",
      apparmorProfile: "rean-app",
      selinux: { ...UNCONFINED_T },
    },
    {
      pid: 1201,
      user: "bunsal",
      command: "-bash",
      apparmorProfile: "unconfined",
      selinux: { ...UNCONFINED_T },
    },
  ];
}

function baseLogs(): string[] {
  return [
    'Nov 13 09:10:01 rean-mac kernel: audit: type=1400 apparmor="DENIED" operation="open" profile="rean-app" name="/srv/app/config.yml" pid=904 comm="rean-app" requested_mask="r" denied_mask="r"',
    "Nov 13 09:11:22 rean-mac setroubleshoot: SELinux is preventing httpd from read access on the file secret.html (default_t).",
    'Nov 13 09:12:05 rean-mac audit: AVC avc: denied { write } for pid=812 comm="nginx" name="upload.dat" scontext=system_u:system_r:httpd_t:s0 tcontext=system_u:object_r:httpd_sys_content_t:s0 tclass=file',
    "Nov 13 09:13:40 rean-mac apparmor: ALLOWED (complain) operation=open profile=rean-app name=/etc/shadow",
  ];
}

function pathMatchesRule(path: string, pattern: string): boolean {
  if (pattern.endsWith("/**")) {
    const prefix = pattern.slice(0, -3);
    return path === prefix || path.startsWith(`${prefix}/`);
  }
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -2);
    if (!path.startsWith(`${prefix}/`)) {
      return false;
    }
    return !path.slice(prefix.length + 1).includes("/");
  }
  return path === pattern;
}

function accessIncludes(
  ruleAccess: ApparmorFileAccess,
  needed: "read" | "write",
): boolean {
  if (needed === "read") {
    return ruleAccess.includes("r");
  }
  return ruleAccess.includes("w") || ruleAccess.includes("a");
}

function findApparmorRule(
  rules: readonly ApparmorFileRule[],
  path: string,
  needed: "read" | "write",
): ApparmorFileRule | undefined {
  return rules.find(
    (rule) =>
      pathMatchesRule(path, rule.path) && accessIncludes(rule.access, needed),
  );
}

function selinuxPermForOp(op: "read" | "write"): "read" | "write" {
  return op;
}

export function evaluateApparmorAccess(
  state: SimulatedMacState,
  profileName: string,
  op: "read" | "write",
  path: string,
): {
  allowed: boolean;
  mode: ApparmorMode;
  reason: string;
  recordsViolation: boolean;
} {
  const profile = state.apparmorProfiles[profileName];
  if (!profile) {
    return {
      allowed: true,
      mode: "disabled",
      reason: `No AppArmor profile named '${profileName}' — treated as unconfined in this lab.`,
      recordsViolation: false,
    };
  }
  if (profile.mode === "disabled") {
    return {
      allowed: true,
      mode: "disabled",
      reason: `Profile ${profileName} is disabled — AppArmor does not confine this executable.`,
      recordsViolation: false,
    };
  }

  const denied = findApparmorRule(profile.deniedFiles, path, op);
  const allowed = findApparmorRule(profile.allowedFiles, path, op);

  if (denied || !allowed) {
    const reason = denied
      ? `Profile ${profileName} explicitly denies ${op} on ${path}.`
      : `Profile ${profileName} has no allow rule for ${op} on ${path}.`;
    if (profile.mode === "complain") {
      return {
        allowed: true,
        mode: "complain",
        reason: `${reason} Complain mode records the violation but does not block.`,
        recordsViolation: true,
      };
    }
    return {
      allowed: false,
      mode: "enforce",
      reason,
      recordsViolation: true,
    };
  }

  return {
    allowed: true,
    mode: profile.mode,
    reason: `Profile ${profileName} allows ${op} on ${path} (matched ${allowed.path}).`,
    recordsViolation: false,
  };
}

export function evaluateSelinuxAccess(
  state: SimulatedMacState,
  processType: string,
  file: SimulatedMacFile,
  op: "read" | "write",
): {
  allowed: boolean;
  reason: string;
  recordsViolation: boolean;
} {
  if (state.selinuxMode === "Disabled") {
    return {
      allowed: true,
      reason: "SELinux is Disabled — type enforcement is not applied.",
      recordsViolation: false,
    };
  }

  const needed = selinuxPermForOp(op);
  const objectClass = file.kind === "directory" ? "dir" : "file";
  const rule = state.selinuxAllow.find(
    (entry) =>
      entry.sourceType === processType &&
      entry.targetType === file.selinux.type &&
      entry.objectClass === objectClass &&
      entry.perms.includes(needed),
  );

  if (rule) {
    return {
      allowed: true,
      reason: `Type enforcement allows ${processType} → { ${needed} } ${file.selinux.type}:${objectClass}.`,
      recordsViolation: false,
    };
  }

  const reason = `No allow rule for ${processType} to ${needed} ${file.selinux.type} (${objectClass}). Context: ${formatContext(file.selinux)}.`;
  if (state.selinuxMode === "Permissive") {
    return {
      allowed: true,
      reason: `${reason} Permissive mode records the AVC but does not block.`,
      recordsViolation: true,
    };
  }
  return {
    allowed: false,
    reason,
    recordsViolation: true,
  };
}

export function evaluateCombinedAccess(
  state: SimulatedMacState,
  options: {
    profileName?: string;
    processType?: string;
    path: string;
    op: "read" | "write";
  },
): AccessDecision {
  const file = state.files[options.path];
  const details: string[] = [];

  if (!file) {
    return {
      allowed: false,
      dacAllowed: false,
      apparmorAllowed: null,
      selinuxAllowed: null,
      enforcedBlock: true,
      recordedViolation: false,
      summary: `Unknown path in this lab: ${options.path}`,
      details: ["Use a documented lab path such as /srv/app/config.yml."],
    };
  }

  const dacAllowed = options.op === "read" ? file.dacRead : file.dacWrite;
  details.push(
    dacAllowed
      ? `DAC: traditional permissions (${file.mode}) allow ${options.op} for the teaching subject.`
      : `DAC: traditional permissions (${file.mode}) deny ${options.op} for the teaching subject.`,
  );

  let apparmorAllowed: boolean | null = null;
  let apparmorBlocks = false;
  let apparmorRecords = false;
  if (options.profileName) {
    const aa = evaluateApparmorAccess(
      state,
      options.profileName,
      options.op,
      options.path,
    );
    apparmorAllowed = aa.allowed;
    apparmorRecords = aa.recordsViolation;
    details.push(`AppArmor (${aa.mode}): ${aa.reason}`);
    if (!aa.allowed) {
      apparmorBlocks = true;
    }
  }

  let selinuxAllowed: boolean | null = null;
  let selinuxBlocks = false;
  let selinuxRecords = false;
  if (options.processType) {
    const se = evaluateSelinuxAccess(
      state,
      options.processType,
      file,
      options.op,
    );
    selinuxAllowed = se.allowed;
    selinuxRecords = se.recordsViolation;
    details.push(`SELinux (${state.selinuxMode}): ${se.reason}`);
    if (!se.allowed) {
      selinuxBlocks = true;
    }
  }

  const enforcedBlock = !dacAllowed || apparmorBlocks || selinuxBlocks;
  const allowed = !enforcedBlock;
  const recordedViolation = apparmorRecords || selinuxRecords;

  let summary: string;
  if (!dacAllowed && (apparmorBlocks || selinuxBlocks)) {
    summary =
      "Denied by both DAC and MAC — fix permissions and policy with evidence.";
  } else if (!dacAllowed) {
    summary = "Denied by traditional DAC permissions (MAC not the blocker).";
  } else if (apparmorBlocks) {
    summary = "DAC allows access, but AppArmor enforce mode blocks it.";
  } else if (selinuxBlocks) {
    summary =
      "DAC allows access, but SELinux Enforcing mode blocks it (type enforcement).";
  } else if (recordedViolation) {
    summary =
      "Access proceeds, but a MAC violation was recorded (complain/permissive).";
  } else {
    summary = "Access allowed under DAC and applicable MAC policy.";
  }

  return {
    allowed,
    dacAllowed,
    apparmorAllowed,
    selinuxAllowed,
    enforcedBlock,
    recordedViolation,
    summary,
    details,
  };
}

function scenarioBlueprint(scenarioId: MacScenarioId): {
  focus: SimulatedMacState["focus"];
  profiles: Record<string, SimulatedApparmorProfile>;
  selinuxMode: SelinuxMode;
  files: Record<string, SimulatedMacFile>;
  denials: SimulatedDenialEvent[];
  logs: string[];
  policyReviewed: boolean;
} {
  const files = baseFiles();
  const nginx = baseNginxProfile();
  const app = baseAppProfile();
  const denials: SimulatedDenialEvent[] = [];
  let logs = baseLogs();
  let focus: SimulatedMacState["focus"] = "both";
  const selinuxMode: SelinuxMode = "Enforcing";
  let policyReviewed = false;

  switch (scenarioId) {
    case "apparmor-file-denial":
      focus = "apparmor";
      denials.push({
        timestamp: "Nov 13 09:10:01",
        source: "apparmor",
        subject: "rean-app",
        operation: "open",
        target: "/srv/app/config.yml",
        message:
          'apparmor="DENIED" operation="open" profile="rean-app" name="/srv/app/config.yml" requested_mask="r"',
      });
      break;
    case "apparmor-complain":
      focus = "apparmor";
      app.mode = "complain";
      app.notes =
        "Complain mode: violations are logged; operations are not blocked.";
      denials.push({
        timestamp: "Nov 13 09:13:40",
        source: "apparmor",
        subject: "rean-app",
        operation: "open",
        target: "/etc/shadow",
        message:
          "apparmor ALLOWED (complain) profile=rean-app name=/etc/shadow",
      });
      break;
    case "selinux-context-mismatch":
      focus = "selinux";
      files["/var/www/html/secret.html"] = {
        ...files["/var/www/html/secret.html"]!,
        selinux: { ...DEFAULT_T },
        expectedSelinux: { ...HTTPD_SYS_CONTENT },
      };
      denials.push({
        timestamp: "Nov 13 09:11:22",
        source: "selinux",
        subject: "httpd_t",
        operation: "read",
        target: "/var/www/html/secret.html",
        message:
          "AVC denied { read } scontext=httpd_t tcontext=default_t tclass=file name=secret.html",
      });
      break;
    case "selinux-type-enforcement":
      focus = "selinux";
      files["/srv/web/upload.dat"] = {
        ...files["/srv/web/upload.dat"]!,
        selinux: { ...HTTPD_SYS_CONTENT },
        expectedSelinux: { ...HTTPD_SYS_RW },
      };
      denials.push({
        timestamp: "Nov 13 09:12:05",
        source: "selinux",
        subject: "httpd_t",
        operation: "write",
        target: "/srv/web/upload.dat",
        message:
          "AVC denied { write } scontext=httpd_t tcontext=httpd_sys_content_t tclass=file",
      });
      break;
    case "dac-and-mac":
      focus = "both";
      files["/srv/app/private.key"] = {
        ...files["/srv/app/private.key"]!,
        dacRead: false,
        mode: "-rw-------",
      };
      denials.push({
        timestamp: "Nov 13 09:14:01",
        source: "apparmor",
        subject: "rean-app",
        operation: "open",
        target: "/srv/app/config.yml",
        message:
          'apparmor="DENIED" profile="rean-app" name="/srv/app/config.yml"',
      });
      break;
    case "policy-review":
      focus = "apparmor";
      app.overlyBroad = true;
      app.allowedFiles = [
        { path: "/**", access: "rw" },
        { path: "/srv/app/uploads/**", access: "rw" },
      ];
      app.deniedFiles = [];
      app.network = ["tcp connect *", "udp bind *"];
      app.capabilities = ["sys_admin", "net_admin", "dac_override"];
      app.notes =
        "Overly broad: filesystem /** and wild network — violate least privilege.";
      logs = [
        ...logs,
        "Nov 13 09:15:00 rean-mac audit: WARNING profile rean-app allows /** rw — review recommended",
      ];
      break;
    case "healthy":
      focus = "both";
      app.deniedFiles = [];
      app.allowedFiles = [
        { path: "/srv/app/config.yml", access: "r" },
        { path: "/srv/app/uploads/**", access: "rw" },
        { path: "/srv/app/logs/**", access: "rw" },
      ];
      app.overlyBroad = false;
      policyReviewed = true;
      files["/var/www/html/secret.html"]!.selinux = { ...HTTPD_SYS_CONTENT };
      files["/srv/web/upload.dat"]!.selinux = { ...HTTPD_SYS_RW };
      denials.length = 0;
      logs = [
        "Nov 13 10:00:00 rean-mac audit: MAC baseline healthy — no recent denials in teaching window",
      ];
      break;
    case "explore":
    default:
      break;
  }

  return {
    focus,
    profiles: { nginx, "rean-app": app },
    selinuxMode,
    files,
    denials,
    logs,
    policyReviewed,
  };
}

export function createInitialMacState(
  scenarioId: MacScenarioId = "explore",
): SimulatedMacState {
  const blueprint = scenarioBlueprint(scenarioId);
  return {
    scenarioId,
    currentUser: SIMULATED_MAC_USER,
    focus: blueprint.focus,
    apparmorProfiles: blueprint.profiles,
    selinuxMode: blueprint.selinuxMode,
    selinuxAllow: BASE_ALLOW.map((r) => ({ ...r, perms: [...r.perms] })),
    files: blueprint.files,
    processes: baseProcesses(),
    denials: blueprint.denials,
    logs: blueprint.logs,
    lastEvalSummary: null,
    logsInspected: false,
    policyReviewed: blueprint.policyReviewed,
  };
}

export function formatMacPrompt(user?: string): string {
  return `${user ?? SIMULATED_MAC_USER}@${SIMULATED_MAC_HOST}:~$ `;
}

export function getApparmorProfile(
  state: SimulatedMacState,
  name: string,
): SimulatedApparmorProfile | undefined {
  return state.apparmorProfiles[name];
}

export function apparmorProfileIsEnforce(
  state: SimulatedMacState,
  name: string,
): boolean {
  return state.apparmorProfiles[name]?.mode === "enforce";
}

export function apparmorAllowsPath(
  state: SimulatedMacState,
  profileName: string,
  path: string,
  op: "read" | "write" = "read",
): boolean {
  return evaluateApparmorAccess(state, profileName, op, path).allowed;
}

export function fileHasExpectedSelinuxContext(
  state: SimulatedMacState,
  path: string,
): boolean {
  const file = state.files[path];
  if (!file) {
    return false;
  }
  return (
    file.selinux.user === file.expectedSelinux.user &&
    file.selinux.role === file.expectedSelinux.role &&
    file.selinux.type === file.expectedSelinux.type &&
    file.selinux.level === file.expectedSelinux.level
  );
}

export function profileIsLeastPrivilege(
  state: SimulatedMacState,
  name: string,
): boolean {
  const profile = state.apparmorProfiles[name];
  if (!profile) {
    return false;
  }
  return !profile.overlyBroad && state.policyReviewed;
}

export const MAC_EXPLORER_VIEWS: readonly MacExplorerView[] = [
  {
    id: "apparmor-nginx",
    label: "AppArmor: nginx",
    model: "apparmor",
    description:
      "Inspect the nginx profile: enforce mode, web content allows, and denied app paths.",
  },
  {
    id: "apparmor-app",
    label: "AppArmor: rean-app denial",
    model: "apparmor",
    description:
      "rean-app cannot read /srv/app/config.yml while uploads remain writable.",
  },
  {
    id: "apparmor-complain",
    label: "AppArmor: complain mode",
    model: "apparmor",
    description:
      "Same denial path in complain mode — access proceeds, violation is logged.",
  },
  {
    id: "selinux-httpd-ok",
    label: "SELinux: allowed read",
    model: "selinux",
    description:
      "httpd_t reading httpd_sys_content_t content — type enforcement allows.",
  },
  {
    id: "selinux-mismatch",
    label: "SELinux: wrong context",
    model: "selinux",
    description:
      "File labeled default_t while process is httpd_t — read denied until restorecon.",
  },
  {
    id: "selinux-write-deny",
    label: "SELinux: write deny",
    model: "selinux",
    description:
      "DAC write looks fine; httpd_t still cannot write httpd_sys_content_t.",
  },
  {
    id: "combined-dac-mac",
    label: "DAC + MAC layers",
    model: "combined",
    description:
      "Compare a DAC-only denial with a MAC denial when modes look correct.",
  },
] as const;

export type MacExplorerSnapshot = {
  view: MacExplorerView;
  apparmor?: SimulatedApparmorProfile;
  process?: SimulatedMacProcess;
  file?: SimulatedMacFile;
  decision: AccessDecision;
  contextExplainer: readonly { term: string; description: string }[];
  recentDenials: readonly SimulatedDenialEvent[];
};

export function getMacExplorerSnapshot(
  viewId: MacExplorerViewId,
): MacExplorerSnapshot {
  const view =
    MAC_EXPLORER_VIEWS.find((item) => item.id === viewId) ??
    MAC_EXPLORER_VIEWS[0]!;

  if (viewId === "apparmor-nginx") {
    const state = createInitialMacState("explore");
    const apparmor = state.apparmorProfiles.nginx!;
    const decision = evaluateCombinedAccess(state, {
      profileName: "nginx",
      path: "/var/www/html/index.html",
      op: "read",
    });
    return {
      view,
      apparmor,
      decision,
      contextExplainer: [
        {
          term: "Profile name",
          description:
            "Identity of the AppArmor policy attached to an executable.",
        },
        {
          term: "Enforce mode",
          description: "Violations are blocked and logged.",
        },
      ],
      recentDenials: state.denials.filter((d) => d.source === "apparmor"),
    };
  }

  if (viewId === "apparmor-app") {
    const state = createInitialMacState("apparmor-file-denial");
    const apparmor = state.apparmorProfiles["rean-app"]!;
    const decision = evaluateCombinedAccess(state, {
      profileName: "rean-app",
      path: "/srv/app/config.yml",
      op: "read",
    });
    return {
      view,
      apparmor,
      file: state.files["/srv/app/config.yml"],
      decision,
      contextExplainer: [
        {
          term: "Denied path",
          description:
            "Even if DAC allows the app user to read the file, AppArmor can still block it.",
        },
      ],
      recentDenials: state.denials,
    };
  }

  if (viewId === "apparmor-complain") {
    const state = createInitialMacState("apparmor-complain");
    const apparmor = state.apparmorProfiles["rean-app"]!;
    const decision = evaluateCombinedAccess(state, {
      profileName: "rean-app",
      path: "/srv/app/config.yml",
      op: "read",
    });
    return {
      view,
      apparmor,
      decision,
      contextExplainer: [
        {
          term: "Complain mode",
          description:
            "Policy violations are recorded for tuning; the operation is not blocked.",
        },
      ],
      recentDenials: state.denials,
    };
  }

  if (viewId === "selinux-httpd-ok") {
    const state = createInitialMacState("explore");
    const process = state.processes.find((p) => p.command.includes("nginx"))!;
    const file = state.files["/var/www/html/index.html"]!;
    const decision = evaluateCombinedAccess(state, {
      processType: process.selinux.type,
      path: file.path,
      op: "read",
    });
    return {
      view,
      process,
      file,
      decision,
      contextExplainer: explainSelinuxContext(
        process.selinux,
        "process",
      ).concat(explainSelinuxContext(file.selinux, "file")),
      recentDenials: [],
    };
  }

  if (viewId === "selinux-mismatch") {
    const state = createInitialMacState("selinux-context-mismatch");
    const process = state.processes.find((p) => p.command.includes("nginx"))!;
    const file = state.files["/var/www/html/secret.html"]!;
    const decision = evaluateCombinedAccess(state, {
      processType: process.selinux.type,
      path: file.path,
      op: "read",
    });
    return {
      view,
      process,
      file,
      decision,
      contextExplainer: [
        ...explainSelinuxContext(process.selinux, "process"),
        ...explainSelinuxContext(file.selinux, "file"),
        {
          term: "Mismatch",
          description:
            "httpd_t is not allowed to read default_t web files in this teaching policy.",
        },
      ],
      recentDenials: state.denials,
    };
  }

  if (viewId === "selinux-write-deny") {
    const state = createInitialMacState("selinux-type-enforcement");
    const process = state.processes.find((p) => p.command.includes("nginx"))!;
    const file = state.files["/srv/web/upload.dat"]!;
    const decision = evaluateCombinedAccess(state, {
      processType: process.selinux.type,
      path: file.path,
      op: "write",
    });
    return {
      view,
      process,
      file,
      decision,
      contextExplainer: [
        {
          term: "Type enforcement",
          description:
            "Read-only content types stay non-writable even when chmod looks open.",
        },
        ...explainSelinuxContext(file.selinux, "file"),
      ],
      recentDenials: state.denials,
    };
  }

  // combined-dac-mac
  const state = createInitialMacState("dac-and-mac");
  const dacDecision = evaluateCombinedAccess(state, {
    profileName: "rean-app",
    path: "/srv/app/private.key",
    op: "read",
  });
  const macDecision = evaluateCombinedAccess(state, {
    profileName: "rean-app",
    path: "/srv/app/config.yml",
    op: "read",
  });
  return {
    view,
    apparmor: state.apparmorProfiles["rean-app"],
    file: state.files["/srv/app/config.yml"],
    decision: macDecision,
    contextExplainer: [
      {
        term: "private.key",
        description: dacDecision.summary,
      },
      {
        term: "config.yml",
        description: macDecision.summary,
      },
    ],
    recentDenials: state.denials,
  };
}

export function explainSelinuxContext(
  ctx: SimulatedSelinuxContext,
  kind: "process" | "file",
): { term: string; description: string }[] {
  return [
    {
      term: "User",
      description: `${ctx.user} — SELinux user identity (not the same as the Linux login name).`,
    },
    {
      term: "Role",
      description: `${ctx.role} — role constraining which types this ${kind} may assume.`,
    },
    {
      term: "Type",
      description: `${ctx.type} — primary type-enforcement label used in allow rules.`,
    },
    {
      term: "Level",
      description: `${ctx.level} — MLS/MCS level; this lab uses s0 only.`,
    },
  ];
}

function output(
  lines: readonly string[],
  state: SimulatedMacState,
): SimulateMacResult {
  return { result: { kind: "output", lines }, state };
}

function formatAaStatus(state: SimulatedMacState): string[] {
  const lines = [
    "apparmor module is loaded. (simulated)",
    "",
    `${Object.keys(state.apparmorProfiles).length} profiles are loaded.`,
  ];
  const enforce = Object.values(state.apparmorProfiles).filter(
    (p) => p.mode === "enforce",
  );
  const complain = Object.values(state.apparmorProfiles).filter(
    (p) => p.mode === "complain",
  );
  const disabled = Object.values(state.apparmorProfiles).filter(
    (p) => p.mode === "disabled",
  );
  lines.push(`${enforce.length} profiles are in enforce mode.`);
  for (const profile of enforce) {
    lines.push(`   ${profile.name}`);
  }
  lines.push(`${complain.length} profiles are in complain mode.`);
  for (const profile of complain) {
    lines.push(`   ${profile.name}`);
  }
  if (disabled.length > 0) {
    lines.push(`${disabled.length} profiles are disabled (lab).`);
    for (const profile of disabled) {
      lines.push(`   ${profile.name}`);
    }
  }
  lines.push("");
  lines.push("Processes:");
  for (const proc of state.processes) {
    if (proc.apparmorProfile === "unconfined") {
      continue;
    }
    lines.push(
      `   [${proc.apparmorProfile}] ${proc.command} (pid ${proc.pid})`,
    );
  }
  lines.push("");
  lines.push(
    "# Educational output — not host AppArmor. Ubuntu-style distributions commonly ship AppArmor.",
  );
  return lines;
}

function formatLsL(file: SimulatedMacFile): string {
  return `${file.mode} 1 ${file.owner} ${file.group} ${String(file.size).padStart(6, " ")} Nov 13 09:00 ${file.path}`;
}

function formatLsZ(file: SimulatedMacFile): string {
  return `${file.mode} 1 ${file.owner} ${file.group} ${formatContext(file.selinux)} ${file.path}`;
}

function resolvePath(
  state: SimulatedMacState,
  raw: string | undefined,
): string | null {
  if (!raw || raw === ".") {
    return null;
  }
  if (state.files[raw]) {
    return raw;
  }
  // directory listing support for known parents
  return raw;
}

function listFilesIn(
  state: SimulatedMacState,
  dir: string | null,
): SimulatedMacFile[] {
  const entries = Object.values(state.files);
  if (!dir || dir === "/" || dir === ".") {
    return entries;
  }
  const prefix = dir.endsWith("/") ? dir : `${dir}/`;
  return entries.filter(
    (file) => file.path === dir || file.path.startsWith(prefix),
  );
}

function setProfileMode(
  state: SimulatedMacState,
  name: string,
  mode: ApparmorMode,
): SimulateMacResult {
  const next = cloneState(state);
  const profile = next.apparmorProfiles[name];
  if (!profile) {
    return output(
      [
        `Profile '${name}' not found in this lab.`,
        "Known profiles: nginx, rean-app",
      ],
      state,
    );
  }
  profile.mode = mode;
  return output(
    [
      `Setting ${name} to ${mode}. (simulated — host unchanged)`,
      `Profile mode is now: ${mode}`,
    ],
    next,
  );
}

export function simulateMacCommand(
  rawCommand: string,
  state: SimulatedMacState,
): SimulateMacResult {
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

  if (command === "aa-status" || command === "apparmor_status") {
    return output(formatAaStatus(state), state);
  }

  if (command === "aa-enforce") {
    const name = tokens[1];
    if (!name) {
      return output(["Usage: aa-enforce PROFILE"], state);
    }
    return setProfileMode(state, name, "enforce");
  }

  if (command === "aa-complain") {
    const name = tokens[1];
    if (!name) {
      return output(["Usage: aa-complain PROFILE"], state);
    }
    return setProfileMode(state, name, "complain");
  }

  if (command === "aa-disable") {
    const name = tokens[1];
    if (!name) {
      return output(["Usage: aa-disable PROFILE"], state);
    }
    return setProfileMode(state, name, "disabled");
  }

  if (command === "apparmor_parser") {
    return output(
      [
        "apparmor_parser: conceptual only in this lab.",
        "On real systems it loads or replaces profile text into the kernel.",
        "Here, change modes with aa-enforce / aa-complain / aa-disable,",
        "or use mac-allow-path / mac-narrow-profile lab helpers.",
      ],
      state,
    );
  }

  if (command === "getenforce") {
    return output([state.selinuxMode], state);
  }

  if (command === "sestatus") {
    return output(
      [
        "SELinux status:                 enabled (simulated)",
        `Current mode:                   ${state.selinuxMode}`,
        "Mode from config file:          Enforcing",
        "Policy name:                    targeted (fictional)",
        "Policy from config file:        targeted",
        "Policy MLS status:              disabled (lab uses s0 only)",
        "Policy deny_unknown status:     allowed",
        "Memory protection checking:     actual (disabled)",
        "Max kernel policy version:      33",
        "",
        "# Lab note: SELinux is common on Fedora/RHEL-family hosts.",
        "# AppArmor is common on Ubuntu-family hosts.",
        `# This teaching host exposes focus=${state.focus} for comparison only.`,
      ],
      state,
    );
  }

  if (command === "setenforce") {
    const arg = tokens[1];
    if (
      arg !== "0" &&
      arg !== "1" &&
      arg !== "Enforcing" &&
      arg !== "Permissive"
    ) {
      return output(["Usage: setenforce 0|1"], state);
    }
    const next = cloneState(state);
    if (arg === "0" || arg === "Permissive") {
      next.selinuxMode = "Permissive";
    } else {
      next.selinuxMode = "Enforcing";
    }
    return output(
      [
        `setenforce: mode is now ${next.selinuxMode} (simulated)`,
        "Permissive records AVCs without blocking; Enforcing blocks denials.",
      ],
      next,
    );
  }

  if (command === "ls") {
    const zFlag = tokens.includes("-Z") || tokens.includes("-lZ");
    const lFlag =
      tokens.includes("-l") || tokens.includes("-lZ") || tokens.includes("-Zl");
    const pathToken = tokens.find(
      (token, index) => index > 0 && !token.startsWith("-"),
    );
    const path = resolvePath(state, pathToken);
    const files = listFilesIn(state, path);

    if (pathToken && files.length === 0 && !state.files[pathToken]) {
      return output([`ls: cannot access '${pathToken}': No such file`], state);
    }

    if (pathToken && state.files[pathToken] && !pathToken.endsWith("/")) {
      const file = state.files[pathToken]!;
      if (zFlag) {
        return output([formatLsZ(file)], state);
      }
      if (lFlag) {
        return output([formatLsL(file)], state);
      }
      return output([file.path], state);
    }

    const lines = files.map((file) => {
      if (zFlag) {
        return formatLsZ(file);
      }
      if (lFlag) {
        return formatLsL(file);
      }
      return file.path;
    });
    return output(
      lines.length > 0
        ? lines
        : ["(no matching lab files — try /var/www/html or /srv/app)"],
      state,
    );
  }

  if (command === "ps") {
    if (!tokens.includes("-Z") && tokens[1] !== "Z") {
      return output(
        [
          "ps: in this lab use: ps -Z",
          "(Shows fictional SELinux contexts for teaching processes.)",
        ],
        state,
      );
    }
    const lines = [
      "LABEL                               PID USER     COMMAND",
      ...state.processes.map(
        (proc) =>
          `${formatContext(proc.selinux).padEnd(34)} ${String(proc.pid).padStart(4)} ${proc.user.padEnd(8)} ${proc.command}`,
      ),
      "",
      "# AppArmor confinement shows in aa-status; SELinux labels show with ps -Z.",
    ];
    return output(lines, state);
  }

  if (command === "stat") {
    const path = tokens[1];
    if (!path) {
      return output(["Usage: stat PATH"], state);
    }
    const file = state.files[path];
    if (!file) {
      return output([`stat: cannot statx '${path}': No such file`], state);
    }
    return output(
      [
        `  File: ${file.path}`,
        `  Size: ${file.size}         Blocks: 8          ${file.kind}`,
        `Access: (${file.mode})  Uid: (${file.owner})  Gid: (${file.group})`,
        `Context: ${formatContext(file.selinux)}`,
        `Expected (restorecon): ${formatContext(file.expectedSelinux)}`,
        "",
        "# Changing chmod does not change SELinux type — use restorecon when labels drift.",
      ],
      state,
    );
  }

  if (command === "restorecon") {
    const path = tokens[1];
    if (!path) {
      return output(["Usage: restorecon PATH"], state);
    }
    const next = cloneState(state);
    const file = next.files[path];
    if (!file) {
      return output(
        [`restorecon: '${path}' not in this lab filesystem`],
        state,
      );
    }
    const before = formatContext(file.selinux);
    file.selinux = { ...file.expectedSelinux };
    const after = formatContext(file.selinux);
    next.denials = next.denials.filter((d) => d.target !== path);
    return output(
      [
        `Relabeled ${path}`,
        `  from ${before}`,
        `  to   ${after}`,
        "(simulated restorecon — host labels unchanged)",
      ],
      next,
    );
  }

  if (command === "semanage") {
    return output(
      [
        "semanage: conceptual only in this lab.",
        "On real systems, semanage fcontext adjusts persistent file-context mappings.",
        "Here, use restorecon PATH to apply the expected teaching context.",
      ],
      state,
    );
  }

  if (command === "ausearch") {
    return output(
      [
        "ausearch: showing recent simulated AVC / AppArmor denials",
        ...state.denials.map(
          (d) => `----\ntime=${d.timestamp} source=${d.source}\n${d.message}`,
        ),
        state.denials.length === 0 ? "(no denials in current scenario)" : "",
        "# Never treat educational logs as host audit data.",
      ].filter(Boolean),
      state,
    );
  }

  if (command === "journalctl") {
    const next = cloneState(state);
    next.logsInspected = true;
    const unit = tokens.find((t) => t.startsWith("-u"))
      ? tokens[tokens.indexOf("-u") + 1]
      : tokens.find((t) => t.startsWith("-u"))?.slice(2);
    const filter = (unit ?? "").toLowerCase();
    let lines = [...next.logs];
    if (filter.includes("apparmor")) {
      lines = lines.filter((line) => /apparmor/i.test(line));
    } else if (filter.includes("selinux") || filter.includes("audit")) {
      lines = lines.filter((line) => /selinux|avc|audit/i.test(line));
    }
    if (lines.length === 0) {
      lines = ["-- No entries --"];
    }
    lines.push(
      "",
      "# Simulated journal — not host logs. Use evidence before changing policy.",
    );
    return output(lines, next);
  }

  if (command === "grep") {
    const pattern = tokens[1];
    if (!pattern) {
      return output(
        ["Usage: grep PATTERN  (filters simulated denials/logs)"],
        state,
      );
    }
    const next = cloneState(state);
    next.logsInspected = true;
    const haystack = [...next.logs, ...next.denials.map((d) => d.message)];
    const matched = haystack.filter((line) =>
      line.toLowerCase().includes(pattern.toLowerCase()),
    );
    return output(
      matched.length > 0 ? matched : [`(no matches for '${pattern}')`],
      next,
    );
  }

  if (command === "mac-eval") {
    const profileOrDomain = tokens[1];
    const opRaw = tokens[2]?.toLowerCase();
    const path = tokens[3];
    if (!profileOrDomain || (opRaw !== "read" && opRaw !== "write") || !path) {
      return output(
        [
          "Usage: mac-eval PROFILE|DOMAIN read|write PATH",
          "Examples:",
          "  mac-eval rean-app read /srv/app/config.yml",
          "  mac-eval httpd_t write /srv/web/upload.dat",
          "  mac-eval rean-app read /srv/app/private.key",
        ],
        state,
      );
    }

    const isProfile = Boolean(state.apparmorProfiles[profileOrDomain]);
    const isDomain =
      profileOrDomain.endsWith("_t") ||
      state.processes.some((p) => p.selinux.type === profileOrDomain);

    const decision = evaluateCombinedAccess(state, {
      profileName: isProfile ? profileOrDomain : undefined,
      processType: isDomain
        ? profileOrDomain
        : isProfile
          ? undefined
          : profileOrDomain,
      path,
      op: opRaw,
    });

    const next = cloneState(state);
    next.lastEvalSummary = decision.summary;
    if (decision.recordedViolation || decision.enforcedBlock) {
      next.denials = [
        {
          timestamp: "Nov 13 10:20:00",
          source: isProfile ? "apparmor" : "selinux",
          subject: profileOrDomain,
          operation: opRaw,
          target: path,
          message: decision.summary,
        },
        ...next.denials,
      ];
    }

    return output(
      [
        `mac-eval ${profileOrDomain} ${opRaw} ${path}`,
        "",
        ...decision.details,
        "",
        `Result: ${decision.allowed ? "ALLOW" : "DENY"}`,
        decision.summary,
        decision.recordedViolation
          ? "Note: a policy violation was recorded (complain/permissive behavior)."
          : "",
      ].filter((line) => line !== undefined),
      next,
    );
  }

  if (command === "mac-allow-path") {
    const profileName = tokens[1];
    const path = tokens[2];
    const access = (tokens[3] ?? "r") as ApparmorFileAccess;
    if (!profileName || !path) {
      return output(["Usage: mac-allow-path PROFILE PATH [r|w|rw]"], state);
    }
    const next = cloneState(state);
    const profile = next.apparmorProfiles[profileName];
    if (!profile) {
      return output([`Unknown profile '${profileName}'`], state);
    }
    profile.deniedFiles = profile.deniedFiles.filter(
      (rule) => !pathMatchesRule(path, rule.path) && rule.path !== path,
    );
    const without = profile.allowedFiles.filter((rule) => rule.path !== path);
    profile.allowedFiles = [...without, { path, access }];
    next.denials = next.denials.filter(
      (d) => !(d.subject === profileName && d.target === path),
    );
    return output(
      [
        `Added allow ${access} for ${path} on profile ${profileName}.`,
        "Prefer the narrowest path that restores the needed operation.",
        "(simulated policy edit — host AppArmor unchanged)",
      ],
      next,
    );
  }

  if (command === "mac-restore-mode") {
    const profileName = tokens[1];
    if (!profileName) {
      return output(["Usage: mac-restore-mode PROFILE"], state);
    }
    const next = cloneState(state);
    const profile = next.apparmorProfiles[profileName];
    if (!profile) {
      return output([`Unknown profile '${profileName}'`], state);
    }
    profile.mode = profile.intendedMode;
    return output(
      [
        `Restored ${profileName} to intended mode: ${profile.intendedMode}`,
        "(simulated)",
      ],
      next,
    );
  }

  if (command === "mac-narrow-profile") {
    const profileName = tokens[1] ?? "rean-app";
    const next = cloneState(state);
    const profile = next.apparmorProfiles[profileName];
    if (!profile) {
      return output([`Unknown profile '${profileName}'`], state);
    }
    profile.overlyBroad = false;
    profile.allowedFiles = [
      { path: "/srv/app/config.yml", access: "r" },
      { path: "/srv/app/uploads/**", access: "rw" },
      { path: "/srv/app/logs/**", access: "rw" },
    ];
    profile.deniedFiles = [{ path: "/etc/shadow", access: "r" }];
    profile.network = ["tcp connect 5432"];
    profile.capabilities = [];
    profile.notes =
      "Least-privilege teaching profile: only app paths and DB connect.";
    next.policyReviewed = true;
    return output(
      [
        `Narrowed ${profileName} to least-privilege teaching rules.`,
        "Removed /** filesystem allow, wild network, and powerful capabilities.",
        "(simulated)",
      ],
      next,
    );
  }

  return output(
    [
      `Command not available in this MAC lab: ${trimmed}`,
      "Type 'help' for supported educational commands.",
    ],
    state,
  );
}
