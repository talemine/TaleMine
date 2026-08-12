import { motion } from "framer-motion";
import Section from "../../../components/ui/Section";
import Container from "../../../components/ui/Container";

const principles = [
  {
    title: "Stories Over Algorithms",
    description:
      "Discovery should be driven by the quality and relevance of a story—not simply by what an algorithm chooses to promote.",
  },
  {
    title: "Writers Over Metrics",
    description:
      "Writers deserve the opportunity to build genuine relationships with readers and grow their audience over time.",
  },
  {
    title: "Readers Over Noise",
    description:
      "Readers should spend less time fighting through noise and more time discovering stories worth remembering.",
  },
];

export default function Vision() {
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
            Our Vision
          </h2>

          {/* Introduction */}
          <p className="mt-6 md:mt-8 text-xl md:text-2xl text-gray-200 leading-relaxed">
            We believe the best stories should have a chance to be discovered.
          </p>

          {/* Main Vision */}
          <p className="mt-5 md:mt-6 text-base md:text-lg text-gray-300 leading-7 md:leading-8">
            TaleMine is building a place where readers can explore beyond the
            obvious, writers can build meaningful audiences, and great stories
            can find the people who are waiting for them.
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
          Dig deeper. Discover better stories. Build a community that lasts.
        </motion.p>
      </Container>
    </Section>
  );
}