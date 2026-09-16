/**
 * Frontend-only package-management simulation for Stage 02 Lesson 05.
 * Does not execute apt/dnf/pacman, access repositories, or touch the host OS.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_PACKAGE_USER = "bunsal";

export type SimulatedPackage = {
  name: string;
  version: string;
  description: string;
  installed: boolean;
  dependencies: readonly string[];
};

export type SimulatedPackageState = {
  packages: Record<string, SimulatedPackage>;
  /** Whether a simulated `apt update` has refreshed the index this session. */
  indexUpdated: boolean;
};

export type SimulatePackageResult = {
  result: SimulateResult;
  state: SimulatedPackageState;
};

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                 Show this help message",
  "  apt --help           Show common apt commands",
  "  apt search NAME      Search available packages",
  "  apt show NAME        Show package information",
  "  sudo apt update      Refresh package information",
  "  sudo apt upgrade     Upgrade installed packages",
  "  sudo apt install …   Install one or more packages",
  "  sudo apt remove …    Remove a package",
  "  sudo apt purge …     Remove a package and config files",
  "  clear                Clear the terminal screen",
  "",
  "Examples:",
  "  apt search curl",
  "  apt show curl",
  "  sudo apt update",
  "  sudo apt install curl",
  "  sudo apt remove curl",
] as const;

