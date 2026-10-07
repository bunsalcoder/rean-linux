import type { Lesson } from "@/types/lesson";

export const networkingFundamentalsLesson = {
  slug: "networking-fundamentals",
  level: "administration",
  levelNumber: "03",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "Networking Fundamentals",
  description:
    "Understand network interfaces, IP addresses, gateways, DNS, and ports — and practice inspecting them with simulated ip, ss, and getent.",
  seoTitle: "Networking Fundamentals — Linux Administration | Rean Linux",
  seoDescription:
    "Learn Linux networking fundamentals: interfaces, IP addresses, subnets, gateways, DNS, ports, and how to inspect them with ip, ss, and getent in a safe simulator.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Administration", href: "/learn/administration" },
    { label: "Networking Fundamentals" },
  ],
  navigation: {
    previous: {
      label: "Disk Usage and Mounts",
      href: "/learn/administration/disk-usage-and-mounts",
    },
    next: {
      label: "Network Troubleshooting",
      href: "/learn/administration/network-troubleshooting",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "After storage inspection in [Disk Usage and Mounts](/learn/administration/disk-usage-and-mounts), administrators often need to understand how a machine connects to a network. This lesson builds that mental model: interfaces, addresses, routes, DNS, and ports — using a completely simulated terminal.",
    },
  ],
  sections: [
    {
      id: "what-is-a-network",
      title: "What Is a Network?",
      blocks: [
        {
          type: "paragraph",
          text: "A network allows devices to communicate with each other. Your Linux computer joins that conversation through a **network interface**.",
        },
        {
          type: "tree-diagram",
          ariaLabel:
            "Linux computer connects through a network interface to a network with a router, DNS server, and other devices",
          root: {
            label: "Linux Computer",
            children: [
              {
                label: "Network Interface",
                children: [
                  {
                    label: "Network",
                    children: [
                      { label: "Router" },
                      { label: "DNS Server" },
                      { label: "Other Devices" },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          type: "paragraph",
          text: "Linux networking involves multiple layers of information. Keep this stack in mind as you work through the lesson:",
        },
        {
          type: "stack-diagram",
          ariaLabel:
            "Networking layers from interface down to applications and ports",
          layers: [
            "Interface",
            "IP Address",
            "Route / Gateway",
            "DNS",
            "Applications / Ports",
          ],
        },
      ],
    },
    {
      id: "network-interfaces",
      title: "Network Interfaces",
      blocks: [
        {
          type: "paragraph",
          text: "A **network interface** represents a connection to a network. Interface names vary between systems. Common examples include:",
        },
        {
          type: "code",
          code: "eth0\nens33\nenp0s3\nwlan0",
          language: "text",
          title: "example interface names",
        },
        {
          type: "paragraph",
          text: "Modern Linux systems commonly use predictable names such as `ens33` or `enp0s3`. This lesson’s simulator uses `eth0` for clarity — that does **not** mean every real system uses that name.",
        },
        {
          type: "note",
          text: "Do not assume a fixed interface name. Always inspect the system you are working on.",
        },
      ],
    },
    {
      id: "inspecting-with-ip-link",
      title: "Inspecting Interfaces with ip link",
      blocks: [
        {
          type: "paragraph",
          text: "Start by listing interfaces and their state:",
        },
        {
          type: "code",
          code: "ip link",
          language: "bash",
          title: "command",
        },
        {
          type: "code",
          code: "1: lo: <LOOPBACK,UP,LOWER_UP>\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP>",
          language: "text",
          title: "example output",
        },
        {
          type: "definitions",
          items: [
            {
              term: "lo",
              description: "The loopback interface (the local machine itself)",
            },
            {
              term: "eth0",
              description: "A simulated Ethernet interface in this lesson",
            },
            {
              term: "UP",
              description: "Indicates the interface is enabled",
            },
          ],
        },
        {
          type: "terminal",
          preset: "networking-fundamentals",
          suggestions: [
            { command: "ip link", label: "ip link" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Try ip link",
        },
      ],
    },
    {
      id: "ip-addresses",
      title: "IP Addresses",
      blocks: [
        {
          type: "paragraph",
          text: "An IP address identifies a host or interface on a network. Inspect addresses with:",
        },
        {
          type: "code",
          code: "ip addr",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "`ip address` is the same command.",
        },
        {
          type: "code",
          code: "2: eth0:\n    inet 192.168.1.20/24",
          language: "text",
          title: "example output",
        },
        {
          type: "definitions",
          items: [
            {
              term: "192.168.1.20",
              description: "The IPv4 address assigned to the interface",
            },
            {
              term: "/24",
              description:
                "The network prefix (how large the local network is considered to be)",
            },
          ],
        },
        {
          type: "callout",
          title: "Keep subnetting simple",
          text: "For now, treat `/24` as “this host belongs to the `192.168.1.0` network.” Detailed subnet math comes later.",
        },
        {
          type: "terminal",
          preset: "networking-fundamentals",
          suggestions: [
            { command: "ip addr", label: "ip addr" },
            { command: "ip address", label: "ip address" },
          ],
          suggestionsLabel: "Try ip addr",
        },
      ],
    },
    {
      id: "ipv4-vs-ipv6",
      title: "IPv4 vs IPv6",
      blocks: [
        {
          type: "paragraph",
          text: "Linux commonly supports both address families at once:",
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "IPv4",
              blocks: [
                {
                  type: "code",
                  code: "192.168.1.20",
                  language: "text",
                },
                {
                  type: "paragraph",
                  text: "32-bit addresses. Still widely used on local networks.",
                },
              ],
            },
            {
              title: "IPv6",
              blocks: [
                {
                  type: "code",
                  code: "2001:db8::20",
                  language: "text",
                },
                {
                  type: "paragraph",
                  text: "128-bit addresses. Much larger address space.",
                },
              ],
            },
          ],
        },
        {
          type: "note",
          text: "This lesson stays at a basic level. You do not need deep IPv6 knowledge yet — just recognize that both can appear in `ip addr` output.",
        },
      ],
    },
    {
      id: "loopback",
      title: "Loopback",
      blocks: [
        {
          type: "paragraph",
          text: "Loopback refers to the local machine itself. Common addresses:",
        },
        {
          type: "list",
          items: ["`127.0.0.1` — IPv4 loopback", "`::1` — IPv6 loopback"],
        },
        {
          type: "paragraph",
          text: "A quick simulated check:",
        },
        {
          type: "code",
          code: "ping 127.0.0.1",
          language: "bash",
          title: "command",
        },
        {
          type: "callout",
          title: "Simulation only",
          text: "This learning terminal never sends real ICMP packets. `ping` returns deterministic educational output only.",
        },
        {
          type: "terminal",
          preset: "networking-fundamentals",
          suggestions: [
            { command: "ping 127.0.0.1", label: "ping loopback" },
            { command: "ip addr", label: "ip addr" },
          ],
          suggestionsLabel: "Try loopback",
        },
      ],
    },
    {
      id: "mac-addresses",
      title: "MAC Addresses",
      blocks: [
        {
          type: "paragraph",
          text: "Network interfaces commonly have a **MAC address** — an interface-level identifier used on the local link.",
        },
        {
          type: "code",
          code: "02:42:ac:11:00:02",
          language: "text",
          title: "example MAC",
        },
        {
          type: "code",
          code: "MAC address → interface-level hardware/network identifier\nIP address  → logical network address",
          language: "text",
          title: "difference",
        },
        {
          type: "note",
          text: "MAC addresses are often associated with hardware, but virtualization and configuration can change them. Do not assume a MAC is permanently fixed to physical hardware.",
        },
      ],
    },
    {
      id: "subnets-and-prefixes",
      title: "Subnets and Prefixes",
      blocks: [
        {
          type: "paragraph",
          text: "Addresses are often written with a prefix:",
        },
        {
          type: "code",
          code: "192.168.1.20/24",
          language: "text",
          title: "address with prefix",
        },
        {
          type: "list",
          items: [
            "`192.168.1.20` → host address",
            "`/24` → network prefix length",
          ],
        },
        {
          type: "paragraph",
          text: "At a high level, devices in the same subnet can often communicate directly without routing through another network. Detailed subnet calculations are out of scope for this lesson.",
        },
      ],
    },
    {
      id: "default-gateway",
      title: "Default Gateway",
      blocks: [
        {
          type: "paragraph",
          text: "The **default gateway** is normally the router used when traffic needs to reach another network (including the internet).",
        },
        {
          type: "tree-diagram",
          ariaLabel:
            "Linux machine at 192.168.1.20 reaches other networks through gateway 192.168.1.1",
          root: {
            label: "Linux machine 192.168.1.20",
            children: [
              {
                label: "Gateway 192.168.1.1",
                children: [{ label: "Other networks / Internet" }],
              },
            ],
          },
        },
        {
          type: "paragraph",
          text: "Inspect routes with:",
        },
        {
          type: "code",
          code: "ip route",
          language: "bash",
          title: "command",
        },
        {
          type: "code",
          code: "default via 192.168.1.1 dev eth0\n192.168.1.0/24 dev eth0",
          language: "text",
          title: "example output",
        },
        {
          type: "definitions",
          items: [
            {
              term: "default via",
              description:
                "Where to send traffic that is not destined for a known local network",
            },
            {
              term: "192.168.1.0/24 dev eth0",
              description:
                "Traffic for the local subnet goes directly out eth0",
            },
          ],
        },
        {
          type: "terminal",
          preset: "networking-fundamentals",
          suggestions: [
            { command: "ip route", label: "ip route" },
            { command: "ping 192.168.1.1", label: "ping gateway" },
          ],
          suggestionsLabel: "Try ip route",
        },
      ],
    },
    {
      id: "dns",
      title: "DNS",
      blocks: [
        {
          type: "paragraph",
          text: "**DNS** (Domain Name System) translates names into IP addresses so applications do not require users to remember raw addresses.",
        },
        {
          type: "code",
          code: "example.com\n     ↓\n93.184.216.34",
          language: "text",
          title: "name resolution",
        },
        {
          type: "paragraph",
          text: "On some systems you may see `resolvectl status` for resolver details. In this lesson, the main simulated command is:",
        },
        {
          type: "code",
          code: "getent hosts example.com",
          language: "bash",
          title: "command",
        },
        {
          type: "callout",
          title: "No real DNS",
          text: "The simulator returns deterministic educational data. It never performs a real DNS lookup or network request.",
        },
        {
          type: "terminal",
          preset: "networking-fundamentals",
          suggestions: [
            {
              command: "getent hosts example.com",
              label: "getent hosts",
            },
          ],
          suggestionsLabel: "Try DNS lookup",
        },
      ],
    },
    {
      id: "ports",
      title: "Ports",
      blocks: [
        {
          type: "paragraph",
          text: "An IP address identifies a host or interface. A **port** identifies a network service or application endpoint on that host.",
        },
        {
          type: "code",
          code: "192.168.1.20:22",
          language: "text",
          title: "host and port",
        },
        {
          type: "list",
          items: ["IP address → `192.168.1.20`", "Port → `22`"],
        },
        {
          type: "table",
          caption: "Common default ports (educational examples)",
          headers: ["Port", "Common service"],
          rows: [
            ["`22`", "SSH"],
            ["`80`", "HTTP"],
            ["`443`", "HTTPS"],
            ["`53`", "DNS"],
          ],
        },
        {
          type: "note",
          text: "These are common defaults, not guarantees. Administrators can configure services on different ports.",
        },
      ],
    },
    {
      id: "inspecting-listening-ports",
      title: "Inspecting Listening Ports",
      blocks: [
        {
          type: "paragraph",
          text: "To see which TCP and UDP sockets are listening:",
        },
        {
          type: "code",
          code: "ss -tuln",
          language: "bash",
          title: "command",
        },
        {
          type: "definitions",
          items: [
            { term: "t", description: "TCP" },
            { term: "u", description: "UDP" },
            { term: "l", description: "Listening sockets" },
            { term: "n", description: "Do not resolve names (numeric output)" },
          ],
        },
        {
          type: "code",
          code: "Netid State  Local Address:Port\ntcp   LISTEN 0.0.0.0:22\ntcp   LISTEN 0.0.0.0:80",
          language: "text",
          title: "example output",
        },
        {
          type: "paragraph",
          text: "This helps administrators understand which network services are accepting connections.",
        },
        {
          type: "terminal",
          preset: "networking-fundamentals",
          suggestions: [
            { command: "ss -tuln", label: "ss -tuln" },
            { command: "ip addr", label: "ip addr" },
          ],
          suggestionsLabel: "Try ss -tuln",
        },
      ],
    },
    {
      id: "putting-it-together",
      title: "Putting It Together",
      blocks: [
        {
          type: "paragraph",
          text: "Here is the simulated machine’s networking picture in one place:",
        },
        {
          type: "code",
          code: "Host:\n    192.168.1.20\n\nInterface:\n    eth0\n\nPrefix:\n    /24\n\nGateway:\n    192.168.1.1\n\nDNS:\n    192.168.1.1\n\nListening services:\n    22 → SSH\n    80 → HTTP",
          language: "text",
          title: "simulated host summary",
        },
        {
          type: "code",
          code: "IP address\n    ↓\nidentifies the host on the network\n\nPort\n    ↓\nidentifies the service endpoint\n\nDNS\n    ↓\nhelps resolve names to IP addresses\n\nGateway\n    ↓\nhelps reach other networks",
          language: "text",
          title: "core mental model",
        },
        {
          type: "callout",
          title: "Core mental model",
          text: "Interfaces connect you. IP addresses locate the host. Ports locate the service. DNS maps names. Gateways reach other networks. Each command in this lesson reveals one piece of that picture.",
        },
      ],
    },
    {
      id: "troubleshooting-scenario",
      title: "Practical Scenario: How Does This Machine Connect?",
      blocks: [
        {
          type: "paragraph",
          text: "A Linux administrator wants to understand how this machine connects to the network. Walk through these inspection steps:",
        },
        {
          type: "heading",
          level: 3,
          text: "Step 1 — Identify the active interface",
        },
        {
          type: "code",
          code: "ip link",
          language: "bash",
          title: "command",
        },
        {
          type: "heading",
          level: 3,
          text: "Step 2 — Identify its IP address",
        },
        {
          type: "code",
          code: "ip addr",
          language: "bash",
          title: "command",
        },
        {
          type: "heading",
          level: 3,
          text: "Step 3 — Identify the default gateway",
        },
        {
          type: "code",
          code: "ip route",
          language: "bash",
          title: "command",
        },
        {
          type: "heading",
          level: 3,
          text: "Step 4 — Identify listening services",
        },
        {
          type: "code",
          code: "ss -tuln",
          language: "bash",
          title: "command",
        },
        {
          type: "heading",
          level: 3,
          text: "Step 5 — Verify hostname resolution",
        },
        {
          type: "code",
          code: "getent hosts example.com",
          language: "bash",
          title: "command",
        },
        {
          type: "note",
          text: "These commands provide different pieces of the networking picture. Together they form a practical starting point for connectivity troubleshooting.",
        },
        {
          type: "terminal",
          preset: "networking-fundamentals",
          suggestions: [
            { command: "ip link", label: "ip link" },
            { command: "ip addr", label: "ip addr" },
            { command: "ip route", label: "ip route" },
            { command: "ss -tuln", label: "ss -tuln" },
            {
              command: "getent hosts example.com",
              label: "getent hosts",
            },
          ],
          suggestionsLabel: "Troubleshoot connectivity",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Work through six short exercises in one simulated terminal: find the interface, IP address, gateway, a listening service, a DNS response, and confirm loopback replies.",
        },
        {
          type: "exercise",
          id: "networking-fundamentals-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "networking-fundamentals-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to explain and practice basic networking inspection:",
        },
        {
          type: "list",
          items: [
            "Network interfaces connect Linux to networks",
            "IP addresses identify hosts/interfaces on a network",
            "Prefixes describe network boundaries",
            "The default gateway helps reach other networks",
            "DNS resolves hostnames to IP addresses",
            "Ports identify network service endpoints",
            "`ip link` and `ip addr` inspect interfaces and addresses",
            "`ip route` shows routing information",
            "`ss` helps inspect listening sockets",
            "These commands provide a useful foundation for network troubleshooting",
          ],
        },
        {
          type: "table",
          caption: "Command reference for networking fundamentals",
          headers: ["Command", "Purpose"],
          rows: [
            ["`ip link`", "List network interfaces and state"],
            ["`ip addr`", "Show interface IP addresses"],
            ["`ip route`", "Show routing / default gateway"],
            ["`ss -tuln`", "List listening TCP/UDP sockets"],
            ["`getent hosts NAME`", "Resolve a hostname (simulated)"],
            ["`ping 127.0.0.1`", "Test loopback (simulated)"],
          ],
        },
      ],
    },
  ],
} as const satisfies Lesson;
