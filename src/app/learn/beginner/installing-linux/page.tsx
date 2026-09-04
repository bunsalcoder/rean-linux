import type { Metadata } from "next";

import { LessonLayout } from "@/components/learn/lesson-layout";
import { InstallingLinuxContent } from "@/content/beginner/installing-linux-content";
import { installingLinuxLesson } from "@/content/beginner/installing-linux";

export const metadata: Metadata = {
  title: {
    absolute: "Installing Linux | Rean Linux",
  },
  description:
    "Learn the different ways beginners can install or run Linux — virtual machines, dual boot, physical installs, servers, and cloud — and how to prepare safely.",
};

export default function InstallingLinuxPage() {
  return (
    <LessonLayout lesson={installingLinuxLesson}>
      <InstallingLinuxContent />
    </LessonLayout>
  );
}
