"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";

import { Callout } from "@/components/learn/callout";
import { Button } from "@/components/ui/button";
import {
  applyRemediations,
  buildChallengeEvidence,
  createInitialChallengeEnv,
  getSecurityChallengeCategory,
  getTasksForSecurityCategory,
  MAX_SECURITY_CHALLENGE_SCORE,
  scoreTaskAttempt,
  SECURITY_CHALLENGE_CATEGORIES,
  SECURITY_CHALLENGE_HOST,
  SECURITY_CHALLENGE_SCORING,
  SECURITY_CHALLENGE_TASKS,
  TOTAL_SECURITY_CHALLENGE_TASKS,
  taskNeedsReview,
  validateTaskAnswer,
  type SecurityChallengeCategoryId,
  type SecurityChallengeEnvState,
  type SecurityChallengeTask,
  type SecurityChallengeTaskId,
} from "@/lib/linux-security-challenge";
import { cn } from "@/lib/utils";

type TaskStats = {
  attempts: number;
  hintsUsed: number;
  hintRevealed: boolean;
  pointsEarned: number;
  correct: boolean;
  lastAnswerSummary: string | null;
};

type ChallengeContextValue = {
  env: SecurityChallengeEnvState;
  setEnv: (env: SecurityChallengeEnvState) => void;
  completed: ReadonlySet<SecurityChallengeTaskId>;
  correct: ReadonlySet<SecurityChallengeTaskId>;
  stats: Readonly<Record<SecurityChallengeTaskId, TaskStats>>;
  completeTask: (
    id: SecurityChallengeTaskId,
    result: {
      correct: boolean;
      points: number;
      answerSummary: string;
    },
  ) => void;
  recordAttempt: (id: SecurityChallengeTaskId) => void;
  revealHint: (id: SecurityChallengeTaskId) => void;
  resetChallenge: () => void;
  resetEpoch: number;
  completedCount: number;
  correctCount: number;
  incorrectTaskCount: number;
  totalHintsUsed: number;
  totalIncorrectAttempts: number;
  percentComplete: number;
  totalScore: number;
  maxScore: number;
  allComplete: boolean;
  reviewMode: boolean;
  setReviewMode: (value: boolean) => void;
};

const ChallengeContext = createContext<ChallengeContextValue | null>(null);

function emptyStats(): Record<SecurityChallengeTaskId, TaskStats> {
  const stats = {} as Record<SecurityChallengeTaskId, TaskStats>;
  for (const task of Object.values(SECURITY_CHALLENGE_TASKS)) {
    stats[task.id] = {
      attempts: 0,
      hintsUsed: 0,
      hintRevealed: false,
      pointsEarned: 0,
      correct: false,
      lastAnswerSummary: null,
    };
  }
  return stats;
}

function useSecurityChallenge(): ChallengeContextValue {
  const value = useContext(ChallengeContext);
  if (!value) {
    throw new Error(
      "Security challenge hooks require LinuxSecurityChallengeProvider",
    );
  }
  return value;
}

