import Section from "../../../components/ui/Section";
import Container from "../../../components/ui/Container";
import FeatureCard from "../../../components/ui/FeatureCard";

import {
  HiOutlineBookOpen,
  HiOutlineHeart,
  HiOutlineClock,
} from "react-icons/hi2";

export default function ReaderFeatures() {
  return (
    <Section id="readers">
      <Container>
        {/* Section Heading */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white">
            Reader Features
          </h2>

          <p className="mt-5 md:mt-6 text-base md:text-lg leading-7 md:leading-8 text-gray-300">
            Discover stories that matter, organize your reading journey,
            and enjoy an experience designed for readers—not algorithms.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
          <FeatureCard
            icon={<HiOutlineBookOpen />}
            title="Discover Hidden Gems"
            description="Explore stories that deserve your attention, not just those promoted by algorithms."
          />

          <FeatureCard
            icon={<HiOutlineHeart />}
            title="Build Your Library"
            description="Save your favourite stories and create a personal collection you'll always return to."
          />

          <FeatureCard
            icon={<HiOutlineClock />}
            title="Continue Reading"
            description="Resume exactly where you left off across all your devices."
          />
        </div>
      </Container>
    </Section>
  );
}