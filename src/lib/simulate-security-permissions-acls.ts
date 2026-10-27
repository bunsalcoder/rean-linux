/**
 * Frontend-only Linux permissions + POSIX ACL simulation for Stage 04 Lesson 03.
 * Does not execute real shell commands or touch the host filesystem.
 * All paths, users, groups, modes, and ACL entries are fictional teaching examples.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_ACL_USER = "bunsal";
export const SIMULATED_ACL_HOST = "rean-acls";

export type AclScenarioId =
  | "explore"
  | "grant-access"
  | "mask-diagnosis"
  | "remove-excess"
  | "default-acls"
  | "verify-effective"
  | "special-bits"
  | "healthy";

export type AclPermChar = "r" | "w" | "x";

export type AclPerms = {
  r: boolean;
  w: boolean;
  x: boolean;
};

export type AclEntryKind = "user" | "group" | "mask" | "other";

export type AclEntry = {
  kind: AclEntryKind;
  /** Empty string = owning user/group entry (`user::` / `group::`). */
  name: string;
  perms: AclPerms;
};

export type SimulatedAclNode = {
  path: string;
  type: "file" | "directory";
  owner: string;
  group: string;
  /** Full mode including special bits, e.g. 0o1755 or 0o640. */
  mode: number;
  /** Access ACL. When set, group-class bits track the mask. */
  accessAcl: AclEntry[] | null;
  /** Default ACL (directories only). */
  defaultAcl: AclEntry[] | null;
  size: number;
  mtime: string;
};

export type SimulatedAclState = {
  scenarioId: AclScenarioId;
  cwd: string;
  nodes: Record<string, SimulatedAclNode>;
};

export type AclScenarioMeta = {
  id: AclScenarioId;
  label: string;
  summary: string;
};

export type SimulateAclResult = {
  result: SimulateResult;
  state: SimulatedAclState;
};

export type EffectiveAccess = {
  read: boolean;
  write: boolean;
  execute: boolean;
  /** Which ACL/POSIX class decided the result. */
  via: "owner" | "named-user" | "group-class" | "other" | "root" | "missing";
  /** Listed perms before mask (when applicable). */
  listed: AclPerms | null;
  /** Effective perms after mask (when applicable). */
  effective: AclPerms | null;
  maskApplied: boolean;
};

type SimulatedUser = {
  name: string;
  uid: number;
  primaryGroup: string;
  groups: readonly string[];
};

export const ACL_SCENARIOS: readonly AclScenarioMeta[] = [
  {
    id: "explore",
    label: "Explore permissions and ACLs",
    summary:
      "Baseline fictional filesystem with standard modes, special bits, and sample ACL entries.",
  },
  {
    id: "grant-access",
    label: "Grant specific named-user access",
    summary:
      "A project config must be readable by analyst without opening it to every other user.",
  },
  {
    id: "mask-diagnosis",
    label: "Diagnose an ACL mask",
    summary:
      "A named user appears to have write in an ACL entry, but the mask limits effective access.",
  },
  {
    id: "remove-excess",
    label: "Remove excessive ACL access",
    summary:
      "A sensitive config has an unnecessary named-user ACL entry that should be removed carefully.",
  },
  {
    id: "default-acls",
    label: "Configure default ACLs",
    summary:
      "A shared directory needs a predictable access policy for newly created children.",
  },
  {
    id: "verify-effective",
    label: "Verify effective permissions",
    summary:
      "Inspect standard modes and ACL entries together to decide what a user can really do.",
  },
  {
    id: "special-bits",
    label: "Special permission bits",
    summary: "Review SUID, SGID, and sticky-bit examples on fictional paths.",
  },
  {
    id: "healthy",
    label: "Hardened ACL baseline",
    summary: "Remediated state used to confirm a clean recheck.",
  },
] as const;

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                              Show this help message",
  "  pwd                               Print working directory",
  "  cd [PATH]                         Change directory (supported paths)",
  "  ls [-l|-ld] [PATH]                List files; -l shows modes (+ when ACL present)",
  "  stat PATH                         Show detailed metadata",
  "  getfacl PATH                      Show access and default ACL entries",
  "  setfacl -m ENTRY PATH             Add or modify an ACL entry",
  "  setfacl -x ENTRY PATH             Remove a named ACL entry",
  "  setfacl -m m::PERMS PATH          Change the ACL mask",
  "  setfacl -d -m ENTRY PATH          Set a default ACL on a directory",
  "  setfacl -b PATH                   Remove extended ACL entries",
  "  chmod MODE PATH                   Change standard permission bits",
  "  chown OWNER[:GROUP] PATH          Change owner (requires sudo in this lab)",
  "  sudo chown OWNER[:GROUP] PATH     Change owner/group",
  "  check-access USER PATH            Teaching helper: effective r/w/x for a user",
  "  touch PATH                        Create an empty file (inherits default ACLs)",
  "  clear                             Clear the terminal screen",
  "",
  "ACL entry examples:",
  "  u:analyst:r--",
  "  g:reports:r-x",
  "  m::rw-",
  "  u:analyst:rwx  (with setfacl -d for defaults)",
  "",
  "All files, users, groups, and ACL entries are fictional teaching examples.",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const USERS: readonly SimulatedUser[] = [
  {
    name: "root",
    uid: 0,
    primaryGroup: "root",
    groups: [],
  },
  {
    name: "bunsal",
    uid: 1000,
    primaryGroup: "bunsal",
    groups: ["sudo", "deployers", "shared"],
  },
  {
    name: "deploy",
    uid: 1001,
    primaryGroup: "deploy",
    groups: ["deployers"],
  },
  {
    name: "analyst",
    uid: 1002,
    primaryGroup: "analyst",
    groups: ["reports"],
  },
  {
    name: "contractor",
    uid: 1003,
    primaryGroup: "contractor",
    groups: ["contractors"],
  },
  {
    name: "tempadmin",
    uid: 1004,
    primaryGroup: "tempadmin",
    groups: [],
  },
] as const;

function emptyPerms(): AclPerms {
  return { r: false, w: false, x: false };
}

export function permsFromString(raw: string): AclPerms | null {
  const cleaned = raw.trim().toLowerCase();
  if (/^[0-7]$/.test(cleaned)) {
    return permsFromOctalDigit(Number(cleaned));
  }
  if (!/^[r-][w-][x-]$/.test(cleaned)) {
    return null;
  }
  return {
    r: cleaned[0] === "r",
    w: cleaned[1] === "w",
    x: cleaned[2] === "x",
  };
}

function permsFromOctalDigit(digit: number): AclPerms {
  return {
    r: Boolean(digit & 4),
    w: Boolean(digit & 2),
    x: Boolean(digit & 1),
  };
}

export function permsToString(perms: AclPerms): string {
  return `${perms.r ? "r" : "-"}${perms.w ? "w" : "-"}${perms.x ? "x" : "-"}`;
}

