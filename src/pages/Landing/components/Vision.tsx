import Section from "../../../components/ui/Section";
import Container from "../../../components/ui/Container";

export default function Vision() {
  return (
    <Section id="vision">
      <Container>
        <div className="max-w-4xl mx-auto text-center">
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Our Vision
          </h2>

          {/* Introduction */}
          <p className="mt-8 text-xl md:text-2xl text-gray-200 leading-relaxed">
            We believe the best stories should have a chance to be discovered.
          </p>

          {/* Main Vision */}
          <p className="mt-6 text-lg text-gray-300 leading-8">
            TaleMine is building a place where readers can explore beyond the
            obvious, writers can build meaningful audiences, and great stories
            can find the people who are waiting for them.
          </p>

          {/* Vision Principles */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl bg-slate-900/60 border border-cyan-500/20 p-8 transition-all hover:border-cyan-400 hover:-translate-y-2">
              <h3 className="text-xl font-bold text-white">
                Stories Over Algorithms
              </h3>

              <p className="mt-4 text-gray-300 leading-7">
                Discovery should be driven by the quality and relevance of a
                story—not simply by what an algorithm chooses to promote.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900/60 border border-cyan-500/20 p-8 transition-all hover:border-cyan-400 hover:-translate-y-2">
              <h3 className="text-xl font-bold text-white">
                Writers Over Metrics
              </h3>

              <p className="mt-4 text-gray-300 leading-7">
                Writers deserve the opportunity to build genuine relationships
                with readers and grow their audience over time.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900/60 border border-cyan-500/20 p-8 transition-all hover:border-cyan-400 hover:-translate-y-2">
              <h3 className="text-xl font-bold text-white">
                Readers Over Noise
              </h3>

              <p className="mt-4 text-gray-300 leading-7">
                Readers should spend less time fighting through noise and more
                time discovering stories worth remembering.
              </p>
            </div>
          </div>

          {/* Closing Statement */}
          <p className="mt-16 text-lg md:text-xl text-cyan-300 font-semibold">
            Dig deeper. Discover better stories. Build a community that lasts.
          </p>
        </div>
      </Container>
    </Section>
  );
}