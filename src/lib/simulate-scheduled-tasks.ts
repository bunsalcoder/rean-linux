/**
 * Frontend-only scheduled-tasks simulation for Stage 03 Lesson 09.
 * Never creates real cron jobs, never starts system timers, and never
 * executes shell scripts or host crontab/systemctl commands.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_CRON_USER = "bunsal";
export const SIMULATED_CRON_HOST = "rean-linux";
export const SIMULATED_TIMEZONE = "UTC";

export type ScheduledTasksScenarioId =
  | "healthy"
  | "list-crontab"
  | "cron-stopped"
  | "failing-job"
  | "env-trap"
  | "at-queue"
  | "empty-crontab"
  | "build-daily"
  | "build-every-15";

export type CronJobEntry = {
  id: string;
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
  command: string;
  comment?: string;
};

export type JobExecutionRecord = {
  id: string;
  jobId: string;
  timestamp: string;
  command: string;
  exitCode: number;
  output: string;
  note?: string;
};

export type AtJobEntry = {
  id: string;
  queueId: number;
  schedule: string;
  command: string;
  user: string;
};

export type SimulatedScheduledTasksState = {
  scenarioId: ScheduledTasksScenarioId;
  currentUser: string;
  cronActive: boolean;
  crontab: CronJobEntry[];
  history: JobExecutionRecord[];
  atJobs: AtJobEntry[];
  timezone: string;
};

export type ScheduledTasksScenarioMeta = {
  id: ScheduledTasksScenarioId;
  label: string;
  symptom: string;
  rootCause: string;
};

export type SimulateScheduledTasksResult = {
  result: SimulateResult;
  state: SimulatedScheduledTasksState;
};

export const SCHEDULED_TASKS_SCENARIOS: readonly ScheduledTasksScenarioMeta[] =
  [
    {
      id: "healthy",
      label: "Healthy cron baseline",
      symptom: "Cron is active with a few user jobs and recent successes.",
      rootCause: "Service running; entries present; history looks clean.",
    },
    {
      id: "list-crontab",
      label: "Inspect the current crontab",
      symptom: "You need to list what the current user already schedules.",
      rootCause: "A backup and a report job are already installed.",
    },
    {
      id: "cron-stopped",
      label: "Cron service stopped",
      symptom: "Jobs exist but nothing runs at the expected times.",
      rootCause: "The cron service is inactive.",
    },
    {
      id: "failing-job",
      label: "Repeated job failures",
      symptom: "A nightly cleanup keeps failing in the execution history.",
      rootCause: "The script exits non-zero (missing path / permission).",
    },
    {
      id: "env-trap",
      label: "Interactive environment assumption",
      symptom: "A job works in an interactive shell but fails under cron.",
      rootCause: "Cron uses a minimal environment (PATH / variables).",
    },
    {
      id: "at-queue",
      label: "One-time job queue",
      symptom: "Inspect pending one-time `at` jobs.",
      rootCause: "Two educational at-jobs are waiting in the queue.",
    },
    {
      id: "empty-crontab",
      label: "Empty crontab",
      symptom: "No user crontab entries yet — add one deliberately.",
      rootCause: "Starting from a blank user crontab.",
    },
    {
      id: "build-daily",
      label: "Build a daily schedule",
      symptom: "Add a job that runs once per day at midnight.",
      rootCause: "Empty crontab waiting for `0 0 * * * …`.",
    },
    {
      id: "build-every-15",
      label: "Build an every-15-minutes schedule",
      symptom: "Add a job that runs every 15 minutes.",
      rootCause: "Empty crontab waiting for `*/15 * * * * …`.",
    },
  ] as const;

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                              Show this help message",
  "  crontab -l                        List the current user's crontab",
  "  crontab -e                        Open the simulated crontab editor help",
  "  crontab -r                        Remove the current user's crontab",
  "  crontab-add \"EXPR COMMAND\"        Add a crontab entry (educational)",
  "  crontab-remove N                  Remove entry number N (educational)",
  "  systemctl status cron             Show cron service status",
  "  systemctl start cron              Start the simulated cron service",
  "  systemctl stop cron               Stop the simulated cron service",
  "  journalctl -u cron                Show simulated cron logs",
  "  journalctl -u cron -n 10          Show the last 10 cron log lines",
  "  atq                               List one-time at jobs",
  "  at -l                             Alias for atq",
  "  clear                             Clear the terminal screen",
  "",
  "Examples:",
  "  crontab -l",
  "  crontab-add \"0 0 * * * /usr/local/bin/backup.sh\"",
  "  systemctl status cron",
  "  journalctl -u cron -n 10",
  "  atq",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const CRONTAB_EDITOR_HELP = [
  "Simulated crontab editor (educational — not a real editor).",
  "",
  "Current user crontab entries are listed with `crontab -l`.",
  "To change entries in this lab, use:",
  "",
  '  crontab-add "MIN HOUR DOM MON DOW COMMAND"',
  "  crontab-remove N",
  "  crontab -r",
  "",
  "Example:",
  '  crontab-add "0 9 * * 1 /home/bunsal/bin/report.sh"',
  '  crontab-add "*/15 * * * * /usr/local/bin/health-check.sh"',
  "",
  "Nothing is written to the host crontab.",
] as const;

function cloneJobs(jobs: readonly CronJobEntry[]): CronJobEntry[] {
  return jobs.map((job) => ({ ...job }));
}

function cloneHistory(
  history: readonly JobExecutionRecord[],
): JobExecutionRecord[] {
  return history.map((entry) => ({ ...entry }));
}

function cloneAtJobs(jobs: readonly AtJobEntry[]): AtJobEntry[] {
  return jobs.map((job) => ({ ...job }));
}

function makeJob(
  id: string,
  minute: string,
  hour: string,
  dayOfMonth: string,
  month: string,
  dayOfWeek: string,
  command: string,
  comment?: string,
): CronJobEntry {
  return {
    id,
    minute,
    hour,
    dayOfMonth,
    month,
    dayOfWeek,
    command,
    comment,
  };
}

function baselineCrontab(): CronJobEntry[] {
  return [
    makeJob(
      "backup",
      "0",
      "2",
      "*",
      "*",
      "*",
      "/usr/local/bin/backup.sh",
      "Nightly backup",
    ),
    makeJob(
      "report",
      "0",
      "9",
      "*",
      "*",
      "1",
      "/home/bunsal/bin/weekly-report.sh",
      "Monday morning report",
    ),
  ];
}

function healthyHistory(): JobExecutionRecord[] {
  return [
    {
      id: "h1",
      jobId: "backup",
      timestamp: "Oct 13 02:00:01",
      command: "/usr/local/bin/backup.sh",
      exitCode: 0,
      output: "backup completed: 142 MB archived",
    },
    {
      id: "h2",
      jobId: "report",
      timestamp: "Oct 13 09:00:01",
      command: "/home/bunsal/bin/weekly-report.sh",
      exitCode: 0,
      output: "report emailed to ops@example.com",
    },
    {
      id: "h3",
      jobId: "backup",
      timestamp: "Oct 14 02:00:01",
      command: "/usr/local/bin/backup.sh",
      exitCode: 0,
      output: "backup completed: 144 MB archived",
    },
  ];
}

function failingHistory(): JobExecutionRecord[] {
  return [
    {
      id: "f1",
      jobId: "cleanup",
      timestamp: "Oct 12 03:15:01",
      command: "/usr/local/bin/cleanup.sh",
      exitCode: 1,
      output: "cleanup.sh: /var/tmp/stale: Permission denied",
      note: "Repeated failure",
    },
    {
      id: "f2",
      jobId: "cleanup",
      timestamp: "Oct 13 03:15:01",
      command: "/usr/local/bin/cleanup.sh",
      exitCode: 1,
      output: "cleanup.sh: /var/tmp/stale: Permission denied",
      note: "Repeated failure",
    },
    {
      id: "f3",
      jobId: "cleanup",
      timestamp: "Oct 14 03:15:01",
      command: "/usr/local/bin/cleanup.sh",
      exitCode: 1,
      output: "cleanup.sh: /var/tmp/stale: Permission denied",
      note: "Repeated failure",
    },
    {
      id: "f4",
      jobId: "backup",
      timestamp: "Oct 14 02:00:01",
      command: "/usr/local/bin/backup.sh",
      exitCode: 0,
      output: "backup completed: 144 MB archived",
    },
  ];
}

function envTrapHistory(): JobExecutionRecord[] {
  return [
    {
      id: "e1",
      jobId: "deploy-helper",
      timestamp: "Oct 14 06:00:01",
      command: "$HOME/bin/deploy-helper.sh",
      exitCode: 127,
      output: "/bin/sh: $HOME/bin/deploy-helper.sh: not found",
      note: "Interactive PATH/HOME assumptions failed under cron",
    },
    {
      id: "e2",
      jobId: "deploy-helper",
      timestamp: "Oct 14 06:15:01",
      command: "deploy-helper.sh",
      exitCode: 127,
      output: "/bin/sh: deploy-helper.sh: not found",
      note: "Command not on cron PATH",
    },
  ];
}

function baselineAtJobs(): AtJobEntry[] {
  return [
    {
      id: "at1",
      queueId: 42,
      schedule: "Wed Oct 15 18:00:00 2026",
      command: "/usr/local/bin/reboot-notice.sh",
      user: SIMULATED_CRON_USER,
    },
    {
      id: "at2",
      queueId: 43,
      schedule: "Thu Oct 16 09:30:00 2026",
      command: "/home/bunsal/bin/one-shot-report.sh",
      user: SIMULATED_CRON_USER,
    },
  ];
}

function scenarioState(
  scenarioId: ScheduledTasksScenarioId,
): SimulatedScheduledTasksState {
  const base: SimulatedScheduledTasksState = {
    scenarioId,
    currentUser: SIMULATED_CRON_USER,
    cronActive: true,
    crontab: baselineCrontab(),
    history: healthyHistory(),
    atJobs: [],
    timezone: SIMULATED_TIMEZONE,
  };

  switch (scenarioId) {
    case "healthy":
      return {
        ...base,
        atJobs: baselineAtJobs(),
      };
    case "list-crontab":
      return base;
    case "cron-stopped":
      return {
        ...base,
        cronActive: false,
        history: [
          {
            id: "s1",
            jobId: "backup",
            timestamp: "Oct 12 02:00:01",
            command: "/usr/local/bin/backup.sh",
            exitCode: 0,
            output: "backup completed: 140 MB archived",
            note: "Last success before cron was stopped",
          },
        ],
      };
    case "failing-job":
      return {
        ...base,
        crontab: [
          ...baselineCrontab(),
          makeJob(
            "cleanup",
            "15",
            "3",
            "*",
            "*",
            "*",
            "/usr/local/bin/cleanup.sh",
            "Nightly cleanup (currently failing)",
          ),
        ],
        history: failingHistory(),
      };
    case "env-trap":
      return {
        ...base,
        crontab: [
          makeJob(
            "deploy-helper",
            "0",
            "6",
            "*",
            "*",
            "*",
            "deploy-helper.sh",
            "Relies on interactive PATH — will fail under cron",
          ),
        ],
        history: envTrapHistory(),
      };
    case "at-queue":
      return {
        ...base,
        atJobs: baselineAtJobs(),
      };
    case "empty-crontab":
    case "build-daily":
    case "build-every-15":
      return {
        ...base,
        crontab: [],
        history: [],
      };
  }
}

export function createInitialScheduledTasksState(
  scenarioId: ScheduledTasksScenarioId = "healthy",
): SimulatedScheduledTasksState {
  return cloneScheduledTasksState(scenarioState(scenarioId));
}

export function cloneScheduledTasksState(
  state: SimulatedScheduledTasksState,
): SimulatedScheduledTasksState {
  return {
    scenarioId: state.scenarioId,
    currentUser: state.currentUser,
    cronActive: state.cronActive,
    crontab: cloneJobs(state.crontab),
    history: cloneHistory(state.history),
    atJobs: cloneAtJobs(state.atJobs),
    timezone: state.timezone,
  };
}

export function resetScheduledTasksState(
  state: SimulatedScheduledTasksState,
): SimulatedScheduledTasksState {
  return createInitialScheduledTasksState(state.scenarioId);
}

export function getScheduledTasksScenario(
  id: ScheduledTasksScenarioId,
): ScheduledTasksScenarioMeta {
  const match = SCHEDULED_TASKS_SCENARIOS.find((scenario) => scenario.id === id);
  if (!match) {
    return SCHEDULED_TASKS_SCENARIOS[0]!;
  }
  return match;
}

export function isScheduledTasksScenarioId(
  value: string,
): value is ScheduledTasksScenarioId {
  return SCHEDULED_TASKS_SCENARIOS.some((scenario) => scenario.id === value);
}

export function formatScheduledTasksPrompt(): string {
  return `${SIMULATED_CRON_USER}@${SIMULATED_CRON_HOST}:~$`;
}

export function formatCronExpression(job: CronJobEntry): string {
  return `${job.minute} ${job.hour} ${job.dayOfMonth} ${job.month} ${job.dayOfWeek}`;
}

export function hasCronCommand(
  state: SimulatedScheduledTasksState,
  commandSubstring: string,
): boolean {
  return state.crontab.some((job) => job.command.includes(commandSubstring));
}

export function hasCronSchedule(
  state: SimulatedScheduledTasksState,
  expression: string,
): boolean {
  const normalized = expression.trim().replace(/\s+/g, " ");
  return state.crontab.some(
    (job) => formatCronExpression(job) === normalized,
  );
}

export function findFailingJobIds(
  state: SimulatedScheduledTasksState,
): string[] {
  const fails = new Map<string, number>();
  for (const entry of state.history) {
    if (entry.exitCode !== 0) {
      fails.set(entry.jobId, (fails.get(entry.jobId) ?? 0) + 1);
    }
  }
  return [...fails.entries()]
    .filter(([, count]) => count >= 2)
    .map(([jobId]) => jobId);
}

/* -------------------------------------------------------------------------- */
/* Cron expression parser (limited, educational — not full cron compatibility) */
/* -------------------------------------------------------------------------- */

export type CronFieldName =
  | "minute"
  | "hour"
  | "dayOfMonth"
  | "month"
  | "dayOfWeek";

export type CronFieldParse =
  | { ok: true; description: string }
  | { ok: false; error: string };

export type CronParseResult =
  | {
      ok: true;
      fields: {
        minute: string;
        hour: string;
        dayOfMonth: string;
        month: string;
        dayOfWeek: string;
      };
      fieldDescriptions: Record<CronFieldName, string>;
      summary: string;
      note?: string;
    }
  | {
      ok: false;
      error: string;
      field?: CronFieldName;
    };

const FIELD_META: Record<
  CronFieldName,
  { label: string; min: number; max: number; names?: Record<string, number> }
> = {
  minute: { label: "minute", min: 0, max: 59 },
  hour: { label: "hour", min: 0, max: 23 },
  dayOfMonth: { label: "day of month", min: 1, max: 31 },
  month: {
    label: "month",
    min: 1,
    max: 12,
    names: {
      jan: 1,
      feb: 2,
      mar: 3,
      apr: 4,
      may: 5,
      jun: 6,
      jul: 7,
      aug: 8,
      sep: 9,
      oct: 10,
      nov: 11,
      dec: 12,
    },
  },
  dayOfWeek: {
    label: "day of week",
    min: 0,
    max: 7,
    names: {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    },
  },
};

const FIELD_ORDER: readonly CronFieldName[] = [
  "minute",
  "hour",
  "dayOfMonth",
  "month",
  "dayOfWeek",
] as const;

function resolveNamedValue(
  raw: string,
  field: CronFieldName,
): number | null {
  const meta = FIELD_META[field];
  const lower = raw.toLowerCase();
  if (meta.names && lower in meta.names) {
    return meta.names[lower]!;
  }
  if (!/^\d+$/.test(raw)) {
    return null;
  }
  return Number(raw);
}

function describeSingleValue(value: number, field: CronFieldName): string {
  if (field === "dayOfWeek") {
    const names = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const normalized = value === 7 ? 0 : value;
    return names[normalized] ?? String(value);
  }
  if (field === "month") {
    const names = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return names[value - 1] ?? String(value);
  }
  if (field === "hour") {
    return `${String(value).padStart(2, "0")}:00`;
  }
  if (field === "minute") {
    return `minute ${String(value).padStart(2, "0")}`;
  }
  return `day ${value}`;
}

function parseFieldToken(
  token: string,
  field: CronFieldName,
): CronFieldParse {
  const meta = FIELD_META[field];
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, error: `Empty ${meta.label} field` };
  }

  if (trimmed === "*") {
    return { ok: true, description: `every ${meta.label}` };
  }

  // step: */N or range/step or list with steps handled per segment
  if (trimmed.includes("/")) {
    const [base, stepRaw] = trimmed.split("/");
    if (base === undefined || stepRaw === undefined || trimmed.split("/").length !== 2) {
      return {
        ok: false,
        error: `Invalid step syntax in ${meta.label} (use */N or A-B/N)`,
      };
    }
    if (!/^\d+$/.test(stepRaw)) {
      return {
        ok: false,
        error: `Step value in ${meta.label} must be a positive integer`,
      };
    }
    const step = Number(stepRaw);
    if (step < 1) {
      return {
        ok: false,
        error: `Step value in ${meta.label} must be at least 1`,
      };
    }

    if (base === "*") {
      return {
        ok: true,
        description: `every ${step} ${meta.label}${step === 1 ? "" : "s"}`,
      };
    }

    if (base.includes("-")) {
      const [startRaw, endRaw] = base.split("-");
      if (!startRaw || !endRaw) {
        return {
          ok: false,
          error: `Invalid range in ${meta.label}`,
        };
      }
      const start = resolveNamedValue(startRaw, field);
      const end = resolveNamedValue(endRaw, field);
      if (start === null || end === null) {
        return {
          ok: false,
          error: `Invalid range bounds in ${meta.label}`,
        };
      }
      const maxAllowed = field === "dayOfWeek" ? 7 : meta.max;
      if (
        start < meta.min ||
        end > maxAllowed ||
        (field !== "dayOfWeek" && (start > meta.max || end < meta.min))
      ) {
        return {
          ok: false,
          error: `${meta.label} values must be between ${meta.min} and ${meta.max}`,
        };
      }
      if (start > end) {
        return {
          ok: false,
          error: `Range start must be ≤ end in ${meta.label}`,
        };
      }
      return {
        ok: true,
        description: `every ${step} ${meta.label}${step === 1 ? "" : "s"} from ${describeSingleValue(start, field)} through ${describeSingleValue(end, field)}`,
      };
    }

    return {
      ok: false,
      error: `Unsupported step base in ${meta.label} (use * or a range)`,
    };
  }

  if (trimmed.includes("-")) {
    const parts = trimmed.split("-");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return { ok: false, error: `Invalid range in ${meta.label}` };
    }
    const start = resolveNamedValue(parts[0], field);
    const end = resolveNamedValue(parts[1], field);
    if (start === null || end === null) {
      return { ok: false, error: `Invalid range bounds in ${meta.label}` };
    }
    const maxAllowed = field === "dayOfWeek" ? 7 : meta.max;
    if (start < meta.min || end > maxAllowed) {
      return {
        ok: false,
        error: `${meta.label} values must be between ${meta.min} and ${meta.max}`,
      };
    }
    if (start > end) {
      return {
        ok: false,
        error: `Range start must be ≤ end in ${meta.label}`,
      };
    }
    return {
      ok: true,
      description: `${describeSingleValue(start, field)} through ${describeSingleValue(end, field)}`,
    };
  }

  if (trimmed.includes(",")) {
    const parts = trimmed.split(",");
    if (parts.some((part) => !part.trim())) {
      return { ok: false, error: `Empty value in ${meta.label} list` };
    }
    const values: number[] = [];
    for (const part of parts) {
      const value = resolveNamedValue(part.trim(), field);
      if (value === null) {
        return {
          ok: false,
          error: `Invalid list value "${part}" in ${meta.label}`,
        };
      }
      const maxAllowed = field === "dayOfWeek" ? 7 : meta.max;
      if (value < meta.min || value > maxAllowed) {
        return {
          ok: false,
          error: `${meta.label} values must be between ${meta.min} and ${meta.max}`,
        };
      }
      values.push(value);
    }
    return {
      ok: true,
      description: values.map((v) => describeSingleValue(v, field)).join(", "),
    };
  }

  const value = resolveNamedValue(trimmed, field);
  if (value === null) {
    return {
      ok: false,
      error: `Invalid ${meta.label} value "${trimmed}"`,
    };
  }
  const maxAllowed = field === "dayOfWeek" ? 7 : meta.max;
  if (value < meta.min || value > maxAllowed) {
    return {
      ok: false,
      error: `${meta.label} must be between ${meta.min} and ${meta.max}`,
    };
  }

  return { ok: true, description: describeSingleValue(value, field) };
}

function buildSummary(
  fields: Record<CronFieldName, string>,
  descriptions: Record<CronFieldName, string>,
): string {
  const expr = `${fields.minute} ${fields.hour} ${fields.dayOfMonth} ${fields.month} ${fields.dayOfWeek}`;

  if (expr === "* * * * *") {
    return "Runs every minute.";
  }
  if (expr === "0 0 * * *") {
    return "Runs every day at midnight (00:00).";
  }
  if (expr === "30 2 * * *") {
    return "Runs every day at 02:30.";
  }
  if (expr === "0 9 * * 1") {
    return "Runs every Monday at 09:00.";
  }
  if (expr === "*/15 * * * *") {
    return "Runs every 15 minutes.";
  }
  if (expr === "0 * * * *") {
    return "Runs at minute 0 of every hour.";
  }

  const minute = fields.minute;
  const hour = fields.hour;
  const dom = fields.dayOfMonth;
  const mon = fields.month;
  const dow = fields.dayOfWeek;

  const timePart =
    minute !== "*" &&
    hour !== "*" &&
    !minute.includes("/") &&
    !hour.includes("/") &&
    !minute.includes(",") &&
    !hour.includes(",") &&
    !minute.includes("-") &&
    !hour.includes("-")
      ? `at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
      : `with minute=${descriptions.minute}; hour=${descriptions.hour}`;

  const dayParts: string[] = [];
  if (dom === "*" && mon === "*" && dow === "*") {
    dayParts.push("every day");
  } else {
    if (dom !== "*") {
      dayParts.push(`on ${descriptions.dayOfMonth} of the month`);
    }
    if (mon !== "*") {
      dayParts.push(`in ${descriptions.month}`);
    }
    if (dow !== "*") {
      dayParts.push(`on ${descriptions.dayOfWeek}`);
    }
  }

  return `Runs ${timePart}${dayParts.length ? `, ${dayParts.join(", ")}` : ""}.`;
}

