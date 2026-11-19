import { LessonItem } from "@/components/learn/lesson-item";
import { performanceLessons } from "@/config/performance";

export function PerformanceLessonJourney() {
  return (
    <ol
      aria-label="Linux Performance and Troubleshooting lessons in planned order"
      className="relative mt-6 sm:mt-8"
    >
      {performanceLessons.map((lesson, index) => (
        <LessonItem
          key={lesson.slug}
          lesson={lesson}
          isLast={index === performanceLessons.length - 1}
        />
      ))}
    </ol>
  );
}
