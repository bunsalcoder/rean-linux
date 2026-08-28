import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { Container } from "@/components/layout/container";
import { Separator } from "@/components/ui/separator";
import { footerNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const footerLinkClassName =
  "text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-block rounded-sm py-0.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t">
      <Container className="py-10 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.25fr)_repeat(2,minmax(0,1fr))] lg:gap-10">
          <div className="max-w-xs sm:col-span-2 lg:col-span-1">
            <BrandMark />
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              {siteConfig.tagline}
            </p>
          </div>

          {footerNav.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="text-sm font-semibold tracking-tight">
                {section.title}
              </h2>
              <ul className="mt-3 space-y-1.5">
                {section.items.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <Link href={item.href} className={footerLinkClassName}>
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground/70 text-sm">
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <Separator className="my-8" />

        <div
          className={cn(
            "text-muted-foreground flex flex-col gap-2 text-sm",
            "sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <p>© {year} Rean Linux. All rights reserved.</p>
          <p>Built for Linux learners.</p>
        </div>
      </Container>
    </footer>
  );
}
