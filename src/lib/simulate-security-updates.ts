/**
 * Frontend-only security updates / vulnerability-management simulation for
 * Stage 04 Lesson 07. Never runs real apt, never contacts package repositories,
 * never scans real hosts, never restarts real services, and never reboots the
 * operating system. All packages, advisories, versions, and services are
 * fictional teaching data held in memory.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_UPDATES_USER = "bunsal";
export const SIMULATED_UPDATES_HOST = "rean-patch";

export type SecurityUpdatesScenarioId =
  | "explore"
  | "identify-outdated"
  | "prioritize-critical"
  | "update-workflow"
  | "service-restart"
  | "reboot-required"
  | "patch-risk"
  | "healthy";

export type UpdateClassification = "security" | "bugfix" | "feature" | "none";

export type AdvisorySeverity = "critical" | "high" | "medium" | "low";

export type RemediationStatus =
  | "vulnerable"
  | "update-available"
  | "pending-restart"
  | "pending-reboot"
  | "remediated"
  | "not-affected";

export type RiskPriority = "immediate" | "urgent" | "planned" | "deferred";

export type SimulatedSecurityPackage = {
  name: string;
  description: string;
  installedVersion: string;
  availableVersion: string | null;
  repository: string;
  classification: UpdateClassification;
  /** What applying the available update requires after install. */
  postUpdateAction: "none" | "service-restart" | "reboot";
  serviceUnit: string | null;
};

export type SimulatedServiceRuntime = {
  unit: string;
  description: string;
  active: boolean;
  packageName: string;
  /** Version currently loaded by the running process (may lag installed). */
  runningVersion: string;
};

export type FictionalAdvisory = {
  id: string;
  title: string;
  packageName: string;
  /** Installed versions strictly less than this are affected (exclusive upper bound). */
  affectedBelow: string;
  fixedVersion: string;
  severity: AdvisorySeverity;
  cvss: number;
  exposure: string;
  networkExposed: boolean;
  exploitAvailable: boolean;
  recommendedAction: string;
  summary: string;
};

export type AdvisoryAssessment = {
  advisory: FictionalAdvisory;
  installedVersion: string | null;
  isInstalled: boolean;
  isAffected: boolean;
  fixedAvailable: boolean;
  remediationStatus: RemediationStatus;
  priority: RiskPriority;
  priorityReasons: readonly string[];
};

export type SimulatedSecurityUpdatesState = {
  scenarioId: SecurityUpdatesScenarioId;
  indexUpdated: boolean;
  packages: Record<string, SimulatedSecurityPackage>;
  services: Record<string, SimulatedServiceRuntime>;
  runningKernel: string;
  installedKernel: string;
  pendingRestarts: readonly string[];
  pendingReboot: boolean;
  /**
   * Scenario F: learner must acknowledge operational risk factors before
   * approving a potentially disruptive upgrade.
   */
  riskChecks: {
    tested: boolean;
    backupReady: boolean;
    maintenanceWindow: boolean;
    rollbackPlan: boolean;
  };
  riskApproved: boolean;
};

export type SecurityUpdatesScenarioMeta = {
  id: SecurityUpdatesScenarioId;
  label: string;
  summary: string;
};

export type SimulateSecurityUpdatesResult = {
  result: SimulateResult;
  state: SimulatedSecurityUpdatesState;
};

export const SECURITY_UPDATES_SCENARIOS: readonly SecurityUpdatesScenarioMeta[] =
  [
    {
      id: "explore",
      label: "Explore patch inventory",
      summary:
        "Baseline fictional Ubuntu-style host for inspecting packages, advisories, and services.",
    },
    {
      id: "identify-outdated",
      label: "Identify outdated packages",
      summary:
        "Several installed packages have available updates — inventory what needs attention.",
    },
    {
      id: "prioritize-critical",
      label: "Prioritize a critical advisory",
      summary:
        "A network-exposed service is affected by a fictional critical advisory with a fix available.",
    },
    {
      id: "update-workflow",
      label: "Security update workflow",
      summary:
        "Refresh package metadata, inspect upgradable packages, and apply upgrades correctly.",
    },
    {
      id: "service-restart",
      label: "Service restart required",
      summary:
        "A security update is installed, but the service still runs the previous runtime version.",
    },
    {
      id: "reboot-required",
      label: "Kernel reboot required",
      summary:
        "A kernel package update is installed, but the running kernel has not changed.",
    },
    {
      id: "patch-risk",
      label: "Patch risk assessment",
      summary:
        "Evaluate testing, backup, maintenance-window, and rollback factors before approving a change.",
    },
    {
      id: "healthy",
      label: "Patched baseline",
      summary:
        "Packages and runtime versions are aligned — use this to confirm a clean recheck.",
    },
  ] as const;

const SCENARIO_IDS = new Set<string>(
  SECURITY_UPDATES_SCENARIOS.map((scenario) => scenario.id),
);

export function isSecurityUpdatesScenarioId(
  value: string,
): value is SecurityUpdatesScenarioId {
  return SCENARIO_IDS.has(value);
}

export function getSecurityUpdatesScenario(
  id: SecurityUpdatesScenarioId,
): SecurityUpdatesScenarioMeta {
  return (
    SECURITY_UPDATES_SCENARIOS.find((scenario) => scenario.id === id) ??
    SECURITY_UPDATES_SCENARIOS[0]!
  );
}

