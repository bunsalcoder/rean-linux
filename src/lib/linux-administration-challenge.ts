/**
 * Frontend-only Linux Administration Challenge incident definitions.
 * Uses simulated terminal state only — never touches the host system.
 */

import {
  createInitialBackupState,
  getFileContent,
  pathExists,
  REPORT_CONTENT,
  SIMULATED_BACKUP_HOME,
  simulateBackupsAndRecoveryCommand,
  type SimulatedBackupState,
} from "@/lib/simulate-backups-and-recovery";
import type { SimulatedDiskState } from "@/lib/simulate-disk-usage-mounts";
import {
  getMountedDevice,
  isDeviceMounted,
} from "@/lib/simulate-disk-usage-mounts";
import {
  evaluateConnection,
  hasAllowRule,
  type SimulatedFirewallState,
} from "@/lib/simulate-firewall-basics";
import type { SimulatedJournalState } from "@/lib/simulate-logs-journald";
import type { SimulatedNetTroubleshootState } from "@/lib/simulate-network-troubleshooting";
import type { SimulatedScheduledTasksState } from "@/lib/simulate-scheduled-tasks";
import type { SimulatedSshState } from "@/lib/simulate-ssh-remote-access";
import type { SimulatedServicesState } from "@/lib/simulate-system-services";
import { getSimulatedService } from "@/lib/simulate-system-services";
import {
  getTopCpuProcess,
  type SimulatedSystemMonitoringState,
} from "@/lib/simulate-system-monitoring";
import type { NetworkTroubleshootScenarioId } from "@/lib/simulate-network-troubleshooting";
import type { SshScenarioId } from "@/lib/simulate-ssh-remote-access";
import type { FirewallScenarioId } from "@/lib/simulate-firewall-basics";
import type { ScheduledTasksScenarioId } from "@/lib/simulate-scheduled-tasks";
import type { SystemMonitoringScenarioId } from "@/lib/simulate-system-monitoring";
import type { BackupScenarioId } from "@/lib/simulate-backups-and-recovery";

export type AdminIncidentId =
  | "service-outage"
  | "log-investigation"
  | "storage-inspection"
  | "disk-space"
  | "network-route"
  | "dns-investigation"
  | "ssh-access"
  | "firewall-block"
  | "cron-failure"
  | "high-cpu"
  | "file-recovery";

export type AdminTerminalMode =
  | "services"
  | "journal"
  | "diskUsage"
  | "networkTroubleshooting"
  | "sshRemoteAccess"
  | "firewallBasics"
  | "scheduledTasks"
  | "systemMonitoring"
  | "backupsAndRecovery";

export type AdminUiFixKind = "restore-default-route";

export type AdminChallengeAnswerOption = {
  key: string;
  label: string;
};

export type AdminValidationContext = {
  selectedAnswer: string | null;
  uiFixed: boolean;
  services: SimulatedServicesState | null;
  journal: SimulatedJournalState | null;
  diskUsage: SimulatedDiskState | null;
  networkTroubleshooting: SimulatedNetTroubleshootState | null;
  ssh: SimulatedSshState | null;
  firewall: SimulatedFirewallState | null;
  scheduledTasks: SimulatedScheduledTasksState | null;
  monitoring: SimulatedSystemMonitoringState | null;
  backups: SimulatedBackupState | null;
};

