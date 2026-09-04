import { Callout } from "@/components/learn/callout";
import { LessonSection } from "@/components/learn/lesson-section";
import { StackDiagram, TreeDiagram } from "@/components/learn/stack-diagram";
import { CodeBlock } from "@/components/ui/code-block";
import { INSTALLING_LINUX_SECTIONS } from "@/content/beginner/installing-linux";

export function InstallingLinuxContent() {
  const {
    beforeInstall,
    chooseHow,
    virtualMachines,
    dualBoot,
    physicalMachine,
    server,
    whatYouNeed,
    duringInstall,
    afterInstall,
    summary,
  } = INSTALLING_LINUX_SECTIONS;

  return (
    <>
      <LessonSection id={beforeInstall.id} title={beforeInstall.title}>
        <p>
          Before you install Linux, pause and decide what you want out of the
          experience. The best installation method depends on your goals and how
          much you want to change on your current computer.
        </p>
        <p>Ask yourself a few practical questions first:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">
              What do you want to use Linux for?
            </strong>{" "}
            Learning the terminal, trying a new desktop, running a home lab, or
            preparing for servers and cloud work all point toward different
            setups.
          </li>
          <li>
            <strong className="text-foreground">
              Do you want to keep your current operating system?
            </strong>{" "}
            If yes, a virtual machine or dual boot may fit better than replacing
            everything.
          </li>
          <li>
            <strong className="text-foreground">
              Do you have spare hardware?
            </strong>{" "}
            An old laptop or unused machine can be a low-risk place to install
            Linux directly.
          </li>
          <li>
            <strong className="text-foreground">
              Are you comfortable changing disk partitions?
            </strong>{" "}
            Partitioning is powerful, but mistakes can affect existing data.
          </li>
          <li>
            <strong className="text-foreground">
              Do you want to experiment safely?
            </strong>{" "}
            If you are still exploring, a virtual machine is often the calmest
            starting point.
          </li>
        </ul>
        <Callout title="Important">
          <p>
            If you install Linux directly onto a physical disk, mistakes during
            partitioning can cause data loss. Back up important files before
            changing partitions.
          </p>
        </Callout>
      </LessonSection>

      <LessonSection id={chooseHow.id} title={chooseHow.title}>
        <p>
          There is more than one way to run Linux. Choosing the right approach
          early saves frustration later. These are the main options beginners
          usually consider:
        </p>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong className="text-foreground">Virtual machine</strong> — Run
            Linux inside your current operating system. Great for safe learning
            and testing.
          </li>
          <li>
            <strong className="text-foreground">Dual boot</strong> — Install
            Linux alongside your existing system on the same computer and choose
            which one to start at boot.
          </li>
          <li>
            <strong className="text-foreground">
              Full installation on a physical machine
            </strong>{" "}
            — Make Linux the main operating system on a computer.
          </li>
          <li>
            <strong className="text-foreground">Server installation</strong> —
            Install Linux for hosting services, often with a minimal setup and
            remote administration.
          </li>
          <li>
            <strong className="text-foreground">
              Cloud or remote Linux machine
            </strong>{" "}
            — Use a Linux system provided by a cloud platform or remote host,
            often without performing a manual OS install yourself.
          </li>
        </ol>
        <p>
          A virtual machine is usually the gentlest start. Dual boot and full
          installs give you native hardware performance, but they involve more
          careful disk decisions. Servers and cloud machines are especially
          useful once you care about networking, services, and remote work.
        </p>
      </LessonSection>

      <LessonSection id={virtualMachines.id} title={virtualMachines.title}>
        <p>
          A <strong className="text-foreground">virtual machine</strong> lets
          Linux run inside another operating system. Your existing system stays
          in place, and Linux runs as a guest inside software that emulates a
          computer.
        </p>
        <p>Common virtualization tools include:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>VirtualBox</li>
          <li>VMware</li>
          <li>Hyper-V</li>
        </ul>
        <p>
          You do not need detailed setup steps yet. For now, understand the
          concept: the virtual machine is a contained environment where you can
          install and explore Linux without replacing your main system.
        </p>
        <TreeDiagram
          ariaLabel="Your computer running an existing operating system alongside a virtual machine that contains Linux"
          root={{
            label: "Your Computer",
            children: [
              { label: "Existing Operating System" },
              {
                label: "Virtual Machine",
                children: [{ label: "Linux" }],
              },
            ],
          }}
        />
        <p>Virtual machines are excellent for beginners because they offer:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Safer experimentation</strong> —
            Mistakes stay inside the virtual machine.
          </li>
          <li>
            <strong className="text-foreground">
              No need to repartition the main disk
            </strong>{" "}
            — Your existing partitions can remain untouched.
          </li>
          <li>
            <strong className="text-foreground">
              Easy to delete or recreate
            </strong>{" "}
            — If something breaks, you can start over quickly.
          </li>
          <li>
            <strong className="text-foreground">
              Useful for testing different distributions
            </strong>{" "}
            — Try Ubuntu one week and Fedora the next without committing your
            whole machine.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id={dualBoot.id} title={dualBoot.title}>
        <p>
          <strong className="text-foreground">Dual boot</strong> means having
          two operating systems installed on the same physical computer. When
          you turn the machine on, a bootloader lets you choose which system to
          start.
        </p>
        <TreeDiagram
          ariaLabel="A computer with a bootloader that can start either Operating System A or Linux"
          root={{
            label: "Computer",
            children: [
              {
                label: "Bootloader",
                children: [{ label: "Operating System A" }, { label: "Linux" }],
              },
            ],
          }}
        />
        <p>
          At startup, you pick Operating System A or Linux. Only one runs at a
          time on the hardware, unlike a virtual machine where Linux can run
          while your existing system is also active.
        </p>
        <p>The main considerations for dual boot are:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Disk space</strong> — Each
            operating system needs enough room for itself and your files.
          </li>
          <li>
            <strong className="text-foreground">Partitioning</strong> — The disk
            is divided so each system has its own storage area.
          </li>
          <li>
            <strong className="text-foreground">Bootloader</strong> — Software
            that presents the choice of which system to start.
          </li>
          <li>
            <strong className="text-foreground">Backups</strong> — Changing
            partitions is a good moment to protect important data first.
          </li>
        </ul>
        <p>
          Dual boot can work well when you want native performance and still
          need your original operating system. It also requires more care than a
          virtual machine, so take your time and back up before you change disk
          layout.
        </p>
      </LessonSection>

      <LessonSection id={physicalMachine.id} title={physicalMachine.title}>
        <p>
          Installing Linux on a physical machine means making it the operating
          system that boots directly on that hardware. The exact installer
          screens vary by distribution, but the overall process usually follows
          the same path.
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Choose a distribution.</li>
          <li>Download its ISO image.</li>
          <li>Create installation media.</li>
          <li>Boot from the installation media.</li>
          <li>Follow the installer.</li>
          <li>Configure disk and storage options.</li>
          <li>Create a user account.</li>
          <li>Complete the installation.</li>
          <li>Reboot into Linux.</li>
        </ol>
        <p>
          Treat this as a conceptual overview. Later lessons and guides can go
          deeper into specific distributions. For now, focus on understanding
          the sequence rather than memorizing every installer screen.
        </p>
      </LessonSection>

      <LessonSection id={server.id} title={server.title}>
        <p>
          Linux is also commonly installed on servers. A server installation is
          often different from a desktop installation: you may get fewer
          graphical tools by default and spend more time working over the
          network.
        </p>
        <p>Server-oriented setups often emphasize:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Minimal installations</strong> —
            Install only what you need, which can keep the system smaller and
            easier to reason about.
          </li>
          <li>
            <strong className="text-foreground">SSH</strong> — A common way to
            log in and administer the machine remotely.
          </li>
          <li>
            <strong className="text-foreground">Remote administration</strong> —
            Managing the system from another computer instead of sitting in
            front of it.
          </li>
          <li>
            <strong className="text-foreground">Services</strong> — Running
            software such as web servers, databases, or application backends.
          </li>
          <li>
            <strong className="text-foreground">Networking</strong> —
            Connectivity, firewalls, and how the machine is reached from other
            systems.
          </li>
        </ul>
        <p>
          Many cloud providers also offer ready-made Linux machines. In those
          cases, you often choose an image and start a virtual server without
          manually walking through a traditional installer. That is still Linux
          — just delivered through a different path.
        </p>
      </LessonSection>

      <LessonSection id={whatYouNeed.id} title={whatYouNeed.title}>
        <p>Whatever method you choose, a short checklist helps you prepare:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Linux distribution ISO</li>
          <li>Enough disk space</li>
          <li>Backup of important data</li>
          <li>USB drive if installing from physical media</li>
          <li>Internet connection if required</li>
          <li>Basic understanding of the installation method</li>
        </ul>
        <p>
          If you are completely new, experimenting in a virtual machine first is
          often the best rehearsal. You can learn the installer flow and try a
          distribution before you change anything on your main computer.
        </p>
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight">
          What Is an ISO?
        </h3>
        <p>
          An <strong className="text-foreground">ISO</strong> is an image file
          that contains the contents needed to create installation media. Linux
          distributions commonly distribute their installers as ISO files.
        </p>
        <p>
          You usually do not &ldquo;install&rdquo; an ISO by opening it like a
          regular application. Instead, you use it to create bootable media or
          attach it to a virtual machine so the installer can start.
        </p>
      </LessonSection>

      <LessonSection id={duringInstall.id} title={duringInstall.title}>
        <p>
          Most Linux installers guide you through a familiar sequence of
          decisions. The exact screens differ by distribution, but the flow
          often looks like this:
        </p>
        <StackDiagram
          ariaLabel="Typical Linux installer flow from booting the installer through restart"
          layers={[
            "Boot installer",
            "Choose language / region",
            "Configure keyboard",
            "Configure network",
            "Choose installation/storage options",
            "Create user",
            "Install system",
            "Restart",
          ]}
        />
        <p>
          Storage configuration is the step that deserves the most attention. If
          you are unsure, prefer a virtual machine or spare hardware until you
          understand what the installer is asking. The rest of the process is
          usually guided and readable.
        </p>
      </LessonSection>

      <LessonSection id={afterInstall.id} title={afterInstall.title}>
        <p>
          Once Linux is installed and you have logged in, a few first steps help
          you settle in:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Update the system.</li>
          <li>Confirm networking works.</li>
          <li>Learn where applications are installed or launched.</li>
          <li>Open the terminal.</li>
          <li>Learn a few basic commands.</li>
          <li>Configure your preferred environment.</li>
        </ul>
        <p>
          You do not need a huge post-installation checklist on day one. Getting
          comfortable with updates, networking, and the terminal already puts
          you ahead.
        </p>
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight">
          First Commands
        </h3>
        <p>
          After installation, these commands help you confirm what you are
          running. The first prints distribution and release information:
        </p>
        <CodeBlock code="cat /etc/os-release" language="bash" title="bash" />
        <p>
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            cat /etc/os-release
          </code>{" "}
          can help identify the installed Linux distribution and release
          information.
        </p>
        <p>Then check the running kernel release:</p>
        <CodeBlock code="uname -r" language="bash" title="bash" />
        <p>
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            uname -r
          </code>{" "}
          displays the running Linux kernel release — the same core idea you met
          when learning what Linux is and how distributions package it.
        </p>
        <Callout title="Don't start by installing Linux on your main machine.">
          <p>
            If you&apos;re completely new to Linux, a virtual machine is often
            the easiest and safest way to experiment before changing your main
            computer.
          </p>
        </Callout>
      </LessonSection>

      <LessonSection id={summary.id} title={summary.title}>
        <p>Here is what you should take away from this lesson:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>There are multiple ways to run Linux.</li>
          <li>Virtual machines are useful for safe experimentation.</li>
          <li>Dual boot requires more care around disks and the bootloader.</li>
          <li>
            Physical installations involve storage and boot configuration.
          </li>
          <li>
            Servers and cloud machines often use different installation
            approaches.
          </li>
          <li>Backups are important before changing disks.</li>
          <li>The installation process varies by distribution.</li>
        </ul>
        <p>
          Next, you will meet the Linux terminal — the tool you will use
          constantly once a system is up and running.
        </p>
      </LessonSection>
    </>
  );
}
