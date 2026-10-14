/**
 * Frontend-only firewall simulation for Stage 03 Lesson 08 (Firewall Basics).
 * Never runs real ufw/nftables/iptables, never changes the host firewall,
 * and never opens real network sockets.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_FIREWALL_USER = "bunsal";
export const SIMULATED_FIREWALL_HOST = "rean-linux";

export type FirewallScenarioId =
  | "healthy"
  | "firewall-disabled"
  | "http-blocked"
  | "keep-ssh"
  | "service-not-listening"
  | "default-policies"
  | "udp-vs-tcp";

export type FirewallProtocol = "tcp" | "udp";
export type FirewallAction = "allow" | "deny";
export type FirewallPolicy = "allow" | "deny";

export type FirewallRule = {
  action: FirewallAction;
  port: number;
  protocol: FirewallProtocol;
};

export type ListeningService = {
  port: number;
  protocol: FirewallProtocol;
  process: string;
  address: string;
};

export type SimulatedFirewallState = {
  scenarioId: FirewallScenarioId;
  enabled: boolean;
  defaultIncoming: FirewallPolicy;
  defaultOutgoing: FirewallPolicy;
  rules: FirewallRule[];
  listening: ListeningService[];
};

export type FirewallScenarioMeta = {
  id: FirewallScenarioId;
  label: string;
  symptom: string;
  rootCause: string;
};

export type SimulateFirewallResult = {
  result: SimulateResult;
  state: SimulatedFirewallState;
};

export type ConnectionOutcome =
  "success" | "firewall-blocked" | "not-listening" | "firewall-disabled-ok";

export const FIREWALL_SCENARIOS: readonly FirewallScenarioMeta[] = [
  {
    id: "healthy",
    label: "Healthy firewall baseline",
    symptom: "SSH, HTTP, and HTTPS should be reachable when services listen.",
    rootCause:
      "Firewall is enabled with allow rules for 22/tcp, 80/tcp, and 443/tcp.",
  },
  {
    id: "firewall-disabled",
    label: "Firewall disabled",
    symptom: "UFW reports inactive — rules are not enforcing traffic filters.",
    rootCause: "The firewall is disabled in this scenario.",
  },
  {
    id: "http-blocked",
    label: "HTTP traffic blocked",
    symptom: "SSH works, but inbound HTTP on port 80 fails.",
    rootCause:
      "Default incoming deny with no allow rule for 80/tcp, while nginx listens.",
  },
  {
    id: "keep-ssh",
    label: "Change rules without losing SSH",
    symptom: "You need to open HTTP while keeping remote SSH access.",
    rootCause:
      "SSH (22/tcp) is already allowed; add 80/tcp without removing SSH.",
  },
  {
    id: "service-not-listening",
    label: "Allowed port, no listener",
    symptom: "Firewall allows HTTP, but clients still cannot use the service.",
    rootCause: "Port 80/tcp is allowed, but nothing is listening on TCP 80.",
  },
  {
    id: "default-policies",
    label: "Default inbound vs outbound",
    symptom: "Defaults control unmatched traffic differently per direction.",
    rootCause:
      "Incoming defaults to deny; outgoing defaults to allow in this lab.",
  },
  {
    id: "udp-vs-tcp",
    label: "UDP versus TCP rules",
    symptom: "TCP may be allowed while the matching UDP port is not.",
    rootCause:
      "An allow rule for 53/tcp does not cover 53/udp — protocols are separate.",
  },
] as const;

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                              Show this help message",
  "  sudo ufw status                   Show firewall status and rules",
  "  sudo ufw status verbose           Show status with default policies",
  "  sudo ufw enable                   Enable the simulated firewall",
  "  sudo ufw disable                  Disable the simulated firewall",
  "  sudo ufw allow 22/tcp             Allow inbound TCP port 22",
  "  sudo ufw allow 80/tcp             Allow inbound TCP port 80",
  "  sudo ufw allow 443/tcp            Allow inbound TCP port 443",
  "  sudo ufw deny 8080/tcp            Deny inbound TCP port 8080",
  "  sudo ufw delete allow 80/tcp      Remove an allow rule for 80/tcp",
  "  sudo ufw default deny incoming    Set default incoming policy",
  "  sudo ufw default allow outgoing   Set default outgoing policy",
  "  ss -tuln                          Show listening TCP/UDP sockets",
  "  check-connect 80/tcp              Test a simulated inbound connection",
  "  clear                             Clear the terminal screen",
  "",
  "Examples:",
  "  sudo ufw status verbose",
  "  sudo ufw allow 80/tcp",
  "  check-connect 80/tcp",
  "  ss -tuln",
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

function cloneRules(rules: readonly FirewallRule[]): FirewallRule[] {
  return rules.map((rule) => ({ ...rule }));
}

function cloneListening(
  listening: readonly ListeningService[],
): ListeningService[] {
  return listening.map((item) => ({ ...item }));
}

function defaultListening(): ListeningService[] {
  return [
    {
      port: 22,
      protocol: "tcp",
      process: "sshd",
      address: "0.0.0.0",
    },
    {
      port: 80,
      protocol: "tcp",
      process: "nginx",
      address: "0.0.0.0",
    },
    {
      port: 443,
      protocol: "tcp",
      process: "nginx",
      address: "0.0.0.0",
    },
  ];
}

function ruleKey(rule: FirewallRule): string {
  return `${rule.action}:${rule.port}/${rule.protocol}`;
}

function findRule(
  rules: readonly FirewallRule[],
  action: FirewallAction,
  port: number,
  protocol: FirewallProtocol,
): FirewallRule | undefined {
  return rules.find(
    (rule) =>
      rule.action === action &&
      rule.port === port &&
      rule.protocol === protocol,
  );
}

function findMatchingRule(
  rules: readonly FirewallRule[],
  port: number,
  protocol: FirewallProtocol,
): FirewallRule | undefined {
  // Explicit deny and allow both count; prefer the most specific listed rule.
  // In this educational model, at most one rule exists per port/protocol.
  return rules.find((rule) => rule.port === port && rule.protocol === protocol);
}

function scenarioState(scenarioId: FirewallScenarioId): SimulatedFirewallState {
  const listening = defaultListening();

  switch (scenarioId) {
    case "healthy":
      return {
        scenarioId,
        enabled: true,
        defaultIncoming: "deny",
        defaultOutgoing: "allow",
        rules: [
          { action: "allow", port: 22, protocol: "tcp" },
          { action: "allow", port: 80, protocol: "tcp" },
          { action: "allow", port: 443, protocol: "tcp" },
        ],
        listening,
      };
    case "firewall-disabled":
      return {
        scenarioId,
        enabled: false,
        defaultIncoming: "deny",
        defaultOutgoing: "allow",
        rules: [{ action: "allow", port: 22, protocol: "tcp" }],
        listening,
      };
    case "http-blocked":
      return {
        scenarioId,
        enabled: true,
        defaultIncoming: "deny",
        defaultOutgoing: "allow",
        rules: [{ action: "allow", port: 22, protocol: "tcp" }],
        listening,
      };
    case "keep-ssh":
      return {
        scenarioId,
        enabled: true,
        defaultIncoming: "deny",
        defaultOutgoing: "allow",
        rules: [{ action: "allow", port: 22, protocol: "tcp" }],
        listening,
      };
    case "service-not-listening":
      return {
        scenarioId,
        enabled: true,
        defaultIncoming: "deny",
        defaultOutgoing: "allow",
        rules: [
          { action: "allow", port: 22, protocol: "tcp" },
          { action: "allow", port: 80, protocol: "tcp" },
        ],
        listening: listening.filter(
          (item) => !(item.port === 80 && item.protocol === "tcp"),
        ),
      };
    case "default-policies":
      return {
        scenarioId,
        enabled: true,
        defaultIncoming: "deny",
        defaultOutgoing: "allow",
        rules: [{ action: "allow", port: 22, protocol: "tcp" }],
        listening,
      };
    case "udp-vs-tcp":
      return {
        scenarioId,
        enabled: true,
        defaultIncoming: "deny",
        defaultOutgoing: "allow",
        rules: [
          { action: "allow", port: 22, protocol: "tcp" },
          { action: "allow", port: 53, protocol: "tcp" },
        ],
        listening: [
          ...listening,
          {
            port: 53,
            protocol: "udp",
            process: "named",
            address: "0.0.0.0",
          },
          {
            port: 53,
            protocol: "tcp",
            process: "named",
            address: "0.0.0.0",
          },
        ],
      };
  }
}

export function createInitialFirewallState(
  scenarioId: FirewallScenarioId = "healthy",
): SimulatedFirewallState {
  return cloneFirewallState(scenarioState(scenarioId));
}

export function cloneFirewallState(
  state: SimulatedFirewallState,
): SimulatedFirewallState {
  return {
    scenarioId: state.scenarioId,
    enabled: state.enabled,
    defaultIncoming: state.defaultIncoming,
    defaultOutgoing: state.defaultOutgoing,
    rules: cloneRules(state.rules),
    listening: cloneListening(state.listening),
  };
}

export function resetFirewallState(
  state: SimulatedFirewallState,
): SimulatedFirewallState {
  return createInitialFirewallState(state.scenarioId);
}

export function getFirewallScenario(
  id: FirewallScenarioId,
): FirewallScenarioMeta {
  const match = FIREWALL_SCENARIOS.find((scenario) => scenario.id === id);
  if (!match) {
    return FIREWALL_SCENARIOS[0]!;
  }
  return match;
}

export function isFirewallScenarioId(
  value: string,
): value is FirewallScenarioId {
  return FIREWALL_SCENARIOS.some((scenario) => scenario.id === value);
}

export function formatFirewallPrompt(): string {
  return `${SIMULATED_FIREWALL_USER}@${SIMULATED_FIREWALL_HOST}:~$`;
}

export function hasAllowRule(
  state: SimulatedFirewallState,
  port: number,
  protocol: FirewallProtocol,
): boolean {
  return Boolean(findRule(state.rules, "allow", port, protocol));
}

export function isServiceListening(
  state: SimulatedFirewallState,
  port: number,
  protocol: FirewallProtocol,
): boolean {
  return state.listening.some(
    (item) => item.port === port && item.protocol === protocol,
  );
}

/**
 * Educational inbound evaluation:
 * - Disabled firewall → traffic not blocked by this model
 * - Explicit matching rule → that action
 * - Otherwise → default incoming policy
 */
