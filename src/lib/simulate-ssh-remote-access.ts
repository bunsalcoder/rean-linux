/**
 * Frontend-only SSH / remote-access simulation for Stage 03 Lesson 07.
 * Does not open sockets, run real ssh/ssh-keygen, or touch the host filesystem.
 * Never stores real credentials or reads real ~/.ssh files.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_SSH_USER = "bunsal";
export const SIMULATED_SSH_HOST = "rean-linux";

export type SshScenarioId =
  | "healthy"
  | "unknown-host"
  | "ssh-stopped"
  | "wrong-port"
  | "auth-failure"
  | "key-not-authorized"
  | "first-connection"
  | "host-key-mismatch";

export type SimulatedSshState = {
  scenarioId: SshScenarioId;
  /** Local simulated ED25519 key pair exists. */
  hasLocalKey: boolean;
  /** Remote account has this learner's public key in authorized_keys. */
  keyAuthorized: boolean;
  /** Local known_hosts already trusts the remote host key. */
  hostKeyKnown: boolean;
  /** Stored host key matches the remote's current key. */
  hostKeyMatches: boolean;
  /** ssh.service active/running in the simulation. */
  sshServiceActive: boolean;
  /** Port where sshd listens (22 or 2222). */
  sshListeningPort: number;
  /** Hostname `server` resolves in getent / SSH. */
  hostnameResolves: boolean;
  /** Password authentication succeeds for supported accounts. */
  passwordAccepted: boolean;
  /** Waiting for yes/no after first-connect host-key prompt. */
  awaitingHostKeyConfirm: boolean;
  /** Target remembered while awaiting host-key confirmation. */
  pendingTarget: string | null;
  pendingPort: number | null;
  pendingVerbose: boolean;
};

export type SshScenarioMeta = {
  id: SshScenarioId;
  label: string;
  symptom: string;
  rootCause: string;
};

export type SimulateSshResult = {
  result: SimulateResult;
  state: SimulatedSshState;
};

export const SSH_SCENARIOS: readonly SshScenarioMeta[] = [
  {
    id: "healthy",
    label: "Healthy SSH access",
    symptom: "Remote login should succeed with the usual SSH command.",
    rootCause: "SSH is reachable and authentication succeeds.",
  },
  {
    id: "unknown-host",
    label: "Unknown hostname",
    symptom: "SSH cannot find the remote host by name.",
    rootCause: "Hostname resolution fails for the target name.",
  },
  {
    id: "ssh-stopped",
    label: "SSH service stopped",
    symptom: "Connection attempts to the server are refused.",
    rootCause: "The SSH service is stopped and nothing listens on port 22.",
  },
  {
    id: "wrong-port",
    label: "Non-default SSH port",
    symptom: "Default SSH fails, but the service may listen elsewhere.",
    rootCause: "sshd listens on TCP 2222 instead of the default port 22.",
  },
  {
    id: "auth-failure",
    label: "Authentication failure",
    symptom: "The TCP connection reaches SSH, but login is denied.",
    rootCause: "Authentication is rejected for the attempted credentials.",
  },
  {
    id: "key-not-authorized",
    label: "Public key not authorized",
    symptom: "A local key exists, but key-based login still fails.",
    rootCause:
      "The public key is not listed in the remote account's authorized_keys.",
  },
  {
    id: "first-connection",
    label: "First connection (host key)",
    symptom: "SSH asks whether to trust the remote host key.",
    rootCause:
      "The host is not yet in known_hosts; verification is required once.",
  },
  {
    id: "host-key-mismatch",
    label: "Host-key mismatch",
    symptom: "SSH warns that the remote host identification has changed.",
    rootCause:
      "The stored known_hosts key does not match the key presented by the host.",
  },
] as const;

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                         Show this help message",
  "  ssh user@server              Connect to a simulated remote host",
  "  ssh bunsal@192.168.1.50      Connect by IP address",
  "  ssh -p 2222 user@server      Connect on a non-default port",
  "  ssh -v user@server           Connect with simulated verbose output",
  "  ssh-keygen -t ed25519        Generate a simulated ED25519 key pair",
  "  ssh-copy-id user@server      Authorize the local public key (simulated)",
  "  cat ~/.ssh/authorized_keys   Show simulated authorized_keys",
  "  cat ~/.ssh/known_hosts       Show simulated known_hosts",
  "  systemctl status ssh         Show simulated SSH service status",
  "  ss -tuln                     Show listening TCP/UDP sockets",
  "  getent hosts server          Resolve the simulated hostname",
  "  clear                        Clear the terminal screen",
  "",
  "Examples:",
  "  ssh user@server",
  "  ssh -p 2222 user@server",
  "  ssh-keygen -t ed25519",
  "  systemctl status ssh",
  "  ss -tuln",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const REMOTE_HOSTNAME = "server";