/** Fictional advisories — DEMO-* identifiers only; not real CVEs. */
export const FICTIONAL_ADVISORIES: readonly FictionalAdvisory[] = [
  {
    id: "DEMO-2026-001",
    title: "Remote code execution in OpenSSH server (fictional)",
    packageName: "openssh-server",
    affectedBelow: "1:9.6p1-3ubuntu13.6",
    fixedVersion: "1:9.6p1-3ubuntu13.6",
    severity: "critical",
    cvss: 9.8,
    exposure: "SSH daemon listening on the public management interface",
    networkExposed: true,
    exploitAvailable: true,
    recommendedAction:
      "Upgrade openssh-server to the fixed version and restart ssh.",
    summary:
      "Fictional teaching advisory: a crafted authentication exchange could allow remote code execution on unpatched OpenSSH servers.",
  },
  {
    id: "DEMO-2026-002",
    title: "HTTP request smuggling in nginx (fictional)",
    packageName: "nginx",
    affectedBelow: "1.24.0-2ubuntu0.2",
    fixedVersion: "1.24.0-2ubuntu0.2",
    severity: "high",
    cvss: 7.5,
    exposure: "Public reverse proxy terminating TLS for web traffic",
    networkExposed: true,
    exploitAvailable: false,
    recommendedAction: "Upgrade nginx and reload or restart the nginx service.",
    summary:
      "Fictional teaching advisory: crafted requests could confuse proxy routing on affected nginx builds.",
  },
  {
    id: "DEMO-2026-003",
    title: "Certificate parsing flaw in OpenSSL (fictional)",
    packageName: "openssl",
    affectedBelow: "3.0.13-0ubuntu3.3",
    fixedVersion: "3.0.13-0ubuntu3.3",
    severity: "high",
    cvss: 7.4,
    exposure: "Library used by TLS clients and servers on this host",
    networkExposed: false,
    exploitAvailable: false,
    recommendedAction:
      "Upgrade openssl and restart services that load libssl (for example nginx and ssh).",
    summary:
      "Fictional teaching advisory: malformed certificates could cause denial of service in OpenSSL parsers.",
  },
  {
    id: "DEMO-2026-004",
    title: "Privilege escalation in sudo (fictional)",
    packageName: "sudo",
    affectedBelow: "1.9.15p5-3ubuntu5.1",
    fixedVersion: "1.9.15p5-3ubuntu5.1",
    severity: "medium",
    cvss: 6.3,
    exposure: "Local privilege boundary for administrators",
    networkExposed: false,
    exploitAvailable: true,
    recommendedAction: "Upgrade sudo; no daemon restart is typically required.",
    summary:
      "Fictional teaching advisory: a local user with limited sudo rights might escalate under specific policy conditions.",
  },
  {
    id: "DEMO-2026-005",
    title: "Container runtime isolation bypass (fictional)",
    packageName: "docker.io",
    affectedBelow: "24.0.7-0ubuntu4.1",
    fixedVersion: "24.0.7-0ubuntu4.1",
    severity: "high",
    cvss: 8.1,
    exposure: "Docker daemon used by developers on this host",
    networkExposed: false,
    exploitAvailable: false,
    recommendedAction:
      "Upgrade docker.io and restart the docker service during a maintenance window.",
    summary:
      "Fictional teaching advisory: a crafted container image might escape intended isolation on affected docker.io builds.",
  },
  {
    id: "DEMO-2026-006",
    title: "Kernel network stack denial of service (fictional)",
    packageName: "linux-image-generic",
    affectedBelow: "6.8.0-45.45",
    fixedVersion: "6.8.0-45.45",
    severity: "medium",
    cvss: 5.9,
    exposure: "Host kernel handling network packets",
    networkExposed: true,
    exploitAvailable: false,
    recommendedAction:
      "Install the fixed kernel package and reboot into the new kernel.",
    summary:
      "Fictional teaching advisory: specially crafted packets could trigger a denial of service in the kernel network path.",
  },
] as const;

