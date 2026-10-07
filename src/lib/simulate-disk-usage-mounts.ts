/**
 * Frontend-only disk usage / mounts simulation for Stage 03 Lesson 04.
 * Does not execute df, du, mount, umount, or findmnt on the host.
 * Never inspects real disks, /dev, or the host filesystem.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_DISK_USER = "bunsal";
export const SIMULATED_DISK_HOST = "rean-linux";

export type SimulatedBlockDevice = {
  name: string;
  filesystem: string;
  size: string;
  used: string;
  avail: string;
  usePercent: string;
  /** null when unmounted */
  mountPoint: string | null;
  /** Non-human 1K-block style figures for plain `df`. */
  sizeBlocks: string;
  usedBlocks: string;
  availBlocks: string;
};

export type SimulatedUsageNode = {
  path: string;
  human: string;
  blocks: string;
  kind: "dir" | "file";
  children?: readonly SimulatedUsageNode[];
};

export type SimulatedDiskState = {
  devices: SimulatedBlockDevice[];
  /** Allowed mount-point directories in the simulation. */
  availableMountPoints: string[];
};

export type SimulateDiskResult = {
  result: SimulateResult;
  state: SimulatedDiskState;
};

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                              Show this help message",
  "  df                                Show filesystem usage",
  "  df -h                             Human-readable filesystem usage",
  "  du                                Directory usage (current path)",
  "  du -h                             Human-readable directory usage",
  "  du -sh PATH                       Summary for a path",
  "  du -h PATH                        Human-readable usage under PATH",
  "  du -h --max-depth=1 PATH          One level of subdirectories",
  "  du -ah PATH                       Include files as well as directories",
  "  mount                             List mounted filesystems",
  "  findmnt                           Structured mount table",
  "  mount DEVICE MOUNTPOINT           Mount a simulated filesystem",
  "  sudo mount DEVICE MOUNTPOINT      Mount with sudo",
  "  umount MOUNTPOINT                 Unmount a simulated filesystem",
  "  sudo umount MOUNTPOINT            Unmount with sudo",
  "  clear                             Clear the terminal screen",
  "",
  "Examples:",
  "  df -h",
  "  du -sh /home",
  "  du -h --max-depth=1 /var",
  "  findmnt",
  "  sudo mount /dev/sdb1 /data",
  "  sudo umount /data",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const INITIAL_DEVICES: readonly SimulatedBlockDevice[] = [
  {
    name: "/dev/sda1",
    filesystem: "ext4",
    size: "20G",
    used: "8G",
    avail: "12G",
    usePercent: "40%",
    mountPoint: "/",
    sizeBlocks: "20971520",
    usedBlocks: "8388608",
    availBlocks: "12582912",
  },
  {
    name: "/dev/sda2",
    filesystem: "ext4",
    size: "70G",
    used: "22G",
    avail: "48G",
    usePercent: "32%",
    mountPoint: "/home",
    sizeBlocks: "73400320",
    usedBlocks: "23068672",
    availBlocks: "50331648",
  },
  {
    name: "/dev/sdb1",
    filesystem: "ext4",
    size: "50G",
    used: "12G",
    avail: "38G",
    usePercent: "24%",
    mountPoint: null,
    sizeBlocks: "52428800",
    usedBlocks: "12582912",
    availBlocks: "39845888",
  },
];

