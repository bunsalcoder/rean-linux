import type { ReactNode } from "react";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { LessonHeader } from "@/components/learn/lesson-header";
import { LessonNavigation } from "@/components/learn/lesson-navigation";
import {
  MobileTableOfContents,
  TableOfContents,
} from "@/components/learn/table-of-contents";
import { cn } from "@/lib/utils";
import type { LessonConfig } from "@/types/lesson";

type LessonLayoutProps = {
  lesson: LessonConfig;
  children: ReactNode;
  className?: string;
};

export function LessonLayout({
  lesson,
  children,
  className,
}: LessonLayoutProps) {
  return (
    <Container
      width="wide"
      className={cn("py-10 sm:py-14 md:py-16", className)}
    >
      <Breadcrumb items={lesson.breadcrumb} />

      <LessonHeader
        levelNumber={lesson.levelNumber}
        level={lesson.level}
        title={lesson.title}
        description={lesson.description}
        readingTime={lesson.readingTime}
      />

      <MobileTableOfContents sections={lesson.sections} className="mt-8" />

      <div className="mt-8 lg:mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,42rem)_14rem] xl:gap-14">
        <article className="min-w-0 space-y-10 sm:space-y-12 lg:max-w-none xl:max-w-[42rem]">
          {children}
        </article>

        <aside className="hidden lg:block">
          <TableOfContents
            sections={lesson.sections}
            className="sticky top-24"
          />
        </aside>
      </div>

      <LessonNavigation
        previous={lesson.navigation.previous}
        next={lesson.navigation.next}
      />
    </Container>
  );
}