const HELP_OUTPUT = [
  "Available commands (educational simulation):",
  "",
  "  help                         Show this help",
  "  sudo apt update              Refresh package metadata (does not upgrade)",
  "  apt list --upgradable        List packages with available updates",
  "  sudo apt upgrade             Apply available upgrades",
  "  sudo apt full-upgrade        Apply upgrades allowing dependency changes",
  "  apt show NAME                Show package details",
  "  apt policy NAME              Show installed vs candidate versions",
  "  apt changelog NAME           Show fictional security changelog notes",
  "  sudo apt install NAME        Install or upgrade a specific package",
  "  sudo apt remove NAME         Remove an installed package",
  "  uname -r                     Show the running kernel release",
  "  systemctl status UNIT        Show a fictional service unit",
  "  sudo systemctl restart UNIT  Restart a fictional service",
  "  journalctl -u UNIT           Show recent fictional service journal lines",
  "  sudo reboot                  Simulated reboot (updates running kernel)",
  "  assess-risk FLAG on|off      Toggle patch-risk checklist flags",
  "  approve-change               Approve change after risk checks",
  "  clear                        Clear the terminal screen",
  "",
  "Examples:",
  "  sudo apt update",
  "  apt list --upgradable",
  "  apt show nginx",
  "  sudo apt upgrade",
  "  sudo systemctl restart nginx",
  "  sudo reboot",
  "",
  "This terminal never runs real package managers, never contacts",
  "repositories, and never restarts or reboots the real system.",
  "Advisory IDs use DEMO-* labels and are not real CVEs.",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const PERMISSION_DENIED = [
  "E: Permission denied",
  "E: Are you root? Use sudo for package and service changes.",
] as const;

const REPOSITORY = "http://archive.ubuntu.demo/ubuntu jammy-security/main";

function basePackages(): Record<string, SimulatedSecurityPackage> {
  return {
    "openssh-server": {
      name: "openssh-server",
      description:
        "secure shell (SSH) server, for secure access from remote machines",
      installedVersion: "1:9.6p1-3ubuntu13.4",
      availableVersion: "1:9.6p1-3ubuntu13.6",
      repository: REPOSITORY,
      classification: "security",
      postUpdateAction: "service-restart",
      serviceUnit: "ssh",
    },
    nginx: {
      name: "nginx",
      description: "small, powerful, scalable web/proxy server",
      installedVersion: "1.24.0-2ubuntu0.1",
      availableVersion: "1.24.0-2ubuntu0.2",
      repository: REPOSITORY,
      classification: "security",
      postUpdateAction: "service-restart",
      serviceUnit: "nginx",
    },
    openssl: {
      name: "openssl",
      description: "Secure Sockets Layer toolkit - cryptographic utility",
      installedVersion: "3.0.13-0ubuntu3.1",
      availableVersion: "3.0.13-0ubuntu3.3",
      repository: REPOSITORY,
      classification: "security",
      postUpdateAction: "service-restart",
      serviceUnit: null,
    },
    curl: {
      name: "curl",
      description: "command line tool for transferring data with URL syntax",
      installedVersion: "8.5.0-2ubuntu10.4",
      availableVersion: "8.5.0-2ubuntu10.6",
      repository: REPOSITORY,
      classification: "bugfix",
      postUpdateAction: "none",
      serviceUnit: null,
    },
    sudo: {
      name: "sudo",
      description: "Provide limited super user privileges to specific users",
      installedVersion: "1.9.15p5-3ubuntu5",
      availableVersion: "1.9.15p5-3ubuntu5.1",
      repository: REPOSITORY,
      classification: "security",
      postUpdateAction: "none",
      serviceUnit: null,
    },
    "docker.io": {
      name: "docker.io",
      description: "Linux container runtime",
      installedVersion: "24.0.7-0ubuntu4",
      availableVersion: "24.0.7-0ubuntu4.1",
      repository: REPOSITORY,
      classification: "security",
      postUpdateAction: "service-restart",
      serviceUnit: "docker",
    },
    "linux-image-generic": {
      name: "linux-image-generic",
      description: "Generic Linux kernel image",
      installedVersion: "6.8.0-40.40",
      availableVersion: "6.8.0-45.45",
      repository: REPOSITORY,
      classification: "security",
      postUpdateAction: "reboot",
      serviceUnit: null,
    },
  };
}

function baseServices(
  packages: Record<string, SimulatedSecurityPackage>,
): Record<string, SimulatedServiceRuntime> {
  return {
    ssh: {
      unit: "ssh",
      description: "OpenBSD Secure Shell server",
      active: true,
      packageName: "openssh-server",
      runningVersion: packages["openssh-server"]!.installedVersion,
    },
    nginx: {
      unit: "nginx",
      description: "A high performance web server and a reverse proxy server",
      active: true,
      packageName: "nginx",
      runningVersion: packages.nginx!.installedVersion,
    },
    docker: {
      unit: "docker",
      description: "Docker Application Container Engine",
      active: true,
      packageName: "docker.io",
      runningVersion: packages["docker.io"]!.installedVersion,
    },
  };
}

function emptyRiskChecks(): SimulatedSecurityUpdatesState["riskChecks"] {
  return {
    tested: false,
    backupReady: false,
    maintenanceWindow: false,
    rollbackPlan: false,
  };
}

function scenarioState(
  scenarioId: SecurityUpdatesScenarioId,
): SimulatedSecurityUpdatesState {
  const packages = basePackages();
  const services = baseServices(packages);
  const runningKernel = "6.8.0-40-generic";
  const installedKernel = packages["linux-image-generic"]!.installedVersion;

  const base: SimulatedSecurityUpdatesState = {
    scenarioId,
    indexUpdated: false,
    packages,
    services,
    runningKernel,
    installedKernel,
    pendingRestarts: [],
    pendingReboot: false,
    riskChecks: emptyRiskChecks(),
    riskApproved: false,
  };

  switch (scenarioId) {
    case "explore":
    case "identify-outdated":
    case "prioritize-critical":
    case "update-workflow":
      return base;

    case "service-restart": {
      // nginx security update already installed; runtime still old.
      const nextPackages = { ...packages };
      nextPackages.nginx = {
        ...packages.nginx!,
        installedVersion: packages.nginx!.availableVersion!,
        availableVersion: null,
        classification: "none",
      };
      const nextServices = { ...services };
      nextServices.nginx = {
        ...services.nginx!,
        runningVersion: packages.nginx!.installedVersion,
      };
      return {
        ...base,
        indexUpdated: true,
        packages: nextPackages,
        services: nextServices,
        pendingRestarts: ["nginx"],
      };
    }

    case "reboot-required": {
      const nextPackages = { ...packages };
      nextPackages["linux-image-generic"] = {
        ...packages["linux-image-generic"]!,
        installedVersion: packages["linux-image-generic"]!.availableVersion!,
        availableVersion: null,
        classification: "none",
      };
      return {
        ...base,
        indexUpdated: true,
        packages: nextPackages,
        installedKernel: nextPackages["linux-image-generic"]!.installedVersion,
        runningKernel: "6.8.0-40-generic",
        pendingReboot: true,
      };
    }

    case "patch-risk": {
      // docker.io security update available; disruptive restart needed.
      return {
        ...base,
        indexUpdated: true,
      };
    }

    case "healthy": {
      const nextPackages: Record<string, SimulatedSecurityPackage> = {};
      for (const [name, pkg] of Object.entries(packages)) {
        const fixed = pkg.availableVersion ?? pkg.installedVersion;
        nextPackages[name] = {
          ...pkg,
          installedVersion: fixed,
          availableVersion: null,
          classification: "none",
        };
      }
      const nextServices = baseServices(nextPackages);
      return {
        ...base,
        indexUpdated: true,
        packages: nextPackages,
        services: nextServices,
        installedKernel: nextPackages["linux-image-generic"]!.installedVersion,
        runningKernel: "6.8.0-45-generic",
        pendingRestarts: [],
        pendingReboot: false,
        riskApproved: true,
        riskChecks: {
          tested: true,
          backupReady: true,
          maintenanceWindow: true,
          rollbackPlan: true,
        },
      };
    }

    default:
      return base;
  }
}

/**
 * Compare Debian-style version strings for this lesson's fictional catalog.
 * Returns negative if a < b, zero if equal, positive if a > b.
 */
export function comparePackageVersions(a: string, b: string): number {
  const normalize = (value: string) =>
    value
      .replace(/^[^:]+:/, "")
      .replace(/[^0-9A-Za-z.]+/g, ".")
      .replace(/^\.+|\.+$/g, "")
      .split(".")
      .filter(Boolean);

  const left = normalize(a);
  const right = normalize(b);
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const lRaw = left[index] ?? "0";
    const rRaw = right[index] ?? "0";
    const lNum = Number.parseInt(lRaw, 10);
    const rNum = Number.parseInt(rRaw, 10);
    const lIsNum = /^\d+$/.test(lRaw);
    const rIsNum = /^\d+$/.test(rRaw);

    if (lIsNum && rIsNum) {
      if (lNum !== rNum) {
        return lNum - rNum;
      }
      continue;
    }

    if (lRaw !== rRaw) {
      return lRaw < rRaw ? -1 : 1;
    }
  }

  return 0;
}

export function isVersionAffected(
  installedVersion: string,
  affectedBelow: string,
): boolean {
  return comparePackageVersions(installedVersion, affectedBelow) < 0;
}

function clonePackages(
  packages: Record<string, SimulatedSecurityPackage>,
): Record<string, SimulatedSecurityPackage> {
  const next: Record<string, SimulatedSecurityPackage> = {};
  for (const [name, pkg] of Object.entries(packages)) {
    next[name] = { ...pkg };
  }
  return next;
}

function cloneServices(
  services: Record<string, SimulatedServiceRuntime>,
): Record<string, SimulatedServiceRuntime> {
  const next: Record<string, SimulatedServiceRuntime> = {};
  for (const [name, service] of Object.entries(services)) {
    next[name] = { ...service };
  }
  return next;
}

export function cloneSecurityUpdatesState(
  state: SimulatedSecurityUpdatesState,
): SimulatedSecurityUpdatesState {
  return {
    scenarioId: state.scenarioId,
    indexUpdated: state.indexUpdated,
    packages: clonePackages(state.packages),
    services: cloneServices(state.services),
    runningKernel: state.runningKernel,
    installedKernel: state.installedKernel,
    pendingRestarts: [...state.pendingRestarts],
    pendingReboot: state.pendingReboot,
    riskChecks: { ...state.riskChecks },
    riskApproved: state.riskApproved,
  };
}

export function createInitialSecurityUpdatesState(
  scenarioId: SecurityUpdatesScenarioId = "explore",
): SimulatedSecurityUpdatesState {
  return cloneSecurityUpdatesState(scenarioState(scenarioId));
}

export function formatSecurityUpdatesPrompt(): string {
  return `${SIMULATED_UPDATES_USER}@${SIMULATED_UPDATES_HOST}:~$`;
}

