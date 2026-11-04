/**
 * Frontend-only firewall hardening simulation for Stage 04 Lesson 06.
 * Never runs real ufw/nftables/iptables, never changes the host firewall,
 * never scans real networks, and never opens real sockets.
 * All interfaces, addresses, services, rules, and reachability are fictional.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_FW_HARDENING_USER = "bunsal";
export const SIMULATED_FW_HARDENING_HOST = "rean-fw";

export const SIMULATED_INTERFACE = "eth0";
export const SIMULATED_IP = "192.168.1.20";
export const SIMULATED_GATEWAY = "192.168.1.1";
export const SIMULATED_INTERNAL_CIDR = "192.168.1.0/24";
export const SIMULATED_INTERNAL_HOST = "192.168.1.50";
export const SIMULATED_PUBLIC_HOST = "203.0.113.10";

export type FirewallHardeningScenarioId =
  | "explore"
  | "restrictive-default"
  | "protect-ssh"
  | "database-exposure"
  | "app-port"
  | "tcp-udp"
  | "exposure-audit"
  | "healthy";

export type FirewallProtocol = "tcp" | "udp";
export type FirewallAction = "allow" | "deny";
export type FirewallPolicy = "allow" | "deny";

export type FirewallHardeningRule = {
  action: FirewallAction;
  port: number;
  protocol: FirewallProtocol;
  /** Fictional source — "Anywhere" when unrestricted. */
  from: string;
};

export type ListeningService = {
  port: number;
  protocol: FirewallProtocol;
  process: string;
  address: string;
  label: string;
};

export type SimulatedServiceUnit = {
  name: string;
  description: string;
  active: boolean;
  port: number;
  protocol: FirewallProtocol;
};

export type SimulatedFirewallHardeningState = {
  scenarioId: FirewallHardeningScenarioId;
  enabled: boolean;
  defaultIncoming: FirewallPolicy;
  defaultOutgoing: FirewallPolicy;
  rules: FirewallHardeningRule[];
  listening: ListeningService[];
  services: SimulatedServiceUnit[];
};

export type FirewallHardeningScenarioMeta = {
  id: FirewallHardeningScenarioId;
  label: string;
  summary: string;
};

export type SimulateFirewallHardeningResult = {
  result: SimulateResult;
  state: SimulatedFirewallHardeningState;
};

export type ConnectionOutcome =
  "success" | "firewall-blocked" | "not-listening" | "firewall-disabled-ok";

export const FIREWALL_HARDENING_SCENARIOS: readonly FirewallHardeningScenarioMeta[] =
  [
    {
      id: "explore",
      label: "Explore network exposure",
      summary:
        "Baseline fictional host for inspecting listeners, UFW status, and reachability.",
    },
    {
      id: "restrictive-default",
      label: "Restrictive default policy",
      summary:
        "Inbound traffic is allowed by default — establish a deny-incoming posture while preserving required services.",
    },
    {
      id: "protect-ssh",
      label: "Protect administrative access",
      summary:
        "The firewall is inactive and SSH is not explicitly allowed — permit SSH before enabling filtering.",
    },
    {
      id: "database-exposure",
      label: "Database exposure",
      summary:
        "PostgreSQL listens on TCP 5432 and is allowed from Anywhere — restrict to an internal source.",
    },
    {
      id: "app-port",
      label: "Unnecessary application port",
      summary:
        "Application TCP 8080 is reachable from any source — limit it to the internal network.",
    },
    {
      id: "tcp-udp",
      label: "TCP and UDP rules",
      summary:
        "A UDP service listens on 5353, but the policy only mentions TCP — fix the protocol mismatch.",
    },
    {
      id: "exposure-audit",
      label: "Exposure audit",
      summary:
        "Inspect listening services and firewall rules, then identify unnecessary public exposure.",
    },
    {
      id: "healthy",
      label: "Hardened firewall baseline",
      summary:
        "Restrictive inbound policy with least-privilege rules — use this to confirm a clean recheck.",
    },
  ] as const;

const SCENARIO_IDS = new Set<string>(
  FIREWALL_HARDENING_SCENARIOS.map((scenario) => scenario.id),
);

export function isFirewallHardeningScenarioId(
  value: string,
): value is FirewallHardeningScenarioId {
  return SCENARIO_IDS.has(value);
}

export function getFirewallHardeningScenario(
  id: FirewallHardeningScenarioId,
): FirewallHardeningScenarioMeta {
  return (
    FIREWALL_HARDENING_SCENARIOS.find((scenario) => scenario.id === id) ??
    FIREWALL_HARDENING_SCENARIOS[0]!
  );
}

