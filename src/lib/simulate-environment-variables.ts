/**
 * Frontend-only environment-variable simulation for Stage 02 Lesson 06.
 * Does not read host/browser environment variables, spawn processes, or touch the OS.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_ENV_USER = "bunsal";
export const SIMULATED_ENV_HOME = `/home/${SIMULATED_ENV_USER}`;

/** Stable display order for built-in exported variables. */
export const INITIAL_EXPORTED_KEYS = [
  "HOME",
  "USER",
  "SHELL",
  "PATH",
  "PWD",
  "LANG",
  "TERM",
] as const;

const INITIAL_VALUES: Record<(typeof INITIAL_EXPORTED_KEYS)[number], string> = {
  HOME: SIMULATED_ENV_HOME,
  USER: SIMULATED_ENV_USER,
  SHELL: "/bin/bash",
  PATH: "/usr/local/bin:/usr/bin:/bin",
  PWD: SIMULATED_ENV_HOME,
  LANG: "en_US.UTF-8",
  TERM: "xterm-256color",
};

export type SimulatedEnvState = {
  /** All shell variables (exported and non-exported). */
  values: Record<string, string>;
  /** Keys that are part of the exported environment. */
  exported: Record<string, true>;
};

export type SimulateEnvResult = {
  result: SimulateResult;
  state: SimulatedEnvState;
};

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                 Show this help message",
  "  env                  Show exported environment variables",
  "  printenv             Show exported environment variables",
  "  printenv NAME        Show one exported variable",
  "  echo $NAME           Print a variable value",
  '  NAME="value"         Set a shell variable',
  '  export NAME="value"  Export a variable to the environment',
  "  export NAME          Export an existing shell variable",
  "  unset NAME           Remove a variable",
  "  clear                Clear the terminal screen",
  "",
  "Examples:",
  "  echo $HOME",
  "  printenv USER",
  '  export APP_ENV="development"',
  "  unset APP_ENV",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const VAR_NAME = "[A-Za-z_][A-Za-z0-9_]*";

export function createInitialEnvState(): SimulatedEnvState {
  const values: Record<string, string> = { ...INITIAL_VALUES };
  const exported: Record<string, true> = {};
  for (const key of INITIAL_EXPORTED_KEYS) {
    exported[key] = true;
  }
  return { values, exported };
}

export function cloneEnvState(state: SimulatedEnvState): SimulatedEnvState {
  return {
    values: { ...state.values },
    exported: { ...state.exported },
  };
}

function stripQuotes(raw: string): string {
  const value = raw.trim();
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' || first === "'") && first === last) {
      return value.slice(1, -1);
    }
  }
  return value;
}

function expandVariables(text: string, state: SimulatedEnvState): string {
  return text.replace(
    new RegExp(`\\$(${VAR_NAME})`, "g"),
    (_match, name: string) => state.values[name] ?? "",
  );
}

function formatEnvLines(state: SimulatedEnvState): string[] {
  const exportedKeys = Object.keys(state.exported).filter(
    (key) => key in state.values,
  );

  const ordered: string[] = [];
  for (const key of INITIAL_EXPORTED_KEYS) {
    if (exportedKeys.includes(key)) {
      ordered.push(key);
    }
  }

  const extras = exportedKeys
    .filter((key) => !INITIAL_EXPORTED_KEYS.includes(key as never))
    .sort((a, b) => a.localeCompare(b));

  return [...ordered, ...extras].map(
    (key) => `${key}=${state.values[key] ?? ""}`,
  );
}

function setShellVariable(
  state: SimulatedEnvState,
  name: string,
  value: string,
): SimulatedEnvState {
  const next = cloneEnvState(state);
  next.values[name] = value;
  return next;
}

function exportVariable(
  state: SimulatedEnvState,
  name: string,
  value?: string,
): SimulatedEnvState {
  const next = cloneEnvState(state);
  if (value !== undefined) {
    next.values[name] = value;
  } else if (!(name in next.values)) {
    next.values[name] = "";
  }
  next.exported[name] = true;
  return next;
}

function unsetVariable(
  state: SimulatedEnvState,
  name: string,
): SimulatedEnvState {
  const next = cloneEnvState(state);
  delete next.values[name];
  delete next.exported[name];
  return next;
}

