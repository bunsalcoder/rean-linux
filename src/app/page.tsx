import { CommandSpotlight } from "@/components/home/command-spotlight";
import { ExploreTopics } from "@/components/home/explore-topics";
import { FeaturedGuides } from "@/components/home/featured-guides";
import { Hero } from "@/components/home/hero";
import { LearningPath } from "@/components/home/learning-path";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LearningPath />
      <ExploreTopics />
      <FeaturedGuides />
      <CommandSpotlight />
    </>
  );
}
