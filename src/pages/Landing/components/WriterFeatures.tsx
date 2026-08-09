import Section from "../../../components/ui/Section";
import Container from "../../../components/ui/Container";
import FeatureCard from "../../../components/ui/FeatureCard";

import {
  HiOutlinePencilSquare,
  HiOutlineUsers,
  HiOutlineChartBar,
} from "react-icons/hi2";

export default function WriterFeatures() {
  return (
    <Section id="writers">
      <Container>
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Writer Features
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-300">
            Build your audience, share your stories, and grow as a writer
            without having to fight the algorithm.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<HiOutlinePencilSquare />}
            title="Publish Your Stories"
            description="Share your work with readers who are genuinely looking for meaningful stories."
          />

          <FeatureCard
            icon={<HiOutlineUsers />}
            title="Build Your Audience"
            description="Connect with readers and grow a community around your writing."
          />

          <FeatureCard
            icon={<HiOutlineChartBar />}
            title="Understand Your Readers"
            description="Learn what resonates with your audience and make better decisions about your work."
          />
        </div>
      </Container>
    </Section>
  );
}