export function evaluateInbound(
  state: SimulatedFirewallState,
  port: number,
  protocol: FirewallProtocol,
): FirewallAction {
  if (!state.enabled) {
    return "allow";
  }
  const match = findMatchingRule(state.rules, port, protocol);
  if (match) {
    return match.action;
  }
  return state.defaultIncoming;
}

export function evaluateOutbound(
  state: SimulatedFirewallState,
  port: number,
  protocol: FirewallProtocol,
): FirewallAction {
  if (!state.enabled) {
    return "allow";
  }
  // This lesson's UFW model stores inbound-focused rules only.
  // Outbound unmatched traffic follows the outgoing default.
  void port;
  void protocol;
  return state.defaultOutgoing;
}

export function evaluateConnection(
  state: SimulatedFirewallState,
  port: number,
  protocol: FirewallProtocol,
): ConnectionOutcome {
  const firewallAction = evaluateInbound(state, port, protocol);
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

function formatRulePort(rule: FirewallRule): string {
  return `${rule.port}/${rule.protocol}`;
}

function formatStatusLines(
  state: SimulatedFirewallState,
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
    lines.push(`${to}${action}Anywhere`);
  }

  return lines;
}

function formatSsTuln(state: SimulatedFirewallState): string[] {
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

function formatConnectionResult(
  state: SimulatedFirewallState,
  port: number,
  protocol: FirewallProtocol,
): string[] {
  const outcome = evaluateConnection(state, port, protocol);
  const target = `${port}/${protocol}`;

  switch (outcome) {
    case "success":
    case "firewall-disabled-ok":
      return [
        `check-connect: ${target} → reachable`,
        "Simulated result: connection succeeded.",
      ];
    case "firewall-blocked":
      return [
        `check-connect: ${target} → blocked`,
        "Simulated result: connection did not complete.",
      ];
    case "not-listening":
      return [
        `check-connect: ${target} → refused`,
        "Simulated result: connection did not complete.",
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

function upsertRule(rules: FirewallRule[], next: FirewallRule): FirewallRule[] {
  const without = rules.filter(
    (rule) => !(rule.port === next.port && rule.protocol === next.protocol),
  );
  return [...without, next];
}

function handleUfw(
  args: string[],
  state: SimulatedFirewallState,
): SimulateFirewallResult {
  const next = cloneFirewallState(state);

  if (args.length === 0) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: sudo ufw <status|enable|disable|allow|deny|delete|default> ...",
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

  if (action === "allow" || action === "deny") {
    if (args.length !== 2) {
      return {
        result: {
          kind: "output",
          lines: [
            `Usage: sudo ufw ${action} <port>/<tcp|udp>`,
            "Supported examples: 22/tcp, 80/tcp, 443/tcp, 8080/tcp",
          ],
        },
        state: next,
      };
    }
    const parsed = parsePortProto(args[1]!);
    if (!parsed) {
      return {
        result: {
          kind: "output",
          lines: [
            `Invalid rule "${args[1]}". Use forms like 80/tcp or 53/udp.`,
          ],
        },
        state: next,
      };
    }

    const rule: FirewallRule = {
      action,
      port: parsed.port,
      protocol: parsed.protocol,
    };
    next.rules = upsertRule(next.rules, rule);

    const lines = [
      "Rule updated",
      `Rule added (${action} ${formatRulePort(rule)})`,
    ];
    if (action === "deny" && parsed.port === 22 && parsed.protocol === "tcp") {
      lines.push("");
      lines.push(...SSH_LOCKOUT_WARNING);
    }
    return { result: { kind: "output", lines }, state: next };
  }

  if (action === "delete") {
    if (args.length !== 3 || args[1]!.toLowerCase() !== "allow") {
      return {
        result: {
          kind: "output",
          lines: ['Supported delete form: "sudo ufw delete allow 80/tcp"'],
        },
        state: next,
      };
    }
    const parsed = parsePortProto(args[2]!);
    if (!parsed) {
      return {
        result: {
          kind: "output",
          lines: [`Invalid rule "${args[2]}". Use forms like 80/tcp.`],
        },
        state: next,
      };
    }
    const existing = findRule(
      next.rules,
      "allow",
      parsed.port,
      parsed.protocol,
    );
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

export function simulateFirewallBasicsCommand(
  input: string,
  state: SimulatedFirewallState,
): SimulateFirewallResult {
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

  if (command === "check-connect") {
    if (tokens.length !== 2) {
      return {
        result: {
          kind: "output",
          lines: [
            "Usage: check-connect <port>/<tcp|udp>",
            "Example: check-connect 80/tcp",
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
    return {
      result: {
        kind: "output",
        lines: formatConnectionResult(state, parsed.port, parsed.protocol),
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
