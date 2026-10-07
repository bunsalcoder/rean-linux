/**
 * Frontend-only journald/journalctl simulation for Stage 03 Lesson 02.
 * Does not execute journalctl, access /var/log, or touch the host journal.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_JOURNAL_USER = "bunsal";
export const SIMULATED_JOURNAL_HOST = "rean-linux";

/** Simulated “now” for --since filters (deterministic, not host clock). */
export const SIMULATED_NOW = {
  dateLabel: "Oct 07",
  minutes: 8 * 60 + 30, // 08:30
} as const;

export type JournalPriority =
  "emerg" | "alert" | "crit" | "err" | "warning" | "notice" | "info" | "debug";

export type JournalEntry = {
  /** Minutes since midnight on the simulated day. */
  minutes: number;
  time: string;
  hostname: string;
  service: string;
  pid: number;
  priority: JournalPriority;
  message: string;
  /** 0 = current boot, -1 = previous boot. */
  boot: 0 | -1;
};

export type SimulatedJournalState = {
  /** Marker so the terminal can hold a stable in-memory session. */
  ready: true;
};

export type SimulateJournalResult = {
  result: SimulateResult;
  state: SimulatedJournalState;
};

const PRIORITY_RANK: Record<JournalPriority, number> = {
  emerg: 0,
  alert: 1,
  crit: 2,
  err: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7,
};

const PRIORITY_ALIASES: Record<string, JournalPriority> = {
  emerg: "emerg",
  emergency: "emerg",
  "0": "emerg",
  alert: "alert",
  "1": "alert",
  crit: "crit",
  critical: "crit",
  "2": "crit",
  err: "err",
  error: "err",
  "3": "err",
  warning: "warning",
  warn: "warning",
  "4": "warning",
  notice: "notice",
  "5": "notice",
  info: "info",
  "6": "info",
  debug: "debug",
  "7": "debug",
};

const SINCE_PRESETS: Record<string, number> = {
  today: 0,
  "1 hour ago": SIMULATED_NOW.minutes - 60,
  "30 minutes ago": SIMULATED_NOW.minutes - 30,
};

/** Deterministic simulated journal — never randomized per render. */
export const JOURNAL_ENTRIES: readonly JournalEntry[] = [
  {
    minutes: 7 * 60 + 55,
    time: "07:55:12",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "systemd",
    pid: 1,
    priority: "info",
    message: "Previous boot shutdown complete.",
    boot: -1,
  },
  {
    minutes: 7 * 60 + 56,
    time: "07:56:04",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "ssh",
    pid: 744,
    priority: "info",
    message: "SSH server stopped for reboot.",
    boot: -1,
  },
  {
    minutes: 8 * 60,
    time: "08:00:01",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "systemd",
    pid: 1,
    priority: "info",
    message: "System boot completed.",
    boot: 0,
  },
  {
    minutes: 8 * 60,
    time: "08:00:02",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "kernel",
    pid: 0,
    priority: "info",
    message: "Linux version 6.8.0-rean (simulated).",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 4,
    time: "08:00:04",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "ssh",
    pid: 812,
    priority: "info",
    message: "SSH server started.",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 5,
    time: "08:00:05",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "systemd",
    pid: 1,
    priority: "info",
    message: "Started ssh.service.",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 8,
    time: "08:00:08",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "nginx",
    pid: 901,
    priority: "info",
    message: "Starting nginx.",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 9,
    time: "08:00:09",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "nginx",
    pid: 901,
    priority: "err",
    message: "configuration file contains an invalid directive",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 9,
    time: "08:00:09",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "systemd",
    pid: 1,
    priority: "err",
    message: "nginx.service: Failed to start.",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 10,
    time: "08:00:10",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "systemd",
    pid: 1,
    priority: "warning",
    message: "nginx.service: Unit entered failed state.",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 14,
    time: "08:01:14",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "cron",
    pid: 521,
    priority: "info",
    message: "Started scheduled task.",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 15,
    time: "08:01:15",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "systemd",
    pid: 1,
    priority: "info",
    message: "Started cron.service.",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 20,
    time: "08:01:20",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "docker",
    pid: 1102,
    priority: "info",
    message: "Docker daemon listening on unix:///var/run/docker.sock.",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 22,
    time: "08:01:22",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "docker",
    pid: 1102,
    priority: "warning",
    message: "Container health check delayed.",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 30,
    time: "08:02:10",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "ssh",
    pid: 921,
    priority: "warning",
    message: "Authentication attempt failed.",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 35,
    time: "08:02:35",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "ssh",
    pid: 922,
    priority: "info",
    message: "Accepted connection.",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 40,
    time: "08:03:02",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "cron",
    pid: 521,
    priority: "info",
    message: "Completed scheduled task.",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 45,
    time: "08:05:18",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "kernel",
    pid: 0,
    priority: "warning",
    message: "Simulated disk I/O latency spike detected.",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 50,
    time: "08:10:44",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "systemd",
    pid: 1,
    priority: "info",
    message: "Reached target Multi-User System.",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 55,
    time: "08:15:01",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "cron",
    pid: 521,
    priority: "info",
    message: "Started hourly maintenance job.",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 58,
    time: "08:20:11",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "nginx",
    pid: 1401,
    priority: "err",
    message: "nginx.service: Failed to start",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 58,
    time: "08:20:12",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "nginx",
    pid: 1401,
    priority: "err",
    message: "nginx: configuration file contains an invalid directive",
    boot: 0,
  },
  {
    minutes: 8 * 60 + 59,
    time: "08:25:30",
    hostname: SIMULATED_JOURNAL_HOST,
    service: "ssh",
    pid: 950,
    priority: "info",
    message: "Session opened for user bunsal.",
    boot: 0,
  },
] as const;

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                              Show this help message",
  "  journalctl                        Show journal entries",
  "  journalctl -n N                   Show the last N entries",
  "  journalctl -f                     Follow new entries (simulated)",
  "  journalctl -u SERVICE             Filter by service/unit",
  "  journalctl -p PRIORITY            Filter by priority",
  "  journalctl -b                     Logs from the current boot",
  "  journalctl -b -1                  Logs from the previous boot",
  '  journalctl --since "VALUE"        Filter by time (today, 1 hour ago, …)',
  "  systemctl status SERVICE          Inspect a simulated service",
  "  clear                             Clear the terminal screen",
  "",
  "Examples:",
  "  journalctl -n 10",
  "  journalctl -u nginx",
  "  journalctl -p err",
  "  journalctl -u nginx -p err",
  '  journalctl --since "1 hour ago"',
  "  systemctl status nginx",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const KNOWN_SERVICES = new Set([
  "ssh",
  "nginx",
  "cron",
  "docker",
  "systemd",
  "kernel",
]);

