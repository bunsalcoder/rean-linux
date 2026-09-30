"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import {
  CHALLENGE_CATEGORIES,
  TOTAL_CHALLENGE_TASKS,
  getTasksForCategory,
  type ChallengeCategoryId,
  type ChallengeTaskId,
  type ChallengeValidationContext,
} from "@/lib/linux-essentials-challenge";
import type { SimulatedBashScriptState } from "@/lib/simulate-bash-scripting";
import type { SimulatedEnvState } from "@/lib/simulate-environment-variables";
import type { SimulatedOwnershipState } from "@/lib/simulate-ownership-sudo";
import type { SimulatedPackageState } from "@/lib/simulate-package-management";
import type { SimulatedPermissionsState } from "@/lib/simulate-file-permissions";
import type { SimulatedPipesState } from "@/lib/simulate-pipes-and-redirection";
import type { SimulatedProcessState } from "@/lib/simulate-processes";
import type { SimulatedShellState } from "@/lib/simulate-shell-basics";
import { cn } from "@/lib/utils";

type ChallengeProgressContextValue = {
  completed: ReadonlySet<ChallengeTaskId>;
  completeTask: (id: ChallengeTaskId) => void;
  completedCount: number;
  percentComplete: number;
  categoryCompletedCount: (categoryId: ChallengeCategoryId) => number;
  categoryTotal: (categoryId: ChallengeCategoryId) => number;
  isCategoryComplete: (categoryId: ChallengeCategoryId) => boolean;
  allComplete: boolean;
};

const ChallengeProgressContext =
  createContext<ChallengeProgressContextValue | null>(null);

function useChallengeProgress(): ChallengeProgressContextValue {
  const value = useContext(ChallengeProgressContext);
  if (!value) {
    throw new Error(
      "Challenge progress hooks require LinuxEssentialsChallengeProvider",
    );
  }
  return value;
}

export function LinuxEssentialsChallengeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [completed, setCompleted] = useState<ReadonlySet<ChallengeTaskId>>(
    () => new Set(),
  );

  const completeTask = useCallback((id: ChallengeTaskId) => {
    setCompleted((prev) => {
      if (prev.has(id)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const value = useMemo<ChallengeProgressContextValue>(() => {
    const completedCount = completed.size;
    const percentComplete = Math.round(
      (completedCount / TOTAL_CHALLENGE_TASKS) * 100,
    );

    function categoryTotal(categoryId: ChallengeCategoryId): number {
      return (
        CHALLENGE_CATEGORIES.find((category) => category.id === categoryId)
          ?.taskIds.length ?? 0
      );
    }

    function categoryCompletedCount(categoryId: ChallengeCategoryId): number {
      const category = CHALLENGE_CATEGORIES.find(
        (item) => item.id === categoryId,
      );
      if (!category) {
        return 0;
      }
      return category.taskIds.filter((id) => completed.has(id)).length;
    }

    function isCategoryComplete(categoryId: ChallengeCategoryId): boolean {
      return categoryCompletedCount(categoryId) === categoryTotal(categoryId);
    }

    return {
      completed,
      completeTask,
      completedCount,
      percentComplete,
      categoryCompletedCount,
      categoryTotal,
      isCategoryComplete,
      allComplete: completedCount >= TOTAL_CHALLENGE_TASKS,
    };
  }, [completed, completeTask]);

  return (
    <ChallengeProgressContext.Provider value={value}>
      {children}
    </ChallengeProgressContext.Provider>
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

export function LinuxEssentialsChallengeProgress() {
  const { completedCount, percentComplete } = useChallengeProgress();

  return (
    <ProgressMeter
      label="Challenge progress"
      completedCount={completedCount}
      total={TOTAL_CHALLENGE_TASKS}
      percent={percentComplete}
    />
  );
}

function categorySuggestions() {
  return [{ command: "help", label: "help" }] as const;
}

export function LinuxEssentialsChallengeCategory({
  categoryId,
}: {
  categoryId: ChallengeCategoryId;
}) {
  const { completed, completeTask, categoryCompletedCount, categoryTotal } =
    useChallengeProgress();
  const tasks = getTasksForCategory(categoryId);
  const category = CHALLENGE_CATEGORIES.find((item) => item.id === categoryId)!;

  const [revealedHints, setRevealedHints] = useState<
    ReadonlySet<ChallengeTaskId>
  >(() => new Set());
  const [feedback, setFeedback] = useState<{
    taskId: ChallengeTaskId;
    kind: "success" | "retry";
    message: string;
  } | null>(null);

  const permissionsRef = useRef<SimulatedPermissionsState | null>(null);
  const ownershipRef = useRef<SimulatedOwnershipState | null>(null);
  const processesRef = useRef<SimulatedProcessState | null>(null);
  const packagesRef = useRef<SimulatedPackageState | null>(null);
  const environmentRef = useRef<SimulatedEnvState | null>(null);
  const pipesRef = useRef<SimulatedPipesState | null>(null);
  const shellRef = useRef<SimulatedShellState | null>(null);
  const bashScriptRef = useRef<SimulatedBashScriptState | null>(null);
  const completedRef = useRef(completed);
  useEffect(() => {
    completedRef.current = completed;
  }, [completed]);

  const doneCount = categoryCompletedCount(categoryId);
  const total = categoryTotal(categoryId);

  function revealHint(taskId: ChallengeTaskId) {
    setRevealedHints((prev) => {
      if (prev.has(taskId)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });
  }

  function evaluateCommand(command: string) {
    const ctx: ChallengeValidationContext = {
      command,
      permissions: permissionsRef.current,
      ownership: ownershipRef.current,
      processes: processesRef.current,
      packages: packagesRef.current,
      environment: environmentRef.current,
      pipes: pipesRef.current,
      shell: shellRef.current,
      bashScript: bashScriptRef.current,
    };

    const incomplete = tasks.filter(
      (task) => !completedRef.current.has(task.id),
    );
    const matched = incomplete.find((task) => task.validate(ctx));

    if (matched) {
      completeTask(matched.id);
      setFeedback({
        taskId: matched.id,
        kind: "success",
        message: matched.successExplanation,
      });
      return;
    }

    const active = incomplete[0];
    if (active) {
      setFeedback({
        taskId: active.id,
        kind: "retry",
        message:
          "Not quite for the current task. Check the description, retry, or open a hint.",
      });
    }
  }

  const terminalProps = {
    suggestions: categorySuggestions(),
    suggestionsLabel: "Useful commands",
    onCommandRun: evaluateCommand,
    identity: category.terminalMode === "identity",
    permissions: category.terminalMode === "permissions",
    ownership: category.terminalMode === "ownership",
    processes: category.terminalMode === "processes",
    packages: category.terminalMode === "packages",
    environment: category.terminalMode === "environment",
    pipes: category.terminalMode === "pipes",
    searching: category.terminalMode === "searching",
    textProcessing: category.terminalMode === "textProcessing",
    shellBasics: category.terminalMode === "shellBasics",
    bashScripting: category.terminalMode === "bashScripting",
    onPermissionsChange: (state: SimulatedPermissionsState) => {
      permissionsRef.current = state;
    },
    onOwnershipChange: (state: SimulatedOwnershipState) => {
      ownershipRef.current = state;
    },
    onProcessesChange: (state: SimulatedProcessState) => {
      processesRef.current = state;
    },
    onPackagesChange: (state: SimulatedPackageState) => {
      packagesRef.current = state;
    },
    onEnvironmentChange: (state: SimulatedEnvState) => {
      environmentRef.current = state;
    },
    onPipesChange: (state: SimulatedPipesState) => {
      pipesRef.current = state;
    },
    onShellBasicsChange: (state: SimulatedShellState) => {
      shellRef.current = state;
    },
    onBashScriptingChange: (state: SimulatedBashScriptState) => {
      bashScriptRef.current = state;
    },
  } as const;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-muted-foreground text-sm">{category.description}</p>
        <p className="text-muted-foreground font-mono text-xs tabular-nums">
          {doneCount}/{total} tasks
        </p>
      </div>

      <ol className="space-y-4">
        {tasks.map((task, index) => {
          const isDone = completed.has(task.id);
          const hintOpen = revealedHints.has(task.id);
          const taskFeedback = feedback?.taskId === task.id ? feedback : null;

          return (
            <li
              key={task.id}
              className={cn(
                "border-border rounded-lg border p-4",
                isDone && "border-primary/30 bg-primary/5",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-foreground text-sm font-medium">
                  Task {index + 1 + (category.number - 1) * 3}: {task.title}
                </p>
                <span
                  className={cn(
                    "font-mono text-xs tracking-wide uppercase",
                    isDone ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {isDone ? "Completed" : "Pending"}
                </span>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                {task.description}
              </p>

              {!isDone ? (
                <div className="mt-3 space-y-2">
                  {!hintOpen ? (
                    <button
                      type="button"
                      onClick={() => revealHint(task.id)}
                      className="text-primary text-sm font-medium underline-offset-2 hover:underline"
                    >
                      Show hint
                    </button>
                  ) : (
                    <div className="border-border bg-muted/40 space-y-1 rounded-md border px-3 py-2 text-sm">
                      <p className="text-foreground font-medium">Hint</p>
                      <p className="text-muted-foreground">{task.hint}</p>
                      <p className="text-muted-foreground">Try:</p>
                      <pre className="bg-muted text-foreground overflow-x-auto rounded px-2 py-1.5 font-mono text-xs whitespace-pre-wrap sm:text-sm">
                        {task.expectedCommand}
                      </pre>
                    </div>
                  )}
                </div>
              ) : null}

              {taskFeedback ? (
                <p
                  className={cn(
                    "mt-3 text-sm",
                    taskFeedback.kind === "success"
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {taskFeedback.kind === "success" ? "✓ " : ""}
                  {taskFeedback.message}
                </p>
              ) : null}

              {isDone && taskFeedback?.kind !== "success" ? (
                <p className="text-foreground mt-3 text-sm">
                  ✓ {task.successExplanation}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <TerminalSimulator {...terminalProps} />

      <p className="text-muted-foreground text-sm">
        This terminal is simulated. It never runs real shell commands or touches
        your host filesystem.
      </p>
    </div>
  );
}

export function LinuxEssentialsChallengeSummary() {
  const {
    completedCount,
    percentComplete,
    allComplete,
    categoryCompletedCount,
    categoryTotal,
  } = useChallengeProgress();
  const remaining = TOTAL_CHALLENGE_TASKS - completedCount;

  return (
    <div className="space-y-4">
      <ProgressMeter
        label="Overall completion"
        completedCount={completedCount}
        total={TOTAL_CHALLENGE_TASKS}
        percent={percentComplete}
      />

      <div className="border-border overflow-hidden rounded-lg border">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Category-level completion</caption>
          <thead className="bg-muted/40 text-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {CHALLENGE_CATEGORIES.map((category) => {
              const done = categoryCompletedCount(category.id);
              const total = categoryTotal(category.id);
              return (
                <tr key={category.id} className="border-border border-t">
                  <td className="text-foreground px-3 py-2">
                    {category.number}. {category.title}
                  </td>
                  <td className="text-muted-foreground px-3 py-2 font-mono tabular-nums">
                    {done}/{total}
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
            Total tasks
          </dt>
          <dd className="text-foreground mt-1 font-mono text-lg tabular-nums">
            {TOTAL_CHALLENGE_TASKS}
          </dd>
        </div>
        <div className="border-border rounded-lg border p-3">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">
            Completed
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
        <Callout title="Linux Essentials Challenge Completed!">
          <p>
            You practiced the core concepts of the Linux Essentials stage —
            users, permissions, ownership, processes, packages, environment
            variables, redirection, searching, text tools, shell basics, and
            Bash scripting — in a safe simulated terminal.
          </p>
        </Callout>
      ) : (
        <Callout title="Keep going">
          <p>
            {remaining === 1
              ? "One task remains. Finish it whenever you are ready — progress resets if you refresh the page."
              : `${remaining} tasks remain. Work through each category terminal at your own pace — progress exists only for this page session.`}
          </p>
        </Callout>
      )}
    </div>
  );
}