const REMOTE_IP = "192.168.1.50";
const HOST_KEY_LINE = `${REMOTE_HOSTNAME},${REMOTE_IP} ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAISimulatedHostKeyReanLinux`;
const PUBLIC_KEY_LINE =
  "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAISimulatedLearnerKey bunsal@rean-linux";
const HOST_FINGERPRINT = "SHA256:simulat3dF1ng3rpr1ntR3anL1nuxSSH";

const SUPPORTED_USERS = new Set(["user", "bunsal"]);

function scenarioState(scenarioId: SshScenarioId): SimulatedSshState {
  const base: SimulatedSshState = {
    scenarioId,
    hasLocalKey: true,
    keyAuthorized: true,
    hostKeyKnown: true,
    hostKeyMatches: true,
    sshServiceActive: true,
    sshListeningPort: 22,
    hostnameResolves: true,
    passwordAccepted: true,
    awaitingHostKeyConfirm: false,
    pendingTarget: null,
    pendingPort: null,
    pendingVerbose: false,
  };

  switch (scenarioId) {
    case "healthy":
      return base;
    case "unknown-host":
      return { ...base, hostnameResolves: false };
    case "ssh-stopped":
      return { ...base, sshServiceActive: false };
    case "wrong-port":
      return { ...base, sshListeningPort: 2222 };
    case "auth-failure":
      return {
        ...base,
        hasLocalKey: false,
        passwordAccepted: false,
        keyAuthorized: false,
      };
    case "key-not-authorized":
      return {
        ...base,
        passwordAccepted: false,
        keyAuthorized: false,
        hasLocalKey: true,
      };
    case "first-connection":
      return {
        ...base,
        hostKeyKnown: false,
        hostKeyMatches: true,
      };
    case "host-key-mismatch":
      return {
        ...base,
        hostKeyKnown: true,
        hostKeyMatches: false,
      };
  }
}

export function createInitialSshState(
  scenarioId: SshScenarioId = "healthy",
): SimulatedSshState {
  return cloneSshState(scenarioState(scenarioId));
}

export function cloneSshState(state: SimulatedSshState): SimulatedSshState {
  return {
    scenarioId: state.scenarioId,
    hasLocalKey: state.hasLocalKey,
    keyAuthorized: state.keyAuthorized,
    hostKeyKnown: state.hostKeyKnown,
    hostKeyMatches: state.hostKeyMatches,
    sshServiceActive: state.sshServiceActive,
    sshListeningPort: state.sshListeningPort,
    hostnameResolves: state.hostnameResolves,
    passwordAccepted: state.passwordAccepted,
    awaitingHostKeyConfirm: state.awaitingHostKeyConfirm,
    pendingTarget: state.pendingTarget,
    pendingPort: state.pendingPort,
    pendingVerbose: state.pendingVerbose,
  };
}

export function resetSshState(state: SimulatedSshState): SimulatedSshState {
  return createInitialSshState(state.scenarioId);
}

export function getSshScenario(id: SshScenarioId): SshScenarioMeta {
  const match = SSH_SCENARIOS.find((scenario) => scenario.id === id);
  if (!match) {
    return SSH_SCENARIOS[0]!;
  }
  return match;
}

export function isSshScenarioId(value: string): value is SshScenarioId {
  return SSH_SCENARIOS.some((scenario) => scenario.id === value);
}

