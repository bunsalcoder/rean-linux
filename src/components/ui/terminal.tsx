import type { ReactNode } from "react";

import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

export type TerminalLine = {
  command: string;
  output?: string;
};

type TerminalProps = {
  title?: string;
  language?: string;
  lines?: TerminalLine[];
  children?: ReactNode;
  className?: string;
};

function toCopyText(lines: readonly TerminalLine[]): string {
  return lines
    .flatMap((line) =>
      line.output ? [`$ ${line.command}`, line.output] : [`$ ${line.command}`],
    )
    .join("\n");
}

export function Terminal({
  title = "terminal",
  language = "bash",
  lines,
  children,
  className,
}: TerminalProps) {
  const copyText = lines ? toCopyText(lines) : undefined;

  return (
    <figure
      className={cn(
        "bg-terminal text-terminal-foreground overflow-hidden rounded-lg border",
        className,
      )}
    >
      <figcaption className="flex items-center gap-3 border-b px-3 py-2">
        <span className="flex gap-1" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-green-400/80" />
        </span>
        <span className="text-muted-foreground min-w-0 flex-1 truncate text-center font-mono text-xs">
          {title}
        </span>
        <span className="text-muted-foreground font-mono text-xs">
          {language}
        </span>
        {copyText ? (
          <CopyButton
            text={copyText}
            className="text-terminal-foreground hover:text-terminal-foreground hover:bg-white/10"
          />
        ) : null}
      </figcaption>
      <div className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
        {lines?.map((line, index) => (
          <div key={`${line.command}-${index}`} className="whitespace-pre">
            <div>
              <span className="text-prompt select-none" aria-hidden="true">
                ${" "}
              </span>
              <span>{line.command}</span>
            </div>
            {line.output ? (
              <div className="text-muted-foreground">{line.output}</div>
            ) : null}
          </div>
        ))}
        {children}
      </div>
    </figure>
  );
}
