export const mainNav = [
  { href: "/learn", label: "Learn" },
  { href: "/guides", label: "Guides" },
  { href: "/commands", label: "Commands" },
  { href: "/about", label: "About" },
] as const;

export type MainNavItem = (typeof mainNav)[number];

export type FooterNavItem = {
  label: string;
  href?: string;
};

export type FooterNavSection = {
  title: string;
  items: readonly FooterNavItem[];
};

export const footerNav: readonly FooterNavSection[] = [
  {
    title: "Learning",
    items: [
      { href: "/learn", label: "Learn" },
      { href: "/guides", label: "Guides" },
      { href: "/commands", label: "Commands" },
      { label: "Projects" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Linux Documentation" },
      { label: "Cheatsheets" },
      { label: "Community" },
    ],
  },
  {
    title: "About",
    items: [{ href: "/about", label: "About Rean Linux" }],
  },
];