export function permsToOctalDigit(perms: AclPerms): number {
  return (perms.r ? 4 : 0) | (perms.w ? 2 : 0) | (perms.x ? 1 : 0);
}

function andPerms(a: AclPerms, b: AclPerms): AclPerms {
  return { r: a.r && b.r, w: a.w && b.w, x: a.x && b.x };
}

function orPerms(a: AclPerms, b: AclPerms): AclPerms {
  return { r: a.r || b.r, w: a.w || b.w, x: a.x || b.x };
}

function clonePerms(perms: AclPerms): AclPerms {
  return { ...perms };
}

function cloneEntry(entry: AclEntry): AclEntry {
  return { kind: entry.kind, name: entry.name, perms: clonePerms(entry.perms) };
}

function cloneAcl(entries: AclEntry[] | null): AclEntry[] | null {
  return entries ? entries.map(cloneEntry) : null;
}

function cloneNode(node: SimulatedAclNode): SimulatedAclNode {
  return {
    ...node,
    accessAcl: cloneAcl(node.accessAcl),
    defaultAcl: cloneAcl(node.defaultAcl),
  };
}

export function cloneAclState(state: SimulatedAclState): SimulatedAclState {
  const nodes: Record<string, SimulatedAclNode> = {};
  for (const [path, node] of Object.entries(state.nodes)) {
    nodes[path] = cloneNode(node);
  }
  return {
    scenarioId: state.scenarioId,
    cwd: state.cwd,
    nodes,
  };
}

function modeClassPerms(mode: number, which: "owner" | "group" | "other") {
  const shift = which === "owner" ? 6 : which === "group" ? 3 : 0;
  const bits = (mode >> shift) & 0o7;
  return permsFromOctalDigit(bits);
}

function setModeClass(
  mode: number,
  which: "owner" | "group" | "other",
  perms: AclPerms,
): number {
  const shift = which === "owner" ? 6 : which === "group" ? 3 : 0;
  const clear = ~(0o7 << shift);
  return (mode & clear) | (permsToOctalDigit(perms) << shift);
}

function baseAclFromMode(mode: number): AclEntry[] {
  return [
    { kind: "user", name: "", perms: modeClassPerms(mode, "owner") },
    { kind: "group", name: "", perms: modeClassPerms(mode, "group") },
    { kind: "other", name: "", perms: modeClassPerms(mode, "other") },
  ];
}

function ensureAccessAcl(node: SimulatedAclNode): AclEntry[] {
  if (node.accessAcl) {
    return node.accessAcl.map(cloneEntry);
  }
  return baseAclFromMode(node.mode);
}

function findEntry(
  entries: readonly AclEntry[],
  kind: AclEntryKind,
  name = "",
): AclEntry | undefined {
  return entries.find((entry) => entry.kind === kind && entry.name === name);
}

function upsertEntry(entries: AclEntry[], next: AclEntry): AclEntry[] {
  const index = entries.findIndex(
    (entry) => entry.kind === next.kind && entry.name === next.name,
  );
  if (index === -1) {
    return [...entries, cloneEntry(next)];
  }
  const copy = entries.map(cloneEntry);
  copy[index] = cloneEntry(next);
  return copy;
}

function removeEntry(
  entries: AclEntry[],
  kind: AclEntryKind,
  name: string,
): AclEntry[] {
  return entries.filter(
    (entry) => !(entry.kind === kind && entry.name === name),
  );
}

function hasExtendedAcl(entries: readonly AclEntry[] | null): boolean {
  if (!entries) {
    return false;
  }
  return entries.some(
    (entry) =>
      entry.kind === "mask" ||
      (entry.kind === "user" && entry.name !== "") ||
      (entry.kind === "group" && entry.name !== ""),
  );
}

function recomputeMask(entries: AclEntry[]): AclEntry[] {
  const namedUsers = entries.filter((e) => e.kind === "user" && e.name !== "");
  const namedGroups = entries.filter(
    (e) => e.kind === "group" && e.name !== "",
  );
  const owningGroup = findEntry(entries, "group", "");
  const needsMask =
    namedUsers.length > 0 ||
    namedGroups.length > 0 ||
    Boolean(findEntry(entries, "mask"));

  if (!needsMask && namedUsers.length === 0 && namedGroups.length === 0) {
    return entries.filter((entry) => entry.kind !== "mask");
  }

  if (namedUsers.length === 0 && namedGroups.length === 0) {
    // Only base entries — drop mask if present when no named entries
    return entries.filter((entry) => entry.kind !== "mask");
  }

  let union = emptyPerms();
  if (owningGroup) {
    union = orPerms(union, owningGroup.perms);
  }
  for (const entry of [...namedUsers, ...namedGroups]) {
    union = orPerms(union, entry.perms);
  }

  const existingMask = findEntry(entries, "mask");
  // When adding first named entry, mask becomes the union (or prior group bits).
  const maskPerms = existingMask ? existingMask.perms : union;
  return upsertEntry(entries, { kind: "mask", name: "", perms: maskPerms });
}

function syncModeFromAcl(node: SimulatedAclNode): SimulatedAclNode {
  if (!node.accessAcl) {
    return node;
  }
  const user = findEntry(node.accessAcl, "user", "");
  const other = findEntry(node.accessAcl, "other");
  const mask = findEntry(node.accessAcl, "mask");
  const group = findEntry(node.accessAcl, "group", "");

  let mode = node.mode & ~0o777;
  if (user) {
    mode = setModeClass(mode, "owner", user.perms);
  }
  // Group class bits reflect the mask when present, else owning group.
  const groupClass = mask?.perms ?? group?.perms ?? emptyPerms();
  mode = setModeClass(mode, "group", groupClass);
  if (other) {
    mode = setModeClass(mode, "other", other.perms);
  }
  return { ...node, mode };
}

function syncAclFromMode(node: SimulatedAclNode): SimulatedAclNode {
  if (!node.accessAcl) {
    return node;
  }
  let entries = node.accessAcl.map(cloneEntry);
  entries = upsertEntry(entries, {
    kind: "user",
    name: "",
    perms: modeClassPerms(node.mode, "owner"),
  });
  entries = upsertEntry(entries, {
    kind: "other",
    name: "",
    perms: modeClassPerms(node.mode, "other"),
  });
  const mask = findEntry(entries, "mask");
  if (mask) {
    entries = upsertEntry(entries, {
      kind: "mask",
      name: "",
      perms: modeClassPerms(node.mode, "group"),
    });
  } else {
    entries = upsertEntry(entries, {
      kind: "group",
      name: "",
      perms: modeClassPerms(node.mode, "group"),
    });
  }
  return { ...node, accessAcl: entries };
}

