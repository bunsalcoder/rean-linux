export const CONTENT_CATEGORY_SLUGS = [
  "linux-basics",
  "terminal",
  "filesystem",
  "networking",
  "administration",
  "devops",
  "security",
] as const;

export type ContentCategorySlug = (typeof CONTENT_CATEGORY_SLUGS)[number];

export type ContentFrontmatter = {
  title: string;
  description: string;
  category: ContentCategorySlug;
  slug: string;
};