const HELP_OUTPUT = [
  "Available commands (educational simulation):",
  "",
  "  help                              Show this help",
  "  sudo ufw status                   Show firewall status and rules",
  "  sudo ufw status verbose           Status with default policies",
  "  sudo ufw enable                   Enable the simulated firewall",
  "  sudo ufw disable                  Disable the simulated firewall",
  "  sudo ufw reload                   Reload the simulated firewall",
  "  sudo ufw reset                    Reset rules and disable firewall",
  "  sudo ufw allow <port>/<proto>     Allow inbound port/protocol",
  "  sudo ufw deny <port>/<proto>      Deny inbound port/protocol",
  "  sudo ufw delete allow|deny ...    Remove a matching rule",
  "  sudo ufw default deny incoming    Set default incoming policy",
  "  sudo ufw default allow outgoing   Set default outgoing policy",
  "  sudo ufw allow from CIDR to any port N proto tcp|udp",
  "  ss -tuln                          Show listening TCP/UDP sockets",
  "  ip addr                           Show fictional interface address",
  "  ip route                          Show fictional default route",
  "  systemctl status <unit>           Show a fictional service unit",
  "  check-connect PORT/PROTO [from IP]",
  "                                    Lesson-specific reachability check",
  "  clear                             Clear the terminal screen",
  "",
  "Examples:",
  "  sudo ufw status verbose",
  "  sudo ufw allow 22/tcp",
  "  sudo ufw allow from 192.168.1.0/24 to any port 5432 proto tcp",
  "  check-connect 5432/tcp from 203.0.113.10",
  "  ss -tuln",
  "",
  "This terminal never runs real firewall commands and never scans",
  "or connects to real networks. check-connect is a lesson helper only.",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const SSH_LOCKOUT_WARNING = [
  "Warning (educational): on a real remote server, enabling a firewall",
  "or removing SSH allow rules can lock you out if port 22/tcp is not",
  "permitted. Always confirm SSH access before applying deny defaults.",
] as const;

function cloneRules(
  rules: readonly FirewallHardeningRule[],
): FirewallHardeningRule[] {
  return rules.map((rule) => ({ ...rule }));
}

function cloneListening(
  listening: readonly ListeningService[],
): ListeningService[] {
  return listening.map((item) => ({ ...item }));
}

function cloneServices(
  services: readonly SimulatedServiceUnit[],
): SimulatedServiceUnit[] {
  return services.map((item) => ({ ...item }));
}

function defaultListening(): ListeningService[] {
  return [
    {
      port: 22,
      protocol: "tcp",
      process: "sshd",
      address: "0.0.0.0",
      label: "SSH",
    },
    {
      port: 80,
      protocol: "tcp",
      process: "nginx",
      address: "0.0.0.0",
      label: "HTTP",
    },
    {
      port: 443,
      protocol: "tcp",
      process: "nginx",
      address: "0.0.0.0",
      label: "HTTPS",
    },
    {
      port: 8080,
      protocol: "tcp",
      process: "appd",
      address: "0.0.0.0",
      label: "Application",
    },
    {
      port: 5432,
      protocol: "tcp",
      process: "postgres",
      address: "0.0.0.0",
      label: "Database",
    },
    {
      port: 5353,
      protocol: "udp",
      process: "mdnsd",
      address: "0.0.0.0",
      label: "Discovery (UDP)",
    },
  ];
}

function defaultServices(): SimulatedServiceUnit[] {
  return [
    {
      name: "ssh",
      description: "OpenSSH server daemon",
      active: true,
      port: 22,
      protocol: "tcp",
    },
    {
      name: "nginx",
      description: "A high performance web server",
      active: true,
      port: 80,
      protocol: "tcp",
    },
    {
      name: "appd",
      description: "Fictional application service",
      active: true,
      port: 8080,
      protocol: "tcp",
    },
    {
      name: "postgresql",
      description: "PostgreSQL database server",
      active: true,
      port: 5432,
      protocol: "tcp",
    },
    {
      name: "mdns",
      description: "Fictional UDP discovery helper",
      active: true,
      port: 5353,
      protocol: "udp",
    },
  ];
}

function baselinePublicRules(): FirewallHardeningRule[] {
  return [
    { action: "allow", port: 22, protocol: "tcp", from: "Anywhere" },
    { action: "allow", port: 80, protocol: "tcp", from: "Anywhere" },
    { action: "allow", port: 443, protocol: "tcp", from: "Anywhere" },
  ];
}

function excessiveRules(): FirewallHardeningRule[] {
  return [
    ...baselinePublicRules(),
    { action: "allow", port: 8080, protocol: "tcp", from: "Anywhere" },
    { action: "allow", port: 5432, protocol: "tcp", from: "Anywhere" },
    { action: "allow", port: 5353, protocol: "tcp", from: "Anywhere" },
  ];
}

function hardenedRules(): FirewallHardeningRule[] {
  return [
    ...baselinePublicRules(),
    {
      action: "allow",
      port: 8080,
      protocol: "tcp",
      from: SIMULATED_INTERNAL_CIDR,
    },
    {
      action: "allow",
      port: 5432,
      protocol: "tcp",
      from: SIMULATED_INTERNAL_CIDR,
    },
    { action: "allow", port: 5353, protocol: "udp", from: "Anywhere" },
  ];
}

function ruleKey(rule: FirewallHardeningRule): string {
  return `${rule.action}:${rule.port}/${rule.protocol}:from=${rule.from}`;
}

function rulesEqual(
  a: FirewallHardeningRule,
  b: FirewallHardeningRule,
): boolean {
  return (
    a.action === b.action &&
    a.port === b.port &&
    a.protocol === b.protocol &&
    a.from === b.from
  );
}

function findExactRule(
  rules: readonly FirewallHardeningRule[],
  target: FirewallHardeningRule,
): FirewallHardeningRule | undefined {
  return rules.find((rule) => rulesEqual(rule, target));
}

function sourceMatches(ruleFrom: string, source: string): boolean {
  if (ruleFrom === "Anywhere" || ruleFrom === "anywhere") {
    return true;
  }
  if (ruleFrom === source) {
    return true;
  }
  // Educational CIDR match for the fictional /24 only.
  if (ruleFrom === SIMULATED_INTERNAL_CIDR) {
    return source.startsWith("192.168.1.");
  }
  return false;
}

/**
 * Educational inbound evaluation:
 * - Disabled firewall → traffic not blocked by this model
 * - First matching rule (port + protocol + source) wins
 * - Otherwise → default incoming policy
 */
export function evaluateInbound(
  state: SimulatedFirewallHardeningState,
  port: number,
  protocol: FirewallProtocol,
  source = SIMULATED_PUBLIC_HOST,
): FirewallAction {
  if (!state.enabled) {
    return "allow";
  }
  for (const rule of state.rules) {
    if (
      rule.port === port &&
      rule.protocol === protocol &&
      sourceMatches(rule.from, source)
    ) {
      return rule.action;
    }
  }
  return state.defaultIncoming;
}

export function evaluateOutbound(
  state: SimulatedFirewallHardeningState,
): FirewallAction {
  if (!state.enabled) {
    return "allow";
  }
  return state.defaultOutgoing;
}

export function isServiceListening(
  state: SimulatedFirewallHardeningState,
  port: number,
  protocol: FirewallProtocol,
): boolean {
  return state.listening.some(
    (item) => item.port === port && item.protocol === protocol,
  );
}

export function evaluateConnection(
  state: SimulatedFirewallHardeningState,
  port: number,
  protocol: FirewallProtocol,
  source = SIMULATED_PUBLIC_HOST,
): ConnectionOutcome {
  const firewallAction = evaluateInbound(state, port, protocol, source);
  if (firewallAction === "deny") {
    return "firewall-blocked";
  }
  if (!isServiceListening(state, port, protocol)) {
    return "not-listening";
  }
  if (!state.enabled) {
    return "firewall-disabled-ok";
  }
  return "success";
}

export function hasAllowRule(
  state: SimulatedFirewallHardeningState,
  port: number,
  protocol: FirewallProtocol,
  from?: string,
): boolean {
  return state.rules.some(
    (rule) =>
      rule.action === "allow" &&
      rule.port === port &&
      rule.protocol === protocol &&
      (from === undefined || rule.from === from),
  );
}

export function hasAnywhereAllow(
  state: SimulatedFirewallHardeningState,
  port: number,
  protocol: FirewallProtocol,
): boolean {
  return hasAllowRule(state, port, protocol, "Anywhere");
}

export function isSshReachable(
  state: SimulatedFirewallHardeningState,
  source = SIMULATED_PUBLIC_HOST,
): boolean {
  const outcome = evaluateConnection(state, 22, "tcp", source);
  return outcome === "success" || outcome === "firewall-disabled-ok";
}

export function isPubliclyReachable(
  state: SimulatedFirewallHardeningState,
  port: number,
  protocol: FirewallProtocol,
): boolean {
  return (
    evaluateConnection(state, port, protocol, SIMULATED_PUBLIC_HOST) ===
    "success"
  );
}

export function isInternallyReachable(
  state: SimulatedFirewallHardeningState,
  port: number,
  protocol: FirewallProtocol,
): boolean {
  return (
    evaluateConnection(state, port, protocol, SIMULATED_INTERNAL_HOST) ===
    "success"
  );
}

export function hasRestrictiveInboundDefault(
  state: SimulatedFirewallHardeningState,
): boolean {
  return state.enabled && state.defaultIncoming === "deny";
}

export function hasAllowOutgoingDefault(
  state: SimulatedFirewallHardeningState,
): boolean {
  return state.defaultOutgoing === "allow";
}

export function databaseRestrictedToInternal(
  state: SimulatedFirewallHardeningState,
): boolean {
  if (!state.enabled || state.defaultIncoming !== "deny") {
    return false;
  }
  if (hasAnywhereAllow(state, 5432, "tcp")) {
    return false;
  }
  const internalAllow = hasAllowRule(
    state,
    5432,
    "tcp",
    SIMULATED_INTERNAL_CIDR,
  );
  const publicBlocked = !isPubliclyReachable(state, 5432, "tcp");
  const internalOk = isInternallyReachable(state, 5432, "tcp");
  return internalAllow && publicBlocked && internalOk;
}

export function appPortRestrictedToInternal(
  state: SimulatedFirewallHardeningState,
): boolean {
  if (!state.enabled || state.defaultIncoming !== "deny") {
    return false;
  }
  if (hasAnywhereAllow(state, 8080, "tcp")) {
    return false;
  }
  const internalAllow = hasAllowRule(
    state,
    8080,
    "tcp",
    SIMULATED_INTERNAL_CIDR,
  );
  const publicBlocked = !isPubliclyReachable(state, 8080, "tcp");
  const internalOk = isInternallyReachable(state, 8080, "tcp");
  return internalAllow && publicBlocked && internalOk;
}

export function udpDiscoveryAllowed(
  state: SimulatedFirewallHardeningState,
): boolean {
  return (
    state.enabled &&
    hasAllowRule(state, 5353, "udp") &&
    isPubliclyReachable(state, 5353, "udp") &&
    !hasAnywhereAllow(state, 5353, "tcp")
  );
}

export function requiredWebServicesReachable(
  state: SimulatedFirewallHardeningState,
): boolean {
  return (
    isPubliclyReachable(state, 22, "tcp") &&
    isPubliclyReachable(state, 80, "tcp") &&
    isPubliclyReachable(state, 443, "tcp")
  );
}

export function hasExposureFindings(
  state: SimulatedFirewallHardeningState,
): boolean {
  return (
    isServiceListening(state, 5432, "tcp") &&
    isServiceListening(state, 8080, "tcp") &&
    isServiceListening(state, 5353, "udp") &&
    (hasAnywhereAllow(state, 5432, "tcp") ||
      hasAnywhereAllow(state, 8080, "tcp") ||
      hasAnywhereAllow(state, 5353, "tcp"))
  );
}

function scenarioState(
  scenarioId: FirewallHardeningScenarioId,
): SimulatedFirewallHardeningState {
  const listening = defaultListening();
  const services = defaultServices();

  switch (scenarioId) {
    case "explore":
      return {
        scenarioId,
        enabled: true,
        defaultIncoming: "deny",
        defaultOutgoing: "allow",
        rules: excessiveRules(),
        listening,
        services,
      };
    case "restrictive-default":
      return {
        scenarioId,
        enabled: true,
        defaultIncoming: "allow",
        defaultOutgoing: "allow",
        rules: baselinePublicRules(),
        listening,
        services,
      };
    case "protect-ssh":
      return {
        scenarioId,
        enabled: false,
        defaultIncoming: "deny",
        defaultOutgoing: "allow",
        rules: [
          { action: "allow", port: 80, protocol: "tcp", from: "Anywhere" },
          { action: "allow", port: 443, protocol: "tcp", from: "Anywhere" },
        ],
        listening,
        services,
      };
    case "database-exposure":
      return {
        scenarioId,
        enabled: true,
        defaultIncoming: "deny",
        defaultOutgoing: "allow",
        rules: [
          ...baselinePublicRules(),
          { action: "allow", port: 5432, protocol: "tcp", from: "Anywhere" },
        ],
        listening,
        services,
      };
    case "app-port":
      return {
        scenarioId,
        enabled: true,
        defaultIncoming: "deny",
        defaultOutgoing: "allow",
        rules: [
          ...baselinePublicRules(),
          { action: "allow", port: 8080, protocol: "tcp", from: "Anywhere" },
        ],
        listening,
        services,
      };
    case "tcp-udp":
      return {
        scenarioId,
        enabled: true,
        defaultIncoming: "deny",
        defaultOutgoing: "allow",
        rules: [
          ...baselinePublicRules(),
          { action: "allow", port: 5353, protocol: "tcp", from: "Anywhere" },
        ],
        listening,
        services,
      };
    case "exposure-audit":
      return {
        scenarioId,
        enabled: true,
        defaultIncoming: "deny",
        defaultOutgoing: "allow",
        rules: excessiveRules(),
        listening,
        services,
      };
    case "healthy":
      return {
        scenarioId,
        enabled: true,
        defaultIncoming: "deny",
        defaultOutgoing: "allow",
        rules: hardenedRules(),
        listening,
        services,
      };
  }
}

export function createInitialFirewallHardeningState(
  scenarioId: FirewallHardeningScenarioId = "explore",
): SimulatedFirewallHardeningState {
  return cloneFirewallHardeningState(scenarioState(scenarioId));
}

export function cloneFirewallHardeningState(
  state: SimulatedFirewallHardeningState,
): SimulatedFirewallHardeningState {
  return {
    scenarioId: state.scenarioId,
    enabled: state.enabled,
    defaultIncoming: state.defaultIncoming,
    defaultOutgoing: state.defaultOutgoing,
    rules: cloneRules(state.rules),
    listening: cloneListening(state.listening),
    services: cloneServices(state.services),
  };
}

export function resetFirewallHardeningState(
  state: SimulatedFirewallHardeningState,
): SimulatedFirewallHardeningState {
  return createInitialFirewallHardeningState(state.scenarioId);
}

export function formatFirewallHardeningPrompt(): string {
  return `${SIMULATED_FW_HARDENING_USER}@${SIMULATED_FW_HARDENING_HOST}:~$`;
}

function formatRulePort(rule: FirewallHardeningRule): string {
  return `${rule.port}/${rule.protocol}`;
}

function formatStatusLines(
  state: SimulatedFirewallHardeningState,
  verbose: boolean,
): string[] {
  if (!state.enabled) {
    return ["Status: inactive"];
  }

  const lines: string[] = ["Status: active"];
  if (verbose) {
    lines.push(
      `Default: ${state.defaultIncoming} (incoming), ${state.defaultOutgoing} (outgoing), disabled (routed)`,
    );
    lines.push("New profiles: skip");
  }
  lines.push("");
  lines.push("To                         Action      From");
  lines.push("--                         ------      ----");

  if (state.rules.length === 0) {
    lines.push("(no explicit rules)");
    return lines;
  }

  for (const rule of state.rules) {
    const to = formatRulePort(rule).padEnd(27, " ");
    const action = `${rule.action.toUpperCase()}`.padEnd(12, " ");
    lines.push(`${to}${action}${rule.from}`);
  }

  return lines;
}

function formatSsTuln(state: SimulatedFirewallHardeningState): string[] {
  const lines = [
    "Netid State  Recv-Q Send-Q  Local Address:Port  Peer Address:Port Process",
  ];
  for (const item of state.listening) {
    const netid = item.protocol === "tcp" ? "tcp" : "udp";
    const stateLabel = item.protocol === "tcp" ? "LISTEN" : "UNCONN";
    const local = `${item.address}:${item.port}`;
    lines.push(
      `${netid.padEnd(6)}${stateLabel.padEnd(7)}0      0      ${local.padEnd(20)}0.0.0.0:*           users:(("${item.process}",pid=1000,fd=3))`,
    );
  }
  return lines;
}

function formatIpAddr(): string[] {
  return [
    "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536",
    "    inet 127.0.0.1/8 scope host lo",
    `2: ${SIMULATED_INTERFACE}: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500`,
    `    inet ${SIMULATED_IP}/24 brd 192.168.1.255 scope global ${SIMULATED_INTERFACE}`,
  ];
}

function formatIpRoute(): string[] {
  return [
    `default via ${SIMULATED_GATEWAY} dev ${SIMULATED_INTERFACE}`,
    `192.168.1.0/24 dev ${SIMULATED_INTERFACE} proto kernel scope link src ${SIMULATED_IP}`,
  ];
}

function formatSystemctlStatus(
  state: SimulatedFirewallHardeningState,
  unit: string,
): string[] {
  const normalized = unit.replace(/\.service$/, "").toLowerCase();
  const match = state.services.find(
    (service) => service.name.toLowerCase() === normalized,
  );
  if (!match) {
    return [
      `Unit ${unit}.service could not be found in this simulation.`,
      "Supported units: ssh, nginx, appd, postgresql, mdns",
    ];
  }
  const active = match.active ? "active (running)" : "inactive (dead)";
  return [
    `● ${match.name}.service - ${match.description}`,
    `     Loaded: loaded (educational unit; fictional)`,
    `     Active: ${active} since fictional boot`,
    `   Main PID: 1000 (${match.name})`,
    `      Tasks: 1 (educational)`,
    `     Memory: 12.0M (educational)`,
    "",
    `Nov 04 08:00:01 ${SIMULATED_FW_HARDENING_HOST} systemd[1]: Started ${match.description}.`,
  ];
}

function formatConnectionResult(
  state: SimulatedFirewallHardeningState,
  port: number,
  protocol: FirewallProtocol,
  source: string,
): string[] {
  const outcome = evaluateConnection(state, port, protocol, source);
  const target = `${port}/${protocol}`;
  const fromLabel = `from ${source}`;

  switch (outcome) {
    case "success":
    case "firewall-disabled-ok":
      return [
        `check-connect: ${target} ${fromLabel} → reachable`,
        "Simulated result: connection succeeded.",
        "Note: check-connect is a lesson-specific helper, not a standard Linux command.",
      ];
    case "firewall-blocked":
      return [
        `check-connect: ${target} ${fromLabel} → blocked`,
        "Simulated result: firewall policy denied the traffic.",
        "Note: check-connect is a lesson-specific helper, not a standard Linux command.",
      ];
    case "not-listening":
      return [
        `check-connect: ${target} ${fromLabel} → refused`,
        "Simulated result: nothing is listening on that port/protocol.",
        "Note: check-connect is a lesson-specific helper, not a standard Linux command.",
      ];
  }
}

function parsePortProto(
  value: string,
): { port: number; protocol: FirewallProtocol } | null {
  const match = /^(\d{1,5})\/(tcp|udp)$/i.exec(value.trim());
  if (!match) {
    return null;
  }
  const port = Number(match[1]);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return null;
  }
  const protocol = match[2]!.toLowerCase() as FirewallProtocol;
  return { port, protocol };
}

