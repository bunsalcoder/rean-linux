"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { NavLink } from "@/components/layout/nav-link";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/config/navigation";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-10"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>

      {open ? (
        <>
          <div
            aria-hidden="true"
            className="bg-background/80 absolute inset-x-0 top-full z-40 h-dvh backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div
            id={menuId}
            className="bg-background absolute inset-x-0 top-full z-50 border-b"
          >
            <nav aria-label="Mobile" className="px-4 py-3 sm:px-6">
              <ul className="flex flex-col gap-1">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      href={item.href}
                      className="block w-full px-3 py-2.5"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
