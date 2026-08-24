import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { Container } from "@/components/layout/container";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Header() {
  return (
    <header className="bg-background/95 sticky top-0 z-50 border-b backdrop-blur-sm">
      <Container className="flex h-14 items-center gap-4 md:h-16">
        <Link
          href="/"
          className="text-foreground focus-visible:ring-ring flex shrink-0 rounded-md focus-visible:ring-2 focus-visible:outline-none"
        >
          <BrandMark />
        </Link>

        <MainNav />

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