const APT_HELP_OUTPUT = [
  "Most commonly used commands:",
  "",
  "update",
  "upgrade",
  "install",
  "remove",
  "search",
  "show",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const PERMISSION_DENIED = ["E: Permission denied", "E: Are you root?"] as const;

const INITIAL_PACKAGES: readonly SimulatedPackage[] = [
  {
    name: "curl",
    version: "8.5.0",
    description: "command line tool for transferring data",
    installed: false,
    dependencies: ["libcurl4"],
  },
  {
    name: "libcurl4",
    version: "8.5.0",
    description: "easy-to-use client-side URL transfer library",
    installed: false,
    dependencies: [],
  },
  {
    name: "git",
    version: "2.43.0",
    description: "fast, scalable, distributed revision control system",
    installed: false,
    dependencies: [],
  },
  {
    name: "vim",
    version: "9.1.0",
    description: "Vi IMproved - enhanced vi editor",
    installed: false,
    dependencies: [],
  },
  {
    name: "nano",
    version: "7.2",
    description: "small, friendly text editor inspired by Pico",
    installed: false,
    dependencies: [],
  },
  {
    name: "htop",
    version: "3.3.0",
    description: "interactive process viewer",
    installed: false,
    dependencies: [],
  },
  {
    name: "wget",
    version: "1.21.4",
    description: "retrieves files from the web",
    installed: false,
    dependencies: [],
  },
];

export function createInitialPackageState(): SimulatedPackageState {
  const packages: Record<string, SimulatedPackage> = {};
  for (const pkg of INITIAL_PACKAGES) {
    packages[pkg.name] = {
      ...pkg,
      dependencies: [...pkg.dependencies],
    };
  }
  return { packages, indexUpdated: false };
}

export function clonePackageState(
  state: SimulatedPackageState,
): SimulatedPackageState {
  const packages: Record<string, SimulatedPackage> = {};
  for (const [name, pkg] of Object.entries(state.packages)) {
    packages[name] = {
      ...pkg,
      dependencies: [...pkg.dependencies],
    };
  }
  return { packages, indexUpdated: state.indexUpdated };
}

function findPackage(
  state: SimulatedPackageState,
  name: string,
): SimulatedPackage | undefined {
  return state.packages[name.toLowerCase()];
}

function formatShow(pkg: SimulatedPackage): string[] {
  const lines = [
    `Package: ${pkg.name}`,
    `Version: ${pkg.version}`,
    `Status: ${pkg.installed ? "installed" : "not installed"}`,
    `Description: ${pkg.description}`,
  ];

  if (pkg.dependencies.length > 0) {
    lines.push(`Depends: ${pkg.dependencies.join(", ")}`);
  }

  return lines;
}

function handleSearch(
  query: string,
  state: SimulatedPackageState,
): SimulatePackageResult {
  const nextState = clonePackageState(state);
  const needle = query.toLowerCase();
  const matches = Object.values(nextState.packages).filter(
    (pkg) =>
      pkg.name.includes(needle) ||
      pkg.description.toLowerCase().includes(needle),
  );

  if (matches.length === 0) {
    return {
      result: {
        kind: "output",
        lines: [
          "Sorting... Done",
          "Full Text Search... Done",
          "",
          `No packages matched "${query}".`,
        ],
      },
      state: nextState,
    };
  }

  const lines = [
    "Sorting... Done",
    "Full Text Search... Done",
    "",
    ...matches.map((pkg) => `${pkg.name} - ${pkg.description}`),
  ];

  return {
    result: { kind: "output", lines },
    state: nextState,
  };
}

function handleShow(
  name: string,
  state: SimulatedPackageState,
): SimulatePackageResult {
  const nextState = clonePackageState(state);
  const pkg = findPackage(nextState, name);

  if (!pkg) {
    return {
      result: {
        kind: "output",
        lines: [`E: No packages found matching "${name}".`],
      },
      state: nextState,
    };
  }

  return {
    result: { kind: "output", lines: formatShow(pkg) },
    state: nextState,
  };
}

function handleUpdate(
  state: SimulatedPackageState,
  elevated: boolean,
): SimulatePackageResult {
  if (!elevated) {
    return {
      result: { kind: "output", lines: PERMISSION_DENIED },
      state: clonePackageState(state),
    };
  }

  const nextState = clonePackageState(state);
  nextState.indexUpdated = true;

  return {
    result: {
      kind: "output",
      lines: [
        "Hit:1 Ubuntu Repository",
        "Reading package lists... Done",
        "",
        "Package information updated successfully.",
      ],
    },
    state: nextState,
  };
}

function bumpVersion(version: string): string {
  const parts = version.split(".");
  const last = Number.parseInt(parts[parts.length - 1] ?? "0", 10);
  if (!Number.isFinite(last)) {
    return version;
  }
  parts[parts.length - 1] = String(last + 1);
  return parts.join(".");
}

function handleUpgrade(
  state: SimulatedPackageState,
  elevated: boolean,
): SimulatePackageResult {
  if (!elevated) {
    return {
      result: { kind: "output", lines: PERMISSION_DENIED },
      state: clonePackageState(state),
    };
  }

  const nextState = clonePackageState(state);
  const installed = Object.values(nextState.packages).filter(
    (pkg) => pkg.installed,
  );

  if (installed.length === 0) {
    return {
      result: {
        kind: "output",
        lines: [
          "Reading package lists... Done",
          "Calculating upgrade... Done",
          "",
          "0 packages can be upgraded.",
        ],
      },
      state: nextState,
    };
  }

  const upgradeCount = Math.min(2, installed.length);
  for (let i = 0; i < upgradeCount; i += 1) {
    const pkg = installed[i];
    if (pkg) {
      pkg.version = bumpVersion(pkg.version);
    }
  }

  return {
    result: {
      kind: "output",
      lines: [
        "Reading package lists... Done",
        "Calculating upgrade... Done",
        "",
        `${upgradeCount} packages can be upgraded.`,
      ],
    },
    state: nextState,
  };
}

function handleInstall(
  names: readonly string[],
  state: SimulatedPackageState,
  elevated: boolean,
): SimulatePackageResult {
  if (!elevated) {
    return {
      result: { kind: "output", lines: PERMISSION_DENIED },
      state: clonePackageState(state),
    };
  }

  if (names.length === 0) {
    return {
      result: {
        kind: "output",
        lines: ["Usage: sudo apt install PACKAGE [PACKAGE...]"],
      },
      state: clonePackageState(state),
    };
  }

  const nextState = clonePackageState(state);
  const unknown: string[] = [];
  const toInstall: SimulatedPackage[] = [];
  const alreadyInstalled: string[] = [];

  for (const name of names) {
    const pkg = findPackage(nextState, name);
    if (!pkg) {
      unknown.push(name);
      continue;
    }
    if (pkg.installed) {
      alreadyInstalled.push(pkg.name);
      continue;
    }
    toInstall.push(pkg);
  }

  if (unknown.length > 0) {
    return {
      result: {
        kind: "output",
        lines: [
          `E: Unable to locate package ${unknown.join(", ")}`,
          "Only a small simulated package set is available in this lesson.",
        ],
      },
      state: nextState,
    };
  }

  if (toInstall.length === 0) {
    return {
      result: {
        kind: "output",
        lines: [
          `${alreadyInstalled.join(", ")} ${alreadyInstalled.length === 1 ? "is" : "are"} already installed.`,
        ],
      },
      state: nextState,
    };
  }

  for (const pkg of toInstall) {
    pkg.installed = true;
  }

  const namesList = toInstall.map((pkg) => pkg.name);
  const packageWord = namesList.length === 1 ? "package" : "packages";
  const lines = [
    `The following ${packageWord} will be installed:`,
    "",
    ...namesList,
    "",
    ...namesList.map((name) => `Installing ${name}...`),
    "Done.",
    "",
    namesList.length === 1
      ? `${namesList[0]} is now installed.`
      : `${namesList.join(" and ")} are now installed.`,
  ];

  if (alreadyInstalled.length > 0) {
    lines.push(
      "",
      `(${alreadyInstalled.join(", ")} ${alreadyInstalled.length === 1 ? "was" : "were"} already installed.)`,
    );
  }

  return {
    result: { kind: "output", lines },
    state: nextState,
  };
}

function handleRemove(
  name: string,
  state: SimulatedPackageState,
  elevated: boolean,
  mode: "remove" | "purge",
): SimulatePackageResult {
  if (!elevated) {
    return {
      result: { kind: "output", lines: PERMISSION_DENIED },
      state: clonePackageState(state),
    };
  }

  const nextState = clonePackageState(state);
  const pkg = findPackage(nextState, name);

  if (!pkg) {
    return {
      result: {
        kind: "output",
        lines: [`E: Unable to locate package ${name}`],
      },
      state: nextState,
    };
  }

  if (!pkg.installed) {
    return {
      result: {
        kind: "output",
        lines: [`Package '${pkg.name}' is not installed, so not removed`],
      },
      state: nextState,
    };
  }

  pkg.installed = false;

  if (mode === "purge") {
    return {
      result: {
        kind: "output",
        lines: [
          `Purging ${pkg.name}...`,
          "Removing package and configuration files...",
          "Done.",
          "",
          `${pkg.name} has been purged.`,
        ],
      },
      state: nextState,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [
        `Removing ${pkg.name}...`,
        "Done.",
        "",
        `${pkg.name} has been removed.`,
      ],
    },
    state: nextState,
  };
}

function handleApt(
  tokens: string[],
  state: SimulatedPackageState,
  elevated: boolean,
): SimulatePackageResult {
  if (tokens.length === 1) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: apt COMMAND",
          'Try "apt --help" for commonly used commands.',
        ],
      },
      state: clonePackageState(state),
    };
  }

  const sub = (tokens[1] ?? "").toLowerCase();

  if (sub === "--help" || sub === "-h" || sub === "help") {
    return {
      result: { kind: "output", lines: APT_HELP_OUTPUT },
      state: clonePackageState(state),
    };
  }

  if (sub === "search") {
    const query = tokens.slice(2).join(" ").trim();
    if (!query) {
      return {
        result: {
          kind: "output",
          lines: ["Usage: apt search KEYWORD"],
        },
        state: clonePackageState(state),
      };
    }
    return handleSearch(query, state);
  }

  if (sub === "show") {
    const name = tokens[2];
    if (!name || tokens.length !== 3) {
      return {
        result: {
          kind: "output",
          lines: ["Usage: apt show PACKAGE"],
        },
        state: clonePackageState(state),
      };
    }
    return handleShow(name, state);
  }

  if (sub === "update") {
    if (tokens.length !== 2) {
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: clonePackageState(state),
      };
    }
    return handleUpdate(state, elevated);
  }

  if (sub === "upgrade") {
    if (tokens.length !== 2) {
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: clonePackageState(state),
      };
    }
    return handleUpgrade(state, elevated);
  }

  if (sub === "install") {
    return handleInstall(tokens.slice(2), state, elevated);
  }

  if (sub === "remove") {
    const name = tokens[2];
    if (!name || tokens.length !== 3) {
      return {
        result: {
          kind: "output",
          lines: ["Usage: sudo apt remove PACKAGE"],
        },
        state: clonePackageState(state),
      };
    }
    return handleRemove(name, state, elevated, "remove");
  }

  if (sub === "purge") {
    const name = tokens[2];
    if (!name || tokens.length !== 3) {
      return {
        result: {
          kind: "output",
          lines: ["Usage: sudo apt purge PACKAGE"],
        },
        state: clonePackageState(state),
      };
    }
    return handleRemove(name, state, elevated, "purge");
  }

  return {
    result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
    state: clonePackageState(state),
  };
}

