import type { Lesson } from "@/types/lesson";

export const securitySshHardeningLesson = {
  slug: "ssh-hardening",
  level: "security",
  levelNumber: "04",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "SSH Security Hardening",
  description:
    "Review sshd configuration, authentication choices, access restrictions, and remote-access hardening in a safe simulated laboratory.",
  seoTitle: "SSH Security Hardening — Linux Security | Rean Linux",
  seoDescription:
    "Learn SSH hardening: sshd_config settings, key vs password authentication, root login, AllowUsers, MaxAuthTries, validation, and log review in a simulated lab.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Security and Hardening", href: "/learn/security" },
    { label: "SSH Security Hardening" },
  ],
  navigation: {
    previous: {
      label: "sudo and Privilege Management",
      href: "/learn/security/privilege-management",
    },
    next: {
      label: "Firewall Hardening and Network Exposure",
      href: "/learn/security/firewall-hardening",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "Remote administration is powerful — and exposed. This lesson builds on Stage 03 SSH basics and Stage 04 privilege ideas to **harden SSH**: understand `sshd_config`, choose authentication wisely, restrict who may connect, validate changes, and read authentication logs with a skeptical eye.",
    },
    {
      type: "callout",
      title: "Learning safety",
      text: "Everything here is **simulated**. The app never runs real `ssh` or `sshd`, never opens sockets, never reads host `/etc/ssh/sshd_config`, and never generates or requests real private keys, passwords, or credentials. Configuration snippets are **educational examples** labelled as fictional.",
    },
  ],
  sections: [
    {
      id: "ssh-security-fundamentals",
      title: "SSH Security Fundamentals",
      blocks: [
        {
          type: "paragraph",
          text: "**SSH** (Secure Shell) provides encrypted remote login and command execution. Administrators use it to manage servers across networks without sending clear-text passwords or session traffic.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "SSH client",
              description:
                "The program you run locally (for example `ssh user@host`) to start a remote session.",
            },
            {
              term: "SSH server (sshd)",
              description:
                "The daemon on the remote host that listens for connections, authenticates users, and starts sessions — typically configured via `/etc/ssh/sshd_config`.",
            },
            {
              term: "Authentication",
              description:
                "Proving identity — password, public key, or additional factors — before a session starts.",
            },
            {
              term: "Encryption",
              description:
                "Protecting the session so eavesdroppers cannot read commands or credentials in transit.",
            },
          ],
        },
        {
          type: "list",
          items: [
            "Remote administration is a **common attack surface**: exposed SSH attracts scanners and credential stuffing",
            "Weak passwords, shared root logins, and unrestricted account access increase blast radius",
            "Misconfiguration can lock operators out — or leave the door open",
            "Changing only the listening **port** does **not** provide meaningful protection against unauthorized access",
          ],
        },
        {
          type: "callout",
          title: "Common SSH risks",
          text: "Internet-exposed SSH with password authentication, direct root login, empty passwords, overly broad user access, and unmonitored failure logs are frequent findings. Hardening reduces opportunity without pretending risk is zero.",
        },
        {
          type: "terminal",
          preset: "security-ssh-hardening",
          suggestions: [
            { command: "systemctl status ssh", label: "status ssh" },
            { command: "ss -tuln", label: "ss -tuln" },
            { command: "cat /etc/ssh/sshd_config", label: "cat config" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect exposure",
        },
      ],
    },
    {
      id: "understanding-sshd-config",
      title: "Understanding SSH Configuration",
      blocks: [
        {
          type: "paragraph",
          text: "OpenSSH server policy lives primarily in **`/etc/ssh/sshd_config`**. Important settings control the listening port, who may log in, how they authenticate, and how patient the daemon is with failed attempts.",
        },
        {
          type: "table",
          caption: "Important sshd_config settings (educational overview)",
          headers: ["Setting", "Controls", "Security notes"],
          rows: [
            [
              "`Port`",
              "TCP port sshd listens on (default 22)",
              "Non-default ports may cut casual noise but are **not** strong protection by themselves",
            ],
            [
              "`PermitRootLogin`",
              "Whether root may authenticate over SSH",
              "`yes` is high risk; prefer `no` or `prohibit-password` with individual admin accounts",
            ],
            [
              "`PasswordAuthentication`",
              "Whether password logins are accepted",
              "Convenient but guessable; disable only after keys (and recovery access) work",
            ],
            [
              "`PubkeyAuthentication`",
              "Whether public-key authentication is accepted",
              "Preferred when keys are well managed and private keys stay secret",
            ],
            [
              "`PermitEmptyPasswords`",
              "Whether accounts with empty passwords may log in",
              "Keep `no` — empty passwords are an open invitation",
            ],
            [
              "`MaxAuthTries`",
              "Authentication attempts allowed per connection",
              "Lower values limit guessing; combine with strong credentials and monitoring",
            ],
            [
              "`LoginGraceTime`",
              "Time allowed to complete authentication",
              "Shorter windows reduce lingering unfinished connections",
            ],
            [
              "`AllowUsers` / `AllowGroups`",
              "Explicit allowlists for SSH identities",
              "Shrink who may even attempt authentication",
            ],
            [
              "`DenyUsers` / `DenyGroups`",
              "Explicit denylists",
              "Useful supplements; allowlists are often clearer for small admin sets",
            ],
            [
              "`X11Forwarding`",
              "Whether X11 display forwarding is permitted",
              "Disable unless a justified graphical remote workflow needs it",
            ],
          ],
        },
        {
          type: "code",
          title:
            "Educational example (fictional — do not treat as a live host policy)",
          language: "bash",
          code: "# Fictional /etc/ssh/sshd_config excerpt for teaching\nPort 22\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nPermitEmptyPasswords no\nMaxAuthTries 3\nLoginGraceTime 60\nAllowUsers bunsal deploy\nX11Forwarding no",
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "sshd -t",
              blocks: [
                {
                  type: "paragraph",
                  text: "**Syntax / option validation.** Reports configuration errors before you restart the service.",
                },
              ],
            },
            {
              title: "sshd -T",
              blocks: [
                {
                  type: "paragraph",
                  text: "**Effective configuration dump.** Shows the values sshd would apply after a valid parse — useful after changes.",
                },
              ],
            },
          ],
        },
        {
          type: "note",
          text: "Changing the SSH port alone does not stop determined scanners. Focus on authentication quality, least privilege, allowlists, and monitoring.",
        },
        {
          type: "terminal",
          preset: "security-ssh-hardening",
          suggestions: [
            { command: "cat /etc/ssh/sshd_config", label: "cat config" },
            { command: "sshd -T", label: "sshd -T" },
            { command: "sshd -t", label: "sshd -t" },
            {
              command: "grep PermitRootLogin /etc/ssh/sshd_config",
              label: "grep root",
            },
          ],
          suggestionsLabel: "Inspect sshd_config",
        },
      ],
    },
    {
      id: "authentication-methods",
      title: "Authentication Methods",
      blocks: [
        {
          type: "paragraph",
          text: "SSH commonly supports **password** and **public-key** authentication. Keys use a **public** half that can be shared (authorized_keys) and a **private** half that must stay secret. A **passphrase** protects the private key at rest; an **SSH agent** can hold unlocked keys for a session so you are not prompted repeatedly.",
        },
        {
          type: "list",
          items: [
            "Password authentication is easy to start and easy to guess or spray if weak",
            "Public-key authentication proves possession of the private key matching an authorized public key",
            "Authorized keys map a public key to account access on the server",
            "Multi-factor authentication (MFA) adds another proof beyond password or key — conceptual layering, not implemented in this lab",
            "Common mistakes: sharing private keys, skipping passphrases on high-value keys, disabling passwords before keys work, and authorizing keys too broadly",
          ],
        },
        {
          type: "callout",
          title: "No real credentials here",
          text: "This lesson never generates, requests, or displays real SSH private keys or passwords. Lab helpers only mark fictional key verification in memory.",
        },
        {
          type: "terminal",
          preset: "security-ssh-hardening",
          suggestions: [
            { command: "sshd -T", label: "effective auth" },
            { command: "ssh bunsal@host", label: "ssh bunsal" },
            { command: "ssh-verify-keys bunsal", label: "verify keys" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Try authentication policy",
        },
      ],
    },
    {
      id: "hardening-principles",
      title: "SSH Hardening Principles",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Disable direct **root** SSH login when individual admin accounts exist",
            "Use **individual user accounts** for accountability",
            "Restrict permitted users or groups with **AllowUsers** / **AllowGroups**",
            "Prefer **public-key** authentication where suitable — after verifying it works",
            "Keep **PermitEmptyPasswords no**",
            "Limit authentication attempts with a reasonable **MaxAuthTries**",
            "Review exposed SSH listeners (`ss`, firewall policy on real hosts)",
            "Monitor authentication failures without treating every failure as a breach",
            "Maintain **recovery access** and verify a new session before applying remote-access changes on production systems",
          ],
        },
        {
          type: "callout",
          title: "Recovery before lockdown",
          text: "Administrators should verify a new SSH configuration and preserve a working recovery session (console, out-of-band, or second SSH session) before applying restrictive changes to a real production server.",
        },
        {
          type: "terminal",
          preset: "security-ssh-hardening",
          suggestions: [
            { command: "ssh-set PermitRootLogin no", label: "no root login" },
            {
              command: "ssh-set AllowUsers bunsal deploy",
              label: "allow users",
            },
            { command: "ssh-set MaxAuthTries 3", label: "max tries" },
            { command: "sshd -T", label: "sshd -T" },
          ],
          suggestionsLabel: "Practice hardening helpers",
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      blocks: [
        {
          type: "definitions",
          items: [
            {
              term: "Configuration syntax errors",
              description:
                "Caught with `sshd -t`. Invalid options can prevent restart — fix and re-validate before relying on the service.",
            },
            {
              term: "Authentication failures",
              description:
                "Wrong method (password vs key), missing authorized key, or disabled PasswordAuthentication/PubkeyAuthentication.",
            },
            {
              term: "Key file permissions (concept)",
              description:
                "On real hosts, overly open private-key or authorized_keys permissions can cause SSH to refuse keys. This lab does not touch real key files.",
            },
            {
              term: "User or group restrictions",
              description:
                "AllowUsers/AllowGroups/Deny* can reject otherwise valid credentials — check policy before assuming a key is broken.",
            },
            {
              term: "SSH service status",
              description:
                "`systemctl status ssh` and successful restart after validation.",
            },
            {
              term: "Firewall and reachability",
              description:
                "Separate layer from sshd policy: packets must reach the listening port. Diagnose network/firewall independently from authentication.",
            },
          ],
        },
        {
          type: "terminal",
          preset: "security-ssh-hardening",
          suggestions: [
            { command: "sshd -t", label: "sshd -t" },
            { command: "systemctl status ssh", label: "status" },
            { command: "journalctl -u ssh", label: "logs" },
            { command: "ssh analyst@host", label: "test analyst" },
          ],
          suggestionsLabel: "Troubleshoot safely",
        },
      ],
    },
    {
      id: "knowledge-check-mid",
      title: "Quick Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Confirm SSH purpose, port myths, and private-key secrecy before the lab.",
        },
        {
          type: "exercise",
          id: "security-ssh-hardening-knowledge-check",
        },
      ],
    },
    {
      id: "interactive-lab",
      title: "Interactive SSH Hardening Lab",
      blocks: [
        {
          type: "paragraph",
          text: "Six scenarios on a fictional server: root login exposure, password authentication, excessive MaxAuthTries, unrestricted users, invalid configuration, and authentication log investigation. Validation checks the **simulated configuration and access behavior**, not only the command text.",
        },
        {
          type: "exercise",
          id: "security-ssh-hardening-assessment",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Five terminal exercises covering configuration inspection, root login, key-preferred authentication, attempt limits and allowlists, and validation before restart.",
        },
        {
          type: "exercise",
          id: "security-ssh-hardening-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Final Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "security-ssh-hardening-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to reason about SSH security hardening:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Explain SSH client vs server, authentication, encryption, and remote-access risk",
            "Interpret important sshd_config settings and their security implications",
            "Prefer verified public-key authentication and protect private keys",
            "Apply hardening principles: no direct root login when appropriate, allowlists, attempt limits, empty-password denial",
            "Validate with sshd -t, inspect effective values with sshd -T, and preserve recovery access",
            "Troubleshoot layered failures and interpret authentication logs carefully",
          ],
        },
        {
          type: "table",
          caption: "Command reference for this lesson’s simulator",
          headers: ["Command", "Purpose"],
          rows: [
            ["`systemctl status ssh`", "Service status"],
            ["`systemctl restart ssh`", "Restart if configuration validates"],
            ["`sshd -t`", "Validate fictional sshd_config"],
            ["`sshd -T`", "Show effective configuration values"],
            ["`cat /etc/ssh/sshd_config`", "View fictional config file"],
            ["`grep PATTERN /etc/ssh/sshd_config`", "Search the config"],
            ["`journalctl -u ssh`", "Review simulated auth logs"],
            ["`ss -tuln`", "Show listening sockets"],
            ["`ssh USER@host`", "Test simulated access decisions"],
            ["`ssh-set KEY VALUE`", "Lab helper to change a setting"],
            ["`ssh-fix-syntax`", "Lab helper to repair invalid config"],
            [
              "`ssh-verify-keys USER`",
              "Lab helper for fictional key verification",
            ],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next: [Firewall Hardening and Network Exposure](/learn/security/firewall-hardening) — reducing network exposure with deliberate firewall and service-facing decisions.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