export type AdminIncident = {
  id: AdminIncidentId;
  number: number;
  title: string;
  sectionId: string;
  /** Stage 03 topic label for progress / review. */
  topic: string;
  /** Linked lesson path for review suggestions. */
  reviewHref: `/learn/administration/${string}`;
  report: string;
  objectives: readonly string[];
  hint1: string;
  hint2: string;
  successExplanation: string;
  terminalMode: AdminTerminalMode;
  networkTroubleshooting?: NetworkTroubleshootScenarioId;
  sshRemoteAccess?: SshScenarioId;
  firewallBasics?: FirewallScenarioId;
  scheduledTasks?: ScheduledTasksScenarioId;
  systemMonitoring?: SystemMonitoringScenarioId;
  backupsAndRecovery?: BackupScenarioId | (() => SimulatedBackupState);
  suggestions: readonly { command: string; label?: string }[];
  options?: readonly AdminChallengeAnswerOption[];
  correctAnswer?: string;
  /** Optional UI-only corrective action when the simulator cannot mutate. */
  uiFix?: {
    kind: AdminUiFixKind;
    label: string;
    description: string;
  };
  validate: (ctx: AdminValidationContext) => boolean;
};

function withMissingReport(): SimulatedBackupState {
  const archived = simulateBackupsAndRecoveryCommand(
    "tar -cvf /backups/docs-backup.tar documents/",
    createInitialBackupState("healthy"),
  ).state;
  return simulateBackupsAndRecoveryCommand("rm documents/report.txt", archived)
    .state;
}

function reportRestored(state: SimulatedBackupState | null): boolean {
  if (!state) {
    return false;
  }
  const path = `${SIMULATED_BACKUP_HOME}/documents/report.txt`;
  if (!pathExists(state, path) && !pathExists(state, "documents/report.txt")) {
    return false;
  }
  const content =
    getFileContent(state, path) ??
    getFileContent(state, "documents/report.txt");
  return content === REPORT_CONTENT;
}