export function formatSshPrompt(state?: SimulatedSshState | null): string {
  if (state?.awaitingHostKeyConfirm) {
    return "(yes/no)?";
  }
  return `${SIMULATED_SSH_USER}@${SIMULATED_SSH_HOST}:~$`;
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

function expandHomePath(path: string): string {
  if (path === "~" || path.startsWith("~/")) {
    return `/home/${SIMULATED_SSH_USER}${path.slice(1)}`;
  }
  return path;
}

function padRight(value: string, width: number): string {
  return value.length >= width
    ? value
    : value + " ".repeat(width - value.length);
}

function formatSsTuln(state: SimulatedSshState): string[] {
  const sockets: { netid: string; state: string; local: string }[] = [
    { netid: "udp", state: "UNCONN", local: "0.0.0.0:53" },
    { netid: "tcp", state: "LISTEN", local: "0.0.0.0:443" },
  ];

  if (state.sshServiceActive) {
    sockets.unshift({
      netid: "tcp",
      state: "LISTEN",
      local: `0.0.0.0:${state.sshListeningPort}`,
    });
  }

  const header = `${padRight("Netid", 6)}${padRight("State", 7)}Local Address:Port`;
  const rows = sockets.map((socket) => {
    const netid = padRight(socket.netid, 6);
    const socketState = padRight(socket.state, 7);
    return `${netid}${socketState}${socket.local}`;
  });
  return [header, ...rows];
}

function formatSystemctlStatusSsh(state: SimulatedSshState): string[] {
  if (state.sshServiceActive) {
    return [
      "● ssh.service - OpenBSD Secure Shell server",
      "     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)",
      "     Active: active (running)",
      `   Main PID: 1024 (sshd)`,
      `      Tasks: 1`,
      `     Memory: 4.2M`,
    ];
  }

  return [
    "○ ssh.service - OpenBSD Secure Shell server",
    "     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)",
    "     Active: inactive (dead)",
  ];
}

function formatAuthorizedKeys(state: SimulatedSshState): string[] {
  if (!state.keyAuthorized) {
    return [];
  }
  return [PUBLIC_KEY_LINE];
}

function formatKnownHosts(state: SimulatedSshState): string[] {
  if (!state.hostKeyKnown) {
    return [];
  }
  if (!state.hostKeyMatches) {
    return [
      `${REMOTE_HOSTNAME},${REMOTE_IP} ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOldStaleHostKeyDoNotMatch`,
    ];
  }
  return [HOST_KEY_LINE];
}

type ParsedSshTarget = {
  user: string;
  host: string;
};

function parseUserHost(value: string): ParsedSshTarget | null {
  const at = value.indexOf("@");
  if (at <= 0 || at === value.length - 1) {
    return null;
  }
  return {
    user: value.slice(0, at),
    host: value.slice(at + 1),
  };
}

function resolveHost(
  host: string,
  state: SimulatedSshState,
): { ip: string } | { error: string[] } {
  const normalized = host.toLowerCase();

  if (normalized === REMOTE_IP) {
    return { ip: REMOTE_IP };
  }

  if (normalized === REMOTE_HOSTNAME) {
    if (!state.hostnameResolves) {
      return {
        error: [
          `ssh: Could not resolve hostname ${host}: Name or service not known`,
        ],
      };
    }
    return { ip: REMOTE_IP };
  }

  return {
    error: [
      `ssh: Could not resolve hostname ${host}: Name or service not known`,
      `Hint: try "server" or "192.168.1.50" in this learning terminal.`,
    ],
  };
}

function formatVerbosePreamble(
  user: string,
  host: string,
  ip: string,
  port: number,
): string[] {
  return [
    `OpenSSH_simulated, Rean Linux learning terminal`,
    `debug1: Connecting to ${host} [${ip}] port ${port}.`,
    `debug1: Connection established.`,
    `debug1: Authenticating to ${host}:${port} as '${user}'.`,
  ];
}

function formatSuccessBanner(user: string, host: string): string[] {
  return [
    `Welcome to Ubuntu 24.04 LTS (simulated)`,
    "",
    `Last login: Tue Oct 14 08:00:00 2026 from 192.168.1.20`,
    `${user}@${host}:~$`,
    "",
    "(Simulated remote shell — type exit concepts are not required; connection demo complete.)",
  ];
}

function clearPending(state: SimulatedSshState): SimulatedSshState {
  return {
    ...state,
    awaitingHostKeyConfirm: false,
    pendingTarget: null,
    pendingPort: null,
    pendingVerbose: false,
  };
}

function completeSuccessfulLogin(
  state: SimulatedSshState,
  user: string,
  host: string,
  verbose: boolean,
  ip: string,
  port: number,
): SimulateSshResult {
  const lines: string[] = [];
  if (verbose) {
    lines.push(...formatVerbosePreamble(user, host, ip, port));
    lines.push("debug1: Authentication succeeded.");
  }
  lines.push(
    ...formatSuccessBanner(user, host === REMOTE_IP ? "server" : host),
  );
  return {
    result: { kind: "output", lines },
    state: clearPending(state),
  };
}

function attemptAuthentication(
  state: SimulatedSshState,
  user: string,
  host: string,
  verbose: boolean,
  ip: string,
  port: number,
): SimulateSshResult {
  const nextState = clearPending(cloneSshState(state));

  if (state.keyAuthorized || state.passwordAccepted) {
    return completeSuccessfulLogin(nextState, user, host, verbose, ip, port);
  }

  // Key present locally but not authorized on the remote account.
  if (state.hasLocalKey && !state.keyAuthorized) {
    const lines: string[] = [];
    if (verbose) {
      lines.push(...formatVerbosePreamble(user, host, ip, port));
      lines.push("debug1: Offering public key: ~/.ssh/id_ed25519");
      lines.push("debug1: Authentications that can continue: publickey");
    }
    lines.push(
      `${user}@${host}: Permission denied (publickey).`,
      "Note: a local private key exists, but the matching public key is not authorized on the remote account.",
    );
    return { result: { kind: "output", lines }, state: nextState };
  }

  const lines: string[] = [];
  if (verbose) {
    lines.push(...formatVerbosePreamble(user, host, ip, port));
    lines.push("debug1: Authentications that can continue: password");
    lines.push("debug1: Authentication failed.");
  }
  lines.push(`${user}@${host}: Permission denied (password).`);
  lines.push(
    "Note: the TCP connection reached SSH — this is an authentication failure, not a network timeout.",
  );
  return { result: { kind: "output", lines }, state: nextState };
}

function handleHostKeyConfirm(
  answer: string,
  state: SimulatedSshState,
): SimulateSshResult {
  const next = cloneSshState(state);
  const normalized = answer.trim().toLowerCase();
  const target = next.pendingTarget;
  const port = next.pendingPort ?? 22;
  const verbose = next.pendingVerbose;

  if (!target) {
    return {
      result: {
        kind: "output",
        lines: ["No pending host-key confirmation."],
      },
      state: clearPending(next),
    };
  }

  const parsed = parseUserHost(target);
  if (!parsed) {
    return {
      result: { kind: "output", lines: ["Invalid pending SSH target."] },
      state: clearPending(next),
    };
  }

  if (normalized === "yes") {
    next.hostKeyKnown = true;
    next.hostKeyMatches = true;
    const resolved = resolveHost(parsed.host, next);
    if ("error" in resolved) {
      return {
        result: { kind: "output", lines: resolved.error },
        state: clearPending(next),
      };
    }
    return attemptAuthentication(
      next,
      parsed.user,
      parsed.host,
      verbose,
      resolved.ip,
      port,
    );
  }

  if (normalized === "no") {
    return {
      result: {
        kind: "output",
        lines: ["Host key verification failed."],
      },
      state: clearPending(next),
    };
  }

  return {
    result: {
      kind: "output",
      lines: [
        'Please type "yes" or "no".',
        `Are you sure you want to continue connecting (yes/no)?`,
      ],
    },
    state: next,
  };
}

function handleSsh(
  tokens: string[],
  state: SimulatedSshState,
): SimulateSshResult {
  const nextState = cloneSshState(state);
  let port = 22;
  let verbose = false;
  const positional: string[] = [];

  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i]!;
    if (token === "-p") {
      const portToken = tokens[i + 1];
      if (!portToken || !/^\d+$/.test(portToken)) {
        return {
          result: {
            kind: "output",
            lines: [
              "ssh: option requires an argument -- p",
              "Usage: ssh [-v] [-p PORT] user@host",
            ],
          },
          state: nextState,
        };
      }
      port = Number(portToken);
      i += 1;
      continue;
    }
    if (token === "-v") {
      verbose = true;
      continue;
    }
    if (token.startsWith("-")) {
      return {
        result: {
          kind: "output",
          lines: [
            `ssh: unsupported option '${token}' in this learning terminal.`,
            "Supported: ssh [-v] [-p PORT] user@host",
          ],
        },
        state: nextState,
      };
    }
    positional.push(token);
  }

  if (positional.length !== 1) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: ssh [-v] [-p PORT] user@host",
          "Examples: ssh user@server",
          "          ssh bunsal@192.168.1.50",
          "          ssh -p 2222 user@server",
          "          ssh -v user@server",
        ],
      },
      state: nextState,
    };
  }

  const parsed = parseUserHost(positional[0]!);
  if (!parsed) {
    return {
      result: {
        kind: "output",
        lines: [
          "ssh: target must look like user@host",
          "Example: ssh user@server",
        ],
      },
      state: nextState,
    };
  }

  if (!SUPPORTED_USERS.has(parsed.user.toLowerCase())) {
    return {
      result: {
        kind: "output",
        lines: [
          `ssh: unsupported username '${parsed.user}' in this learning terminal.`,
          "Try: user or bunsal",
        ],
      },
      state: nextState,
    };
  }

  const resolved = resolveHost(parsed.host, nextState);
  if ("error" in resolved) {
    return {
      result: { kind: "output", lines: resolved.error },
      state: nextState,
    };
  }

  if (!nextState.sshServiceActive) {
    const lines: string[] = [];
    if (verbose) {
      lines.push(
        `OpenSSH_simulated, Rean Linux learning terminal`,
        `debug1: Connecting to ${parsed.host} [${resolved.ip}] port ${port}.`,
        `debug1: connect to address ${resolved.ip} port ${port}: Connection refused`,
      );
    }
    lines.push(
      `ssh: connect to host ${parsed.host} port ${port}: Connection refused`,
    );
    lines.push(
      "Hint: check whether the SSH service is running (`systemctl status ssh`) and listening (`ss -tuln`).",
    );
    return { result: { kind: "output", lines }, state: nextState };
  }

  if (port !== nextState.sshListeningPort) {
    const lines: string[] = [];
    if (verbose) {
      lines.push(
        `OpenSSH_simulated, Rean Linux learning terminal`,
        `debug1: Connecting to ${parsed.host} [${resolved.ip}] port ${port}.`,
        `debug1: connect to address ${resolved.ip} port ${port}: Connection refused`,
      );
    }
    lines.push(
      `ssh: connect to host ${parsed.host} port ${port}: Connection refused`,
    );
    if (nextState.sshListeningPort !== 22) {
      lines.push(
        `Hint: something may be listening on a different port — check \`ss -tuln\` (this scenario listens on ${nextState.sshListeningPort}).`,
      );
    }
    return { result: { kind: "output", lines }, state: nextState };
  }

  if (nextState.hostKeyKnown && !nextState.hostKeyMatches) {
    return {
      result: {
        kind: "output",
        lines: [
          `@WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED! @`,
          `IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!`,
          `Someone could be eavesdropping on you right now (man-in-the-middle attack)!`,
          `It is also possible that a host key has just been changed.`,
          `The fingerprint for the ED25519 key sent by the remote host is`,
          `${HOST_FINGERPRINT}.`,
          `Please contact your system administrator.`,
          `Add correct host key in ~/.ssh/known_hosts to get rid of this message.`,
          `Host key verification failed.`,
          "",
          "Safety: do not blindly delete or ignore this warning. Verify the host key",
          "through a trusted channel before changing known_hosts.",
        ],
      },
      state: nextState,
    };
  }

  if (!nextState.hostKeyKnown) {
    nextState.awaitingHostKeyConfirm = true;
    nextState.pendingTarget = `${parsed.user}@${parsed.host}`;
    nextState.pendingPort = port;
    nextState.pendingVerbose = verbose;
    return {
      result: {
        kind: "output",
        lines: [
          `The authenticity of host '${parsed.host} (${resolved.ip})' can't be established.`,
          `ED25519 key fingerprint is ${HOST_FINGERPRINT}.`,
          `This key is not known by any other names.`,
          `Are you sure you want to continue connecting (yes/no)?`,
        ],
      },
      state: nextState,
    };
  }

  return attemptAuthentication(
    nextState,
    parsed.user,
    parsed.host,
    verbose,
    resolved.ip,
    port,
  );
}

