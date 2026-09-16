import type { Lesson } from "@/types/lesson";

export const packageManagementLesson = {
  slug: "package-management",
  level: "essentials",
  levelNumber: "02",
  difficulty: "Intermediate",
  readingTime: "20–25 min read",
  title: "Package Management",
  description:
    "Learn how Linux installs, updates, searches, and removes software using package managers and repositories.",
  seoTitle: "Package Management — Linux Essentials | Rean Linux",
  seoDescription:
    "Learn Linux package management with APT: repositories, apt update vs upgrade, install, search, show, remove, and how other distributions use DNF and pacman.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Essentials", href: "/learn/essentials" },
    { label: "Package Management" },
  ],
  navigation: {
    previous: {
      label: "Processes",
      href: "/learn/essentials/processes",
    },
    next: {
      label: "Environment Variables",
      href: "/learn/essentials/environment-variables",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "In [Processes](/learn/essentials/processes) you learned how Linux runs programs. Now you will learn how software itself gets onto the system — through packages, repositories, and package managers.",
    },
  ],
  sections: [
    {
      id: "what-is-package-management",
      title: "What Is Package Management?",
      blocks: [
        {
          type: "paragraph",
          text: "Linux software is commonly distributed as **packages**. A package contains the software and the metadata needed to install and manage it.",
        },
        {
          type: "paragraph",
          text: "A **package manager** helps you install, update, remove, and inspect software. It can also resolve **dependencies** — other packages required for something to work.",
        },
        {
          type: "paragraph",
          text: "Simple concept:",
        },
        {
          type: "stack-diagram",
          ariaLabel:
            "Conceptual stack from application down through package, package manager, and repository",
          layers: ["Application", "Package", "Package Manager", "Repository"],
        },
        {
          type: "callout",
          title: "Distribution matters",
          text: "The exact package format and package manager depend on the Linux distribution. Ubuntu and Debian commonly use APT; other families use different tools.",
        },
      ],
    },
    {
      id: "why-linux-uses-package-managers",
      title: "Why Linux Uses Package Managers",
      blocks: [
        {
          type: "paragraph",
          text: "Package managers solve everyday software problems:",
        },
        {
          type: "list",
          items: [
            "Finding software",
            "Installing software",
            "Updating software",
            "Removing software",
            "Tracking installed packages",
            "Resolving dependencies",
            "Getting packages from configured repositories",
          ],
        },
        {
          type: "paragraph",
          text: "Using a package manager is generally safer and easier than manually downloading random binaries from the internet.",
        },
      ],
    },
    {
      id: "repositories",
      title: "Repositories",
      blocks: [
        {
          type: "paragraph",
          text: "A **repository** is a source of packages. Package managers use configured repositories to find software and download it for installation.",
        },
        {
          type: "paragraph",
          text: "Concept:",
        },
        {
          type: "code",
          code: "Repository\n    ↓\nPackage metadata\n    ↓\nAvailable packages\n    ↓\nDownload\n    ↓\nInstall",
          language: "text",
          title: "repository flow",
        },
        {
          type: "list",
          items: [
            "A repository provides packages and package metadata",
            "Different distributions maintain different repositories",
            "Third-party repositories should be treated carefully",
          ],
        },
        {
          type: "note",
          text: "This lesson does not cover configuring repositories yet. Focus on understanding what they are and how package managers use them.",
        },
      ],
    },
    {
      id: "apt-on-debian-and-ubuntu",
      title: "APT on Debian and Ubuntu",
      blocks: [
        {
          type: "paragraph",
          text: "**APT** is commonly used on Debian-based systems. Ubuntu uses APT for package management. The `apt` command is designed as a user-facing command-line interface.",
        },
        {
          type: "code",
          code: "apt",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "Ubuntu’s documentation recommends APT for managing Debian packages. You do not need to memorize every option — start with the common workflow commands.",
        },
        {
          type: "code",
          code: "apt --help",
          language: "bash",
          title: "explore",
        },
        {
          type: "terminal",
          preset: "package-management",
          suggestions: [
            { command: "apt --help", label: "apt --help" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Explore apt",
        },
      ],
    },
    {
      id: "updating-the-package-index",
      title: "Updating the Package Index",
      blocks: [
        {
          type: "paragraph",
          text: "Refresh local package information with:",
        },
        {
          type: "code",
          code: "sudo apt update",
          language: "bash",
          title: "command",
        },
        {
          type: "callout",
          title: "Important distinction",
          text: "`apt update` does **not** normally upgrade installed software. It refreshes the local package information from configured repositories.",
        },
        {
          type: "code",
          code: "Repository\n     ↓\napt update\n     ↓\nLocal package information",
          language: "text",
          title: "what update does",
        },
        {
          type: "terminal",
          preset: "package-management",
          suggestions: [
            { command: "sudo apt update", label: "sudo apt update" },
            { command: "apt update", label: "apt update (no sudo)" },
          ],
          suggestionsLabel: "Refresh the index",
        },
      ],
    },
    {
      id: "upgrading-installed-packages",
      title: "Upgrading Installed Packages",
      blocks: [
        {
          type: "paragraph",
          text: "Upgrade installed packages when updates are available:",
        },
        {
          type: "code",
          code: "sudo apt upgrade",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "A common workflow is:",
        },
        {
          type: "code",
          code: "sudo apt update\nsudo apt upgrade",
          language: "bash",
          title: "common workflow",
        },
        {
          type: "code",
          code: "apt update\n    → refresh package information\n\napt upgrade\n    → upgrade installed packages",
          language: "text",
          title: "update vs upgrade",
        },
        {
          type: "note",
          text: "This lesson does not cover distribution-release upgrades. Stay with package upgrades for now.",
        },
        {
          type: "terminal",
          preset: "package-management",
          suggestions: [
            { command: "sudo apt update", label: "sudo apt update" },
            { command: "sudo apt upgrade", label: "sudo apt upgrade" },
          ],
          suggestionsLabel: "Update then upgrade",
        },
      ],
    },
    {
      id: "installing-packages",
      title: "Installing Packages",
      blocks: [
        {
          type: "paragraph",
          text: "Install a package with:",
        },
        {
          type: "code",
          code: "sudo apt install curl",
          language: "bash",
          title: "command",
        },
        {
          type: "list",
          items: [
            "`install` requests a package to be installed",
            "The package manager may also install required dependencies",
            "Multiple packages can be installed in one command",
          ],
        },
        {
          type: "code",
          code: "sudo apt install curl git",
          language: "bash",
          title: "multiple packages",
        },
        {
          type: "paragraph",
          text: "The package manager calculates the required dependencies for you. In Rean Linux this is fully simulated — no real packages are downloaded or installed on your computer.",
        },
        {
          type: "terminal",
          preset: "package-management",
          suggestions: [
            { command: "sudo apt install curl", label: "Install curl" },
            { command: "sudo apt install curl git", label: "Install curl git" },
            { command: "apt install curl", label: "Without sudo" },
          ],
          suggestionsLabel: "Install packages",
        },
      ],
    },
    {
      id: "searching-for-packages",
      title: "Searching for Packages",
      blocks: [
        {
          type: "paragraph",
          text: "Search available package information:",
        },
        {
          type: "code",
          code: "apt search curl",
          language: "bash",
          title: "search",
        },
        {
          type: "paragraph",
          text: "Inspect details for a specific package:",
        },
        {
          type: "code",
          code: "apt show curl",
          language: "bash",
          title: "show",
        },
        {
          type: "paragraph",
          text: "`show` can display package information such as name, version, description, and dependencies.",
        },
        {
          type: "terminal",
          preset: "package-management",
          suggestions: [
            { command: "apt search curl", label: "apt search curl" },
            { command: "apt show curl", label: "apt show curl" },
          ],
          suggestionsLabel: "Search and inspect",
        },
      ],
    },
    {
      id: "removing-packages",
      title: "Removing Packages",
      blocks: [
        {
          type: "paragraph",
          text: "Remove a package with:",
        },
        {
          type: "code",
          code: "sudo apt remove curl",
          language: "bash",
          title: "remove",
        },
        {
          type: "list",
          items: [
            "`remove` removes the package",
            "Configuration and data behavior can differ depending on the command and package",
            "Do not blindly remove software from a real system",
          ],
        },
        {
          type: "paragraph",
          text: "A more aggressive option is:",
        },
        {
          type: "code",
          code: "sudo apt purge curl",
          language: "bash",
          title: "purge",
        },
        {
          type: "paragraph",
          text: "`purge` is more aggressive about removing package configuration files. You do not need deep configuration internals yet — just remember that `purge` goes further than `remove`.",
        },
        {
          type: "terminal",
          preset: "package-management",
          suggestions: [
            { command: "sudo apt install curl", label: "Install curl first" },
            { command: "sudo apt remove curl", label: "sudo apt remove curl" },
            { command: "sudo apt purge curl", label: "sudo apt purge curl" },
          ],
          suggestionsLabel: "Remove packages",
        },
      ],
    },
    {
      id: "other-linux-package-managers",
      title: "Other Linux Package Managers",
      blocks: [
        {
          type: "paragraph",
          text: "Linux distributions use different package ecosystems. The concepts are similar, but the commands differ.",
        },
        {
          type: "table",
          caption: "Common package managers by distribution family",
          headers: ["Distribution family", "Common package manager"],
          rows: [
            ["Debian / Ubuntu", "APT"],
            ["Fedora / RHEL family", "DNF"],
            ["Arch Linux", "pacman"],
          ],
        },
        {
          type: "code",
          code: "Search\nInstall\nUpdate\nUpgrade\nRemove\nInspect",
          language: "text",
          title: "shared ideas",
        },
        {
          type: "paragraph",
          text: "Examples on other systems:",
        },
        {
          type: "code",
          code: "dnf install curl",
          language: "bash",
          title: "DNF (RPM-based)",
        },
        {
          type: "code",
          code: "pacman -S curl",
          language: "bash",
          title: "pacman (Arch)",
        },
        {
          type: "paragraph",
          text: "DNF is used with RPM-based distributions, while pacman is the package-management utility used by Arch Linux. This lesson stays introductory — APT is the hands-on focus.",
        },
        {
          type: "terminal",
          preset: "package-management",
          suggestions: [
            { command: "dnf install curl", label: "dnf install curl" },
            { command: "pacman -S curl", label: "pacman -S curl" },
          ],
          suggestionsLabel: "Educational examples",
        },
      ],
    },
    {
      id: "package-manager-vs-package-format",
      title: "Package Manager vs Package Format",
      blocks: [
        {
          type: "paragraph",
          text: "A package manager and a package format are related, but not exactly the same thing.",
        },
        {
          type: "code",
          code: "Ubuntu\n    ↓\n.deb package format\n    ↓\nAPT manages packages/repositories",
          language: "text",
          title: "format vs manager",
        },
        {
          type: "list",
          items: [
            "`.deb` is a package format used by Debian-based systems",
            "`dpkg` is a lower-level Debian package management tool",
            "APT provides higher-level package management and dependency handling",
          ],
        },
        {
          type: "callout",
          title: "APT vs dpkg",
          text: "Ubuntu’s documentation distinguishes APT from `dpkg`: `dpkg` works with Debian packages but does not automatically handle downloading and installing dependencies in the same way APT does. This lesson does not teach `dpkg` commands in detail.",
        },
      ],
    },
    {
      id: "a-small-practice-session",
      title: "A Small Practice Session",
      blocks: [
        {
          type: "exercise",
          id: "package-management-practice",
        },
      ],
    },
    {
      id: "common-mistakes",
      title: "Common Mistakes",
      blocks: [
        {
          type: "heading",
          level: 3,
          text: "Mistake 1 — Confusing update and upgrade",
        },
        {
          type: "paragraph",
          text: "`sudo apt update` does **not** mean the same thing as `sudo apt upgrade`.",
        },
        {
          type: "code",
          code: "sudo apt update    # refresh package information\nsudo apt upgrade   # upgrade installed packages",
          language: "bash",
          title: "difference",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 2 — Installing packages without understanding them",
        },
        {
          type: "paragraph",
          text: "Inspect package information first with `apt search` and `apt show` before installing software you do not recognize.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 3 — Using random third-party repositories",
        },
        {
          type: "paragraph",
          text: "Package sources should be trusted and understood before you add them. Unknown repositories increase risk.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 4 — Removing important system packages",
        },
        {
          type: "paragraph",
          text: "Do not experiment with destructive package removal on a real machine. Practice safely in this simulated terminal first.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 5 — Assuming every Linux distribution uses apt",
        },
        {
          type: "paragraph",
          text: "Package managers differ between distributions. APT is common on Debian/Ubuntu; Fedora/RHEL often use DNF; Arch uses pacman.",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now understand the fundamentals of Linux package management:",
        },
        {
          type: "list",
          items: [
            "Packages are a common way Linux software is distributed",
            "Package managers install, update, remove, and inspect packages",
            "Repositories provide packages and metadata",
            "`apt update` refreshes package information",
            "`apt upgrade` upgrades installed packages",
            "`apt install` installs packages",
            "`apt search` searches packages",
            "`apt show` displays package information",
            "`apt remove` removes packages",
            "Different Linux distributions use different package managers",
          ],
        },
        {
          type: "table",
          caption: "Command reference for APT basics",
          headers: ["Command", "Purpose"],
          rows: [
            ["`apt --help`", "Show common apt commands"],
            ["`apt search NAME`", "Search available packages"],
            ["`apt show NAME`", "Show package details and status"],
            ["`sudo apt update`", "Refresh package information"],
            ["`sudo apt upgrade`", "Upgrade installed packages"],
            ["`sudo apt install NAME`", "Install a package"],
            ["`sudo apt remove NAME`", "Remove a package"],
            ["`sudo apt purge NAME`", "Remove a package and config files"],
          ],
        },
        {
          type: "code",
          code: "You don't need to memorize every package-manager command.\nUnderstand the workflow first:\nsearch → inspect → install → update → upgrade → remove",
          language: "text",
          title: "remember",
        },
      ],
    },
  ],
} as const satisfies Lesson;