function sortAclEntries(entries: readonly AclEntry[]): AclEntry[] {
  const rank = (entry: AclEntry): number => {
    if (entry.kind === "user" && entry.name === "") return 0;
    if (entry.kind === "user") return 1;
    if (entry.kind === "group" && entry.name === "") return 2;
    if (entry.kind === "mask") return 3;
    if (entry.kind === "group") return 4;
    return 5;
  };
  return [...entries].sort((a, b) => {
    const diff = rank(a) - rank(b);
    if (diff !== 0) {
      return diff;
    }
    return a.name.localeCompare(b.name);
  });
}

function formatAclLine(entry: AclEntry, mask: AclPerms | null): string {
  const listed = permsToString(entry.perms);
  const tag =
    entry.kind === "mask"
      ? "mask"
      : entry.name
        ? `${entry.kind}:${entry.name}`
        : `${entry.kind}:`;

  const usesMask =
    Boolean(mask) &&
    ((entry.kind === "user" && entry.name !== "") || entry.kind === "group");

  if (usesMask && mask) {
    const effective = andPerms(entry.perms, mask);
    const effectiveStr = permsToString(effective);
    if (effectiveStr !== listed) {
      return `${tag}:${listed}\t#effective:${effectiveStr}`;
    }
  }

  return `${tag}:${listed}`;
}

export function formatGetfacl(
  node: SimulatedAclNode,
  absolutePath: string,
): string[] {
  const lines = [
    `# file: ${absolutePath.replace(/^\//, "")}`,
    `# owner: ${node.owner}`,
    `# group: ${node.group}`,
  ];

  const access = node.accessAcl ?? baseAclFromMode(node.mode);
  const mask = findEntry(access, "mask")?.perms ?? null;
  for (const entry of sortAclEntries(access)) {
    lines.push(formatAclLine(entry, mask));
  }

  if (node.defaultAcl && node.defaultAcl.length > 0) {
    const defaultMask = findEntry(node.defaultAcl, "mask")?.perms ?? null;
    for (const entry of sortAclEntries(node.defaultAcl)) {
      const line = formatAclLine(entry, defaultMask);
      lines.push(`default:${line}`);
    }
  }

  return lines;
}

function findUser(name: string): SimulatedUser | undefined {
  return USERS.find((user) => user.name === name);
}

function userGroups(user: SimulatedUser): readonly string[] {
  return [user.primaryGroup, ...user.groups];
}

/**
 * POSIX-style ACL-aware access check for the simulated filesystem.
 */
export function checkEffectiveAccess(
  node: SimulatedAclNode,
  username: string,
): EffectiveAccess {
  const user = findUser(username);
  if (!user) {
    return {
      read: false,
      write: false,
      execute: false,
      via: "missing",
      listed: null,
      effective: null,
      maskApplied: false,
    };
  }

  if (user.uid === 0) {
    const all = { r: true, w: true, x: true };
    return {
      read: true,
      write: true,
      execute: true,
      via: "root",
      listed: all,
      effective: all,
      maskApplied: false,
    };
  }

  const entries = node.accessAcl ?? baseAclFromMode(node.mode);
  const mask = findEntry(entries, "mask")?.perms ?? null;
  const groups = userGroups(user);

  if (username === node.owner) {
    const ownerEntry = findEntry(entries, "user", "");
    const perms = ownerEntry?.perms ?? modeClassPerms(node.mode, "owner");
    return {
      read: perms.r,
      write: perms.w,
      execute: perms.x,
      via: "owner",
      listed: clonePerms(perms),
      effective: clonePerms(perms),
      maskApplied: false,
    };
  }

  const namedUser = findEntry(entries, "user", username);
  if (namedUser) {
    const listed = clonePerms(namedUser.perms);
    const effective = mask ? andPerms(listed, mask) : listed;
    return {
      read: effective.r,
      write: effective.w,
      execute: effective.x,
      via: "named-user",
      listed,
      effective,
      maskApplied: Boolean(mask),
    };
  }

  const matchingGroupEntries: AclEntry[] = [];
  const owningGroup = findEntry(entries, "group", "");
  if (groups.includes(node.group) && owningGroup) {
    matchingGroupEntries.push(owningGroup);
  }
  for (const entry of entries) {
    if (
      entry.kind === "group" &&
      entry.name !== "" &&
      groups.includes(entry.name)
    ) {
      matchingGroupEntries.push(entry);
    }
  }

  if (matchingGroupEntries.length > 0) {
    let listed = emptyPerms();
    for (const entry of matchingGroupEntries) {
      listed = orPerms(listed, entry.perms);
    }
    const effective = mask ? andPerms(listed, mask) : listed;
    return {
      read: effective.r,
      write: effective.w,
      execute: effective.x,
      via: "group-class",
      listed,
      effective,
      maskApplied: Boolean(mask),
    };
  }

  const other =
    findEntry(entries, "other")?.perms ?? modeClassPerms(node.mode, "other");
  return {
    read: other.r,
    write: other.w,
    execute: other.x,
    via: "other",
    listed: clonePerms(other),
    effective: clonePerms(other),
    maskApplied: false,
  };
}

function modeToSymbolic(
  mode: number,
  type: "file" | "directory",
  hasAcl: boolean,
): string {
  const map = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"] as const;
  let owner: string = map[(mode >> 6) & 7] ?? "---";
  let group: string = map[(mode >> 3) & 7] ?? "---";
  let other: string = map[mode & 7] ?? "---";
  const special = (mode >> 9) & 7;

  if (special & 4) {
    owner =
      owner[2] === "x" ? `${owner.slice(0, 2)}s` : `${owner.slice(0, 2)}S`;
  }
  if (special & 2) {
    group =
      group[2] === "x" ? `${group.slice(0, 2)}s` : `${group.slice(0, 2)}S`;
  }
  if (special & 1) {
    other =
      other[2] === "x" ? `${other.slice(0, 2)}t` : `${other.slice(0, 2)}T`;
  }

  const prefix = type === "directory" ? "d" : "-";
  return `${prefix}${owner}${group}${other}${hasAcl ? "+" : ""}`;
}

function makeNode(
  partial: Omit<SimulatedAclNode, "accessAcl" | "defaultAcl"> & {
    accessAcl?: AclEntry[] | null;
    defaultAcl?: AclEntry[] | null;
  },
): SimulatedAclNode {
  const node: SimulatedAclNode = {
    path: partial.path,
    type: partial.type,
    owner: partial.owner,
    group: partial.group,
    mode: partial.mode,
    accessAcl: partial.accessAcl ?? null,
    defaultAcl: partial.defaultAcl ?? null,
    size: partial.size,
    mtime: partial.mtime,
  };
  if (node.accessAcl) {
    return syncModeFromAcl(node);
  }
  return node;
}