function findPackage(
  state: SimulatedSecurityUpdatesState,
  name: string,
): SimulatedSecurityPackage | undefined {
  const key = name.toLowerCase();
  return (
    state.packages[key] ??
    Object.values(state.packages).find((pkg) => pkg.name.toLowerCase() === key)
  );
}

function findService(
  state: SimulatedSecurityUpdatesState,
  unit: string,
): SimulatedServiceRuntime | undefined {
  const key = unit.toLowerCase().replace(/\.service$/, "");
  return state.services[key];
}

function upgradablePackages(
  state: SimulatedSecurityUpdatesState,
): SimulatedSecurityPackage[] {
  return Object.values(state.packages).filter(
    (pkg) => pkg.availableVersion !== null,
  );
}

function markPendingAfterUpgrade(
  state: SimulatedSecurityUpdatesState,
  pkg: SimulatedSecurityPackage,
): {
  pendingRestarts: string[];
  pendingReboot: boolean;
  services: Record<string, SimulatedServiceRuntime>;
  installedKernel: string;
} {
  const services = cloneServices(state.services);
  const pendingRestarts = new Set(state.pendingRestarts);
  let pendingReboot = state.pendingReboot;
  let installedKernel = state.installedKernel;

  if (pkg.postUpdateAction === "service-restart" && pkg.serviceUnit) {
    pendingRestarts.add(pkg.serviceUnit);
  }

  if (pkg.name === "openssl") {
    for (const unit of ["nginx", "ssh"] as const) {
      if (services[unit]) {
        pendingRestarts.add(unit);
      }
    }
  }

  if (pkg.postUpdateAction === "reboot" || pkg.name === "linux-image-generic") {
    pendingReboot = true;
    installedKernel = pkg.installedVersion;
  }

  return {
    pendingRestarts: [...pendingRestarts],
    pendingReboot,
    services,
    installedKernel,
  };
}

function applyPackageUpgrade(
  state: SimulatedSecurityUpdatesState,
  name: string,
): {
  state: SimulatedSecurityUpdatesState;
  upgraded: boolean;
  message: string[];
} {
  const pkg = findPackage(state, name);
  if (!pkg) {
    return {
      state,
      upgraded: false,
      message: [`E: Unable to locate package ${name}`],
    };
  }
  if (!pkg.availableVersion) {
    return {
      state,
      upgraded: false,
      message: [
        `${pkg.name} is already the newest version (${pkg.installedVersion}).`,
      ],
    };
  }

  const next = cloneSecurityUpdatesState(state);
  const updated: SimulatedSecurityPackage = {
    ...pkg,
    installedVersion: pkg.availableVersion,
    availableVersion: null,
    classification: "none",
  };
  next.packages[pkg.name] = updated;
  const pending = markPendingAfterUpgrade(next, updated);
  next.pendingRestarts = pending.pendingRestarts;
  next.pendingReboot = pending.pendingReboot;
  next.services = pending.services;
  next.installedKernel = pending.installedKernel;

  return {
    state: next,
    upgraded: true,
    message: [
      `Unpacking ${pkg.name} (${updated.installedVersion}) over (${pkg.installedVersion}) ...`,
      `Setting up ${pkg.name} (${updated.installedVersion}) ...`,
    ],
  };
}

function prioritizeAdvisory(
  advisory: FictionalAdvisory,
  state: SimulatedSecurityUpdatesState,
): {
  priority: RiskPriority;
  reasons: string[];
  remediationStatus: RemediationStatus;
  isAffected: boolean;
  fixedAvailable: boolean;
  isInstalled: boolean;
  installedVersion: string | null;
} {
  const pkg = state.packages[advisory.packageName];
  const installedVersion = pkg?.installedVersion ?? null;
  const isInstalled = Boolean(pkg);
  const isAffected =
    isInstalled &&
    installedVersion !== null &&
    isVersionAffected(installedVersion, advisory.affectedBelow);
  const fixedAvailable =
    isAffected &&
    (pkg?.availableVersion !== null
      ? comparePackageVersions(
          pkg!.availableVersion ?? "",
          advisory.fixedVersion,
        ) >= 0 ||
        comparePackageVersions(pkg!.installedVersion, advisory.fixedVersion) >=
          0
      : comparePackageVersions(pkg!.installedVersion, advisory.fixedVersion) >=
        0);

  let remediationStatus: RemediationStatus = "not-affected";
  if (!isInstalled) {
    remediationStatus = "not-affected";
  } else if (isAffected) {
    if (
      pkg?.availableVersion &&
      comparePackageVersions(pkg.availableVersion, advisory.fixedVersion) >= 0
    ) {
      remediationStatus = "update-available";
    } else if (
      comparePackageVersions(pkg!.installedVersion, advisory.fixedVersion) >= 0
    ) {
      remediationStatus = "remediated";
    } else {
      remediationStatus = "vulnerable";
    }
  } else if (
    pkg &&
    comparePackageVersions(pkg.installedVersion, advisory.fixedVersion) >= 0
  ) {
    const unit = pkg.serviceUnit;
    if (unit && state.pendingRestarts.includes(unit)) {
      remediationStatus = "pending-restart";
    } else if (pkg.name === "linux-image-generic" && state.pendingReboot) {
      remediationStatus = "pending-reboot";
    } else if (
      pkg.name === "linux-image-generic" &&
      !state.runningKernel.includes(
        pkg.installedVersion
          .replace(/\.\d+$/, "")
          .replace(/^(\d+\.\d+\.\d+-\d+).*/, "$1"),
      ) &&
      state.runningKernel.startsWith("6.8.0-40")
    ) {
      // If kernel package is fixed but still on old running kernel without pending flag
      remediationStatus = state.pendingReboot ? "pending-reboot" : "remediated";
    } else {
      remediationStatus = "remediated";
    }
  }

  // Refine pending restart/reboot when package already at fixed version.
  if (
    pkg &&
    !isAffected &&
    comparePackageVersions(pkg.installedVersion, advisory.fixedVersion) >= 0
  ) {
    if (pkg.serviceUnit && state.pendingRestarts.includes(pkg.serviceUnit)) {
      remediationStatus = "pending-restart";
    } else if (pkg.name === "linux-image-generic" && state.pendingReboot) {
      remediationStatus = "pending-reboot";
    }
  }

  const reasons: string[] = [];
  reasons.push(`Severity: ${advisory.severity} (CVSS-style ${advisory.cvss})`);
  reasons.push(
    isInstalled
      ? `Package ${advisory.packageName} is installed (${installedVersion}).`
      : `Package ${advisory.packageName} is not installed.`,
  );
  reasons.push(
    isAffected
      ? "Installed version matches the advisory affected-version rule."
      : "Installed version is outside the advisory affected range (or not installed).",
  );
  reasons.push(
    advisory.networkExposed
      ? "Component is described as network-exposed in this scenario."
      : "Component is not described as network-exposed.",
  );
  reasons.push(
    advisory.exploitAvailable
      ? "A known exploit is available in this fictional scenario."
      : "No known exploit is listed in this fictional scenario.",
  );
  reasons.push(
    pkg?.availableVersion
      ? `Fixed/candidate version available: ${pkg.availableVersion}.`
      : fixedAvailable ||
          (pkg &&
            comparePackageVersions(
              pkg.installedVersion,
              advisory.fixedVersion,
            ) >= 0)
        ? `Fixed version present or already installed (${advisory.fixedVersion}).`
        : "No fixed package version is currently available in the index.",
  );

  let priority: RiskPriority = "deferred";
  if (!isAffected) {
    priority = "deferred";
    reasons.push("Priority deferred because the host is not affected.");
  } else if (
    advisory.severity === "critical" &&
    advisory.networkExposed &&
    advisory.exploitAvailable &&
    (pkg?.availableVersion || fixedAvailable)
  ) {
    priority = "immediate";
    reasons.push(
      "Immediate: critical, network-exposed, exploit available, and a fix exists.",
    );
  } else if (
    (advisory.severity === "critical" || advisory.severity === "high") &&
    (advisory.networkExposed || advisory.exploitAvailable) &&
    pkg?.availableVersion
  ) {
    priority = "urgent";
    reasons.push(
      "Urgent: high/critical impact with exposure or exploitability and an available update.",
    );
  } else if (isAffected && pkg?.availableVersion) {
    priority = "planned";
    reasons.push(
      "Planned: affected with an available update — schedule within normal patch cycles.",
    );
  } else if (isAffected) {
    priority = "planned";
    reasons.push(
      "Planned: affected but no candidate fix in the current index — mitigate and watch for updates.",
    );
  }

  return {
    priority,
    reasons,
    remediationStatus,
    isAffected,
    fixedAvailable: Boolean(
      pkg?.availableVersion ||
      (pkg &&
        comparePackageVersions(pkg.installedVersion, advisory.fixedVersion) >=
          0),
    ),
    isInstalled,
    installedVersion,
  };
}

