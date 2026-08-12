import { motion } from "framer-motion";
import Section from "../../../components/ui/Section";
import Container from "../../../components/ui/Container";

const phases = [
  {
    phase: "Phase 01",
    title: "Foundation",
    description:
      "Build the core TaleMine platform, establish the visual identity, and create the foundation for readers and writers.",
    status: "In Progress",
    active: true,
  },
  {
    phase: "Phase 02",
    title: "Early Community",
    description:
      "Bring together our first readers and writers and learn what they need from a better storytelling platform.",
    status: "Coming Next",
    active: false,
  },
  {
    phase: "Phase 03",
    title: "Platform Launch",
    description:
      "Launch the core TaleMine experience and give readers and writers a place to discover, create, and connect.",
    status: "Future",
    active: false,
  },
  {
    phase: "Phase 04",
    title: "Growing the Community",
    description:
      "Expand the TaleMine community and continue improving discovery, writing, and reader experiences.",
    status: "Future",
    active: false,
  },
];

export default function Roadmap() {
  return (
    <Section id="roadmap">
      <Container>
        {/* Section Heading */}
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white">
            Roadmap
          </h2>

          <p className="mt-5 md:mt-6 text-base md:text-lg leading-7 md:leading-8 text-gray-300">
            We're building TaleMine one meaningful step at a time.
          </p>
        </motion.div>

        {/* Roadmap Timeline */}
        <div className="relative mt-10 md:mt-14 max-w-5xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-3 md:left-1/2 top-0 bottom-0 w-px bg-cyan-500/30 md:-translate-x-1/2" />

          {phases.map((phase, index) => {
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={phase.phase}
                className="relative mb-10 md:mb-14 last:mb-0"
                initial={{
                  opacity: 0,
                  x: isLeft ? -30 : 30,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                }}
              >
                {/* Timeline Dot */}
                <div
                  className="
                    absolute
                    left-3
                    md:left-1/2
                    top-8
                    w-3
                    h-3
                    rounded-full
                    bg-cyan-400
                    border-4
                    border-slate-950
                    -translate-x-1/2
                    z-10
                  "
                />

                {/* Phase Card */}
                <div
                  className={`
                    ml-10
                    md:ml-0
                    md:w-1/2
                    ${isLeft ? "md:pr-12" : "md:ml-auto md:pl-12"}
                  `}
                >
                  <div
                    className={`
                      rounded-2xl
                      bg-slate-900/60
                      border
                      p-6 md:p-8
                      transition-all
                      duration-300
                      hover:-translate-y-2
                      hover:border-cyan-400
                      hover:shadow-[0_0_25px_rgba(34,211,238,0.12)]
                      ${
                        phase.active
                          ? "border-cyan-400/50"
                          : "border-cyan-500/20"
                      }
                    `}
                  >
                    <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-cyan-400">
                      {phase.phase}
                    </p>

                    <h3 className="mt-2 md:mt-3 text-xl md:text-2xl font-bold text-white">
                      {phase.title}
                    </h3>

                    <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-300 leading-7">
                      {phase.description}
                    </p>

                    <span
                      className={`inline-block mt-4 text-sm ${
                        phase.active
                          ? "text-cyan-300 font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      {phase.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}