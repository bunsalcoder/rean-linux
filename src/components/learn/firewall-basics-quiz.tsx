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
    prompt: "What is inbound traffic on a Linux server?",
    options: [
      {
        key: "A",
        label: "Connections coming from other hosts into services on this host",
      },
      {
        key: "B",
        label: "Only traffic leaving this host toward the internet",
      },
      { key: "C", label: "Disk I/O inside the local filesystem" },
      { key: "D", label: "Kernel log messages written by journald" },
    ],
    correct: "A",
  },
  {
    id: "q2",
    prompt: "Which statement about ports and protocols is correct?",
    options: [
      {
        key: "A",
        label:
          "A port number plus a protocol (TCP or UDP) identifies how traffic should be matched",
      },
      {
        key: "B",
        label: "Port 80 always means UDP HTTP",
      },
      {
        key: "C",
        label: "Firewall rules ignore protocol and only use IP addresses",
      },
      {
        key: "D",
        label: "Listening services do not use ports",
      },
    ],
    correct: "A",
  },
  {
    id: "q3",
    prompt:
      "With default deny incoming and no matching allow rule, inbound traffic is:",
    options: [
      { key: "A", label: "Blocked by the default policy" },
      { key: "B", label: "Always allowed" },
      { key: "C", label: "Converted from TCP to UDP automatically" },
      { key: "D", label: "Ignored by UFW even when the firewall is active" },
    ],
    correct: "A",
  },
  {
    id: "q4",
    prompt:
      "An explicit allow rule for 80/tcp with default deny incoming means:",
    options: [
      {
        key: "A",
        label:
          "Inbound TCP 80 is permitted; other unmatched inbound ports still follow the default",
      },
      {
        key: "B",
        label: "Every inbound port becomes allowed",
      },
      {
        key: "C",
        label: "Outbound traffic to port 80 is denied",
      },
      {
        key: "D",
        label: "nginx starts automatically",
      },
    ],
    correct: "A",
  },
  {
    id: "q5",
    prompt:
      "Firewall allows 80/tcp, but `ss -tuln` shows no listener on port 80. What happens?",
    options: [
      {
        key: "A",
        label:
          "Clients still fail — an allowed port is not enough without a listening service",
      },
      {
        key: "B",
        label: "HTTP always succeeds because the firewall allowed the port",
      },
      {
        key: "C",
        label: "UFW automatically starts nginx",
      },
      {
        key: "D",
        label: "Default outgoing deny is the only possible cause",
      },
    ],
    correct: "A",
  },
  {
    id: "q6",
    prompt: "Which command shows UFW status and rules in this lesson?",
    options: [
      { key: "A", label: "`sudo ufw status`" },
      { key: "B", label: "`systemctl firewall`" },
      { key: "C", label: "`ss --firewall`" },
      { key: "D", label: "`chmod ufw`" },
    ],
    correct: "A",
  },
  {
    id: "q7",
    prompt: "Safe remote firewall administration includes:",
    options: [
      {
        key: "A",
        label:
          "Confirm SSH (22/tcp) remains allowed before enabling deny-incoming defaults",
      },
      {
        key: "B",
        label: "Delete the SSH allow rule first, then enable the firewall",
      },
      {
        key: "C",
        label: "Assume UFW cannot lock you out of a remote server",
      },
      {
        key: "D",
        label: "Disable SSH permanently so the firewall is simpler",
      },
    ],
    correct: "A",
  },
  {
    id: "q8",
    prompt: "Allowing 53/tcp does not automatically allow 53/udp because:",
    options: [
      {
        key: "A",
        label: "TCP and UDP are separate protocols matched by separate rules",
      },
      {
        key: "B",
        label: "UDP ports never appear in firewall rules",
      },
      {
        key: "C",
        label: "Port 53 can only use TCP",
      },
      {
        key: "D",
        label: "Default policies ignore protocols entirely",
      },
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

export function FirewallBasicsQuiz() {
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
              ? "You understand inbound vs outbound traffic, ports and protocols, default policies, explicit rules, listening services, UFW basics, and safe remote firewall changes."
              : "Review inbound/outbound traffic, default policies, allow rules vs listeners, UFW commands, and SSH lockout risks, then try again."}
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
