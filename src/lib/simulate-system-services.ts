/**
 * Frontend-only systemd/systemctl simulation for Stage 03 Lesson 01.
 * Does not execute systemctl, access the host OS, or touch real services.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_SERVICES_USER = "bunsal";

export type SimulatedService = {
  name: string;
  description: string;
  active: boolean;
  enabled: boolean;
  pid: number | null;
};

export type SimulatedServicesState = {
  services: Record<string, SimulatedService>;
  /** Monotonic counter for assigning simulated PIDs on start/restart. */
  nextPid: number;
};

export type SimulateServicesResult = {
  result: SimulateResult;
  state: SimulatedServicesState;
};

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                         Show this help message",
  "  systemctl status SERVICE     Show service status",
  "  systemctl is-active SERVICE  Check if a service is active",
  "  systemctl is-enabled SERVICE Check if a service is enabled at boot",
  "  sudo systemctl start SERVICE Start a service now",
  "  sudo systemctl stop SERVICE  Stop a service now",
  "  sudo systemctl restart SERVICE Restart a service now",
  "  sudo systemctl enable SERVICE  Enable a service at boot",
  "  sudo systemctl disable SERVICE Disable a service at boot",
  "  clear                        Clear the terminal screen",
  "",
  "Examples:",
  "  systemctl status ssh",
  "  sudo systemctl start nginx",
  "  sudo systemctl enable nginx",
  "  systemctl is-active nginx",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const PERMISSION_DENIED = [
  "Failed to connect to bus: Permission denied",
  "Hint: Use sudo for start, stop, restart, enable, and disable.",
] as const;

const MUTATING_ACTIONS = new Set([
  "start",
  "stop",
  "restart",
  "enable",
  "disable",
]);

const INITIAL_SERVICES: readonly SimulatedService[] = [
  {
    name: "ssh",
    description: "OpenSSH server daemon",
    active: true,
    enabled: true,
    pid: 812,
  },
  {
    name: "nginx",
    description: "Nginx Web Server",
    active: false,
    enabled: false,
    pid: null,
  },
  {
    name: "cron",
    description: "Regular background program processing daemon",
    active: true,
    enabled: true,
    pid: 521,
  },
  {
    name: "docker",
    description: "Docker Application Container Engine",
    active: false,
    enabled: false,
    pid: null,
  },
];

export function createInitialServicesState(): SimulatedServicesState {
  const services: Record<string, SimulatedService> = {};
  for (const service of INITIAL_SERVICES) {
    services[service.name] = { ...service };
  }
  return { services, nextPid: 2000 };
}

export function cloneServicesState(
  state: SimulatedServicesState,
): SimulatedServicesState {
  const services: Record<string, SimulatedService> = {};
  for (const [name, service] of Object.entries(state.services)) {
    services[name] = { ...service };
  }
  return { services, nextPid: state.nextPid };
}

function normalizeServiceName(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  return trimmed.endsWith(".service")
    ? trimmed.slice(0, -".service".length)
    : trimmed;
}

function findService(
  state: SimulatedServicesState,
  name: string,
): SimulatedService | undefined {
  return state.services[normalizeServiceName(name)];
}

function unitLabel(service: SimulatedService): string {
  return `${service.name}.service`;
}

function formatStatus(service: SimulatedService): string[] {
  const bullet = service.active ? "●" : "○";
  const activeLine = service.active
    ? `     Active: active (running)`
    : `     Active: inactive (dead)`;
  const pidLine = service.active
    ? `   Main PID: ${service.pid ?? "-"}`
    : `   Main PID: -`;
  const enabledHint = service.enabled ? "enabled" : "disabled";

  const lines = [
    `${bullet} ${unitLabel(service)} - ${service.description}`,
    `     Loaded: loaded (${enabledHint}; vendor preset: enabled)`,
    activeLine,
    pidLine,
    "",
  ];

  if (service.active) {
    lines.push(
      "Oct 07 08:00:01 rean-linux systemd[1]: Started " +
        service.description +
        ".",
    );
  } else {
    lines.push(
      "Oct 07 08:00:01 rean-linux systemd[1]: " +
        unitLabel(service) +
        " is inactive.",
    );
  }

  return lines;
}

function allocatePid(state: SimulatedServicesState): number {
  const pid = state.nextPid;
  state.nextPid += 1;
  return pid;
}

function handleStatus(
  name: string | undefined,
  state: SimulatedServicesState,
): SimulateServicesResult {
  const nextState = cloneServicesState(state);

  if (!name) {
    return {
      result: {
        kind: "output",
        lines: ["Usage: systemctl status SERVICE"],
      },
      state: nextState,
    };
  }

  const service = findService(nextState, name);
  if (!service) {
    return {
      result: {
        kind: "output",
        lines: [
          `Unit ${normalizeServiceName(name)}.service could not be found.`,
        ],
      },
      state: nextState,
    };
  }

  return {
    result: { kind: "output", lines: formatStatus(service) },
    state: nextState,
  };
}