/**
 * Parse a standard five-field cron expression.
 * Supports *, numbers, ranges, lists, and step values (star/N and A-B/N).
 * Does not claim full compatibility with every cron implementation.
 */
export function parseCronExpression(input: string): CronParseResult {
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return { ok: false, error: "Enter a five-field cron expression." };
  }

  const parts = trimmed.split(" ");
  if (parts.length !== 5) {
    return {
      ok: false,
      error: `Expected exactly 5 fields (minute hour day-of-month month day-of-week), found ${parts.length}.`,
    };
  }

  const fieldDescriptions = {} as Record<CronFieldName, string>;
  const fields = {
    minute: parts[0]!,
    hour: parts[1]!,
    dayOfMonth: parts[2]!,
    month: parts[3]!,
    dayOfWeek: parts[4]!,
  };

  for (let i = 0; i < FIELD_ORDER.length; i += 1) {
    const name = FIELD_ORDER[i]!;
    const parsed = parseFieldToken(parts[i]!, name);
    if (!parsed.ok) {
      return { ok: false, error: parsed.error, field: name };
    }
    fieldDescriptions[name] = parsed.description;
  }

  const bothDayFields =
    fields.dayOfMonth !== "*" && fields.dayOfWeek !== "*";

  return {
    ok: true,
    fields,
    fieldDescriptions,
    summary: buildSummary(fields, fieldDescriptions),
    note: bothDayFields
      ? "Note: when both day-of-month and day-of-week are restricted, matching can vary between cron implementations (AND vs OR)."
      : undefined,
  };
}

