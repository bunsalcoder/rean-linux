import { Callout } from "@/components/learn/callout";
import { LessonSection } from "@/components/learn/lesson-section";
import { StackDiagram } from "@/components/learn/stack-diagram";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { CodeBlock } from "@/components/ui/code-block";
import { TERMINAL_SECTIONS } from "@/content/beginner/terminal";

export function TerminalContent() {
  const {
    whatIs,
    vsShell,
    whyUse,
    firstCommands,
    structure,
    tryIt,
    tips,
    summary,
  } = TERMINAL_SECTIONS;

  return (
    <>
      <LessonSection id={whatIs.id} title={whatIs.title}>
        <p>
          A <strong className="text-foreground">terminal</strong> is a
          text-based interface that lets you interact with a computer by typing
          commands. Instead of clicking buttons and menus, you tell the system
          what to do with short lines of text.
        </p>
        <p>
          When you open a terminal window, you are looking at a place where you
          can type instructions. Those instructions are passed to a program that
          understands them, and that program asks the operating system to carry
          out the work.
        </p>
        <StackDiagram
          ariaLabel="Conceptual flow from you through the terminal, shell, Linux kernel, and hardware"
          layers={["You", "Terminal", "Shell", "Linux Kernel", "Hardware"]}
        />
        <p>
          The terminal itself is not the shell. It is the window or application
          where you type. The shell is the program that interprets what you
          type. Keeping those two ideas separate will make later lessons easier.
        </p>
      </LessonSection>

      <LessonSection id={vsShell.id} title={vsShell.title}>
        <p>
          Beginners often use &ldquo;terminal&rdquo; and &ldquo;shell&rdquo;
          interchangeably. They work closely together, but they are not the same
          thing.
        </p>

        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Terminal
        </h3>
        <p>
          The terminal is the application or interface where you interact with a
          command-line environment. Common examples include:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>GNOME Terminal</li>
          <li>Konsole</li>
          <li>Windows Terminal</li>
          <li>
            Built-in terminal apps inside desktop environments and code editors
          </li>
        </ul>

        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Shell
        </h3>
        <p>
          The shell is the program that interprets your commands. Popular shells
          include:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Bash</li>
          <li>Zsh</li>
          <li>Fish</li>
        </ul>

        <StackDiagram
          ariaLabel="Conceptual flow from terminal through shell and commands to the operating system"
          layers={["Terminal", "Shell", "Commands", "Operating System"]}
        />
        <p>
          In practice, you open a terminal, the shell presents a prompt, and you
          type commands. You do not need deep shell internals yet — just
          remember that the terminal is the interface and the shell is the
          interpreter.
        </p>
      </LessonSection>

      <LessonSection id={whyUse.id} title={whyUse.title}>
        <p>
          Linux users rely on the terminal because it is often faster and more
          precise than clicking through menus. It also unlocks tools that are
          difficult or impossible to use through a graphical interface alone.
        </p>
        <p>Practical advantages include:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Fast interaction</strong> —
            short commands can replace many clicks
          </li>
          <li>
            <strong className="text-foreground">Automation</strong> — you can
            repeat and combine commands as scripts
          </li>
          <li>
            <strong className="text-foreground">
              Remote server administration
            </strong>{" "}
            — many servers are managed over SSH with no desktop at all
          </li>
          <li>
            <strong className="text-foreground">Powerful system tools</strong> —
            package managers, logs, services, and diagnostics live in the CLI
          </li>
          <li>
            <strong className="text-foreground">Reproducible commands</strong> —
            the same line can be shared, documented, and run again later
          </li>
          <li>
            <strong className="text-foreground">
              Working without a graphical interface
            </strong>{" "}
            — useful on servers, containers, and minimal installs
          </li>
        </ul>
        <p>
          You do not need to memorize everything. Start with a few commands,
          understand the pattern, and build confidence through practice.
        </p>
      </LessonSection>

      <LessonSection id={firstCommands.id} title={firstCommands.title}>
        <p>
          These commands are safe, common starting points. Each one does one
          clear job.
        </p>

        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          <code className="font-mono">pwd</code>
        </h3>
        <p>Print the current directory — where you are in the filesystem.</p>
        <CodeBlock code="pwd" language="bash" title="bash" />

        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          <code className="font-mono">ls</code>
        </h3>
        <p>List files and directories in the current location.</p>
        <CodeBlock code="ls" language="bash" title="bash" />

        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          <code className="font-mono">whoami</code>
        </h3>
        <p>Show the current user account name.</p>
        <CodeBlock code="whoami" language="bash" title="bash" />

        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          <code className="font-mono">date</code>
        </h3>
        <p>Display the current date and time.</p>
        <CodeBlock code="date" language="bash" title="bash" />

        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          <code className="font-mono">echo</code>
        </h3>
        <p>Print text to the terminal. Useful for messages and simple checks.</p>
        <CodeBlock code='echo "Hello Linux"' language="bash" title="bash" />
      </LessonSection>

      <LessonSection id={structure.id} title={structure.title}>
        <p>
          Most commands follow a simple pattern. Once you see the structure, new
          commands become easier to read.
        </p>
        <CodeBlock
          code="command [options] [arguments]"
          language="text"
          title="structure"
        />
        <p>Here is a concrete example:</p>
        <CodeBlock code="ls -la /home" language="bash" title="bash" />
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              ls
            </code>{" "}
            → the command
          </li>
          <li>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              -la
            </code>{" "}
            → options that change how the command behaves
          </li>
          <li>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              /home
            </code>{" "}
            → an argument (in this case, a path)
          </li>
        </ul>
        <p>
          Not every command needs options or arguments. Commands like{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            pwd
          </code>{" "}
          and{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            whoami
          </code>{" "}
          often work on their own.
        </p>
      </LessonSection>

      <LessonSection id={tryIt.id} title={tryIt.title}>
        <p>
          Experiment with the commands you&apos;ve just learned. This terminal is
          simulated, so you can safely explore.
        </p>
        <TerminalSimulator />
      </LessonSection>

      <LessonSection id={tips.id} title={tips.title}>
        <Callout title="Tip">
          <p>
            Don&apos;t worry if commands feel unfamiliar. Linux becomes easier
            as you use the terminal regularly.
          </p>
        </Callout>
      </LessonSection>

      <LessonSection id={summary.id} title={summary.title}>
        <p>In this lesson, you learned that:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            A terminal is a text-based interface for entering commands
          </li>
          <li>
            A shell is the program that interprets those commands
          </li>
          <li>
            The terminal and the shell work together, but they are different
            pieces
          </li>
          <li>
            Linux users rely on the command line for speed, automation, remote
            work, and systems without a desktop
          </li>
          <li>
            Commands usually follow the pattern{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              command [options] [arguments]
            </code>
          </li>
          <li>
            A few basics —{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              pwd
            </code>
            ,{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              ls
            </code>
            ,{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              whoami
            </code>
            ,{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              date
            </code>
            , and{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              echo
            </code>{" "}
            — are enough to start exploring
          </li>
          <li>
            The Rean Linux terminal on this page is a safe frontend simulation,
            not a real shell on your machine
          </li>
        </ul>
        <p>
          Next, you will practice essential commands in more depth and start
          navigating a Linux system with confidence.
        </p>
      </LessonSection>
    </>
  );
}