function handleSshKeygen(
  tokens: string[],
  state: SimulatedSshState,
): SimulateSshResult {
  const nextState = cloneSshState(state);

  if (tokens.length === 3 && tokens[1] === "-t" && tokens[2] === "ed25519") {
    if (nextState.hasLocalKey) {
      return {
        result: {
          kind: "output",
          lines: [
            `Generating public/private ed25519 key pair.`,
            `/home/${SIMULATED_SSH_USER}/.ssh/id_ed25519 already exists (simulated).`,
            "Overwriting is not required in this lesson — your local key is ready.",
          ],
        },
        state: nextState,
      };
    }

    nextState.hasLocalKey = true;
    return {
      result: {
        kind: "output",
        lines: [
          "Generating public/private ed25519 key pair.",
          `Your identification has been saved in /home/${SIMULATED_SSH_USER}/.ssh/id_ed25519`,
          `Your public key has been saved in /home/${SIMULATED_SSH_USER}/.ssh/id_ed25519.pub`,
          `The key fingerprint is:`,
          `SHA256:simulat3dL0calL3arn3rK3y bunsal@rean-linux`,
          "",
          "Remember: keep the private key secret. Share only the .pub file.",
        ],
      },
      state: nextState,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [
        "Usage: ssh-keygen -t ed25519",
        "Only ED25519 key generation is supported in this learning terminal.",
      ],
    },
    state: nextState,
  };
}

