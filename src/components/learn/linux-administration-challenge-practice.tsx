"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  ADMIN_INCIDENTS,
  TOTAL_ADMIN_INCIDENTS,
  getAdminIncident,
  incidentNeedsReview,
  type AdminIncident,
  type AdminIncidentId,
  type AdminValidationContext,
} from "@/lib/linux-administration-challenge";
import type { SimulatedBackupState } from "@/lib/simulate-backups-and-recovery";
import type { SimulatedDiskState } from "@/lib/simulate-disk-usage-mounts";
import type { SimulatedFirewallState } from "@/lib/simulate-firewall-basics";
import type { SimulatedJournalState } from "@/lib/simulate-logs-journald";
import type { SimulatedNetTroubleshootState } from "@/lib/simulate-network-troubleshooting";
import type { SimulatedScheduledTasksState } from "@/lib/simulate-scheduled-tasks";
import type { SimulatedSshState } from "@/lib/simulate-ssh-remote-access";
import type { SimulatedServicesState } from "@/lib/simulate-system-services";
import type { SimulatedSystemMonitoringState } from "@/lib/simulate-system-monitoring";
import { cn } from "@/lib/utils";

type IncidentStats = {
  attempts: number;
  hintsUsed: number;
  hint1: boolean;
  hint2: boolean;
};

type AdminChallengeContextValue = {
  completed: ReadonlySet<AdminIncidentId>;
  completeIncident: (id: AdminIncidentId) => void;
  uncompleteIncident: (id: AdminIncidentId) => void;
  completedCount: number;
  percentComplete: number;
  allComplete: boolean;
  stats: Readonly<Record<AdminIncidentId, IncidentStats>>;
  recordAttempt: (id: AdminIncidentId) => void;
  revealHint: (id: AdminIncidentId, level: 1 | 2) => void;
  resetChallenge: () => void;
  /** Bumps when the whole challenge resets so incident panels remount. */
  resetEpoch: number;
};

const AdminChallengeContext = createContext<AdminChallengeContextValue | null>(
  null,
);

function emptyStats(): Record<AdminIncidentId, IncidentStats> {
  const stats = {} as Record<AdminIncidentId, IncidentStats>;
  for (const incident of ADMIN_INCIDENTS) {
    stats[incident.id] = {
      attempts: 0,
      hintsUsed: 0,
      hint1: false,
      hint2: false,
    };
  }
  return stats;
}

function useAdminChallenge(): AdminChallengeContextValue {
  const value = useContext(AdminChallengeContext);
  if (!value) {
    throw new Error(
      "Administration challenge hooks require LinuxAdministrationChallengeProvider",
    );
  }
  return value;
}

export function LinuxAdministrationChallengeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [completed, setCompleted] = useState<ReadonlySet<AdminIncidentId>>(
    () => new Set(),
  );
  const [stats, setStats] = useState<Record<AdminIncidentId, IncidentStats>>(
    () => emptyStats(),
  );
  const [resetEpoch, setResetEpoch] = useState(0);

  const completeIncident = useCallback((id: AdminIncidentId) => {
    setCompleted((prev) => {
      if (prev.has(id)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const uncompleteIncident = useCallback((id: AdminIncidentId) => {
    setCompleted((prev) => {
      if (!prev.has(id)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const recordAttempt = useCallback((id: AdminIncidentId) => {
    setStats((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        attempts: prev[id].attempts + 1,
      },
    }));
  }, []);

  const revealHint = useCallback((id: AdminIncidentId, level: 1 | 2) => {
    setStats((prev) => {
      const current = prev[id];
      if (level === 1 && current.hint1) {
        return prev;
      }
      if (level === 2 && current.hint2) {
        return prev;
      }
      const nextHints =
        current.hintsUsed +
        (level === 1 && !current.hint1 ? 1 : 0) +
        (level === 2 && !current.hint2 ? 1 : 0);
      return {
        ...prev,
        [id]: {
          ...current,
          hint1: level === 1 ? true : current.hint1,
          hint2: level === 2 ? true : current.hint2,
          hintsUsed: nextHints,
        },
      };
    });
  }, []);

  const resetChallenge = useCallback(() => {
    setCompleted(new Set());
    setStats(emptyStats());
    setResetEpoch((value) => value + 1);
  }, []);

  const value = useMemo<AdminChallengeContextValue>(() => {
    const completedCount = completed.size;
    return {
      completed,
      completeIncident,
      uncompleteIncident,
      completedCount,
      percentComplete: Math.round(
        (completedCount / TOTAL_ADMIN_INCIDENTS) * 100,
      ),
      allComplete: completedCount >= TOTAL_ADMIN_INCIDENTS,
      stats,
      recordAttempt,
      revealHint,
      resetChallenge,
      resetEpoch,
    };
  }, [
    completed,
    completeIncident,
    uncompleteIncident,
    stats,
    recordAttempt,
    revealHint,
    resetChallenge,
    resetEpoch,
  ]);

  return (
    <AdminChallengeContext.Provider value={value}>
      {children}
    </AdminChallengeContext.Provider>
  );
}

function ProgressMeter({
  label,
  completedCount,
  total,
  percent,
}: {
  label: string;
  completedCount: number;
  total: number;
  percent: number;
}) {
  return (
    <div className="border-border bg-muted/30 space-y-2 rounded-lg border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-foreground text-sm font-medium">{label}</p>
        <p className="text-muted-foreground font-mono text-xs tabular-nums">
          {completedCount}/{total} · {percent}%
        </p>
      </div>
      <div
        className="bg-muted h-2 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={label}
      >
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function LinuxAdministrationChallengeProgress() {
  const { completedCount, percentComplete, resetChallenge, allComplete } =
    useAdminChallenge();

  return (
    <div className="space-y-3">
      <ProgressMeter
        label="Challenge progress"
        completedCount={completedCount}
        total={TOTAL_ADMIN_INCIDENTS}
        percent={percentComplete}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={resetChallenge}>
          Reset entire challenge
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        {allComplete
          ? "All incidents solved for this session. Progress clears if you refresh the page."
          : "Progress exists only in this page session — refreshing resets scoring and every incident."}
      </p>
    </div>
  );
}

function resolveBackupsProp(incident: AdminIncident) {
  const value = incident.backupsAndRecovery;
  if (typeof value === "function") {
    return value();
  }
  return value ?? true;
}

function IncidentPanel({ incident }: { incident: AdminIncident }) {
  const {
    completed,
    completeIncident,
    uncompleteIncident,
    stats,
    recordAttempt,
    revealHint,
  } = useAdminChallenge();

  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "retry";
    message: string;
  } | null>(null);
  const [terminalKey, setTerminalKey] = useState(0);
  const [uiFixed, setUiFixed] = useState(false);
  const [networkScenario, setNetworkScenario] = useState(
    incident.networkTroubleshooting,
  );

  const servicesRef = useRef<SimulatedServicesState | null>(null);
  const journalRef = useRef<SimulatedJournalState | null>(null);
  const diskRef = useRef<SimulatedDiskState | null>(null);
  const netTroubleRef = useRef<SimulatedNetTroubleshootState | null>(null);
  const sshRef = useRef<SimulatedSshState | null>(null);
  const firewallRef = useRef<SimulatedFirewallState | null>(null);
  const scheduledRef = useRef<SimulatedScheduledTasksState | null>(null);
  const monitoringRef = useRef<SimulatedSystemMonitoringState | null>(null);
  const backupsRef = useRef<SimulatedBackupState | null>(null);

  const isDone = completed.has(incident.id);
  const incidentStats = stats[incident.id];
  const needsAnswer = Boolean(incident.options?.length);

  function buildContext(): AdminValidationContext {
    return {
      selectedAnswer: selected,
      uiFixed,
      services: servicesRef.current,
      journal: journalRef.current,
      diskUsage: diskRef.current,
      networkTroubleshooting: netTroubleRef.current,
      ssh: sshRef.current,
      firewall: firewallRef.current,
      scheduledTasks: scheduledRef.current,
      monitoring: monitoringRef.current,
      backups: backupsRef.current,
    };
  }

  function resetIncident() {
    uncompleteIncident(incident.id);
    setSelected(null);
    setSubmitted(false);
    setFeedback(null);
    setUiFixed(false);
    setNetworkScenario(incident.networkTroubleshooting);
    servicesRef.current = null;
    journalRef.current = null;
    diskRef.current = null;
    netTroubleRef.current = null;
    sshRef.current = null;
    firewallRef.current = null;
    scheduledRef.current = null;
    monitoringRef.current = null;
    backupsRef.current = null;
    setTerminalKey((value) => value + 1);
  }

  function applyUiFix() {
    if (!incident.uiFix || incident.uiFix.kind !== "restore-default-route") {
      return;
    }
    setUiFixed(true);
    setNetworkScenario("healthy");
    netTroubleRef.current = null;
    setTerminalKey((value) => value + 1);
    setFeedback({
      kind: "retry",
      message:
        "Simulated default route restored. Re-check `ip route` and `ping 8.8.8.8`, then submit the incident.",
    });
    setSubmitted(false);
  }

  function submitIncident() {
    if (needsAnswer && !selected) {
      return;
    }
    recordAttempt(incident.id);
    setSubmitted(true);
    const ok = incident.validate(buildContext());
    if (ok) {
      completeIncident(incident.id);
      setFeedback({
        kind: "success",
        message: incident.successExplanation,
      });
      return;
    }
    setFeedback({
      kind: "retry",
      message: needsAnswer
        ? "Not quite. Re-check the evidence, adjust your conclusion or fix, then try again."
        : "Acceptance criteria are not met yet. Re-run diagnostics, apply a supported fix, then submit again.",
    });
  }

  const terminalProps = {
    key: `${incident.id}-${terminalKey}`,
    suggestions: incident.suggestions,
    suggestionsLabel: "Useful commands",
    services: incident.terminalMode === "services",
    journal: incident.terminalMode === "journal",
    diskUsage: incident.terminalMode === "diskUsage",
    networkTroubleshooting:
      incident.terminalMode === "networkTroubleshooting"
        ? (networkScenario ?? true)
        : false,
    sshRemoteAccess:
      incident.terminalMode === "sshRemoteAccess"
        ? (incident.sshRemoteAccess ?? true)
        : false,
    firewallBasics:
      incident.terminalMode === "firewallBasics"
        ? (incident.firewallBasics ?? true)
        : false,
    scheduledTasks:
      incident.terminalMode === "scheduledTasks"
        ? (incident.scheduledTasks ?? true)
        : false,
    systemMonitoring:
      incident.terminalMode === "systemMonitoring"
        ? (incident.systemMonitoring ?? true)
        : false,
    backupsAndRecovery:
      incident.terminalMode === "backupsAndRecovery"
        ? resolveBackupsProp(incident)
        : false,
    onServicesChange: (state: SimulatedServicesState) => {
      servicesRef.current = state;
    },
    onJournalChange: (state: SimulatedJournalState) => {
      journalRef.current = state;
    },
    onDiskUsageChange: (state: SimulatedDiskState) => {
      diskRef.current = state;
    },
    onNetworkTroubleshootingChange: (state: SimulatedNetTroubleshootState) => {
      netTroubleRef.current = state;
    },
    onSshRemoteAccessChange: (state: SimulatedSshState) => {
      sshRef.current = state;
    },
    onFirewallBasicsChange: (state: SimulatedFirewallState) => {
      firewallRef.current = state;
    },
    onScheduledTasksChange: (state: SimulatedScheduledTasksState) => {
      scheduledRef.current = state;
    },
    onSystemMonitoringChange: (state: SimulatedSystemMonitoringState) => {
      monitoringRef.current = state;
    },
    onBackupsAndRecoveryChange: (state: SimulatedBackupState) => {
      backupsRef.current = state;
    },
  } as const;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-muted-foreground text-sm">{incident.topic}</p>
        <span
          className={cn(
            "font-mono text-xs tracking-wide uppercase",
            isDone ? "text-primary" : "text-muted-foreground",
          )}
        >
          {isDone ? "Resolved" : "Open"}
        </span>
      </div>

      <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
        <p className="text-foreground text-sm font-medium">Incident report</p>
        <p className="text-sm">{incident.report}</p>
        <div>
          <p className="text-foreground text-sm font-medium">Objectives</p>
          <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
            {incident.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </div>
        <p className="text-muted-foreground font-mono text-xs tabular-nums">
          Attempts: {incidentStats.attempts} · Hints used:{" "}
          {incidentStats.hintsUsed}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={resetIncident}>
          Reset incident
        </Button>
        {!incidentStats.hint1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => revealHint(incident.id, 1)}
          >
            Show hint 1
          </Button>
        ) : null}
        {incidentStats.hint1 && !incidentStats.hint2 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => revealHint(incident.id, 2)}
          >
            Show hint 2
          </Button>
        ) : null}
        {incident.uiFix && !isDone ? (
          <Button type="button" variant="outline" onClick={applyUiFix}>
            {incident.uiFix.label}
          </Button>
        ) : null}
      </div>

      {incidentStats.hint1 ? (
        <Callout title="Hint 1">
          <p>{incident.hint1}</p>
        </Callout>
      ) : null}
      {incidentStats.hint2 ? (
        <Callout title="Hint 2">
          <p>{incident.hint2}</p>
        </Callout>
      ) : null}
      {incident.uiFix ? (
        <p className="text-muted-foreground text-sm">
          {incident.uiFix.description}
        </p>
      ) : null}

      <TerminalSimulator {...terminalProps} />

      <p className="text-muted-foreground text-sm">
        This terminal is simulated. It never runs real shell commands or changes
        your host system.
      </p>

      {needsAnswer ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            What is the best conclusion?
          </p>
          <ul className="space-y-2">
            {incident.options!.map((option) => {
              const isSelected = selected === option.key;
              const showResult = submitted && isSelected;
              return (
                <li key={option.key}>
                  <button
                    type="button"
                    disabled={isDone}
                    onClick={() => {
                      if (isDone) {
                        return;
                      }
                      setSelected(option.key);
                      setSubmitted(false);
                      setFeedback(null);
                    }}
                    className={cn(
                      "border-border bg-background hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                      isSelected &&
                        !submitted &&
                        "border-primary/50 bg-primary/5",
                      showResult &&
                        feedback?.kind === "success" &&
                        "border-green-600/40 bg-green-500/10",
                      showResult &&
                        feedback?.kind === "retry" &&
                        "border-destructive/40 bg-destructive/10",
                    )}
                  >
                    <span className="text-muted-foreground font-mono text-xs font-medium">
                      {option.key}.
                    </span>
                    <span>{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={isDone || (needsAnswer && !selected)}
          onClick={submitIncident}
        >
          Submit incident
        </Button>
        <Button type="button" variant="outline" onClick={resetIncident}>
          Retry
        </Button>
      </div>

      {feedback ? (
        <Callout
          title={feedback.kind === "success" ? "Incident resolved" : "Not yet"}
        >
          <p>
            {feedback.kind === "success" ? "✓ " : null}
            {feedback.message}
          </p>
        </Callout>
      ) : null}

      {isDone && feedback?.kind !== "success" ? (
        <Callout title="Incident resolved">
          <p>✓ {incident.successExplanation}</p>
        </Callout>
      ) : null}
    </div>
  );
}

export function LinuxAdministrationChallengeIncident({
  incidentId,
}: {
  incidentId: AdminIncidentId;
}) {
  const { resetEpoch } = useAdminChallenge();
  const incident = getAdminIncident(incidentId);
  if (!incident) {
    return null;
  }
  return (
    <IncidentPanel key={`${incident.id}-${resetEpoch}`} incident={incident} />
  );
}

export function LinuxAdministrationChallengeSummary() {
  const { completed, completedCount, percentComplete, allComplete, stats } =
    useAdminChallenge();
  const remaining = TOTAL_ADMIN_INCIDENTS - completedCount;
  const reviewTopics = ADMIN_INCIDENTS.filter((incident) => {
    if (!completed.has(incident.id)) {
      return true;
    }
    const item = stats[incident.id];
    return incidentNeedsReview(item.attempts, item.hintsUsed);
  });

  return (
    <div className="space-y-4">
      <ProgressMeter
        label="Overall completion"
        completedCount={completedCount}
        total={TOTAL_ADMIN_INCIDENTS}
        percent={percentComplete}
      />

      <div className="border-border overflow-hidden rounded-lg border">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Incident-level completion</caption>
          <thead className="bg-muted/40 text-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Incident</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Attempts</th>
              <th className="px-3 py-2 font-medium">Hints</th>
            </tr>
          </thead>
          <tbody>
            {ADMIN_INCIDENTS.map((incident) => {
              const done = completed.has(incident.id);
              const item = stats[incident.id];
              return (
                <tr key={incident.id} className="border-border border-t">
                  <td className="text-foreground px-3 py-2">
                    {incident.number}. {incident.topic}
                  </td>
                  <td className="text-muted-foreground px-3 py-2">
                    {done ? "Resolved" : "Open"}
                  </td>
                  <td className="text-muted-foreground px-3 py-2 font-mono tabular-nums">
                    {item.attempts}
                  </td>
                  <td className="text-muted-foreground px-3 py-2 font-mono tabular-nums">
                    {item.hintsUsed}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="border-border rounded-lg border p-3">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">
            Total incidents
          </dt>
          <dd className="text-foreground mt-1 font-mono text-lg tabular-nums">
            {TOTAL_ADMIN_INCIDENTS}
          </dd>
        </div>
        <div className="border-border rounded-lg border p-3">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">
            Solved
          </dt>
          <dd className="text-foreground mt-1 font-mono text-lg tabular-nums">
            {completedCount}
          </dd>
        </div>
        <div className="border-border rounded-lg border p-3">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">
            Remaining
          </dt>
          <dd className="text-foreground mt-1 font-mono text-lg tabular-nums">
            {remaining}
          </dd>
        </div>
      </dl>

      {allComplete ? (
        <Callout title="Linux Administration Challenge completed">
          <p>
            You practiced diagnosing and resolving simulated administration
            incidents across services, logs, storage, mounts, networking, SSH,
            firewalls, scheduling, monitoring, and backups. This is a learning
            exercise — not a certification or proof of production competence.
          </p>
          <p className="mt-2">
            Areas practiced:{" "}
            {ADMIN_INCIDENTS.map((incident) => incident.topic).join("; ")}.
          </p>
          {reviewTopics.length > 0 ? (
            <p className="mt-2">
              Suggested review (extra attempts or hints):{" "}
              {reviewTopics.map((incident, index) => (
                <span key={incident.id}>
                  {index > 0 ? "; " : null}
                  <Link
                    href={incident.reviewHref}
                    className="text-primary font-medium underline-offset-2 hover:underline"
                  >
                    {incident.topic}
                  </Link>
                </span>
              ))}
              .
            </p>
          ) : (
            <p className="mt-2">
              You resolved every incident with relatively few hints — still
              revisit any Stage 03 lesson when you want a refresher.
            </p>
          )}
          <p className="mt-2">
            Next step: preview{" "}
            <Link
              href="/learn/security"
              className="text-primary font-medium underline-offset-2 hover:underline"
            >
              Stage 04 — Linux Security and Hardening
            </Link>
            . Lessons there remain curriculum previews until they ship.
          </p>
        </Callout>
      ) : (
        <Callout title="Keep investigating">
          <p>
            {remaining === 1
              ? "One incident remains. Submit it when the simulated acceptance criteria are met — progress resets if you refresh."
              : `${remaining} incidents remain. Work through each report, gather evidence in the simulator, then submit — scoring stays in this session only.`}
          </p>
        </Callout>
      )}
    </div>
  );
}
