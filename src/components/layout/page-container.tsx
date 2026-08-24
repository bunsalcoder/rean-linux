import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Container
      width="narrow"
      className={cn("py-10 sm:py-14 md:py-16", className)}
    >
      {children}
    </Container>
  );
}
