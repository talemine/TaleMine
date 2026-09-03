import { motion } from "framer-motion";
import Section from "../../../components/ui/Section";
import Container from "../../../components/ui/Container";
import { useLanguage } from "../../../i18n/LanguageContext";

export default function Vision() {
  const { t } = useLanguage();

  const principles = [
    {
      title: t.vision.principles.storiesOverAlgorithms,
      description:
        t.vision.principles.storiesOverAlgorithmsDescription,
    },
    {
      title: t.vision.principles.writersOverMetrics,
      description:
        t.vision.principles.writersOverMetricsDescription,
    },
    {
      title: t.vision.principles.readersOverNoise,
      description:
        t.vision.principles.readersOverNoiseDescription,
    },
  ];

  return (
    <Section id="vision">
      <Container>
        {/* Heading */}
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white">
            {t.vision.title}
          </h2>

          {/* Introduction */}
          <p className="mt-6 md:mt-8 text-xl md:text-2xl text-gray-200 leading-relaxed">
            {t.vision.introduction}
          </p>

          {/* Main Vision */}
          <p className="mt-5 md:mt-6 text-base md:text-lg text-gray-300 leading-7 md:leading-8">
            {t.vision.description}
          </p>
        </motion.div>

        {/* Vision Principles */}
        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
          {principles.map((principle, index) => (
            <motion.div
              key={principle.title}
              className="
                rounded-2xl
                bg-slate-900/60
                border border-cyan-500/20
                p-6 md:p-8
                text-center
                transition-all
                duration-300
                hover:border-cyan-400
                hover:-translate-y-2
                hover:shadow-[0_0_25px_rgba(34,211,238,0.12)]
              "
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
              }}
            >
              <h3 className="text-xl md:text-2xl font-bold text-white">
                {principle.title}
              </h3>

              <p className="mt-4 text-sm md:text-base text-gray-300 leading-7">
                {principle.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Closing Statement */}
        <motion.p
          className="mt-10 md:mt-14 text-lg md:text-xl text-cyan-300 font-semibold text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          {t.vision.closing}
        </motion.p>
      </Container>
    </Section>
  );
}