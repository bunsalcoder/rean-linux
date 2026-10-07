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
};

const QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt: "What does an IP address identify?",
    options: [
      { key: "A", label: "A network host/interface address" },
      { key: "B", label: "A Linux user" },
      { key: "C", label: "A filesystem" },
      { key: "D", label: "A process" },
    ],
    correct: "A",
  },
  {
    id: "q2",
    prompt: "What does a port identify?",
    options: [
      { key: "A", label: "A physical disk" },
      { key: "B", label: "A network service/application endpoint" },
      { key: "C", label: "A Linux user" },
      { key: "D", label: "A directory" },
    ],
    correct: "B",
  },
  {
    id: "q3",
    prompt: "What is the default gateway generally used for?",
    options: [
      { key: "A", label: "Reaching other networks" },
      { key: "B", label: "Creating files" },
      { key: "C", label: "Managing users" },
      { key: "D", label: "Starting services" },
    ],
    correct: "A",
  },
  {
    id: "q4",
    prompt: "What does DNS primarily do?",
    options: [
      { key: "A", label: "Maps names to IP addresses" },
      { key: "B", label: "Starts network interfaces" },
      { key: "C", label: "Formats disks" },
      { key: "D", label: "Creates firewall rules" },
    ],
    correct: "A",
  },
  {
    id: "q5",
    prompt: "Which command displays network interfaces?",
    options: [
      { key: "A", label: "`ip link`" },
      { key: "B", label: "`du -h`" },
      { key: "C", label: "`systemctl status`" },
      { key: "D", label: "`journalctl`" },
    ],
    correct: "A",
  },
  {
    id: "q6",
    prompt: "Which command is useful for viewing listening TCP/UDP sockets?",
    options: [
      { key: "A", label: "`ss -tuln`" },
      { key: "B", label: "`lsblk -f`" },
      { key: "C", label: "`chmod`" },
      { key: "D", label: "`find`" },
    ],
    correct: "A",
  },
  {
    id: "q7",
    prompt: "What does `/24` represent in `192.168.1.20/24`?",
    options: [
      { key: "A", label: "Port number" },
      { key: "B", label: "Network prefix length" },
      { key: "C", label: "Process ID" },
      { key: "D", label: "DNS server" },
    ],
    correct: "B",
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

export function NetworkingFundamentalsQuiz() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = QUESTIONS.every((q) => answers[q.id]);
  const score = QUESTIONS.filter((q) => answers[q.id] === q.correct).length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Knowledge Check
        </h3>
        <p className="text-muted-foreground text-sm">
          Choose the best answer for each question. Your selections stay on this
          page only — nothing is saved.
        </p>
      </div>

      <ol className="space-y-6">
        {QUESTIONS.map((question, index) => {
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
              {submitted && !isCorrect ? (
                <p className="text-muted-foreground text-sm">
                  Correct answer:{" "}
                  <span className="text-foreground font-medium">
                    {question.correct}
                  </span>
                </p>
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
            score === QUESTIONS.length
              ? "Perfect score"
              : `Score: ${score} / ${QUESTIONS.length}`
          }
        >
          <p>
            {score === QUESTIONS.length
              ? "You understand IP addresses, ports, gateways, DNS, prefixes, and the core inspection commands."
              : "Review Putting It Together, Ports, and Default Gateway, then try again."}
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