function handleSshCopyId(
  tokens: string[],
  state: SimulatedSshState,
): SimulateSshResult {
  const nextState = cloneSshState(state);

  if (tokens.length !== 2) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: ssh-copy-id user@host",
          "Example: ssh-copy-id user@server",
        ],
      },
      state: nextState,
    };
  }

  if (!nextState.hasLocalKey) {
    return {
      result: {
        kind: "output",
        lines: [
          "ssh-copy-id: ERROR: No local identities found.",
          "Generate a key first: ssh-keygen -t ed25519",
        ],
      },
      state: nextState,
    };
  }

  const parsed = parseUserHost(tokens[1]!);
  if (!parsed || !SUPPORTED_USERS.has(parsed.user.toLowerCase())) {
    return {
      result: {
        kind: "output",
        lines: [
          "ssh-copy-id: target must look like user@host",
          "Example: ssh-copy-id user@server",
        ],
      },
      state: nextState,
    };
  }

  const resolved = resolveHost(parsed.host, nextState);
  if ("error" in resolved) {
    return {
      result: { kind: "output", lines: resolved.error },
      state: nextState,
    };
  }

  if (!nextState.sshServiceActive || nextState.sshListeningPort !== 22) {
    return {
      result: {
        kind: "output",
        lines: [
          `ssh-copy-id: connection to ${parsed.host} failed.`,
          "Ensure SSH is running on the expected port before copying a key.",
        ],
      },
      state: nextState,
    };
  }

  if (nextState.hostKeyKnown && !nextState.hostKeyMatches) {
    return {
      result: {
        kind: "output",
        lines: [
          "ssh-copy-id: Host key verification failed.",
          "Resolve the host-key mismatch through a trusted channel first.",
        ],
      },
      state: nextState,
    };
  }

  nextState.keyAuthorized = true;
  if (!nextState.hostKeyKnown) {
    nextState.hostKeyKnown = true;
    nextState.hostKeyMatches = true;
  }

  return {
    result: {
      kind: "output",
      lines: [
        `/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/home/${SIMULATED_SSH_USER}/.ssh/id_ed25519.pub"`,
        `Number of key(s) added: 1`,
        "",
        `Now try logging into the machine, with: "ssh ${parsed.user}@${parsed.host}"`,
        "and check to make sure that only the key(s) you wanted were added.",
      ],
    },
    state: nextState,
  };
}

