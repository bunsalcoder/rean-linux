import type { Lesson } from "@/types/lesson";

export const firewallBasicsLesson = {
  slug: "firewall-basics",
  level: "administration",
  levelNumber: "03",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "Firewall Basics",
  description:
    "Learn firewall concepts, inbound and outbound rules, UFW basics, and safe traffic filtering — entirely in a simulated terminal.",
  seoTitle: "Firewall Basics — Linux Administration | Rean Linux",
  seoDescription:
    "Practice Linux firewall basics with simulated UFW: status, allow/deny rules, default policies, listening services, and safe remote administration.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Administration", href: "/learn/administration" },
    { label: "Firewall Basics" },
  ],
  navigation: {
    previous: {
      label: "SSH and Remote Access",
      href: "/learn/administration/ssh-and-remote-access",
    },
    next: {
      label: "Scheduled Tasks",
      href: "/learn/administration/scheduled-tasks",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "After [SSH and Remote Access](/learn/administration/ssh-and-remote-access), you can reach remote hosts securely. This lesson explains how a **firewall** decides which traffic is allowed in or out — still entirely in a simulated terminal that never changes your real host firewall.",
    },
  ],
  sections: [
    {
      id: "what-is-a-firewall",
      title: "What a Firewall Is and Why Servers Use One",
      blocks: [
        {
          type: "paragraph",
          text: "A **firewall** filters network traffic according to rules. Linux servers use firewalls to reduce exposure: only the ports and protocols you intend to offer should be reachable from untrusted networks.",
        },
        {
          type: "list",
          items: [
            "Limits which inbound connections reach local services",
            "Can also control outbound connections from the host",
            "Works alongside routing, listening services, and application auth",
            "Supports a least-privilege posture: deny by default, allow what you need",
          ],
        },
        {
          type: "callout",
          title: "Learning safety",
          text: "Everything here is **simulated**. The app never runs real `ufw`, `nftables`, or `iptables`, never changes your host firewall, and never opens real network sockets.",
        },
      ],
    },
    {
      id: "inbound-vs-outbound",
      title: "Inbound Versus Outbound Traffic",
      blocks: [
        {
          type: "definitions",
          items: [
            {
              term: "Inbound (incoming)",
              description:
                "Connections coming **to** this host — for example a client reaching SSH on port 22 or HTTP on port 80.",
            },
            {
              term: "Outbound (outgoing)",
              description:
                "Connections this host initiates **to** elsewhere — package updates, DNS queries, API calls.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "Default policies are often stricter for inbound traffic than for outbound. That matches how many servers are operated: accept only known services, but allow the host to reach the network unless policy says otherwise.",
        },
        {
          type: "note",
          text: "Inbound and outbound policies are independent. Changing one does not automatically change the other.",
        },
      ],
    },
    {
      id: "ports-protocols-services",
      title: "Ports, Protocols, Addresses, and Services",
      blocks: [
        {
          type: "paragraph",
          text: "Firewall rules usually match on a combination of:",
        },
        {
          type: "table",
          caption: "Common firewall matching pieces",
          headers: ["Piece", "Example", "Role"],
          rows: [
            ["IP address", "`192.168.1.50`", "Which host is involved"],
            ["Port", "`22`, `80`, `443`", "Which service endpoint"],
            ["Protocol", "`tcp` / `udp`", "How the transport works"],
            ["Direction", "incoming / outgoing", "Which way traffic flows"],
            ["Action", "allow / deny", "What to do when matched"],
          ],
        },
        {
          type: "paragraph",
          text: "A **listening service** binds a port (visible with `ss -tuln`). A firewall rule decides whether remote clients may reach that port. You need both pieces for a successful connection.",
        },
        {
          type: "callout",
          title: "Important distinction",
          text: "A service listening on a port does **not** automatically mean external clients can reach it. Routing, firewall rules, and the service itself can all block or refuse traffic.",
        },
      ],
    },
    {
      id: "how-rules-work",
      title: "How Firewall Rules Allow or Block Traffic",
      blocks: [
        {
          type: "paragraph",
          text: "In this educational model (simplified UFW-style):",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "If the firewall is **disabled**, rules do not block traffic here",
            "If **enabled**, an explicit matching rule for port + protocol wins",
            "If no explicit rule matches, the **default policy** for that direction applies",
            "TCP and UDP are evaluated separately",
          ],
        },
        {
          type: "note",
          text: "Real firewalls (iptables/nftables chains, zones, connection tracking) can be more complex than this lesson’s model. Treat the simulator as a clear beginner map, not a full kernel firewall clone.",
        },
      ],
    },
    {
      id: "default-policies",
      title: "Default Policies and Least Privilege",
      blocks: [
        {
          type: "paragraph",
          text: "**Least privilege** for a host firewall usually means: default deny inbound, then explicitly allow only required services (SSH, HTTP, HTTPS, and so on).",
        },
        {
          type: "code",
          code: "sudo ufw default deny incoming\nsudo ufw default allow outgoing\nsudo ufw status verbose",
          title: "Set and inspect default policies (simulated)",
        },
        {
          type: "terminal",
          preset: "firewall-basics",
          suggestions: [
            {
              command: "sudo ufw status verbose",
              label: "status verbose",
            },
            {
              command: "sudo ufw default deny incoming",
              label: "default deny incoming",
            },
            {
              command: "sudo ufw default allow outgoing",
              label: "default allow outgoing",
            },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect defaults",
        },
        {
          type: "callout",
          title: "Common mistake",
          text: "Enabling a deny-incoming default **before** allowing SSH on a remote server can lock you out. Always confirm an allow rule for `22/tcp` first.",
        },
      ],
    },
    {
      id: "tcp-and-udp",
      title: "TCP and UDP Rules",
      blocks: [
        {
          type: "paragraph",
          text: "Rules are protocol-specific. Allowing `53/tcp` does **not** allow `53/udp`. DNS, VPN, and game servers often need the correct protocol called out explicitly.",
        },
        {
          type: "code",
          code: "sudo ufw allow 80/tcp\nsudo ufw deny 8080/tcp\ncheck-connect 80/tcp",
          title: "Allow HTTP TCP and test (simulated)",
        },
        {
          type: "terminal",
          preset: "firewall-basics",
          suggestions: [
            { command: "sudo ufw status", label: "ufw status" },
            { command: "check-connect 80/tcp", label: "check 80/tcp" },
            { command: "check-connect 53/udp", label: "check 53/udp" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Compare TCP checks",
        },
      ],
    },
    {
      id: "listeners-and-rules",
      title: "Listening Services and Firewall Rules",
      blocks: [
        {
          type: "paragraph",
          text: "Use `ss -tuln` to see what is listening, and UFW status to see what is allowed. Connection outcomes in this simulator:",
        },
        {
          type: "table",
          caption: "Simulated connection outcomes",
          headers: ["Firewall", "Listener", "Typical result"],
          rows: [
            ["Allows port", "Service listening", "Connection succeeds"],
            [
              "Denies / default deny",
              "Service listening",
              "Connection blocked",
            ],
            ["Allows port", "Nothing listening", "Connection refused"],
            ["Disabled", "Service listening", "Succeeds (no filter)"],
          ],
        },
        {
          type: "terminal",
          preset: "firewall-basics",
          suggestions: [
            { command: "ss -tuln", label: "ss -tuln" },
            { command: "sudo ufw status", label: "ufw status" },
            { command: "check-connect 80/tcp", label: "check 80/tcp" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Compare listeners and rules",
        },
        {
          type: "note",
          text: "`check-connect` is an educational helper in this lesson. It reports success or failure without revealing the full root cause — you still investigate with `ss` and `ufw status`.",
        },
      ],
    },
    {
      id: "ufw-basics",
      title: "UFW Basics — A Beginner-Friendly Interface",
      blocks: [
        {
          type: "paragraph",
          text: "**UFW** (Uncomplicated Firewall) is a simpler front end many Ubuntu/Debian systems use over lower-level firewall tooling. Common commands in this lab:",
        },
        {
          type: "table",
          caption: "Core UFW commands in the simulator",
          headers: ["Command", "Purpose"],
          rows: [
            ["`sudo ufw status`", "Show active/inactive and rules"],
            ["`sudo ufw status verbose`", "Include default policies"],
            ["`sudo ufw enable` / `disable`", "Turn filtering on or off"],
            ["`sudo ufw allow 22/tcp`", "Allow inbound SSH"],
            ["`sudo ufw allow 80/tcp`", "Allow inbound HTTP"],
            ["`sudo ufw allow 443/tcp`", "Allow inbound HTTPS"],
            ["`sudo ufw deny 8080/tcp`", "Deny inbound TCP 8080"],
            ["`sudo ufw delete allow 80/tcp`", "Remove an allow rule"],
            ["`sudo ufw default deny incoming`", "Set inbound default"],
            ["`sudo ufw default allow outgoing`", "Set outbound default"],
          ],
        },
        {
          type: "terminal",
          preset: "firewall-basics",
          suggestions: [
            { command: "sudo ufw status", label: "status" },
            { command: "sudo ufw allow 80/tcp", label: "allow 80/tcp" },
            { command: "sudo ufw deny 8080/tcp", label: "deny 8080/tcp" },
            { command: "sudo ufw enable", label: "enable" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Try UFW commands",
        },
        {
          type: "callout",
          title: "Expected output shape",
          text: "Active status lists rules in a `To / Action / From` table. Inactive status prints `Status: inactive`. Enabling prints that the firewall is active — plus an educational SSH lockout warning when SSH is not clearly allowed.",
        },
      ],
    },
    {
      id: "nftables-intro",
      title: "nftables Versus a Simplified UFW Workflow",
      blocks: [
        {
          type: "paragraph",
          text: "**nftables** is a modern Linux packet-filtering framework (tables, chains, and rules expressed more directly). UFW is a higher-level tool that can manage firewall policy with simpler commands.",
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "UFW-style workflow",
              blocks: [
                {
                  type: "list",
                  items: [
                    "Friendly verbs: allow, deny, enable",
                    "Good starting point for common server ports",
                    "Hides much of the underlying rule machinery",
                  ],
                },
              ],
            },
            {
              title: "nftables concepts",
              blocks: [
                {
                  type: "list",
                  items: [
                    "Explicit tables and chains",
                    "Fine-grained match and verdict control",
                    "Closer to how the kernel evaluates packets",
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "note",
          text: "This lesson does not simulate `nft` commands. Learn the concepts with UFW first; later administration work may require reading or writing nftables (or distribution-specific wrappers) directly.",
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Common Firewall Troubleshooting Scenarios",
      blocks: [
        {
          type: "paragraph",
          text: "When connectivity fails, gather evidence before changing rules:",
        },
        {
          type: "table",
          caption: "Failure patterns",
          headers: ["Symptom", "Likely layer", "Next check"],
          rows: [
            ["Firewall inactive but service down", "Service", "`ss -tuln`"],
            [
              "Service listens; default deny; no allow",
              "Firewall",
              "`sudo ufw status verbose`",
            ],
            [
              "Allow rule present; no listener",
              "Service",
              "`ss -tuln`, start the service",
            ],
            [
              "TCP allowed; UDP fails",
              "Protocol mismatch",
              "Compare `/tcp` vs `/udp` rules",
            ],
            [
              "Works locally, fails remotely",
              "Path / firewall / routing",
              "Rules, routes, upstream filters",
            ],
          ],
        },
        {
          type: "terminal",
          preset: "firewall-basics",
          suggestions: [
            { command: "sudo ufw status verbose", label: "status verbose" },
            { command: "ss -tuln", label: "ss -tuln" },
            { command: "check-connect 80/tcp", label: "check 80/tcp" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Diagnose with evidence",
        },
      ],
    },
    {
      id: "safe-practices",
      title: "Safe Firewall Practices (Avoid Lockouts)",
      blocks: [
        {
          type: "paragraph",
          text: "Use this reusable troubleshooting checklist:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Confirm the destination IP and port",
            "Check whether the expected service is listening",
            "Inspect firewall status and applicable rules",
            "Verify inbound and outbound policies",
            "Consider routing and other network controls",
            "Make the smallest appropriate change",
            "Re-test connectivity and verify SSH access remains available",
          ],
        },
        {
          type: "callout",
          title: "Remote lockout risk",
          text: "Before `ufw enable` or `default deny incoming` on a remote host, ensure `22/tcp` (or your real SSH port) is allowed. Prefer console/recovery access when experimenting on production systems. This simulator only **warns** — it does not prevent practice.",
        },
        {
          type: "list",
          items: [
            "Prefer explicit allow rules for required services only",
            "Do not delete SSH allow rules casually on remote machines",
            "Re-test after each small change",
            "Document temporary opens (for example port 8080) and remove them later",
          ],
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Work through seven scenarios: inspect enablement, diagnose blocked HTTP, allow port 80, keep SSH while opening HTTP, separate firewall blocks from missing listeners, compare default policies, and distinguish TCP from UDP rules.",
        },
        {
          type: "exercise",
          id: "firewall-basics-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "firewall-basics-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to reason about host firewalls safely:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Explain why Linux servers use firewalls",
            "Distinguish inbound and outbound traffic",
            "Relate ports, protocols, and listening services",
            "Apply default policies and least privilege",
            "Use basic UFW allow/deny/status/enable commands",
            "Contrast a simplified UFW workflow with nftables concepts",
            "Troubleshoot blocked vs refused connections",
            "Avoid remote SSH lockouts when changing rules",
          ],
        },
        {
          type: "table",
          caption: "Command reference for firewall basics",
          headers: ["Command", "Purpose"],
          rows: [
            ["`sudo ufw status`", "Show status and rules"],
            ["`sudo ufw status verbose`", "Include default policies"],
            ["`sudo ufw enable`", "Enable the firewall"],
            ["`sudo ufw disable`", "Disable the firewall"],
            ["`sudo ufw allow 22/tcp`", "Allow SSH"],
            ["`sudo ufw allow 80/tcp`", "Allow HTTP"],
            ["`sudo ufw allow 443/tcp`", "Allow HTTPS"],
            ["`sudo ufw deny 8080/tcp`", "Deny TCP 8080"],
            ["`sudo ufw delete allow 80/tcp`", "Remove an allow rule"],
            ["`sudo ufw default deny incoming`", "Deny unmatched inbound"],
            ["`sudo ufw default allow outgoing`", "Allow unmatched outbound"],
            ["`ss -tuln`", "List listening sockets"],
            ["`check-connect 80/tcp`", "Test simulated connectivity"],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next you will study scheduled tasks — cron jobs and systemd timers for recurring administration work. That lesson is not published yet.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