export function assessAdvisory(
  advisoryId: string,
  state: SimulatedSecurityUpdatesState,
): AdvisoryAssessment | null {
  const advisory = FICTIONAL_ADVISORIES.find((item) => item.id === advisoryId);
  if (!advisory) {
    return null;
  }
  const result = prioritizeAdvisory(advisory, state);
  return {
    advisory,
    installedVersion: result.installedVersion,
    isInstalled: result.isInstalled,
    isAffected: result.isAffected,
    fixedAvailable: result.fixedAvailable,
    remediationStatus: result.remediationStatus,
    priority: result.priority,
    priorityReasons: result.reasons,
  };
}

export function assessAllAdvisories(
  state: SimulatedSecurityUpdatesState,
): readonly AdvisoryAssessment[] {
  return FICTIONAL_ADVISORIES.map((advisory) =>
    assessAdvisory(advisory.id, state)!,
  );
}

export function listOutdatedPackages(
  state: SimulatedSecurityUpdatesState,
): readonly SimulatedSecurityPackage[] {
  return upgradablePackages(state);
}

export function hasRefreshedIndex(
  state: SimulatedSecurityUpdatesState,
): boolean {
  return state.indexUpdated;
}

export function hasAppliedSecurityUpgrades(
  state: SimulatedSecurityUpdatesState,
): boolean {
  const securityNames = [
    "openssh-server",
    "nginx",
    "openssl",
    "sudo",
    "docker.io",
    "linux-image-generic",
  ];
  return securityNames.every((name) => {
    const pkg = state.packages[name];
    if (!pkg) {
      return false;
    }
    return pkg.availableVersion === null;
  });
}

export function nginxPendingRestart(
  state: SimulatedSecurityUpdatesState,
): boolean {
  return state.pendingRestarts.includes("nginx");
}

export function nginxRuntimeMatchesInstalled(
  state: SimulatedSecurityUpdatesState,
): boolean {
  const pkg = state.packages.nginx;
  const service = state.services.nginx;
  if (!pkg || !service) {
    return false;
  }
  return (
    !state.pendingRestarts.includes("nginx") &&
    service.runningVersion === pkg.installedVersion
  );
}

export function kernelUpdateInstalled(
  state: SimulatedSecurityUpdatesState,
): boolean {
  const pkg = state.packages["linux-image-generic"];
  if (!pkg) {
    return false;
  }
  return (
    comparePackageVersions(pkg.installedVersion, "6.8.0-45.45") >= 0 &&
    pkg.availableVersion === null
  );
}

export function runningKernelIsUpdated(
  state: SimulatedSecurityUpdatesState,
): boolean {
  return (
    !state.pendingReboot &&
    (state.runningKernel.includes("6.8.0-45") || state.scenarioId === "healthy")
  );
}

export function patchRiskApproved(
  state: SimulatedSecurityUpdatesState,
): boolean {
  const { riskChecks, riskApproved } = state;
  return (
    riskApproved &&
    riskChecks.tested &&
    riskChecks.backupReady &&
    riskChecks.maintenanceWindow &&
    riskChecks.rollbackPlan
  );
}

export function criticalSshPriorityIsImmediate(
  state: SimulatedSecurityUpdatesState,
): boolean {
  const assessment = assessAdvisory("DEMO-2026-001", state);
  return assessment?.priority === "immediate" && assessment.isAffected;
}

export function opensshRemediated(
  state: SimulatedSecurityUpdatesState,
): boolean {
  const pkg = state.packages["openssh-server"];
  const service = state.services.ssh;
  if (!pkg || !service) {
    return false;
  }
  return (
    comparePackageVersions(pkg.installedVersion, "1:9.6p1-3ubuntu13.6") >= 0 &&
    !state.pendingRestarts.includes("ssh") &&
    service.runningVersion === pkg.installedVersion
  );
}

function requireIndex(
  state: SimulatedSecurityUpdatesState,
): SimulateSecurityUpdatesResult | null {
  if (state.indexUpdated) {
    return null;
  }
  return {
    result: {
      kind: "output",
      lines: [
        "WARNING: package metadata has not been refreshed in this session.",
        "Run `sudo apt update` first so available versions reflect the current index.",
        "(Educational note: apt update refreshes metadata; it does not upgrade packages.)",
      ],
    },
    state,
  };
}