function buildExploreNodes(): Record<string, SimulatedAclNode> {
  return {
    "/": makeNode({
      path: "/",
      type: "directory",
      owner: "root",
      group: "root",
      mode: 0o755,
      size: 4096,
      mtime: "2024-01-01 00:00",
    }),
    "/srv": makeNode({
      path: "/srv",
      type: "directory",
      owner: "root",
      group: "root",
      mode: 0o755,
      size: 4096,
      mtime: "2024-01-02 08:00",
    }),
    "/srv/projects": makeNode({
      path: "/srv/projects",
      type: "directory",
      owner: "deploy",
      group: "deployers",
      mode: 0o750,
      size: 4096,
      mtime: "2024-03-10 10:00",
    }),
    "/srv/projects/app.conf": makeNode({
      path: "/srv/projects/app.conf",
      type: "file",
      owner: "deploy",
      group: "deployers",
      mode: 0o640,
      size: 512,
      mtime: "2024-03-12 09:14",
      accessAcl: [
        { kind: "user", name: "", perms: { r: true, w: true, x: false } },
        { kind: "group", name: "", perms: { r: true, w: false, x: false } },
        { kind: "mask", name: "", perms: { r: true, w: false, x: false } },
        {
          kind: "user",
          name: "analyst",
          perms: { r: true, w: false, x: false },
        },
        { kind: "other", name: "", perms: { r: false, w: false, x: false } },
      ],
    }),
    "/srv/projects/deploy.sh": makeNode({
      path: "/srv/projects/deploy.sh",
      type: "file",
      owner: "deploy",
      group: "deployers",
      mode: 0o750,
      size: 1260,
      mtime: "2024-03-18 16:02",
    }),
    "/srv/reports": makeNode({
      path: "/srv/reports",
      type: "directory",
      owner: "analyst",
      group: "reports",
      mode: 0o750,
      size: 4096,
      mtime: "2024-03-10 10:05",
    }),
    "/srv/reports/quarterly.csv": makeNode({
      path: "/srv/reports/quarterly.csv",
      type: "file",
      owner: "analyst",
      group: "reports",
      mode: 0o640,
      size: 8192,
      mtime: "2024-03-20 08:45",
      accessAcl: [
        { kind: "user", name: "", perms: { r: true, w: true, x: false } },
        { kind: "group", name: "", perms: { r: true, w: false, x: false } },
        { kind: "mask", name: "", perms: { r: true, w: false, x: false } },
        {
          kind: "user",
          name: "contractor",
          perms: { r: true, w: true, x: false },
        },
        { kind: "other", name: "", perms: { r: false, w: false, x: false } },
      ],
    }),
    "/srv/shared": makeNode({
      path: "/srv/shared",
      type: "directory",
      owner: "bunsal",
      group: "shared",
      mode: 0o2770,
      size: 4096,
      mtime: "2024-03-15 11:00",
      accessAcl: [
        { kind: "user", name: "", perms: { r: true, w: true, x: true } },
        { kind: "group", name: "", perms: { r: true, w: true, x: true } },
        { kind: "mask", name: "", perms: { r: true, w: true, x: true } },
        {
          kind: "group",
          name: "reports",
          perms: { r: true, w: false, x: true },
        },
        { kind: "other", name: "", perms: { r: false, w: false, x: false } },
      ],
      defaultAcl: [
        { kind: "user", name: "", perms: { r: true, w: true, x: true } },
        { kind: "group", name: "", perms: { r: true, w: true, x: true } },
        { kind: "mask", name: "", perms: { r: true, w: true, x: false } },
        {
          kind: "group",
          name: "reports",
          perms: { r: true, w: false, x: false },
        },
        { kind: "other", name: "", perms: { r: false, w: false, x: false } },
      ],
    }),
    "/srv/shared/team-notes.txt": makeNode({
      path: "/srv/shared/team-notes.txt",
      type: "file",
      owner: "bunsal",
      group: "shared",
      mode: 0o660,
      size: 240,
      mtime: "2024-03-21 11:30",
      accessAcl: [
        { kind: "user", name: "", perms: { r: true, w: true, x: false } },
        { kind: "group", name: "", perms: { r: true, w: true, x: false } },
        { kind: "mask", name: "", perms: { r: true, w: true, x: false } },
        {
          kind: "group",
          name: "reports",
          perms: { r: true, w: false, x: false },
        },
        { kind: "other", name: "", perms: { r: false, w: false, x: false } },
      ],
    }),
    "/tmp": makeNode({
      path: "/tmp",
      type: "directory",
      owner: "root",
      group: "root",
      mode: 0o1777,
      size: 4096,
      mtime: "2024-03-21 12:00",
    }),
    "/usr": makeNode({
      path: "/usr",
      type: "directory",
      owner: "root",
      group: "root",
      mode: 0o755,
      size: 4096,
      mtime: "2024-01-01 00:00",
    }),
    "/usr/bin": makeNode({
      path: "/usr/bin",
      type: "directory",
      owner: "root",
      group: "root",
      mode: 0o755,
      size: 4096,
      mtime: "2024-01-01 00:00",
    }),
    "/usr/bin/passwd": makeNode({
      path: "/usr/bin/passwd",
      type: "file",
      owner: "root",
      group: "root",
      mode: 0o4755,
      size: 68208,
      mtime: "2024-01-15 09:00",
    }),
  };
}

