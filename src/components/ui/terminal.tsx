import type { ReactNode } from "react";

import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

export type TerminalLine = {
  command: string;
  output?: string;
  note?: string;
};

type TerminalProps = {
  title?: string;
  language?: string;
  lines?: TerminalLine[];
  children?: ReactNode;
  className?: string;
  copyLabel?: string;
};

function toCopyText(lines: readonly TerminalLine[]): string {
  return lines
    .flatMap((line) => {
      const blocks: string[] = [];
      if (line.note) {
        blocks.push(`# ${line.note}`);
      }
      blocks.push(`$ ${line.command}`);
      if (line.output) {
        blocks.push(line.output);
      }
      return blocks;
    })
    .join("\n");
}

export function Terminal({
  title = "terminal",
  language = "bash",
  lines,
  children,
  className,
  copyLabel,
}: TerminalProps) {
  const copyText = lines ? toCopyText(lines) : undefined;

  return (
    <figure
      className={cn(
        "bg-terminal text-terminal-foreground flex min-w-0 flex-col overflow-hidden rounded-lg border",
        className,
      )}
    >
      <figcaption className="flex items-center gap-3 border-b border-white/10 px-3 py-2">
        <span className="flex shrink-0 gap-1" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-green-400/80" />
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-white/50">
          {title}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="font-mono text-xs text-white/40">{language}</span>
          {copyText ? (
            <CopyButton
              text={copyText}
              label={copyLabel}
              className="text-terminal-foreground/80 hover:text-terminal-foreground size-10 hover:bg-white/10 sm:size-6"
            />
          ) : null}
        </div>
      </figcaption>
      <div className="flex-1 overflow-x-auto p-4 font-mono text-sm leading-relaxed">
        {lines?.map((line, index) => (
          <div
            key={`${line.command}-${index}`}
            className="mb-4 whitespace-pre last:mb-0"
          >
            {line.note ? (
              <p className="mb-1 font-sans text-xs text-pretty whitespace-normal text-white/45">
                {line.note}
              </p>
            ) : null}
            <div>
              <span className="text-prompt select-none" aria-hidden="true">
                ${" "}
              </span>
              <span>{line.command}</span>
            </div>
            {line.output ? (
              <div className="text-terminal-foreground/70">{line.output}</div>
            ) : null}
          </div>
        ))}
        {children}
      </div>
    </figure>
  );
}
