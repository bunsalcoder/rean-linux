import type { Lesson } from "@/types/lesson";

export const whatIsLinuxLesson = {
  slug: "what-is-linux",
  level: "beginner",
  levelNumber: "01",
  difficulty: "Beginner",
  readingTime: "8 min read",
  title: "What is Linux?",
  description:
    "A beginner-friendly introduction to the operating system that powers servers, desktops, cloud infrastructure, and much more.",
  seoTitle: "What is Linux? | Rean Linux",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Beginner", href: "/learn/beginner" },
    { label: "What is Linux?" },
  ],
  navigation: {
    next: {
      label: "Linux Distributions",
      href: "/learn/beginner/linux-distributions",
    },
  },
  sections: [
    {
      id: "what-is-linux",
      title: "What is Linux?",
      blocks: [
        {
          type: "paragraph",
          text: "**Linux** is an open-source operating system kernel — the core software that manages your computer's hardware and lets programs run. On its own, the kernel is not a complete desktop or server system you can install and use.",
        },
        {
          type: "paragraph",
          text: 'In everyday conversation, people say "Linux" to mean a complete operating system built around that kernel. Those complete systems are called **Linux distributions**. A distribution combines the Linux kernel with tools, libraries, a package manager, and other software so you have something practical to install and work with.',
        },
        {
          type: "paragraph",
          text: "So when someone says they run Ubuntu, Fedora, or Debian, they are still talking about Linux — just a specific complete package built on the Linux kernel.",
        },
      ],
    },
    {
      id: "the-linux-kernel",
      title: "The Linux Kernel",
      blocks: [
        {
          type: "paragraph",
          text: "The kernel sits between your applications and your hardware. When a program needs CPU time, memory, disk access, or a network connection, that request goes through the kernel.",
        },
        {
          type: "paragraph",
          text: "In practical terms, the Linux kernel helps manage:",
        },
        {
          type: "list",
          items: [
            "**CPU** — which processes get processor time and when",
            "**Memory** — how RAM is allocated and protected between programs",
            "**Hardware** — talking to disks, keyboards, network cards, and other devices",
            "**Processes** — starting, scheduling, and isolating running programs",
            "**Devices** — providing a consistent way for software to use connected hardware",
            "**Communication** — acting as the bridge between applications and the physical machine",
          ],
        },
        {
          type: "paragraph",
          text: "You usually do not talk to the kernel directly. You use a shell, desktop, or application — and those tools ask the kernel to do the work.",
        },
        {
          type: "stack-diagram",
          ariaLabel:
            "Conceptual stack showing applications above system libraries and tools, above the Linux kernel, above hardware",
          layers: [
            "Applications",
            "System libraries / tools",
            "Linux Kernel",
            "Hardware",
          ],
        },
        {
          type: "paragraph",
          text: "You can inspect basic information about the running kernel with a simple command:",
        },
        {
          type: "code",
          code: "uname -a",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "`uname -a` prints details about the running system and kernel. It is a quick way to confirm you are on a Linux machine and see which kernel version is active.",
        },
        {
          type: "callout",
          text: "You don't need to memorize Linux commands. Focus on understanding what they do and when to use them.",
        },
      ],
    },
    {
      id: "gnu-linux",
      title: "GNU/Linux",
      blocks: [
        {
          type: "paragraph",
          text: "You may also hear the name **GNU/Linux**. Many distributions combine the Linux kernel with GNU tools and libraries — utilities for shells, compilers, file handling, and everyday system work.",
        },
        {
          type: "paragraph",
          text: 'In practice, people usually just say "Linux." The longer name simply acknowledges that a usable system is more than the kernel alone: it is the kernel plus a large collection of supporting software.',
        },
      ],
    },
    {
      id: "linux-distributions",
      title: "Linux Distributions",
      blocks: [
        {
          type: "paragraph",
          text: "A **Linux distribution** packages the Linux kernel with software, a package manager, configuration tools, defaults, and documentation so you can install and maintain a complete operating system.",
        },
        {
          type: "paragraph",
          text: "Different distributions make different choices about release cadence, default software, and administration style. Common examples include:",
        },
        {
          type: "list",
          items: ["Ubuntu", "Debian", "Fedora", "Arch Linux", "openSUSE"],
        },
        {
          type: "paragraph",
          text: "You do not need to pick one yet. For now, remember that distributions are complete systems built around the same Linux kernel, each with its own packaging and defaults.",
        },
      ],
    },
    {
      id: "why-learn-linux",
      title: "Why Learn Linux?",
      blocks: [
        {
          type: "paragraph",
          text: "Learning Linux is practical. It shows up across many technical roles and environments:",
        },
        {
          type: "list",
          items: [
            "**Servers** — a large share of web and application servers run Linux",
            "**Cloud** — virtual machines and managed services commonly run on Linux hosts",
            "**Development** — many developers use Linux locally or remotely because it matches production systems",
            "**DevOps** — automation, deployment, and monitoring workflows often assume Linux skills",
            "**Containers** — Docker and Kubernetes rely heavily on Linux kernel features",
            "**Networking** — routers, firewalls, and network services frequently run Linux-based software",
            "**System administration** — installing packages, managing users, and troubleshooting systems are everyday Linux tasks",
          ],
        },
        {
          type: "paragraph",
          text: "Even a basic comfort level with Linux helps you understand how modern software is built, deployed, and operated.",
        },
      ],
    },
    {
      id: "linux-is-everywhere",
      title: "Linux Is Everywhere",
      blocks: [
        {
          type: "paragraph",
          text: "Linux is not limited to desktops or one kind of machine. It runs across many environments, including:",
        },
        {
          type: "list",
          items: [
            "Web servers",
            "Cloud infrastructure",
            "Containers",
            "Networking equipment",
            "Embedded systems",
            "Supercomputers",
          ],
        },
        {
          type: "paragraph",
          text: "That reach is one reason Linux skills transfer well. Concepts you learn here — processes, filesystems, users, packages, and the terminal — apply across many of those environments.",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "Here is what you should take away from this lesson:",
        },
        {
          type: "list",
          items: [
            "The **Linux kernel** is the core that manages hardware and processes.",
            "A **Linux distribution** is a complete operating system built around that kernel.",
            "Linux matters because it powers servers, cloud platforms, containers, networking gear, and much more.",
          ],
        },
        {
          type: "paragraph",
          text: "Next, you will look at Linux distributions in more detail — what makes them different, and how to think about choosing one as you continue learning.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
