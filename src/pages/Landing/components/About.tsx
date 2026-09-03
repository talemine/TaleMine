import { motion } from "framer-motion";
import Section from "../../../components/ui/Section";
import Container from "../../../components/ui/Container";
import { useLanguage } from "../../../i18n/LanguageContext";

const statCard =
  "text-center rounded-2xl bg-slate-900/60 border border-cyan-500/20 p-4 md:p-6 transition-all hover:border-cyan-400 hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)]";

export default function About() {
  const { t } = useLanguage();

  return (
    <Section id="about">
      <Container>
        {/* About Content */}
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white">
            {t.about.title}
          </h2>

          <p className="mt-6 md:mt-8 text-base md:text-lg leading-7 md:leading-8 text-gray-300">
            {t.about.paragraph1}
          </p>

          <p className="mt-4 md:mt-5 text-base md:text-lg leading-7 md:leading-8 text-gray-300">
            {t.about.paragraph2}
          </p>

          <p className="mt-4 md:mt-5 text-base md:text-lg leading-7 md:leading-8 text-gray-300">
            {t.about.quote}
          </p>

          <p className="mt-3 text-base md:text-lg leading-7 md:leading-8 text-cyan-300">
            {t.about.quoteAttribution}
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          className="mt-10 md:mt-14 grid grid-cols-3 gap-3 md:gap-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Stories */}
          <div className={statCard}>
            <div className="text-4xl md:text-6xl">📖</div>

            <h3 className="mt-2 md:mt-4 text-sm md:text-xl font-bold text-white">
              {t.about.stories}
            </h3>

            <p className="mt-1 text-xs md:text-base text-cyan-400">
              {t.about.unlimitedStories}
            </p>
          </div>

          {/* Writers */}
          <div className={statCard}>
            <div className="text-4xl md:text-6xl">✍️</div>

            <h3 className="mt-2 md:mt-4 text-sm md:text-xl font-bold text-white">
              {t.about.writers}
            </h3>

            <p className="mt-1 text-xs md:text-base text-cyan-400">
              {t.about.growingEveryDay}
            </p>
          </div>

          {/* Readers */}
          <div className={statCard}>
            <div className="text-4xl md:text-6xl">🌍</div>

            <h3 className="mt-2 md:mt-4 text-sm md:text-xl font-bold text-white">
              {t.about.readers}
            </h3>

            <p className="mt-1 text-xs md:text-base text-cyan-400">
              {t.about.builtForEveryone}
            </p>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}