/** Deterministic directory/file usage tree — never derived from the host. */
export const USAGE_TREE: SimulatedUsageNode = {
  path: "/",
  human: "13.7G",
  blocks: "14365491",
  kind: "dir",
  children: [
    {
      path: "/etc",
      human: "120M",
      blocks: "122880",
      kind: "dir",
    },
    {
      path: "/var",
      human: "2.3G",
      blocks: "2411724",
      kind: "dir",
      children: [
        {
          path: "/var/log",
          human: "1.2G",
          blocks: "1258291",
          kind: "dir",
          children: [
            {
              path: "/var/log/syslog",
              human: "800M",
              blocks: "819200",
              kind: "file",
            },
            {
              path: "/var/log/kern.log",
              human: "400M",
              blocks: "409600",
              kind: "file",
            },
          ],
        },
        {
          path: "/var/cache",
          human: "850M",
          blocks: "870400",
          kind: "dir",
          children: [
            {
              path: "/var/cache/apt",
              human: "600M",
              blocks: "614400",
              kind: "file",
            },
            {
              path: "/var/cache/fontconfig",
              human: "250M",
              blocks: "256000",
              kind: "file",
            },
          ],
        },
        {
          path: "/var/tmp",
          human: "120M",
          blocks: "122880",
          kind: "dir",
          children: [
            {
              path: "/var/tmp/old-build",
              human: "100M",
              blocks: "102400",
              kind: "file",
            },
            {
              path: "/var/tmp/scratch",
              human: "20M",
              blocks: "20480",
              kind: "file",
            },
          ],
        },
      ],
    },
    {
      path: "/usr",
      human: "4.8G",
      blocks: "5033164",
      kind: "dir",
    },
    {
      path: "/home",
      human: "6.5G",
      blocks: "6815744",
      kind: "dir",
      children: [
        {
          path: "/home/bunsal",
          human: "4.1G",
          blocks: "4299161",
          kind: "dir",
        },
        {
          path: "/home/shared",
          human: "2.4G",
          blocks: "2516582",
          kind: "dir",
        },
      ],
    },
  ],
};

const AVAILABLE_MOUNT_POINTS = ["/data"] as const;

export function createInitialDiskState(): SimulatedDiskState {
  return {
    devices: INITIAL_DEVICES.map((device) => ({ ...device })),
    availableMountPoints: [...AVAILABLE_MOUNT_POINTS],
  };
}

export function cloneDiskState(state: SimulatedDiskState): SimulatedDiskState {
  return {
    devices: state.devices.map((device) => ({ ...device })),
    availableMountPoints: [...state.availableMountPoints],
  };
}

export function formatDiskUsagePrompt(): string {
  return `${SIMULATED_DISK_USER}@${SIMULATED_DISK_HOST}:~$`;
}

function tokenize(input: string): string[] | { error: string } {
  const tokens: string[] = [];
  let i = 0;
  const s = input.trim();

  while (i < s.length) {
    while (i < s.length && /\s/.test(s[i]!)) {
      i += 1;
    }
    if (i >= s.length) {
      break;
    }

    const ch = s[i]!;
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i += 1;
      let value = "";
      while (i < s.length && s[i] !== quote) {
        value += s[i];
        i += 1;
      }
      if (i >= s.length) {
        return { error: `Unclosed quote in command.` };
      }
      i += 1;
      tokens.push(value);
      continue;
    }

    let value = "";
    while (i < s.length && !/\s/.test(s[i]!)) {
      value += s[i];
      i += 1;
    }
    tokens.push(value);
  }

  return tokens;
}

function normalizePath(path: string): string {
  if (!path || path === ".") {
    return "/home/bunsal";
  }
  if (path === "~") {
    return "/home/bunsal";
  }
  if (path.endsWith("/") && path !== "/") {
    return path.slice(0, -1);
  }
  return path;
}

