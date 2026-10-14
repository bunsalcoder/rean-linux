import type { Lesson } from "@/types/lesson";

export const sshAndRemoteAccessLesson = {
  slug: "ssh-and-remote-access",
  level: "administration",
  levelNumber: "03",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "SSH and Remote Access",
  description:
    "Learn how SSH works for remote administration, keys, host verification, and common connection failures — entirely in a safe simulator.",
  seoTitle: "SSH and Remote Access — Linux Administration | Rean Linux",
  seoDescription:
    "Practice SSH connections, ports, key-based authentication, known_hosts, and troubleshooting common remote-access failures in a simulated terminal.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Administration", href: "/learn/administration" },
    { label: "SSH and Remote Access" },
  ],
  navigation: {
    previous: {
      label: "Network Troubleshooting",
      href: "/learn/administration/network-troubleshooting",
    },
    next: {
      label: "Firewall Basics",
      href: "/learn/administration/firewall-basics",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "After [Network Troubleshooting](/learn/administration/network-troubleshooting), you can diagnose connectivity. This lesson focuses on **SSH** — the standard way administrators log into remote Linux systems — still entirely in a simulated terminal that never opens real network connections.",
    },
  ],
  sections: [
    {
      id: "what-is-ssh",
      title: "What SSH Is and Why Admins Use It",
      blocks: [
        {
          type: "paragraph",
          text: "**SSH** (Secure Shell) provides encrypted remote login and command execution. Administrators use it to manage servers in data centers, cloud VMs, and lab machines without sitting at a physical console.",
        },
        {
          type: "list",
          items: [
            "Encrypts the session so passwords and commands are not sent in clear text",
            "Works over a normal IP network (LAN or internet)",
            "Supports password and public-key authentication",
            "Is the foundation for many remote administration workflows",
          ],
        },
        {
          type: "callout",
          title: "Learning safety",
          text: "Everything in this lesson is **simulated**. The app never runs real `ssh`, never opens sockets, and never reads or writes real `~/.ssh` files on your computer.",
        },
      ],
    },
    {
      id: "local-vs-remote",
      title: "Local Machine Versus Remote Server",
      blocks: [
        {
          type: "paragraph",
          text: "Keep two roles clear:",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Local machine (client)",
              description:
                "The computer where you type `ssh` — in this lesson, the simulated prompt `bunsal@rean-linux`.",
            },
            {
              term: "Remote server (host)",
              description:
                "The machine you connect to — here, the simulated host `server` at `192.168.1.50`.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "Your shell prompt stays on the local machine until SSH succeeds. After a successful login, commands would run on the remote side. This simulator demonstrates the connection outcome without running a full remote shell.",
        },
      ],
    },
    {
      id: "ssh-connection-structure",
      title: "Structure of an SSH Connection",
      blocks: [
        {
          type: "paragraph",
          text: "A typical SSH session follows this path:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Resolve the hostname to an IP address (unless you already use an IP)",
            "Open a TCP connection to the SSH port (default **22**)",
            "Verify the remote **host key** against `known_hosts`",
            "Authenticate (password and/or public key)",
            "Start an encrypted session for remote commands",
          ],
        },
        {
          type: "table",
          caption: "Pieces of an SSH connection",
          headers: ["Piece", "Example", "Role"],
          rows: [
            ["Username", "`user`", "Account on the remote system"],
            ["Hostname / IP", "`server` / `192.168.1.50`", "Where to connect"],
            ["Port", "`22` or `2222`", "Where sshd listens"],
            ["Host key", "`known_hosts`", "Trust the remote identity"],
            ["Auth", "password or key", "Prove who you are"],
          ],
        },
      ],
    },
    {
      id: "ssh-syntax",
      title: "Understanding ssh username@hostname",
      blocks: [
        {
          type: "paragraph",
          text: "The most common form is:",
        },
        {
          type: "code",
          code: "ssh user@server",
          title: "Connect as user to host server",
        },
        {
          type: "paragraph",
          text: "Read it as: “Using SSH, log in as **user** on the host named **server**.” You can also connect by IP:",
        },
        {
          type: "code",
          code: "ssh bunsal@192.168.1.50",
          title: "Connect by IP address",
        },
        {
          type: "terminal",
          preset: "ssh-and-remote-access",
          suggestions: [
            { command: "ssh user@server", label: "ssh user@server" },
            { command: "ssh bunsal@192.168.1.50", label: "ssh by IP" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Try a basic connection",
        },
        {
          type: "callout",
          title: "Common mistake",
          text: "Swapping the order (`ssh server@user`) or omitting `@`. The username comes **before** `@`; the host comes **after**.",
        },
      ],
    },
    {
      id: "ports-and-targets",
      title: "IP, Hostname, and Non-Default Ports",
      blocks: [
        {
          type: "paragraph",
          text: "When sshd listens on a non-default port, specify it with `-p`:",
        },
        {
          type: "code",
          code: "ssh -p 2222 user@server",
          title: "Connect on TCP port 2222",
        },
        {
          type: "paragraph",
          text: "Confirm what is listening with `ss -tuln`, and resolve names with `getent hosts server`.",
        },
        {
          type: "terminal",
          preset: "ssh-and-remote-access",
          suggestions: [
            { command: "getent hosts server", label: "getent hosts server" },
            { command: "ss -tuln", label: "ss -tuln" },
            { command: "ssh -p 2222 user@server", label: "ssh -p 2222" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Resolve and check ports",
        },
        {
          type: "note",
          text: "In the practice lab, one scenario listens on **2222** so default port 22 fails with `Connection refused` until you pass `-p 2222`.",
        },
      ],
    },
    {
      id: "port-22-and-sshd",
      title: "TCP Port 22 and the SSH Service",
      blocks: [
        {
          type: "paragraph",
          text: "On most systems the SSH daemon (`sshd`) is managed as a service — often `ssh.service` or `sshd.service` — and listens on **TCP 22** by default.",
        },
        {
          type: "code",
          code: "systemctl status ssh\nss -tuln",
          title: "Check service status and listeners",
        },
        {
          type: "paragraph",
          text: "If the service is **inactive** and nothing listens on the SSH port, clients see `Connection refused` — that is different from a wrong password.",
        },
        {
          type: "terminal",
          preset: "ssh-and-remote-access",
          suggestions: [
            { command: "systemctl status ssh", label: "systemctl status ssh" },
            { command: "ss -tuln", label: "ss -tuln" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect the SSH service",
        },
      ],
    },
    {
      id: "password-vs-keys",
      title: "Password Versus Public-Key Authentication",
      blocks: [
        {
          type: "paragraph",
          text: "SSH can authenticate with a **password** or with a **key pair**. Many environments prefer keys for automation and stronger practice, but the right choice depends on security policy and operational needs — this lesson does **not** claim every system must disable passwords.",
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "Password authentication",
              blocks: [
                {
                  type: "list",
                  items: [
                    "Simple to start",
                    "Risk of weak or reused passwords",
                    "Often combined with rate limiting / MFA in production",
                  ],
                },
              ],
            },
            {
              title: "Public-key authentication",
              blocks: [
                {
                  type: "list",
                  items: [
                    "Uses a private key locally and a public key on the server",
                    "Convenient for frequent admin access",
                    "Requires protecting the private key",
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "public-and-private-keys",
      title: "Public Keys, Private Keys, and Secrecy",
      blocks: [
        {
          type: "definitions",
          items: [
            {
              term: "Private key",
              description:
                "Stays on your local machine (for example `~/.ssh/id_ed25519`). Never share it, commit it, or paste it into chat.",
            },
            {
              term: "Public key",
              description:
                "Safe to install on remote accounts (for example in `authorized_keys`). It cannot decrypt your private key.",
            },
          ],
        },
        {
          type: "callout",
          title: "Golden rule",
          text: "If someone has your **private** key (and any passphrase is weak or missing), they can impersonate you. Treat private keys like long-lived credentials.",
        },
      ],
    },
    {
      id: "ssh-key-workflow",
      title: "ssh-keygen, ssh-copy-id, and authorized_keys",
      blocks: [
        {
          type: "paragraph",
          text: "A common learning workflow looks like this:",
        },
        {
          type: "code",
          code: "ssh-keygen -t ed25519\nssh-copy-id user@server\ncat ~/.ssh/authorized_keys",
          title: "Generate, install, and inspect (simulated)",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "`ssh-keygen -t ed25519` — create a modern key pair locally",
            "`ssh-copy-id user@server` — append your public key to the remote account’s `authorized_keys`",
            "`cat ~/.ssh/authorized_keys` — in this simulator, inspect whether the key is authorized for the remote account",
          ],
        },
        {
          type: "terminal",
          preset: "ssh-and-remote-access",
          suggestions: [
            { command: "ssh-keygen -t ed25519", label: "ssh-keygen" },
            { command: "ssh-copy-id user@server", label: "ssh-copy-id" },
            {
              command: "cat ~/.ssh/authorized_keys",
              label: "authorized_keys",
            },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Key workflow",
        },
        {
          type: "note",
          text: "Having a local key is not enough. The matching **public** key must be authorized on the remote account, or you will see `Permission denied (publickey)`.",
        },
      ],
    },
    {
      id: "host-key-verification",
      title: "Host Keys, known_hosts, and First Connections",
      blocks: [
        {
          type: "paragraph",
          text: "Before trusting a server, SSH checks its **host key**. On first connect you may see a prompt asking whether to continue. Accepting stores the key in `~/.ssh/known_hosts`.",
        },
        {
          type: "code",
          code: "cat ~/.ssh/known_hosts",
          title: "Inspect trusted host keys (simulated)",
        },
        {
          type: "paragraph",
          text: "`authorized_keys` and `known_hosts` solve different problems:",
        },
        {
          type: "table",
          caption: "authorized_keys vs known_hosts",
          headers: ["File", "Answers", "About"],
          rows: [
            [
              "`authorized_keys`",
              "Who may log in?",
              "Client public keys trusted by a remote account",
            ],
            [
              "`known_hosts`",
              "Is this the server I expect?",
              "Remote host keys trusted by your client",
            ],
          ],
        },
        {
          type: "terminal",
          preset: "ssh-and-remote-access",
          suggestions: [
            { command: "cat ~/.ssh/known_hosts", label: "known_hosts" },
            {
              command: "cat ~/.ssh/authorized_keys",
              label: "authorized_keys",
            },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Compare trust files",
        },
      ],
    },
    {
      id: "connection-failures",
      title: "Common Failures and Systematic Troubleshooting",
      blocks: [
        {
          type: "paragraph",
          text: "Read the error carefully — different messages point to different layers:",
        },
        {
          type: "table",
          caption: "SSH failure patterns",
          headers: ["Symptom", "Likely meaning", "Next check"],
          rows: [
            [
              "`Name or service not known`",
              "Hostname resolution failed",
              "`getent hosts server`",
            ],
            [
              "`Connection refused`",
              "Nothing accepted TCP on that port",
              "`systemctl status ssh`, `ss -tuln`",
            ],
            [
              "`Permission denied`",
              "Reached SSH; authentication failed",
              "Credentials / `authorized_keys`",
            ],
            [
              "`Permission denied (publickey)`",
              "Key not accepted for that account",
              "`ssh-copy-id`, inspect authorized keys",
            ],
            [
              "`REMOTE HOST IDENTIFICATION HAS CHANGED`",
              "Host key mismatch",
              "Verify via a trusted channel — do not blind-bypass",
            ],
          ],
        },
        {
          type: "paragraph",
          text: "Use verbose mode when you need more diagnostic detail:",
        },
        {
          type: "code",
          code: "ssh -v user@server",
          title: "Simulated verbose SSH diagnostics",
        },
        {
          type: "terminal",
          preset: "ssh-and-remote-access",
          suggestions: [
            { command: "ssh -v user@server", label: "ssh -v" },
            { command: "systemctl status ssh", label: "systemctl status ssh" },
            { command: "ss -tuln", label: "ss -tuln" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Diagnose with evidence",
        },
        {
          type: "callout",
          title: "Auth failure ≠ network failure",
          text: "`Connection refused` means the TCP path to that port failed. `Permission denied` means SSH answered and rejected authentication. Do not “fix DNS” when the message is already about credentials.",
        },
      ],
    },
    {
      id: "security-practices",
      title: "Security Practices for Remote Administration",
      blocks: [
        {
          type: "paragraph",
          text: "Use this practical checklist when working with SSH:",
        },
        {
          type: "list",
          items: [
            "**Keep private keys secret** — never share, commit, or upload private keys.",
            "**Use strong authentication** — prefer well-protected keys; use passphrases where appropriate.",
            "**Verify host keys** — especially on first connect and after unexpected warnings.",
            "**Prefer key-based authentication when properly configured** — still follow your organization’s access policy.",
            "**Avoid exposing SSH unnecessarily** — limit exposure with network controls and least access.",
            "**Use least-privilege accounts** — avoid day-to-day root logins when a normal admin account will do.",
            "**Investigate unexpected connection or host-key warnings** — verify through a trusted channel before changing `known_hosts`.",
          ],
        },
        {
          type: "note",
          text: "Whether password authentication stays enabled depends on security requirements and access policy. Understand the trade-offs; do not assume one setting fits every environment.",
        },
        {
          type: "callout",
          title: "Host-key mismatch",
          text: "An unexpected host-key change can mean a legitimate rebuild — or a man-in-the-middle risk. **Do not** train yourself to bypass the warning. Confirm the fingerprint through a trusted channel first.",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Work through seven scenarios: healthy connect, non-default port, stopped SSH service, authentication failure, unauthorized public key, `authorized_keys` vs `known_hosts`, and a host-key mismatch warning.",
        },
        {
          type: "exercise",
          id: "ssh-and-remote-access-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "ssh-and-remote-access-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to use SSH for remote administration concepts safely:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Explain why administrators use SSH",
            "Use `ssh user@host` and `ssh -p` for non-default ports",
            "Relate port 22 to the SSH service and `ss -tuln`",
            "Describe password vs public-key authentication",
            "Use `ssh-keygen`, `ssh-copy-id`, and `authorized_keys` concepts",
            "Explain `known_hosts` and host-key verification",
            "Distinguish resolution, refusal, auth, and host-key failures",
            "Apply a practical security checklist for remote access",
          ],
        },
        {
          type: "table",
          caption: "Command reference for SSH and remote access",
          headers: ["Command", "Purpose"],
          rows: [
            ["`ssh user@server`", "Connect by hostname"],
            ["`ssh bunsal@192.168.1.50`", "Connect by IP"],
            ["`ssh -p 2222 user@server`", "Connect on a non-default port"],
            ["`ssh -v user@server`", "Verbose diagnostic output"],
            ["`ssh-keygen -t ed25519`", "Generate an ED25519 key pair"],
            ["`ssh-copy-id user@server`", "Authorize a public key remotely"],
            ["`cat ~/.ssh/authorized_keys`", "Inspect authorized public keys"],
            ["`cat ~/.ssh/known_hosts`", "Inspect trusted host keys"],
            ["`systemctl status ssh`", "Check SSH service status"],
            ["`ss -tuln`", "List listening sockets"],
            ["`getent hosts server`", "Resolve the simulated hostname"],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next: [Firewall Basics](/learn/administration/firewall-basics) — how hosts decide which inbound traffic (including SSH) is allowed.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