export const ADMIN_INCIDENTS: readonly AdminIncident[] = [
  {
    id: "service-outage",
    number: 1,
    title: "Incident 1 — Website unreachable",
    sectionId: "incident-1-service-outage",
    topic: "System services and systemd",
    reviewHref: "/learn/administration/system-services",
    report:
      "Users report the company website returns connection errors. The host is online. Confirm what is wrong with the web service and restore it if needed.",
    objectives: [
      "Inspect the status of the simulated nginx service",
      "Apply a supported corrective action if the service is down",
      "Verify nginx is active before submitting",
    ],
    hint1: "Focus on systemd service state for the web server unit.",
    hint2:
      "Try `systemctl status nginx`, then `sudo systemctl start nginx` if it is inactive.",
    successExplanation:
      "nginx was inactive (and not enabled). Starting it with simulated `systemctl start` restored the web service without touching your host.",
    terminalMode: "services",
    suggestions: [
      { command: "systemctl status nginx", label: "status nginx" },
      { command: "systemctl is-active nginx", label: "is-active" },
      { command: "sudo systemctl start nginx", label: "start nginx" },
      { command: "help", label: "help" },
    ],
    validate: (ctx) =>
      ctx.services !== null &&
      getSimulatedService(ctx.services, "nginx")?.active === true,
  },
  {
    id: "log-investigation",
    number: 2,
    title: "Incident 2 — Failed start at boot",
    sectionId: "incident-2-log-investigation",
    topic: "Logs and journald",
    reviewHref: "/learn/administration/logs-and-journald",
    report:
      "Overnight alerts say a web unit failed during boot. Use the journal to find the evidence that explains the failure, then choose the best conclusion.",
    objectives: [
      "Filter journal entries for the nginx unit",
      "Identify the error that explains the failed start",
      "Select the conclusion that matches the evidence",
    ],
    hint1: "Journald holds the boot-time failure story for this unit.",
    hint2:
      "Run `journalctl -u nginx` (and optionally `-p err`) and read the error lines carefully.",
    successExplanation:
      "The journal shows nginx failed because its configuration contained an invalid directive — systemd then marked the unit failed. Diagnosis comes from logs, not guesswork.",
    terminalMode: "journal",
    suggestions: [
      { command: "journalctl -u nginx", label: "journalctl -u nginx" },
      { command: "journalctl -u nginx -p err", label: "errors only" },
      { command: "systemctl status nginx", label: "status nginx" },
      { command: "help", label: "help" },
    ],
    options: [
      {
        key: "A",
        label:
          "nginx failed to start because the configuration file contains an invalid directive",
      },
      {
        key: "B",
        label: "SSH stopped permanently and blocked all web traffic",
      },
      {
        key: "C",
        label: "The disk is full according to journald alone",
      },
      {
        key: "D",
        label: "cron.service crashed and took nginx with it",
      },
    ],
    correctAnswer: "A",
    validate: (ctx) => ctx.selectedAnswer === "A",
  },
  {
    id: "storage-inspection",
    number: 3,
    title: "Incident 3 — Spare volume inventory",
    sectionId: "incident-3-storage-inspection",
    topic: "Storage and filesystems",
    reviewHref: "/learn/administration/disk-usage-and-mounts",
    report:
      "Capacity planning needs a spare block device for a new data volume. Inspect simulated disks and identify which device is free and what filesystem it already has.",
    objectives: [
      "List mounts and filesystems with df/findmnt/mount",
      "Identify the unmounted spare device and its filesystem type",
      "Choose the conclusion that matches the inventory",
    ],
    hint1:
      "Compare mounted filesystems with devices that still have no mount point.",
    hint2:
      "Use `df -h`, `findmnt`, and `mount` — look for `/dev/sdb1` and its filesystem type.",
    successExplanation:
      "/dev/sdb1 is an unmounted ext4 volume — the spare data disk — while /dev/sda1 and /dev/sda2 are already mounted on / and /home.",
    terminalMode: "diskUsage",
    suggestions: [
      { command: "df -h", label: "df -h" },
      { command: "findmnt", label: "findmnt" },
      { command: "mount", label: "mount" },
      { command: "help", label: "help" },
    ],
    options: [
      {
        key: "A",
        label: "/dev/sdb1 is unmounted and already formatted as ext4",
      },
      {
        key: "B",
        label: "/dev/sda1 is unused and has no filesystem",
      },
      {
        key: "C",
        label: "/dev/sda2 is unmounted and waiting for /data",
      },
      {
        key: "D",
        label: "Every simulated disk is already mounted on /",
      },
    ],
    correctAnswer: "A",
    validate: (ctx) => ctx.selectedAnswer === "A",
  },
  {
    id: "disk-space",
    number: 4,
    title: "Incident 4 — Application data path missing",
    sectionId: "incident-4-disk-space",
    topic: "Disk usage and mounts",
    reviewHref: "/learn/administration/disk-usage-and-mounts",
    report:
      "An application expects its data directory at `/data`, but the path is empty and not backed by a mount. A spare volume was provisioned — attach it so the mount appears in df/findmnt.",
    objectives: [
      "Confirm `/data` is an available mount point and `/dev/sdb1` is free",
      "Mount `/dev/sdb1` on `/data` with a supported command",
      "Verify the mount with df or findmnt before submitting",
    ],
    hint1:
      "This is a mounts problem — look for an unmounted block device and an empty mount point.",
    hint2:
      "Try `sudo mount /dev/sdb1 /data`, then confirm with `df -h` or `findmnt`.",
    successExplanation:
      "`/dev/sdb1` was provisioned but never mounted. Mounting it on `/data` made the volume visible to the application — a common gap between “disk exists” and “path is usable”.",
    terminalMode: "diskUsage",
    suggestions: [
      { command: "df -h", label: "df -h" },
      { command: "findmnt", label: "findmnt" },
      { command: "sudo mount /dev/sdb1 /data", label: "mount sdb1" },
      { command: "help", label: "help" },
    ],
    validate: (ctx) =>
      ctx.diskUsage !== null &&
      isDeviceMounted(ctx.diskUsage, "/dev/sdb1") &&
      getMountedDevice(ctx.diskUsage, "/data")?.name === "/dev/sdb1",
  },
  {
    id: "network-route",
    number: 5,
    title: "Incident 5 — Off-LAN destinations fail",
    sectionId: "incident-5-network-route",
    topic: "Networking fundamentals",
    reviewHref: "/learn/administration/networking-fundamentals",
    report:
      "Local checks look mostly fine, but traffic to remote networks fails. Inspect interfaces and routes, then restore connectivity with the supported simulated fix.",
    objectives: [
      "Inspect link, address, and route tables",
      "Identify what is missing for off-LAN traffic",
      "Apply the simulated route restore action and verify",
    ],
    hint1: "Compare local interface health with the default route table.",
    hint2:
      "Run `ip route` and `ping 8.8.8.8`. If the default route is missing, use the on-page simulated restore action.",
    successExplanation:
      "eth0 was up with an address, but the default route was missing — remote destinations failed until the simulated default route was restored.",
    terminalMode: "networkTroubleshooting",
    networkTroubleshooting: "missing-route",
    uiFix: {
      kind: "restore-default-route",
      label: "Restore default route (simulated)",
      description:
        "Applies a safe in-memory route fix for this incident only — never changes your real network.",
    },
    suggestions: [
      { command: "ip link", label: "ip link" },
      { command: "ip addr", label: "ip addr" },
      { command: "ip route", label: "ip route" },
      { command: "ping 8.8.8.8", label: "ping 8.8.8.8" },
      { command: "help", label: "help" },
    ],
    validate: (ctx) =>
      ctx.uiFixed &&
      (ctx.networkTroubleshooting === null ||
        ctx.networkTroubleshooting.hasDefaultRoute === true),
  },
  {
    id: "dns-investigation",
    number: 6,
    title: "Incident 6 — Names fail, IPs work",
    sectionId: "incident-6-dns-investigation",
    topic: "Network troubleshooting",
    reviewHref: "/learn/administration/network-troubleshooting",
    report:
      "Operators can reach numeric addresses but hostname lookups fail. Separate DNS problems from routing or interface failures.",
    objectives: [
      "Compare IP connectivity with hostname resolution",
      "Confirm routes and interfaces are not the blocker",
      "Choose the root-cause conclusion that fits",
    ],
    hint1: "Test both IP reachability and name resolution.",
    hint2:
      "Compare `ping 8.8.8.8` with `getent hosts example.com`, and skim `ip route`.",
    successExplanation:
      "IP connectivity and routing work, but DNS resolution fails — a classic split between reachability and name lookup.",
    terminalMode: "networkTroubleshooting",
    networkTroubleshooting: "dns-failure",
    suggestions: [
      { command: "ping 8.8.8.8", label: "ping 8.8.8.8" },
      { command: "getent hosts example.com", label: "getent hosts" },
      { command: "ip route", label: "ip route" },
      { command: "ping 192.168.1.1", label: "ping gateway" },
      { command: "help", label: "help" },
    ],
    options: [
      {
        key: "A",
        label: "DNS resolution is failing while IP connectivity still works",
      },
      {
        key: "B",
        label: "eth0 is down, so nothing can leave the host",
      },
      {
        key: "C",
        label: "The default route is missing",
      },
      {
        key: "D",
        label: "Nothing is listening on TCP port 80",
      },
    ],
    correctAnswer: "A",
    validate: (ctx) =>
      ctx.selectedAnswer === "A" &&
      ctx.networkTroubleshooting !== null &&
      ctx.networkTroubleshooting.dnsWorks === false &&
      ctx.networkTroubleshooting.hasDefaultRoute === true,
  },
  {
    id: "ssh-access",
    number: 7,
    title: "Incident 7 — Remote login rejected",
    sectionId: "incident-7-ssh-access",
    topic: "SSH and remote access",
    reviewHref: "/learn/administration/ssh-and-remote-access",
    report:
      "Key-based SSH logins to the lab server fail even though a local key exists. Investigate authentication state and authorize the key with a supported command.",
    objectives: [
      "Inspect SSH service and key authorization evidence",
      "Authorize the local public key with a supported command",
      "Verify key-based auth is ready before submitting",
    ],
    hint1: "This looks like an authorization problem, not a missing local key.",
    hint2:
      "Try `ssh-copy-id user@server` after checking `systemctl status ssh` and `ss -tuln`.",
    successExplanation:
      "A local key existed but was not authorized on the server. Simulated `ssh-copy-id` added it to authorized_keys so key-based login can succeed.",
    terminalMode: "sshRemoteAccess",
    sshRemoteAccess: "key-not-authorized",
    suggestions: [
      { command: "systemctl status ssh", label: "status ssh" },
      { command: "ss -tuln", label: "ss -tuln" },
      { command: "ssh-copy-id user@server", label: "ssh-copy-id" },
      { command: "cat ~/.ssh/authorized_keys", label: "authorized_keys" },
      { command: "help", label: "help" },
    ],
    validate: (ctx) => ctx.ssh?.keyAuthorized === true,
  },
  {
    id: "firewall-block",
    number: 8,
    title: "Incident 8 — HTTP filtered",
    sectionId: "incident-8-firewall-block",
    topic: "Firewall basics",
    reviewHref: "/learn/administration/firewall-basics",
    report:
      "SSH works, but HTTP clients time out. Decide whether the service or the firewall is at fault, then open the required port with a supported rule.",
    objectives: [
      "Compare listeners (`ss`) with firewall status",
      "Allow inbound TCP 80 with a supported UFW command",
      "Verify the simulated connection succeeds",
    ],
    hint1: "Separate “not listening” from “listening but filtered”.",
    hint2:
      "Use `ss -tuln`, `sudo ufw status`, then `sudo ufw allow 80/tcp` and `check-connect 80/tcp`.",
    successExplanation:
      "nginx was listening, but default deny incoming blocked TCP 80. Adding an allow rule for 80/tcp restored simulated HTTP access.",
    terminalMode: "firewallBasics",
    firewallBasics: "http-blocked",
    suggestions: [
      { command: "ss -tuln", label: "ss -tuln" },
      { command: "sudo ufw status", label: "ufw status" },
      { command: "sudo ufw allow 80/tcp", label: "allow 80/tcp" },
      { command: "check-connect 80/tcp", label: "check 80/tcp" },
      { command: "help", label: "help" },
    ],
    validate: (ctx) =>
      ctx.firewall !== null &&
      hasAllowRule(ctx.firewall, 80, "tcp") &&
      evaluateConnection(ctx.firewall, 80, "tcp") === "success",
  },
  {
    id: "cron-failure",
    number: 9,
    title: "Incident 9 — Nightly jobs never run",
    sectionId: "incident-9-cron-failure",
    topic: "Scheduled tasks",
    reviewHref: "/learn/administration/scheduled-tasks",
    report:
      "Scheduled maintenance jobs did not run overnight. Inspect the scheduler service and restore it if it is stopped.",
    objectives: [
      "Check cron service status and crontab contents",
      "Start cron with a supported command if it is inactive",
      "Verify cron is active before submitting",
    ],
    hint1: "Jobs in a crontab do nothing if the cron daemon is down.",
    hint2:
      "Run `systemctl status cron`, then `systemctl start cron` if needed.",
    successExplanation:
      "crontab entries were present, but the cron service was stopped. Starting cron restored the scheduler without creating real host jobs.",
    terminalMode: "scheduledTasks",
    scheduledTasks: "cron-stopped",
    suggestions: [
      { command: "systemctl status cron", label: "status cron" },
      { command: "crontab -l", label: "crontab -l" },
      { command: "systemctl start cron", label: "start cron" },
      { command: "journalctl -u cron", label: "journalctl -u cron" },
      { command: "help", label: "help" },
    ],
    validate: (ctx) => ctx.scheduledTasks?.cronActive === true,
  },
  {
    id: "high-cpu",
    number: 10,
    title: "Incident 10 — Host feels sluggish",
    sectionId: "incident-10-high-cpu",
    topic: "System monitoring and resource usage",
    reviewHref: "/learn/administration/system-monitoring",
    report:
      "Interactive sessions feel slow. Inspect CPU and process evidence, then identify which process is dominating CPU time.",
    objectives: [
      "Review load and process CPU usage",
      "Identify the top CPU consumer",
      "Select the conclusion that matches the snapshot",
    ],
    hint1: "Look at process CPU percentages, not only memory.",
    hint2: "Try `top` or `ps aux` and find the process with the highest %CPU.",
    successExplanation:
      "`batch-worker` is consuming the vast majority of CPU while memory and disk look fine — a process-level CPU hotspot, not a capacity outage on disk.",
    terminalMode: "systemMonitoring",
    systemMonitoring: "high-cpu",
    suggestions: [
      { command: "top", label: "top" },
      { command: "ps aux", label: "ps aux" },
      { command: "uptime", label: "uptime" },
      { command: "free -h", label: "free -h" },
      { command: "help", label: "help" },
    ],
    options: [
      {
        key: "A",
        label: "`batch-worker` is consuming excessive CPU",
      },
      {
        key: "B",
        label: "The root filesystem is 95% full",
      },
      {
        key: "C",
        label: "`data-cache` is the top CPU consumer",
      },
      {
        key: "D",
        label: "No process is above 10% CPU",
      },
    ],
    correctAnswer: "A",
    validate: (ctx) =>
      ctx.selectedAnswer === "A" &&
      ctx.monitoring !== null &&
      getTopCpuProcess(ctx.monitoring)?.command === "batch-worker",
  },
  {
    id: "file-recovery",
    number: 11,
    title: "Incident 11 — Missing document",
    sectionId: "incident-11-file-recovery",
    topic: "Backups and recovery",
    reviewHref: "/learn/administration/backups-and-recovery",
    report:
      "A critical file under documents/ is missing after a cleanup mistake. A verified archive already exists in /backups. Restore the file safely in the simulator.",
    objectives: [
      "Confirm documents/report.txt is missing",
      "Inspect the archive under /backups",
      "Restore from the archive so report.txt returns with the expected content",
    ],
    hint1:
      "Recovery starts by confirming what is missing and which archive is intact.",
    hint2:
      "List `/backups`, then extract with `tar -xvf /backups/docs-backup.tar` (from ~) so `documents/report.txt` returns.",
    successExplanation:
      "documents/report.txt was deleted, but /backups/docs-backup.tar still held a good copy. Restoring from that archive recovered the file in the simulated lab only.",
    terminalMode: "backupsAndRecovery",
    backupsAndRecovery: withMissingReport,
    suggestions: [
      { command: "ls documents", label: "ls documents" },
      { command: "ls -lh /backups", label: "ls /backups" },
      { command: "tar -tvf /backups/docs-backup.tar", label: "list archive" },
      {
        command: "tar -xvf /backups/docs-backup.tar",
        label: "restore archive",
      },
      { command: "cat documents/report.txt", label: "cat report" },
      { command: "help", label: "help" },
    ],
    validate: (ctx) => reportRestored(ctx.backups),
  },
] as const;

export const TOTAL_ADMIN_INCIDENTS = ADMIN_INCIDENTS.length;

export function getAdminIncident(
  id: AdminIncidentId,
): AdminIncident | undefined {
  return ADMIN_INCIDENTS.find((incident) => incident.id === id);
}

export function getAdminIncidentByIndex(
  index: number,
): AdminIncident | undefined {
  return ADMIN_INCIDENTS[index];
}

/** Incidents where both hints were opened or attempts reached the soft threshold. */
export function incidentNeedsReview(
  attempts: number,
  hintsUsed: number,
): boolean {
  return attempts >= 3 || hintsUsed >= 2;
}
