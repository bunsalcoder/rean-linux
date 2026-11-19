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
    prompt: "Performance versus utilization — which statement is accurate?",
    options: [
      {
        key: "A",
        label:
          "Utilization measures how busy a resource is; performance describes how well work meets user goals (latency, throughput, errors)",
      },
      {
        key: "B",
        label: "100% CPU utilization always means excellent performance",
      },
      {
        key: "C",
        label: "Utilization and performance are identical metrics",
      },
      {
        key: "D",
        label: "Low utilization always means the system is broken",
      },
    ],
    correct: "A",
    explanation:
      "A busy resource can still deliver good user outcomes, and a quiet CPU can coexist with slow responses when another layer is waiting.",
  },
  {
    id: "m2",
    prompt: "Latency versus throughput — which pairing is correct?",
    options: [
      {
        key: "A",
        label:
          "Latency is how long one request takes; throughput is how much work completes per unit time",
      },
      {
        key: "B",
        label: "Throughput is always measured in milliseconds per request",
      },
      {
        key: "C",
        label: "Latency only applies to disks; throughput only applies to CPUs",
      },
      {
        key: "D",
        label: "They are interchangeable names for CPU percentage",
      },
    ],
    correct: "A",
    explanation:
      "You can have high throughput with acceptable latency — or low latency for a tiny amount of work. Optimize for the goal that matters.",
  },
  {
    id: "m3",
    prompt: "Why can a system feel slow when CPU utilization is low?",
    options: [
      {
        key: "A",
        label:
          "Work may be waiting on memory, disk, network, locks, or remote dependencies instead of burning CPU cycles",
      },
      {
        key: "B",
        label: "Low CPU always means the kernel is corrupted",
      },
      {
        key: "C",
        label: "Linux cannot measure CPU under 50%",
      },
      {
        key: "D",
        label: "Idle time proves the application is healthy",
      },
    ],
    correct: "A",
    explanation:
      "CPU idle means processors are free — not that every other resource and dependency is healthy.",
  },
] as const;

