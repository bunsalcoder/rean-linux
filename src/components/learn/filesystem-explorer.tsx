"use client";

import { ChevronRight, FileText, Folder } from "lucide-react";
import { useId, useState } from "react";

import {
  createFilesystemLessonFs,
  listDirectoryChildren,
  type SimulatedFsState,
  type SimulatedNode,
} from "@/lib/simulated-filesystem";
import { cn } from "@/lib/utils";

type FilesystemExplorerProps = {
  filesystem?: SimulatedFsState;
  className?: string;
};

function nodeLabel(name: string, node: SimulatedNode): string {
  return node.type === "directory" ? `${name}/` : name;
}

function ExplorerTreeRow({
  state,
  path,
  name,
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  state: SimulatedFsState;
  path: string;
  name: string;
  node: SimulatedNode;
  depth: number;
  selectedPath: string;
  onSelect: (path: string, node: SimulatedNode) => void;
}) {
  const isDirectory = node.type === "directory";
  const [expanded, setExpanded] = useState(depth < 2);
  const selected = selectedPath === path;
  const children =
    isDirectory && expanded ? listDirectoryChildren(state, path) : [];

  return (
    <li
      role="treeitem"
      aria-expanded={isDirectory ? expanded : undefined}
      aria-selected={selected}
    >
      <button
        type="button"
        onClick={() => {
          onSelect(path, node);
          if (isDirectory) {
            setExpanded((value) => (selected ? !value : true));
          }
        }}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "focus-visible:ring-ring flex w-full min-w-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-left font-mono text-sm transition-colors",
          "focus-visible:ring-2 focus-visible:outline-none",
          selected
            ? "bg-primary/10 text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
        style={{ paddingLeft: `${0.5 + depth * 0.85}rem` }}
      >
        {isDirectory ? (
          <ChevronRight
            aria-hidden="true"
            className={cn(
              "text-muted-foreground size-3.5 shrink-0 transition-transform",
              expanded && "rotate-90",
            )}
          />
        ) : (
          <span className="size-3.5 shrink-0" aria-hidden="true" />
        )}
        {isDirectory ? (
          <Folder aria-hidden="true" className="size-3.5 shrink-0" />
        ) : (
          <FileText aria-hidden="true" className="size-3.5 shrink-0" />
        )}
        <span className="min-w-0 truncate">{nodeLabel(name, node)}</span>
        <span className="sr-only">
          {isDirectory ? "Directory" : "File"} at {path}
        </span>
      </button>
      {children.length > 0 ? (
        <ul className="list-none" role="group">
          {children.map((child) => (
            <ExplorerTreeRow
              key={child.path}
              state={state}
              path={child.path}
              name={child.name}
              node={child.node}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function FilesystemExplorer({
  filesystem,
  className,
}: FilesystemExplorerProps) {
  const labelId = useId();
  const pathId = useId();
  const state = filesystem ?? createFilesystemLessonFs();
  const [selectedPath, setSelectedPath] = useState("/");
  const selectedNode = state.nodes[selectedPath] ?? {
    type: "directory" as const,
  };
  const children =
    selectedNode.type === "directory"
      ? listDirectoryChildren(state, selectedPath)
      : [];

  return (
    <div
      className={cn(
        "border-border bg-muted/30 overflow-hidden rounded-lg border",
        className,
      )}
    >
      <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <p
          id={labelId}
          className="text-foreground font-mono text-xs font-medium tracking-[0.12em] uppercase"
        >
          Filesystem explorer
        </p>
        <p
          id={pathId}
          className="text-muted-foreground min-w-0 font-mono text-xs break-all"
        >
          <span className="sr-only">Selected path: </span>
          {selectedPath}
        </p>
      </div>

      <div className="grid gap-0 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div
          className="border-border max-h-72 overflow-auto p-2 sm:border-r"
          role="tree"
          aria-labelledby={labelId}
        >
          <ul className="list-none" role="group">
            <ExplorerTreeRow
              state={state}
              path="/"
              name="/"
              node={{ type: "directory" }}
              depth={0}
              selectedPath={selectedPath}
              onSelect={(path) => setSelectedPath(path)}
            />
          </ul>
        </div>

        <div className="p-4" aria-labelledby={pathId}>
          <p className="text-foreground font-mono text-sm font-medium break-all">
            {selectedPath}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {selectedNode.type === "directory" ? "Directory" : "File"}
          </p>
          {selectedNode.type === "directory" ? (
            children.length > 0 ? (
              <ul className="mt-3 space-y-1.5 font-mono text-sm">
                {children.map((child) => (
                  <li key={child.path} className="text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => setSelectedPath(child.path)}
                      className="hover:text-foreground focus-visible:ring-ring rounded px-1 py-0.5 text-left focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {nodeLabel(child.name, child.node)}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground mt-3 text-sm">
                This directory is empty in the simulator.
              </p>
            )
          ) : selectedNode.type === "file" ? (
            <p className="text-muted-foreground mt-3 text-sm break-words whitespace-pre-wrap">
              {selectedNode.content || "(empty file)"}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
