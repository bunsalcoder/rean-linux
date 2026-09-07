"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { simulateTerminalCommand } from "@/lib/simulate-terminal-command";
import {
  createLearnerHomeFs,
  formatTerminalPrompt,
  simulateFsCommand,
  type SimulatedFsState,
} from "@/lib/simulated-filesystem";
import { cn } from "@/lib/utils";

const DEFAULT_SUGGESTIONS = [
  "pwd",
  "ls",
  "whoami",
  "date",
  'echo "Hello Linux"',
  "help",
] as const;

const DEFAULT_FS_SUGGESTIONS = ["pwd", "ls", "ls -la", "help"] as const;

type HistoryEntry = {
  command: string;
  output: readonly string[];
  prompt: string;
};

export type TerminalSuggestion =
  | string
  | {
      command: string;
      label?: string;
    };

type TerminalSimulatorProps = {
  className?: string;
  title?: string;
  suggestions?: readonly TerminalSuggestion[];
  /**
   * Enable the in-memory filesystem command set (pwd/ls/cd/mkdir/...).
   * When omitted, the simpler Lesson 04 command set is used.
   */
  filesystem?: boolean | SimulatedFsState;
  onFsChange?: (state: SimulatedFsState) => void;
  onCommand?: (command: string, state: SimulatedFsState) => void;
  suggestionsLabel?: string;
};

const emptySubscribe = () => () => {};

function suggestionCommand(suggestion: TerminalSuggestion): string {
  return typeof suggestion === "string" ? suggestion : suggestion.command;
}

function suggestionLabel(suggestion: TerminalSuggestion): string {
  if (typeof suggestion === "string") {
    return suggestion;
  }
  return suggestion.label ?? suggestion.command;
}

function resolveInitialFs(
  filesystem: boolean | SimulatedFsState | undefined,
): SimulatedFsState | null {
  if (!filesystem) {
    return null;
  }
  if (filesystem === true) {
    return createLearnerHomeFs();
  }
  return {
    cwd: filesystem.cwd,
    nodes: { ...filesystem.nodes },
  };
}

function TerminalShellFrame({
  title,
  className,
  headerAction,
  children,
}: {
  title: string;
  className?: string;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-terminal text-terminal-foreground flex min-w-0 flex-col overflow-hidden rounded-lg border",
        className,
      )}
      role="region"
      aria-label="Learning terminal simulator"
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-3 py-2">
        <span className="flex shrink-0 gap-1" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-green-400/80" />
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-white/50">
          {title}
        </span>
        {headerAction}
      </div>
      {children}
    </div>
  );
}