export function LinuxSecurityChallengeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [env, setEnv] = useState<SecurityChallengeEnvState>(() =>
    createInitialChallengeEnv(),
  );
  const [completed, setCompleted] = useState<
    ReadonlySet<SecurityChallengeTaskId>
  >(() => new Set());
  const [correct, setCorrect] = useState<ReadonlySet<SecurityChallengeTaskId>>(
    () => new Set(),
  );
  const [stats, setStats] = useState<
    Record<SecurityChallengeTaskId, TaskStats>
  >(() => emptyStats());
  const [resetEpoch, setResetEpoch] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);

  const completeTask = useCallback(
    (
      id: SecurityChallengeTaskId,
      result: {
        correct: boolean;
        points: number;
        answerSummary: string;
      },
    ) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setCorrect((prev) => {
        const next = new Set(prev);
        if (result.correct) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
      setStats((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          correct: result.correct,
          pointsEarned: result.points,
          lastAnswerSummary: result.answerSummary,
        },
      }));
    },
    [],
  );

  const recordAttempt = useCallback((id: SecurityChallengeTaskId) => {
    setStats((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        attempts: prev[id].attempts + 1,
      },
    }));
  }, []);

  const revealHint = useCallback((id: SecurityChallengeTaskId) => {
    setStats((prev) => {
      const current = prev[id];
      if (current.hintRevealed) {
        return prev;
      }
      return {
        ...prev,
        [id]: {
          ...current,
          hintRevealed: true,
          hintsUsed: current.hintsUsed + 1,
        },
      };
    });
  }, []);

  const resetChallenge = useCallback(() => {
    setEnv(createInitialChallengeEnv());
    setCompleted(new Set());
    setCorrect(new Set());
    setStats(emptyStats());
    setResetEpoch((value) => value + 1);
    setReviewMode(false);
  }, []);

  const value = useMemo<ChallengeContextValue>(() => {
    const completedCount = completed.size;
    const correctCount = correct.size;
    const totalHintsUsed = Object.values(stats).reduce(
      (sum, item) => sum + item.hintsUsed,
      0,
    );
    const totalIncorrectAttempts = Object.values(stats).reduce((sum, item) => {
      if (item.correct) {
        return sum + Math.max(0, item.attempts - 1);
      }
      return sum + item.attempts;
    }, 0);
    const totalScore = Object.values(stats).reduce(
      (sum, item) => sum + item.pointsEarned,
      0,
    );

    return {
      env,
      setEnv,
      completed,
      correct,
      stats,
      completeTask,
      recordAttempt,
      revealHint,
      resetChallenge,
      resetEpoch,
      completedCount,
      correctCount,
      incorrectTaskCount: completedCount - correctCount,
      totalHintsUsed,
      totalIncorrectAttempts,
      percentComplete: Math.round(
        (completedCount / TOTAL_SECURITY_CHALLENGE_TASKS) * 100,
      ),
      totalScore,
      maxScore: MAX_SECURITY_CHALLENGE_SCORE,
      allComplete: completedCount >= TOTAL_SECURITY_CHALLENGE_TASKS,
      reviewMode,
      setReviewMode,
    };
  }, [
    env,
    completed,
    correct,
    stats,
    completeTask,
    recordAttempt,
    revealHint,
    resetChallenge,
    resetEpoch,
    reviewMode,
  ]);

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
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

function EvidencePanel({
  env,
  evidenceIds,
}: {
  env: SecurityChallengeEnvState;
  evidenceIds: readonly string[];
}) {
  const catalog = buildChallengeEvidence(env);
  const items = evidenceIds
    .map((id) => catalog[id])
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-foreground text-sm font-medium">
        Simulated evidence — {SECURITY_CHALLENGE_HOST}
      </p>
      {items.map((item) => (
        <div
          key={item.id}
          className="border-border bg-muted/20 overflow-hidden rounded-lg border"
        >
          <div className="border-border bg-muted/40 flex flex-wrap items-baseline justify-between gap-2 border-b px-3 py-2">
            <p className="text-foreground text-sm font-medium">{item.title}</p>
            <p className="text-muted-foreground font-mono text-xs">
              {item.command}
            </p>
          </div>
          <pre className="text-muted-foreground overflow-x-auto p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
            {item.output}
          </pre>
        </div>
      ))}
      <p className="text-muted-foreground text-xs">
        Fictional teaching output only. Nothing runs on your host.
      </p>
    </div>
  );
}

function summarizeAnswer(
  task: SecurityChallengeTask,
  selectedKeys: readonly string[],
  textAnswer: string,
  selectedRemediations: readonly string[],
): string {
  if (task.answerKind === "text") {
    return textAnswer.trim() || "(empty)";
  }
  if (task.answerKind === "remediation") {
    return selectedRemediations.join(", ") || "(none)";
  }
  return selectedKeys.join(", ") || "(none)";
}

