import Section from "../../../components/ui/Section";
import Container from "../../../components/ui/Container";
const statCard = "text-center rounded-2xl bg-slate-900/60 border border-cyan-500/20 p-8 transition-all hover:border-cyan-400 hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)]";
export default function About() {
  return (
    <Section id="about">
      <Container>
        <div className="w-48 h-1 bg-cyan-500 rounded-full mx-auto mt-4 mb-16" />
        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-4xl md:text-6xl font-bold text-white">
            About TaleMine
          </h2>

          <p className="mt-8 text-lg leading-8 text-gray-300">
            Stories have shaped civilizations for thousands of years.
            Yet today, incredible writers disappear beneath algorithms,
            while readers struggle to discover meaningful stories.
          </p>

          <p className="mt-6 text-lg leading-8 text-gray-300">
            TaleMine exists to change that.
          </p>

          <p className="mt-6 text-lg leading-8 text-gray-300">
            "We're building a platform where stories are discovered
            because they deserve to be."
          </p>
          
          <p className="mt-6 text-lg leading-8 text-gray-300">
            - Not because an algorithm decided so.
          </p>

        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className={statCard}>
            <div className="text-7xl">📖</div>
            
            <h3 className="mt-4 text-xl font-bold text-white">
              Stories
            </h3>

            <p className="text-cyan-400">
              ∞
              Unlimited Stories
            </p>
          </div>

          <div className={statCard}>
            <div className="text-7xl">✍️</div>

            <h3 className="mt-4 text-xl font-bold text-white">
              Writers
            </h3>

            <p className="text-cyan-400">
              Growing Every Day
            </p>
          </div>

          <div className={statCard}>
            <div className="text-7xl">🌍</div>

            <h3 className="mt-4 text-xl font-bold text-white">
              Readers
            </h3>

            <p className="text-cyan-400">
              Built for Everyone
            </p>
          </div>

        </div>

      </Container>
    </Section>
  );
}