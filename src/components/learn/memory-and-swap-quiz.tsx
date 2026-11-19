"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuizQuestion = {
  id: string;
  prompt: string;
  options: readonly { key: string; label: string }[];
  correct: string;
  explanation: string;
};

const MID_LESSON_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "m1",
    prompt:
      "On Linux, 'free' memory is very low but 'available' is high. What does this mean?",
    options: [
      {
        key: "A",
        label:
          "It is normal — Linux fills spare RAM with reclaimable page cache; available reflects real headroom",
      },
      {
        key: "B",
        label: "The system is about to crash due to out-of-memory conditions",
      },
      {
        key: "C",
        label: "Available and free are identical fields with different names",
      },
      {
        key: "D",
        label:
          "Free memory is the only reliable metric and available should be ignored",
      },
    ],
    correct: "A",
    explanation:
      "Linux aggressively uses spare RAM for page cache (normal behavior). The 'available' metric (MemAvailable in /proc/meminfo) is the correct indicator of real headroom.",
  },
  {
    id: "m2",
    prompt: "What is the difference between RSS and VSZ for a process?",
    options: [
      {
        key: "A",
        label:
          "RSS is the physical memory the process currently occupies in RAM; VSZ is total virtual address space (much larger, includes not-yet-loaded pages)",
      },
      {
        key: "B",
        label: "VSZ is always identical to RSS",
      },
      {
        key: "C",
        label: "RSS measures disk usage; VSZ measures network usage",
      },
      {
        key: "D",
        label: "Both metrics only appear in /proc/meminfo",
      },
    ],
    correct: "A",
    explanation:
      "RSS (Resident Set Size) = pages actually in RAM. VSZ (Virtual Size) = full virtual address space. High VSZ with modest RSS is normal for processes that map large areas but only use a fraction.",
  },
  {
    id: "m3",
    prompt: "What do si and so mean in vmstat output?",
    options: [
      {
        key: "A",
        label:
          "si = pages swapped in from disk per second; so = pages swapped out to disk per second",
      },
      {
        key: "B",
        label: "si = CPU system time; so = CPU softirq time",
      },
      {
        key: "C",
        label: "si = socket connections in; so = socket connections out",
      },
      {
        key: "D",
        label: "si and so only appear in /proc/meminfo",
      },
    ],
    correct: "A",
    explanation:
      "In vmstat swap columns: si (swap-in) = pages fetched from swap device back to RAM per second; so (swap-out) = pages moved from RAM to swap device per second. High values = active thrashing.",
  },
  {
    id: "m4",
    prompt: "What does buff/cache represent in `free -h` output?",
    options: [
      {
        key: "A",
        label:
          "Kernel buffer cache (block I/O metadata) plus page cache (file data) — both are largely reclaimable",
      },
      {
        key: "B",
        label: "Exclusively CPU cache (L1/L2/L3) — unrelated to RAM",
      },
      {
        key: "C",
        label: "Network socket buffers that cannot be reclaimed",
      },
      {
        key: "D",
        label: "Swap space that is currently allocated",
      },
    ],
    correct: "A",
    explanation:
      "buff/cache = buffers (block device metadata) + cached (page cache / file data). Both are reclaimable by the kernel to satisfy application demand, so they don't count against 'available'.",
  },
] as const;