function TaskWorkspace({ task }: { task: SecurityChallengeTask }) {
  const {
    env,
    setEnv,
    completed,
    stats,
    completeTask,
    recordAttempt,
    revealHint,
    reviewMode,
  } = useSecurityChallenge();

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedRemediations, setSelectedRemediations] = useState<string[]>(
    [],
  );
  const [feedback, setFeedback] = useState<{
    kind: "success" | "retry";
    message: string;
  } | null>(null);

  const isDone = completed.has(task.id);
  const taskStats = stats[task.id];
  const showReview = reviewMode && isDone;

  function toggleKey(key: string, multi: boolean) {
    if (isDone && !showReview) {
      return;
    }
    setFeedback(null);
    if (!multi) {
      setSelectedKeys([key]);
      return;
    }
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  }

  function toggleRemediation(id: string) {
    if (isDone && !showReview) {
      return;
    }
    setFeedback(null);
    setSelectedRemediations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function submit() {
    if (isDone) {
      return;
    }
    recordAttempt(task.id);
    const nextAttempts = taskStats.attempts + 1;
    const ctx = {
      selectedKeys,
      textAnswer,
      selectedRemediations,
      env,
    };
    const ok = validateTaskAnswer(task, ctx);
    const answerSummary = summarizeAnswer(
      task,
      selectedKeys,
      textAnswer,
      selectedRemediations,
    );

    if (ok) {
      // Only the final integrated scenario mutates the shared host posture.
      // Earlier categories validate remediation choices without changing final state.
      if (
        task.answerKind === "remediation" &&
        task.categoryId === "final-assessment"
      ) {
        setEnv(applyRemediations(env, selectedRemediations));
      }
      const points = scoreTaskAttempt({
        basePoints: task.basePoints,
        attemptsBeforeSuccess: nextAttempts,
        hintsUsed: taskStats.hintsUsed,
      });
      completeTask(task.id, {
        correct: true,
        points,
        answerSummary,
      });
      setFeedback({
        kind: "success",
        message: task.explanation,
      });
      return;
    }

    setFeedback({
      kind: "retry",
      message:
        nextAttempts >= 2
          ? "Not quite. Re-check the simulated evidence carefully — or use Show hint if you are stuck."
          : "Not quite. Re-check the evidence and the security principle involved, then try again.",
    });
  }

  return (
    <div className="border-border space-y-4 rounded-lg border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-foreground font-medium">{task.title}</p>
          <p className="text-muted-foreground mt-1 text-xs tracking-wide uppercase">
            {task.difficulty} · {task.basePoints} pts · {task.categoryId}
          </p>
        </div>
        <span
          className={cn(
            "font-mono text-xs tracking-wide uppercase",
            isDone
              ? taskStats.correct
                ? "text-primary"
                : "text-destructive"
              : "text-muted-foreground",
          )}
        >
          {isDone ? (taskStats.correct ? "Correct" : "Completed") : "Open"}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Scenario: </span>
          {task.scenario}
        </p>
        <p>
          <span className="font-medium">Instructions: </span>
          {task.instructions}
        </p>
        <p className="text-muted-foreground font-mono text-xs tabular-nums">
          Attempts: {taskStats.attempts} · Hints: {taskStats.hintsUsed}
          {isDone ? ` · Points: ${taskStats.pointsEarned}` : null}
        </p>
      </div>

      <EvidencePanel env={env} evidenceIds={task.evidenceIds} />

      {task.answerKind === "text" ? (
        <div className="space-y-2">
          <label
            htmlFor={`answer-${task.id}`}
            className="text-foreground text-sm font-medium"
          >
            Your answer
          </label>
          <input
            id={`answer-${task.id}`}
            type="text"
            value={textAnswer}
            disabled={isDone && !showReview}
            onChange={(event) => {
              setTextAnswer(event.target.value);
              setFeedback(null);
            }}
            className="border-border bg-background focus-visible:ring-ring w-full rounded-lg border px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      ) : null}

      {task.answerKind === "single-choice" ||
      task.answerKind === "multi-choice" ? (
        <div className="space-y-3">
          <p className="text-foreground text-sm font-medium">
            {task.answerKind === "multi-choice"
              ? "Select all that apply"
              : "Choose one answer"}
          </p>
          <ul className="space-y-2">
            {(task.options ?? []).map((option) => {
              const isSelected = selectedKeys.includes(option.key);
              return (
                <li key={option.key}>
                  <button
                    type="button"
                    disabled={isDone && !showReview}
                    onClick={() =>
                      toggleKey(option.key, task.answerKind === "multi-choice")
                    }
                    className={cn(
                      "border-border bg-background hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                      isSelected && "border-primary/50 bg-primary/5",
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

      {task.answerKind === "remediation" ? (
        <div className="space-y-3">
          <p className="text-foreground text-sm font-medium">
            Select remediation action(s)
          </p>
          <ul className="space-y-2">
            {(task.remediationActions ?? []).map((action) => {
              const isSelected = selectedRemediations.includes(action.id);
              return (
                <li key={action.id}>
                  <button
                    type="button"
                    disabled={isDone && !showReview}
                    onClick={() => toggleRemediation(action.id)}
                    className={cn(
                      "border-border bg-background hover:bg-muted/40 flex w-full flex-col gap-1 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                      isSelected && "border-primary/50 bg-primary/5",
                    )}
                  >
                    <span className="font-medium">{action.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {action.description}
                    </span>
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
          disabled={
            isDone ||
            (task.answerKind === "text" && !textAnswer.trim()) ||
            ((task.answerKind === "single-choice" ||
              task.answerKind === "multi-choice") &&
              selectedKeys.length === 0) ||
            (task.answerKind === "remediation" &&
              selectedRemediations.length === 0)
          }
          onClick={submit}
        >
          Submit answer
        </Button>
        {!taskStats.hintRevealed && !isDone ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => revealHint(task.id)}
          >
            Show hint
          </Button>
        ) : null}
      </div>

      {taskStats.hintRevealed ? (
        <Callout title="Hint">
          <p>{task.hint}</p>
        </Callout>
      ) : null}

      {feedback ? (
        <Callout title={feedback.kind === "success" ? "Correct" : "Try again"}>
          <p>
            {feedback.kind === "success" ? "✓ " : null}
            {feedback.message}
          </p>
        </Callout>
      ) : null}

      {showReview ? (
        <Callout title="Review">
          <p className="mb-2">{task.explanation}</p>
          <p className="text-muted-foreground text-sm">
            Your answer: {taskStats.lastAnswerSummary ?? "(none)"}
          </p>
          {task.correctKeys ? (
            <p className="text-muted-foreground text-sm">
              Expected keys: {task.correctKeys.join(", ")}
            </p>
          ) : null}
          {task.acceptedAnswers ? (
            <p className="text-muted-foreground text-sm">
              Accepted answers: {task.acceptedAnswers.join(" · ")}
            </p>
          ) : null}
          {task.correctRemediationIds ? (
            <p className="text-muted-foreground text-sm">
              Expected remediations: {task.correctRemediationIds.join(", ")}
            </p>
          ) : null}
        </Callout>
      ) : null}
    </div>
  );
}

export function LinuxSecurityChallengeProgress() {
  const {
    completedCount,
    percentComplete,
    totalScore,
    maxScore,
    correctCount,
    totalHintsUsed,
  } = useSecurityChallenge();

  return (
    <div className="space-y-4">
      <ProgressMeter
        label="Challenge progress"
        completedCount={completedCount}
        total={TOTAL_SECURITY_CHALLENGE_TASKS}
        percent={percentComplete}
      />
      <dl className="grid gap-3 sm:grid-cols-4">
        <div className="border-border rounded-lg border p-3">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">
            Score
          </dt>
          <dd className="text-foreground mt-1 font-mono text-lg tabular-nums">
            {totalScore}/{maxScore}
          </dd>
        </div>
        <div className="border-border rounded-lg border p-3">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">
            Correct
          </dt>
          <dd className="text-foreground mt-1 font-mono text-lg tabular-nums">
            {correctCount}
          </dd>
        </div>
        <div className="border-border rounded-lg border p-3">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">
            Hints used
          </dt>
          <dd className="text-foreground mt-1 font-mono text-lg tabular-nums">
            {totalHintsUsed}
          </dd>
        </div>
        <div className="border-border rounded-lg border p-3">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">
            Session only
          </dt>
          <dd className="text-foreground mt-1 text-sm">Refresh resets</dd>
        </div>
      </dl>
      <Callout title="Scoring">
        <p>
          First correct attempt awards full task points. Correct after a retry
          awards {Math.round(SECURITY_CHALLENGE_SCORING.retryMultiplier * 100)}%
          of base. Each hint reduces the multiplier by{" "}
          {Math.round(SECURITY_CHALLENGE_SCORING.hintPenaltyFraction * 100)}%
          (floor {Math.round(SECURITY_CHALLENGE_SCORING.minMultiplier * 100)}%).
          Incorrect submissions earn no points for that attempt. Progress is not
          saved outside this page session.
        </p>
      </Callout>
    </div>
  );
}

export function LinuxSecurityChallengeCategory({
  categoryId,
}: {
  categoryId: SecurityChallengeCategoryId;
}) {
  const { completed, resetEpoch, categoryProgress } =
    useCategoryProgress(categoryId);
  const category = getSecurityChallengeCategory(categoryId);
  const tasks = getTasksForSecurityCategory(categoryId);
  const [activeIndex, setActiveIndex] = useState(0);
  const requiresSequence = categoryId === "final-assessment";

  if (!category) {
    return null;
  }

  function isTaskUnlocked(index: number): boolean {
    if (!requiresSequence || index <= 0) {
      return true;
    }
    return tasks.slice(0, index).every((task) => completed.has(task.id));
  }

  const safeIndex = Math.min(activeIndex, Math.max(tasks.length - 1, 0));
  const activeTask = tasks[safeIndex];
  const nextUnlocked =
    safeIndex < tasks.length - 1 && isTaskUnlocked(safeIndex + 1);

  return (
    <div key={`${categoryId}-${resetEpoch}`} className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-muted-foreground text-sm">{category.description}</p>
        <p className="text-muted-foreground font-mono text-xs tabular-nums">
          {categoryProgress.done}/{categoryProgress.total} in category
        </p>
      </div>

      {requiresSequence ? (
        <p className="text-muted-foreground text-xs">
          Complete these final tasks in order — later steps depend on the shared
          fictional host state from earlier remediations.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {tasks.map((task, index) => {
          const done = completed.has(task.id);
          const unlocked = isTaskUnlocked(index);
          return (
            <Button
              key={task.id}
              type="button"
              size="sm"
              variant={index === safeIndex ? "default" : "outline"}
              disabled={!unlocked}
              aria-disabled={!unlocked}
              title={
                unlocked
                  ? undefined
                  : "Complete the previous final-assessment task first"
              }
              onClick={() => {
                if (unlocked) {
                  setActiveIndex(index);
                }
              }}
            >
              {index + 1}
              {done ? " ✓" : ""}
            </Button>
          );
        })}
      </div>

      {activeTask ? (
        <TaskWorkspace key={activeTask.id} task={activeTask} />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={safeIndex <= 0}
          onClick={() => setActiveIndex((value) => Math.max(0, value - 1))}
        >
          Previous task
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!nextUnlocked}
          onClick={() =>
            setActiveIndex((value) => Math.min(tasks.length - 1, value + 1))
          }
        >
          Next task
        </Button>
      </div>
    </div>
  );
}

function useCategoryProgress(categoryId: SecurityChallengeCategoryId) {
  const { completed, resetEpoch } = useSecurityChallenge();
  const category = getSecurityChallengeCategory(categoryId);
  const total = category?.taskIds.length ?? 0;
  const done = category?.taskIds.filter((id) => completed.has(id)).length ?? 0;
  return {
    completed,
    resetEpoch,
    categoryProgress: { done, total },
  };
}

export function LinuxSecurityChallengeSummary() {
  const {
    completed,
    correct,
    completedCount,
    correctCount,
    percentComplete,
    totalScore,
    maxScore,
    totalHintsUsed,
    totalIncorrectAttempts,
    allComplete,
    stats,
    reviewMode,
    setReviewMode,
    resetChallenge,
  } = useSecurityChallenge();

  const [confirmReset, setConfirmReset] = useState(false);

  const categoryRows = SECURITY_CHALLENGE_CATEGORIES.map((category) => {
    const total = category.taskIds.length;
    const done = category.taskIds.filter((id) => completed.has(id)).length;
    const correctInCategory = category.taskIds.filter((id) =>
      correct.has(id),
    ).length;
    const points = category.taskIds.reduce(
      (sum, id) => sum + stats[id].pointsEarned,
      0,
    );
    const maxPoints = category.taskIds.reduce(
      (sum, id) => sum + SECURITY_CHALLENGE_TASKS[id].basePoints,
      0,
    );
    return {
      category,
      total,
      done,
      correctInCategory,
      points,
      maxPoints,
      ratio: maxPoints === 0 ? 0 : points / maxPoints,
    };
  });

  const strongest = [...categoryRows]
    .filter((row) => row.done === row.total && row.total > 0)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 3);
  const weakest = [...categoryRows]
    .filter(
      (row) =>
        row.ratio < 1 && (row.done > 0 || (allComplete && row.total > 0)),
    )
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, 3);

  const reviewTasks = Object.values(SECURITY_CHALLENGE_TASKS).filter((task) => {
    if (!completed.has(task.id)) {
      // Mid-run: avoid flooding the list with every unfinished task.
      return allComplete;
    }
    const item = stats[task.id];
    return !item.correct || taskNeedsReview(item.attempts, item.hintsUsed);
  });

  const finalCorrect = [
    "final-1",
    "final-2",
    "final-3",
    "final-4",
    "final-5",
    "final-6",
  ].every((id) => correct.has(id as SecurityChallengeTaskId));

  return (
    <div className="space-y-4">
      <ProgressMeter
        label="Overall completion"
        completedCount={completedCount}
        total={TOTAL_SECURITY_CHALLENGE_TASKS}
        percent={percentComplete}
      />

      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-border rounded-lg border p-3">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">
            Final score
          </dt>
          <dd className="text-foreground mt-1 font-mono text-lg tabular-nums">
            {totalScore}/{maxScore}
          </dd>
        </div>
        <div className="border-border rounded-lg border p-3">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">
            Correct tasks
          </dt>
          <dd className="text-foreground mt-1 font-mono text-lg tabular-nums">
            {correctCount}/{TOTAL_SECURITY_CHALLENGE_TASKS}
          </dd>
        </div>
        <div className="border-border rounded-lg border p-3">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">
            Incorrect attempts
          </dt>
          <dd className="text-foreground mt-1 font-mono text-lg tabular-nums">
            {totalIncorrectAttempts}
          </dd>
        </div>
        <div className="border-border rounded-lg border p-3">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">
            Hints used
          </dt>
          <dd className="text-foreground mt-1 font-mono text-lg tabular-nums">
            {totalHintsUsed}
          </dd>
        </div>
      </dl>

      <div className="border-border overflow-hidden rounded-lg border">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Category performance</caption>
          <thead className="bg-muted/40 text-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Progress</th>
              <th className="px-3 py-2 font-medium">Correct</th>
              <th className="px-3 py-2 font-medium">Points</th>
            </tr>
          </thead>
          <tbody>
            {categoryRows.map((row) => (
              <tr key={row.category.id} className="border-border border-t">
                <td className="text-foreground px-3 py-2">
                  {row.category.number}. {row.category.title}
                </td>
                <td className="text-muted-foreground px-3 py-2 font-mono tabular-nums">
                  {row.done}/{row.total}
                </td>
                <td className="text-muted-foreground px-3 py-2 font-mono tabular-nums">
                  {row.correctInCategory}
                </td>
                <td className="text-muted-foreground px-3 py-2 font-mono tabular-nums">
                  {row.points}/{row.maxPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {allComplete ? (
        <Callout title="Linux Security Challenge completed">
          <p>
            You assessed the fictional host {SECURITY_CHALLENGE_HOST} across
            Stage 04 security topics. Score {totalScore} of {maxScore} (
            {correctCount}/{TOTAL_SECURITY_CHALLENGE_TASKS} tasks correct ·{" "}
            {percentComplete}% complete
            {totalIncorrectAttempts > 0
              ? ` · ${totalIncorrectAttempts} incorrect attempt${totalIncorrectAttempts === 1 ? "" : "s"}`
              : ""}
            ). This is a learning exercise — not a certification.
          </p>
          <p className="mt-2">
            Final integrated assessment:{" "}
            {finalCorrect
              ? "all final scenario tasks answered correctly."
              : "review the final scenario tasks — at least one still needs attention."}
          </p>
          {strongest.length > 0 ? (
            <p className="mt-2">
              Strongest areas:{" "}
              {strongest.map((row) => row.category.title).join("; ")}.
            </p>
          ) : null}
          {weakest.length > 0 ? (
            <p className="mt-2">
              Areas to improve:{" "}
              {weakest.map((row, index) => (
                <span key={row.category.id}>
                  {index > 0 ? "; " : null}
                  <Link
                    href={row.category.reviewHref}
                    className="text-primary font-medium underline-offset-2 hover:underline"
                  >
                    {row.category.reviewLabel}
                  </Link>
                </span>
              ))}
              .
            </p>
          ) : null}
        </Callout>
      ) : (
        <Callout title="Keep assessing">
          <p>
            {TOTAL_SECURITY_CHALLENGE_TASKS - completedCount} task
            {TOTAL_SECURITY_CHALLENGE_TASKS - completedCount === 1
              ? ""
              : "s"}{" "}
            remain. Work category by category — evidence and remediations share
            one fictional host for the final scenario. Progress resets if you
            refresh.
          </p>
        </Callout>
      )}

      {reviewTasks.length > 0 ? (
        <div className="border-border space-y-2 rounded-lg border p-4">
          <p className="text-foreground text-sm font-medium">
            Tasks that need review
          </p>
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
            {reviewTasks.slice(0, 12).map((task) => (
              <li key={task.id}>
                {task.title}
                {!completed.has(task.id)
                  ? " (incomplete)"
                  : !stats[task.id].correct
                    ? " (incorrect)"
                    : " (hints/retries)"}
              </li>
            ))}
          </ul>
          {reviewTasks.length > 12 ? (
            <p className="text-muted-foreground text-xs">
              +{reviewTasks.length - 12} more
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setReviewMode(!reviewMode)}
        >
          {reviewMode ? "Hide review details" : "Open review mode"}
        </Button>
        {!confirmReset ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmReset(true)}
          >
            Reset challenge
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                resetChallenge();
                setConfirmReset(false);
              }}
            >
              Confirm reset
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmReset(false)}
            >
              Cancel
            </Button>
          </>
        )}
      </div>

      {reviewMode ? (
        <Callout title="Review mode">
          <p>
            Completed tasks now show explanations and expected answers when you
            reopen them in each category section above. Remediations already
            applied remain in the shared session environment until you reset.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
