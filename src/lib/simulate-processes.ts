/**
 * Frontend-only process simulation for Stage 02 Lesson 04.
 * Does not execute shell commands, access the host OS, or touch real processes.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_PROCESS_USER = "bunsal";
export const SIMULATED_PROCESS_HOME = `/home/${SIMULATED_PROCESS_USER}`;

export type SimulatedProcess = {
  pid: number;
  ppid: number;
  user: string;
  command: string;
  tty: string;
  time: string;
  cpu: string;
  mem: string;
  /** Included in basic `ps` (current-session style) listing. */
  session: boolean;
};

export type SimulatedProcessState = {
  processes: SimulatedProcess[];
  /** Whether a simulated background `sleep 30 &` job is present. */
  sleepJobRunning: boolean;
};

export type SimulateProcessesResult = {
  result: SimulateResult;
  state: SimulatedProcessState;
};

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help              Show this help message",
  "  ps                Show a process snapshot",
  "  ps aux            Show a broader process list",
  "  top               Show a simulated process monitor",
  "  jobs              Show simulated shell jobs",
  "  sleep 30 &        Start a simulated background job",
  "  kill PID          Send SIGTERM to a process",
  "  kill -15 PID      Send SIGTERM (graceful)",
  "  kill -9 PID       Send SIGKILL (force)",
  "  sudo kill PID     Kill with elevated privileges",
  "  clear             Clear the terminal screen",
  "",
  "Examples:",
  "  ps",
  "  ps aux",
  "  kill 2345",
  "  sudo kill 3100",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const INITIAL_PROCESSES: readonly SimulatedProcess[] = [
  {
    pid: 1,
    ppid: 0,
    user: "root",
    command: "systemd",
    tty: "?",
    time: "00:00",
    cpu: "0.0",
    mem: "0.1",
    session: false,
  },
  {
    pid: 1200,
    ppid: 1,
    user: "bunsal",
    command: "bash",
    tty: "pts/0",
    time: "00:00",
    cpu: "0.1",
    mem: "0.5",
    session: true,
  },
  {
    pid: 2345,
    ppid: 1200,
    user: "bunsal",
    command: "node server.js",
    tty: "pts/0",
    time: "00:01",
    cpu: "2.3",
    mem: "1.8",
    session: true,
  },
  {
    pid: 2410,
    ppid: 1200,
    user: "bunsal",
    command: "code",
    tty: "pts/0",
    time: "00:00",
    cpu: "1.1",
    mem: "3.2",
    session: true,
  },
  {
    pid: 2500,
    ppid: 1200,
    user: "bunsal",
    command: "hung-demo",
    tty: "pts/0",
    time: "00:02",
    cpu: "0.5",
    mem: "0.4",
    session: true,
  },
  {
    pid: 3100,
    ppid: 1,
    user: "root",
    command: "system-process",
    tty: "?",
    time: "00:00",
    cpu: "0.0",
    mem: "0.2",
    session: false,
  },
];

export function createInitialProcessState(): SimulatedProcessState {
  return {
    processes: INITIAL_PROCESSES.map((process) => ({ ...process })),
    sleepJobRunning: true,
  };
}

export function cloneProcessState(
  state: SimulatedProcessState,
): SimulatedProcessState {
  return {
    processes: state.processes.map((process) => ({ ...process })),
    sleepJobRunning: state.sleepJobRunning,
  };
}

function pad(value: string | number, width: number): string {
  return String(value).padEnd(width, " ");
}

function sortedProcesses(
  processes: readonly SimulatedProcess[],
): SimulatedProcess[] {
  return [...processes].sort((a, b) => a.pid - b.pid);
}

function formatPs(state: SimulatedProcessState): string[] {
  const lines = [`${pad("PID", 6)} ${pad("TTY", 8)} ${pad("TIME", 8)} CMD`];

  for (const process of sortedProcesses(state.processes)) {
    if (!process.session) {
      continue;
    }
    lines.push(
      `${pad(process.pid, 6)} ${pad(process.tty, 8)} ${pad(process.time, 8)} ${process.command}`,
    );
  }

  return lines;
}