function handleApt(
  tokens: string[],
  state: SimulatedSecurityUpdatesState,
  elevated: boolean,
): SimulateSecurityUpdatesResult {
  const sub = tokens[0]?.toLowerCase();

  if (!sub || sub === "--help" || sub === "-h") {
    return {
      result: {
        kind: "output",
        lines: [
          "apt — educational package workflow",
          "",
          "update         Refresh package metadata (does not install upgrades)",
          "list --upgradable",
          "upgrade        Install available upgrades",
          "full-upgrade   Upgrade, allowing dependency changes",
          "show PKG       Show package details",
          "policy PKG     Show installed and candidate versions",
          "changelog PKG  Show fictional advisory notes",
          "install PKG    Install or upgrade a package",
          "remove PKG     Remove a package",
        ],
      },
      state,
    };
  }

  if (sub === "update") {
    if (!elevated) {
      return {
        result: { kind: "output", lines: [...PERMISSION_DENIED] },
        state,
      };
    }
    const next = cloneSecurityUpdatesState(state);
    next.indexUpdated = true;
    return {
      result: {
        kind: "output",
        lines: [
          "Hit:1 http://archive.ubuntu.demo/ubuntu jammy InRelease",
          "Get:2 http://archive.ubuntu.demo/ubuntu jammy-security InRelease [48.2 kB]",
          "Get:3 http://archive.ubuntu.demo/ubuntu jammy-updates InRelease [55.7 kB]",
          "Fetched 103 kB in 0s (simulated)",
          "Reading package lists... Done",
          "Building dependency tree... Done",
          "",
          "Note: apt update refreshed metadata only. Installed package versions",
          "are unchanged until you run apt upgrade / apt full-upgrade / apt install.",
        ],
      },
      state: next,
    };
  }

  if (sub === "list") {
    if (tokens[1]?.toLowerCase() !== "--upgradable") {
      return {
        result: {
          kind: "output",
          lines: ["Unsupported apt list form. Use: apt list --upgradable"],
        },
        state,
      };
    }
    const blocked = requireIndex(state);
    if (blocked) {
      return blocked;
    }
    const items = upgradablePackages(state);
    if (items.length === 0) {
      return {
        result: {
          kind: "output",
          lines: ["Listing... Done"],
        },
        state,
      };
    }
    const lines = [
      "Listing... Done",
      ...items.map(
        (pkg) =>
          `${pkg.name}/jammy-security ${pkg.availableVersion} amd64 [upgradable from: ${pkg.installedVersion}]`,
      ),
    ];
    return { result: { kind: "output", lines }, state };
  }

  if (sub === "upgrade" || sub === "full-upgrade") {
    if (!elevated) {
      return {
        result: { kind: "output", lines: [...PERMISSION_DENIED] },
        state,
      };
    }
    const blocked = requireIndex(state);
    if (blocked) {
      return blocked;
    }
    const items = upgradablePackages(state);
    if (items.length === 0) {
      return {
        result: {
          kind: "output",
          lines: [
            "Reading package lists... Done",
            "Building dependency tree... Done",
            "Calculating upgrade... Done",
            "0 upgraded, 0 newly installed, 0 to remove.",
          ],
        },
        state,
      };
    }

    let next = cloneSecurityUpdatesState(state);
    const detail: string[] = [];
    for (const pkg of items) {
      // In patch-risk scenario, block docker.io until risk is approved.
      if (
        next.scenarioId === "patch-risk" &&
        pkg.name === "docker.io" &&
        !patchRiskApproved(next)
      ) {
        detail.push(
          `Skipping ${pkg.name}: complete assess-risk checklist and approve-change first.`,
        );
        continue;
      }
      const applied = applyPackageUpgrade(next, pkg.name);
      next = applied.state;
      detail.push(...applied.message);
    }

    const remaining = upgradablePackages(next).length;
    const upgradedCount = items.length - remaining;
    const lines = [
      "Reading package lists... Done",
      "Building dependency tree... Done",
      "Calculating upgrade... Done",
      `The following packages will be upgraded:`,
      ...items.map((pkg) => `  ${pkg.name}`),
      `${upgradedCount} upgraded, 0 newly installed, 0 to remove.`,
      ...detail,
    ];
    if (next.pendingRestarts.length > 0) {
      lines.push(
        `Pending service restarts: ${next.pendingRestarts.join(", ")}`,
      );
    }
    if (next.pendingReboot) {
      lines.push(
        "A system reboot is required to boot the new kernel (simulated).",
      );
    }
    return { result: { kind: "output", lines }, state: next };
  }

  if (sub === "show") {
    const name = tokens[1];
    if (!name) {
      return {
        result: {
          kind: "output",
          lines: ["E: Usage: apt show NAME"],
        },
        state,
      };
    }
    const pkg = findPackage(state, name);
    if (!pkg) {
      return {
        result: {
          kind: "output",
          lines: [`E: No packages found matching ${name}`],
        },
        state,
      };
    }
    return {
      result: {
        kind: "output",
        lines: [
          `Package: ${pkg.name}`,
          `Version: ${pkg.installedVersion}`,
          `Candidate: ${pkg.availableVersion ?? pkg.installedVersion}`,
          `Priority: optional`,
          `Section: ${pkg.classification === "security" ? "security" : "utils"}`,
          `Origin: Ubuntu (fictional)`,
          `Maintainer: Ubuntu Demo Security Team <security@ubuntu.demo>`,
          `Download-Size: 1,024 kB`,
          `APT-Sources: ${pkg.repository}`,
          `Description: ${pkg.description}`,
          "",
          `Update-Classification: ${pkg.classification}`,
          `Post-Update-Action: ${pkg.postUpdateAction}`,
        ],
      },
      state,
    };
  }

  if (sub === "policy") {
    const name = tokens[1];
    if (!name) {
      return {
        result: {
          kind: "output",
          lines: ["E: Usage: apt policy NAME"],
        },
        state,
      };
    }
    const pkg = findPackage(state, name);
    if (!pkg) {
      return {
        result: {
          kind: "output",
          lines: [`N: Unable to locate package ${name}`],
        },
        state,
      };
    }
    return {
      result: {
        kind: "output",
        lines: [
          `${pkg.name}:`,
          `  Installed: ${pkg.installedVersion}`,
          `  Candidate: ${pkg.availableVersion ?? pkg.installedVersion}`,
          `  Version table:`,
          ...(pkg.availableVersion
            ? [
                ` *** ${pkg.availableVersion} 500`,
                `        500 ${pkg.repository} amd64 Packages`,
                `     ${pkg.installedVersion} 100`,
                `        100 ${pkg.repository} amd64 Packages`,
              ]
            : [
                ` *** ${pkg.installedVersion} 100`,
                `        100 ${pkg.repository} amd64 Packages`,
              ]),
        ],
      },
      state,
    };
  }

  if (sub === "changelog") {
    const name = tokens[1];
    if (!name) {
      return {
        result: {
          kind: "output",
          lines: ["E: Usage: apt changelog NAME"],
        },
        state,
      };
    }
    const pkg = findPackage(state, name);
    if (!pkg) {
      return {
        result: {
          kind: "output",
          lines: [`E: No changelog available for ${name}`],
        },
        state,
      };
    }
    const related = FICTIONAL_ADVISORIES.filter(
      (advisory) => advisory.packageName === pkg.name,
    );
    const lines = [
      `${pkg.name} (${pkg.availableVersion ?? pkg.installedVersion}) jammy-security; urgency=medium`,
      "",
      "  * Fictional security update for teaching purposes only.",
    ];
    for (const advisory of related) {
      lines.push(
        `  * ${advisory.id}: ${advisory.title}`,
        `    Fixed in ${advisory.fixedVersion} (CVSS-style ${advisory.cvss}).`,
      );
    }
    if (related.length === 0) {
      lines.push("  * Routine non-security maintenance in this simulation.");
    }
    lines.push("", " -- Ubuntu Demo Security Team <security@ubuntu.demo>");
    return { result: { kind: "output", lines }, state };
  }

  if (sub === "install") {
    if (!elevated) {
      return {
        result: { kind: "output", lines: [...PERMISSION_DENIED] },
        state,
      };
    }
    const name = tokens[1];
    if (!name) {
      return {
        result: {
          kind: "output",
          lines: ["E: Usage: sudo apt install NAME"],
        },
        state,
      };
    }
    const blocked = requireIndex(state);
    if (blocked) {
      return blocked;
    }
    const pkg = findPackage(state, name);
    if (!pkg) {
      return {
        result: {
          kind: "output",
          lines: [`E: Unable to locate package ${name}`],
        },
        state,
      };
    }
    if (
      state.scenarioId === "patch-risk" &&
      pkg.name === "docker.io" &&
      !patchRiskApproved(state)
    ) {
      return {
        result: {
          kind: "output",
          lines: [
            `Refusing to install ${pkg.name} until patch risk checks are complete.`,
            "Use assess-risk tested|backup|window|rollback on",
            "then approve-change before upgrading docker.io in this scenario.",
          ],
        },
        state,
      };
    }
    if (!pkg.availableVersion) {
      return {
        result: {
          kind: "output",
          lines: [
            `${pkg.name} is already the newest version (${pkg.installedVersion}).`,
          ],
        },
        state,
      };
    }
    const applied = applyPackageUpgrade(state, pkg.name);
    const lines = [
      "Reading package lists... Done",
      "Building dependency tree... Done",
      `The following packages will be upgraded:`,
      `  ${pkg.name}`,
      "1 upgraded, 0 newly installed, 0 to remove.",
      ...applied.message,
    ];
    if (applied.state.pendingRestarts.length > 0) {
      lines.push(
        `Pending service restarts: ${applied.state.pendingRestarts.join(", ")}`,
      );
    }
    if (applied.state.pendingReboot) {
      lines.push("*** System restart required (simulated kernel update) ***");
    }
    return { result: { kind: "output", lines }, state: applied.state };
  }

  if (sub === "remove") {
    if (!elevated) {
      return {
        result: { kind: "output", lines: [...PERMISSION_DENIED] },
        state,
      };
    }
    const name = tokens[1];
    if (!name) {
      return {
        result: {
          kind: "output",
          lines: ["E: Usage: sudo apt remove NAME"],
        },
        state,
      };
    }
    const pkg = findPackage(state, name);
    if (!pkg) {
      return {
        result: {
          kind: "output",
          lines: [`E: Unable to locate package ${name}`],
        },
        state,
      };
    }
    if (
      pkg.name === "linux-image-generic" ||
      pkg.name === "sudo" ||
      pkg.name === "openssl"
    ) {
      return {
        result: {
          kind: "output",
          lines: [
            `E: Refusing to remove essential package ${pkg.name} in this simulation.`,
          ],
        },
        state,
      };
    }
    const next = cloneSecurityUpdatesState(state);
    delete next.packages[pkg.name];
    if (pkg.serviceUnit && next.services[pkg.serviceUnit]) {
      delete next.services[pkg.serviceUnit];
      next.pendingRestarts = next.pendingRestarts.filter(
        (unit) => unit !== pkg.serviceUnit,
      );
    }
    return {
      result: {
        kind: "output",
        lines: [
          "Reading package lists... Done",
          `Removing ${pkg.name} (${pkg.installedVersion}) ...`,
          "0 upgraded, 0 newly installed, 1 to remove.",
        ],
      },
      state: next,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [`E: Invalid operation ${sub}`, 'Try "apt --help" or "help".'],
    },
    state,
  };
}

