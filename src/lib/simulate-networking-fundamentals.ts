/**
 * Frontend-only networking fundamentals simulation for Stage 03 Lesson 05.
 * Does not execute real ip, ss, ping, or DNS lookups.
 * Never inspects host interfaces, opens sockets, or makes network requests.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_NET_USER = "bunsal";
export const SIMULATED_NET_HOST = "rean-linux";

export type SimulatedNetInterface = {
  index: number;
  name: string;
  flags: string;
  mac?: string;
  ipv4?: string;
  ipv6?: string;
};

export type SimulatedListeningSocket = {
  netid: "tcp" | "udp";
  state: string;
  local: string;
};

export type SimulatedNetworkState = {
  /** Marker so the terminal can hold a stable in-memory session. */
  ready: true;
};

export type SimulateNetworkingResult = {
  result: SimulateResult;
  state: SimulatedNetworkState;
};

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                         Show this help message",
  "  ip link                      Show network interfaces",
  "  ip addr                      Show interface addresses",
  "  ip address                   Same as ip addr",
  "  ip route                     Show routing table",
  "  ss -tuln                     Show listening TCP/UDP sockets",
  "  getent hosts example.com     Resolve a simulated hostname",
  "  ping 127.0.0.1               Simulated loopback ping",
  "  ping 192.168.1.1             Simulated gateway ping",
  "  clear                        Clear the terminal screen",
  "",
  "Examples:",
  "  ip link",
  "  ip addr",
  "  ip route",
  "  ss -tuln",
  "  getent hosts example.com",
  "  ping 127.0.0.1",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

/** Deterministic simulated interfaces — never derived from the host. */
export const SIMULATED_INTERFACES: readonly SimulatedNetInterface[] = [
  {
    index: 1,
    name: "lo",
    flags: "LOOPBACK,UP,LOWER_UP",
    ipv4: "127.0.0.1/8",
    ipv6: "::1/128",
  },
  {
    index: 2,
    name: "eth0",
    flags: "BROADCAST,MULTICAST,UP,LOWER_UP",
    mac: "02:42:ac:11:00:02",
    ipv4: "192.168.1.20/24",
    ipv6: "2001:db8::20/64",
  },
] as const;

export const SIMULATED_GATEWAY = "192.168.1.1";
export const SIMULATED_DNS = "192.168.1.1";
export const SIMULATED_ETH0_IPV4 = "192.168.1.20";
export const SIMULATED_EXAMPLE_COM_IP = "93.184.216.34";

/** Deterministic simulated listening sockets. */
export const SIMULATED_SOCKETS: readonly SimulatedListeningSocket[] = [
  { netid: "tcp", state: "LISTEN", local: "0.0.0.0:22" },
  { netid: "tcp", state: "LISTEN", local: "0.0.0.0:80" },
  { netid: "tcp", state: "LISTEN", local: "0.0.0.0:443" },
  { netid: "udp", state: "UNCONN", local: "0.0.0.0:53" },
] as const;

const HOSTS_TABLE: Readonly<Record<string, string>> = {
  "example.com": SIMULATED_EXAMPLE_COM_IP,
};

const PINGABLE_HOSTS = new Set(["127.0.0.1", "192.168.1.1"]);

export function createInitialNetworkingState(): SimulatedNetworkState {
  return { ready: true };
}

export function cloneNetworkingState(
  state: SimulatedNetworkState,
): SimulatedNetworkState {
  return { ready: state.ready };
}

