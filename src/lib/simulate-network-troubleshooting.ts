/**
 * Frontend-only network troubleshooting simulation for Stage 03 Lesson 06.
 * Does not execute real ip, ss, ping, or DNS lookups.
 * Never inspects host interfaces, opens sockets, or makes network requests.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_NET_TROUBLE_USER = "bunsal";
export const SIMULATED_NET_TROUBLE_HOST = "rean-linux";

export type NetworkTroubleshootScenarioId =
  | "interface-down"
  | "no-ipv4"
  | "missing-route"
  | "dns-failure"
  | "service-not-listening"
  | "healthy";

export type SimulatedListeningSocket = {
  netid: "tcp" | "udp";
  state: string;
  local: string;
};

export type SimulatedNetTroubleshootState = {
  scenarioId: NetworkTroubleshootScenarioId;
  eth0Up: boolean;
  eth0Ipv4: string | null;
  eth0Mac: string;
  hasDefaultRoute: boolean;
  dnsWorks: boolean;
  listeningHttp: boolean;
};

export type NetworkTroubleshootScenarioMeta = {
  id: NetworkTroubleshootScenarioId;
  label: string;
  symptom: string;
  rootCause: string;
};

export type SimulateNetworkTroubleshootResult = {
  result: SimulateResult;
  state: SimulatedNetTroubleshootState;
};

export const NETWORK_TROUBLESHOOT_SCENARIOS: readonly NetworkTroubleshootScenarioMeta[] =
  [
    {
      id: "interface-down",
      label: "Interface down",
      symptom: "The host cannot communicate on the LAN at all.",
      rootCause: "eth0 is down (no UP / LOWER_UP).",
    },
    {
      id: "no-ipv4",
      label: "No IPv4 address",
      symptom: "The interface looks up, but nothing is reachable by IP.",
      rootCause: "eth0 has no IPv4 address assigned.",
    },
    {
      id: "missing-route",
      label: "Missing default route",
      symptom: "Local checks may look fine, but remote networks fail.",
      rootCause: "The default route is missing.",
    },
    {
      id: "dns-failure",
      label: "DNS failure",
      symptom: "IP connectivity works, but hostnames do not resolve.",
      rootCause: "DNS resolution is failing.",
    },
    {
      id: "service-not-listening",
      label: "Service not listening",
      symptom:
        "The host is reachable, but the expected service does not answer.",
      rootCause: "Nothing is listening on the expected TCP port (80).",
    },
    {
      id: "healthy",
      label: "Healthy network",
      symptom: "Confirm whether the configuration actually needs changes.",
      rootCause: "Network configuration is healthy — do not change it.",
    },
  ] as const;

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                         Show this help message",
  "  ip link                      Show network interfaces",
  "  ip addr                      Show interface addresses",
  "  ip address                   Same as ip addr",
  "  ip route                     Show routing table",
  "  ping 127.0.0.1               Simulated loopback ping",
  "  ping 192.168.1.1             Simulated gateway ping",
  "  ping 8.8.8.8                 Simulated external ping",
  "  getent hosts example.com     Resolve a simulated hostname",
  "  ss -tuln                     Show listening TCP/UDP sockets",
  "  clear                        Clear the terminal screen",
  "",
  "Examples:",
  "  ip link",
  "  ip addr",
  "  ip route",
  "  ping 8.8.8.8",
  "  getent hosts example.com",
  "  ss -tuln",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const ETH0_MAC = "02:42:ac:11:00:02";
const ETH0_IPV4 = "192.168.1.20/24";
const GATEWAY = "192.168.1.1";
const EXAMPLE_COM_IP = "93.184.216.34";

const BASE_SOCKETS: readonly SimulatedListeningSocket[] = [
  { netid: "tcp", state: "LISTEN", local: "0.0.0.0:22" },
  { netid: "tcp", state: "LISTEN", local: "0.0.0.0:443" },
  { netid: "udp", state: "UNCONN", local: "0.0.0.0:53" },
] as const;

const HTTP_SOCKET: SimulatedListeningSocket = {
  netid: "tcp",
  state: "LISTEN",
  local: "0.0.0.0:80",
};

function scenarioState(
  scenarioId: NetworkTroubleshootScenarioId,
): SimulatedNetTroubleshootState {
  switch (scenarioId) {
    case "interface-down":
      return {
        scenarioId,
        eth0Up: false,
        eth0Ipv4: ETH0_IPV4,
        eth0Mac: ETH0_MAC,
        hasDefaultRoute: true,
        dnsWorks: true,
        listeningHttp: true,
      };
    case "no-ipv4":
      return {
        scenarioId,
        eth0Up: true,
        eth0Ipv4: null,
        eth0Mac: ETH0_MAC,
        hasDefaultRoute: false,
        dnsWorks: true,
        listeningHttp: true,
      };
    case "missing-route":
      return {
        scenarioId,
        eth0Up: true,
        eth0Ipv4: ETH0_IPV4,
        eth0Mac: ETH0_MAC,
        hasDefaultRoute: false,
        dnsWorks: true,
        listeningHttp: true,
      };
    case "dns-failure":
      return {
        scenarioId,
        eth0Up: true,
        eth0Ipv4: ETH0_IPV4,
        eth0Mac: ETH0_MAC,
        hasDefaultRoute: true,
        dnsWorks: false,
        listeningHttp: true,
      };
    case "service-not-listening":
      return {
        scenarioId,
        eth0Up: true,
        eth0Ipv4: ETH0_IPV4,
        eth0Mac: ETH0_MAC,
        hasDefaultRoute: true,
        dnsWorks: true,
        listeningHttp: false,
      };
    case "healthy":
      return {
        scenarioId,
        eth0Up: true,
        eth0Ipv4: ETH0_IPV4,
        eth0Mac: ETH0_MAC,
        hasDefaultRoute: true,
        dnsWorks: true,
        listeningHttp: true,
      };
  }
}

export function createInitialNetworkTroubleshootState(
  scenarioId: NetworkTroubleshootScenarioId = "healthy",
): SimulatedNetTroubleshootState {
  return cloneNetworkTroubleshootState(scenarioState(scenarioId));
}

export function cloneNetworkTroubleshootState(
  state: SimulatedNetTroubleshootState,
): SimulatedNetTroubleshootState {
  return {
    scenarioId: state.scenarioId,
    eth0Up: state.eth0Up,
    eth0Ipv4: state.eth0Ipv4,
    eth0Mac: state.eth0Mac,
    hasDefaultRoute: state.hasDefaultRoute,
    dnsWorks: state.dnsWorks,
    listeningHttp: state.listeningHttp,
  };
}

export function resetNetworkTroubleshootState(
  state: SimulatedNetTroubleshootState,
): SimulatedNetTroubleshootState {
  return createInitialNetworkTroubleshootState(state.scenarioId);
}

export function getNetworkTroubleshootScenario(
  id: NetworkTroubleshootScenarioId,
): NetworkTroubleshootScenarioMeta {
  const match = NETWORK_TROUBLESHOOT_SCENARIOS.find(
    (scenario) => scenario.id === id,
  );
  if (!match) {
    return NETWORK_TROUBLESHOOT_SCENARIOS[5]!;
  }
  return match;
}

export function formatNetworkTroubleshootPrompt(): string {
  return `${SIMULATED_NET_TROUBLE_USER}@${SIMULATED_NET_TROUBLE_HOST}:~$`;
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

function eth0Flags(state: SimulatedNetTroubleshootState): string {
  return state.eth0Up
    ? "BROADCAST,MULTICAST,UP,LOWER_UP"
    : "BROADCAST,MULTICAST";
}

function formatIpLink(state: SimulatedNetTroubleshootState): string[] {
  return ["1: lo: <LOOPBACK,UP,LOWER_UP>", `2: eth0: <${eth0Flags(state)}>`];
}

function formatIpAddr(state: SimulatedNetTroubleshootState): string[] {
  const lines = [
    "1: lo:",
    "    inet 127.0.0.1/8",
    "    inet6 ::1/128",
    "",
    "2: eth0:",
    `    link/ether ${state.eth0Mac}`,
  ];

  if (state.eth0Ipv4) {
    lines.push(`    inet ${state.eth0Ipv4}`);
  }

  if (state.eth0Up) {
    lines.push("    inet6 2001:db8::20/64");
  }

  return lines;
}

function formatIpRoute(state: SimulatedNetTroubleshootState): string[] {
  if (!state.eth0Up || !state.eth0Ipv4) {
    return [];
  }

  const lines: string[] = [];
  if (state.hasDefaultRoute) {
    lines.push(`default via ${GATEWAY} dev eth0`);
  }
  lines.push("192.168.1.0/24 dev eth0");
  return lines;
}

function canReachGateway(state: SimulatedNetTroubleshootState): boolean {
  return state.eth0Up && Boolean(state.eth0Ipv4);
}

function canReachExternal(state: SimulatedNetTroubleshootState): boolean {
  return canReachGateway(state) && state.hasDefaultRoute;
}

function padRight(value: string, width: number): string {
  return value.length >= width
    ? value
    : value + " ".repeat(width - value.length);
}

function formatSsTuln(state: SimulatedNetTroubleshootState): string[] {
  const sockets = state.listeningHttp
    ? [BASE_SOCKETS[0]!, HTTP_SOCKET, BASE_SOCKETS[1]!, BASE_SOCKETS[2]!]
    : [...BASE_SOCKETS];

  const header = `${padRight("Netid", 6)}${padRight("State", 7)}Local Address:Port`;
  const rows = sockets.map((socket) => {
    const netid = padRight(socket.netid, 6);
    const socketState = padRight(socket.state, 7);
    return `${netid}${socketState}${socket.local}`;
  });
  return [header, ...rows];
}

function formatPingSuccess(target: string): string[] {
  return [
    `PING ${target}`,
    "",
    `64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.1 ms`,
    `64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.1 ms`,
    "",
    `--- ${target} ping statistics ---`,
    "2 packets transmitted, 2 received, 0% packet loss",
  ];
}

function formatPingFailure(target: string): string[] {
  return [
    `PING ${target}`,
    "",
    `From ${target}: Destination Host Unreachable`,
    `From ${target}: Destination Host Unreachable`,
    "",
    `--- ${target} ping statistics ---`,
    "2 packets transmitted, 0 received, 100% packet loss",
  ];
}

function handleIp(
  tokens: string[],
  state: SimulatedNetTroubleshootState,
): SimulateNetworkTroubleshootResult {
  const nextState = cloneNetworkTroubleshootState(state);

  if (tokens.length === 1) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: ip link | ip addr | ip address | ip route",
          'Try "help" to see available commands.',
        ],
      },
      state: nextState,
    };
  }

  const sub = (tokens[1] ?? "").toLowerCase();

  if (tokens.length > 2) {
    return {
      result: {
        kind: "output",
        lines: [
          `ip: options after '${sub}' are not supported in this learning terminal.`,
          'Try "help" to see available commands.',
        ],
      },
      state: nextState,
    };
  }

  switch (sub) {
    case "link":
      return {
        result: { kind: "output", lines: formatIpLink(nextState) },
        state: nextState,
      };
    case "addr":
    case "address":
      return {
        result: { kind: "output", lines: formatIpAddr(nextState) },
        state: nextState,
      };
    case "route":
      return {
        result: { kind: "output", lines: formatIpRoute(nextState) },
        state: nextState,
      };
    default:
      return {
        result: {
          kind: "output",
          lines: [
            `ip: unsupported subcommand '${tokens[1]}'`,
            'Try "help" to see available commands.',
          ],
        },
        state: nextState,
      };
  }
}

function handleSs(
  tokens: string[],
  state: SimulatedNetTroubleshootState,
): SimulateNetworkTroubleshootResult {
  const nextState = cloneNetworkTroubleshootState(state);

  if (tokens.length === 1) {
    return {
      result: {
        kind: "output",
        lines: ["Usage: ss -tuln", 'Try "help" to see available commands.'],
      },
      state: nextState,
    };
  }

  if (tokens.length === 2 && tokens[1] === "-tuln") {
    return {
      result: { kind: "output", lines: formatSsTuln(nextState) },
      state: nextState,
    };
  }

  if (
    tokens.length === 2 &&
    tokens[1]!.startsWith("-") &&
    !tokens[1]!.startsWith("--")
  ) {
    const flags = new Set(tokens[1]!.slice(1).split(""));
    const required = new Set(["t", "u", "l", "n"]);
    const same =
      flags.size === required.size && [...required].every((f) => flags.has(f));
    if (same) {
      return {
        result: { kind: "output", lines: formatSsTuln(nextState) },
        state: nextState,
      };
    }
  }

  return {
    result: {
      kind: "output",
      lines: [
        "ss: only -tuln is supported in this learning terminal.",
        "Try: ss -tuln",
      ],
    },
    state: nextState,
  };
}

function handleGetent(
  tokens: string[],
  state: SimulatedNetTroubleshootState,
): SimulateNetworkTroubleshootResult {
  const nextState = cloneNetworkTroubleshootState(state);

  if (tokens.length !== 3 || tokens[1]!.toLowerCase() !== "hosts") {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: getent hosts HOSTNAME",
          "Example: getent hosts example.com",
        ],
      },
      state: nextState,
    };
  }

  const hostname = tokens[2]!.toLowerCase();

  if (hostname !== "example.com") {
    return {
      result: {
        kind: "output",
        lines: [
          `getent: ${tokens[2]}: not found in the simulated hosts table.`,
          "Try: getent hosts example.com",
        ],
      },
      state: nextState,
    };
  }

  if (!canReachExternal(nextState) || !nextState.dnsWorks) {
    const lines = ["getent: example.com: Name or service not known"];
    if (canReachExternal(nextState) && !nextState.dnsWorks) {
      lines.push(
        "Note: successful IP connectivity does not guarantee DNS works.",
      );
    }
    return {
      result: {
        kind: "output",
        lines,
      },
      state: nextState,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [`${EXAMPLE_COM_IP}    example.com`],
    },
    state: nextState,
  };
}

function handlePing(
  tokens: string[],
  state: SimulatedNetTroubleshootState,
): SimulateNetworkTroubleshootResult {
  const nextState = cloneNetworkTroubleshootState(state);

  if (tokens.length !== 2) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: ping ADDRESS",
          "Supported: ping 127.0.0.1",
          "           ping 192.168.1.1",
          "           ping 8.8.8.8",
        ],
      },
      state: nextState,
    };
  }

  const target = tokens[1]!;

  if (target === "127.0.0.1") {
    return {
      result: { kind: "output", lines: formatPingSuccess(target) },
      state: nextState,
    };
  }

  if (target === "192.168.1.1") {
    return {
      result: {
        kind: "output",
        lines: canReachGateway(nextState)
          ? formatPingSuccess(target)
          : formatPingFailure(target),
      },
      state: nextState,
    };
  }

  if (target === "8.8.8.8") {
    return {
      result: {
        kind: "output",
        lines: canReachExternal(nextState)
          ? formatPingSuccess(target)
          : formatPingFailure(target),
      },
      state: nextState,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [
        `ping: ${target} is not available in this learning terminal.`,
        "Supported: ping 127.0.0.1",
        "           ping 192.168.1.1",
        "           ping 8.8.8.8",
      ],
    },
    state: nextState,
  };
}

/**
 * Simulate a network troubleshooting command against in-memory scenario state.
 * Never executes real shell commands, inspects host interfaces, or performs DNS.
 */