function scenarioNodes(
  scenarioId: AclScenarioId,
): Record<string, SimulatedAclNode> {
  const base = buildExploreNodes();

  switch (scenarioId) {
    case "grant-access": {
      // No analyst named-user yet — learners must grant read.
      base["/srv/projects/app.conf"] = makeNode({
        path: "/srv/projects/app.conf",
        type: "file",
        owner: "deploy",
        group: "deployers",
        mode: 0o640,
        size: 512,
        mtime: "2024-03-12 09:14",
      });
      return base;
    }
    case "mask-diagnosis": {
      // contractor has rw in entry but mask is r--
      base["/srv/reports/quarterly.csv"] = makeNode({
        path: "/srv/reports/quarterly.csv",
        type: "file",
        owner: "analyst",
        group: "reports",
        mode: 0o640,
        size: 8192,
        mtime: "2024-03-20 08:45",
        accessAcl: [
          { kind: "user", name: "", perms: { r: true, w: true, x: false } },
          { kind: "group", name: "", perms: { r: true, w: false, x: false } },
          { kind: "mask", name: "", perms: { r: true, w: false, x: false } },
          {
            kind: "user",
            name: "contractor",
            perms: { r: true, w: true, x: false },
          },
          { kind: "other", name: "", perms: { r: false, w: false, x: false } },
        ],
      });
      return base;
    }
    case "remove-excess": {
      base["/srv/projects/app.conf"] = makeNode({
        path: "/srv/projects/app.conf",
        type: "file",
        owner: "deploy",
        group: "deployers",
        mode: 0o640,
        size: 512,
        mtime: "2024-03-12 09:14",
        accessAcl: [
          { kind: "user", name: "", perms: { r: true, w: true, x: false } },
          { kind: "group", name: "", perms: { r: true, w: false, x: false } },
          { kind: "mask", name: "", perms: { r: true, w: true, x: false } },
          {
            kind: "user",
            name: "analyst",
            perms: { r: true, w: false, x: false },
          },
          {
            kind: "user",
            name: "tempadmin",
            perms: { r: true, w: true, x: false },
          },
          { kind: "other", name: "", perms: { r: false, w: false, x: false } },
        ],
      });
      return base;
    }
    case "default-acls": {
      // Shared dir without default ACL — learners configure it.
      base["/srv/shared"] = makeNode({
        path: "/srv/shared",
        type: "directory",
        owner: "bunsal",
        group: "shared",
        mode: 0o2770,
        size: 4096,
        mtime: "2024-03-15 11:00",
        accessAcl: [
          { kind: "user", name: "", perms: { r: true, w: true, x: true } },
          { kind: "group", name: "", perms: { r: true, w: true, x: true } },
          { kind: "other", name: "", perms: { r: false, w: false, x: false } },
        ],
        defaultAcl: null,
      });
      return base;
    }
    case "verify-effective":
    case "special-bits":
    case "explore":
      return base;
    case "healthy": {
      // Analyst has read; no tempadmin; mask allows intended access; default ACL set.
      base["/srv/projects/app.conf"] = makeNode({
        path: "/srv/projects/app.conf",
        type: "file",
        owner: "deploy",
        group: "deployers",
        mode: 0o640,
        size: 512,
        mtime: "2024-03-12 09:14",
        accessAcl: [
          { kind: "user", name: "", perms: { r: true, w: true, x: false } },
          { kind: "group", name: "", perms: { r: true, w: false, x: false } },
          { kind: "mask", name: "", perms: { r: true, w: false, x: false } },
          {
            kind: "user",
            name: "analyst",
            perms: { r: true, w: false, x: false },
          },
          { kind: "other", name: "", perms: { r: false, w: false, x: false } },
        ],
      });
      base["/srv/reports/quarterly.csv"] = makeNode({
        path: "/srv/reports/quarterly.csv",
        type: "file",
        owner: "analyst",
        group: "reports",
        mode: 0o660,
        size: 8192,
        mtime: "2024-03-20 08:45",
        accessAcl: [
          { kind: "user", name: "", perms: { r: true, w: true, x: false } },
          { kind: "group", name: "", perms: { r: true, w: false, x: false } },
          { kind: "mask", name: "", perms: { r: true, w: true, x: false } },
          {
            kind: "user",
            name: "contractor",
            perms: { r: true, w: true, x: false },
          },
          { kind: "other", name: "", perms: { r: false, w: false, x: false } },
        ],
      });
      return base;
    }
    default:
      return base;
  }
}

export function createInitialAclState(
  scenarioId: AclScenarioId = "explore",
): SimulatedAclState {
  return {
    scenarioId,
    cwd: "/srv",
    nodes: scenarioNodes(scenarioId),
  };
}

export function isAclScenarioId(value: string): value is AclScenarioId {
  return ACL_SCENARIOS.some((scenario) => scenario.id === value);
}

export function getAclScenario(scenarioId: AclScenarioId): AclScenarioMeta {
  return (
    ACL_SCENARIOS.find((scenario) => scenario.id === scenarioId) ??
    ACL_SCENARIOS[0]!
  );
}

export function formatAclPrompt(cwd?: string): string {
  const path = cwd && cwd !== "/" ? cwd : cwd === "/" ? "/" : "/srv";
  const short = path === "/home/bunsal" ? "~" : path;
  return `${SIMULATED_ACL_USER}@${SIMULATED_ACL_HOST}:${short}$ `;
}

/** Lab validation helpers — check simulated state, not command strings. */
export function hasNamedUserAcl(
  state: SimulatedAclState,
  path: string,
  username: string,
  required?: Partial<AclPerms>,
): boolean {
  const node = state.nodes[normalizePath(path, state.cwd)];
  if (!node?.accessAcl) {
    return false;
  }
  const entry = findEntry(node.accessAcl, "user", username);
  if (!entry) {
    return false;
  }
  if (!required) {
    return true;
  }
  if (required.r !== undefined && entry.perms.r !== required.r) return false;
  if (required.w !== undefined && entry.perms.w !== required.w) return false;
  if (required.x !== undefined && entry.perms.x !== required.x) return false;
  return true;
}

export function lacksNamedUserAcl(
  state: SimulatedAclState,
  path: string,
  username: string,
): boolean {
  const node = state.nodes[normalizePath(path, state.cwd)];
  if (!node) {
    return true;
  }
  if (!node.accessAcl) {
    return true;
  }
  return !findEntry(node.accessAcl, "user", username);
}

export function maskAllows(
  state: SimulatedAclState,
  path: string,
  want: Partial<AclPerms>,
): boolean {
  const node = state.nodes[normalizePath(path, state.cwd)];
  if (!node?.accessAcl) {
    return false;
  }
  const mask = findEntry(node.accessAcl, "mask");
  if (!mask) {
    return false;
  }
  if (want.r !== undefined && mask.perms.r !== want.r) return false;
  if (want.w !== undefined && mask.perms.w !== want.w) return false;
  if (want.x !== undefined && mask.perms.x !== want.x) return false;
  return true;
}

export function hasDefaultAclEntry(
  state: SimulatedAclState,
  path: string,
  kind: AclEntryKind,
  name: string,
  required?: Partial<AclPerms>,
): boolean {
  const node = state.nodes[normalizePath(path, state.cwd)];
  if (!node?.defaultAcl) {
    return false;
  }
  const entry = findEntry(node.defaultAcl, kind, name);
  if (!entry) {
    return false;
  }
  if (!required) {
    return true;
  }
  if (required.r !== undefined && entry.perms.r !== required.r) return false;
  if (required.w !== undefined && entry.perms.w !== required.w) return false;
  if (required.x !== undefined && entry.perms.x !== required.x) return false;
  return true;
}

export function userCan(
  state: SimulatedAclState,
  path: string,
  username: string,
  access: AclPermChar,
): boolean {
  const node = state.nodes[normalizePath(path, state.cwd)];
  if (!node) {
    return false;
  }
  const result = checkEffectiveAccess(node, username);
  if (access === "r") return result.read;
  if (access === "w") return result.write;
  return result.execute;
}

