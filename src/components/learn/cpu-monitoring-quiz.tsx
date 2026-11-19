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
    prompt: "What is the difference between physical cores and logical CPUs?",
    options: [
      {
        key: "A",
        label:
          "Physical cores are hardware execution units; logical CPUs are what the OS schedules (often more when SMT/hyper-threading is enabled)",
      },
      {
        key: "B",
        label: "Logical CPUs are always fewer than physical cores",
      },
      {
        key: "C",
        label: "They are identical names for disk partitions",
      },
      {
        key: "D",
        label: "Physical cores only exist inside virtual machines",
      },
    ],
    correct: "A",
    explanation:
      "lscpu reports both. Scheduling and load average are interpreted against logical CPU count.",
  },
  {
    id: "m2",
    prompt: "User time (%us) versus system time (%sy) — which is accurate?",
    options: [
      {
        key: "A",
        label:
          "%us is application/user-space work; %sy is kernel/system work on behalf of processes",
      },
      {
        key: "B",
        label: "%us always means the disk is saturated",
      },
      {
        key: "C",
        label: "%sy is identical to idle time",
      },
      {
        key: "D",
        label: "Both fields measure only network packet loss",
      },
    ],
    correct: "A",
    explanation:
      "High %us suggests user-space compute; high %sy suggests kernel overhead (syscalls, networking stack work, etc.).",
  },
  {
    id: "m3",
    prompt: "What does elevated I/O wait (%wa) usually suggest?",
    options: [
      {
        key: "A",
        label:
          "CPUs are spending time waiting on storage I/O rather than only computing",
      },
      {
        key: "B",
        label: "The system has infinite free RAM by definition",
      },
      {
        key: "C",
        label: "Steal time must be zero forever",
      },
      {
        key: "D",
        label: "Load average cannot rise while %wa is high",
      },
    ],
    correct: "A",
    explanation:
      "High %wa with moderate busy compute often points toward disk/storage investigation.",
  },
] as const;