export function simulateNetworkTroubleshootingCommand(
  rawInput: string,
  state: SimulatedNetTroubleshootState,
): SimulateNetworkTroubleshootResult {
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return {
      result: { kind: "empty" },
      state: cloneNetworkTroubleshootState(state),
    };
  }

  const tokensResult = tokenize(trimmed);
  if ("error" in tokensResult) {
    return {
      result: { kind: "output", lines: [tokensResult.error] },
      state: cloneNetworkTroubleshootState(state),
    };
  }

  const tokens = tokensResult;
  const command = (tokens[0] ?? "").toLowerCase();

  switch (command) {
    case "help":
      return {
        result: { kind: "output", lines: HELP_OUTPUT },
        state: cloneNetworkTroubleshootState(state),
      };

    case "clear":
      return {
        result: { kind: "clear" },
        state: cloneNetworkTroubleshootState(state),
      };

    case "ip":
      return handleIp(tokens, state);

    case "ss":
      return handleSs(tokens, state);

    case "getent":
      return handleGetent(tokens, state);

    case "ping":
      return handlePing(tokens, state);

    default:
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: cloneNetworkTroubleshootState(state),
      };
  }
}

export function isNetworkTroubleshootScenarioId(
  value: string,
): value is NetworkTroubleshootScenarioId {
  return NETWORK_TROUBLESHOOT_SCENARIOS.some(
    (scenario) => scenario.id === value,
  );
}