export function createInitialJournalState(): SimulatedJournalState {
  return { ready: true };
}

export function cloneJournalState(
  state: SimulatedJournalState,
): SimulatedJournalState {
  return { ready: state.ready };
}

function formatEntry(entry: JournalEntry): string {
  const unit = entry.service === "kernel" ? "kernel" : `${entry.service}`;
  const pidPart =
    entry.service === "kernel" ? "kernel" : `${unit}[${entry.pid}]`;
  return `${SIMULATED_NOW.dateLabel} ${entry.time} ${entry.hostname} ${pidPart}: ${entry.message}`;
}

function normalizeUnit(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  return trimmed.endsWith(".service")
    ? trimmed.slice(0, -".service".length)
    : trimmed;
}

type JournalFilters = {
  limit: number | null;
  follow: boolean;
  unit: string | null;
  priority: JournalPriority | null;
  sinceMinutes: number | null;
  boot: 0 | -1 | null;
};

function emptyFilters(): JournalFilters {
  return {
    limit: null,
    follow: false,
    unit: null,
    priority: null,
    sinceMinutes: null,
    boot: null,
  };
}

/**
 * Tokenize while preserving quoted --since values.
 * Never uses eval or a real shell.
 */
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

function parseJournalctlArgs(
  tokens: string[],
): JournalFilters | { error: string } {
  const filters = emptyFilters();
  let i = 1;

  while (i < tokens.length) {
    const arg = tokens[i]!;

    if (arg === "-n" || arg === "--lines") {
      const value = tokens[i + 1];
      if (!value || !/^\d+$/.test(value)) {
        return { error: "Usage: journalctl -n NUMBER" };
      }
      filters.limit = Number.parseInt(value, 10);
      i += 2;
      continue;
    }

    if (/^-n\d+$/.test(arg)) {
      filters.limit = Number.parseInt(arg.slice(2), 10);
      i += 1;
      continue;
    }

    if (arg === "-f" || arg === "--follow") {
      filters.follow = true;
      i += 1;
      continue;
    }

    if (arg === "-u" || arg === "--unit") {
      const value = tokens[i + 1];
      if (!value) {
        return { error: "Usage: journalctl -u SERVICE" };
      }
      filters.unit = normalizeUnit(value);
      i += 2;
      continue;
    }

    if (arg.startsWith("--unit=")) {
      filters.unit = normalizeUnit(arg.slice("--unit=".length));
      i += 1;
      continue;
    }

    if (arg === "-p" || arg === "--priority") {
      const value = tokens[i + 1];
      if (!value) {
        return { error: "Usage: journalctl -p PRIORITY" };
      }
      const priority = PRIORITY_ALIASES[value.toLowerCase()];
      if (!priority) {
        return {
          error: `Unknown priority: ${value}. Try err, warning, info, or debug.`,
        };
      }
      filters.priority = priority;
      i += 2;
      continue;
    }

    if (arg.startsWith("--priority=")) {
      const value = arg.slice("--priority=".length).toLowerCase();
      const priority = PRIORITY_ALIASES[value];
      if (!priority) {
        return {
          error: `Unknown priority: ${value}. Try err, warning, info, or debug.`,
        };
      }
      filters.priority = priority;
      i += 1;
      continue;
    }

    if (arg === "-b" || arg === "--boot") {
      const next = tokens[i + 1];
      if (next === "0" || next === "-0") {
        filters.boot = 0;
        i += 2;
        continue;
      }
      if (next === "-1") {
        filters.boot = -1;
        i += 2;
        continue;
      }
      filters.boot = 0;
      i += 1;
      continue;
    }

    if (arg === "--since") {
      const value = tokens[i + 1];
      if (value === undefined) {
        return {
          error:
            'Usage: journalctl --since "today" | "1 hour ago" | "30 minutes ago"',
        };
      }
      const since = SINCE_PRESETS[value.toLowerCase()];
      if (since === undefined) {
        return {
          error: `Unsupported --since value: ${value}. Try "today", "1 hour ago", or "30 minutes ago".`,
        };
      }
      filters.sinceMinutes = since;
      i += 2;
      continue;
    }

    if (arg.startsWith("--since=")) {
      const value = arg.slice("--since=".length).replace(/^["']|["']$/g, "");
      const since = SINCE_PRESETS[value.toLowerCase()];
      if (since === undefined) {
        return {
          error: `Unsupported --since value: ${value}. Try "today", "1 hour ago", or "30 minutes ago".`,
        };
      }
      filters.sinceMinutes = since;
      i += 1;
      continue;
    }

    return {
      error: `Unsupported journalctl option: ${arg}\nTry "help" to see available commands.`,
    };
  }

  return filters;
}

function applyFilters(filters: JournalFilters): JournalEntry[] {
  let entries = JOURNAL_ENTRIES.filter((entry) => {
    if (filters.boot !== null && entry.boot !== filters.boot) {
      return false;
    }
    if (filters.unit && entry.service !== filters.unit) {
      return false;
    }
    if (
      filters.priority &&
      PRIORITY_RANK[entry.priority] > PRIORITY_RANK[filters.priority]
    ) {
      return false;
    }
    if (filters.sinceMinutes !== null && entry.minutes < filters.sinceMinutes) {
      return false;
    }
    return true;
  });

  if (filters.limit !== null) {
    entries = entries.slice(-filters.limit);
  }

  return entries;
}

function handleJournalctl(
  tokens: string[],
  state: SimulatedJournalState,
): SimulateJournalResult {
  const nextState = cloneJournalState(state);
  const parsed = parseJournalctlArgs(tokens);

  if ("error" in parsed) {
    return {
      result: { kind: "output", lines: [parsed.error] },
      state: nextState,
    };
  }

  if (parsed.follow) {
    const recent = applyFilters({ ...parsed, follow: false, limit: 3 });
    const lines = [
      "Following journal...",
      "Waiting for new entries...",
      "",
      "-- Simulated follow mode (frontend only; no live stream) --",
    ];
    if (recent.length > 0) {
      lines.push("", "New simulated event:");
      lines.push(formatEntry(recent[recent.length - 1]!));
    }
    return {
      result: { kind: "output", lines },
      state: nextState,
    };
  }

  const entries = applyFilters(parsed);

  if (entries.length === 0) {
    return {
      result: {
        kind: "output",
        lines: ["-- No entries --"],
      },
      state: nextState,
    };
  }

  return {
    result: {
      kind: "output",
      lines: entries.map(formatEntry),
    },
    state: nextState,
  };
}

function formatNginxFailedStatus(): string[] {
  return [
    "○ nginx.service - Nginx Web Server",
    "     Loaded: loaded (disabled; vendor preset: enabled)",
    "     Active: failed (Result: exit-code)",
    "   Main PID: -",
    "",
    "Oct 07 08:00:09 rean-linux nginx[901]: configuration file contains an invalid directive",
    "Oct 07 08:00:09 rean-linux systemd[1]: nginx.service: Failed to start.",
    "Oct 07 08:20:12 rean-linux nginx[1401]: nginx: configuration file contains an invalid directive",
  ];
}

function formatSimpleStatus(
  name: string,
  description: string,
  active: boolean,
  enabled: boolean,
  pid: number | null,
): string[] {
  const bullet = active ? "●" : "○";
  const activeLine = active
    ? "     Active: active (running)"
    : "     Active: inactive (dead)";
  const enabledHint = enabled ? "enabled" : "disabled";
  const pidLine = active ? `   Main PID: ${pid ?? "-"}` : "   Main PID: -";

  return [
    `${bullet} ${name}.service - ${description}`,
    `     Loaded: loaded (${enabledHint}; vendor preset: enabled)`,
    activeLine,
    pidLine,
    "",
    active
      ? `Oct 07 08:00:01 rean-linux systemd[1]: Started ${description}.`
      : `Oct 07 08:00:01 rean-linux systemd[1]: ${name}.service is inactive.`,
  ];
}

function handleSystemctlStatus(
  name: string | undefined,
  state: SimulatedJournalState,
): SimulateJournalResult {
  const nextState = cloneJournalState(state);

  if (!name) {
    return {
      result: {
        kind: "output",
        lines: ["Usage: systemctl status SERVICE"],
      },
      state: nextState,
    };
  }

  const service = normalizeUnit(name);

  if (service === "nginx") {
    return {
      result: { kind: "output", lines: formatNginxFailedStatus() },
      state: nextState,
    };
  }

  if (service === "ssh") {
    return {
      result: {
        kind: "output",
        lines: formatSimpleStatus(
          "ssh",
          "OpenSSH server daemon",
          true,
          true,
          812,
        ),
      },
      state: nextState,
    };
  }

  if (service === "cron") {
    return {
      result: {
        kind: "output",
        lines: formatSimpleStatus(
          "cron",
          "Regular background program processing daemon",
          true,
          true,
          521,
        ),
      },
      state: nextState,
    };
  }

  if (service === "docker") {
    return {
      result: {
        kind: "output",
        lines: formatSimpleStatus(
          "docker",
          "Docker Application Container Engine",
          true,
          false,
          1102,
        ),
      },
      state: nextState,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [`Unit ${service}.service could not be found.`],
    },
    state: nextState,
  };
}

function handleSystemctl(
  tokens: string[],
  state: SimulatedJournalState,
): SimulateJournalResult {
  if (tokens.length < 2) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: systemctl status SERVICE",
          "Example: systemctl status nginx",
        ],
      },
      state: cloneJournalState(state),
    };
  }

  const action = (tokens[1] ?? "").toLowerCase();
  if (action === "status") {
    return handleSystemctlStatus(tokens[2], state);
  }

  return {
    result: {
      kind: "output",
      lines: [
        `Only "systemctl status" is available in this lesson terminal.`,
        'Use journalctl for logs, or try "help".',
      ],
    },
    state: cloneJournalState(state),
  };
}