const FINAL_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt: "How should you interpret load average?",
    options: [
      {
        key: "A",
        label:
          "As demand over 1/5/15 minutes (runnable and often uninterruptible tasks), compared to logical CPU count — not as a synonym for CPU %",
      },
      {
        key: "B",
        label: "As a percentage that always equals %us",
      },
      {
        key: "C",
        label: "As free disk space in gigabytes",
      },
      {
        key: "D",
        label: "As the hostname string from lscpu",
      },
    ],
    correct: "A",
    explanation:
      "Load can be high from CPU run queues or from I/O-blocked tasks. Always pair with utilization breakdowns.",
  },
  {
    id: "q2",
    prompt: "What is CPU saturation?",
    options: [
      {
        key: "A",
        label:
          "Demand meets or exceeds CPU capacity — little idle time, often load above logical CPU count, growing queues",
      },
      {
        key: "B",
        label: "Any non-zero %us on an idle server",
      },
      {
        key: "C",
        label: "Only the presence of the nginx process",
      },
      {
        key: "D",
        label: "A filesystem mount option",
      },
    ],
    correct: "A",
    explanation:
      "Saturation means capacity is exhausted for CPU work. Confirm with idle, load, and runnable task evidence.",
  },
  {
    id: "q3",
    prompt: "CPU-bound versus I/O-bound — which pairing fits?",
    options: [
      {
        key: "A",
        label:
          "CPU-bound progress is limited by compute; I/O-bound progress is limited by waiting on storage (often high %wa)",
      },
      {
        key: "B",
        label: "I/O-bound workloads never appear in load average",
      },
      {
        key: "C",
        label: "CPU-bound workloads always show 0% user time",
      },
      {
        key: "D",
        label: "They are identical terms for steal time",
      },
    ],
    correct: "A",
    explanation:
      "Classify using %us/%sy/%wa, process states, and storage metrics — not a single number alone.",
  },
  {
    id: "q4",
    prompt: "Why can a single-threaded workload bottleneck a multi-core host?",
    options: [
      {
        key: "A",
        label:
          "It can saturate one logical CPU while other cores stay idle — aggregate utilization may look moderate",
      },
      {
        key: "B",
        label: "Single-threaded apps always use every core equally",
      },
      {
        key: "C",
        label: "Linux forbids more than one logical CPU",
      },
      {
        key: "D",
        label: "mpstat cannot show per-CPU lines",
      },
    ],
    correct: "A",
    explanation:
      "Use mpstat -P ALL (or similar) to spot imbalance that averages hide.",
  },
  {
    id: "q5",
    prompt: "Elevated CPU steal time (%st) on a VM usually means:",
    options: [
      {
        key: "A",
        label:
          "The hypervisor held CPU from the guest — the VM may not get the CPU time it requested",
      },
      {
        key: "B",
        label: "The guest disk filesystem is always full",
      },
      {
        key: "C",
        label: "Idle time and steal time are the same field",
      },
      {
        key: "D",
        label: "renice deletes the hypervisor",
      },
    ],
    correct: "A",
    explanation:
      "Steal is a virtualization scheduling signal. Investigate host oversubscription / noisy neighbors.",
  },
  {
    id: "q6",
    prompt: "What do nice and renice change?",
    options: [
      {
        key: "A",
        label:
          "Scheduling priority preference — they do not automatically fix the underlying performance problem",
      },
      {
        key: "B",
        label: "They permanently increase physical core count",
      },
      {
        key: "C",
        label: "They erase load average history from the kernel forever",
      },
      {
        key: "D",
        label: "They convert I/O wait into network bandwidth",
      },
    ],
    correct: "A",
    explanation:
      "Priority tweaks are tools, not diagnoses. Identify the bottleneck before relying on renice.",
  },
  {
    id: "q7",
    prompt:
      "High CPU utilization always means the system has a problem — true or false?",
    options: [
      {
        key: "A",
        label:
          "False — high utilization can be healthy for batch work; judge against latency, errors, and capacity goals",
      },
      {
        key: "B",
        label: "True — any %us above 10 requires an immediate reboot",
      },
      {
        key: "C",
        label: "True — utilization and performance are identical",
      },
      {
        key: "D",
        label: "False because CPU metrics never matter",
      },
    ],
    correct: "A",
    explanation:
      "Busy can be fine. Saturation plus rising latency is the concerning combination.",
  },
  {
    id: "q8",
    prompt:
      "Which command set is most useful for CPU monitoring in this lesson?",
    options: [
      {
        key: "A",
        label: "lscpu, top/htop, mpstat, uptime, ps, vmstat",
      },
      {
        key: "B",
        label: "Only `echo` and `clear`",
      },
      {
        key: "C",
        label: "Only package manager install commands",
      },
      {
        key: "D",
        label: "Only firewall rule listing",
      },
    ],
    correct: "A",
    explanation:
      "Those tools cover topology, utilization breakdowns, load, per-CPU views, and process inspection.",
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
              ? "You can read CPU breakdowns, load versus logical CPUs, saturation vs I/O wait, and process priority trade-offs."
              : "Review cores vs logical CPUs, %us/%sy/%wa/%st, load average, saturation, single-thread bottlenecks, and nice/renice — then try again."}
          </p>
        </Callout>
      ) : null}
    </div>
  );
}

export function CpuMonitoringKnowledgeCheck() {
  return (
    <QuizBlock
      title="Quick knowledge check"
      description="Three short questions on CPU architecture and utilization fields. Selections stay on this page only."
      questions={MID_LESSON_QUESTIONS}
    />
  );
}

export function CpuMonitoringQuiz() {
  return (
    <QuizBlock
      title="Knowledge check"
      description="Choose the best answer for each question. Explanations appear after you check. Nothing is saved."
      questions={FINAL_QUESTIONS}
    />
  );
}