function normalizePath(input: string, cwd: string): string {
  let raw = input.trim() || cwd;
  if (raw === "~" || raw.startsWith("~/")) {
    raw = `/home/bunsal${raw.slice(1)}`;
  }
  if (!raw.startsWith("/")) {
    raw = `${cwd === "/" ? "" : cwd}/${raw}`;
  }
  const parts: string[] = [];
  for (const part of raw.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.length === 0 ? "/" : `/${parts.join("/")}`;
}

function parentPath(path: string): string {
  if (path === "/") return "/";
  const index = path.lastIndexOf("/");
  return index <= 0 ? "/" : path.slice(0, index);
}

function basename(path: string): string {
  if (path === "/") return "/";
  return path.slice(path.lastIndexOf("/") + 1);
}

function listChildren(state: SimulatedAclState, dirPath: string): string[] {
  const prefix = dirPath === "/" ? "/" : `${dirPath}/`;
  const names = new Set<string>();
  for (const path of Object.keys(state.nodes)) {
    if (path === dirPath) continue;
    if (!path.startsWith(prefix)) continue;
    const rest = path.slice(prefix.length);
    const name = rest.split("/")[0];
    if (name) names.add(name);
  }
  return [...names].sort();
}

function formatLsLong(node: SimulatedAclNode): string {
  const hasAcl =
    hasExtendedAcl(node.accessAcl) || Boolean(node.defaultAcl?.length);
  const mode = modeToSymbolic(node.mode, node.type, hasAcl);
  const nlink = node.type === "directory" ? "2" : "1";
  return `${mode} ${nlink} ${node.owner} ${node.group} ${String(node.size).padStart(5, " ")} ${node.mtime} ${basename(node.path)}`;
}

function parseAclSpec(
  spec: string,
): { kind: AclEntryKind; name: string; perms: AclPerms } | { error: string } {
  const cleaned = spec.trim().toLowerCase();
  // Forms: u:name:rwx | user:name:rwx | g:name:rwx | m::rwx | o::rwx | u::rwx
  const match = cleaned.match(
    /^(u|user|g|group|m|mask|o|other):([^:]*):([rwx-]{3}|[0-7])$/,
  );
  if (!match) {
    return {
      error:
        "Unsupported ACL entry. Use forms like u:analyst:r--, g:reports:r-x, m::rw-, or o::---.",
    };
  }
  const kindRaw = match[1]!;
  const name = match[2]!;
  const perms = permsFromString(match[3]!);
  if (!perms) {
    return {
      error: "Invalid permission string. Use rwx form such as r-- or rw-.",
    };
  }

  let kind: AclEntryKind;
  if (kindRaw === "u" || kindRaw === "user") kind = "user";
  else if (kindRaw === "g" || kindRaw === "group") kind = "group";
  else if (kindRaw === "m" || kindRaw === "mask") kind = "mask";
  else kind = "other";

  if (kind === "mask" || kind === "other") {
    if (name !== "") {
      return { error: `${kind} entries must use an empty name (e.g. m::rw-).` };
    }
  }

  if (kind === "user" && name !== "" && !findUser(name)) {
    return { error: `Unknown user in this simulation: ${name}` };
  }

  return { kind, name, perms };
}

function parseRemoveSpec(
  spec: string,
): { kind: AclEntryKind; name: string } | { error: string } {
  const cleaned = spec.trim().toLowerCase();
  const match = cleaned.match(/^(u|user|g|group):([^:]+)$/);
  if (!match) {
    return {
      error:
        "Unsupported remove entry. Use setfacl -x u:name PATH or setfacl -x g:name PATH.",
    };
  }
  const kindRaw = match[1]!;
  const name = match[2]!;
  const kind: AclEntryKind =
    kindRaw === "u" || kindRaw === "user" ? "user" : "group";
  if (!name) {
    return { error: "Cannot remove the owning user/group base entry with -x." };
  }
  return { kind, name };
}

function applyDefaultAclToNewFile(
  parent: SimulatedAclNode,
  newPath: string,
  owner: string,
): SimulatedAclNode {
  if (!parent.defaultAcl || parent.defaultAcl.length === 0) {
    return makeNode({
      path: newPath,
      type: "file",
      owner,
      group: parent.group,
      mode: 0o644,
      size: 0,
      mtime: "2024-03-22 10:00",
    });
  }

  const accessAcl = parent.defaultAcl.map(cloneEntry);
  // New files typically drop execute from default unless directory creation.
  const adjusted = accessAcl.map((entry) => {
    if (
      entry.kind === "mask" ||
      entry.kind === "user" ||
      entry.kind === "group" ||
      entry.kind === "other"
    ) {
      return {
        ...entry,
        perms: { ...entry.perms, x: false },
      };
    }
    return entry;
  });

  return makeNode({
    path: newPath,
    type: "file",
    owner,
    group: parent.group,
    mode: 0o644,
    size: 0,
    mtime: "2024-03-22 10:00",
    accessAcl: adjusted,
  });
}

function output(lines: readonly string[]): SimulateResult {
  return { kind: "output", lines };
}

function tokenize(command: string): string[] {
  return command.trim().split(/\s+/).filter(Boolean);
}

export function simulateAclCommand(
  command: string,
  state: SimulatedAclState,
): SimulateAclResult {
  const next = cloneAclState(state);
  const trimmed = command.trim();
  if (!trimmed) {
    return { result: { kind: "empty" }, state: next };
  }

  const tokens = tokenize(trimmed);
  const cmd = tokens[0]!.toLowerCase();

  if (cmd === "clear") {
    return { result: { kind: "clear" }, state: next };
  }

  if (cmd === "help") {
    return { result: output(HELP_OUTPUT), state: next };
  }

  if (cmd === "pwd") {
    return { result: output([next.cwd]), state: next };
  }

  if (cmd === "whoami") {
    return { result: output([SIMULATED_ACL_USER]), state: next };
  }

  if (cmd === "cd") {
    const target = tokens[1]
      ? normalizePath(tokens[1], next.cwd)
      : "/home/bunsal";
    const node = next.nodes[target];
    if (!node || node.type !== "directory") {
      return {
        result: output([`cd: ${tokens[1] ?? "~"}: No such file or directory`]),
        state: next,
      };
    }
    next.cwd = target;
    return { result: output([]), state: next };
  }

  if (cmd === "ls") {
    return handleLs(tokens.slice(1), next);
  }

  if (cmd === "stat") {
    if (!tokens[1]) {
      return { result: output(["stat: missing operand"]), state: next };
    }
    const path = normalizePath(tokens[1], next.cwd);
    const node = next.nodes[path];
    if (!node) {
      return {
        result: output([
          `stat: cannot statx '${tokens[1]}': No such file or directory`,
        ]),
        state: next,
      };
    }
    const hasAcl =
      hasExtendedAcl(node.accessAcl) || Boolean(node.defaultAcl?.length);
    const access = (node.mode & 0o777).toString(8).padStart(4, "0");
    const special = ((node.mode >> 9) & 7).toString(8);
    return {
      result: output([
        `  File: ${path}`,
        `  Size: ${node.size}\tBlocks: 8\tIO Block: 4096\t${node.type === "directory" ? "directory" : "regular file"}`,
        `Device: 08h/8d\tInode: 10001\tLinks: ${node.type === "directory" ? 2 : 1}`,
        `Access: (${special === "0" ? "" : special}${access.slice(-3)}/${modeToSymbolic(node.mode, node.type, hasAcl)})  Uid: ( ${findUser(node.owner)?.uid ?? "?"} / ${node.owner})   Gid: ( ${1000} / ${node.group})`,
        `Access: ${node.mtime}`,
        `Modify: ${node.mtime}`,
        `Change: ${node.mtime}`,
        hasAcl
          ? " ACL:   yes (use getfacl for entries)"
          : " ACL:   no extended ACL entries",
      ]),
      state: next,
    };
  }

  if (cmd === "getfacl") {
    if (!tokens[1]) {
      return { result: output(["getfacl: missing operand"]), state: next };
    }
    if (tokens.length > 2 || tokens[1]!.startsWith("-")) {
      return {
        result: output([
          "getfacl: only `getfacl PATH` is supported in this learning terminal.",
        ]),
        state: next,
      };
    }
    const path = normalizePath(tokens[1], next.cwd);
    const node = next.nodes[path];
    if (!node) {
      return {
        result: output([`getfacl: ${tokens[1]}: No such file or directory`]),
        state: next,
      };
    }
    return { result: output(formatGetfacl(node, path)), state: next };
  }

  if (cmd === "setfacl") {
    return handleSetfacl(tokens.slice(1), next);
  }

  if (cmd === "chmod") {
    return handleChmod(tokens.slice(1), next);
  }

  if (cmd === "chown") {
    return {
      result: output([
        "chown: changing ownership requires elevated privileges in this lab.",
        "Try: sudo chown OWNER[:GROUP] PATH",
      ]),
      state: next,
    };
  }

  if (cmd === "sudo" && tokens[1]?.toLowerCase() === "chown") {
    return handleChown(tokens.slice(2), next);
  }

  if (cmd === "check-access") {
    if (tokens.length !== 3) {
      return {
        result: output([
          "Usage: check-access USER PATH",
          "Teaching helper — shows effective r/w/x for a fictional user.",
        ]),
        state: next,
      };
    }
    const username = tokens[1]!;
    const path = normalizePath(tokens[2]!, next.cwd);
    const node = next.nodes[path];
    if (!node) {
      return {
        result: output([
          `check-access: ${tokens[2]}: No such file or directory`,
        ]),
        state: next,
      };
    }
    if (!findUser(username)) {
      return {
        result: output([`check-access: unknown user '${username}'`]),
        state: next,
      };
    }
    const access = checkEffectiveAccess(node, username);
    const lines = [
      `Effective access for ${username} on ${path}:`,
      `  via: ${access.via}`,
      `  read=${access.read}  write=${access.write}  execute=${access.execute}`,
    ];
    if (access.listed) {
      lines.push(`  listed permissions:   ${permsToString(access.listed)}`);
    }
    if (access.effective) {
      lines.push(
        `  effective permissions: ${permsToString(access.effective)}${access.maskApplied ? " (after ACL mask)" : ""}`,
      );
    }
    if (
      access.maskApplied &&
      access.listed &&
      access.effective &&
      permsToString(access.listed) !== permsToString(access.effective)
    ) {
      lines.push(
        "  note: the ACL entry lists more access than the mask allows — effective rights are the intersection.",
      );
    }
    return { result: output(lines), state: next };
  }

  if (cmd === "touch") {
    if (!tokens[1]) {
      return { result: output(["touch: missing file operand"]), state: next };
    }
    if (tokens.length > 2) {
      return {
        result: output(["touch: only a single PATH is supported here."]),
        state: next,
      };
    }
    const path = normalizePath(tokens[1], next.cwd);
    if (next.nodes[path]) {
      next.nodes[path] = {
        ...next.nodes[path]!,
        mtime: "2024-03-22 10:00",
      };
      return { result: output([]), state: next };
    }
    const parent = next.nodes[parentPath(path)];
    if (!parent || parent.type !== "directory") {
      return {
        result: output([
          `touch: cannot touch '${tokens[1]}': No such file or directory`,
        ]),
        state: next,
      };
    }
    next.nodes[path] = applyDefaultAclToNewFile(
      parent,
      path,
      SIMULATED_ACL_USER,
    );
    return { result: output([]), state: next };
  }

  if (cmd === "sudo") {
    return {
      result: output([
        `sudo: unsupported in this lab except: sudo chown OWNER[:GROUP] PATH`,
        ...UNSUPPORTED_MESSAGE,
      ]),
      state: next,
    };
  }

  return { result: output(UNSUPPORTED_MESSAGE), state: next };
}

function handleLs(args: string[], state: SimulatedAclState): SimulateAclResult {
  let long = false;
  let directory = false;
  const paths: string[] = [];

  for (const arg of args) {
    if (arg === "-l") {
      long = true;
      continue;
    }
    if (arg === "-ld" || arg === "-dl") {
      long = true;
      directory = true;
      continue;
    }
    if (arg.startsWith("-")) {
      return {
        result: output([
          `ls: unsupported option '${arg}'. Supported: ls, ls -l, ls -ld [PATH].`,
        ]),
        state,
      };
    }
    paths.push(arg);
  }

  const targets = paths.length > 0 ? paths : ["."];
  const lines: string[] = [];

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]!;
    const path = normalizePath(target, state.cwd);
    const node = state.nodes[path];
    if (!node) {
      lines.push(`ls: cannot access '${target}': No such file or directory`);
      continue;
    }

    if (targets.length > 1) {
      if (i > 0) lines.push("");
      lines.push(`${path}:`);
    }

    if (node.type === "file" || directory) {
      lines.push(long ? formatLsLong(node) : basename(path));
      continue;
    }

    const children = listChildren(state, path);
    if (!long) {
      lines.push(...children);
      continue;
    }
    lines.push(`total ${children.length * 4}`);
    for (const name of children) {
      const childPath = path === "/" ? `/${name}` : `${path}/${name}`;
      const child = state.nodes[childPath];
      if (child) {
        lines.push(formatLsLong(child));
      }
    }
  }

  return { result: output(lines), state };
}