function parseBarePort(value: string): number | null {
  if (!/^\d{1,5}$/.test(value)) {
    return null;
  }
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return null;
  }
  return port;
}

function tokenize(input: string): string[] | { error: string } {
  const tokens: string[] = [];
  let i = 0;
  const s = input.trim();

  while (i < s.length) {
    while (i < s.length && /\s/.test(s[i]!)) {
      i += 1;
    }
    if (i >= s.length) {
      break;
    }

    const ch = s[i]!;
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i += 1;
      let value = "";
      while (i < s.length && s[i] !== quote) {
        value += s[i];
        i += 1;
      }
      if (i >= s.length) {
        return { error: `Unclosed quote in command.` };
      }
      i += 1;
      tokens.push(value);
      continue;
    }

    let value = "";
    while (i < s.length && !/\s/.test(s[i]!)) {
      value += s[i];
      i += 1;
    }
    tokens.push(value);
  }

  return tokens;
}

function isSsTulnTokens(tokens: string[]): boolean {
  if (tokens[0] !== "ss") {
    return false;
  }
  if (tokens.length === 2 && tokens[1] === "-tuln") {
    return true;
  }
  if (
    tokens.length !== 2 ||
    !tokens[1]?.startsWith("-") ||
    tokens[1].startsWith("--")
  ) {
    return false;
  }
  const flags = tokens[1].slice(1);
  const set = new Set(flags.split(""));
  return (
    set.size === 4 &&
    set.has("t") &&
    set.has("u") &&
    set.has("l") &&
    set.has("n")
  );
}

