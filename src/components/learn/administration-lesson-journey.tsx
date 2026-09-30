import { LessonItem } from "@/components/learn/lesson-item";
import { administrationLessons } from "@/config/administration";

export function AdministrationLessonJourney() {
  return (
    <ol
      aria-label="Linux Administration lessons in planned order"
      className="relative mt-6 sm:mt-8"
    >
      {administrationLessons.map((lesson, index) => (
        <LessonItem
          key={lesson.slug}
          lesson={lesson}
          isLast={index === administrationLessons.length - 1}
        />
      ))}
    </ol>
  );
}