function findUsageNode(
  path: string,
  node: SimulatedUsageNode = USAGE_TREE,
): SimulatedUsageNode | null {
  const target = normalizePath(path);
  if (node.path === target) {
    return node;
  }
  if (!node.children) {
    return null;
  }
  for (const child of node.children) {
    if (target === child.path || target.startsWith(`${child.path}/`)) {
      const found = findUsageNode(target, child);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function padRight(value: string, width: number): string {
  return value.length >= width
    ? value
    : value + " ".repeat(width - value.length);
}

function padLeft(value: string, width: number): string {
  return value.length >= width
    ? value
    : " ".repeat(width - value.length) + value;
}

function formatDf(state: SimulatedDiskState, human: boolean): string[] {
  const mounted = state.devices.filter((d) => d.mountPoint !== null);
  if (human) {
    const header = "Filesystem      Size  Used Avail Use% Mounted on";
    const rows = mounted.map((d) => {
      const fs = padRight(d.name, 12);
      const size = padLeft(d.size, 6);
      const used = padLeft(d.used, 5);
      const avail = padLeft(d.avail, 6);
      const use = padLeft(d.usePercent, 4);
      return `${fs}${size} ${used} ${avail} ${use} ${d.mountPoint}`;
    });
    return [header, ...rows];
  }

  const header = "Filesystem     1K-blocks      Used Available Use% Mounted on";
  const rows = mounted.map((d) => {
    const fs = padRight(d.name, 14);
    const size = padLeft(d.sizeBlocks, 10);
    const used = padLeft(d.usedBlocks, 10);
    const avail = padLeft(d.availBlocks, 10);
    const use = padLeft(d.usePercent, 4);
    return `${fs}${size} ${used} ${avail} ${use} ${d.mountPoint}`;
  });
  return [header, ...rows];
}

function formatDuLine(node: SimulatedUsageNode, human: boolean): string {
  const size = human ? node.human : node.blocks;
  return `${size}\t${node.path}`;
}

function handleDu(
  tokens: string[],
  state: SimulatedDiskState,
): SimulateDiskResult {
  const nextState = cloneDiskState(state);
  const flags = new Set<string>();
  let maxDepth: number | null = null;
  let pathArg: string | null = null;

  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i]!;
    if (token === "-h" || token === "-s" || token === "-a") {
      flags.add(token);
      continue;
    }
    if (token.startsWith("-") && token.length > 1 && !token.startsWith("--")) {
      for (const ch of token.slice(1)) {
        if (ch === "h" || ch === "s" || ch === "a") {
          flags.add(`-${ch}`);
        } else {
          return {
            result: {
              kind: "output",
              lines: [
                `du: unsupported option -- '${ch}'`,
                'Try "help" to see available commands.',
              ],
            },
            state: nextState,
          };
        }
      }
      continue;
    }
    if (token.startsWith("--max-depth=")) {
      const value = token.slice("--max-depth=".length);
      const parsed = Number.parseInt(value, 10);
      if (!Number.isFinite(parsed) || parsed < 0) {
        return {
          result: {
            kind: "output",
            lines: [`du: invalid argument '${value}' for '--max-depth'`],
          },
          state: nextState,
        };
      }
      maxDepth = parsed;
      continue;
    }
    if (token.startsWith("-")) {
      return {
        result: {
          kind: "output",
          lines: [
            `du: unsupported option '${token}'`,
            'Try "help" to see available commands.',
          ],
        },
        state: nextState,
      };
    }
    if (pathArg !== null) {
      return {
        result: {
          kind: "output",
          lines: [
            "du: only one path is supported in this learning terminal.",
            'Try "help" to see available commands.',
          ],
        },
        state: nextState,
      };
    }
    pathArg = token;
  }

  const human = flags.has("-h");
  const summary = flags.has("-s");
  const all = flags.has("-a");
  const path = normalizePath(pathArg ?? ".");
  const node = findUsageNode(path);

  if (!node) {
    return {
      result: {
        kind: "output",
        lines: [`du: cannot access '${path}': No such file or directory`],
      },
      state: nextState,
    };
  }

  if (maxDepth !== null && maxDepth !== 1) {
    return {
      result: {
        kind: "output",
        lines: [
          "du: only --max-depth=1 is supported in this learning terminal.",
          "Example: du -h --max-depth=1 /var",
        ],
      },
      state: nextState,
    };
  }

  if (summary) {
    return {
      result: { kind: "output", lines: [formatDuLine(node, human)] },
      state: nextState,
    };
  }

  if (maxDepth === 1) {
    if (!human) {
      return {
        result: {
          kind: "output",
          lines: [
            "du: --max-depth is supported with -h in this learning terminal.",
            "Example: du -h --max-depth=1 /var",
          ],
        },
        state: nextState,
      };
    }
    const children = (node.children ?? []).filter((c) => c.kind === "dir");
    const lines = [
      ...children.map((c) => formatDuLine(c, true)),
      formatDuLine(node, true),
    ];
    return { result: { kind: "output", lines }, state: nextState };
  }

  if (all) {
    if (!human) {
      return {
        result: {
          kind: "output",
          lines: [
            "du: -a is supported with -h in this learning terminal.",
            "Example: du -ah /var",
          ],
        },
        state: nextState,
      };
    }
    const lines: string[] = [];

    function walk(n: SimulatedUsageNode) {
      if (n.children) {
        for (const child of n.children) {
          walk(child);
        }
      }
      lines.push(formatDuLine(n, true));
    }

    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
    lines.push(formatDuLine(node, true));
    return { result: { kind: "output", lines }, state: nextState };
  }

  // Plain du / du -h [PATH]: show immediate children (dirs) + total
  const children = (node.children ?? []).filter((c) => c.kind === "dir");
  if (children.length === 0) {
    return {
      result: { kind: "output", lines: [formatDuLine(node, human)] },
      state: nextState,
    };
  }

  const lines = [
    ...children.map((c) => formatDuLine(c, human)),
    formatDuLine(node, human),
  ];
  return { result: { kind: "output", lines }, state: nextState };
}

function formatMountList(state: SimulatedDiskState): string[] {
  return state.devices
    .filter((d) => d.mountPoint !== null)
    .map(
      (d) => `${d.name} on ${d.mountPoint} type ${d.filesystem} (rw,relatime)`,
    );
}

function formatFindmnt(state: SimulatedDiskState): string[] {
  const header = "TARGET SOURCE    FSTYPE";
  const rows = state.devices
    .filter((d) => d.mountPoint !== null)
    .map((d) => {
      const target = padRight(d.mountPoint!, 6);
      const source = padRight(d.name, 10);
      return `${target} ${source} ${d.filesystem}`;
    });
  return [header, ...rows];
}

function handleMount(
  tokens: string[],
  state: SimulatedDiskState,
  usedSudo: boolean,
): SimulateDiskResult {
  const nextState = cloneDiskState(state);
  // tokens: [mount] or [mount, device, mountpoint]
  if (tokens.length === 1) {
    return {
      result: { kind: "output", lines: formatMountList(nextState) },
      state: nextState,
    };
  }

  if (tokens.length !== 3) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: mount DEVICE MOUNTPOINT",
          "Example: sudo mount /dev/sdb1 /data",
        ],
      },
      state: nextState,
    };
  }

  void usedSudo;
  const deviceName = tokens[1]!;
  const mountPoint = normalizePath(tokens[2]!);
  const deviceIndex = nextState.devices.findIndex((d) => d.name === deviceName);

  if (deviceIndex === -1) {
    return {
      result: {
        kind: "output",
        lines: [`mount: ${deviceName}: device not found.`],
      },
      state: nextState,
    };
  }

  const device = nextState.devices[deviceIndex]!;

  if (device.mountPoint !== null) {
    return {
      result: {
        kind: "output",
        lines: [`mount: ${deviceName} is already mounted.`],
      },
      state: nextState,
    };
  }

  if (!nextState.availableMountPoints.includes(mountPoint)) {
    return {
      result: {
        kind: "output",
        lines: [`mount: ${mountPoint}: mount point is not available.`],
      },
      state: nextState,
    };
  }

  const occupied = nextState.devices.some((d) => d.mountPoint === mountPoint);
  if (occupied) {
    return {
      result: {
        kind: "output",
        lines: [`mount: ${mountPoint}: mount point is not available.`],
      },
      state: nextState,
    };
  }

  nextState.devices[deviceIndex] = { ...device, mountPoint };

  return {
    result: {
      kind: "output",
      lines: [`Mounted ${deviceName} on ${mountPoint}.`],
    },
    state: nextState,
  };
}

