import type { Lesson } from "@/types/lesson";

export const installingLinuxLesson = {
  slug: "installing-linux",
  level: "beginner",
  levelNumber: "03",
  difficulty: "Beginner",
  readingTime: "12 min read",
  title: "Installing Linux",
  description:
    "Understand the different ways to install Linux and prepare your system before taking the first step.",
  seoTitle: "Installing Linux | Rean Linux",
  seoDescription:
    "Learn the different ways beginners can install or run Linux — virtual machines, dual boot, physical installs, servers, and cloud — and how to prepare safely.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Beginner", href: "/learn/beginner" },
    { label: "Installing Linux" },
  ],
  navigation: {
    previous: {
      label: "Linux Distributions",
      href: "/learn/beginner/linux-distributions",
    },
    next: {
      label: "The Linux Terminal",
      href: "/learn/beginner/terminal",
    },
  },
  sections: [
    {
      id: "before-you-install-linux",
      title: "Before You Install Linux",
      blocks: [
        {
          type: "paragraph",
          text: "Before you install Linux, pause and decide what you want out of the experience. The best installation method depends on your goals and how much you want to change on your current computer.",
        },
        {
          type: "paragraph",
          text: "Ask yourself a few practical questions first:",
        },
        {
          type: "list",
          items: [
            "**What do you want to use Linux for?** Learning the terminal, trying a new desktop, running a home lab, or preparing for servers and cloud work all point toward different setups.",
            "**Do you want to keep your current operating system?** If yes, a virtual machine or dual boot may fit better than replacing everything.",
            "**Do you have spare hardware?** An old laptop or unused machine can be a low-risk place to install Linux directly.",
            "**Are you comfortable changing disk partitions?** Partitioning is powerful, but mistakes can affect existing data.",
            "**Do you want to experiment safely?** If you are still exploring, a virtual machine is often the calmest starting point.",
          ],
        },
        {
          type: "callout",
          title: "Important",
          text: "If you install Linux directly onto a physical disk, mistakes during partitioning can cause data loss. Back up important files before changing partitions.",
        },
      ],
    },
    {
      id: "choose-how-you-want-to-install-linux",
      title: "Choose How You Want to Install Linux",
      blocks: [
        {
          type: "paragraph",
          text: "There is more than one way to run Linux. Choosing the right approach early saves frustration later. These are the main options beginners usually consider:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "**Virtual machine** — Run Linux inside your current operating system. Great for safe learning and testing.",
            "**Dual boot** — Install Linux alongside your existing system on the same computer and choose which one to start at boot.",
            "**Full installation on a physical machine** — Make Linux the main operating system on a computer.",
            "**Server installation** — Install Linux for hosting services, often with a minimal setup and remote administration.",
            "**Cloud or remote Linux machine** — Use a Linux system provided by a cloud platform or remote host, often without performing a manual OS install yourself.",
          ],
        },
        {
          type: "paragraph",
          text: "A virtual machine is usually the gentlest start. Dual boot and full installs give you native hardware performance, but they involve more careful disk decisions. Servers and cloud machines are especially useful once you care about networking, services, and remote work.",
        },
      ],
    },
    {
      id: "virtual-machines",
      title: "Virtual Machines",
      blocks: [
        {
          type: "paragraph",
          text: "A **virtual machine** lets Linux run inside another operating system. Your existing system stays in place, and Linux runs as a guest inside software that emulates a computer.",
        },
        {
          type: "paragraph",
          text: "Common virtualization tools include:",
        },
        {
          type: "list",
          items: ["VirtualBox", "VMware", "Hyper-V"],
        },
        {
          type: "paragraph",
          text: "You do not need detailed setup steps yet. For now, understand the concept: the virtual machine is a contained environment where you can install and explore Linux without replacing your main system.",
        },
        {
          type: "tree-diagram",
          ariaLabel:
            "Your computer running an existing operating system alongside a virtual machine that contains Linux",
          root: {
            label: "Your Computer",
            children: [
              { label: "Existing Operating System" },
              {
                label: "Virtual Machine",
                children: [{ label: "Linux" }],
              },
            ],
          },
        },
        {
          type: "paragraph",
          text: "Virtual machines are excellent for beginners because they offer:",
        },
        {
          type: "list",
          items: [
            "**Safer experimentation** — Mistakes stay inside the virtual machine.",
            "**No need to repartition the main disk** — Your existing partitions can remain untouched.",
            "**Easy to delete or recreate** — If something breaks, you can start over quickly.",
            "**Useful for testing different distributions** — Try Ubuntu one week and Fedora the next without committing your whole machine.",
          ],
        },
      ],
    },
    {
      id: "dual-boot",
      title: "Dual Boot",
      blocks: [
        {
          type: "paragraph",
          text: "**Dual boot** means having two operating systems installed on the same physical computer. When you turn the machine on, a bootloader lets you choose which system to start.",
        },
        {
          type: "tree-diagram",
          ariaLabel:
            "A computer with a bootloader that can start either Operating System A or Linux",
          root: {
            label: "Computer",
            children: [
              {
                label: "Bootloader",
                children: [
                  { label: "Operating System A" },
                  { label: "Linux" },
                ],
              },
            ],
          },
        },
        {
          type: "paragraph",
          text: "At startup, you pick Operating System A or Linux. Only one runs at a time on the hardware, unlike a virtual machine where Linux can run while your existing system is also active.",
        },
        {
          type: "paragraph",
          text: "The main considerations for dual boot are:",
        },
        {
          type: "list",
          items: [
            "**Disk space** — Each operating system needs enough room for itself and your files.",
            "**Partitioning** — The disk is divided so each system has its own storage area.",
            "**Bootloader** — Software that presents the choice of which system to start.",
            "**Backups** — Changing partitions is a good moment to protect important data first.",
          ],
        },
        {
          type: "paragraph",
          text: "Dual boot can work well when you want native performance and still need your original operating system. It also requires more care than a virtual machine, so take your time and back up before you change disk layout.",
        },
      ],
    },
    {
      id: "installing-on-a-physical-machine",
      title: "Installing on a Physical Machine",
      blocks: [
        {
          type: "paragraph",
          text: "Installing Linux on a physical machine means making it the operating system that boots directly on that hardware. The exact installer screens vary by distribution, but the overall process usually follows the same path.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Choose a distribution.",
            "Download its ISO image.",
            "Create installation media.",
            "Boot from the installation media.",
            "Follow the installer.",
            "Configure disk and storage options.",
            "Create a user account.",
            "Complete the installation.",
            "Reboot into Linux.",
          ],
        },
        {
          type: "paragraph",
          text: "Treat this as a conceptual overview. Later lessons and guides can go deeper into specific distributions. For now, focus on understanding the sequence rather than memorizing every installer screen.",
        },
      ],
    },
    {
      id: "linux-on-a-server",
      title: "Linux on a Server",
      blocks: [
        {
          type: "paragraph",
          text: "Linux is also commonly installed on servers. A server installation is often different from a desktop installation: you may get fewer graphical tools by default and spend more time working over the network.",
        },
        {
          type: "paragraph",
          text: "Server-oriented setups often emphasize:",
        },
        {
          type: "list",
          items: [
            "**Minimal installations** — Install only what you need, which can keep the system smaller and easier to reason about.",
            "**SSH** — A common way to log in and administer the machine remotely.",
            "**Remote administration** — Managing the system from another computer instead of sitting in front of it.",
            "**Services** — Running software such as web servers, databases, or application backends.",
            "**Networking** — Connectivity, firewalls, and how the machine is reached from other systems.",
          ],
        },
        {
          type: "paragraph",
          text: "Many cloud providers also offer ready-made Linux machines. In those cases, you often choose an image and start a virtual server without manually walking through a traditional installer. That is still Linux — just delivered through a different path.",
        },
      ],
    },
    {
      id: "what-you-need-before-installation",
      title: "What You Need Before Installation",
      blocks: [
        {
          type: "paragraph",
          text: "Whatever method you choose, a short checklist helps you prepare:",
        },
        {
          type: "list",
          items: [
            "Linux distribution ISO",
            "Enough disk space",
            "Backup of important data",
            "USB drive if installing from physical media",
            "Internet connection if required",
            "Basic understanding of the installation method",
          ],
        },
        {
          type: "paragraph",
          text: "If you are completely new, experimenting in a virtual machine first is often the best rehearsal. You can learn the installer flow and try a distribution before you change anything on your main computer.",
        },
        {
          type: "heading",
          level: 3,
          text: "What Is an ISO?",
        },
        {
          type: "paragraph",
          text: "An **ISO** is an image file that contains the contents needed to create installation media. Linux distributions commonly distribute their installers as ISO files.",
        },
        {
          type: "paragraph",
          text: 'You usually do not “install” an ISO by opening it like a regular application. Instead, you use it to create bootable media or attach it to a virtual machine so the installer can start.',
        },
      ],
    },
    {
      id: "what-happens-during-installation",
      title: "What Happens During Installation?",
      blocks: [
        {
          type: "paragraph",
          text: "Most Linux installers guide you through a familiar sequence of decisions. The exact screens differ by distribution, but the flow often looks like this:",
        },
        {
          type: "stack-diagram",
          ariaLabel:
            "Typical Linux installer flow from booting the installer through restart",
          layers: [
            "Boot installer",
            "Choose language / region",
            "Configure keyboard",
            "Configure network",
            "Choose installation/storage options",
            "Create user",
            "Install system",
            "Restart",
          ],
        },
        {
          type: "paragraph",
          text: "Storage configuration is the step that deserves the most attention. If you are unsure, prefer a virtual machine or spare hardware until you understand what the installer is asking. The rest of the process is usually guided and readable.",
        },
      ],
    },
    {
      id: "after-installation",
      title: "After Installation",
      blocks: [
        {
          type: "paragraph",
          text: "Once Linux is installed and you have logged in, a few first steps help you settle in:",
        },
        {
          type: "list",
          items: [
            "Update the system.",
            "Confirm networking works.",
            "Learn where applications are installed or launched.",
            "Open the terminal.",
            "Learn a few basic commands.",
            "Configure your preferred environment.",
          ],
        },
        {
          type: "paragraph",
          text: "You do not need a huge post-installation checklist on day one. Getting comfortable with updates, networking, and the terminal already puts you ahead.",
        },
        {
          type: "heading",
          level: 3,
          text: "First Commands",
        },
        {
          type: "paragraph",
          text: "After installation, these commands help you confirm what you are running. The first prints distribution and release information:",
        },
        {
          type: "code",
          code: "cat /etc/os-release",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "`cat /etc/os-release` can help identify the installed Linux distribution and release information.",
        },
        {
          type: "paragraph",
          text: "Then check the running kernel release:",
        },
        {
          type: "code",
          code: "uname -r",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "`uname -r` displays the running Linux kernel release — the same core idea you met when learning what Linux is and how distributions package it.",
        },
        {
          type: "callout",
          title: "Don't start by installing Linux on your main machine.",
          text: "If you're completely new to Linux, a virtual machine is often the easiest and safest way to experiment before changing your main computer.",
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
            "There are multiple ways to run Linux.",
            "Virtual machines are useful for safe experimentation.",
            "Dual boot requires more care around disks and the bootloader.",
            "Physical installations involve storage and boot configuration.",
            "Servers and cloud machines often use different installation approaches.",
            "Backups are important before changing disks.",
            "The installation process varies by distribution.",
          ],
        },
        {
          type: "paragraph",
          text: "Next, you will meet the Linux terminal — the tool you will use constantly once a system is up and running.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
