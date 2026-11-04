"use client";

import { useMemo, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { Button } from "@/components/ui/button";
import {
  FICTIONAL_ADVISORIES,
  assessAllAdvisories,
  createInitialSecurityUpdatesState,
  type AdvisoryAssessment,
  type AdvisorySeverity,
  type RemediationStatus,
} from "@/lib/simulate-security-updates";
import { cn } from "@/lib/utils";

type SeverityFilter = "all" | AdvisorySeverity;
type StatusFilter = "all" | RemediationStatus;
type PackageFilter = "all" | string;

const SEVERITY_OPTIONS: readonly SeverityFilter[] = [
  "all",
  "critical",
  "high",
  "medium",
  "low",
];

const STATUS_OPTIONS: readonly StatusFilter[] = [
  "all",
  "vulnerable",
  "update-available",
  "pending-restart",
  "pending-reboot",
  "remediated",
  "not-affected",
];

function statusLabel(status: RemediationStatus): string {
  switch (status) {
    case "vulnerable":
      return "Vulnerable";
    case "update-available":
      return "Update available";
    case "pending-restart":
      return "Pending restart";
    case "pending-reboot":
      return "Pending reboot";
    case "remediated":
      return "Remediated";
    case "not-affected":
      return "Not affected";
  }
}

function severityTone(severity: AdvisorySeverity): string {
  switch (severity) {
    case "critical":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    case "high":
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "medium":
      return "border-border bg-muted text-foreground";
    case "low":
      return "border-border bg-background text-muted-foreground";
  }
}

function statusTone(status: RemediationStatus): string {
  switch (status) {
    case "vulnerable":
    case "update-available":
      return "border-destructive/40 text-destructive";
    case "pending-restart":
    case "pending-reboot":
      return "border-amber-500/40 text-amber-700 dark:text-amber-300";
    case "remediated":
      return "border-emerald-500/40 text-emerald-700 dark:text-emerald-300";
    case "not-affected":
      return "border-border text-muted-foreground";
  }
}

function AdvisoryDetail({ assessment }: { assessment: AdvisoryAssessment }) {
  const { advisory } = assessment;
  return (
    <div className="border-border bg-muted/20 space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-foreground font-mono text-sm font-semibold">
            {advisory.id}
          </p>
          <p className="text-foreground mt-1 text-sm font-medium">
            {advisory.title}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "rounded border px-2 py-0.5 text-xs font-medium capitalize",
              severityTone(advisory.severity),
            )}
          >
            {advisory.severity} · CVSS-style {advisory.cvss}
          </span>
          <span
            className={cn(
              "rounded border px-2 py-0.5 text-xs font-medium",
              statusTone(assessment.remediationStatus),
            )}
          >
            {statusLabel(assessment.remediationStatus)}
          </span>
        </div>
      </div>

      <p className="text-sm">{advisory.summary}</p>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Affected package</dt>
          <dd className="text-foreground font-mono">{advisory.packageName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Installed version</dt>
          <dd className="text-foreground font-mono">
            {assessment.installedVersion ?? "not installed"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Fixed version</dt>
          <dd className="text-foreground font-mono">{advisory.fixedVersion}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Priority result</dt>
          <dd className="text-foreground capitalize">{assessment.priority}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Exposure</dt>
          <dd className="text-foreground">{advisory.exposure}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Network-exposed</dt>
          <dd className="text-foreground">
            {advisory.networkExposed ? "Yes" : "No"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Exploit in scenario</dt>
          <dd className="text-foreground">
            {advisory.exploitAvailable ? "Available (fictional)" : "Not listed"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Recommended action</dt>
          <dd className="text-foreground">{advisory.recommendedAction}</dd>
        </div>
      </dl>

      <div>
        <p className="text-foreground text-sm font-medium">
          Prioritization factors
        </p>
        <ul className="text-muted-foreground mt-1 list-disc space-y-1 pl-5 text-sm">
          {assessment.priorityReasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SecurityUpdatesDashboard() {
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [packageName, setPackageName] = useState<PackageFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    FICTIONAL_ADVISORIES[0]?.id ?? null,
  );

  const assessments = useMemo(() => {
    const state = createInitialSecurityUpdatesState("explore");
    return assessAllAdvisories(state);
  }, []);

  const packageOptions = useMemo(() => {
    const names = [
      ...new Set(assessments.map((item) => item.advisory.packageName)),
    ].sort();
    return names;
  }, [assessments]);

  const filtered = assessments.filter((item) => {
    if (severity !== "all" && item.advisory.severity !== severity) {
      return false;
    }
    if (status !== "all" && item.remediationStatus !== status) {
      return false;
    }
    if (packageName !== "all" && item.advisory.packageName !== packageName) {
      return false;
    }
    return true;
  });

  const selected =
    filtered.find((item) => item.advisory.id === selectedId) ??
    filtered[0] ??
    null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Security advisory dashboard
        </h3>
        <p className="text-muted-foreground text-sm">
          Browse fictional advisories for the lesson host. Identifiers use{" "}
          <span className="font-mono">DEMO-*</span> labels — they are teaching
          examples, not real CVEs.
        </p>
      </div>

      <Callout title="Fictional data only">
        <p>
          Severity scores, exploit availability, and package versions are
          simulated for learning. The dashboard never queries real vulnerability
          databases or package repositories.
        </p>
      </Callout>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Severity</span>
          <select
            className="border-border bg-background focus-visible:ring-ring rounded-md border px-3 py-2 focus-visible:ring-2 focus-visible:outline-none"
            value={severity}
            onChange={(event) =>
              setSeverity(event.target.value as SeverityFilter)
            }
          >
            {SEVERITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All severities" : option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Remediation status</span>
          <select
            className="border-border bg-background focus-visible:ring-ring rounded-md border px-3 py-2 focus-visible:ring-2 focus-visible:outline-none"
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All statuses" : statusLabel(option)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Affected package</span>
          <select
            className="border-border bg-background focus-visible:ring-ring rounded-md border px-3 py-2 focus-visible:ring-2 focus-visible:outline-none"
            value={packageName}
            onChange={(event) =>
              setPackageName(event.target.value as PackageFilter)
            }
          >
            <option value="all">All packages</option>
            {packageOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setSeverity("all");
              setStatus("all");
              setPackageName("all");
            }}
          >
            Reset filters
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Fictional security advisories with severity and remediation status
          </caption>
          <thead className="bg-muted/40">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">
                Advisory
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Package
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Severity
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Status
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Priority
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-muted-foreground px-3 py-4 text-center"
                >
                  No advisories match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const active = selected?.advisory.id === item.advisory.id;
                return (
                  <tr
                    key={item.advisory.id}
                    className={cn(
                      "border-border border-t",
                      active && "bg-primary/5",
                    )}
                  >
                    <th scope="row" className="px-3 py-2 font-normal">
                      <button
                        type="button"
                        className="text-foreground hover:text-primary focus-visible:ring-ring text-left font-mono underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
                        onClick={() => setSelectedId(item.advisory.id)}
                        aria-current={active ? "true" : undefined}
                      >
                        {item.advisory.id}
                      </button>
                    </th>
                    <td className="px-3 py-2 font-mono">
                      {item.advisory.packageName}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      {item.advisory.severity}
                    </td>
                    <td className="px-3 py-2">
                      {statusLabel(item.remediationStatus)}
                    </td>
                    <td className="px-3 py-2 capitalize">{item.priority}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selected ? <AdvisoryDetail assessment={selected} /> : null}
    </div>
  );
}
