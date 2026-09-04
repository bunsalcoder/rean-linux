import type { Metadata } from "next";

import { LessonLayout } from "@/components/learn/lesson-layout";
import { TerminalContent } from "@/content/beginner/terminal-content";
import { terminalLesson } from "@/content/beginner/terminal";

export const metadata: Metadata = {
  title: {
    absolute: "The Linux Terminal | Rean Linux",
  },
  description:
    "Learn what the Linux terminal is, how it differs from the shell, why command lines matter, and how beginners can start using basic commands safely.",
};

export default function TerminalPage() {
  return (
    <LessonLayout lesson={terminalLesson}>
      <TerminalContent />
    </LessonLayout>
  );
}
