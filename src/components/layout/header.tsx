import { Search } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { Container } from "@/components/layout/container";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-background/95 relative sticky top-0 z-50 border-b backdrop-blur-sm">
      <Container className="flex h-14 items-center gap-4 md:h-16">
        <Link
          href="/"
          className="text-foreground focus-visible:ring-ring flex shrink-0 rounded-md focus-visible:ring-2 focus-visible:outline-none"
        >
          <BrandMark />
        </Link>

        <MainNav />

        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 md:size-8"
            disabled
            aria-label="Search (coming soon)"
          >
            <Search aria-hidden="true" />
          </Button>
          <ThemeToggle />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
