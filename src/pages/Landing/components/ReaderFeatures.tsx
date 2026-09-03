import Section from "../../../components/ui/Section";
import Container from "../../../components/ui/Container";
import FeatureCard from "../../../components/ui/FeatureCard";
import { useLanguage } from "../../../i18n/LanguageContext";

import {
  HiOutlineBookOpen,
  HiOutlineHeart,
  HiOutlineClock,
} from "react-icons/hi2";

export default function ReaderFeatures() {
  const { t } = useLanguage();

  return (
    <Section id="readers">
      <Container>
        {/* Section Heading */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white">
            {t.readerFeatures.title}
          </h2>

          <p className="mt-5 md:mt-6 text-base md:text-lg leading-7 md:leading-8 text-gray-300">
            {t.readerFeatures.description}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
          <FeatureCard
            icon={<HiOutlineBookOpen />}
            title={t.readerFeatures.discoverHiddenGems}
            description={
              t.readerFeatures.discoverHiddenGemsDescription
            }
          />

          <FeatureCard
            icon={<HiOutlineHeart />}
            title={t.readerFeatures.buildYourLibrary}
            description={
              t.readerFeatures.buildYourLibraryDescription
            }
          />

          <FeatureCard
            icon={<HiOutlineClock />}
            title={t.readerFeatures.continueReading}
            description={
              t.readerFeatures.continueReadingDescription
            }
          />
        </div>
      </Container>
    </Section>
  );
}