function handleIsActive(
  name: string | undefined,
  state: SimulatedServicesState,
): SimulateServicesResult {
  const nextState = cloneServicesState(state);

  if (!name) {
    return {
      result: {
        kind: "output",
        lines: ["Usage: systemctl is-active SERVICE"],
      },
      state: nextState,
    };
  }

  const service = findService(nextState, name);
  if (!service) {
    return {
      result: { kind: "output", lines: ["unknown"] },
      state: nextState,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [service.active ? "active" : "inactive"],
    },
    state: nextState,
  };
}

function handleIsEnabled(
  name: string | undefined,
  state: SimulatedServicesState,
): SimulateServicesResult {
  const nextState = cloneServicesState(state);

  if (!name) {
    return {
      result: {
        kind: "output",
        lines: ["Usage: systemctl is-enabled SERVICE"],
      },
      state: nextState,
    };
  }

  const service = findService(nextState, name);
  if (!service) {
    return {
      result: { kind: "output", lines: ["not-found"] },
      state: nextState,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [service.enabled ? "enabled" : "disabled"],
    },
    state: nextState,
  };
}

function handleStart(
  name: string | undefined,
  state: SimulatedServicesState,
  elevated: boolean,
): SimulateServicesResult {
  if (!elevated) {
    return {
      result: { kind: "output", lines: PERMISSION_DENIED },
      state: cloneServicesState(state),
    };
  }

  const nextState = cloneServicesState(state);

  if (!name) {
    return {
      result: {
        kind: "output",
        lines: ["Usage: sudo systemctl start SERVICE"],
      },
      state: nextState,
    };
  }

  const service = findService(nextState, name);
  if (!service) {
    return {
      result: {
        kind: "output",
        lines: [
          `Failed to start ${normalizeServiceName(name)}.service: Unit not found.`,
        ],
      },
      state: nextState,
    };
  }

  if (service.active) {
    return {
      result: {
        kind: "output",
        lines: [`${service.name} is already active.`],
      },
      state: nextState,
    };
  }

  service.active = true;
  service.pid = allocatePid(nextState);

  return {
    result: {
      kind: "output",
      lines: [`Started ${unitLabel(service)}.`],
    },
    state: nextState,
  };
}

function handleStop(
  name: string | undefined,
  state: SimulatedServicesState,
  elevated: boolean,
): SimulateServicesResult {
  if (!elevated) {
    return {
      result: { kind: "output", lines: PERMISSION_DENIED },
      state: cloneServicesState(state),
    };
  }

  const nextState = cloneServicesState(state);

  if (!name) {
    return {
      result: {
        kind: "output",
        lines: ["Usage: sudo systemctl stop SERVICE"],
      },
      state: nextState,
    };
  }

  const service = findService(nextState, name);
  if (!service) {
    return {
      result: {
        kind: "output",
        lines: [
          `Failed to stop ${normalizeServiceName(name)}.service: Unit not found.`,
        ],
      },
      state: nextState,
    };
  }

  if (!service.active) {
    return {
      result: {
        kind: "output",
        lines: [`${service.name} is already inactive.`],
      },
      state: nextState,
    };
  }

  service.active = false;
  service.pid = null;

  return {
    result: {
      kind: "output",
      lines: [`Stopped ${unitLabel(service)}.`],
    },
    state: nextState,
  };
}

function handleRestart(
  name: string | undefined,
  state: SimulatedServicesState,
  elevated: boolean,
): SimulateServicesResult {
  if (!elevated) {
    return {
      result: { kind: "output", lines: PERMISSION_DENIED },
      state: cloneServicesState(state),
    };
  }

  const nextState = cloneServicesState(state);

  if (!name) {
    return {
      result: {
        kind: "output",
        lines: ["Usage: sudo systemctl restart SERVICE"],
      },
      state: nextState,
    };
  }

  const service = findService(nextState, name);
  if (!service) {
    return {
      result: {
        kind: "output",
        lines: [
          `Failed to restart ${normalizeServiceName(name)}.service: Unit not found.`,
        ],
      },
      state: nextState,
    };
  }

  service.active = true;
  service.pid = allocatePid(nextState);

  return {
    result: {
      kind: "output",
      lines: [
        `Stopping ${service.name}...`,
        `Starting ${service.name}...`,
        `${service.name} restarted successfully.`,
      ],
    },
    state: nextState,
  };
}

function handleEnable(
  name: string | undefined,
  state: SimulatedServicesState,
  elevated: boolean,
): SimulateServicesResult {
  if (!elevated) {
    return {
      result: { kind: "output", lines: PERMISSION_DENIED },
      state: cloneServicesState(state),
    };
  }

  const nextState = cloneServicesState(state);

  if (!name) {
    return {
      result: {
        kind: "output",
        lines: ["Usage: sudo systemctl enable SERVICE"],
      },
      state: nextState,
    };
  }

  const service = findService(nextState, name);
  if (!service) {
    return {
      result: {
        kind: "output",
        lines: [
          `Failed to enable ${normalizeServiceName(name)}.service: Unit not found.`,
        ],
      },
      state: nextState,
    };
  }

  if (service.enabled) {
    return {
      result: {
        kind: "output",
        lines: [`${unitLabel(service)} is already enabled.`],
      },
      state: nextState,
    };
  }

  service.enabled = true;
  // Intentionally do not change active — enable only affects boot behavior.

  return {
    result: {
      kind: "output",
      lines: [
        `Created symlink /etc/systemd/system/multi-user.target.wants/${unitLabel(service)}.`,
        `Enabled ${service.name} (will start automatically at boot).`,
      ],
    },
    state: nextState,
  };
}

