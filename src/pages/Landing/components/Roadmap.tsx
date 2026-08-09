import Section from "../../../components/ui/Section";
import Container from "../../../components/ui/Container";

export default function Roadmap() {
  return (
    <Section id="roadmap">
      <Container>
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Roadmap
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-300">
            We're building TaleMine one meaningful step at a time.
          </p>
        </div>

        {/* Roadmap Timeline */}
        <div className="relative mt-16 max-w-4xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-cyan-500/30 md:-translate-x-1/2" />

          {/* Phase 1 */}
          <div className="relative flex items-start mb-16">
            <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-cyan-400 border-4 border-slate-950 -translate-x-1/2" />

            <div className="ml-12 md:w-1/2 md:pr-12">
              <div className="rounded-2xl bg-slate-900/60 border border-cyan-500/20 p-8 transition-all hover:border-cyan-400 hover:-translate-y-1">
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
                  Phase 01
                </p>

                <h3 className="mt-3 text-2xl font-bold text-white">
                  Foundation
                </h3>

                <p className="mt-4 text-gray-300 leading-7">
                  Build the core TaleMine platform, establish the visual
                  identity, and create the foundation for readers and writers.
                </p>

                <span className="inline-block mt-5 text-sm text-cyan-300">
                  In Progress
                </span>
              </div>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="relative flex items-start mb-16">
            <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-cyan-400 border-4 border-slate-950 -translate-x-1/2" />

            <div className="ml-12 md:ml-auto md:w-1/2 md:pl-12">
              <div className="rounded-2xl bg-slate-900/60 border border-cyan-500/20 p-8 transition-all hover:border-cyan-400 hover:-translate-y-1">
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
                  Phase 02
                </p>

                <h3 className="mt-3 text-2xl font-bold text-white">
                  Early Community
                </h3>

                <p className="mt-4 text-gray-300 leading-7">
                  Bring together our first readers and writers and learn what
                  they need from a better storytelling platform.
                </p>

                <span className="inline-block mt-5 text-sm text-gray-400">
                  Coming Next
                </span>
              </div>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="relative flex items-start mb-16">
            <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-cyan-400 border-4 border-slate-950 -translate-x-1/2" />

            <div className="ml-12 md:w-1/2 md:pr-12">
              <div className="rounded-2xl bg-slate-900/60 border border-cyan-500/20 p-8 transition-all hover:border-cyan-400 hover:-translate-y-1">
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
                  Phase 03
                </p>

                <h3 className="mt-3 text-2xl font-bold text-white">
                  Platform Launch
                </h3>

                <p className="mt-4 text-gray-300 leading-7">
                  Launch the core TaleMine experience and give readers and
                  writers a place to discover, create, and connect.
                </p>

                <span className="inline-block mt-5 text-sm text-gray-400">
                  Future
                </span>
              </div>
            </div>
          </div>

          {/* Phase 4 */}
          <div className="relative flex items-start">
            <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-cyan-400 border-4 border-slate-950 -translate-x-1/2" />

            <div className="ml-12 md:ml-auto md:w-1/2 md:pl-12">
              <div className="rounded-2xl bg-slate-900/60 border border-cyan-500/20 p-8 transition-all hover:border-cyan-400 hover:-translate-y-1">
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
                  Phase 04
                </p>

                <h3 className="mt-3 text-2xl font-bold text-white">
                  Growing the Community
                </h3>

                <p className="mt-4 text-gray-300 leading-7">
                  Expand the TaleMine community and continue improving
                  discovery, writing, and reader experiences.
                </p>

                <span className="inline-block mt-5 text-sm text-gray-400">
                  Future
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}