import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";

export function MobileNav() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-10 md:hidden"
      aria-label="Open menu"
    >
      <Menu aria-hidden="true" />
    </Button>
  );
}