const FINAL_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt: "How should you interpret CPU load average versus CPU utilization?",
    options: [
      {
        key: "A",
        label:
          "Load reflects runnable/blocked demand over time (read vs CPU count); utilization is how busy CPUs are right now — neither alone tells the full story",
      },
      {
        key: "B",
        label: "Load average is always a percentage of CPU",
      },
      {
        key: "C",
        label: "Utilization above 10% requires an immediate reboot",
      },
      {
        key: "D",
        label: "Load averages only measure free disk space",
      },
    ],
    correct: "A",
    explanation:
      "On a 4-CPU host, sustained load near 8 suggests more demand than cores can run promptly — combine with utilization and wait states.",
  },
  {
    id: "q2",
    prompt: "Available memory versus free memory — what should you prefer?",
    options: [
      {
        key: "A",
        label:
          "Prefer available — it accounts for reclaimable cache/buffers better than treating all “used” RAM as gone",
      },
      {
        key: "B",
        label: "Ignore available and treat every used byte as permanently lost",
      },
      {
        key: "C",
        label: "Free memory and disk free space are the same counter",
      },
      {
        key: "D",
        label: "Only swap free matters; RAM figures are decorative",
      },
    ],
    correct: "A",
    explanation:
      "Linux uses spare RAM for cache. Available is the better first answer to “how much can new workloads still get?”",
  },
  {
    id: "q3",
    prompt: "What does elevated I/O wait usually indicate?",
    options: [
      {
        key: "A",
        label:
          "CPUs are spending time waiting on storage rather than computing — investigate disk latency and saturation",
      },
      {
        key: "B",
        label: "The network interface was unplugged",
      },
      {
        key: "C",
        label: "Idle time is identical to I/O wait",
      },
      {
        key: "D",
        label: "The hostname is misconfigured",
      },
    ],
    correct: "A",
    explanation:
      "High iowait with moderate CPU utilization often accompanies storage bottlenecks — confirm with iostat await/%util.",
  },
  {
    id: "q4",
    prompt: "Why identify the bottleneck before optimizing?",
    options: [
      {
        key: "A",
        label:
          "Optimizing the wrong resource wastes effort and can hide the real constraint; evidence should guide changes",
      },
      {
        key: "B",
        label: "You should always add CPUs first regardless of metrics",
      },
      {
        key: "C",
        label: "Bottlenecks cannot be observed on Linux",
      },
      {
        key: "D",
        label: "Optimization never needs measurements",
      },
    ],
    correct: "A",
    explanation:
      "A memory-starved host will not improve from a CPU upgrade. Find the constrained resource first.",
  },
  {
    id: "q5",
    prompt: "Why establish a baseline before an incident?",
    options: [
      {
        key: "A",
        label:
          "Baselines show what “normal” looks like so unusual values stand out during troubleshooting",
      },
      {
        key: "B",
        label: "Baselines replace the need to collect any incident metrics",
      },
      {
        key: "C",
        label: "Baselines prove packet loss forever",
      },
      {
        key: "D",
        label: "Baselines are only for desktop wallpaper settings",
      },
    ],
    correct: "A",
    explanation:
      "Without a baseline, a load of 2.0 or 200 ms latency may look scary or fine for the wrong reasons.",
  },
  {
    id: "q6",
    prompt: "Why avoid changing many things at once while troubleshooting?",
    options: [
      {
        key: "A",
        label:
          "Multiple simultaneous changes make it hard to know which action helped, hurt, or did nothing",
      },
      {
        key: "B",
        label: "Linux forbids more than one configuration change per year",
      },
      {
        key: "C",
        label: "Metrics stop updating if you change only one setting",
      },
      {
        key: "D",
        label: "Baselines become permanent after two edits",
      },
    ],
    correct: "A",
    explanation:
      "Controlled, one-at-a-time improvements plus before/after measurements keep investigations scientific.",
  },
  {
    id: "q7",
    prompt:
      "Host CPU, memory, disk, and network look normal, but app response time is high. Best next move?",
    options: [
      {
        key: "A",
        label:
          "Investigate application behavior and dependencies instead of assuming a hardware resource bottleneck",
      },
      {
        key: "B",
        label: "Double RAM immediately without further evidence",
      },
      {
        key: "C",
        label: "Conclude the metrics are impossible and stop",
      },
      {
        key: "D",
        label: "Disable logging forever to improve latency",
      },
    ],
    correct: "A",
    explanation:
      "Healthy host metrics redirect the investigation to locks, queries, remote APIs, and application design.",
  },
  {
    id: "q8",
    prompt: "What is a resource bottleneck in performance troubleshooting?",
    options: [
      {
        key: "A",
        label:
          "The resource that is saturated or constrained enough to limit overall system progress",
      },
      {
        key: "B",
        label: "Any metric that is non-zero",
      },
      {
        key: "C",
        label: "Only the hostname field from uptime",
      },
      {
        key: "D",
        label: "A synonym for free disk space alone",
      },
    ],
    correct: "A",
    explanation:
      "The bottleneck is the limiting factor. Other resources may look busy or idle depending on how work queues behind that limit.",
  },
] as const;

function renderOptionLabel(label: string) {
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
                Question {index + 1}. {renderOptionLabel(question.prompt)}
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
                        <span>{renderOptionLabel(option.label)}</span>
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
              ? "You can separate utilization from user-facing performance, read core metrics carefully, and investigate before optimizing."
              : "Review performance vs utilization, latency vs throughput, load vs utilization, available memory, I/O wait, baselines, and bottleneck-first troubleshooting — then try again."}
          </p>
        </Callout>
      ) : null}
    </div>
  );
}

export function PerformanceFundamentalsKnowledgeCheck() {
  return (
    <QuizBlock
      title="Quick knowledge check"
      description="Three short questions on performance concepts. Selections stay on this page only."
      questions={MID_LESSON_QUESTIONS}
    />
  );
}

export function PerformanceFundamentalsQuiz() {
  return (
    <QuizBlock
      title="Knowledge check"
      description="Choose the best answer for each question. Explanations appear after you check. Nothing is saved."
      questions={FINAL_QUESTIONS}
    />
  );
}