function handleSudo(
  tokens: string[],
  state: SimulatedPackageState,
): SimulatePackageResult {
  const rest = tokens.slice(1);

  if (rest.length === 0) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: sudo apt update|upgrade|install|remove|purge …",
          "Example: sudo apt install curl",
        ],
      },
      state: clonePackageState(state),
    };
  }

  const command = (rest[0] ?? "").toLowerCase();
  if (command !== "apt") {
    return {
      result: {
        kind: "output",
        lines: [
          "That sudo command is not available in this learning terminal.",
          'Try "help" to see available commands.',
        ],
      },
      state: clonePackageState(state),
    };
  }

  return handleApt(rest, state, true);
}

/**
 * Resolve package-management learning commands against simulated package data.
 * Never executes a real package manager, never downloads packages, never touches the host.
 */
export function simulatePackageManagementCommand(
  rawInput: string,
  state: SimulatedPackageState,
): SimulatePackageResult {
  const input = rawInput.trim();
  const nextState = clonePackageState(state);

  if (!input) {
    return { result: { kind: "empty" }, state: nextState };
  }

  const tokens = input.split(/\s+/);
  const command = (tokens[0] ?? "").toLowerCase();

  switch (command) {
    case "help":
      return {
        result: { kind: "output", lines: HELP_OUTPUT },
        state: nextState,
      };

    case "clear":
      return { result: { kind: "clear" }, state: nextState };

    case "apt":
      return handleApt(tokens, state, false);

    case "sudo":
      return handleSudo(tokens, state);

    case "dnf": {
      if (
        tokens.length === 3 &&
        tokens[1]?.toLowerCase() === "install" &&
        tokens[2]?.toLowerCase() === "curl"
      ) {
        return {
          result: {
            kind: "output",
            lines: [
              "(educational example) On Fedora / RHEL-family systems:",
              "dnf install curl",
              "",
              "This learning terminal focuses on APT.",
              "DNF is not simulated as a full package manager here.",
            ],
          },
          state: nextState,
        };
      }
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: nextState,
      };
    }

    case "pacman": {
      if (
        tokens.length === 3 &&
        tokens[1] === "-S" &&
        tokens[2]?.toLowerCase() === "curl"
      ) {
        return {
          result: {
            kind: "output",
            lines: [
              "(educational example) On Arch Linux:",
              "pacman -S curl",
              "",
              "This learning terminal focuses on APT.",
              "pacman is not simulated as a full package manager here.",
            ],
          },
          state: nextState,
        };
      }
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: nextState,
      };
    }

    default:
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: nextState,
      };
  }
}

export function formatPackageManagementPrompt(): string {
  return `${SIMULATED_PACKAGE_USER}@rean-linux:~$`;
}
