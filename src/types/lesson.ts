import type { BreadcrumbItem } from "@/components/layout/breadcrumb";

export type LessonSection = {
  id: string;
  title: string;
};

export type LessonNavLink = {
  label: string;
  href: string;
};

export type LessonConfig = {
  title: string;
  description: string;
  levelNumber: string;
  level: string;
  readingTime: string;
  sections: readonly LessonSection[];
  breadcrumb: readonly BreadcrumbItem[];
  navigation: {
    previous?: LessonNavLink;
    next?: LessonNavLink;
  };
};
