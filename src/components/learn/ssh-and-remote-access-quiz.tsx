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
    prompt: "What does `ssh user@server` mean?",
    options: [
      {
        key: "A",
        label:
          "Connect as username `user` to the host named `server` using SSH",
      },
      { key: "B", label: "Copy files from `user` to `server` with scp only" },
      { key: "C", label: "Start the SSH service on the local machine" },
      { key: "D", label: "Delete the remote host key for `server`" },
    ],
    correct: "A",
  },
  {
    id: "q2",
    prompt: "Which TCP port does SSH use by default?",
    options: [
      { key: "A", label: "80" },
      { key: "B", label: "443" },
      { key: "C", label: "22" },
      { key: "D", label: "53" },
    ],
    correct: "C",
  },
  {
    id: "q3",
    prompt: "How do you connect when SSH listens on port 2222?",
    options: [
      { key: "A", label: "`ssh -p 2222 user@server`" },
      { key: "B", label: "`ssh --port22 user@server`" },
      { key: "C", label: "`ssh user@server:2222` (always required syntax)" },
      { key: "D", label: "`ping -p 2222 user@server`" },
    ],
    correct: "A",
  },
  {
    id: "q4",
    prompt: "Which statement about SSH keys is correct?",
    options: [
      {
        key: "A",
        label:
          "The private key must stay secret; the public key can be placed in remote authorized_keys",
      },
      {
        key: "B",
        label: "The private key should be copied to every server you manage",
      },
      {
        key: "C",
        label: "Public and private keys are interchangeable",
      },
      {
        key: "D",
        label: "authorized_keys stores only host fingerprints",
      },
    ],
    correct: "A",
  },
  {
    id: "q5",
    prompt: "What is the role of `~/.ssh/known_hosts`?",
    options: [
      {
        key: "A",
        label: "It records trusted remote host keys for host verification",
      },
      { key: "B", label: "It stores your login passwords in plain text" },
      { key: "C", label: "It lists packages installed by apt" },
      { key: "D", label: "It replaces systemctl for starting sshd" },
    ],
    correct: "A",
  },
  {
    id: "q6",
    prompt:
      "`ssh: connect to host server port 22: Connection refused` most likely means:",
    options: [
      {
        key: "A",
        label:
          "Nothing accepted the TCP connection on that port (service down or wrong port)",
      },
      { key: "B", label: "Your password was incorrect" },
      { key: "C", label: "DNS resolved successfully and login succeeded" },
      { key: "D", label: "The private key passphrase was wrong" },
    ],
    correct: "A",
  },
  {
    id: "q7",
    prompt: "`Permission denied (publickey)` after reaching the host means:",
    options: [
      {
        key: "A",
        label:
          "SSH answered, but key-based authentication was not accepted for that account",
      },
      { key: "B", label: "The cable is unplugged" },
      { key: "C", label: "Port 22 is filtered by a missing default route" },
      { key: "D", label: "getent hosts always failed" },
    ],
    correct: "A",
  },
  {
    id: "q8",
    prompt:
      "You see `REMOTE HOST IDENTIFICATION HAS CHANGED`. What should you do first?",
    options: [
      {
        key: "A",
        label:
          "Treat it as a serious warning and verify the host key through a trusted channel before changing known_hosts",
      },
      {
        key: "B",
        label: "Always delete known_hosts immediately without checking",
      },
      {
        key: "C",
        label: "Disable SSH forever on every server",
      },
      {
        key: "D",
        label: "Share your private key with the remote admin over chat",
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

export function SshAndRemoteAccessQuiz() {
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
              ? "You understand SSH syntax, keys, ports, authentication failures, and safe host-key handling."
              : "Review SSH syntax, key concepts, connection errors, and the security checklist, then try again."}
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