/**
 * Simulate a journalctl-focused command against in-memory journal data.
 * Never executes real shell commands or reads host logs.
 */
export function simulateLogsJournaldCommand(
  rawInput: string,
  state: SimulatedJournalState,
): SimulateJournalResult {
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return { result: { kind: "empty" }, state: cloneJournalState(state) };
  }

  const tokensResult = tokenize(trimmed);
  if ("error" in tokensResult) {
    return {
      result: { kind: "output", lines: [tokensResult.error] },
      state: cloneJournalState(state),
    };
  }

  const tokens = tokensResult;
  const command = tokens[0]?.toLowerCase() ?? "";

  switch (command) {
    case "help":
      return {
        result: { kind: "output", lines: HELP_OUTPUT },
        state: cloneJournalState(state),
      };

    case "clear":
      return {
        result: { kind: "clear" },
        state: cloneJournalState(state),
      };

    case "journalctl":
      return handleJournalctl(tokens, state);

    case "systemctl":
      return handleSystemctl(tokens, state);

    default:
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: cloneJournalState(state),
      };
  }
}

export function formatLogsJournaldPrompt(): string {
  return `${SIMULATED_JOURNAL_USER}@rean-linux:~$`;
}

export type JournalFilterOptions = {
  limit?: number | null;
  unit?: string | null;
  priority?: JournalPriority | null;
  sinceMinutes?: number | null;
  boot?: 0 | -1 | null;
};

/** Filter helpers exported for exercise validators. */
export function filterJournalEntries(
  filters: JournalFilterOptions,
): readonly JournalEntry[] {
  return applyFilters({
    ...emptyFilters(),
    ...filters,
  });
}

export function isKnownJournalService(name: string): boolean {
  return KNOWN_SERVICES.has(normalizeUnit(name));
}

export function journalEntryContains(
  entries: readonly JournalEntry[],
  needle: string,
): boolean {
  const lower = needle.toLowerCase();
  return entries.some(
    (entry) =>
      entry.message.toLowerCase().includes(lower) ||
      entry.service.toLowerCase().includes(lower),
  );
}