function handleUmount(
  tokens: string[],
  state: SimulatedDiskState,
): SimulateDiskResult {
  const nextState = cloneDiskState(state);

  if (tokens.length !== 2) {
    return {
      result: {
        kind: "output",
        lines: ["Usage: umount MOUNTPOINT", "Example: sudo umount /data"],
      },
      state: nextState,
    };
  }

  const mountPoint = normalizePath(tokens[1]!);
  const deviceIndex = nextState.devices.findIndex(
    (d) => d.mountPoint === mountPoint,
  );

  if (deviceIndex === -1) {
    return {
      result: {
        kind: "output",
        lines: [`umount: ${mountPoint}: not mounted.`],
      },
      state: nextState,
    };
  }

  const device = nextState.devices[deviceIndex]!;
  nextState.devices[deviceIndex] = { ...device, mountPoint: null };

  return {
    result: {
      kind: "output",
      lines: [`Unmounted ${mountPoint}.`],
    },
    state: nextState,
  };
}

function handleDf(
  tokens: string[],
  state: SimulatedDiskState,
): SimulateDiskResult {
  const nextState = cloneDiskState(state);
  let human = false;

  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i]!;
    if (token === "-h") {
      human = true;
      continue;
    }
    if (token.startsWith("-") && token.length > 1 && !token.startsWith("--")) {
      for (const ch of token.slice(1)) {
        if (ch === "h") {
          human = true;
        } else {
          return {
            result: {
              kind: "output",
              lines: [
                `df: unsupported option -- '${ch}'`,
                'Try "help" to see available commands.',
              ],
            },
            state: nextState,
          };
        }
      }
      continue;
    }
    return {
      result: {
        kind: "output",
        lines: [
          `df: unsupported argument '${token}'`,
          'Try "help" to see available commands.',
        ],
      },
      state: nextState,
    };
  }

  return {
    result: { kind: "output", lines: formatDf(nextState, human) },
    state: nextState,
  };
}

