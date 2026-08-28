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
    title: "Learn",
    items: [
      { href: "/learn", label: "Learning Path" },
      { href: "/learn/fundamentals", label: "Linux Fundamentals" },
      { href: "/learn/terminal", label: "Terminal & Commands" },
      { href: "/learn/filesystem", label: "Filesystem" },
      { href: "/learn/networking", label: "Networking" },
    ],
  },
  {
    title: "Resources",
    items: [
      { href: "/guides", label: "Guides" },
      { href: "/commands", label: "Commands" },
      { href: "/about", label: "About" },
    ],
  },
];
