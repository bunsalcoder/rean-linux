import { ExploreTopics } from "@/components/home/explore-topics";
import { Hero } from "@/components/home/hero";
import { LearningPath } from "@/components/home/learning-path";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LearningPath />
      <ExploreTopics />
    </>
  );
}
