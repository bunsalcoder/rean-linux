import { cn } from "@/lib/utils";

const lines = [
  { command: "whoami", output: "linux-learner" },
  { command: "pwd", output: "/home/learner" },
  { command: 'echo "Hello, Linux!"', output: "Hello, Linux!" },
] as const;

type HeroTerminalProps = {
  className?: string;
};

export function HeroTerminal({ className }: HeroTerminalProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-terminal text-terminal-foreground min-w-0 overflow-hidden rounded-lg border shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-3 py-2">
        <span className="flex gap-1">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-green-400/80" />
        </span>
        <span className="min-w-0 flex-1 truncate text-center font-mono text-xs text-white/50">
          learner@rean:~
        </span>
        <span className="font-mono text-xs text-white/40">bash</span>
      </div>
      <div className="overflow-x-auto p-4 font-mono text-xs leading-relaxed sm:text-sm">
        {lines.map((line) => (
          <div key={line.command} className="mb-3 last:mb-0">
            <div>
              <span className="text-prompt select-none">$ </span>
              <span>{line.command}</span>
            </div>
            <div className="text-terminal-foreground/70">{line.output}</div>
          </div>
        ))}
        <div>
          <span className="text-prompt select-none">$ </span>
          <span className="bg-prompt ml-0.5 inline-block h-3.5 w-1.5 align-middle sm:h-4" />
        </div>
      </div>
    </div>
  );
}
