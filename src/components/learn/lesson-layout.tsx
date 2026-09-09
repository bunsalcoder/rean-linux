import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { LessonContent } from "@/components/learn/lesson-content";
import { LessonHeader } from "@/components/learn/lesson-header";
import { LessonNavigation } from "@/components/learn/lesson-navigation";
import {
  MobileTableOfContents,
  TableOfContents,
} from "@/components/learn/table-of-contents";
import { cn } from "@/lib/utils";
import { toLessonConfig, type Lesson } from "@/types/lesson";

type LessonLayoutProps = {
  lesson: Lesson;
  className?: string;
};

export function LessonLayout({ lesson, className }: LessonLayoutProps) {
  const config = toLessonConfig(lesson);

  return (
    <Container
      width="wide"
      className={cn("py-10 sm:py-14 md:py-16", className)}
    >
      <Breadcrumb items={config.breadcrumb} />

      <LessonHeader
        levelNumber={config.levelNumber}
        level={config.level}
        title={config.title}
        description={config.description}
        readingTime={config.readingTime}
      />

      <MobileTableOfContents sections={config.sections} className="mt-8" />

      <div className="mt-8 lg:mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,42rem)_14rem] xl:gap-14">
        <article className="min-w-0 space-y-10 sm:space-y-12 lg:max-w-none xl:max-w-[42rem]">
          <LessonContent lesson={lesson} />
        </article>

        <aside className="hidden lg:block">
          <TableOfContents
            sections={config.sections}
            className="sticky top-24"
          />
        </aside>
      </div>

      <LessonNavigation
        previous={config.navigation.previous}
        next={config.navigation.next}
      />
    </Container>
  );
}