const FINAL_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt:
      "Which metric best indicates whether a Linux system actually has memory pressure?",
    options: [
      {
        key: "A",
        label:
          "MemAvailable — it accounts for free plus reclaimable cache, unlike MemFree alone",
      },
      {
        key: "B",
        label: "MemFree only — it is the only accurate measure",
      },
      {
        key: "C",
        label: "SwapTotal — available swap is the primary indicator",
      },
      {
        key: "D",
        label: "Load average — if it is above 1.0, memory must be low",
      },
    ],
    correct: "A",
    explanation:
      "MemAvailable (from /proc/meminfo, also shown by free) is the most useful indicator. It includes free plus reclaimable cache, so a healthy cache-heavy system still shows high available.",
  },
  {
    id: "q2",
    prompt: "Why does Linux fill free RAM with page cache?",
    options: [
      {
        key: "A",
        label:
          "Idle RAM is wasted RAM — caching file data speeds future reads and is reclaimable when apps need the pages",
      },
      {
        key: "B",
        label: "It is a bug that administrators should disable",
      },
      {
        key: "C",
        label: "Page cache is permanent and can never be reclaimed",
      },
      {
        key: "D",
        label: "Linux only caches data that is currently locked in RAM",
      },
    ],
    correct: "A",
    explanation:
      "Linux uses idle RAM as a disk cache (page cache). This speeds up repeated file access. Because it is reclaimable, it does not cause memory pressure — it is a performance feature, not a problem.",
  },
  {
    id: "q3",
    prompt: "What is a major page fault versus a minor page fault?",
    options: [
      {
        key: "A",
        label:
          "Major fault = page not in RAM, requires disk read (slow); minor fault = page in RAM or can be mapped without disk I/O (fast)",
      },
      {
        key: "B",
        label: "Minor faults always involve swap; major faults never do",
      },
      {
        key: "C",
        label: "Both types require disk reads",
      },
      {
        key: "D",
        label: "Major faults are related to CPU frequency scaling",
      },
    ],
    correct: "A",
    explanation:
      "Major faults require reading a page from disk (or swap), which adds latency. Minor faults are resolved in-kernel without disk I/O. Elevated major fault rates under memory pressure explain latency spikes.",
  },
  {
    id: "q4",
    prompt:
      "Active swapping (high si/so) versus swap just being allocated (low si/so) — which is the problem?",
    options: [
      {
        key: "A",
        label:
          "High si/so = active thrashing with disk latency; low si/so with swap in use = prior allocation, not current thrashing",
      },
      {
        key: "B",
        label: "Any swap usage at all means active thrashing",
      },
      {
        key: "C",
        label: "si/so rates are unrelated to actual swap activity",
      },
      {
        key: "D",
        label: "High so with zero si can never happen",
      },
    ],
    correct: "A",
    explanation:
      "Swap can be non-zero from earlier activity with no current I/O (si=0, so=0). The key signals are si/so rates — high values mean the kernel is constantly paging between RAM and disk right now.",
  },
  {
    id: "q5",
    prompt: "How do you distinguish a memory leak from temporary high usage?",
    options: [
      {
        key: "A",
        label:
          "A leak shows monotonically increasing RSS that never decreases after workload cycles; temporary usage returns to baseline",
      },
      {
        key: "B",
        label: "Any RSS above 1 GiB is a memory leak by definition",
      },
      {
        key: "C",
        label: "Memory leaks only affect swap, not physical RSS",
      },
      {
        key: "D",
        label: "Temporary usage and memory leaks look identical in all metrics",
      },
    ],
    correct: "A",
    explanation:
      "Track RSS trend over time (minutes to hours). A leak grows continuously without release. Restarting the process and comparing baseline RSS confirms the leak if it resumes growing.",
  },
  {
    id: "q6",
    prompt: "When does the OOM killer trigger?",
    options: [
      {
        key: "A",
        label:
          "When both physical RAM and swap are exhausted and the kernel cannot satisfy a pending allocation after trying reclaim",
      },
      {
        key: "B",
        label: "When available memory falls below 50%",
      },
      {
        key: "C",
        label: "Every time swap usage exceeds 1 GiB",
      },
      {
        key: "D",
        label: "When CPU utilization exceeds 90% for 60 seconds",
      },
    ],
    correct: "A",
    explanation:
      "The OOM killer is a last resort. It fires only when reclaim and swap are both exhausted and an allocation cannot be satisfied. It selects a process by oom_score to terminate.",
  },
  {
    id: "q7",
    prompt: "What does swappiness control?",
    options: [
      {
        key: "A",
        label:
          "How aggressively the kernel prefers swapping anonymous pages vs. reclaiming page cache (0=prefer cache reclaim; 100=prefer swap)",
      },
      {
        key: "B",
        label: "The maximum size of the swap partition",
      },
      {
        key: "C",
        label: "Whether the OOM killer is enabled or disabled",
      },
      {
        key: "D",
        label: "The speed of I/O operations on the swap device",
      },
    ],
    correct: "A",
    explanation:
      "vm.swappiness (sysctl) controls the balance: low values prefer reclaiming page cache before moving anonymous memory to swap; high values swap more aggressively. Default is 60 on most distributions.",
  },
  {
    id: "q8",
    prompt:
      "Which tool shows MemAvailable, Buffers, Cached, SwapFree, and si/so in one pass?",
    options: [
      {
        key: "A",
        label:
          "cat /proc/meminfo for detailed fields; free -h for summary; vmstat for si/so; ps aux for per-process RSS",
      },
      {
        key: "B",
        label: "Only echo and clear",
      },
      {
        key: "C",
        label: "Only firewall listing commands",
      },
      {
        key: "D",
        label: "lscpu provides all memory metrics",
      },
    ],
    correct: "A",
    explanation:
      "No single command covers everything. /proc/meminfo has the most detail; free -h gives the quick summary; vmstat covers swap I/O rates; ps aux --sort=-%mem shows top consumers.",
  },
  {
    id: "q9",
    prompt:
      "High RSS does not necessarily mean a problem. When is it a concern?",
    options: [
      {
        key: "A",
        label:
          "When total RSS across processes exceeds available memory, causing the kernel to reclaim aggressively or start swapping",
      },
      {
        key: "B",
        label:
          "Any process above 500 MiB RSS is immediately a critical problem",
      },
      {
        key: "C",
        label: "RSS never causes any performance impact on modern servers",
      },
      {
        key: "D",
        label: "RSS is only concerning when VSZ is also high",
      },
    ],
    correct: "A",
    explanation:
      "High RSS is healthy when the system has sufficient available memory. It becomes a concern when aggregate demand exhausts available pages, forcing reclaim, major faults, and swap activity.",
  },
  {
    id: "q10",
    prompt:
      "A server has free=50 MiB, cached=5000 MiB, available=4800 MiB, si=0, so=0. What is the correct diagnosis?",
    options: [
      {
        key: "A",
        label:
          "Healthy — large page cache with high available. No swap activity. Free being low is normal Linux caching behavior.",
      },
      {
        key: "B",
        label: "Critical — free=50 MiB requires immediate emergency response",
      },
      {
        key: "C",
        label: "Warning — cached=5000 MiB means the disk is saturated",
      },
      {
        key: "D",
        label: "Unknown — it is impossible to diagnose without lscpu output",
      },
    ],
    correct: "A",
    explanation:
      "High cached + high available + zero si/so = healthy Linux memory picture. The kernel has used spare RAM productively as disk cache. This is the classic 'free looks low but available is fine' pattern.",
  },
] as const;

