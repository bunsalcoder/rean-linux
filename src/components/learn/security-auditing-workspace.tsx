"use client";

import { useMemo, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { Button } from "@/components/ui/button";
import {
  AUDIT_FINDINGS,
  computeAuditScore,
  createInitialSecurityAuditingState,
  getOpenFindings,
  type AuditCategoryId,
  type AuditFinding,
  type AuditSeverity,
} from "@/lib/simulate-security-auditing";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CategoryReviewStatus =
  | "not-reviewed"
  | "in-progress"
  | "reviewed"
  | "finding-identified"
  | "remediation-verified";

type CategoryMeta = {
  id: AuditCategoryId;
  title: string;
  objective: string;
  evidenceHints: readonly string[];
};

const CATEGORIES: readonly CategoryMeta[] = [
  {
    id: "account-security",
    title: "Account Security",
    objective:
      "Verify all user accounts follow least privilege and no unauthorized users have elevated access.",
    evidenceHints: ["getent group sudo", "id contractor", "getent passwd"],
  },
  {
    id: "permissions-ownership",
    title: "Permissions & Ownership",
    objective:
      "Ensure sensitive files have restrictive permissions and no unnecessary world-readable secrets.",
    evidenceHints: [
      "ls -l /srv/app/secrets.env",
      "getfacl /srv/app/secrets.env",
    ],
  },
  {
    id: "privilege-management",
    title: "Privilege Management",
    objective:
      "Confirm sudo rules follow least privilege — no unrestricted NOPASSWD ALL for service accounts.",
    evidenceHints: [
      "sudo -l -U deploy",
      "sudo -l -U bunsal",
      "ls -l /etc/sudoers.d",
    ],
  },
  {
    id: "ssh-configuration",
    title: "SSH Configuration",
    objective:
      "Verify SSH daemon configuration disables password auth and root login.",
    evidenceHints: ["sshd -T", "systemctl status ssh"],
  },
  {
    id: "firewall-network",
    title: "Firewall & Network",
    objective:
      "Confirm services listen only on appropriate interfaces and firewall rules deny unnecessary exposure.",
    evidenceHints: [
      "ss -tuln",
      "ufw status verbose",
      "systemctl status postgresql",
    ],
  },
  {
    id: "services-processes",
    title: "Services & Processes",
    objective:
      "Review running services — only necessary services should be active.",
    evidenceHints: ["systemctl list-units --type=service", "ss -tulpn"],
  },
  {
    id: "package-security",
    title: "Package Security",
    objective:
      "Check for outdated packages with known advisories and verify patches are applied.",
    evidenceHints: ["apt list --upgradable", "apt show openssh-server"],
  },
  {
    id: "logs-authentication",
    title: "Logs & Authentication",
    objective:
      "Review authentication logs for suspicious activity — repeated failures followed by success warrant investigation.",
    evidenceHints: ["journalctl -u ssh", "journalctl -u sudo"],
  },
  {
    id: "storage-backup",
    title: "Storage & Backup",
    objective:
      "Verify backup existence, recency, and that restores have been tested.",
    evidenceHints: ["df -h", "ls -l /var/backups", "findmnt"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function severityLabel(severity: AuditSeverity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function severityTone(severity: AuditSeverity): string {
  switch (severity) {
    case "critical":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    case "high":
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "medium":
      return "border-border bg-muted text-foreground";
    case "low":
      return "border-border bg-background text-muted-foreground";
    case "informational":
      return "border-border bg-background text-muted-foreground";
  }
}

function statusLabel(status: CategoryReviewStatus): string {
  switch (status) {
    case "not-reviewed":
      return "Not reviewed";
    case "in-progress":
      return "In progress";
    case "reviewed":
      return "Reviewed";
    case "finding-identified":
      return "Finding identified";
    case "remediation-verified":
      return "Remediation verified";
  }
}

function statusTone(status: CategoryReviewStatus): string {
  switch (status) {
    case "not-reviewed":
      return "text-muted-foreground";
    case "in-progress":
      return "text-amber-700 dark:text-amber-300";
    case "reviewed":
      return "text-foreground";
    case "finding-identified":
      return "text-destructive";
    case "remediation-verified":
      return "text-emerald-700 dark:text-emerald-300";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SecurityAuditingWorkspace() {
  const [tab, setTab] = useState<"workspace" | "report">("workspace");
  const [categoryStatuses, setCategoryStatuses] = useState<
    Record<AuditCategoryId, CategoryReviewStatus>
  >(() => {
    const initial: Record<string, CategoryReviewStatus> = {};
    for (const cat of CATEGORIES) {
      initial[cat.id] = "not-reviewed";
    }
    return initial as Record<AuditCategoryId, CategoryReviewStatus>;
  });
  const [expandedCategory, setExpandedCategory] =
    useState<AuditCategoryId | null>(null);

  const state = useMemo(
    () => createInitialSecurityAuditingState("explore"),
    [],
  );
  const openFindings = useMemo(() => getOpenFindings(state), [state]);
  const auditScore = useMemo(() => computeAuditScore(state), [state]);
  const findingsByCategory = useMemo(() => {
    const map = new Map<AuditCategoryId, AuditFinding[]>();
    for (const f of AUDIT_FINDINGS) {
      const list = map.get(f.category) ?? [];
      list.push(f);
      map.set(f.category, list);
    }
    return map;
  }, []);

  function updateStatus(
    categoryId: AuditCategoryId,
    status: CategoryReviewStatus,
  ) {
    setCategoryStatuses((prev) => ({ ...prev, [categoryId]: status }));
  }

  function resetWorkspace() {
    const initial: Record<string, CategoryReviewStatus> = {};
    for (const cat of CATEGORIES) {
      initial[cat.id] = "not-reviewed";
    }
    setCategoryStatuses(
      initial as Record<AuditCategoryId, CategoryReviewStatus>,
    );
    setExpandedCategory(null);
  }

  const reviewedCount = CATEGORIES.filter(
    (c) => categoryStatuses[c.id] !== "not-reviewed",
  ).length;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Security Audit Workspace
        </h3>
        <p className="text-sm">
          Walk through each audit category for the fictional host{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            rean-audit
          </code>
          . Mark category review status, identify findings, and assemble a
          session report. All state is session-only — nothing persisted.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b pb-0">
        {(["workspace", "report"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              tab === t
                ? "border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {t === "workspace" ? "Workspace" : "Report"}
          </button>
        ))}
      </div>

      {tab === "workspace" ? (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="border-border bg-muted/30 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border p-4 text-sm">
            <span>
              <strong className="text-foreground">Categories reviewed:</strong>{" "}
              {reviewedCount}/{CATEGORIES.length}
            </span>
            <span>
              <strong className="text-foreground">Open findings:</strong>{" "}
              {openFindings.length}
            </span>
            <span>
              <strong className="text-foreground">Posture score:</strong>{" "}
              {auditScore.score}/100 (teaching estimate)
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetWorkspace}
            >
              Reset workspace
            </Button>
          </div>

          {/* Compact checklist */}
          <div className="border-border bg-muted/30 rounded-lg border p-4">
            <p className="text-foreground mb-2 text-sm font-medium">
              Category checklist
            </p>
            <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((cat) => {
                const status = categoryStatuses[cat.id];
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === cat.id ? null : cat.id,
                        )
                      }
                      className={cn(
                        "flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm transition-colors",
                        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                        "hover:bg-muted/60",
                        expandedCategory === cat.id && "bg-muted/60",
                      )}
                    >
                      <span
                        className={cn(
                          "size-2.5 shrink-0 rounded-full border",
                          status === "remediation-verified"
                            ? "border-emerald-500 bg-emerald-500"
                            : status === "finding-identified"
                              ? "border-destructive bg-destructive"
                              : status === "reviewed"
                                ? "border-primary bg-primary"
                                : status === "in-progress"
                                  ? "border-amber-500 bg-amber-500"
                                  : "border-muted-foreground bg-transparent",
                        )}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate">{cat.title}</span>
                      <span
                        className={cn(
                          "ml-auto shrink-0 text-xs",
                          statusTone(status),
                        )}
                      >
                        {statusLabel(status)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Expanded category detail */}
          {expandedCategory ? (
            <CategoryDetail
              category={CATEGORIES.find((c) => c.id === expandedCategory)!}
              findings={findingsByCategory.get(expandedCategory) ?? []}
              status={categoryStatuses[expandedCategory]}
              onStatusChange={(status) =>
                updateStatus(expandedCategory, status)
              }
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              Click a category above to review its details, findings, and
              remediation guidance.
            </p>
          )}
        </div>
      ) : null}

      {tab === "report" ? (
        <ReportView
          categoryStatuses={categoryStatuses}
          openFindings={openFindings}
          auditScore={auditScore}
          onReset={resetWorkspace}
        />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category detail
// ---------------------------------------------------------------------------

function CategoryDetail({
  category,
  findings,
  status,
  onStatusChange,
}: {
  category: CategoryMeta;
  findings: readonly AuditFinding[];
  status: CategoryReviewStatus;
  onStatusChange: (status: CategoryReviewStatus) => void;
}) {
  return (
    <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-4 sm:p-5">
      <div className="space-y-1">
        <h4 className="text-foreground font-heading text-base font-semibold">
          {category.title}
        </h4>
        <p className="text-sm">{category.objective}</p>
      </div>

      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Evidence hints
        </p>
        <ul className="flex flex-wrap gap-2">
          {category.evidenceHints.map((hint) => (
            <li key={hint}>
              <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                {hint}
              </code>
            </li>
          ))}
        </ul>
      </div>

      {findings.length > 0 ? (
        <div className="space-y-3">
          <p className="text-foreground text-sm font-medium">
            Findings ({findings.length})
          </p>
          {findings.map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          {category.id === "services-processes"
            ? "No standalone finding is cataloged here. Review running units and correlate with Firewall & Network — service status alone does not prove safe exposure."
            : "No findings cataloged in this category for the baseline host."}
        </p>
      )}

      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Mark review status
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              "not-reviewed",
              "in-progress",
              "reviewed",
              "finding-identified",
              "remediation-verified",
            ] as const
          ).map((s) => (
            <Button
              key={s}
              type="button"
              variant={status === s ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusChange(s)}
            >
              {statusLabel(s)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Finding card
// ---------------------------------------------------------------------------

function FindingCard({ finding }: { finding: AuditFinding }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-sm",
        severityTone(finding.severity),
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="focus-visible:ring-ring flex w-full items-start justify-between gap-2 text-left focus-visible:ring-2 focus-visible:outline-none"
      >
        <div className="min-w-0 space-y-0.5">
          <p className="text-foreground font-medium">
            [{finding.id}] {finding.title}
          </p>
          <p className="text-xs">
            Severity: {severityLabel(finding.severity)} · Priority:{" "}
            {finding.priority}
          </p>
        </div>
        <span className="text-muted-foreground shrink-0 text-xs">
          {expanded ? "▲" : "▼"}
        </span>
      </button>
      {expanded ? (
        <div className="mt-3 space-y-2">
          <p>{finding.description}</p>
          <div>
            <p className="text-foreground font-medium">Evidence</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-xs">
              {finding.evidence.map((e) => (
                <li key={e}>
                  <code className="break-all">{e}</code>
                </li>
              ))}
            </ul>
          </div>
          <p>
            <strong className="text-foreground">Impact:</strong>{" "}
            {finding.potentialImpact}
          </p>
          <p>
            <strong className="text-foreground">Recommendation:</strong>{" "}
            {finding.recommendation}
          </p>
          <p>
            <strong className="text-foreground">Verification:</strong>{" "}
            {finding.verificationCriteria}
          </p>
          <p>
            <strong className="text-foreground">Owner:</strong>{" "}
            {finding.remediationOwner}
          </p>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Report view
// ---------------------------------------------------------------------------

function ReportView({
  categoryStatuses,
  openFindings,
  auditScore,
  onReset,
}: {
  categoryStatuses: Record<AuditCategoryId, CategoryReviewStatus>;
  openFindings: readonly AuditFinding[];
  auditScore: { score: number; maxScore: number; openWeight: number };
  onReset: () => void;
}) {
  const bySeverity = useMemo(() => {
    const map = new Map<AuditSeverity, AuditFinding[]>();
    for (const f of AUDIT_FINDINGS) {
      const list = map.get(f.severity) ?? [];
      list.push(f);
      map.set(f.severity, list);
    }
    return map;
  }, []);

  const categoriesReviewed = CATEGORIES.filter(
    (c) => categoryStatuses[c.id] !== "not-reviewed",
  );
  const categoriesNotReviewed = CATEGORIES.filter(
    (c) => categoryStatuses[c.id] === "not-reviewed",
  );

  return (
    <div className="space-y-6" id="audit-report">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Security Audit Report Preview
        </h3>
        <p className="text-muted-foreground text-sm">
          Session-based assembly from the workspace. Reset clears all state.
        </p>
      </div>

      {/* Summary */}
      <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
        <h4 className="text-foreground font-medium">Executive Summary</h4>
        <p className="text-sm">
          Audit of fictional host{" "}
          <strong className="text-foreground">rean-audit</strong> covering{" "}
          {CATEGORIES.length} security categories. Teaching posture score:{" "}
          <strong className="text-foreground">
            {auditScore.score}/{auditScore.maxScore}
          </strong>
          .
        </p>
        <p className="text-sm">
          <strong className="text-foreground">Total findings:</strong>{" "}
          {AUDIT_FINDINGS.length} · Open: {openFindings.length} · Critical:{" "}
          {AUDIT_FINDINGS.filter((f) => f.severity === "critical").length} ·
          High: {AUDIT_FINDINGS.filter((f) => f.severity === "high").length} ·
          Medium: {AUDIT_FINDINGS.filter((f) => f.severity === "medium").length}
        </p>
      </div>

      {/* Scope */}
      <div className="border-border bg-muted/30 space-y-2 rounded-lg border p-4">
        <h4 className="text-foreground font-medium">Scope</h4>
        <p className="text-sm">
          Host: rean-audit · Users: root, www-data, postgres, backup, bunsal,
          deploy, contractor, analyst · Services: ssh, nginx, postgresql
        </p>
      </div>

      {/* Categories reviewed */}
      <div className="border-border bg-muted/30 space-y-2 rounded-lg border p-4">
        <h4 className="text-foreground font-medium">
          Categories Reviewed ({categoriesReviewed.length}/{CATEGORIES.length})
        </h4>
        {categoriesReviewed.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {categoriesReviewed.map((c) => (
              <li key={c.id}>
                {c.title} —{" "}
                <span className={statusTone(categoryStatuses[c.id])}>
                  {statusLabel(categoryStatuses[c.id])}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            No categories reviewed yet. Go to the Workspace tab.
          </p>
        )}
        {categoriesNotReviewed.length > 0 ? (
          <p className="text-muted-foreground text-sm">
            Not yet reviewed:{" "}
            {categoriesNotReviewed.map((c) => c.title).join(", ")}
          </p>
        ) : null}
      </div>

      {/* Findings by severity */}
      <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
        <h4 className="text-foreground font-medium">Findings by Severity</h4>
        {(["critical", "high", "medium", "low", "informational"] as const).map(
          (sev) => {
            const items = bySeverity.get(sev);
            if (!items || items.length === 0) return null;
            return (
              <div key={sev} className="space-y-1">
                <p className="text-sm font-medium">
                  {severityLabel(sev)} ({items.length})
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {items.map((f) => (
                    <li key={f.id}>
                      [{f.id}] {f.title} — {f.recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            );
          },
        )}
      </div>

      {/* Final observations */}
      <Callout title="Observations">
        <p>
          The fictional host has multiple critical and high-severity findings
          across account security, permissions, SSH, network exposure, and
          package management. Suspicious authentication activity (finding G)
          warrants further investigation. Backup restore has not been verified.
          Prioritize immediate findings (A, B, E, F, G) before addressing
          high-priority items (C, D) and medium items (H).
        </p>
      </Callout>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.print();
            }
          }}
        >
          Print report
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