function handleSetfacl(
  args: string[],
  state: SimulatedAclState,
): SimulateAclResult {
  if (args.length === 0) {
    return {
      result: output([
        "setfacl: missing operand",
        "Supported: setfacl -m ENTRY PATH | setfacl -x ENTRY PATH | setfacl -d -m ENTRY PATH | setfacl -b PATH",
      ]),
      state,
    };
  }

  let isDefault = false;
  let mode: "modify" | "remove" | "remove-all" | null = null;
  let entrySpec: string | null = null;
  const paths: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === "-d" || arg === "--default") {
      isDefault = true;
      continue;
    }
    if (arg === "-m" || arg === "--modify") {
      mode = "modify";
      const nextArg = args[++i];
      if (!nextArg) {
        return {
          result: output(["setfacl: option -m requires an ACL entry"]),
          state,
        };
      }
      entrySpec = nextArg;
      continue;
    }
    if (arg === "-x" || arg === "--remove") {
      mode = "remove";
      const nextArg = args[++i];
      if (!nextArg) {
        return {
          result: output(["setfacl: option -x requires an ACL entry"]),
          state,
        };
      }
      entrySpec = nextArg;
      continue;
    }
    if (arg === "-b" || arg === "--remove-all") {
      mode = "remove-all";
      continue;
    }
    if (arg.startsWith("-")) {
      return {
        result: output([
          `setfacl: unsupported option '${arg}'.`,
          "Supported: -m, -x, -d, -b with the narrowly scoped forms in help.",
        ]),
        state,
      };
    }
    paths.push(arg);
  }

  if (!mode) {
    return {
      result: output([
        "setfacl: specify -m, -x, or -b.",
        'Try "help" for supported examples.',
      ]),
      state,
    };
  }

  if (paths.length !== 1) {
    return {
      result: output(["setfacl: exactly one PATH is required in this lab."]),
      state,
    };
  }

  const path = normalizePath(paths[0]!, state.cwd);
  const node = state.nodes[path];
  if (!node) {
    return {
      result: output([`setfacl: ${paths[0]}: No such file or directory`]),
      state,
    };
  }

  if (isDefault && node.type !== "directory") {
    return {
      result: output([
        "setfacl: default ACLs (-d) can only be set on directories.",
      ]),
      state,
    };
  }

  if (mode === "remove-all") {
    if (isDefault) {
      state.nodes[path] = { ...node, defaultAcl: null };
      return { result: output([]), state };
    }
    state.nodes[path] = syncModeFromAcl({
      ...node,
      accessAcl: baseAclFromMode(node.mode),
    });
    // After removing extended ACL, store null (base mode only)
    state.nodes[path] = {
      ...state.nodes[path]!,
      accessAcl: null,
      defaultAcl: isDefault ? null : node.defaultAcl,
    };
    return { result: output([]), state };
  }

  if (mode === "remove") {
    if (!entrySpec) {
      return { result: output(["setfacl: missing ACL entry for -x"]), state };
    }
    const parsed = parseRemoveSpec(entrySpec);
    if ("error" in parsed) {
      return { result: output([parsed.error]), state };
    }
    if (isDefault) {
      if (!node.defaultAcl) {
        return {
          result: output([`setfacl: ${paths[0]}: No default ACL entry found`]),
          state,
        };
      }
      const nextDefault = removeEntry(
        node.defaultAcl,
        parsed.kind,
        parsed.name,
      );
      state.nodes[path] = {
        ...node,
        defaultAcl: nextDefault.length > 0 ? nextDefault : null,
      };
      return { result: output([]), state };
    }

    let entries = ensureAccessAcl(node);
    if (!findEntry(entries, parsed.kind, parsed.name)) {
      return {
        result: output([
          `setfacl: ${paths[0]}: No ACL entry found for ${parsed.kind}:${parsed.name}`,
        ]),
        state,
      };
    }
    entries = removeEntry(entries, parsed.kind, parsed.name);
    entries = recomputeMask(entries);
    const updated = syncModeFromAcl({
      ...node,
      accessAcl: hasExtendedAcl(entries) ? entries : null,
    });
    state.nodes[path] = updated;
    return { result: output([]), state };
  }

  // modify
  if (!entrySpec) {
    return { result: output(["setfacl: missing ACL entry for -m"]), state };
  }
  const parsed = parseAclSpec(entrySpec);
  if ("error" in parsed) {
    return { result: output([parsed.error]), state };
  }

  if (isDefault) {
    let defaults = node.defaultAcl
      ? node.defaultAcl.map(cloneEntry)
      : baseAclFromMode(node.mode);
    defaults = upsertEntry(defaults, {
      kind: parsed.kind,
      name: parsed.name,
      perms: parsed.perms,
    });
    if (parsed.kind === "user" || parsed.kind === "group") {
      defaults = recomputeMask(defaults);
    }
    if (parsed.kind === "mask") {
      defaults = upsertEntry(defaults, {
        kind: "mask",
        name: "",
        perms: parsed.perms,
      });
    }
    state.nodes[path] = { ...node, defaultAcl: defaults };
    return { result: output([]), state };
  }

  let entries = ensureAccessAcl(node);
  entries = upsertEntry(entries, {
    kind: parsed.kind,
    name: parsed.name,
    perms: parsed.perms,
  });
  if (parsed.kind === "mask") {
    // Keep named entries intact — only the mask changes (effective rights update).
  } else if (parsed.kind === "user" || parsed.kind === "group") {
    entries = recomputeMask(entries);
  }
  const updated = syncModeFromAcl({
    ...node,
    accessAcl: hasExtendedAcl(entries) ? entries : entries,
  });
  // Always keep ACL once modified via setfacl
  state.nodes[path] = {
    ...updated,
    accessAcl: sortAclEntries(entries),
  };
  return { result: output([]), state };
}