export function formatNetworkingPrompt(): string {
  return `${SIMULATED_NET_USER}@${SIMULATED_NET_HOST}:~$`;
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

function formatIpLink(): string[] {
  return SIMULATED_INTERFACES.map(
    (iface) => `${iface.index}: ${iface.name}: <${iface.flags}>`,
  );
}

function formatIpAddr(): string[] {
  const lines: string[] = [];

  for (const iface of SIMULATED_INTERFACES) {
    lines.push(`${iface.index}: ${iface.name}:`);
    if (iface.mac) {
      lines.push(`    link/ether ${iface.mac}`);
    }
    if (iface.ipv4) {
      lines.push(`    inet ${iface.ipv4}`);
    }
    if (iface.ipv6) {
      lines.push(`    inet6 ${iface.ipv6}`);
    }
    lines.push("");
  }

  // Trim trailing blank line for cleaner terminal output
  if (lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines;
}

function formatIpRoute(): string[] {
  return [
    `default via ${SIMULATED_GATEWAY} dev eth0`,
    "192.168.1.0/24 dev eth0",
  ];
}

function padRight(value: string, width: number): string {
  return value.length >= width
    ? value
    : value + " ".repeat(width - value.length);
}

function formatSsTuln(): string[] {
  const header = `${padRight("Netid", 6)}${padRight("State", 7)}Local Address:Port`;
  const rows = SIMULATED_SOCKETS.map((socket) => {
    const netid = padRight(socket.netid, 6);
    const state = padRight(socket.state, 7);
    return `${netid}${state}${socket.local}`;
  });
  return [header, ...rows];
}

function handleIp(
  tokens: string[],
  state: SimulatedNetworkState,
): SimulateNetworkingResult {
  const nextState = cloneNetworkingState(state);

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
        result: { kind: "output", lines: formatIpLink() },
        state: nextState,
      };
    case "addr":
    case "address":
      return {
        result: { kind: "output", lines: formatIpAddr() },
        state: nextState,
      };
    case "route":
      return {
        result: { kind: "output", lines: formatIpRoute() },
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
  state: SimulatedNetworkState,
): SimulateNetworkingResult {
  const nextState = cloneNetworkingState(state);

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
      result: { kind: "output", lines: formatSsTuln() },
      state: nextState,
    };
  }

  // Accept combined short flags that equal -tuln (any order of t,u,l,n)
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
        result: { kind: "output", lines: formatSsTuln() },
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
  state: SimulatedNetworkState,
): SimulateNetworkingResult {
  const nextState = cloneNetworkingState(state);

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
  const ip = HOSTS_TABLE[hostname];

  if (!ip) {
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

  return {
    result: {
      kind: "output",
      lines: [`${ip}    ${hostname}`],
    },
    state: nextState,
  };
}

function formatPing(target: string): string[] {
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

function handlePing(
  tokens: string[],
  state: SimulatedNetworkState,
): SimulateNetworkingResult {
  const nextState = cloneNetworkingState(state);

  if (tokens.length !== 2) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: ping ADDRESS",
          "Supported: ping 127.0.0.1",
          "           ping 192.168.1.1",
        ],
      },
      state: nextState,
    };
  }

  const target = tokens[1]!;

  if (!PINGABLE_HOSTS.has(target)) {
    return {
      result: {
        kind: "output",
        lines: [
          `ping: ${target} is not available in this learning terminal.`,
          "Supported: ping 127.0.0.1",
          "           ping 192.168.1.1",
        ],
      },
      state: nextState,
    };
  }

  return {
    result: { kind: "output", lines: formatPing(target) },
    state: nextState,
  };
}

/**
 * Simulate a networking fundamentals command against in-memory network state.
 * Never executes real shell commands, inspects host interfaces, or performs DNS.
 */
export function simulateNetworkingFundamentalsCommand(
  rawInput: string,
  state: SimulatedNetworkState,
): SimulateNetworkingResult {
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return { result: { kind: "empty" }, state: cloneNetworkingState(state) };
  }

  const tokensResult = tokenize(trimmed);
  if ("error" in tokensResult) {
    return {
      result: { kind: "output", lines: [tokensResult.error] },
      state: cloneNetworkingState(state),
    };
  }

  const tokens = tokensResult;
  const command = (tokens[0] ?? "").toLowerCase();

  switch (command) {
    case "help":
      return {
        result: { kind: "output", lines: HELP_OUTPUT },
        state: cloneNetworkingState(state),
      };

    case "clear":
      return {
        result: { kind: "clear" },
        state: cloneNetworkingState(state),
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
        state: cloneNetworkingState(state),
      };
  }
}
