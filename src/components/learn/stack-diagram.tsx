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
