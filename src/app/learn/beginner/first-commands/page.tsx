import type { Metadata } from "next";

import { LessonLayout } from "@/components/learn/lesson-layout";
import { FirstCommandsContent } from "@/content/beginner/first-commands-content";
import { firstCommandsLesson } from "@/content/beginner/first-commands";

export const metadata: Metadata = {
  title: {
    absolute: "Your First Linux Commands | Rean Linux",
  },
  description:
    "Learn essential beginner Linux commands: pwd, ls, cd, mkdir, touch, cat, cp, mv, and rm — with a safe simulated terminal for hands-on practice.",
};

export default function FirstCommandsPage() {
  return (
    <LessonLayout lesson={firstCommandsLesson}>
      <FirstCommandsContent />
    </LessonLayout>
  );
}
