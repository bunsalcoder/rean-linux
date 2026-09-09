import type { Lesson } from "@/types/lesson";

export const linuxDistributionsLesson = {
  slug: "linux-distributions",
  level: "beginner",
  levelNumber: "02",
  difficulty: "Beginner",
  readingTime: "10 min read",
  title: "Linux Distributions",
  description:
    "Linux comes in many distributions, each packaged with its own tools, defaults, and goals. Understanding the differences helps you choose the right environment for learning.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Beginner", href: "/learn/beginner" },
    { label: "Linux Distributions" },
  ],
  navigation: {
    previous: {
      label: "What is Linux?",
      href: "/learn/beginner/what-is-linux",
    },
    next: {
      label: "Installing Linux",
      href: "/learn/beginner/installing-linux",
    },
  },
  sections: [
    {
      id: "what-is-a-linux-distribution",
      title: "What is a Linux distribution?",
      blocks: [
        {
          type: "paragraph",
          text: "**Linux itself** is the kernel — the core software that manages hardware and provides essential services to everything running on your computer. On its own, the kernel is not a complete operating system you can install and use directly.",
        },
        {
          type: "paragraph",
          text: "A **Linux distribution** combines the Linux kernel with system tools, libraries, a package manager, and applications. Different distributions make different choices about defaults, bundled software, and how the system is maintained.",
        },
        {
          type: "paragraph",
          text: "This is why Ubuntu, Debian, Fedora, and Arch can all be called Linux distributions while behaving differently — they share the same kernel foundation but ship different combinations of software and configuration.",
        },
        {
          type: "composition-diagram",
          ariaLabel:
            "Linux distribution composed of the Linux kernel plus system tools, libraries, package manager, and applications",
          components: [
            "Linux Kernel",
            "System Tools",
            "Libraries",
            "Package Manager",
            "Applications",
          ],
          result: "Linux Distribution",
        },
      ],
    },
    {
      id: "why-are-there-so-many-distributions",
      title: "Why are there so many distributions?",
      blocks: [
        {
          type: "paragraph",
          text: "Linux distributions exist because different users have different requirements. No single package of software can be the best fit for everyone, so communities and companies build variations tuned to specific goals.",
        },
        {
          type: "list",
          items: [
            "**Different audiences** — Beginners, developers, enterprise administrators, and hobbyists all want different out-of-the-box experiences.",
            "**Different philosophies** — Some distributions prioritize stability and predictability; others prioritize cutting-edge software or minimalism.",
            "**Different package management systems** — Tools like APT, DNF, and Pacman organize software differently and target different ecosystems.",
            "**Different release models** — Some release on fixed schedules with long-term support; others update continuously as new packages become available.",
            "**Different default software** — Desktop environments, server tools, and preinstalled applications vary widely between distributions.",
            "**Different levels of customization** — Some distributions give you a polished, ready-to-use system; others provide a minimal base you configure yourself.",
          ],
        },
      ],
    },
    {
      id: "popular-linux-distributions",
      title: "Popular Linux distributions",
      blocks: [
        {
          type: "paragraph",
          text: "Hundreds of distributions exist, but a handful appear constantly in learning resources, job postings, and server environments. Here are five well-known options and what each is generally known for.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Ubuntu",
              description:
                "Ubuntu is a popular Debian-based distribution known for being beginner-friendly and widely used on desktops, servers, and cloud platforms.",
            },
            {
              term: "Debian",
              description:
                "Debian is a long-running community-driven distribution known for stability and a large software ecosystem.",
            },
            {
              term: "Fedora",
              description:
                "Fedora is a community Linux distribution sponsored by Red Hat and is known for adopting newer technologies.",
            },
            {
              term: "Arch Linux",
              description:
                "Arch Linux is designed for users who want a minimal starting point and extensive control over how their system is configured.",
            },
            {
              term: "Rocky Linux",
              description:
                "Rocky Linux is an enterprise-oriented distribution designed to be compatible with Red Hat Enterprise Linux.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "Each distribution has strengths for particular use cases. None is universally better — the right choice depends on your goals and context.",
        },
        {
          type: "table",
          caption: "Comparison of popular Linux distributions",
          headers: [
            "Distribution",
            "Ecosystem",
            "Package Manager",
            "Typical Focus",
          ],
          rows: [
            ["Ubuntu", "Debian", "APT", "Beginners, desktop, server"],
            ["Debian", "Debian", "APT", "Stability, servers"],
            ["Fedora", "Red Hat", "DNF", "Modern Linux, development"],
            ["Arch Linux", "Independent", "Pacman", "Control, customization"],
            ["Rocky Linux", "RHEL-compatible", "DNF", "Enterprise servers"],
          ],
        },
      ],
    },
    {
      id: "package-managers",
      title: "Package managers",
      blocks: [
        {
          type: "paragraph",
          text: "A **package manager** is the tool your distribution uses to install, update, and remove software. Instead of downloading programs manually from individual websites, you use a package manager to fetch software from trusted repositories maintained for your distribution.",
        },
        {
          type: "paragraph",
          text: "Different distributions use different package management systems. The commands look similar in purpose but differ in syntax — always use the tools appropriate for the distribution you are running.",
        },
        {
          type: "paragraph",
          text: "**Ubuntu / Debian** use APT:",
        },
        {
          type: "code",
          code: "sudo apt update\nsudo apt install nginx",
          language: "bash",
          title: "Ubuntu / Debian",
        },
        {
          type: "paragraph",
          text: "**Fedora / Rocky Linux** use DNF:",
        },
        {
          type: "code",
          code: "sudo dnf install nginx",
          language: "bash",
          title: "Fedora / Rocky Linux",
        },
        {
          type: "paragraph",
          text: "**Arch Linux** uses Pacman:",
        },
        {
          type: "code",
          code: "sudo pacman -S nginx",
          language: "bash",
          title: "Arch Linux",
        },
        {
          type: "paragraph",
          text: "These examples show how the same task — installing the Nginx web server — uses different commands on different distributions. You do not need to run these commands now; they illustrate how package managers work in practice.",
        },
      ],
    },
    {
      id: "which-distribution-should-a-beginner-choose",
      title: "Which distribution should a beginner choose?",
      blocks: [
        {
          type: "paragraph",
          text: "There is no single distribution that is best for every person. Your choice depends on what you want to learn and how you plan to use Linux. Here are reasonable starting points for common goals:",
        },
        {
          type: "list",
          variant: "plain",
          items: [
            "**For someone completely new to Linux** — Ubuntu is a reasonable starting point because of its beginner-friendly ecosystem and large amount of documentation.",
            "**For someone interested in learning enterprise-style Linux** — Rocky Linux can be useful.",
            "**For someone who wants to understand Linux deeply and customize everything** — Arch Linux can be a later challenge.",
            "**For someone who wants a stable general-purpose foundation** — Debian is worth learning.",
          ],
        },
        {
          type: "paragraph",
          text: "The important lesson: **the distribution matters less than actually learning Linux fundamentals.** Commands, the filesystem, permissions, and processes work similarly across distributions. Pick one, start learning, and refine your choice later as your goals become clearer.",
        },
      ],
    },
    {
      id: "distribution-vs-desktop-environment",
      title: "Distribution vs Desktop Environment",
      blocks: [
        {
          type: "paragraph",
          text: "**Distribution ≠ Desktop Environment**",
        },
        {
          type: "paragraph",
          text: "A distribution is the broader operating system package — kernel, tools, package manager, and default software. A **desktop environment** is the graphical layer that provides windows, panels, menus, and settings for daily desktop use.",
        },
        {
          type: "paragraph",
          text: "The same distribution can ship with different desktop environments, such as:",
        },
        {
          type: "list",
          items: ["GNOME", "KDE Plasma", "XFCE"],
        },
        {
          type: "paragraph",
          text: "The desktop environment controls much of the graphical user experience, while the distribution determines the underlying system, package management, and release model. You can often choose or switch desktop environments without changing distributions.",
        },
      ],
    },
    {
      id: "what-should-you-learn-next",
      title: "What should you learn next?",
      blocks: [
        {
          type: "panel",
          title: "Ready to install Linux?",
          blocks: [
            {
              type: "paragraph",
              text: "Now that you understand distributions, the next step is preparing and installing a Linux system.",
            },
            {
              type: "paragraph",
              text: "[Next: Installing Linux →](/learn/beginner/installing-linux)",
            },
            {
              type: "paragraph",
              text: "[← Previous: What is Linux?](/learn/beginner/what-is-linux)",
            },
            {
              type: "paragraph",
              text: "[← Back to Beginner Path](/learn/beginner)",
            },
          ],
        },
      ],
    },
  ],
} as const satisfies Lesson;
