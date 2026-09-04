import { cn } from "@/lib/utils";

type StackDiagramProps = {
  layers: readonly string[];
  ariaLabel: string;
  className?: string;
};

export function StackDiagram({
  layers,
  ariaLabel,
  className,
}: StackDiagramProps) {
  return (
    <figure
      className={cn(
        "border-border bg-muted/30 my-6 overflow-hidden rounded-lg border",
        className,
      )}
    >
      <div
        role="img"
        aria-label={ariaLabel}
        className="flex flex-col items-center gap-2 px-4 py-6 sm:px-6"
      >
        {layers.map((layer, index) => (
          <div
            key={layer}
            className="flex w-full max-w-xs flex-col items-center"
          >
            <div className="border-border bg-background text-foreground w-full rounded-md border px-4 py-2.5 text-center font-mono text-sm">
              {layer}
            </div>
            {index < layers.length - 1 ? (
              <span
                aria-hidden="true"
                className="text-muted-foreground py-1 font-mono text-sm"
              >
                ↓
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <figcaption className="sr-only">{ariaLabel}</figcaption>
    </figure>
  );
}

type CompositionDiagramProps = {
  components: readonly string[];
  result: string;
  ariaLabel: string;
  className?: string;
};

export function CompositionDiagram({
  components,
  result,
  ariaLabel,
  className,
}: CompositionDiagramProps) {
  return (
    <figure
      className={cn(
        "border-border bg-muted/30 my-6 overflow-hidden rounded-lg border",
        className,
      )}
    >
      <div
        role="img"
        aria-label={ariaLabel}
        className="flex flex-col items-center gap-2 px-4 py-6 sm:px-6"
      >
        {components.map((component, index) => (
          <div
            key={component}
            className="flex w-full max-w-xs flex-col items-center"
          >
            <div className="border-border bg-background text-foreground w-full rounded-md border px-4 py-2.5 text-center font-mono text-sm">
              {component}
            </div>
            {index < components.length - 1 ? (
              <span
                aria-hidden="true"
                className="text-muted-foreground py-1 font-mono text-lg leading-none"
              >
                +
              </span>
            ) : null}
          </div>
        ))}
        <span
          aria-hidden="true"
          className="text-muted-foreground py-1 font-mono text-sm"
        >
          ↓
        </span>
        <div className="border-primary/30 bg-primary/5 text-foreground w-full max-w-xs rounded-md border px-4 py-2.5 text-center font-mono text-sm font-medium">
          {result}
        </div>
      </div>
      <figcaption className="sr-only">{ariaLabel}</figcaption>
    </figure>
  );
}

export type TreeNode = {
  label: string;
  children?: readonly TreeNode[];
};

type TreeDiagramProps = {
  root: TreeNode;
  ariaLabel: string;
  className?: string;
};

function TreeBranch({
  node,
  isRoot = false,
}: {
  node: TreeNode;
  isRoot?: boolean;
}) {
  const children = node.children ?? [];

  return (
    <li className={cn(!isRoot && "mt-2")}>
      <div
        className={cn(
          "border-border bg-background text-foreground inline-block rounded-md border px-3 py-2 font-mono text-sm",
          isRoot && "border-primary/30 bg-primary/5 font-medium",
        )}
      >
        {node.label}
      </div>
      {children.length > 0 ? (
        <ul className="border-border mt-2 space-y-0 border-l pl-4 sm:pl-5">
          {children.map((child) => (
            <TreeBranch key={child.label} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function TreeDiagram({ root, ariaLabel, className }: TreeDiagramProps) {
  return (
    <figure
      className={cn(
        "border-border bg-muted/30 my-6 overflow-hidden rounded-lg border",
        className,
      )}
    >
      <div role="img" aria-label={ariaLabel} className="px-4 py-6 sm:px-6">
        <ul className="list-none">
          <TreeBranch node={root} isRoot />
        </ul>
      </div>
      <figcaption className="sr-only">{ariaLabel}</figcaption>
    </figure>
  );
}