function handleSystemctl(
  tokens: string[],
  state: SimulatedSecurityUpdatesState,
  elevated: boolean,
): SimulateSecurityUpdatesResult {
  const action = tokens[0]?.toLowerCase();
  const unitRaw = tokens[1];
  if (!action || !unitRaw) {
    return {
      result: {
        kind: "output",
        lines: ["Usage: systemctl status|restart UNIT"],
      },
      state,
    };
  }

  const service = findService(state, unitRaw);
  if (!service) {
    return {
      result: {
        kind: "output",
        lines: [`Unit ${unitRaw}.service could not be found (simulation).`],
      },
      state,
    };
  }

  if (action === "status") {
    const pending = state.pendingRestarts.includes(service.unit);
    const pkg = state.packages[service.packageName];
    return {
      result: {
        kind: "output",
        lines: [
          `● ${service.unit}.service - ${service.description}`,
          `     Loaded: loaded (simulated)`,
          `     Active: ${service.active ? "active (running)" : "inactive (dead)"}`,
          `   Process: runningVersion=${service.runningVersion}`,
          `  Installed: ${pkg?.installedVersion ?? "n/a"}`,
          pending
            ? "     Notice: package update pending service restart"
            : "     Notice: runtime matches last restart",
        ],
      },
      state,
    };
  }

  if (action === "restart") {
    if (!elevated) {
      return {
        result: { kind: "output", lines: [...PERMISSION_DENIED] },
        state,
      };
    }
    const next = cloneSecurityUpdatesState(state);
    const pkg = next.packages[service.packageName];
    const updated = {
      ...service,
      active: true,
      runningVersion: pkg?.installedVersion ?? service.runningVersion,
    };
    next.services[service.unit] = updated;
    next.pendingRestarts = next.pendingRestarts.filter(
      (unit) => unit !== service.unit,
    );
    return {
      result: {
        kind: "output",
        lines: [
          `Restarted ${service.unit}.service (simulated).`,
          `Running version is now ${updated.runningVersion}.`,
        ],
      },
      state: next,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [
        `Unsupported systemctl action "${action}". Use status or restart.`,
      ],
    },
    state,
  };
}

