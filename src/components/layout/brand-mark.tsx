import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

type BrandMarkProps = {
  className?: string;
  showName?: boolean;
};

export function BrandMark({ className, showName = true }: BrandMarkProps) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-md font-mono text-sm font-semibold"
      >
        $
      </span>
      {showName ? (
        <span className="font-semibold tracking-tight">{siteConfig.name}</span>
      ) : (
        <span className="sr-only">{siteConfig.name}</span>
      )}
    </span>
  );
}