function handleCat(
  tokens: string[],
  state: SimulatedSshState,
): SimulateSshResult {
  const nextState = cloneSshState(state);

  if (tokens.length !== 2) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: cat PATH",
          "Supported: cat ~/.ssh/authorized_keys",
          "           cat ~/.ssh/known_hosts",
        ],
      },
      state: nextState,
    };
  }

  const path = expandHomePath(tokens[1]!);
  const authorized = `/home/${SIMULATED_SSH_USER}/.ssh/authorized_keys`;
  const knownHosts = `/home/${SIMULATED_SSH_USER}/.ssh/known_hosts`;

  if (path === authorized) {
    const lines = formatAuthorizedKeys(nextState);
    return {
      result: {
        kind: "output",
        lines:
          lines.length > 0
            ? lines
            : [
                "(empty — no public key is authorized for the simulated remote account)",
              ],
      },
      state: nextState,
    };
  }

  if (path === knownHosts) {
    const lines = formatKnownHosts(nextState);
    return {
      result: {
        kind: "output",
        lines:
          lines.length > 0
            ? lines
            : ["(empty — no host keys trusted yet in known_hosts)"],
      },
      state: nextState,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [
        `cat: ${tokens[1]}: not available in this learning terminal.`,
        "Supported: cat ~/.ssh/authorized_keys",
        "           cat ~/.ssh/known_hosts",
      ],
    },
    state: nextState,
  };
}