function formatPsAux(state: SimulatedProcessState): string[] {
  const lines = [
    `${pad("USER", 8)} ${pad("PID", 5)} ${pad("%CPU", 6)} ${pad("%MEM", 6)} COMMAND`,
  ];

  for (const process of sortedProcesses(state.processes)) {
    lines.push(
      `${pad(process.user, 8)} ${pad(process.pid, 5)} ${pad(process.cpu, 6)} ${pad(process.mem, 6)} ${process.command}`,
    );
  }

  return lines;
}

function formatTop(state: SimulatedProcessState): string[] {
  const byCpu = [...state.processes].sort(
    (a, b) => Number.parseFloat(b.cpu) - Number.parseFloat(a.cpu),
  );

  const lines = [
    "top - 12:00:00 up 1 day,  1 user,  load average: 0.10, 0.05, 0.01",
    `Tasks: ${state.processes.length} total`,
    "%Cpu(s):  3.5 us,  1.2 sy,  0.0 ni, 95.3 id",
    "MiB Mem :   7800.0 total,   4200.0 free,   2100.0 used",
    "",
    `${pad("PID", 6)} ${pad("USER", 8)} ${pad("%CPU", 6)} ${pad("%MEM", 6)} COMMAND`,
  ];

  for (const process of byCpu) {
    lines.push(
      `${pad(process.pid, 6)} ${pad(process.user, 8)} ${pad(process.cpu, 6)} ${pad(process.mem, 6)} ${process.command}`,
    );
  }

  lines.push("", "(simulated snapshot — not a live system monitor)");
  return lines;
}

function formatJobs(state: SimulatedProcessState): string[] {
  if (!state.sleepJobRunning) {
    return [];
  }
  return ["[1]+  Running    sleep 30 &"];
}

function findProcess(
  state: SimulatedProcessState,
  pid: number,
): SimulatedProcess | undefined {
  return state.processes.find((process) => process.pid === pid);
}

function removeProcess(
  state: SimulatedProcessState,
  pid: number,
): SimulatedProcessState {
  const next = cloneProcessState(state);
  next.processes = next.processes.filter((process) => process.pid !== pid);
  return next;
}

type KillSignal = "SIGTERM" | "SIGKILL";

function applyKill(
  state: SimulatedProcessState,
  pid: number,
  signal: KillSignal,
  elevated: boolean,
  style: "plain" | "explicit",
): SimulateProcessesResult {
  const process = findProcess(state, pid);

  if (!process) {
    return {
      result: {
        kind: "output",
        lines: [`kill: (${pid}): No such process`],
      },
      state: cloneProcessState(state),
    };
  }

  if (process.user !== SIMULATED_PROCESS_USER && !elevated) {
    return {
      result: {
        kind: "output",
        lines: [`kill: (${pid}): Operation not permitted`],
      },
      state: cloneProcessState(state),
    };
  }

  const nextState = removeProcess(state, pid);

  if (signal === "SIGKILL") {
    return {
      result: {
        kind: "output",
        lines: [
          `Sent SIGKILL to process ${pid}.`,
          `Process ${pid} was forcefully terminated.`,
        ],
      },
      state: nextState,
    };
  }

  if (style === "plain") {
    return {
      result: {
        kind: "output",
        lines: [`Terminated process ${pid}.`],
      },
      state: nextState,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [
        `Sent SIGTERM to process ${pid}.`,
        `Process ${pid} terminated gracefully.`,
      ],
    },
    state: nextState,
  };
}

