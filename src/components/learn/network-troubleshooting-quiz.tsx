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
    prompt:
      "What should you usually check first in a network troubleshooting workflow?",
    options: [
      { key: "A", label: "Whether the interface is up (`ip link`)" },
      { key: "B", label: "Whether a web page loads in a browser" },
      { key: "C", label: "Whether package updates are available" },
      { key: "D", label: "Whether disk usage is high" },
    ],
    correct: "A",
  },
  {
    id: "q2",
    prompt:
      "An interface is UP, but `ip addr` shows no IPv4 address. What does that mean?",
    options: [
      { key: "A", label: "DNS is definitely broken" },
      { key: "B", label: "The host likely cannot communicate by IPv4 yet" },
      { key: "C", label: "SSH must be disabled" },
      { key: "D", label: "The default gateway is working" },
    ],
    correct: "B",
  },
  {
    id: "q3",
    prompt:
      "`ping 192.168.1.1` works, but `ping 8.8.8.8` fails. Which check is most relevant next?",
    options: [
      { key: "A", label: "`ip route` for a missing default route" },
      { key: "B", label: "`ss -tuln` for listening ports" },
      { key: "C", label: "`du -h` for disk usage" },
      { key: "D", label: "`systemctl status` for timers" },
    ],
    correct: "A",
  },
  {
    id: "q4",
    prompt:
      "`ping 8.8.8.8` works, but `getent hosts example.com` fails. What is the best conclusion?",
    options: [
      { key: "A", label: "The whole network is down" },
      { key: "B", label: "The interface has no MAC address" },
      {
        key: "C",
        label: "Basic IP connectivity works, but DNS resolution is failing",
      },
      { key: "D", label: "Port 80 must be closed" },
    ],
    correct: "C",
  },
  {
    id: "q5",
    prompt: "Why can a host be reachable by IP while a service still fails?",
    options: [
      {
        key: "A",
        label:
          "Because IP reachability does not guarantee a process is listening on the expected port",
      },
      { key: "B", label: "Because ping always checks application ports" },
      { key: "C", label: "Because DNS always proves the service is running" },
      { key: "D", label: "Because `ip link` shows application health" },
    ],
    correct: "A",
  },
  {
    id: "q6",
    prompt:
      "Which command helps confirm whether a service is listening on a TCP/UDP port?",
    options: [
      { key: "A", label: "`ss -tuln`" },
      { key: "B", label: "`ip link`" },
      { key: "C", label: "`du -sh /var`" },
      { key: "D", label: "`echo $HOME`" },
    ],
    correct: "A",
  },
  {
    id: "q7",
    prompt: "What should you do before changing network configuration?",
    options: [
      {
        key: "A",
        label:
          "Compare evidence from link, address, route, connectivity, DNS, and ports",
      },
      { key: "B", label: "Disable every interface immediately" },
      { key: "C", label: "Delete the default route first" },
      { key: "D", label: "Restart the machine without checking anything" },
    ],
    correct: "A",
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

export function NetworkTroubleshootingQuiz() {
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
              ? "You understand the diagnostic workflow and how common networking symptoms map to the next check."
              : "Review the troubleshooting checklist and the DNS versus connectivity section, then try again."}
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
