import type { Lesson } from "@/types/lesson";

export const networkTroubleshootingLesson = {
  slug: "network-troubleshooting",
  level: "administration",
  levelNumber: "03",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "Network Troubleshooting",
  description:
    "Diagnose common Linux networking problems systematically with simulated ip, ping, getent, and ss.",
  seoTitle: "Network Troubleshooting — Linux Administration | Rean Linux",
  seoDescription:
    "Learn a practical Linux network troubleshooting workflow: check interfaces, addresses, routes, connectivity, DNS, and listening ports in a safe simulator.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Administration", href: "/learn/administration" },
    { label: "Network Troubleshooting" },
  ],
  navigation: {
    previous: {
      label: "Networking Fundamentals",
      href: "/learn/administration/networking-fundamentals",
    },
    next: {
      label: "SSH and Remote Access",
      href: "/learn/administration/ssh-and-remote-access",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "After [Networking Fundamentals](/learn/administration/networking-fundamentals), you know how to inspect interfaces, addresses, routes, DNS, and ports. This lesson turns that inspection into a **systematic troubleshooting workflow** — still entirely in a simulated terminal.",
    },
  ],
  sections: [
    {
      id: "troubleshooting-workflow",
      title: "A Systematic Workflow",
      blocks: [
        {
          type: "paragraph",
          text: "When networking “doesn’t work,” guesswork wastes time. Work from the bottom of the stack upward so each check narrows the problem:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Check the **interface** — is it up?",
            "Check the **IP address** — does the interface have an address?",
            "Check the **route** — is there a default gateway?",
            "Test **connectivity** — can you reach local and remote IPs?",
            "Check **DNS** — do hostnames resolve?",
            "Check **listening ports** — is the expected service accepting connections?",
            "**Compare the evidence** before changing configuration.",
          ],
        },
        {
          type: "callout",
          title: "Evidence before changes",
          text: "Successful connectivity to an IP address does **not** mean DNS works. A host being reachable by IP does **not** mean a service’s hostname resolves, or that the service is listening.",
        },
        {
          type: "table",
          caption: "Troubleshooting checklist",
          headers: ["Step", "Command", "Question it answers"],
          rows: [
            ["1. Interface", "`ip link`", "Is the NIC up?"],
            ["2. Address", "`ip addr`", "Is an IPv4 address assigned?"],
            ["3. Route", "`ip route`", "Is there a default route?"],
            ["4. Connectivity", "`ping ...`", "Do local/remote IPs reply?"],
            ["5. DNS", "`getent hosts ...`", "Do names resolve?"],
            ["6. Ports", "`ss -tuln`", "Is the service listening?"],
            ["7. Compare", "—", "What do the results agree on?"],
          ],
        },
      ],
    },
    {
      id: "check-interface",
      title: "Check the Interface with ip link",
      blocks: [
        {
          type: "paragraph",
          text: "If the interface is down, almost every later symptom will fail. Start with:",
        },
        {
          type: "code",
          code: "ip link",
          title: "List interfaces and state",
        },
        {
          type: "paragraph",
          text: "Look for `UP` and `LOWER_UP` on the interface you expect (often `eth0`). Missing those flags is a strong signal the link itself is the problem.",
        },
        {
          type: "terminal",
          preset: "network-troubleshooting",
          suggestions: [
            { command: "ip link", label: "ip link" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Check interface state",
        },
        {
          type: "callout",
          title: "Common mistake",
          text: "Skipping `ip link` and jumping straight to DNS or firewall changes. If the interface is down, name resolution and routes are secondary.",
        },
      ],
    },
    {
      id: "check-address",
      title: "Check Addresses with ip addr",
      blocks: [
        {
          type: "paragraph",
          text: "An interface can be up and still have **no IPv4 address**. Inspect addresses with:",
        },
        {
          type: "code",
          code: "ip addr\n# same idea:\nip address",
          title: "Show interface addresses",
        },
        {
          type: "paragraph",
          text: "On a healthy simulated host you should see something like `inet 192.168.1.20/24` under `eth0`. If that line is missing, the host cannot communicate by IPv4 yet.",
        },
        {
          type: "terminal",
          preset: "network-troubleshooting",
          suggestions: [
            { command: "ip addr", label: "ip addr" },
            { command: "ip address", label: "ip address" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Check addresses",
        },
      ],
    },
    {
      id: "check-routes",
      title: "Check Routes with ip route",
      blocks: [
        {
          type: "paragraph",
          text: "Local subnet traffic and internet traffic are different. The **default route** tells the kernel where to send packets destined for other networks:",
        },
        {
          type: "code",
          code: "ip route",
          title: "Show routing table",
        },
        {
          type: "paragraph",
          text: "Expect a line such as `default via 192.168.1.1 dev eth0` on a healthy host. A missing default route often presents as: local gateway pings work, but external IPs fail.",
        },
        {
          type: "terminal",
          preset: "network-troubleshooting",
          suggestions: [
            { command: "ip route", label: "ip route" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Check routes",
        },
      ],
    },
    {
      id: "test-connectivity",
      title: "Test Connectivity with ping",
      blocks: [
        {
          type: "paragraph",
          text: "Use `ping` to separate **local** problems from **external** ones. In this lesson’s simulator, three targets are supported:",
        },
        {
          type: "list",
          items: [
            "`ping 127.0.0.1` — loopback (is the IP stack alive locally?)",
            "`ping 192.168.1.1` — default gateway (can we reach the local router?)",
            "`ping 8.8.8.8` — external IP (can we leave the local network?)",
          ],
        },
        {
          type: "code",
          code: "ping 127.0.0.1\nping 192.168.1.1\nping 8.8.8.8",
          title: "Compare local vs external connectivity",
        },
        {
          type: "note",
          text: "These pings are simulated. The lesson never contacts real hosts on the internet.",
        },
        {
          type: "terminal",
          preset: "network-troubleshooting",
          suggestions: [
            { command: "ping 127.0.0.1", label: "ping loopback" },
            { command: "ping 192.168.1.1", label: "ping gateway" },
            { command: "ping 8.8.8.8", label: "ping external" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Test connectivity",
        },
        {
          type: "callout",
          title: "Reading the pattern",
          text: "Loopback works + gateway fails → focus on interface/address/LAN. Gateway works + external fails → focus on the default route. External IP works + names fail → focus on DNS.",
        },
      ],
    },
    {
      id: "check-dns",
      title: "Diagnose DNS with getent hosts",
      blocks: [
        {
          type: "paragraph",
          text: "DNS maps hostnames to IP addresses. After IP connectivity looks healthy, check name resolution:",
        },
        {
          type: "code",
          code: "getent hosts example.com",
          title: "Resolve a hostname (simulated)",
        },
        {
          type: "paragraph",
          text: "If `ping 8.8.8.8` succeeds but `getent hosts example.com` fails, the network path is not the whole story — **DNS is failing**.",
        },
        {
          type: "terminal",
          preset: "network-troubleshooting",
          suggestions: [
            { command: "ping 8.8.8.8", label: "ping external IP" },
            { command: "getent hosts example.com", label: "getent hosts" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Compare IP vs DNS",
        },
        {
          type: "callout",
          title: "Important distinction",
          text: "Reaching a service by IP does **not** prove its hostname resolves correctly. Always test both when users report “the website doesn’t work.”",
        },
      ],
    },
    {
      id: "check-listening-ports",
      title: "Check Listening Ports with ss -tuln",
      blocks: [
        {
          type: "paragraph",
          text: "Even when the host is reachable, the application may not be accepting connections. Inspect listeners with:",
        },
        {
          type: "code",
          code: "ss -tuln",
          title: "Show listening TCP/UDP sockets",
        },
        {
          type: "paragraph",
          text: "Look for the expected port — for example `0.0.0.0:80` for HTTP or `0.0.0.0:22` for SSH. If the port is absent, the problem may be the service, not the network path.",
        },
        {
          type: "terminal",
          preset: "network-troubleshooting",
          suggestions: [
            { command: "ss -tuln", label: "ss -tuln" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Check listeners",
        },
      ],
    },
    {
      id: "symptoms-and-causes",
      title: "Symptoms, Causes, and Next Steps",
      blocks: [
        {
          type: "paragraph",
          text: "Map common symptoms to the next diagnostic step — not immediately to a configuration change:",
        },
        {
          type: "table",
          caption: "Common networking symptoms",
          headers: ["Symptom", "Likely area", "Next check"],
          rows: [
            [
              "Nothing on the LAN works",
              "Interface / address",
              "`ip link`, then `ip addr`",
            ],
            ["Interface up, still unreachable", "Missing IPv4", "`ip addr`"],
            [
              "Gateway works, internet fails",
              "Routing",
              "`ip route`, `ping 8.8.8.8`",
            ],
            ["IPs work, names fail", "DNS", "`getent hosts example.com`"],
            ["Host reachable, app fails", "Listening service", "`ss -tuln`"],
            [
              "All checks look normal",
              "Healthy / elsewhere",
              "Compare evidence; avoid unnecessary changes",
            ],
          ],
        },
        {
          type: "note",
          text: "In the practice lab you will investigate these scenarios yourself. The simulator reflects the selected fault — it does not always return healthy output.",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Work through six troubleshooting scenarios: interface down, missing IPv4, missing default route, DNS failure, service not listening, and a healthy network. Investigate with diagnostic commands, then identify the root cause.",
        },
        {
          type: "exercise",
          id: "network-troubleshooting-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "network-troubleshooting-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to troubleshoot common Linux networking problems systematically:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Check the interface with `ip link`",
            "Check the IP address with `ip addr`",
            "Check the route with `ip route`",
            "Test connectivity with `ping` (local vs external)",
            "Check DNS resolution with `getent hosts`",
            "Check listening ports with `ss -tuln`",
            "Compare the evidence before changing configuration",
          ],
        },
        {
          type: "table",
          caption: "Command reference for network troubleshooting",
          headers: ["Command", "Purpose"],
          rows: [
            ["`ip link`", "Check whether interfaces are up"],
            ["`ip addr` / `ip address`", "Check assigned IP addresses"],
            ["`ip route`", "Check routes and default gateway"],
            ["`ping 127.0.0.1`", "Test loopback connectivity"],
            ["`ping 192.168.1.1`", "Test gateway connectivity"],
            ["`ping 8.8.8.8`", "Test external IP connectivity"],
            ["`getent hosts NAME`", "Test DNS / name resolution"],
            ["`ss -tuln`", "List listening TCP/UDP sockets"],
          ],
        },
        {
          type: "callout",
          title: "Reusable checklist",
          text: "Interface → address → route → connectivity → DNS → listening ports → compare evidence. Keep this order when a connectivity report arrives.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