function parseKillArgs(tokens: string[]): {
  signal: KillSignal;
  style: "plain" | "explicit";
  pid: number | null;
  error?: string[];
} {
  if (tokens.length === 2) {
    const pid = Number.parseInt(tokens[1] ?? "", 10);
    if (!Number.isFinite(pid) || pid <= 0) {
      return {
        signal: "SIGTERM",
        style: "plain",
        pid: null,
        error: ["Usage: kill PID", "       kill -15 PID", "       kill -9 PID"],
      };
    }
    return { signal: "SIGTERM", style: "plain", pid };
  }

  if (tokens.length === 3) {
    const flag = (tokens[1] ?? "").toUpperCase();
    const pid = Number.parseInt(tokens[2] ?? "", 10);

    if (!Number.isFinite(pid) || pid <= 0) {
      return {
        signal: "SIGTERM",
        style: "explicit",
        pid: null,
        error: ["Usage: kill PID", "       kill -15 PID", "       kill -9 PID"],
      };
    }

    if (flag === "-9" || flag === "-SIGKILL") {
      return { signal: "SIGKILL", style: "explicit", pid };
    }

    if (flag === "-15" || flag === "-SIGTERM" || flag === "-TERM") {
      return { signal: "SIGTERM", style: "explicit", pid };
    }

    return {
      signal: "SIGTERM",
      style: "explicit",
      pid: null,
      error: [
        `kill: invalid signal specification: ${tokens[1]}`,
        "Supported signals in this simulator: -15 (SIGTERM), -9 (SIGKILL)",
      ],
    };
  }

  return {
    signal: "SIGTERM",
    style: "plain",
    pid: null,
    error: [
      "Usage: kill PID",
      "       kill -15 PID",
      "       kill -9 PID",
      "Example: kill 2345",
    ],
  };
}

function handleKill(
  tokens: string[],
  state: SimulatedProcessState,
  elevated: boolean,
): SimulateProcessesResult {
  const parsed = parseKillArgs(tokens);
  if (parsed.error || parsed.pid === null) {
    return {
      result: { kind: "output", lines: parsed.error ?? ["Usage: kill PID"] },
      state: cloneProcessState(state),
    };
  }

  return applyKill(state, parsed.pid, parsed.signal, elevated, parsed.style);
}

function handleSudo(
  tokens: string[],
  state: SimulatedProcessState,
): SimulateProcessesResult {
  const rest = tokens.slice(1);

  if (rest.length === 0) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: sudo kill PID",
          "Examples: sudo kill 3100",
          "          sudo kill -9 3100",
        ],
      },
      state: cloneProcessState(state),
    };
  }

  const command = (rest[0] ?? "").toLowerCase();
  if (command !== "kill") {
    return {
      result: {
        kind: "output",
        lines: [
          "That sudo command is not available in this learning terminal.",
          'Try "help" to see available commands.',
        ],
      },
      state: cloneProcessState(state),
    };
  }

  return handleKill(rest, state, true);
}

/**
 * Resolve process-learning commands against simulated process data.
 * Never executes a real shell, never signals real processes, never touches the host.
 */
export function simulateProcessesCommand(
  rawInput: string,
  state: SimulatedProcessState,
): SimulateProcessesResult {
  const input = rawInput.trim();
  const nextState = cloneProcessState(state);

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

    case "ps": {
      if (tokens.length === 1) {
        return {
          result: { kind: "output", lines: formatPs(nextState) },
          state: nextState,
        };
      }

      if (tokens.length === 2 && tokens[1] === "aux") {
        return {
          result: { kind: "output", lines: formatPsAux(nextState) },
          state: nextState,
        };
      }

      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: nextState,
      };
    }

    case "top": {
      if (tokens.length === 1) {
        return {
          result: { kind: "output", lines: formatTop(nextState) },
          state: nextState,
        };
      }
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: nextState,
      };
    }

    case "jobs": {
      if (tokens.length === 1) {
        return {
          result: { kind: "output", lines: formatJobs(nextState) },
          state: nextState,
        };
      }
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: nextState,
      };
    }

    case "sleep": {
      if (tokens.length === 3 && tokens[1] === "30" && tokens[2] === "&") {
        nextState.sleepJobRunning = true;
        return {
          result: {
            kind: "output",
            lines: [
              "[1] 1201",
              "(simulated) Started sleep 30 in the background.",
            ],
          },
          state: nextState,
        };
      }

      if (tokens.length === 2 && tokens[1] === "30") {
        return {
          result: {
            kind: "output",
            lines: [
              "(simulated) sleep 30 would occupy this terminal for 30 seconds.",
              "Try: sleep 30 &",
              "to start it in the background instead.",
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

    case "kill":
      return handleKill(tokens, state, false);

    case "sudo":
      return handleSudo(tokens, state);

    default:
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: nextState,
      };
  }
}

export function formatProcessesPrompt(): string {
  return `${SIMULATED_PROCESS_USER}@rean-linux:~$`;
}
