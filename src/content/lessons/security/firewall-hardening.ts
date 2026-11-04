import type { Lesson } from "@/types/lesson";

export const securityFirewallHardeningLesson = {
  slug: "firewall-hardening",
  level: "security",
  levelNumber: "04",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "Firewall Hardening and Network Exposure",
  description:
    "Assess network exposure, design restrictive firewall policies, manage inbound and outbound rules, and verify that only necessary services are reachable.",
  seoTitle:
    "Firewall Hardening and Network Exposure — Linux Security | Rean Linux",
  seoDescription:
    "Learn firewall hardening: network exposure, default-deny policies, UFW rules, TCP/UDP matching, source restrictions, and least-privilege reachability in a simulated lab.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Security and Hardening", href: "/learn/security" },
    { label: "Firewall Hardening and Network Exposure" },
  ],
  navigation: {
    previous: {
      label: "SSH Security Hardening",
      href: "/learn/security/ssh-hardening",
    },
    next: {
      label: "Security Updates and Vulnerability Management",
      href: "/learn/security/security-updates",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "A listening service is not the same as a **publicly reachable** service. This lesson builds on Stage 03 firewall basics and Stage 04 SSH hardening to **reduce network exposure**: inspect listeners, design default-deny policies, manage UFW rules with least privilege, and verify reachability in a safe simulation.",
    },
    {
      type: "callout",
      title: "Learning safety",
      text: "Everything here is **simulated**. The app never runs real `ufw`/`iptables`/`nftables`, never modifies host firewall or network interfaces, never scans real networks, and never opens real sockets. All addresses, services, rules, and `check-connect` results are **fictional teaching data**.",
    },
  ],
  sections: [
    {
      id: "understanding-network-exposure",
      title: "Understanding Network Exposure",
      blocks: [
        {
          type: "paragraph",
          text: "**Network exposure** is the set of services that can accept connections from a given network path — localhost, an internal LAN, or the public internet. Hardening starts by knowing what listens and who can reach it.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Open port",
              description:
                "A transport port (TCP or UDP) where something accepts packets. Openness alone does not prove a vulnerability — but every open port is part of the attack surface.",
            },
            {
              term: "Vulnerable service",
              description:
                "Software with a weakness (misconfiguration, weak auth, known CVE). An open port can host a hardened or a vulnerable service; firewalls do not patch applications.",
            },
            {
              term: "Listening service",
              description:
                "A process bound to an address and port (visible with tools like `ss -tuln`). Listening means the OS has a socket ready — not that remote clients can reach it.",
            },
            {
              term: "Externally reachable",
              description:
                "Traffic from outside the host (or outside a trust boundary) can complete a connection after routing and firewall policy. Localhost listeners are often not externally reachable.",
            },
          ],
        },
        {
          type: "list",
          items: [
            "**Localhost (127.0.0.1 / ::1)** — typically only processes on the same host",
            "**Internal networks** — trusted LANs or VPC subnets with limited sources",
            "**Public networks** — internet or untrusted paths; assume hostile scanning",
            "**TCP vs UDP** — separate protocols; allowing TCP 53 does not allow UDP 53",
            "Unnecessary listeners increase attack surface even before exploits exist",
            "Firewall rules are **one layer** — pair them with service hardening, auth, and updates",
          ],
        },
        {
          type: "callout",
          title: "Listening ≠ publicly reachable",
          text: "A database may listen on `0.0.0.0:5432` while a default-deny firewall (or cloud security group) still blocks the public internet. Always evaluate **listening state** and **policy** separately.",
        },
        {
          type: "terminal",
          preset: "security-firewall-hardening",
          suggestions: [
            { command: "ss -tuln", label: "ss -tuln" },
            { command: "ip addr", label: "ip addr" },
            { command: "ip route", label: "ip route" },
            { command: "sudo ufw status verbose", label: "ufw status" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect exposure",
        },
      ],
    },
    {
      id: "firewall-policy-design",
      title: "Firewall Policy Design",
      blocks: [
        {
          type: "paragraph",
          text: "A **restrictive** firewall starts from **least privilege**: deny what is not explicitly needed, allow only justified operational traffic, and keep administrators from locking themselves out.",
        },
        {
          type: "table",
          caption: "Policy ideas (educational overview)",
          headers: ["Concept", "Meaning", "Hardening notes"],
          rows: [
            [
              "Default-deny inbound",
              "Unmatched inbound traffic is denied",
              "Preferred for internet-facing hosts; allow only required ports",
            ],
            [
              "Default-allow outbound",
              "Unmatched outbound traffic is allowed",
              "Common operational default; some environments tighten egress later",
            ],
            [
              "Default-deny outbound",
              "Unmatched outbound traffic is denied",
              "Stronger control; requires allowing updates, DNS, and app egress",
            ],
            [
              "Allow / deny rules",
              "Explicit matches override the default",
              "Prefer narrow sources and correct protocols",
            ],
            [
              "Rule ordering",
              "First matching rule can decide the outcome",
              "This lab uses first matching port/protocol/source; keep rules intentional",
            ],
            [
              "Stateful filtering",
              "Established/related replies can be accepted",
              "UFW/nftables models often track connection state so return traffic works",
            ],
            [
              "Loopback",
              "Traffic on lo (localhost)",
              "Usually allowed so local services can talk to each other",
            ],
          ],
        },
        {
          type: "list",
          items: [
            "**Inbound** filtering protects services you host; **outbound** filtering limits what the host can initiate",
            "**Established/related** connections typically need to continue after an allowed handshake",
            "Restrictive policy must still preserve **legitimate** ops traffic: SSH admin, HTTPS, package updates as required",
            "Least privilege means preferring `from 192.168.1.0/24` over `Anywhere` when only internal clients need a port",
          ],
        },
        {
          type: "note",
          text: "This simulator models educational defaults and explicit allow/deny rules. It is not a complete Linux netfilter implementation.",
        },
        {
          type: "terminal",
          preset: "security-firewall-hardening",
          suggestions: [
            { command: "sudo ufw status verbose", label: "status verbose" },
            {
              command: "sudo ufw default deny incoming",
              label: "deny incoming",
            },
            {
              command: "sudo ufw default allow outgoing",
              label: "allow outgoing",
            },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect defaults",
        },
      ],
    },
    {
      id: "ufw-rule-management",
      title: "UFW Rule Management",
      blocks: [
        {
          type: "paragraph",
          text: "**UFW** (Uncomplicated Firewall) is a front end many Ubuntu-style systems use to manage host filtering. In this lab you practice the commands that matter for hardening — without touching a real host firewall.",
        },
        {
          type: "table",
          caption: "UFW commands used in this lesson’s simulator",
          headers: ["Command", "Purpose"],
          rows: [
            ["`ufw status`", "Show active/inactive and listed rules"],
            [
              "`ufw status verbose`",
              "Include default incoming/outgoing policies",
            ],
            [
              "`ufw default deny incoming`",
              "Set default-deny for unmatched inbound",
            ],
            [
              "`ufw default allow outgoing`",
              "Keep unmatched outbound permitted",
            ],
            ["`ufw allow` / `ufw deny`", "Add explicit inbound rules"],
            ["`ufw delete`", "Remove a matching allow/deny rule"],
            ["`ufw enable` / `ufw disable`", "Turn filtering on or off"],
            ["`ufw reload`", "Reload active policy (simulated)"],
            ["`ufw reset`", "Clear rules and disable (destructive lab helper)"],
          ],
        },
        {
          type: "code",
          title:
            "Educational examples (fictional host — never run against production from this app)",
          language: "bash",
          code: `# Preserve admin access first\nsudo ufw allow 22/tcp\n\n# Public web\nsudo ufw allow 80/tcp\nsudo ufw allow 443/tcp\n\n# Application only from internal LAN\nsudo ufw allow from 192.168.1.0/24 to any port 8080 proto tcp\n\n# Database must not be public\nsudo ufw delete allow 5432/tcp\nsudo ufw allow from 192.168.1.0/24 to any port 5432 proto tcp\n\n# Protocol-specific UDP discovery\nsudo ufw allow 5353/udp\n\nsudo ufw default deny incoming\nsudo ufw default allow outgoing\nsudo ufw enable`,
        },
        {
          type: "list",
          items: [
            "Always preserve **SSH (22/tcp)** before enabling a restrictive inbound policy on a remote host",
            "HTTP **80/tcp** and HTTPS **443/tcp** are common public allowances for web fronts",
            "Application (**8080/tcp**) and database (**5432/tcp**) ports often belong on **internal** sources only",
            "Protocol mismatches (TCP rule for a UDP service) leave the real traffic denied under default-deny",
            "`sudo` is required in this simulator — bare `ufw` reports permission denied",
          ],
        },
        {
          type: "callout",
          title: "Administrative access first",
          text: "Enabling default-deny inbound without an SSH allow rule is a classic lockout. In the lab you will see educational warnings; on real systems keep a recovery console or second session.",
        },
        {
          type: "terminal",
          preset: "security-firewall-hardening",
          suggestions: [
            { command: "sudo ufw allow 22/tcp", label: "allow SSH" },
            { command: "sudo ufw allow 443/tcp", label: "allow HTTPS" },
            {
              command:
                "sudo ufw allow from 192.168.1.0/24 to any port 5432 proto tcp",
              label: "allow DB internal",
            },
            { command: "sudo ufw status verbose", label: "status verbose" },
          ],
          suggestionsLabel: "Practice UFW rules",
        },
      ],
    },
    {
      id: "network-exposure-assessment",
      title: "Network Exposure Assessment",
      blocks: [
        {
          type: "paragraph",
          text: "Assessment compares **what listens**, **what policy allows**, and **who needs access**. The goal is a short, evidence-based hardening picture — not a real network scan.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Identify listening ports with `ss -tuln`",
            "Map ports to simulated services (`systemctl status`, process names in `ss`)",
            "Compare listeners against `ufw status verbose`",
            "Distinguish local listening from remote reachability (`check-connect` helper)",
            "Flag unnecessary public exposure (databases, admin UIs, debug ports)",
            "Recommend closing or source-restricting access that is not required",
          ],
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "Listening",
              blocks: [
                {
                  type: "paragraph",
                  text: "Socket exists on an address/port. Shown by `ss`. Necessary for a service to accept connections **on the host**.",
                },
              ],
            },
            {
              title: "Reachable",
              blocks: [
                {
                  type: "paragraph",
                  text: "A remote source can complete a connection after firewall evaluation. Requires listening **and** an allow path (or disabled firewall).",
                },
              ],
            },
          ],
        },
        {
          type: "note",
          text: "`check-connect` in this terminal is a **lesson-specific simulation helper**, not a standard Linux command. It never probes real hosts.",
        },
        {
          type: "terminal",
          preset: "security-firewall-hardening",
          suggestions: [
            { command: "ss -tuln", label: "ss -tuln" },
            { command: "sudo ufw status verbose", label: "ufw status" },
            {
              command: "check-connect 5432/tcp from 203.0.113.10",
              label: "DB from public",
            },
            {
              command: "check-connect 5432/tcp from 192.168.1.50",
              label: "DB from LAN",
            },
          ],
          suggestionsLabel: "Assess reachability",
        },
      ],
    },
    {
      id: "common-hardening-mistakes",
      title: "Common Hardening Mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Enabling a restrictive firewall **before** allowing required SSH access",
            "Exposing databases (**5432/tcp** and similar) directly to public networks",
            "Allowing all traffic from any source when a narrow CIDR would suffice",
            "Confusing **TCP** and **UDP** rules for the same numeric port",
            "Forgetting outbound requirements (updates, DNS, APIs) when tightening egress",
            "Treating firewall configuration as a **replacement** for service security",
            "Disabling a firewall without understanding who can then reach every listener",
          ],
        },
        {
          type: "callout",
          title: "Defense in depth",
          text: "Firewalls reduce exposure. They do not authenticate users, patch CVEs, or replace SSH hardening. Combine layers.",
        },
      ],
    },
    {
      id: "knowledge-check-mid",
      title: "Quick Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Confirm exposure concepts, default-deny thinking, and TCP/UDP separation before the lab.",
        },
        {
          type: "exercise",
          id: "security-firewall-hardening-knowledge-check",
        },
      ],
    },
    {
      id: "interactive-lab",
      title: "Interactive Firewall Hardening Lab",
      blocks: [
        {
          type: "paragraph",
          text: "Six scenarios on a fictional server (`eth0` / `192.168.1.20`): restrictive defaults, SSH-before-enable, database exposure, application port scope, TCP/UDP mismatch, and an exposure audit. Validation checks the **simulated firewall state and reachability**, not only the command text.",
        },
        {
          type: "exercise",
          id: "security-firewall-hardening-assessment",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Six terminal exercises covering inspection, default policy, SSH preservation, database and application restrictions, and protocol-correct UDP rules.",
        },
        {
          type: "exercise",
          id: "security-firewall-hardening-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Final Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "security-firewall-hardening-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to reason about firewall hardening and network exposure:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Explain listening versus externally reachable services across localhost, internal, and public paths",
            "Design default-deny inbound policies while preserving legitimate operational traffic",
            "Manage UFW allow/deny/default/enable flows with protocol and source awareness",
            "Assess exposure by comparing `ss` listeners with firewall rules and simulated reachability",
            "Avoid common mistakes: SSH lockout, public databases, TCP/UDP confusion, and firewall-only thinking",
          ],
        },
        {
          type: "table",
          caption: "Command reference for this lesson’s simulator",
          headers: ["Command", "Purpose"],
          rows: [
            ["`sudo ufw status[ verbose]`", "Inspect rules and defaults"],
            ["`sudo ufw allow|deny …`", "Add inbound rules"],
            ["`sudo ufw delete …`", "Remove a matching rule"],
            ["`sudo ufw default …`", "Set incoming/outgoing defaults"],
            ["`sudo ufw enable|disable|reload|reset`", "Lifecycle controls"],
            ["`ss -tuln`", "List listening sockets"],
            ["`ip addr` / `ip route`", "Show fictional address and gateway"],
            ["`systemctl status <unit>`", "Inspect fictional service units"],
            ["`check-connect …`", "Lesson-specific reachability helper"],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next: Security Updates and Vulnerability Management — why patching and remediation reduce risk after you shrink exposure (coming soon).",
        },
      ],
    },
  ],
} as const satisfies Lesson;