/**
 * Simulate a disk-usage/mounts command against in-memory storage state.
 * Never executes real shell commands or inspects host disks.
 */
export function simulateDiskUsageMountsCommand(
  rawInput: string,
  state: SimulatedDiskState,
): SimulateDiskResult {
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return { result: { kind: "empty" }, state: cloneDiskState(state) };
  }

  const tokensResult = tokenize(trimmed);
  if ("error" in tokensResult) {
    return {
      result: { kind: "output", lines: [tokensResult.error] },
      state: cloneDiskState(state),
    };
  }

  const tokens = tokensResult;
  let usedSudo = false;
  let commandTokens = tokens;

  if ((tokens[0] ?? "").toLowerCase() === "sudo") {
    usedSudo = true;
    commandTokens = tokens.slice(1);
    if (commandTokens.length === 0) {
      return {
        result: {
          kind: "output",
          lines: [
            "Usage: sudo mount DEVICE MOUNTPOINT",
            "       sudo umount MOUNTPOINT",
          ],
        },
        state: cloneDiskState(state),
      };
    }
  }

  const command = (commandTokens[0] ?? "").toLowerCase();

  switch (command) {
    case "help":
      return {
        result: { kind: "output", lines: HELP_OUTPUT },
        state: cloneDiskState(state),
      };

    case "clear":
      return {
        result: { kind: "clear" },
        state: cloneDiskState(state),
      };

    case "df":
      return handleDf(commandTokens, state);

    case "du":
      return handleDu(commandTokens, state);

    case "mount":
      return handleMount(commandTokens, state, usedSudo);

    case "umount":
      return handleUmount(commandTokens, state);

    case "findmnt":
      if (commandTokens.length > 1) {
        return {
          result: {
            kind: "output",
            lines: [
              "findmnt: options are not supported in this learning terminal.",
              "Try: findmnt",
            ],
          },
          state: cloneDiskState(state),
        };
      }
      return {
        result: { kind: "output", lines: formatFindmnt(state) },
        state: cloneDiskState(state),
      };

    default:
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: cloneDiskState(state),
      };
  }
}

/** Helpers for exercise validators. */
export function getMountedDevice(
  state: SimulatedDiskState,
  mountPoint: string,
): SimulatedBlockDevice | undefined {
  return state.devices.find((d) => d.mountPoint === mountPoint);
}

export function isDeviceMounted(
  state: SimulatedDiskState,
  deviceName: string,
): boolean {
  const device = state.devices.find((d) => d.name === deviceName);
  return device?.mountPoint !== null && device?.mountPoint !== undefined;
}

export function getUsageHuman(path: string): string | null {
  return findUsageNode(path)?.human ?? null;
}
