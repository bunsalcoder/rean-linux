import { Search, SquareTerminal } from "lucide-react";
import Link from "next/link";

import { MainNav } from "@/components/layout/main-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-foreground focus-visible:ring-ring flex shrink-0 items-center gap-2 rounded-md font-semibold tracking-tight focus-visible:ring-2 focus-visible:outline-none"
        >
          <SquareTerminal className="size-5" aria-hidden="true" />
          <span>{siteConfig.name}</span>
        </Link>

        <MainNav />

        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled
            aria-label="Search (coming soon)"
          >
            <Search aria-hidden="true" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