function renderLabel(label: string) {
  const parts = label.split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function QuizBlock({
  title,
  description,
  questions,
}: {
  title: string;
  description: string;
  questions: readonly QuizQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.every((q) => answers[q.id]);
  const score = questions.filter((q) => answers[q.id] === q.correct).length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <ol className="space-y-6">
        {questions.map((question, index) => {
          const selected = answers[question.id];
          const isCorrect = selected === question.correct;

          return (
            <li key={question.id} className="space-y-3">
              <p className="text-foreground font-medium">
                Question {index + 1}. {renderLabel(question.prompt)}
              </p>
              <ul className="space-y-2">
                {question.options.map((option) => {
                  const isSelected = selected === option.key;
                  const showResult = submitted && isSelected;
                  return (
                    <li key={option.key}>
                      <button
                        type="button"
                        disabled={submitted}
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: option.key,
                          }))
                        }
                        className={cn(
                          "border-border bg-background hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                          isSelected &&
                            !submitted &&
                            "border-primary/50 bg-primary/5",
                          showResult &&
                            isCorrect &&
                            "border-green-600/40 bg-green-500/10",
                          showResult &&
                            !isCorrect &&
                            "border-destructive/40 bg-destructive/10",
                          submitted && "cursor-default",
                        )}
                      >
                        <span className="text-muted-foreground font-mono text-xs font-medium">
                          {option.key}.
                        </span>
                        <span>{renderLabel(option.label)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {submitted ? (
                <div className="space-y-1 text-sm">
                  {!isCorrect ? (
                    <p className="text-muted-foreground">
                      Correct answer:{" "}
                      <span className="text-foreground font-medium">
                        {question.correct}
                      </span>
                    </p>
                  ) : null}
                  <p className="text-muted-foreground">
                    {question.explanation}
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap gap-2">
        {!submitted ? (
          <Button
            type="button"
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
          >
            Check answers
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
          >
            Try again
          </Button>
        )}
      </div>

      {submitted ? (
        <Callout
          title={
            score === questions.length
              ? "Perfect score"
              : `Score: ${score} / ${questions.length}`
          }
        >
          <p>
            {score === questions.length
              ? "You can correctly interpret free vs. available, buffers/cache, RSS vs. VSZ, si/so, memory pressure, and OOM conditions."
              : "Review free vs. available memory, page cache behavior, RSS vs. VSZ, si/so rates, major page faults, and OOM triggers — then try again."}
          </p>
        </Callout>
      ) : null}
    </div>
  );
}

export function MemoryAndSwapKnowledgeCheck() {
  return (
    <QuizBlock
      title="Quick knowledge check"
      description="Four short questions on memory fundamentals and key terms. Selections stay on this page only."
      questions={MID_LESSON_QUESTIONS}
    />
  );
}

export function MemoryAndSwapQuiz() {
  return (
    <QuizBlock
      title="Knowledge check"
      description="Choose the best answer for each question. Explanations appear after you check. Nothing is saved."
      questions={FINAL_QUESTIONS}
    />
  );
}
