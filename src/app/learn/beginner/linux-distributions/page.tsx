import type { Metadata } from "next";

import { LessonLayout } from "@/components/learn/lesson-layout";
import { LinuxDistributionsContent } from "@/content/beginner/linux-distributions-content";
import { linuxDistributionsLesson } from "@/content/beginner/linux-distributions";

export const metadata: Metadata = {
  title: linuxDistributionsLesson.title,
  description: linuxDistributionsLesson.description,
};

export default function LinuxDistributionsPage() {
  return (
    <LessonLayout lesson={linuxDistributionsLesson}>
      <LinuxDistributionsContent />
    </LessonLayout>
  );
}