function handleSystemctl(
  tokens: string[],
  state: SimulatedSshState,
): SimulateSshResult {
  const nextState = cloneSshState(state);

  if (
    tokens.length === 3 &&
    tokens[1]!.toLowerCase() === "status" &&
    tokens[2]!.toLowerCase() === "ssh"
  ) {
    return {
      result: { kind: "output", lines: formatSystemctlStatusSsh(nextState) },
      state: nextState,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [
        "Usage: systemctl status ssh",
        "Only SSH service status is supported in this learning terminal.",
      ],
    },
    state: nextState,
  };
}

function handleSs(
  tokens: string[],
  state: SimulatedSshState,
): SimulateSshResult {
  const nextState = cloneSshState(state);

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
  state: SimulatedSshState,
): SimulateSshResult {
  const nextState = cloneSshState(state);

  if (tokens.length !== 3 || tokens[1]!.toLowerCase() !== "hosts") {
    return {
      result: {
        kind: "output",
        lines: ["Usage: getent hosts HOSTNAME", "Example: getent hosts server"],
      },
      state: nextState,
    };
  }

  const hostname = tokens[2]!.toLowerCase();

  if (hostname !== REMOTE_HOSTNAME) {
    return {
      result: {
        kind: "output",
        lines: [
          `getent: ${tokens[2]}: not found in the simulated hosts table.`,
          "Try: getent hosts server",
        ],
      },
      state: nextState,
    };
  }

  if (!nextState.hostnameResolves) {
    return {
      result: {
        kind: "output",
        lines: ["getent: server: Name or service not known"],
      },
      state: nextState,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [`${REMOTE_IP}    server`],
    },
    state: nextState,
  };
}

/**
 * Simulate an SSH / remote-access command against in-memory lesson state.
 * Never executes real shell commands, opens sockets, or touches real keys.
 */
export function simulateSshRemoteAccessCommand(
  rawInput: string,
  state: SimulatedSshState,
): SimulateSshResult {
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return {
      result: { kind: "empty" },
      state: cloneSshState(state),
    };
  }

  if (state.awaitingHostKeyConfirm) {
    return handleHostKeyConfirm(trimmed, state);
  }

  const tokensResult = tokenize(trimmed);
  if ("error" in tokensResult) {
    return {
      result: { kind: "output", lines: [tokensResult.error] },
      state: cloneSshState(state),
    };
  }

  const tokens = tokensResult;
  const command = (tokens[0] ?? "").toLowerCase();

  switch (command) {
    case "help":
      return {
        result: { kind: "output", lines: HELP_OUTPUT },
        state: cloneSshState(state),
      };

    case "clear":
      return {
        result: { kind: "clear" },
        state: cloneSshState(state),
      };

    case "ssh":
      return handleSsh(tokens, state);

    case "ssh-keygen":
      return handleSshKeygen(tokens, state);

    case "ssh-copy-id":
      return handleSshCopyId(tokens, state);

    case "cat":
      return handleCat(tokens, state);

    case "systemctl":
      return handleSystemctl(tokens, state);

    case "ss":
      return handleSs(tokens, state);

    case "getent":
      return handleGetent(tokens, state);

    default:
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: cloneSshState(state),
      };
  }
}
