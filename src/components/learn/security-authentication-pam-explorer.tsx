"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { Button } from "@/components/ui/button";
import {
  evaluateExplorerExample,
  PAM_EXPLORER_EXAMPLES,
  type PamExplorerExampleId,
} from "@/lib/simulate-security-authentication-pam";
import { cn } from "@/lib/utils";

const OUTCOME_STYLES: Record<string, string> = {
  success: "border-green-600/40 bg-green-500/10 text-foreground",
  "auth-failure": "border-destructive/40 bg-destructive/10 text-foreground",
  "account-denied":
    "border-amber-600/40 bg-amber-500/10 text-foreground dark:border-amber-500/40",
  "session-failure": "border-destructive/40 bg-destructive/10 text-foreground",
  "config-error": "border-destructive/40 bg-destructive/10 text-foreground",
};

export function SecurityAuthenticationPamExplorer() {
  const [exampleId, setExampleId] =
    useState<PamExplorerExampleId>("success-path");

  const example = PAM_EXPLORER_EXAMPLES.find((item) => item.id === exampleId)!;
  const outcome = evaluateExplorerExample(exampleId);

  return (
    <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-4 sm:p-5">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight">
          Interactive PAM Configuration Explorer
        </h3>
        <p className="text-muted-foreground text-sm">
          Inspect fictional PAM stacks and see how module order and control
          flags change the simulated result. This is a teaching subset — not a
          full PAM interpreter, and it never loads system modules or real
          credentials.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PAM_EXPLORER_EXAMPLES.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={item.id === exampleId ? "default" : "outline"}
            onClick={() => setExampleId(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <Callout title={example.label}>
        <p>{example.description}</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Service:{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            {example.service}
          </code>
          {" · "}
          User:{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            {example.user}
          </code>
        </p>
      </Callout>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            PAM module entries for the selected teaching example
          </caption>
          <thead>
            <tr className="border-border border-b">
              <th className="text-foreground py-2 pr-3 font-medium">Type</th>
              <th className="text-foreground py-2 pr-3 font-medium">Control</th>
              <th className="text-foreground py-2 pr-3 font-medium">Module</th>
              <th className="text-foreground py-2 pr-3 font-medium">
                Arguments
              </th>
              <th className="text-foreground py-2 font-medium">Purpose</th>
            </tr>
          </thead>
          <tbody>
            {example.modules.map((entry, index) => (
              <tr
                key={`${entry.module}-${index}`}
                className="border-border border-b align-top"
              >
                <td className="py-2 pr-3 font-mono text-xs">{entry.type}</td>
                <td className="py-2 pr-3 font-mono text-xs">{entry.control}</td>
                <td className="py-2 pr-3 font-mono text-xs">{entry.module}</td>
                <td className="text-muted-foreground py-2 pr-3 font-mono text-xs">
                  {entry.args.length > 0 ? entry.args.join(" ") : "—"}
                </td>
                <td className="py-2 text-sm">{entry.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className={cn(
          "rounded-lg border px-3 py-3 text-sm",
          OUTCOME_STYLES[outcome.overall] ?? "border-border",
        )}
        role="status"
      >
        <p className="font-medium">Simulated outcome: {outcome.overall}</p>
        <p className="mt-1">{outcome.summary}</p>
        <p className="text-muted-foreground mt-2 text-xs">
          auth={outcome.authOk ? "ok" : "FAIL"} · account=
          {outcome.accountOk ? "ok" : "FAIL"} · session=
          {outcome.sessionOk ? "ok" : "FAIL"}
        </p>
      </div>

      {outcome.steps.length > 0 ? (
        <div className="space-y-2">
          <p className="text-foreground text-sm font-medium">
            Evaluation steps
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {outcome.steps.map((step) => (
              <li key={`${step.type}-${step.index}-${step.module}`}>
                <span className="font-mono text-xs">
                  [{step.type}] {step.control} {step.module}
                </span>
                {" → "}
                <span
                  className={cn(
                    step.moduleResult === "success"
                      ? "text-green-700 dark:text-green-400"
                      : "text-destructive",
                  )}
                >
                  {step.moduleResult}
                </span>
                <span className="text-muted-foreground"> — {step.note}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <Callout title="How order and flags matter">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>
            <strong className="text-foreground">required</strong> failures are
            remembered; later modules still run.
          </li>
          <li>
            <strong className="text-foreground">requisite</strong> failures stop
            the stack immediately.
          </li>
          <li>
            <strong className="text-foreground">sufficient</strong> success can
            end the stage early if no prior required failure exists.
          </li>
          <li>
            <strong className="text-foreground">optional</strong> results
            usually do not decide the stage alone.
          </li>
          <li>
            Authentication success does not skip{" "}
            <strong className="text-foreground">account</strong> or{" "}
            <strong className="text-foreground">session</strong> stages.
          </li>
        </ul>
      </Callout>
    </div>
  );
}