function handleDisable(
  name: string | undefined,
  state: SimulatedServicesState,
  elevated: boolean,
): SimulateServicesResult {
  if (!elevated) {
    return {
      result: { kind: "output", lines: PERMISSION_DENIED },
      state: cloneServicesState(state),
    };
  }

  const nextState = cloneServicesState(state);

  if (!name) {
    return {
      result: {
        kind: "output",
        lines: ["Usage: sudo systemctl disable SERVICE"],
      },
      state: nextState,
    };
  }

  const service = findService(nextState, name);
  if (!service) {
    return {
      result: {
        kind: "output",
        lines: [
          `Failed to disable ${normalizeServiceName(name)}.service: Unit not found.`,
        ],
      },
      state: nextState,
    };
  }

  if (!service.enabled) {
    return {
      result: {
        kind: "output",
        lines: [`${unitLabel(service)} is already disabled.`],
      },
      state: nextState,
    };
  }

  service.enabled = false;
  // Intentionally do not change active — disable only affects boot behavior.

  return {
    result: {
      kind: "output",
      lines: [
        `Removed /etc/systemd/system/multi-user.target.wants/${unitLabel(service)}.`,
        `Disabled ${service.name} (will not start automatically at boot).`,
      ],
    },
    state: nextState,
  };
}

function handleSystemctl(
  tokens: string[],
  state: SimulatedServicesState,
  elevated: boolean,
): SimulateServicesResult {
  if (tokens.length < 2) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: systemctl COMMAND SERVICE",
          "Examples: systemctl status ssh",
          "          sudo systemctl start nginx",
        ],
      },
      state: cloneServicesState(state),
    };
  }

  const action = (tokens[1] ?? "").toLowerCase();
  const serviceName = tokens[2];

  if (MUTATING_ACTIONS.has(action) && !elevated) {
    return {
      result: { kind: "output", lines: PERMISSION_DENIED },
      state: cloneServicesState(state),
    };
  }

  switch (action) {
    case "status":
      return handleStatus(serviceName, state);
    case "is-active":
      return handleIsActive(serviceName, state);
    case "is-enabled":
      return handleIsEnabled(serviceName, state);
    case "start":
      return handleStart(serviceName, state, elevated);
    case "stop":
      return handleStop(serviceName, state, elevated);
    case "restart":
      return handleRestart(serviceName, state, elevated);
    case "enable":
      return handleEnable(serviceName, state, elevated);
    case "disable":
      return handleDisable(serviceName, state, elevated);
    default:
      return {
        result: {
          kind: "output",
          lines: [
            `Unknown systemctl command: ${action}`,
            'Try "help" to see available commands.',
          ],
        },
        state: cloneServicesState(state),
      };
  }
}

function handleSudo(
  tokens: string[],
  state: SimulatedServicesState,
): SimulateServicesResult {
  const rest = tokens.slice(1);

  if (rest.length === 0) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: sudo systemctl start|stop|restart|enable|disable SERVICE",
          "Example: sudo systemctl start nginx",
        ],
      },
      state: cloneServicesState(state),
    };
  }

  if (rest[0] === "systemctl") {
    return handleSystemctl(rest, state, true);
  }

  return {
    result: {
      kind: "output",
      lines: [
        "That sudo command is not available in this learning terminal.",
        'Try "help" to see available commands.',
      ],
    },
    state: cloneServicesState(state),
  };
}

function tokenize(input: string): string[] {
  return input.trim().split(/\s+/).filter(Boolean);
}

/**
 * Simulate a systemctl-focused command against in-memory service state.
 * Never executes real shell commands or touches host services.
 */
export function simulateSystemServicesCommand(
  rawInput: string,
  state: SimulatedServicesState,
): SimulateServicesResult {
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return { result: { kind: "empty" }, state: cloneServicesState(state) };
  }

  const tokens = tokenize(trimmed);
  const command = tokens[0]?.toLowerCase() ?? "";

  switch (command) {
    case "help":
      return {
        result: { kind: "output", lines: HELP_OUTPUT },
        state: cloneServicesState(state),
      };

    case "clear":
      return {
        result: { kind: "clear" },
        state: cloneServicesState(state),
      };

    case "systemctl":
      return handleSystemctl(tokens, state, false);

    case "sudo":
      return handleSudo(tokens, state);

    default:
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: cloneServicesState(state),
      };
  }
}

export function formatSystemServicesPrompt(): string {
  return `${SIMULATED_SERVICES_USER}@rean-linux:~$`;
}

/** Exported for exercise validators — look up a service by short or unit name. */
export function getSimulatedService(
  state: SimulatedServicesState,
  name: string,
): SimulatedService | undefined {
  return findService(state, name);
}
