"use client";

import { useMemo, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { Button } from "@/components/ui/button";
import {
  createInitialMacState,
  evaluateCombinedAccess,
  getMacExplorerSnapshot,
  MAC_EXPLORER_VIEWS,
  type ApparmorMode,
  type MacExplorerViewId,
  type SimulatedApparmorProfile,
} from "@/lib/simulate-security-mandatory-access-control";
import { cn } from "@/lib/utils";

const MODE_STYLES: Record<string, string> = {
  enforce: "border-destructive/40 bg-destructive/10 text-foreground",
  complain:
    "border-amber-600/40 bg-amber-500/10 text-foreground dark:border-amber-500/40",
  disabled: "border-border bg-muted/40 text-muted-foreground",
  ALLOW: "border-green-600/40 bg-green-500/10 text-foreground",
  DENY: "border-destructive/40 bg-destructive/10 text-foreground",
};

function formatContext(parts: {
  user: string;
  role: string;
  type: string;
  level: string;
}) {
  return `${parts.user}:${parts.role}:${parts.type}:${parts.level}`;
}

function ProfilePanel({
  profile,
  onModeChange,
}: {
  profile: SimulatedApparmorProfile;
  onModeChange?: (mode: ApparmorMode) => void;
}) {
  return (
    <div className="border-border space-y-3 rounded-lg border p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-foreground font-medium">{profile.name}</p>
        <span
          className={cn(
            "rounded border px-2 py-0.5 font-mono text-xs",
            MODE_STYLES[profile.mode],
          )}
        >
          {profile.mode}
        </span>
      </div>
      <p className="text-muted-foreground text-sm">
        Executable:{" "}
        <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.875em]">
          {profile.executable}
        </code>
      </p>
      <p className="text-sm">{profile.notes}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-foreground mb-1 text-sm font-medium">
            Allowed file access
          </p>
          <ul className="list-disc space-y-1 pl-5 font-mono text-xs">
            {profile.allowedFiles.map((rule) => (
              <li key={`${rule.path}-${rule.access}`}>
                {rule.path} ({rule.access})
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-foreground mb-1 text-sm font-medium">
            Denied file access
          </p>
          <ul className="list-disc space-y-1 pl-5 font-mono text-xs">
            {profile.deniedFiles.length > 0 ? (
              profile.deniedFiles.map((rule) => (
                <li key={`${rule.path}-${rule.access}`}>
                  {rule.path} ({rule.access})
                </li>
              ))
            ) : (
              <li className="text-muted-foreground list-none pl-0">
                None listed
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-foreground mb-1 text-sm font-medium">Network</p>
          <ul className="list-disc space-y-1 pl-5 font-mono text-xs">
            {profile.network.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-foreground mb-1 text-sm font-medium">
            Capabilities
          </p>
          <ul className="list-disc space-y-1 pl-5 font-mono text-xs">
            {profile.capabilities.length > 0 ? (
              profile.capabilities.map((cap) => <li key={cap}>{cap}</li>)
            ) : (
              <li className="text-muted-foreground list-none pl-0">None</li>
            )}
          </ul>
        </div>
      </div>
      {onModeChange ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            variant={profile.mode === "enforce" ? "default" : "outline"}
            onClick={() => onModeChange("enforce")}
          >
            Enforce
          </Button>
          <Button
            type="button"
            size="sm"
            variant={profile.mode === "complain" ? "default" : "outline"}
            onClick={() => onModeChange("complain")}
          >
            Complain
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onModeChange(profile.intendedMode)}
          >
            Restore intended ({profile.intendedMode})
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function SecurityMandatoryAccessControlExplorer() {
  const [viewId, setViewId] = useState<MacExplorerViewId>("apparmor-nginx");
  const [modeOverride, setModeOverride] = useState<ApparmorMode | null>(null);

  const snapshot = useMemo(() => getMacExplorerSnapshot(viewId), [viewId]);

  const interactiveProfile = useMemo(() => {
    if (!snapshot.apparmor) {
      return null;
    }
    if (!modeOverride) {
      return snapshot.apparmor;
    }
    return { ...snapshot.apparmor, mode: modeOverride };
  }, [snapshot.apparmor, modeOverride]);

  const decision = useMemo(() => {
    if (!interactiveProfile || !modeOverride) {
      return snapshot.decision;
    }
    const scenarioId =
      viewId === "apparmor-complain"
        ? "apparmor-complain"
        : viewId === "apparmor-app"
          ? "apparmor-file-denial"
          : "explore";
    const state = createInitialMacState(scenarioId);
    const profile = state.apparmorProfiles[interactiveProfile.name];
    if (profile) {
      profile.mode = modeOverride;
    }
    const path =
      snapshot.file?.path ??
      (interactiveProfile.name === "nginx"
        ? "/var/www/html/index.html"
        : "/srv/app/config.yml");
    return evaluateCombinedAccess(state, {
      profileName: interactiveProfile.name,
      path,
      op: "read",
    });
  }, [
    interactiveProfile,
    modeOverride,
    snapshot.decision,
    snapshot.file,
    viewId,
  ]);

  return (
    <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-4 sm:p-5">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight">
          Interactive Policy Explorer
        </h3>
        <p className="text-muted-foreground text-sm">
          Inspect fictional AppArmor profiles and SELinux contexts side by side.
          The models stay distinct — profiles are not labels, and labels are not
          AppArmor rules. Nothing here changes host security.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MAC_EXPLORER_VIEWS.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={item.id === viewId ? "default" : "outline"}
            onClick={() => {
              setViewId(item.id);
              setModeOverride(null);
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <Callout title={snapshot.view.label}>
        <p>{snapshot.view.description}</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Model:{" "}
          <span className="text-foreground font-medium">
            {snapshot.view.model}
          </span>
        </p>
      </Callout>

      {interactiveProfile ? (
        <ProfilePanel
          profile={interactiveProfile}
          onModeChange={
            snapshot.view.model === "apparmor"
              ? (mode) => setModeOverride(mode)
              : undefined
          }
        />
      ) : null}

      {snapshot.process || snapshot.file ? (
        <div className="border-border space-y-3 rounded-lg border p-3 sm:p-4">
          <p className="text-foreground font-medium">SELinux identities</p>
          {snapshot.process ? (
            <p className="text-sm">
              Process{" "}
              <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                {snapshot.process.command}
              </code>
              :{" "}
              <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                {formatContext(snapshot.process.selinux)}
              </code>
            </p>
          ) : null}
          {snapshot.file ? (
            <p className="text-sm">
              File{" "}
              <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                {snapshot.file.path}
              </code>
              :{" "}
              <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                {formatContext(snapshot.file.selinux)}
              </code>
              <span className="text-muted-foreground">
                {" "}
                · mode {snapshot.file.mode}
              </span>
            </p>
          ) : null}
          <dl className="grid gap-2 sm:grid-cols-2">
            {snapshot.contextExplainer.map((item) => (
              <div key={`${item.term}-${item.description}`}>
                <dt className="text-foreground text-sm font-medium">
                  {item.term}
                </dt>
                <dd className="text-muted-foreground text-sm">
                  {item.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <div
        className={cn(
          "rounded-lg border px-3 py-3 text-sm",
          MODE_STYLES[decision.allowed ? "ALLOW" : "DENY"],
        )}
        role="status"
      >
        <p className="font-medium">
          Simulated decision: {decision.allowed ? "ALLOW" : "DENY"}
        </p>
        <p className="mt-1">{decision.summary}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {decision.details.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {decision.recordedViolation ? (
          <p className="text-muted-foreground mt-2 text-xs">
            A policy violation was recorded without a hard block
            (complain/permissive teaching behavior).
          </p>
        ) : null}
      </div>

      {snapshot.recentDenials.length > 0 ? (
        <div className="space-y-2">
          <p className="text-foreground text-sm font-medium">
            Recent simulated denial events
          </p>
          <ul className="space-y-2 text-sm">
            {snapshot.recentDenials.map((event) => (
              <li
                key={`${event.timestamp}-${event.message}`}
                className="border-border rounded border px-3 py-2 font-mono text-xs"
              >
                <span className="text-muted-foreground">{event.timestamp}</span>{" "}
                [{event.source}] {event.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Callout title="How to read these systems">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>
            <strong className="text-foreground">AppArmor</strong> attaches a
            profile to an executable path and lists allowed operations.
          </li>
          <li>
            <strong className="text-foreground">SELinux</strong> labels
            processes and files; type enforcement decides allowed interactions.
          </li>
          <li>
            <strong className="text-foreground">DAC</strong> still applies first
            in this teaching model — MAC can only add further restrictions.
          </li>
          <li>
            Investigate denials and contexts before weakening policy or
            disabling MAC.
          </li>
        </ul>
      </Callout>
    </div>
  );
}