function upsertRule(
  rules: FirewallHardeningRule[],
  next: FirewallHardeningRule,
): FirewallHardeningRule[] {
  const without = rules.filter(
    (rule) =>
      !(
        rule.port === next.port &&
        rule.protocol === next.protocol &&
        rule.from === next.from
      ),
  );
  return [...without, next];
}

function parseFromPortProtoRule(
  args: string[],
): FirewallHardeningRule | { error: string } | null {
  // from CIDR to any port N proto tcp|udp
  if (args.length < 8) {
    return null;
  }
  if (
    args[0]!.toLowerCase() !== "from" ||
    args[2]!.toLowerCase() !== "to" ||
    args[3]!.toLowerCase() !== "any" ||
    args[4]!.toLowerCase() !== "port" ||
    args[6]!.toLowerCase() !== "proto"
  ) {
    return null;
  }
  const from = args[1]!;
  const port = parseBarePort(args[5]!);
  const protocol = args[7]!.toLowerCase();
  if (!port || (protocol !== "tcp" && protocol !== "udp")) {
    return {
      error:
        "Invalid from/port/proto rule. Example: from 192.168.1.0/24 to any port 5432 proto tcp",
    };
  }
  return {
    action: "allow",
    port,
    protocol,
    from,
  };
}

function parseAllowDenyTarget(
  action: FirewallAction,
  args: string[],
): FirewallHardeningRule | { error: string } {
  if (args.length === 1) {
    const portProto = parsePortProto(args[0]!);
    if (portProto) {
      return {
        action,
        port: portProto.port,
        protocol: portProto.protocol,
        from: "Anywhere",
      };
    }
    const bare = parseBarePort(args[0]!);
    if (bare !== null) {
      return { action, port: bare, protocol: "tcp", from: "Anywhere" };
    }
    return {
      error: `Invalid rule "${args[0]}". Use forms like 80/tcp or 53/udp.`,
    };
  }

  const fromRule = parseFromPortProtoRule(args);
  if (fromRule && "error" in fromRule) {
    return fromRule;
  }
  if (fromRule) {
    return { ...fromRule, action };
  }

  return {
    error:
      `Unsupported ${action} syntax. Examples:\n` +
      `  sudo ufw ${action} 22/tcp\n` +
      `  sudo ufw ${action} from 192.168.1.0/24 to any port 5432 proto tcp`,
  };
}

