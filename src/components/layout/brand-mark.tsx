import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

type BrandMarkProps = {
  className?: string;
  showName?: boolean;
};

export function BrandMark({ className, showName = true }: BrandMarkProps) {
  return (
    <span className={cn("text-[1.15rem] font-bold tracking-tight", className)}>
      {showName ? (
        <>
          <span className="text-black dark:text-white">rean</span>
          <span className="text-primary">-linux</span>
        </>
      ) : (
        <span className="sr-only">{siteConfig.name}</span>
      )}
    </span>
  );
}