function parseEchoArgument(input: string, state: SimulatedEnvState): string {
  const rest = input.slice("echo".length).trimStart();
  if (!rest) {
    return "";
  }
  return expandVariables(stripQuotes(rest), state);
}

function parseAssignment(
  input: string,
): { name: string; value: string } | null {
  const match = input.match(new RegExp(`^(${VAR_NAME})=(.*)$`));
  if (!match) {
    return null;
  }
  return {
    name: match[1] ?? "",
    value: stripQuotes(match[2] ?? ""),
  };
}

function parseExport(input: string): { name: string; value?: string } | null {
  const rest = input.slice("export".length).trim();
  if (!rest) {
    return null;
  }

  const withValue = rest.match(new RegExp(`^(${VAR_NAME})=(.*)$`));
  if (withValue) {
    return {
      name: withValue[1] ?? "",
      value: stripQuotes(withValue[2] ?? ""),
    };
  }

  const nameOnly = rest.match(new RegExp(`^(${VAR_NAME})$`));
  if (nameOnly) {
    return { name: nameOnly[1] ?? "" };
  }

  return null;
}

/**
 * Resolve a typed command against simulated environment state.
 * Never reads process.env, browser env, or the host OS.
 */
export function simulateEnvironmentVariablesCommand(
  rawInput: string,
  state: SimulatedEnvState,
): SimulateEnvResult {
  const input = rawInput.trim();

  if (!input) {
    return { result: { kind: "empty" }, state };
  }

  const lower = input.toLowerCase();

  if (lower === "clear") {
    return { result: { kind: "clear" }, state };
  }

  if (lower === "help" || lower === "--help" || lower === "-h") {
    return { result: { kind: "output", lines: HELP_OUTPUT }, state };
  }

  if (lower === "env") {
    return {
      result: { kind: "output", lines: formatEnvLines(state) },
      state,
    };
  }

  if (lower === "printenv") {
    return {
      result: { kind: "output", lines: formatEnvLines(state) },
      state,
    };
  }

  if (lower.startsWith("printenv ")) {
    const name = input.slice("printenv".length).trim();
    if (!name || /\s/.test(name)) {
      return {
        result: {
          kind: "output",
          lines: [
            "Usage: printenv [VARIABLE]",
            'Try "help" for available commands.',
          ],
        },
        state,
      };
    }

    if (!(name in state.exported) || !(name in state.values)) {
      return {
        result: { kind: "output", lines: ["(unset)"] },
        state,
      };
    }

    return {
      result: { kind: "output", lines: [state.values[name] ?? ""] },
      state,
    };
  }

  if (
    lower === "echo" ||
    lower.startsWith("echo ") ||
    lower.startsWith("echo\t")
  ) {
    return {
      result: {
        kind: "output",
        lines: [parseEchoArgument(input, state)],
      },
      state,
    };
  }

  if (lower.startsWith("unset ") || lower === "unset") {
    const rest = input.slice("unset".length).trim();
    if (!rest || /\s/.test(rest)) {
      return {
        result: {
          kind: "output",
          lines: [
            "Usage: unset VARIABLE",
            'Try "help" for available commands.',
          ],
        },
        state,
      };
    }

    if (!new RegExp(`^${VAR_NAME}$`).test(rest)) {
      return {
        result: {
          kind: "output",
          lines: [`unset: ${rest}: invalid variable name`],
        },
        state,
      };
    }

    return {
      result: { kind: "output", lines: [] },
      state: unsetVariable(state, rest),
    };
  }

  if (lower.startsWith("export ") || lower === "export") {
    const parsed = parseExport(input);
    if (!parsed) {
      return {
        result: {
          kind: "output",
          lines: [
            'Usage: export NAME="value"',
            "       export NAME",
            'Try "help" for available commands.',
          ],
        },
        state,
      };
    }

    return {
      result: { kind: "output", lines: [] },
      state: exportVariable(state, parsed.name, parsed.value),
    };
  }

  const assignment = parseAssignment(input);
  if (assignment) {
    return {
      result: { kind: "output", lines: [] },
      state: setShellVariable(state, assignment.name, assignment.value),
    };
  }

  return {
    result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
    state,
  };
}

export function formatEnvironmentVariablesPrompt(): string {
  return `${SIMULATED_ENV_USER}@rean-linux:~$`;
}
