import { mainNav } from "@/config/navigation";

import { NavLink } from "@/components/layout/nav-link";

export function MainNav() {
  return (
    <nav aria-label="Primary" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {mainNav.map((item) => (
          <li key={item.href}>
            <NavLink href={item.href}>{item.label}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