function handleChmod(
  args: string[],
  state: SimulatedAclState,
): SimulateAclResult {
  if (args.length !== 2) {
    return {
      result: output([
        "chmod: usage in this lab: chmod MODE PATH",
        "MODE examples: 640, 750, 755, 4755, 2755, 1777",
      ]),
      state,
    };
  }

  const modeRaw = args[0]!;
  const path = normalizePath(args[1]!, state.cwd);
  const node = state.nodes[path];
  if (!node) {
    return {
      result: output([
        `chmod: cannot access '${args[1]}': No such file or directory`,
      ]),
      state,
    };
  }

  if (!/^[0-7]{3,4}$/.test(modeRaw)) {
    return {
      result: output([
        `chmod: unsupported mode '${modeRaw}'. Use numeric modes such as 640, 750, or 4755.`,
      ]),
      state,
    };
  }

  const value = Number.parseInt(modeRaw, 8);
  let updated: SimulatedAclNode = { ...node, mode: value };
  if (updated.accessAcl) {
    updated = syncAclFromMode(updated);
  }
  state.nodes[path] = updated;
  return { result: output([]), state };
}

function handleChown(
  args: string[],
  state: SimulatedAclState,
): SimulateAclResult {
  if (args.length !== 2) {
    return {
      result: output(["sudo chown: usage: sudo chown OWNER[:GROUP] PATH"]),
      state,
    };
  }

  const spec = args[0]!;
  const path = normalizePath(args[1]!, state.cwd);
  const node = state.nodes[path];
  if (!node) {
    return {
      result: output([
        `chown: cannot access '${args[1]}': No such file or directory`,
      ]),
      state,
    };
  }

  const [ownerPart, groupPart] = spec.split(":");
  if (!ownerPart || !findUser(ownerPart)) {
    return {
      result: output([`chown: invalid user: '${ownerPart ?? ""}'`]),
      state,
    };
  }

  const nextNode = { ...node, owner: ownerPart };
  if (groupPart !== undefined) {
    if (!groupPart) {
      return { result: output(["chown: invalid group: ''"]), state };
    }
    nextNode.group = groupPart;
  }
  state.nodes[path] = nextNode;
  return { result: output([]), state };
}
