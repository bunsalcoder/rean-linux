import type { Metadata } from "next";

import { LessonLayout } from "@/components/learn/lesson-layout";
import { WhatIsLinuxContent } from "@/content/beginner/what-is-linux-content";
import { whatIsLinuxLesson } from "@/content/beginner/what-is-linux";

export const metadata: Metadata = {
  title: {
    absolute: "What is Linux? | Rean Linux",
  },
  description: whatIsLinuxLesson.description,
};

export default function WhatIsLinuxPage() {
  return (
    <LessonLayout lesson={whatIsLinuxLesson}>
      <WhatIsLinuxContent />
    </LessonLayout>
  );
}