function handleJournalctl(
  tokens: string[],
  state: SimulatedSecurityUpdatesState,
): SimulateSecurityUpdatesResult {
  let unit: string | undefined;
  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index] === "-u" || tokens[index] === "--unit") {
      unit = tokens[index + 1];
    }
  }
  if (!unit) {
    return {
      result: {
        kind: "output",
        lines: ["Usage: journalctl -u UNIT", "Example: journalctl -u nginx"],
      },
      state,
    };
  }
  const service = findService(state, unit);
  if (!service) {
    return {
      result: {
        kind: "output",
        lines: [`-- No entries for ${unit}.service in this simulation --`],
      },
      state,
    };
  }
  const pending = state.pendingRestarts.includes(service.unit);
  return {
    result: {
      kind: "output",
      lines: [
        `-- Journal begins at simulated boot --`,
        `rean-patch ${service.unit}[1200]: Started ${service.description}.`,
        `rean-patch ${service.unit}[1200]: Running version ${service.runningVersion}`,
        pending
          ? `rean-patch systemd[1]: Notice: ${service.packageName} upgraded; restart ${service.unit} to load new code`
          : `rean-patch ${service.unit}[1200]: Service runtime is current`,
      ],
    },
    state,
  };
}

export function simulateSecurityUpdatesCommand(
  rawInput: string,
  state: SimulatedSecurityUpdatesState,
): SimulateSecurityUpdatesResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { result: { kind: "empty" }, state };
  }

  if (trimmed === "clear") {
    return { result: { kind: "clear" }, state };
  }

  const tokens = trimmed.split(/\s+/);
  const command = tokens[0]!.toLowerCase();

  if (command === "help" || command === "?") {
    return {
      result: { kind: "output", lines: [...HELP_OUTPUT] },
      state,
    };
  }

  if (command === "uname") {
    if (tokens[1] === "-r" || tokens.length === 1) {
      return {
        result: {
          kind: "output",
          lines: [state.runningKernel],
        },
        state,
      };
    }
    return {
      result: {
        kind: "output",
        lines: ['Unsupported uname flags. Use "uname -r".'],
      },
      state,
    };
  }

  if (command === "apt") {
    return handleApt(tokens.slice(1), state, false);
  }

  if (command === "sudo" && tokens[1]?.toLowerCase() === "apt") {
    return handleApt(tokens.slice(2), state, true);
  }

  if (command === "systemctl") {
    return handleSystemctl(tokens.slice(1), state, false);
  }

  if (command === "sudo" && tokens[1]?.toLowerCase() === "systemctl") {
    return handleSystemctl(tokens.slice(2), state, true);
  }

  if (command === "journalctl") {
    return handleJournalctl(tokens.slice(1), state);
  }

  if (
    (command === "reboot" ||
      (command === "sudo" && tokens[1]?.toLowerCase() === "reboot")) &&
    (command === "reboot" || tokens.length === 2)
  ) {
    if (command === "reboot") {
      return {
        result: {
          kind: "output",
          lines: ["Permission denied. Use sudo reboot for a simulated reboot."],
        },
        state,
      };
    }
    const next = cloneSecurityUpdatesState(state);
    if (next.pendingReboot || kernelUpdateInstalled(next)) {
      const installed = next.packages["linux-image-generic"]?.installedVersion;
      if (installed && comparePackageVersions(installed, "6.8.0-45.45") >= 0) {
        next.runningKernel = "6.8.0-45-generic";
      } else if (installed) {
        next.runningKernel =
          `${installed.replace(/\.45$/, "")}-generic`.replace(
            /\.\d+$/,
            "-generic",
          );
        // Keep a readable teaching value.
        next.runningKernel = installed.startsWith("6.8.0-45")
          ? "6.8.0-45-generic"
          : "6.8.0-40-generic";
      }
      next.pendingReboot = false;
    }
    return {
      result: {
        kind: "output",
        lines: [
          "Broadcast message from root@rean-patch (simulated):",
          "  The system is going down for reboot NOW!",
          "",
          `System rebooted (simulated). Running kernel is now ${next.runningKernel}.`,
          "No real reboot was performed on your machine.",
        ],
      },
      state: next,
    };
  }

  if (command === "assess-risk") {
    const flag = tokens[1]?.toLowerCase();
    const value = tokens[2]?.toLowerCase();
    const map: Record<
      string,
      keyof SimulatedSecurityUpdatesState["riskChecks"]
    > = {
      tested: "tested",
      backup: "backupReady",
      window: "maintenanceWindow",
      rollback: "rollbackPlan",
    };
    if (
      !flag ||
      !value ||
      !(flag in map) ||
      (value !== "on" && value !== "off")
    ) {
      return {
        result: {
          kind: "output",
          lines: [
            "Usage: assess-risk tested|backup|window|rollback on|off",
            "Then run: approve-change",
            "",
            `Current checks: tested=${state.riskChecks.tested} backup=${state.riskChecks.backupReady} window=${state.riskChecks.maintenanceWindow} rollback=${state.riskChecks.rollbackPlan}`,
            `Approved: ${state.riskApproved}`,
          ],
        },
        state,
      };
    }
    const next = cloneSecurityUpdatesState(state);
    next.riskChecks[map[flag]!] = value === "on";
    next.riskApproved = false;
    return {
      result: {
        kind: "output",
        lines: [
          `Risk check "${flag}" set to ${value}.`,
          `tested=${next.riskChecks.tested} backup=${next.riskChecks.backupReady} window=${next.riskChecks.maintenanceWindow} rollback=${next.riskChecks.rollbackPlan}`,
        ],
      },
      state: next,
    };
  }

  if (command === "approve-change") {
    const { riskChecks } = state;
    if (!(
      riskChecks.tested &&
      riskChecks.backupReady &&
      riskChecks.maintenanceWindow &&
      riskChecks.rollbackPlan
    )) {
      return {
        result: {
          kind: "output",
          lines: [
            "Cannot approve yet. Enable all risk checks first:",
            "  assess-risk tested on",
            "  assess-risk backup on",
            "  assess-risk window on",
            "  assess-risk rollback on",
          ],
        },
        state,
      };
    }
    const next = cloneSecurityUpdatesState(state);
    next.riskApproved = true;
    return {
      result: {
        kind: "output",
        lines: [
          "Change approved for this simulated maintenance window.",
          "You may now upgrade disruptive packages such as docker.io.",
        ],
      },
      state: next,
    };
  }

  if (command === "sudo") {
    return {
      result: {
        kind: "output",
        lines: [
          `Unsupported sudo command. Try: sudo apt …, sudo systemctl …, or sudo reboot.`,
        ],
      },
      state,
    };
  }

  return {
    result: { kind: "output", lines: [...UNSUPPORTED_MESSAGE] },
    state,
  };
}
