import Hero from "./components/Hero";
import About from "./components/About";
import ReaderFeatures from "./components/ReaderFeatures";
import WriterFeatures from "./components/WriterFeatures";
import Vision from "./components/Vision";
import Roadmap from "./components/Roadmap";
import Waitlist from "./components/Waitlist";

import PublicStoryList from "../../components/story/PublicStoryList";
import SEO from "../../components/seo/SEO";

export default function LandingPage() {
  return (
    <main>
      <SEO
        title="TaleMine — Discover Stories, Rhymes & Tales Worth Reading"
        description="TaleMine is a home for children's stories, rhymes, myths, folklore, and moral tales. Discover new stories daily and share your own with a growing community of readers."
      />

      <Hero />
      <About />
      <ReaderFeatures />

      <PublicStoryList />

      <WriterFeatures />
      <Vision />
      <Roadmap />
      <Waitlist />
    </main>
  );
}