export const CRON_EXAMPLES = [
  { expression: "* * * * *", label: "Every minute" },
  { expression: "0 0 * * *", label: "Every day at midnight" },
  { expression: "30 2 * * *", label: "Every day at 02:30" },
  { expression: "0 9 * * 1", label: "Every Monday at 09:00" },
  { expression: "*/15 * * * *", label: "Every 15 minutes" },
] as const;

/* -------------------------------------------------------------------------- */
/* Command simulation                                                         */
/* -------------------------------------------------------------------------- */

function normalizeCommand(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

function formatCrontabList(state: SimulatedScheduledTasksState): string[] {
  if (state.crontab.length === 0) {
    return ["no crontab for " + state.currentUser];
  }

  const lines: string[] = [
    `# Simulated crontab for ${state.currentUser} (timezone: ${state.timezone})`,
  ];
  for (const job of state.crontab) {
    if (job.comment) {
      lines.push(`# ${job.comment}`);
    }
    lines.push(`${formatCronExpression(job)} ${job.command}`);
  }
  return lines;
}

function formatCronStatus(state: SimulatedScheduledTasksState): string[] {
  const active = state.cronActive;
  const lines = [
    "● cron.service - Regular background program processing daemon",
    "     Loaded: loaded (/lib/systemd/system/cron.service; enabled; preset: enabled)",
    active
      ? "     Active: active (running) since Mon 2026-10-12 08:00:01 UTC; 2 days ago"
      : "     Active: inactive (dead)",
    "       Docs: man:cron(8)",
    active ? "   Main PID: 512 (cron)" : "   Main PID: n/a",
    "      Tasks: " + (active ? "1 (limit: 4915)" : "0"),
    "     Memory: " + (active ? "1.8M" : "0B"),
    "        CPU: " + (active ? "42ms" : "0"),
    "     CGroup: /system.slice/cron.service",
    active ? "             └─512 /usr/sbin/cron -f" : "",
    "",
  ].filter((line) => line !== undefined);

  if (active) {
    lines.push(
      "Oct 14 02:00:01 rean-linux CRON[8841]: (bunsal) CMD (/usr/local/bin/backup.sh)",
    );
    lines.push(
      "Oct 14 02:00:02 rean-linux cron[512]: (bunsal) backup.sh completed (exit 0)",
    );
  } else {
    lines.push(
      "Oct 13 22:10:00 rean-linux systemd[1]: Stopped cron.service - Regular background program processing daemon.",
    );
  }

  return lines;
}

function formatJournalLines(
  state: SimulatedScheduledTasksState,
  limit?: number,
): string[] {
  const lines: string[] = [];

  if (!state.cronActive) {
    lines.push(
      "Oct 13 22:10:00 rean-linux systemd[1]: Stopped cron.service.",
      "Oct 13 22:10:00 rean-linux systemd[1]: cron.service: Deactivated successfully.",
      "Oct 14 02:00:00 rean-linux systemd[1]: cron.service is not running — scheduled jobs will not execute.",
    );
  }

  for (const entry of state.history) {
    const status =
      entry.exitCode === 0
        ? `CMD (${entry.command}) exit=${entry.exitCode}`
        : `CMD (${entry.command}) FAILED exit=${entry.exitCode}`;
    lines.push(
      `${entry.timestamp} rean-linux CRON[1]: (${state.currentUser}) ${status}`,
    );
    if (entry.output) {
      lines.push(
        `${entry.timestamp} rean-linux CRON[1]: (${state.currentUser}) ${entry.output}`,
      );
    }
    if (entry.note) {
      lines.push(
        `${entry.timestamp} rean-linux CRON[1]: note: ${entry.note}`,
      );
    }
  }

  if (lines.length === 0) {
    lines.push("-- No entries --");
  }

  if (limit !== undefined && limit > 0) {
    return lines.slice(-limit);
  }
  return lines;
}

function formatAtQueue(state: SimulatedScheduledTasksState): string[] {
  if (state.atJobs.length === 0) {
    return ["no at jobs for " + state.currentUser];
  }
  return state.atJobs.map(
    (job) =>
      `${job.queueId}\t${job.schedule} a ${job.user}`,
  );
}

function parseCrontabAddArgument(raw: string): {
  ok: true;
  job: CronJobEntry;
} | { ok: false; error: string } {
  const match = raw.match(/^crontab-add\s+(.+)$/i);
  if (!match || !match[1]) {
    return {
      ok: false,
      error: 'Usage: crontab-add "MIN HOUR DOM MON DOW COMMAND"',
    };
  }

  let payload = match[1].trim();
  if (
    (payload.startsWith('"') && payload.endsWith('"')) ||
    (payload.startsWith("'") && payload.endsWith("'"))
  ) {
    payload = payload.slice(1, -1);
  }

  const parts = payload.trim().split(/\s+/);
  if (parts.length < 6) {
    return {
      ok: false,
      error:
        'Usage: crontab-add "MIN HOUR DOM MON DOW COMMAND" (five schedule fields plus a command)',
    };
  }

  const expression = parts.slice(0, 5).join(" ");
  const command = parts.slice(5).join(" ");
  const parsed = parseCronExpression(expression);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  return {
    ok: true,
    job: makeJob(
      `job-${parsed.fields.minute}-${parsed.fields.hour}-${command.length}`,
      parsed.fields.minute,
      parsed.fields.hour,
      parsed.fields.dayOfMonth,
      parsed.fields.month,
      parsed.fields.dayOfWeek,
      command,
    ),
  };
}

export function simulateScheduledTasksCommand(
  raw: string,
  state: SimulatedScheduledTasksState,
): SimulateScheduledTasksResult {
  const nextState = cloneScheduledTasksState(state);
  const command = normalizeCommand(raw);

  if (!command) {
    return { result: { kind: "empty" }, state: nextState };
  }

  const lower = command.toLowerCase();

  if (lower === "clear") {
    return { result: { kind: "clear" }, state: nextState };
  }

  if (lower === "help" || lower === "?") {
    return {
      result: { kind: "output", lines: [...HELP_OUTPUT] },
      state: nextState,
    };
  }

  if (lower === "crontab -l") {
    return {
      result: { kind: "output", lines: formatCrontabList(nextState) },
      state: nextState,
    };
  }

  if (lower === "crontab -e") {
    return {
      result: { kind: "output", lines: [...CRONTAB_EDITOR_HELP] },
      state: nextState,
    };
  }

  if (lower === "crontab -r") {
    if (nextState.crontab.length === 0) {
      return {
        result: {
          kind: "output",
          lines: [`no crontab for ${nextState.currentUser}`],
        },
        state: nextState,
      };
    }
    nextState.crontab = [];
    return {
      result: {
        kind: "output",
        lines: [
          `crontab for ${nextState.currentUser} removed (simulated — host unchanged)`,
        ],
      },
      state: nextState,
    };
  }

  if (lower.startsWith("crontab-add")) {
    const parsed = parseCrontabAddArgument(command);
    if (!parsed.ok) {
      return {
        result: { kind: "output", lines: [parsed.error] },
        state: nextState,
      };
    }
    nextState.crontab.push(parsed.job);
    return {
      result: {
        kind: "output",
        lines: [
          `added: ${formatCronExpression(parsed.job)} ${parsed.job.command}`,
          "(simulated — nothing written to the host crontab)",
        ],
      },
      state: nextState,
    };
  }

  if (lower.startsWith("crontab-remove")) {
    const match = lower.match(/^crontab-remove\s+(\d+)$/);
    if (!match) {
      return {
        result: {
          kind: "output",
          lines: ["Usage: crontab-remove N  (1-based entry number from crontab -l)"],
        },
        state: nextState,
      };
    }
    const index = Number(match[1]) - 1;
    if (index < 0 || index >= nextState.crontab.length) {
      return {
        result: {
          kind: "output",
          lines: [
            `No entry ${match[1]} — run crontab -l and use a valid line number.`,
          ],
        },
        state: nextState,
      };
    }
    const removed = nextState.crontab.splice(index, 1)[0]!;
    return {
      result: {
        kind: "output",
        lines: [
          `removed: ${formatCronExpression(removed)} ${removed.command}`,
        ],
      },
      state: nextState,
    };
  }

  if (lower === "systemctl status cron" || lower === "systemctl status crond") {
    return {
      result: { kind: "output", lines: formatCronStatus(nextState) },
      state: nextState,
    };
  }

  if (lower === "systemctl start cron" || lower === "systemctl start crond") {
    if (nextState.cronActive) {
      return {
        result: {
          kind: "output",
          lines: ["cron.service is already active (running)."],
        },
        state: nextState,
      };
    }
    nextState.cronActive = true;
    return {
      result: {
        kind: "output",
        lines: [
          "Started cron.service (simulated).",
          "Scheduled jobs can run again while the service stays active.",
        ],
      },
      state: nextState,
    };
  }

  if (lower === "systemctl stop cron" || lower === "systemctl stop crond") {
    if (!nextState.cronActive) {
      return {
        result: {
          kind: "output",
          lines: ["cron.service is already inactive (dead)."],
        },
        state: nextState,
      };
    }
    nextState.cronActive = false;
    return {
      result: {
        kind: "output",
        lines: [
          "Stopped cron.service (simulated).",
          "Existing crontab entries remain, but they will not execute until cron is started.",
        ],
      },
      state: nextState,
    };
  }

  if (lower === "journalctl -u cron" || lower === "journalctl -u crond") {
    return {
      result: { kind: "output", lines: formatJournalLines(nextState) },
      state: nextState,
    };
  }

  if (
    lower === "journalctl -u cron -n 10" ||
    lower === "journalctl -u crond -n 10"
  ) {
    return {
      result: {
        kind: "output",
        lines: formatJournalLines(nextState, 10),
      },
      state: nextState,
    };
  }

  const journalN = lower.match(/^journalctl -u cron(?:d)? -n (\d+)$/);
  if (journalN) {
    return {
      result: {
        kind: "output",
        lines: formatJournalLines(nextState, Number(journalN[1])),
      },
      state: nextState,
    };
  }

  if (lower === "atq" || lower === "at -l") {
    return {
      result: { kind: "output", lines: formatAtQueue(nextState) },
      state: nextState,
    };
  }

  return {
    result: { kind: "output", lines: [...UNSUPPORTED_MESSAGE] },
    state: nextState,
  };
}
