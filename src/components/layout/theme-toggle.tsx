"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-10 md:size-8"
      aria-label={
        isDark
          ? "Switch to light mode"
          : resolvedTheme === "light"
            ? "Switch to dark mode"
            : "Toggle color theme"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className="dark:hidden" aria-hidden="true" />
      <Moon className="hidden dark:block" aria-hidden="true" />
    </Button>
  );
}
