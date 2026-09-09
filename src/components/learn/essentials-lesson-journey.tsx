import { LessonItem } from "@/components/learn/lesson-item";
import { essentialsLessons } from "@/config/essentials";

export function EssentialsLessonJourney() {
  return (
    <ol
      aria-label="Linux Essentials lessons in planned order"
      className="relative mt-6 sm:mt-8"
    >
      {essentialsLessons.map((lesson, index) => (
        <LessonItem
          key={lesson.slug}
          lesson={lesson}
          isLast={index === essentialsLessons.length - 1}
        />
      ))}
    </ol>
  );
}
