"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { Button } from "@/components/ui/button";
import {
  CRON_EXAMPLES,
  parseCronExpression,
  type CronFieldName,
} from "@/lib/simulate-scheduled-tasks";
import { cn } from "@/lib/utils";

const FIELD_LABELS: Record<CronFieldName, string> = {
  minute: "Minute (0–59)",
  hour: "Hour (0–23)",
  dayOfMonth: "Day of month (1–31)",
  month: "Month (1–12)",
  dayOfWeek: "Day of week (0–7, Sun=0 or 7)",
};

export function CronExpressionExplainer() {
  const [expression, setExpression] = useState("0 9 * * 1");
  const parsed = parseCronExpression(expression);

  return (
    <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-4 sm:p-5">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight">
          Cron Expression Explainer
        </h3>
        <p className="text-muted-foreground text-sm">
          Inspect or construct a standard five-field cron expression. This
          educational parser supports <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.875em]">*</code>, numbers, ranges, lists, and
          steps — it does not claim full compatibility with every cron
          implementation.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="cron-expression-input"
          className="text-foreground text-sm font-medium"
        >
          Expression
        </label>
        <input
          id="cron-expression-input"
          type="text"
          value={expression}
          onChange={(event) => setExpression(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          className={cn(
            "border-border bg-background text-foreground w-full rounded-lg border px-3 py-2 font-mono text-sm",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          )}
          placeholder="* * * * *"
          aria-describedby="cron-expression-help"
        />
        <p id="cron-expression-help" className="text-muted-foreground text-xs">
          Order: minute · hour · day of month · month · day of week. Schedules
          use the system timezone (this lab uses UTC).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CRON_EXAMPLES.map((example) => (
          <Button
            key={example.expression}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setExpression(example.expression)}
          >
            {example.label}
          </Button>
        ))}
      </div>

      {parsed.ok ? (
        <div className="space-y-3">
          <Callout title="Interpretation">
            <p>{parsed.summary}</p>
            {parsed.note ? <p className="mt-2">{parsed.note}</p> : null}
          </Callout>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                Cron field breakdown for the current expression
              </caption>
              <thead>
                <tr className="border-border border-b">
                  <th className="text-foreground py-2 pr-3 font-medium">
                    Field
                  </th>
                  <th className="text-foreground py-2 pr-3 font-medium">
                    Value
                  </th>
                  <th className="text-foreground py-2 font-medium">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {(
                  Object.keys(FIELD_LABELS) as CronFieldName[]
                ).map((field) => (
                  <tr key={field} className="border-border border-b last:border-0">
                    <td className="text-muted-foreground py-2 pr-3 align-top">
                      {FIELD_LABELS[field]}
                    </td>
                    <td className="py-2 pr-3 align-top">
                      <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                        {parsed.fields[field]}
                      </code>
                    </td>
                    <td className="text-foreground py-2 align-top">
                      {parsed.fieldDescriptions[field]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Callout title="Invalid expression">
          <p>
            {parsed.error}
            {parsed.field
              ? ` Check the ${FIELD_LABELS[parsed.field].toLowerCase()} field.`
              : null}
          </p>
        </Callout>
      )}
    </div>
  );
}