export function TerminalSimulator({
  className,
  title = "rean-linux",
  suggestions,
  filesystem,
  onFsChange,
  onCommand,
  suggestionsLabel = "Try a command",
}: TerminalSimulatorProps) {
  const inputId = useId();
  const outputId = useId();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [fsState, setFsState] = useState<SimulatedFsState | null>(() =>
    resolveInitialFs(filesystem),
  );
  const fsRef = useRef(fsState);
  const onFsChangeRef = useRef(onFsChange);
  const onCommandRef = useRef(onCommand);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const useFilesystem = fsState !== null;
  const resolvedSuggestions =
    suggestions ??
    (useFilesystem ? DEFAULT_FS_SUGGESTIONS : DEFAULT_SUGGESTIONS);
  const prompt = formatTerminalPrompt(fsState?.cwd ?? "/home/learner");

  useEffect(() => {
    onFsChangeRef.current = onFsChange;
  }, [onFsChange]);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [history, currentInput, mounted]);

  if (!mounted) {
    return (
      <div className={cn("min-w-0 space-y-3", className)}>
        <TerminalShellFrame title={title}>
          <div className="max-h-[min(22rem,55vh)] min-h-[12rem] p-3 font-mono text-sm leading-relaxed sm:max-h-[min(26rem,60vh)] sm:p-4">
            <span className="text-prompt select-none" aria-hidden="true">
              {formatTerminalPrompt("/home/learner")}
            </span>
            <span className="sr-only">Loading interactive terminal</span>
          </div>
        </TerminalShellFrame>
      </div>
    );
  }

  function runCommand(raw: string) {
    const trimmed = raw.trim();
    const currentFs = fsRef.current;
    const currentPrompt = formatTerminalPrompt(
      currentFs?.cwd ?? "/home/learner",
    );

    if (trimmed) {
      setCommandHistory((prev) =>
        prev[prev.length - 1] === trimmed ? prev : [...prev, trimmed],
      );
    }
    setHistoryIndex(null);
    setCurrentInput("");

    if (currentFs) {
      const { result, state } = simulateFsCommand(raw, currentFs);
      fsRef.current = state;
      setFsState(state);
      onFsChangeRef.current?.(state);
      if (trimmed) {
        onCommandRef.current?.(trimmed, state);
      }

      if (result.kind === "clear") {
        setHistory([]);
        return;
      }

      if (result.kind === "empty") {
        setHistory((prev) => [
          ...prev,
          { command: "", output: [], prompt: currentPrompt },
        ]);
        return;
      }

      setHistory((prev) => [
        ...prev,
        { command: raw, output: result.lines, prompt: currentPrompt },
      ]);
      return;
    }

    const result = simulateTerminalCommand(raw);

    if (result.kind === "clear") {
      setHistory([]);
      return;
    }

    if (result.kind === "empty") {
      setHistory((prev) => [
        ...prev,
        { command: "", output: [], prompt: currentPrompt },
      ]);
      return;
    }

    setHistory((prev) => [
      ...prev,
      { command: raw, output: result.lines, prompt: currentPrompt },
    ]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runCommand(currentInput);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      runCommand(currentInput);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (commandHistory.length === 0) {
        return;
      }

      const nextIndex =
        historyIndex === null
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);

      setHistoryIndex(nextIndex);
      setCurrentInput(commandHistory[nextIndex] ?? "");
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === null) {
        return;
      }

      if (historyIndex >= commandHistory.length - 1) {
        setHistoryIndex(null);
        setCurrentInput("");
        return;
      }

      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setCurrentInput(commandHistory[nextIndex] ?? "");
    }
  }

  function handleClear() {
    setHistory([]);
    setCurrentInput("");
    setHistoryIndex(null);
    inputRef.current?.focus();
  }

  function handleSuggestion(command: string) {
    runCommand(command);
    inputRef.current?.focus();
  }

  return (
    <div className={cn("min-w-0 space-y-3", className)}>
      <TerminalShellFrame
        title={title}
        headerAction={
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleClear}
            className="text-terminal-foreground/80 hover:text-terminal-foreground h-7 shrink-0 px-2 font-mono text-xs hover:bg-white/10"
          >
            Clear
          </Button>
        }
      >
        <div
          id={outputId}
          className="max-h-[min(22rem,55vh)] min-h-[12rem] overflow-x-auto overflow-y-auto p-3 font-mono text-sm leading-relaxed sm:max-h-[min(26rem,60vh)] sm:p-4"
          aria-live="polite"
          aria-relevant="additions"
        >
          {history.map((entry, index) => (
            <div key={`${entry.command}-${index}`} className="mb-3 last:mb-0">
              <div className="break-all whitespace-pre-wrap">
                <span className="text-prompt select-none" aria-hidden="true">
                  {entry.prompt}{" "}
                </span>
                <span className="sr-only">
                  Prompt: {entry.prompt}. Command:{" "}
                </span>
                <span>{entry.command}</span>
              </div>
              {entry.output.length > 0 ? (
                <div className="text-terminal-foreground/75 mt-0.5 break-all whitespace-pre-wrap">
                  {entry.output.join("\n")}
                </div>
              ) : null}
            </div>
          ))}

          <form
            onSubmit={handleSubmit}
            className="flex min-w-0 items-start gap-2"
          >
            <label htmlFor={inputId} className="sr-only">
              Terminal command
            </label>
            <span
              className="text-prompt shrink-0 select-none"
              aria-hidden="true"
            >
              {prompt}
            </span>
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              value={currentInput}
              onChange={(event) => {
                setCurrentInput(event.target.value);
                setHistoryIndex(null);
              }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-describedby={outputId}
              className="text-terminal-foreground caret-prompt min-w-0 flex-1 bg-transparent font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            />
          </form>
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </TerminalShellFrame>

      {resolvedSuggestions.length > 0 ? (
        <div>
          <p className="text-muted-foreground font-mono text-xs tracking-[0.08em] uppercase">
            {suggestionsLabel}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {resolvedSuggestions.map((suggestion) => {
              const command = suggestionCommand(suggestion);
              const label = suggestionLabel(suggestion);
              return (
                <li key={`${command}-${label}`}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestion(command)}
                    className="min-h-10 font-mono sm:min-h-8"
                    aria-label={`Run simulated command: ${command}`}
                  >
                    {label}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
