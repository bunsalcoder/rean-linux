import type { Metadata } from "next";

import { LessonLayout } from "@/components/learn/lesson-layout";
import { FilesystemContent } from "@/content/beginner/filesystem-content";
import { filesystemLesson } from "@/content/beginner/filesystem";

export const metadata: Metadata = {
  title: {
    absolute: "Understanding the Linux Filesystem | Rean Linux",
  },
  description:
    "Learn the Linux filesystem hierarchy, absolute and relative paths, home directories, and how to navigate with pwd, ls, and cd.",
};

export default function FilesystemPage() {
  return (
    <LessonLayout lesson={filesystemLesson}>
      <FilesystemContent />
    </LessonLayout>
  );
}