function handleUfw(
  args: string[],
  state: SimulatedFirewallHardeningState,
): SimulateFirewallHardeningResult {
  const next = cloneFirewallHardeningState(state);

  if (args.length === 0) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: sudo ufw <status|enable|disable|allow|deny|delete|default|reload|reset> ...",
          'Try "help" for supported commands.',
        ],
      },
      state: next,
    };
  }

  const action = args[0]!.toLowerCase();

  if (action === "status") {
    const verbose =
      args[1]?.toLowerCase() === "verbose" || args[1]?.toLowerCase() === "-v";
    if (args.length > 2 || (args.length === 2 && !verbose)) {
      return {
        result: {
          kind: "output",
          lines: ['Supported: "sudo ufw status" or "sudo ufw status verbose".'],
        },
        state: next,
      };
    }
    return {
      result: { kind: "output", lines: formatStatusLines(next, verbose) },
      state: next,
    };
  }

  if (action === "enable") {
    if (args.length !== 1) {
      return {
        result: {
          kind: "output",
          lines: ['Usage: "sudo ufw enable"'],
        },
        state: next,
      };
    }
    next.enabled = true;
    const sshOk = evaluateInbound(next, 22, "tcp") === "allow";
    const lines = ["Firewall is active and enabled on system startup"];
    if (!sshOk) {
      lines.push("");
      lines.push(...SSH_LOCKOUT_WARNING);
    } else {
      lines.push("");
      lines.push(
        "Note: SSH (22/tcp) remains allowed in the current simulated rules.",
      );
    }
    return { result: { kind: "output", lines }, state: next };
  }

  if (action === "disable") {
    if (args.length !== 1) {
      return {
        result: {
          kind: "output",
          lines: ['Usage: "sudo ufw disable"'],
        },
        state: next,
      };
    }
    next.enabled = false;
    return {
      result: {
        kind: "output",
        lines: ["Firewall stopped and disabled on system startup"],
      },
      state: next,
    };
  }

  if (action === "reload") {
    if (args.length !== 1) {
      return {
        result: {
          kind: "output",
          lines: ['Usage: "sudo ufw reload"'],
        },
        state: next,
      };
    }
    if (!next.enabled) {
      return {
        result: {
          kind: "output",
          lines: ["Firewall not enabled (skipping reload)"],
        },
        state: next,
      };
    }
    return {
      result: {
        kind: "output",
        lines: ["Firewall reloaded (simulated — rules already in memory)"],
      },
      state: next,
    };
  }

  if (action === "reset") {
    if (args.length !== 1) {
      return {
        result: {
          kind: "output",
          lines: ['Usage: "sudo ufw reset"'],
        },
        state: next,
      };
    }
    next.enabled = false;
    next.defaultIncoming = "deny";
    next.defaultOutgoing = "allow";
    next.rules = [];
    return {
      result: {
        kind: "output",
        lines: [
          "Resetting all rules to installed defaults (simulated)",
          "Firewall disabled; defaults set to deny (incoming), allow (outgoing)",
        ],
      },
      state: next,
    };
  }

  if (action === "allow" || action === "deny") {
    const parsed = parseAllowDenyTarget(action, args.slice(1));
    if ("error" in parsed) {
      return {
        result: { kind: "output", lines: parsed.error.split("\n") },
        state: next,
      };
    }
    next.rules = upsertRule(next.rules, parsed);
    const fromLabel = parsed.from === "Anywhere" ? "" : ` from ${parsed.from}`;
    const lines = [
      "Rule updated",
      `Rule added (${action} ${formatRulePort(parsed)}${fromLabel})`,
    ];
    if (action === "deny" && parsed.port === 22 && parsed.protocol === "tcp") {
      lines.push("");
      lines.push(...SSH_LOCKOUT_WARNING);
    }
    return { result: { kind: "output", lines }, state: next };
  }

  if (action === "delete") {
    if (args.length < 3) {
      return {
        result: {
          kind: "output",
          lines: [
            "Supported delete forms:",
            "  sudo ufw delete allow 80/tcp",
            "  sudo ufw delete allow from 192.168.1.0/24 to any port 5432 proto tcp",
          ],
        },
        state: next,
      };
    }
    const deleteAction = args[1]!.toLowerCase();
    if (deleteAction !== "allow" && deleteAction !== "deny") {
      return {
        result: {
          kind: "output",
          lines: [
            'Delete requires "allow" or "deny". Example: sudo ufw delete allow 80/tcp',
          ],
        },
        state: next,
      };
    }
    const parsed = parseAllowDenyTarget(
      deleteAction as FirewallAction,
      args.slice(2),
    );
    if ("error" in parsed) {
      return {
        result: { kind: "output", lines: parsed.error.split("\n") },
        state: next,
      };
    }
    const existing = findExactRule(next.rules, parsed);
    if (!existing) {
      return {
        result: {
          kind: "output",
          lines: [`Could not delete non-existent rule`],
        },
        state: next,
      };
    }
    next.rules = next.rules.filter(
      (rule) => ruleKey(rule) !== ruleKey(existing),
    );
    const lines = [`Rule deleted`];
    if (parsed.port === 22 && parsed.protocol === "tcp") {
      lines.push("");
      lines.push(...SSH_LOCKOUT_WARNING);
    }
    return { result: { kind: "output", lines }, state: next };
  }

  if (action === "default") {
    if (args.length !== 3) {
      return {
        result: {
          kind: "output",
          lines: [
            "Supported:",
            "  sudo ufw default deny incoming",
            "  sudo ufw default allow outgoing",
          ],
        },
        state: next,
      };
    }
    const policy = args[1]!.toLowerCase();
    const direction = args[2]!.toLowerCase();
    if (
      (policy !== "allow" && policy !== "deny") ||
      (direction !== "incoming" &&
        direction !== "outgoing" &&
        direction !== "inbound" &&
        direction !== "outbound")
    ) {
      return {
        result: {
          kind: "output",
          lines: [
            "Supported:",
            "  sudo ufw default deny incoming",
            "  sudo ufw default allow outgoing",
          ],
        },
        state: next,
      };
    }
    if (direction === "incoming" || direction === "inbound") {
      next.defaultIncoming = policy;
      if (policy === "deny" && next.enabled && !hasAllowRule(next, 22, "tcp")) {
        return {
          result: {
            kind: "output",
            lines: [
              "Default incoming policy changed to 'deny'",
              "",
              ...SSH_LOCKOUT_WARNING,
            ],
          },
          state: next,
        };
      }
      return {
        result: {
          kind: "output",
          lines: [`Default incoming policy changed to '${policy}'`],
        },
        state: next,
      };
    }
    next.defaultOutgoing = policy;
    return {
      result: {
        kind: "output",
        lines: [`Default outgoing policy changed to '${policy}'`],
      },
      state: next,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [
        `Unsupported ufw action "${action}".`,
        'Try "help" to see available commands.',
      ],
    },
    state: next,
  };
}

