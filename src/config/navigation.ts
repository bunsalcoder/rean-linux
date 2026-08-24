export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About" },
] as const;

export type MainNavItem = (typeof mainNav)[number];
