import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "text-primary rounded-sm font-medium underline-offset-4 hover:underline",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}
