export const siteConfig = {
  name: "rean-linux",
  tagline: "Learn Linux from zero to hero.",
  description:
    "Learn Linux from zero to hero through practical tutorials, guides, commands, projects, and real-world examples.",
  locale: "en",
} as const;

export function getSiteUrl(): URL {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
}