export function simulateFirewallHardeningCommand(
  input: string,
  state: SimulatedFirewallHardeningState,
): SimulateFirewallHardeningResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { result: { kind: "empty" }, state };
  }

  const tokensResult = tokenize(trimmed);
  if ("error" in tokensResult) {
    return {
      result: { kind: "output", lines: [tokensResult.error] },
      state,
    };
  }
  const tokens = tokensResult;
  if (tokens.length === 0) {
    return { result: { kind: "empty" }, state };
  }

  const command = tokens[0]!.toLowerCase();

  if (command === "clear") {
    return { result: { kind: "clear" }, state };
  }

  if (command === "help" || command === "?") {
    return {
      result: { kind: "output", lines: [...HELP_OUTPUT] },
      state,
    };
  }

  if (isSsTulnTokens(tokens)) {
    return {
      result: { kind: "output", lines: formatSsTuln(state) },
      state,
    };
  }

  if (command === "ip") {
    if (tokens.length === 2 && tokens[1]!.toLowerCase() === "addr") {
      return {
        result: { kind: "output", lines: formatIpAddr() },
        state,
      };
    }
    if (tokens.length === 2 && tokens[1]!.toLowerCase() === "route") {
      return {
        result: { kind: "output", lines: formatIpRoute() },
        state,
      };
    }
    return {
      result: {
        kind: "output",
        lines: ['Supported: "ip addr" or "ip route".'],
      },
      state,
    };
  }

  if (command === "systemctl") {
    if (tokens.length === 3 && tokens[1]!.toLowerCase() === "status") {
      return {
        result: {
          kind: "output",
          lines: formatSystemctlStatus(state, tokens[2]!),
        },
        state,
      };
    }
    return {
      result: {
        kind: "output",
        lines: [
          'Supported: "systemctl status <unit>"',
          "Units: ssh, nginx, appd, postgresql, mdns",
        ],
      },
      state,
    };
  }

  if (command === "check-connect") {
    if (tokens.length !== 2 && tokens.length !== 4) {
      return {
        result: {
          kind: "output",
          lines: [
            "Usage: check-connect <port>/<tcp|udp> [from <ip>]",
            "Example: check-connect 80/tcp",
            "Example: check-connect 5432/tcp from 203.0.113.10",
            "Note: check-connect is a lesson-specific simulation helper.",
          ],
        },
        state,
      };
    }
    const parsed = parsePortProto(tokens[1]!);
    if (!parsed) {
      return {
        result: {
          kind: "output",
          lines: [
            `Invalid target "${tokens[1]}". Use forms like 80/tcp or 53/udp.`,
          ],
        },
        state,
      };
    }
    let source = SIMULATED_PUBLIC_HOST;
    if (tokens.length === 4) {
      if (tokens[2]!.toLowerCase() !== "from") {
        return {
          result: {
            kind: "output",
            lines: [
              'Use "from" before a source address.',
              "Example: check-connect 5432/tcp from 192.168.1.50",
            ],
          },
          state,
        };
      }
      source = tokens[3]!;
    }
    return {
      result: {
        kind: "output",
        lines: formatConnectionResult(
          state,
          parsed.port,
          parsed.protocol,
          source,
        ),
      },
      state,
    };
  }

  if (command === "sudo" && tokens[1]?.toLowerCase() === "ufw") {
    return handleUfw(tokens.slice(2), state);
  }

  if (command === "ufw") {
    return {
      result: {
        kind: "output",
        lines: [
          "ufw: Permission denied. Use sudo for firewall commands.",
          "Example: sudo ufw status",
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
