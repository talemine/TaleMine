import { motion } from "framer-motion";
import Section from "../../../components/ui/Section";
import Container from "../../../components/ui/Container";

const statCard =
  "text-center rounded-2xl bg-slate-900/60 border border-cyan-500/20 p-4 md:p-6 transition-all hover:border-cyan-400 hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)]";

export default function About() {
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
            About TaleMine
          </h2>

          <p className="mt-6 md:mt-8 text-base md:text-lg leading-7 md:leading-8 text-gray-300">
            Stories have shaped civilizations for thousands of years.
            Yet today, incredible writers disappear beneath algorithms,
            while readers struggle to discover meaningful stories.
          </p>

          <p className="mt-4 md:mt-5 text-base md:text-lg leading-7 md:leading-8 text-gray-300">
            TaleMine exists to change that.
          </p>

          <p className="mt-4 md:mt-5 text-base md:text-lg leading-7 md:leading-8 text-gray-300">
            "We're building a platform where stories are discovered
            because they deserve to be."
          </p>

          <p className="mt-3 text-base md:text-lg leading-7 md:leading-8 text-cyan-300">
            — Not because an algorithm decided so.
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
              Stories
            </h3>

            <p className="mt-1 text-xs md:text-base text-cyan-400">
              ∞ Unlimited Stories
            </p>
          </div>

          {/* Writers */}
          <div className={statCard}>
            <div className="text-4xl md:text-6xl">✍️</div>

            <h3 className="mt-2 md:mt-4 text-sm md:text-xl font-bold text-white">
              Writers
            </h3>

            <p className="mt-1 text-xs md:text-base text-cyan-400">
              Growing Every Day
            </p>
          </div>

          {/* Readers */}
          <div className={statCard}>
            <div className="text-4xl md:text-6xl">🌍</div>

            <h3 className="mt-2 md:mt-4 text-sm md:text-xl font-bold text-white">
              Readers
            </h3>

            <p className="mt-1 text-xs md:text-base text-cyan-400">
              Built for Everyone
            </p>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}