import { LessonItem } from "@/components/learn/lesson-item";
import { beginnerLessons } from "@/config/beginner";

export function BeginnerLessonJourney() {
  return (
    <ol
      aria-label="Beginner lessons in recommended order"
      className="relative mt-6 sm:mt-8"
    >
      {beginnerLessons.map((lesson, index) => (
        <LessonItem
          key={lesson.href}
          lesson={lesson}
          isLast={index === beginnerLessons.length - 1}
        />
      ))}
    </ol>
  );
}
