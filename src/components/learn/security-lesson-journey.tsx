import { LessonItem } from "@/components/learn/lesson-item";
import { securityLessons } from "@/config/security";

export function SecurityLessonJourney() {
  return (
    <ol
      aria-label="Linux Security and Hardening lessons in planned order"
      className="relative mt-6 sm:mt-8"
    >
      {securityLessons.map((lesson, index) => (
        <LessonItem
          key={lesson.slug}
          lesson={lesson}
          isLast={index === securityLessons.length - 1}
        />
      ))}
    </ol>
  );
}
